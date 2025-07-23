import { NextRequest, NextResponse } from 'next/server'

/**
 * 串流长文本翻译API
 * 
 * 核心策略：
 * 1. 800字符分块
 * 2. 串流处理，每块独立任务
 * 3. 块间2秒延迟
 * 4. 25秒单块超时
 * 5. 规避Vercel 30秒限制
 */

// 串流配置
const STREAM_CONFIG = {
  MAX_CHUNK_SIZE: 800,
  CHUNK_INTERVAL: 2000,
  SINGLE_CHUNK_TIMEOUT: 25000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  STREAM_THRESHOLD: 1600
};

// 全局串流任务存储
if (!(global as any).streamTasks) {
  (global as any).streamTasks = new Map();
}

interface StreamTask {
  id: string;
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  chunks: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentChunk: number;
  results: string[];
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  creditsUsed?: number;
}

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

// 获取用户信息
async function getOptionalUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);
    return error ? null : user;
  } catch (error) {
    return null;
  }
}

// 智能分块函数
function createStreamingChunks(text: string, maxChunkSize = STREAM_CONFIG.MAX_CHUNK_SIZE): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  console.log(`📝 串流分块: ${text.length}字符 -> ${maxChunkSize}字符/块`);
  
  const chunks: string[] = [];
  
  // 按段落分割
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const paragraph of paragraphs) {
    if (paragraph.trim().length === 0) continue;
    
    if (paragraph.length <= maxChunkSize) {
      chunks.push(paragraph.trim());
    } else {
      // 按句子分割
      const sentences = paragraph.split(/[.!?。！？]\s+/);
      let currentChunk = '';
      
      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i].trim();
        if (!sentence) continue;
        
        const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + sentence;
        
        if (potentialChunk.length <= maxChunkSize) {
          currentChunk = potentialChunk;
        } else {
          if (currentChunk) {
            chunks.push(currentChunk + (currentChunk.endsWith('.') ? '' : '.'));
          }
          
          if (sentence.length > maxChunkSize) {
            const subChunks = forceChunkByWords(sentence, maxChunkSize);
            chunks.push(...subChunks);
            currentChunk = '';
          } else {
            currentChunk = sentence;
          }
        }
      }
      
      if (currentChunk) {
        chunks.push(currentChunk + (currentChunk.endsWith('.') ? '' : '.'));
      }
    }
  }
  
  const finalChunks = chunks.filter(chunk => chunk.trim().length > 0);
  console.log(`✅ 串流分块完成: ${finalChunks.length}个块`);
  
  return finalChunks;
}

