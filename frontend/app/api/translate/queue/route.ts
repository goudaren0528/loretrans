import { NextRequest, NextResponse } from 'next/server'

// 翻译队列配置
const QUEUE_CONFIG = {
  MAX_CHUNK_SIZE: 300,        // 统一使用300字符分块
  BATCH_SIZE: 5,              // 每批处理5个块
  MAX_RETRIES: 3,             // 每个块最多重试3次
  RETRY_DELAY: 1000,          // 重试延迟1秒
  CHUNK_DELAY: 500,           // 块间延迟500ms
  BATCH_DELAY: 1000,          // 批次间延迟1秒
  REQUEST_TIMEOUT: 25000,     // 请求超时25秒
  CONCURRENT_CHUNKS: 1        // 顺序处理，避免限流
};

// 内存队列存储 (生产环境建议使用Redis)
const translationQueue = new Map();

// 任务持久化到文件系统 (简单的备份机制)
const fs = require('fs');
const path = require('path');
const QUEUE_BACKUP_FILE = path.join(process.cwd(), 'temp', 'translation-queue-backup.json');

// 保存队列状态到文件
function saveQueueToFile() {
  try {
    const queueData = Array.from(translationQueue.entries());
    const backupData = {
      timestamp: new Date().toISOString(),
      jobs: queueData
    };
    
    // 确保temp目录存在
    const tempDir = path.dirname(QUEUE_BACKUP_FILE);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(QUEUE_BACKUP_FILE, JSON.stringify(backupData, null, 2));
    console.log(`[Queue] 队列状态已保存，包含 ${queueData.length} 个任务`);
  } catch (error) {
    console.error('[Queue] 保存队列状态失败:', error);
  }
}

// 从文件恢复队列状态
function loadQueueFromFile() {
  try {
    if (fs.existsSync(QUEUE_BACKUP_FILE)) {
      const backupData = JSON.parse(fs.readFileSync(QUEUE_BACKUP_FILE, 'utf8'));
      const now = new Date();
      const backupTime = new Date(backupData.timestamp);
      const timeDiff = now.getTime() - backupTime.getTime();
      
      // 只恢复30分钟内的任务，避免恢复过期任务
      if (timeDiff < 30 * 60 * 1000) {
        let restoredCount = 0;
        backupData.jobs.forEach(([jobId, job]) => {
          // 检查任务是否已经存在（避免覆盖正在处理的任务）
          if (!translationQueue.has(jobId)) {
            // 只恢复未完成的任务，且不是很久之前的任务
            const jobAge = now.getTime() - new Date(job.createdAt).getTime();
            if ((job.status === 'pending' || job.status === 'processing') && jobAge < 30 * 60 * 1000) {
              // 重置processing状态为pending，因为处理过程已中断
              if (job.status === 'processing') {
                job.status = 'pending';
                job.progress = 0;
                console.log(`[Queue] 重置中断的任务状态: ${jobId} processing -> pending`);
              }
              translationQueue.set(jobId, job);
              restoredCount++;
              console.log(`[Queue] 恢复任务: ${jobId}, 状态: ${job.status}`);
            }
          } else {
            console.log(`[Queue] 跳过已存在的任务: ${jobId}`);
          }
        });
        console.log(`[Queue] 从备份恢复了 ${restoredCount} 个任务`);
        
        // 如果有恢复的任务，启动处理器
        if (restoredCount > 0) {
          console.log('[Queue] 启动处理器处理恢复的任务');
          setTimeout(() => {
            processNextPendingJob();
          }, 1000);
        }
      } else {
        console.log('[Queue] 备份文件过期，不进行恢复');
        // 删除过期的备份文件
        fs.unlinkSync(QUEUE_BACKUP_FILE);
      }
    }
  } catch (error) {
    console.error('[Queue] 恢复队列状态失败:', error);
  }
}

// 启动时恢复队列
loadQueueFromFile();

