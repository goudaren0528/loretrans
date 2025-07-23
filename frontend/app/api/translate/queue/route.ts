import { NextRequest, NextResponse } from 'next/server'
import { TRANSLATION_CHUNK_CONFIG, getOptimalChunkSize, estimateChunkCount, estimateProcessingTime } from '@/lib/config/translation'
import { createServerCreditService } from '@/lib/services/credits'

// 翻译队列配置
// 使用全局翻译配置
const CONFIG = TRANSLATION_CHUNK_CONFIG;

// 动态导入 Supabase 客户端
const createSupabaseAdminClient = () => {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// 获取用户信息（可选）
async function getOptionalUser(request: NextRequest) {
  try {
    console.log('[Queue Auth Debug] 开始用户认证检查');
    
    const authHeader = request.headers.get('authorization');
    console.log('[Queue Auth Debug] Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Queue Auth Debug] 无效的认证头格式');
      return null;
    }

    const token = authHeader.substring(7);
    console.log('[Queue Auth Debug] Token length:', token.length);
    console.log('[Queue Auth Debug] Token preview:', token.substring(0, 20) + '...');
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log('[Queue Auth Debug] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[Queue Auth Debug] Supabase Key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.log('[Queue Auth Debug] Supabase auth error:', error.message);
      return null;
    }
    
    if (user) {
      console.log('[Queue Auth Debug] 用户认证成功:', user.id, user.email);
      return user;
    } else {
      console.log('[Queue Auth Debug] 用户认证失败: 无用户数据');
      return null;
    }
  } catch (error) {
    console.log('[Queue Auth Debug] 认证异常:', error);
    return null;
  }
}

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
        
        // 如果有恢复的任务，它们会通过各自的processTranslationJob处理器处理
        // 不再需要启动全局处理器，避免与新的并发处理系统冲突
        if (restoredCount > 0) {
          console.log('[Queue] 恢复的任务将通过各自的处理器处理');
          // 为每个恢复的任务启动独立的处理器
          for (const [jobId, job] of translationQueue.entries()) {
            if (job.status === 'pending') {
              console.log(`[Queue] 为恢复的任务启动处理器: ${jobId}`);
              setTimeout(() => {
                processTranslationJob(jobId).catch(error => {
                  console.error(`[Queue] 恢复任务 ${jobId} 处理失败:`, error);
                });
              }, 1000);
            }
          }
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

    // 获取用户信息（队列处理需要用户登录）
    const user = await getOptionalUser(request);
    
    // 检查是否需要积分（5000字符以下免费，超过需要登录和积分）
    const FREE_LIMIT = 5000; // 🔥 修复：提升免费限制到5000字符
    const needsCredits = text.length > FREE_LIMIT && user;
    
    if (text.length > FREE_LIMIT && !user) {
      return NextResponse.json({
        error: '超过5000字符的长文本翻译需要登录',
        code: 'LOGIN_REQUIRED'
      }, { status: 401 });
    }
    
    if (needsCredits) {
      console.log(`[Queue Translation] 长文本翻译需要积分检查: ${text.length}字符`);
      
      // 计算所需积分
      const creditService = createServerCreditService()
      const calculation = creditService.calculateCreditsRequired(text.length)

      // 获取用户积分
      let userCredits = 0
      try {
        const supabase = createSupabaseAdminClient()
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single()

        if (userError) {
          if (userError.code === 'PGRST116') {
            // 用户记录不存在，创建新记录
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert([{ 
                id: user.id, 
                email: user.email,
                credits: 3000 
              }])
              .select('credits')
              .single()
            
            if (!createError && newUser) {
              userCredits = newUser.credits
            }
          }
        } else if (userData) {
          userCredits = userData.credits
        }
      } catch (error) {
        console.error('[Queue Translation] 积分查询异常:', error)
      }

      // 检查积分是否足够
      if (calculation.credits_required > 0 && userCredits < calculation.credits_required) {
        return NextResponse.json({
          error: `积分不足，需要 ${calculation.credits_required} 积分，当前余额 ${userCredits} 积分`,
          code: 'INSUFFICIENT_CREDITS',
          required: calculation.credits_required,
          available: userCredits
        }, { status: 402 })
      }

      // 先扣除积分（在开始翻译之前）
      if (calculation.credits_required > 0) {
        try {
          const supabase = createSupabaseAdminClient()
          const { error: deductError } = await supabase
            .from('users')
            .update({ credits: userCredits - calculation.credits_required })
            .eq('id', user.id)

          if (deductError) {
            console.error('[Queue Translation] 扣除积分失败:', deductError)
            return NextResponse.json({
              error: '积分扣除失败，请重试',
              code: 'CREDIT_DEDUCTION_FAILED'
            }, { status: 500 })
          }
          
          console.log(`[Queue Translation] 积分扣除成功: ${calculation.credits_required} 积分，剩余: ${userCredits - calculation.credits_required}`)
        } catch (error) {
          console.error('[Queue Translation] 积分扣除异常:', error)
          return NextResponse.json({
            error: '积分扣除失败，请重试',
            code: 'CREDIT_DEDUCTION_ERROR'
          }, { status: 500 })
        }
      }
    } else {
      console.log(`[Queue Translation] 免费翻译: ${text.length}字符，用户: ${user ? '已登录' : '未登录'}`);
    }

    // 生成任务ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 智能分块
    const chunks = smartTextChunking(text, CONFIG.MAX_CHUNK_SIZE);
    
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
      estimatedTime: Math.ceil(chunks.length / CONFIG.BATCH_SIZE) * 2, // 估算秒数
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

// 优化后的翻译任务处理函数 - 并发批次处理
async function processTranslationJob(jobId: string) {
  console.log(`[Queue Debug] 🚀 processTranslationJob 开始执行: ${jobId}`);
  
  const job = translationQueue.get(jobId);
  if (!job) {
    console.log(`[Queue Debug] ❌ Job ${jobId} not found in queue`);
    return;
  }
  
  console.log(`[Queue Debug] ✅ 找到任务，当前状态: ${job.status}`);
  
  console.log(`[Queue Debug] 📋 开始优化处理任务 ${jobId}:`, {
    textLength: job.text.length,
    chunksCount: job.chunks.length,
    sourceLanguage: job.sourceLanguage,
    targetLanguage: job.targetLanguage
  });
  
  try {
    console.log(`[Queue Debug] 🔄 设置任务状态为processing: ${jobId}`);
    job.status = 'processing';
    job.progress = 5; // 设置初始进度5%，表示开始处理
    job.updatedAt = new Date();
    translationQueue.set(jobId, job); // 立即保存状态更新
    saveQueueToFile(); // 保存到备份文件
    console.log(`[Queue Debug] 任务状态已更新并保存: ${jobId}`);
    
    const translatedChunks: string[] = [];
    const totalChunks = job.chunks.length;
    const BATCH_SIZE = CONFIG.BATCH_SIZE; // 3个块/批次
    const CONCURRENT_BATCHES = 1; // 🔥 修复：减少到1个批次，避免NLLB服务过载
    
    console.log(`[Queue Debug] 🔧 优化配置: 批次大小=${BATCH_SIZE}, 并发批次=${CONCURRENT_BATCHES}, 总块数=${totalChunks}`);
    
    // 分组处理：每组包含多个并发批次
    for (let groupStart = 0; groupStart < totalChunks; groupStart += BATCH_SIZE * CONCURRENT_BATCHES) {
      const concurrentBatches = [];
      const groupIndex = Math.floor(groupStart / (BATCH_SIZE * CONCURRENT_BATCHES)) + 1;
      const totalGroups = Math.ceil(totalChunks / (BATCH_SIZE * CONCURRENT_BATCHES));
      
      console.log(`[Queue Debug] 🔄 处理并发组 ${groupIndex}/${totalGroups}, 起始位置=${groupStart}, 剩余块数=${totalChunks - groupStart}`);
      
      // 创建并发批次
      for (let batchOffset = 0; batchOffset < CONCURRENT_BATCHES; batchOffset++) {
        const batchStart = groupStart + batchOffset * BATCH_SIZE;
        const batchEnd = Math.min(batchStart + BATCH_SIZE, totalChunks);
        
        if (batchStart < totalChunks) {
          const batch = job.chunks.slice(batchStart, batchEnd);
          const batchIndex = Math.floor(batchStart / BATCH_SIZE) + 1;
          
          console.log(`[Queue] 准备并发批次 ${batchIndex}, 块范围: ${batchStart + 1}-${batchEnd}`);
          
          // 创建批次处理Promise
          const batchPromise = processBatchConcurrently(batch, job, batchStart, batchIndex);
          concurrentBatches.push({ 
            promise: batchPromise, 
            startIndex: batchStart,
            batchIndex: batchIndex
          });
        }
      }
      
      if (concurrentBatches.length > 0) {
        console.log(`[Queue] 🚀 开始并发处理 ${concurrentBatches.length} 个批次`);
        
        // 并发执行所有批次 - 关键优化点
        const batchResults = await Promise.all(
          concurrentBatches.map(({ promise }) => promise)
        );
        
        console.log(`[Queue] ✅ 并发批次处理完成`);
        
        // 按顺序合并结果
        concurrentBatches.forEach(({ startIndex }, index) => {
          const results = batchResults[index];
          for (let i = 0; i < results.length; i++) {
            translatedChunks[startIndex + i] = results[i];
          }
        });
        
        // 更新进度
        const completedChunks = Math.min(groupStart + BATCH_SIZE * CONCURRENT_BATCHES, totalChunks);
        job.progress = Math.round((completedChunks / totalChunks) * 90) + 10; // 10-100%范围
        job.updatedAt = new Date();
        translationQueue.set(jobId, job); // 立即保存进度更新
        saveQueueToFile(); // 确保持久化
        
        console.log(`[Queue] 并发组完成，进度: ${job.progress}% (${completedChunks}/${totalChunks})`);
        
        // 并发组间延迟 - 统一使用2秒延迟，与文档翻译保持一致
        if (completedChunks < totalChunks) {
          console.log(`[Queue] 并发组间延迟 2000ms...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
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

// 并发批次处理函数
async function processBatchConcurrently(
  batch: string[], 
  job: QueueJob, 
  startIndex: number,
  batchIndex: number
): Promise<string[]> {
  const batchResults: string[] = [];
  
  console.log(`[Queue] 📦 处理批次 ${batchIndex}: ${batch.length}个块`);
  
  // 🔥 修复：改为顺序处理避免NLLB服务过载
  // 批次内顺序处理每个块，避免并发请求导致的中止错误
  for (let i = 0; i < batch.length; i++) {
    const chunk = batch[i];
    const chunkIndex = startIndex + i + 1;
    
    console.log(`[Queue] 翻译块 ${chunkIndex}: ${chunk.substring(0, 30)}...`);
    
    try {
      const result = await translateChunkWithRetry(chunk, job.sourceLanguage, job.targetLanguage);
      
      if (result.success) {
        batchResults.push(result.translatedText!);
        console.log(`[Queue] 块 ${chunkIndex} 翻译成功`);
      } else {
        console.error(`[Queue] 块 ${chunkIndex} 翻译失败: ${result.error}`);
        // 失败时使用原文本作为后备
        batchResults.push(chunk);
      }
      
      // 块间延迟，避免API限流
      if (i < batch.length - 1) {
        console.log(`[Queue] 块间延迟 ${CONFIG.CHUNK_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.CHUNK_DELAY));
      }
      
    } catch (error) {
      console.error(`[Queue] 块 ${chunkIndex} 处理异常:`, error);
      // 异常时使用原文本作为后备
      batchResults.push(chunk);
    }
  }
  
  console.log(`[Queue] 批次 ${batchIndex} 处理完成: ${batchResults.length}/${batch.length} 成功`);
  return batchResults;
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
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
    
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
    console.error(`[Queue] 翻译块失败 (重试 ${retryCount}/${CONFIG.MAX_RETRIES}):`, error.message);
    
    if (retryCount < CONFIG.MAX_RETRIES) {
      const retryDelay = CONFIG.RETRY_DELAY * (retryCount + 1); // 递增延迟
      console.log(`[Queue] ${retryDelay}ms后重试...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return translateChunkWithRetry(text, sourceLanguage, targetLanguage, retryCount + 1);
    }
    
    console.error(`[Queue] 翻译块彻底失败，已重试${CONFIG.MAX_RETRIES}次`);
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
function smartTextChunking(text, maxChunkSize = 600) {
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
          await new Promise(resolve => setTimeout(resolve, CONFIG.CHUNK_DELAY));
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