function forceChunkByWords(text: string, maxSize: number): string[] {
  const chunks: string[] = [];
  const words = text.split(' ');
  let currentChunk = '';
  
  for (const word of words) {
    const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + word;
    
    if (potentialChunk.length <= maxSize) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = word.length > maxSize ? word.substring(0, maxSize) : word;
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

// 单块翻译函数
async function translateSingleChunk(
  text: string, 
  sourceLanguage: string, 
  targetLanguage: string,
  retryCount: number = 0
): Promise<{success: boolean, translatedText?: string, error?: string}> {
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), STREAM_CONFIG.SINGLE_CHUNK_TIMEOUT);
  
  try {
    console.log(`🔄 串流块翻译 (尝试 ${retryCount + 1}): ${text.length}字符`);
    
    const nllbServiceUrl = process.env.NLLB_SERVICE_URL || 'https://wane0528-my-nllb-api.hf.space/api/v4/translator';
    
    // 处理自动检测语言
    let actualSourceLanguage = sourceLanguage;
    if (sourceLanguage === 'auto') {
      const hasChinese = /[\u4e00-\u9fff]/.test(text);
      const hasJapanese = /[\u3040-\u309f\u30a0-\u30ff]/.test(text);
      const hasKorean = /[\uac00-\ud7af]/.test(text);
      
      if (hasChinese) {
        actualSourceLanguage = 'zh';
      } else if (hasJapanese) {
        actualSourceLanguage = 'ja';
      } else if (hasKorean) {
        actualSourceLanguage = 'ko';
      } else {
        actualSourceLanguage = 'en';
      }
    }
    
    const nllbSourceLang = mapToNLLBLanguageCode(actualSourceLanguage);
    const nllbTargetLang = mapToNLLBLanguageCode(targetLanguage);
    
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
      throw new Error(`翻译服务错误: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    const translatedText = result.result || result.translated_text || result.translation || text;
    console.log(`✅ 串流块翻译成功: ${translatedText.length}字符`);
    
    return {
      success: true,
      translatedText: translatedText
    };

  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error(`[Stream] 翻译块失败 (重试 ${retryCount}):`, error.message);
    
    if (retryCount < STREAM_CONFIG.MAX_RETRIES) {
      console.log(`⏳ ${STREAM_CONFIG.RETRY_DELAY}ms后重试...`);
      await new Promise(resolve => setTimeout(resolve, STREAM_CONFIG.RETRY_DELAY));
      return translateSingleChunk(text, sourceLanguage, targetLanguage, retryCount + 1);
    }
    
    return {
      success: false,
      error: error.message || '翻译失败'
    };
  }
}

// 串流处理函数
async function processStreamTask(taskId: string) {
  const streamTasks = (global as any).streamTasks;
  const task = streamTasks.get(taskId);
  
  if (!task) {
    console.error(`[Stream] 任务不存在: ${taskId}`);
    return;
  }
  
  console.log(`[Stream] 开始串流处理: ${taskId}, 共${task.chunks.length}个块`);
  
  try {
    task.status = 'processing';
    task.updatedAt = new Date();
    streamTasks.set(taskId, task);
    
    // 串流处理每个块
    for (let i = 0; i < task.chunks.length; i++) {
      const chunk = task.chunks[i];
      
      console.log(`[Stream] 处理块 ${i + 1}/${task.chunks.length}: ${chunk.substring(0, 50)}...`);
      
      // 块间延迟（除了第一个块）
      if (i > 0) {
        console.log(`⏳ 块间延迟 ${STREAM_CONFIG.CHUNK_INTERVAL}ms...`);
        await new Promise(resolve => setTimeout(resolve, STREAM_CONFIG.CHUNK_INTERVAL));
      }
      
      const result = await translateSingleChunk(chunk, task.sourceLanguage, task.targetLanguage);
      
      if (!result.success) {
        throw new Error(result.error || '翻译失败');
      }
      
      task.results[i] = result.translatedText!;
      task.currentChunk = i + 1;
      task.progress = Math.round(((i + 1) / task.chunks.length) * 100);
      task.updatedAt = new Date();
      streamTasks.set(taskId, task);
      
      console.log(`✅ 块 ${i + 1} 完成，进度: ${task.progress}%`);
    }
    
    // 合并结果
    task.status = 'completed';
    task.progress = 100;
    task.updatedAt = new Date();
    streamTasks.set(taskId, task);
    
    console.log(`[Stream] 串流任务完成: ${taskId}`);
    
  } catch (error) {
    console.error(`[Stream] 串流任务失败: ${taskId}`, error);
    
    task.status = 'failed';
    task.error = error instanceof Error ? error.message : '串流处理失败';
    task.updatedAt = new Date();
    streamTasks.set(taskId, task);
    
    // 失败时退还积分
    if (task.userId && task.creditsUsed && task.creditsUsed > 0) {
      try {
        const supabase = createSupabaseAdminClient();
        const { data: userData } = await supabase
          .from('users')
          .select('credits')
          .eq('id', task.userId)
          .single();
        
        if (userData) {
          await supabase
            .from('users')
            .update({ credits: userData.credits + task.creditsUsed })
            .eq('id', task.userId);
          
          console.log(`[Stream] 已退还积分: ${task.creditsUsed} 给用户 ${task.userId}`);
        }
      } catch (refundError) {
        console.error(`[Stream] 积分退还失败:`, refundError);
      }
    }
  }
}

// POST - 创建串流翻译任务
export async function POST(request: NextRequest) {
  try {
    const { text, sourceLang, targetLang } = await request.json();
    
    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json({
        error: '缺少必要参数: text, sourceLang, targetLang',
        code: 'MISSING_PARAMETERS'
      }, { status: 400 });
    }

    // 检查是否需要串流处理
    if (text.length <= STREAM_CONFIG.STREAM_THRESHOLD) {
      return NextResponse.json({
        error: '文本长度不足，建议使用普通翻译API',
        code: 'TEXT_TOO_SHORT',
        suggestion: 'use_regular_api'
      }, { status: 400 });
    }

    const user = await getOptionalUser(request);
    
    // 积分检查
    const FREE_LIMIT = 5000;
    const needsCredits = text.length > FREE_LIMIT && user;
    
    if (text.length > FREE_LIMIT && !user) {
      return NextResponse.json({
        error: '超过5000字符的长文本翻译需要登录',
        code: 'LOGIN_REQUIRED'
      }, { status: 401 });
    }
    
    let creditsRequired = 0;
    if (needsCredits) {
      // 简化积分计算：每1000字符1积分
      creditsRequired = Math.ceil(text.length / 1000);
      
      const supabase = createSupabaseAdminClient();
      const { data: userData } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();
      
      const userCredits = userData?.credits || 0;
      
      if (userCredits < creditsRequired) {
        return NextResponse.json({
          error: `积分不足，需要 ${creditsRequired} 积分，当前余额 ${userCredits} 积分`,
          code: 'INSUFFICIENT_CREDITS',
          required: creditsRequired,
          available: userCredits
        }, { status: 402 });
      }
      
      // 扣除积分
      await supabase
        .from('users')
        .update({ credits: userCredits - creditsRequired })
        .eq('id', user.id);
      
      console.log(`[Stream] 积分扣除成功: ${creditsRequired} 积分`);
    }

    // 创建串流任务
    const taskId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const chunks = createStreamingChunks(text);
    
    const task: StreamTask = {
      id: taskId,
      text,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      chunks,
      status: 'pending',
      progress: 0,
      currentChunk: 0,
      results: new Array(chunks.length).fill(''),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user?.id,
      creditsUsed: creditsRequired
    };
    
    const streamTasks = (global as any).streamTasks;
    streamTasks.set(taskId, task);
    
    // 异步开始处理
    setTimeout(() => {
      processStreamTask(taskId).catch(error => {
        console.error(`[Stream] 任务处理失败: ${taskId}`, error);
      });
    }, 100);
    
    return NextResponse.json({
      success: true,
      taskId,
      totalChunks: chunks.length,
      estimatedTime: chunks.length * (STREAM_CONFIG.CHUNK_INTERVAL / 1000) + 10,
      message: '串流翻译任务已创建，正在后台处理'
    });
    
  } catch (error) {
    console.error('[Stream] 创建任务失败:', error);
    return NextResponse.json({
      error: '创建串流翻译任务失败',
      code: 'STREAM_ERROR'
    }, { status: 500 });
  }
}

// GET - 查询串流任务状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    
    if (!taskId) {
      return NextResponse.json({
        error: '缺少任务ID',
        code: 'MISSING_TASK_ID'
      }, { status: 400 });
    }
    
    const streamTasks = (global as any).streamTasks;
    const task = streamTasks.get(taskId);
    
    if (!task) {
      return NextResponse.json({
        success: false,
        error: '任务不存在或已过期',
        code: 'TASK_NOT_FOUND'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      task: {
        id: task.id,
        status: task.status,
        progress: task.progress,
        currentChunk: task.currentChunk,
        totalChunks: task.chunks.length,
        result: task.status === 'completed' ? task.results.join(' ') : null,
        error: task.error,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }
    });
    
  } catch (error) {
    console.error('[Stream] 查询任务状态失败:', error);
    return NextResponse.json({
      error: '查询任务状态失败',
      code: 'QUERY_ERROR'
    }, { status: 500 });
  }
}