interface QueueJob {
  id: string;
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  chunks: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 创建翻译任务
export async function POST(request: NextRequest) {
  try {
    const { text, sourceLanguage, targetLanguage } = await request.json();
    
    if (!text || !sourceLanguage || !targetLanguage) {
      return NextResponse.json({
        error: '缺少必要参数',
        code: 'MISSING_PARAMETERS'
      }, { status: 400 });
    }

    // 生成任务ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 智能分块
    const chunks = smartTextChunking(text, QUEUE_CONFIG.MAX_CHUNK_SIZE);
    
    // 创建队列任务
    const job: QueueJob = {
      id: jobId,
      text,
      sourceLanguage,
      targetLanguage,
      chunks,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    translationQueue.set(jobId, job);
    
    // 保存队列状态到文件
    saveQueueToFile();
    
    // 异步开始处理 - 添加延迟确保任务状态正确初始化
    setTimeout(() => {
      console.log(`[Queue] 准备开始处理任务: ${jobId}`);
      processTranslationJob(jobId).catch(error => {
        console.error(`[Queue] Job ${jobId} failed:`, error);
        console.error(`[Queue] Error stack:`, error.stack);
        const job = translationQueue.get(jobId);
        if (job) {
          job.status = 'failed';
          job.error = error.message;
          job.updatedAt = new Date();
          translationQueue.set(jobId, job);
          console.log(`[Queue] 任务 ${jobId} 标记为失败`);
        } else {
          console.error(`[Queue] 无法找到失败的任务: ${jobId}`);
        }
      });
    }, 100); // 100ms延迟确保任务状态正确
    
    return NextResponse.json({
      success: true,
      jobId,
      totalChunks: chunks.length,
      estimatedTime: Math.ceil(chunks.length / QUEUE_CONFIG.BATCH_SIZE) * 2, // 估算秒数
      message: '翻译任务已创建，正在后台处理'
    });
    
  } catch (error) {
    console.error('[Queue] Create job error:', error);
    return NextResponse.json({
      error: '创建翻译任务失败',
      code: 'QUEUE_ERROR'
    }, { status: 500 });
  }
}

// 查询任务状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json({
        error: '缺少任务ID',
        code: 'MISSING_JOB_ID'
      }, { status: 400 });
    }
    
    const job = translationQueue.get(jobId);
    
    if (!job) {
      console.log(`[Queue] 任务不存在: ${jobId}, 当前队列中有 ${translationQueue.size} 个任务`);
      
      return NextResponse.json({
        success: false,
        error: '任务不存在或已过期',
        code: 'JOB_NOT_FOUND',
        suggestion: '任务可能已完成并被清理，或者服务已重启。请重新提交翻译请求。'
      }, { status: 404 });
    }
    
    // 添加调试日志
    console.log(`[Queue] 查询任务状态: ${jobId}`, {
      status: job.status,
      progress: job.progress,
      hasResult: !!job.result,
      resultLength: job.result?.length || 0
    });
    
    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        progress: job.progress,
        result: job.result,
        error: job.error,
        totalChunks: job.chunks.length,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      }
    });
    
  } catch (error) {
    console.error('[Queue] Get job status error:', error);
    return NextResponse.json({
      error: '查询任务状态失败',
      code: 'QUERY_ERROR'
    }, { status: 500 });
  }
}

// 处理翻译任务
async function processTranslationJob(jobId: string) {
  console.log(`[Queue] processTranslationJob 开始执行: ${jobId}`);
  
  const job = translationQueue.get(jobId);
  if (!job) {
    console.log(`[Queue] Job ${jobId} not found in queue`);
    return;
  }
  
  console.log(`[Queue] 找到任务，当前状态: ${job.status}`);
  
  console.log(`[Queue] 开始处理任务 ${jobId}:`, {
    textLength: job.text.length,
    chunksCount: job.chunks.length,
    sourceLanguage: job.sourceLanguage,
    targetLanguage: job.targetLanguage
  });
  
  try {
    console.log(`[Queue] 设置任务状态为processing: ${jobId}`);
    job.status = 'processing';
    job.progress = 5; // 设置初始进度5%，表示开始处理
    job.updatedAt = new Date();
    translationQueue.set(jobId, job); // 立即保存状态更新
    saveQueueToFile(); // 保存到备份文件
    console.log(`[Queue] 任务状态已更新并保存: ${jobId}`);
    
    const translatedChunks: string[] = [];
    const totalChunks = job.chunks.length;
    
    // 分批处理块
    for (let i = 0; i < totalChunks; i += QUEUE_CONFIG.BATCH_SIZE) {
      const batch = job.chunks.slice(i, i + QUEUE_CONFIG.BATCH_SIZE);
      console.log(`[Queue] 处理批次 ${Math.floor(i/QUEUE_CONFIG.BATCH_SIZE) + 1}/${Math.ceil(totalChunks/QUEUE_CONFIG.BATCH_SIZE)}, 块数: ${batch.length}`);
      
      // 在批次开始时更新进度
      const startProgress = Math.round((i / totalChunks) * 90) + 10; // 10-100%范围
      job.progress = startProgress;
      job.updatedAt = new Date();
      translationQueue.set(jobId, job);
      console.log(`[Queue] 批次开始进度: ${job.progress}%`);
      
      // 并行处理当前批次
      const batchPromises = batch.map((chunk, index) => {
        console.log(`[Queue] 翻译块 ${i + index + 1}/${totalChunks}: ${chunk.substring(0, 50)}...`);
        return translateChunkWithRetry(chunk, job.sourceLanguage, job.targetLanguage);
      });
      
      const batchResults = await Promise.all(batchPromises);
      console.log(`[Queue] 批次结果:`, batchResults.map(r => ({ success: r.success, length: r.translatedText?.length || 0 })));
      
      // 检查批次结果
      for (const result of batchResults) {
        if (!result.success) {
          throw new Error(result.error || '翻译失败');
        }
        translatedChunks.push(result.translatedText!);
      }
      
      // 更新进度并保存到队列
      job.progress = Math.round(((i + batch.length) / totalChunks) * 100);
      job.updatedAt = new Date();
      translationQueue.set(jobId, job); // 重要：保存更新后的任务状态
      
      console.log(`[Queue] 进度更新: ${job.progress}% (${i + batch.length}/${totalChunks})`);
      
      // 批次间延迟
      if (i + QUEUE_CONFIG.BATCH_SIZE < totalChunks) {
        await new Promise(resolve => setTimeout(resolve, QUEUE_CONFIG.BATCH_DELAY));
      }
    }
    
    // 合并结果
    job.result = translatedChunks.join(' ');
    job.status = 'completed';
    job.progress = 100;
    job.updatedAt = new Date();
    
    // 重要：保存完成状态到队列
    translationQueue.set(jobId, job);
    saveQueueToFile(); // 保存到备份文件
    
    console.log(`[Queue] Job ${jobId} completed successfully`, {
      totalChunks: translatedChunks.length,
      resultLength: job.result.length,
      resultPreview: job.result.substring(0, 100) + '...'
    });
    
  } catch (error) {
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : '翻译失败';
    job.updatedAt = new Date();
    
    // 重要：保存失败状态到队列
    translationQueue.set(jobId, job);
    saveQueueToFile(); // 保存到备份文件
    
    console.error(`[Queue] Job ${jobId} failed:`, error);
  }
}

// 带重试的块翻译
async function translateChunkWithRetry(
  text: string, 
  sourceLanguage: string, 
  targetLanguage: string, 
  retryCount: number = 0
): Promise<{success: boolean, translatedText?: string, error?: string}> {
  
  try {
    const nllbServiceUrl = 'https://wane0528-my-nllb-api.hf.space/api/v4/translator';
    
    // 映射语言代码
    const nllbSourceLang = mapToNLLBLanguageCode(sourceLanguage);
    const nllbTargetLang = mapToNLLBLanguageCode(targetLanguage);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), QUEUE_CONFIG.REQUEST_TIMEOUT);
    
    const response = await fetch(nllbServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text,
        source: nllbSourceLang,
        target: nllbTargetLang,
        max_length: 1000
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`翻译服务错误: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    return {
      success: true,
      translatedText: result.result || result.translated_text || result.translation || text
    };

  } catch (error: any) {
    if (retryCount < QUEUE_CONFIG.MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return translateChunkWithRetry(text, sourceLanguage, targetLanguage, retryCount + 1);
    }
    
    return {
      success: false,
      error: error.message || '翻译失败'
    };
  }
}

// 智能分块函数
/**
 * 统一的智能文本分块函数
 * 优先级: 段落边界 > 句子边界 > 逗号边界 > 词汇边界
 */
function smartTextChunking(text, maxChunkSize = 300) {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  console.log(`📝 智能分块: ${text.length}字符 -> ${maxChunkSize}字符/块`);
  
  const chunks = [];
  
  // 策略1: 按段落分割（双换行）
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const paragraph of paragraphs) {
    if (paragraph.trim().length === 0) continue;
    
    if (paragraph.length <= maxChunkSize) {
      chunks.push(paragraph.trim());
    } else {
      // 策略2: 按句子分割
      const sentences = paragraph.split(/[.!?。！？]\s+/);
      let currentChunk = '';
      
      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i].trim();
        if (!sentence) continue;
        
        const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + sentence;
        
        if (potentialChunk.length <= maxChunkSize) {
          currentChunk = potentialChunk;
        } else {
          // 保存当前块
          if (currentChunk) {
            chunks.push(currentChunk + (currentChunk.endsWith('.') ? '' : '.'));
          }
          
          // 处理超长句子
          if (sentence.length > maxChunkSize) {
            const subChunks = forceChunkBySentence(sentence, maxChunkSize);
            chunks.push(...subChunks);
            currentChunk = '';
          } else {
            currentChunk = sentence;
          }
        }
      }
      
      // 添加最后一个块
      if (currentChunk) {
        chunks.push(currentChunk + (currentChunk.endsWith('.') ? '' : '.'));
      }
    }
  }
  
  const finalChunks = chunks.filter(chunk => chunk.trim().length > 0);
  console.log(`✅ 分块完成: ${finalChunks.length}个块`);
  
  return finalChunks;
}

/**
 * 强制分块处理超长句子
 */
function forceChunkBySentence(sentence, maxSize) {
  const chunks = [];
  
  // 策略3: 按逗号分割
  const parts = sentence.split(/,\s+/);
  let currentChunk = '';
  
  for (const part of parts) {
    const potentialChunk = currentChunk + (currentChunk ? ', ' : '') + part;
    
    if (potentialChunk.length <= maxSize) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      // 策略4: 按空格分割（词汇边界）
      if (part.length > maxSize) {
        const words = part.split(' ');
        let wordChunk = '';
        
        for (const word of words) {
          const potentialWordChunk = wordChunk + (wordChunk ? ' ' : '') + word;
          
          if (potentialWordChunk.length <= maxSize) {
            wordChunk = potentialWordChunk;
          } else {
            if (wordChunk) {
              chunks.push(wordChunk);
            }
            wordChunk = word.length > maxSize ? word.substring(0, maxSize) : word;
          }
        }
        
        if (wordChunk) {
          chunks.push(wordChunk);
        }
        currentChunk = '';
      } else {
        currentChunk = part;
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

// 语言代码映射
function mapToNLLBLanguageCode(language: string): string {
  const languageMap: Record<string, string> = {
    'am': 'amh_Ethi', 'ar': 'arb_Arab', 'en': 'eng_Latn', 'es': 'spa_Latn',
    'fr': 'fra_Latn', 'ha': 'hau_Latn', 'hi': 'hin_Deva', 'ht': 'hat_Latn',
    'ig': 'ibo_Latn', 'km': 'khm_Khmr', 'ky': 'kir_Cyrl', 'lo': 'lao_Laoo',
    'mg': 'plt_Latn', 'mn': 'khk_Cyrl', 'my': 'mya_Mymr', 'ne': 'npi_Deva',
    'ps': 'pbt_Arab', 'pt': 'por_Latn', 'sd': 'snd_Arab', 'si': 'sin_Sinh',
    'sw': 'swh_Latn', 'te': 'tel_Telu', 'tg': 'tgk_Cyrl', 'xh': 'xho_Latn',
    'yo': 'yor_Latn', 'zh': 'zho_Hans', 'zu': 'zul_Latn'
  };
  
  return languageMap[language] || language;
}

// 处理下一个pending任务
async function processNextPendingJob() {
  try {
    // 查找第一个pending状态的任务
    let pendingJob = null;
    let pendingJobId = null;
    
    for (const [jobId, job] of translationQueue.entries()) {
      if (job.status === 'pending') {
        pendingJob = job;
        pendingJobId = jobId;
        break;
      }
    }
    
    if (!pendingJob) {
      console.log('[Queue] 没有pending任务需要处理');
      return;
    }
    
    console.log(`[Queue] 准备开始处理任务: ${pendingJobId}`);
    console.log(`[Queue] processTranslationJob 开始执行: ${pendingJobId}`);
    
    // 设置任务状态为processing
    pendingJob.status = 'processing';
    pendingJob.updatedAt = new Date();
    translationQueue.set(pendingJobId, pendingJob);
    
    console.log(`[Queue] 设置任务状态为processing: ${pendingJobId}`);
    console.log(`[Queue] 任务状态已更新并保存: ${pendingJobId}`);
    
    // 开始处理任务
    console.log(`[Queue] 开始处理任务 ${pendingJobId}: {`);
    console.log(`  文本长度: ${pendingJob.text.length}`);
    console.log(`  分块数量: ${pendingJob.chunks.length}`);
    console.log(`  源语言: ${pendingJob.sourceLanguage}`);
    console.log(`  目标语言: ${pendingJob.targetLanguage}`);
    console.log(`}`);
    
    // 处理所有分块
    const results = [];
    let completedChunks = 0;
    
    for (let i = 0; i < pendingJob.chunks.length; i++) {
      const chunk = pendingJob.chunks[i];
      
      try {
        console.log(`[Queue] 处理分块 ${i + 1}/${pendingJob.chunks.length}: ${chunk.substring(0, 50)}...`);
        
        const result = await translateChunkWithRetry(
          chunk,
          pendingJob.sourceLanguage,
          pendingJob.targetLanguage
        );
        
        if (result.success) {
          results.push(result.translatedText);
          completedChunks++;
          
          // 更新进度
          const progress = Math.round((completedChunks / pendingJob.chunks.length) * 100);
          pendingJob.progress = progress;
          pendingJob.updatedAt = new Date();
          translationQueue.set(pendingJobId, pendingJob);
          
          console.log(`[Queue] 分块 ${i + 1} 翻译成功，进度: ${progress}%`);
        } else {
          throw new Error(result.error || '翻译失败');
        }
        
        // 分块间延迟
        if (i < pendingJob.chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, QUEUE_CONFIG.CHUNK_DELAY));
        }
        
      } catch (error) {
        console.error(`[Queue] 分块 ${i + 1} 翻译失败:`, error);
        
        // 任务失败
        pendingJob.status = 'failed';
        pendingJob.error = error.message;
        pendingJob.updatedAt = new Date();
        translationQueue.set(pendingJobId, pendingJob);
        
        // 保存状态并继续处理下一个任务
        saveQueueToFile();
        setTimeout(() => processNextPendingJob(), 1000);
        return;
      }
    }
    
    // 任务完成
    const finalResult = results.join(' ');
    pendingJob.status = 'completed';
    pendingJob.progress = 100;
    pendingJob.result = finalResult;
    pendingJob.updatedAt = new Date();
    translationQueue.set(pendingJobId, pendingJob);
    
    console.log(`[Queue] 任务 ${pendingJobId} 完成，结果长度: ${finalResult.length}`);
    
    // 保存状态
    saveQueueToFile();
    
    // 继续处理下一个任务
    setTimeout(() => processNextPendingJob(), 1000);
    
  } catch (error) {
    console.error('[Queue] 处理任务时发生错误:', error);
    // 1秒后重试
    setTimeout(() => processNextPendingJob(), 1000);
  }
}
