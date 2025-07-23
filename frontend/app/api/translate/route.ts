import { NextRequest, NextResponse } from 'next/server'
import { TRANSLATION_CHUNK_CONFIG } from '@/lib/config/translation'
import { createServerCreditService } from '@/lib/services/credits'
import { enhancedRetry, ErrorType, getUserFriendlyErrorMessage, classifyError } from '@/lib/config/enhanced-retry'

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
    console.log('[Auth Debug] 开始用户认证检查');
    
    const authHeader = request.headers.get('authorization');
    console.log('[Auth Debug] Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Auth Debug] 无效的认证头格式');
      return null;
    }

    const token = authHeader.substring(7);
    console.log('[Auth Debug] Token length:', token.length);
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.log('[Auth Debug] 用户认证失败:', error.message);
      return null;
    }

    if (user) {
      console.log('[Auth Debug] 用户认证成功:', user.id, user.email);
      return user;
    }

    return null;
  } catch (error) {
    console.error('[Auth Debug] 认证异常:', error);
    return null;
  }
}

// 🔥 借鉴文档翻译的智能分块函数
function smartTextChunking(text: string, maxChunkSize = CONFIG.MAX_CHUNK_SIZE) {
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
  
  console.log(`✅ 分块完成: ${chunks.length}个块`);
  return chunks;
}

// 强制分块函数
function forceChunkBySentence(text: string, maxSize: number): string[] {
  const chunks = [];
  let currentChunk = '';
  const words = text.split(' ');
  
  for (const word of words) {
    const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + word;
    
    if (potentialChunk.length <= maxSize) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = word;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

// 🔥 借鉴文档翻译的NLLB语言代码映射
function mapToNLLBLanguageCode(language: string): string {
  const languageMap: Record<string, string> = {
    'am': 'amh_Ethi', 'ar': 'arb_Arab', 'en': 'eng_Latn', 'es': 'spa_Latn',
    'fr': 'fra_Latn', 'ha': 'hau_Latn', 'hi': 'hin_Deva', 'ht': 'hat_Latn',
    'ig': 'ibo_Latn', 'km': 'khm_Khmr', 'ky': 'kir_Cyrl', 'lo': 'lao_Laoo',
    'mg': 'plt_Latn', 'mn': 'khk_Cyrl', 'my': 'mya_Mymr', 'ne': 'npi_Deva',
    'ps': 'pbt_Arab', 'pt': 'por_Latn', 'sd': 'snd_Arab', 'si': 'sin_Sinh',
    'sw': 'swh_Latn', 'te': 'tel_Telu', 'tg': 'tgk_Cyrl', 'xh': 'xho_Latn',
    'yo': 'yor_Latn', 'zh': 'zho_Hans', 'zu': 'zul_Latn'
  }
  
  return languageMap[language] || language
}

// 🔥 借鉴文档翻译的同步重试函数
async function translateChunkWithSyncRetry(text: string, sourceLanguage: string, targetLanguage: string, retryCount: number = 0): Promise<{success: boolean, translatedText?: string, error?: string}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
  
  try {
    console.log(`🔄 同步块翻译 (尝试 ${retryCount + 1}/${CONFIG.MAX_RETRIES + 1}): ${text.length}字符`);
    
    const nllbServiceUrl = process.env.NLLB_SERVICE_URL || 'https://wane0528-my-nllb-api.hf.space/api/v4/translator';
    
    // 🔥 新增：服务可用性快速检查
    if (retryCount === 0) {
      console.log(`[Service Check] 检查NLLB服务可用性...`);
      try {
        const healthCheck = await fetch(nllbServiceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            text: "test",
            source: "eng_Latn",
            target: "zho_Hans",
            max_length: 100
          }),
          signal: AbortSignal.timeout(5000) // 5秒快速检查
        });
        
        if (!healthCheck.ok) {
          console.log(`[Service Check] NLLB服务响应异常: ${healthCheck.status}`);
        } else {
          console.log(`[Service Check] NLLB服务可用`);
        }
      } catch (healthError) {
        console.error(`[Service Check] NLLB服务不可用:`, healthError.message);
        return {
          success: false,
          error: '翻译服务暂时不可用，请稍后重试。我们正在努力恢复服务。'
        };
      }
    }
    
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
      
      console.log(`[Language Detection] Auto detected: ${actualSourceLanguage} for text: ${text.substring(0, 50)}...`);
    }
    
    // 映射到NLLB语言代码
    const nllbSourceLang = mapToNLLBLanguageCode(actualSourceLanguage);
    const nllbTargetLang = mapToNLLBLanguageCode(targetLanguage);
    
    console.log(`[Language Mapping] ${actualSourceLanguage} -> ${nllbSourceLang}, ${targetLanguage} -> ${nllbTargetLang}`);
    
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
    console.log(`✅ 同步块翻译成功: ${translatedText.length}字符`);
    
    return {
      success: true,
      translatedText: translatedText
    };

  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error(`[Sync Translation] 翻译块失败 (重试 ${retryCount}/${CONFIG.MAX_RETRIES}):`, error.message);
    
    // 🔥 改善错误分类和用户友好提示
    let userFriendlyError = '翻译失败，请重试';
    
    if (error.name === 'AbortError' || error.message.includes('aborted')) {
      userFriendlyError = '翻译服务响应超时，请稍后重试';
    } else if (error.message.includes('fetch')) {
      userFriendlyError = '无法连接到翻译服务，请检查网络连接';
    } else if (error.message.includes('503') || error.message.includes('502')) {
      userFriendlyError = '翻译服务暂时不可用，请稍后重试';
    } else if (error.message.includes('429')) {
      userFriendlyError = '请求过于频繁，请稍后重试';
    }
    
    if (retryCount < CONFIG.MAX_RETRIES) {
      const retryDelay = CONFIG.RETRY_DELAY * (retryCount + 1); // 递增延迟
      console.log(`[Sync Translation] ${retryDelay}ms后重试...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return translateChunkWithSyncRetry(text, sourceLanguage, targetLanguage, retryCount + 1);
    }
    
    console.error(`[Sync Translation] 翻译块彻底失败，已重试${CONFIG.MAX_RETRIES}次`);
    
    // 🔥 最终失败时提供详细的用户友好错误信息
    const finalError = retryCount >= CONFIG.MAX_RETRIES 
      ? `翻译服务暂时不可用，已重试${CONFIG.MAX_RETRIES}次。请稍后重试或联系技术支持。`
      : userFriendlyError;
    
    return {
      success: false,
      error: finalError
    };
  }
}

// 🔥 增强的重试翻译函数 - 使用新的重试机制
async function translateChunkWithEnhancedRetry(text: string, sourceLanguage: string, targetLanguage: string): Promise<{success: boolean, translatedText?: string, error?: string}> {
  
  const translateOperation = async (): Promise<string> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
    
    try {
      console.log(`🔄 增强重试翻译: ${text.length}字符`);
      
      const nllbServiceUrl = process.env.NLLB_SERVICE_URL || 'https://wane0528-my-nllb-api.hf.space/api/v4/translator';
      
      // 处理自动检测语言
      let actualSourceLanguage = sourceLanguage;
      if (sourceLanguage === 'auto') {
        const hasChinese = /[\u4e00-\u9fff]/.test(text);
        const hasJapanese = /[\u3040-\u309f\u30a0-\u30ff]/.test(text);
        const hasKorean = /[\uac00-\ud7af]/.test(text);
        
        if (hasChinese) {
          actualSourceLanguage = 'zho_Hans';
        } else if (hasJapanese) {
          actualSourceLanguage = 'jpn_Jpan';
        } else if (hasKorean) {
          actualSourceLanguage = 'kor_Hang';
        } else {
          actualSourceLanguage = 'eng_Latn';
        }
        
        console.log(`[Auto Detect] 检测到语言: ${actualSourceLanguage}`);
      }
      
      // 映射语言代码
      const nllbSourceLang = mapToNLLBLanguageCode(actualSourceLanguage);
      const nllbTargetLang = mapToNLLBLanguageCode(targetLanguage);
      
      console.log(`[Enhanced Translation] ${nllbSourceLang} → ${nllbTargetLang}: ${text.substring(0, 100)}...`);
      
      const response = await fetch(nllbServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text: text,  // 修复：使用正确的API格式
          source: nllbSourceLang,
          target: nllbTargetLang,
          max_length: 1000
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      const translatedText = result.result || result.translated_text || result.translation || text;
      
      console.log(`✅ 增强翻译成功: ${translatedText.substring(0, 100)}...`);
      return translatedText;
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      throw error;
    }
  };
  
  try {
    const translatedText = await enhancedRetry(
      translateOperation,
      `翻译文本块(${text.length}字符)`
    );
    
    return {
      success: true,
      translatedText: translatedText
    };
    
  } catch (error: any) {
    console.error(`[Enhanced Translation] 最终翻译失败:`, error.message);
    
    return {
      success: false,
      error: error.message || '翻译失败，请稍后重试'
    };
  }
}

// 🔥 简单重试翻译函数 - 与文档翻译保持一致
async function translateChunkWithRetry(text: string, sourceLanguage: string, targetLanguage: string, retryCount: number = 0): Promise<{success: boolean, translatedText?: string, error?: string}> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT)
  
  try {
    console.log(`🔄 文本块翻译 (尝试 ${retryCount + 1}/${CONFIG.MAX_RETRIES + 1}): ${text.length}字符`)
    
    const nllbServiceUrl = process.env.NLLB_SERVICE_URL || 'https://wane0528-my-nllb-api.hf.space/api/v4/translator'
    
    // 处理自动检测语言
    let actualSourceLanguage = sourceLanguage
    if (sourceLanguage === 'auto') {
      const hasChinese = /[\u4e00-\u9fff]/.test(text)
      const hasJapanese = /[\u3040-\u309f\u30a0-\u30ff]/.test(text)
      const hasKorean = /[\uac00-\ud7af]/.test(text)
      
      if (hasChinese) {
        actualSourceLanguage = 'zho_Hans'
      } else if (hasJapanese) {
        actualSourceLanguage = 'jpn_Jpan'
      } else if (hasKorean) {
        actualSourceLanguage = 'kor_Hang'
      } else {
        actualSourceLanguage = 'eng_Latn'
      }
      
      console.log(`[Auto Detect] 检测到语言: ${actualSourceLanguage}`)
    }
    
    // 映射语言代码
    const nllbSourceLang = mapToNLLBLanguageCode(actualSourceLanguage)
    const nllbTargetLang = mapToNLLBLanguageCode(targetLanguage)
    
    console.log(`[Text Translation] ${nllbSourceLang} → ${nllbTargetLang}: ${text.substring(0, 100)}...`)
    
    const response = await fetch(nllbServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        source: nllbSourceLang,
        target: nllbTargetLang,
        max_length: 1000
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`翻译服务错误: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    const translatedText = result.result || result.translated_text || result.translation || text
    console.log(`✅ 文本翻译成功: ${translatedText.substring(0, 100)}...`)
    
    return {
      success: true,
      translatedText: translatedText
    }
    
  } catch (error: any) {
    clearTimeout(timeoutId)
    console.error(`[Text Translation] 翻译块失败 (重试 ${retryCount}/${CONFIG.MAX_RETRIES}):`, error.message)
    
    // 检查是否需要重试
    if (retryCount < CONFIG.MAX_RETRIES) {
      console.log(`⏳ ${CONFIG.RETRY_DELAY}ms后重试...`)
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY))
      return translateChunkWithRetry(text, sourceLanguage, targetLanguage, retryCount + 1)
    } else {
      console.log(`💥 重试次数已用完，返回错误`)
      return {
        success: false,
        error: error.message || '翻译失败'
      }
    }
  }
}

// 🔥 借鉴文档翻译的同步处理函数
async function performSyncTextTranslation(chunks: string[], sourceLang: string, targetLang: string) {
  try {
    console.log(`[Sync Translation] 开始同步翻译: ${chunks.length}个块`);
    const translatedChunks: string[] = [];
    
    // 🔥 关键：完全顺序处理，避免NLLB服务过载
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // 块间延迟，避免请求过于频繁
      if (i > 0) {
        console.log(`⏳ 块间延迟 ${CONFIG.CHUNK_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.CHUNK_DELAY));
      }
      
      console.log(`[Sync Translation] 翻译块 ${i + 1}/${chunks.length}: ${chunk.substring(0, 50)}...`);
      
      // 🔥 使用简单重试逻辑，与文档翻译保持一致
      const chunkResult = await translateChunkWithRetry(chunk, sourceLang, targetLang);
      
      if (!chunkResult.success) {
        throw new Error(chunkResult.error || '翻译失败');
      }
      
      translatedChunks.push(chunkResult.translatedText!);
      console.log(`✅ 块 ${i + 1} 翻译成功`);
    }
    
    const finalTranslation = translatedChunks.join(' ');
    console.log(`[Sync Translation] 同步翻译完成: ${finalTranslation.length}字符`);
    
    return NextResponse.json({
      success: true,
      translatedText: finalTranslation,
      originalLength: chunks.join(' ').length,
      translatedLength: finalTranslation.length,
      processingMode: 'sync',
      chunksProcessed: chunks.length
    });
    
        // 传统处理逻辑已移除，统一使用队列处理
    
    // 智能分块
    const chunks = smartTextChunking(text, CONFIG.MAX_CHUNK_SIZE);
    console.log(`[Translation Strategy] 分块完成: ${chunks.length}个块`);
    
    // 计算积分（如果需要）
    let creditsRequired = 0;

    
    // 🔥 传统处理策略
    if (chunks.length <= 3) {
      // 小文本同步处理
      console.log(`[Translation Strategy] 小文本同步处理: ${chunks.length}个块`);
      return await performSyncTextTranslation(chunks, sourceLang, targetLang);
    } else {
      // 中等文本异步处理
      console.log(`[Translation Strategy] 中等文本异步处理: ${chunks.length}个块`);
      return await performAsyncTextTranslation(chunks, sourceLang, targetLang, user?.id, creditsRequired);
    }
    
  } catch (error) {
    console.error('[Translation] 处理异常:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : '翻译失败',
      code: 'TRANSLATION_ERROR'
    }, { status: 500 });
  }
}

// 🔥 文本翻译任务处理函数 - 完全复用文档翻译的成功逻辑
async function processTextTranslationJob(jobId: string) {
  const textTranslationQueue = (global as any).textTranslationQueue
  const job = textTranslationQueue.get(jobId)
  
  if (!job) {
    console.log(`[Text Translation] 任务不存在: ${jobId}`)
    return
  }
  
  console.log(`[Text Translation] 开始处理文本翻译任务: ${jobId}`)
  
  try {
    // 设置处理状态
    job.status = 'processing'
    job.progress = 5
    job.updatedAt = new Date()
    textTranslationQueue.set(jobId, job)
    
    const translatedChunks: string[] = []
    const totalChunks = job.chunks.length
    const BATCH_SIZE = CONFIG.BATCH_SIZE // 使用配置文件中的批次大小
    
    // 分批处理块 (与文档翻译完全相同的逻辑)
    for (let i = 0; i < totalChunks; i += BATCH_SIZE) {
      const batch = job.chunks.slice(i, i + BATCH_SIZE)
      console.log(`[Text Translation] 处理批次 ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(totalChunks/BATCH_SIZE)}, 块数: ${batch.length}`)
      
      // 更新批次开始进度（使用统一的0-100%计算）
      const startProgress = Math.round((i / totalChunks) * 100)
      job.progress = Math.max(startProgress, 5) // 最小显示5%
      job.updatedAt = new Date()
      textTranslationQueue.set(jobId, job)
      
      // 顺序处理当前批次（文本翻译每批次只有1个块）
      for (let batchIndex = 0; batchIndex < batch.length; batchIndex++) {
        const chunk = batch[batchIndex]
        const globalIndex = i + batchIndex + 1
        
        // 块间延迟（除了第一个块）
        if (batchIndex > 0) {
          console.log(`⏳ 块间延迟 ${CONFIG.CHUNK_DELAY}ms...`)
          await new Promise(resolve => setTimeout(resolve, CONFIG.CHUNK_DELAY))
        }
        
        console.log(`[Text Translation] 翻译块 ${globalIndex}/${totalChunks}: ${chunk.substring(0, 50)}...`)
        
        const result = await translateChunkWithRetry(chunk, job.sourceLanguage, job.targetLanguage)
        
        if (!result.success) {
          throw new Error(result.error || '翻译失败')
        }
        
        translatedChunks.push(result.translatedText!)
        console.log(`✅ 块 ${globalIndex} 翻译成功`)
      }
      
      // 更新进度（确保单调递增）
      const newProgress = Math.round(((i + batch.length) / totalChunks) * 100)
      job.progress = Math.max(newProgress, job.progress) // 确保进度不倒退
      job.updatedAt = new Date()
      textTranslationQueue.set(jobId, job)
      
      console.log(`[Text Translation] 进度更新: ${job.progress}% (${i + batch.length}/${totalChunks}) [批次${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(totalChunks/BATCH_SIZE)}]`)
      
      // 批次间延迟 (与文档翻译一致)
      if (i + BATCH_SIZE < totalChunks) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.BATCH_DELAY))
      }
    }
    
    // 合并结果
    job.result = translatedChunks.join(' ')
    job.status = 'completed'
    job.progress = 100
    job.updatedAt = new Date()
    textTranslationQueue.set(jobId, job)
    
    console.log(`[Text Translation] 文本翻译任务完成: ${jobId}`, {
      totalChunks: translatedChunks.length,
      resultLength: job.result.length,
      resultPreview: job.result.substring(0, 100) + '...'
    })
    
  } catch (error) {
    job.status = 'failed'
    job.error = error instanceof Error ? error.message : '翻译失败'
    job.updatedAt = new Date()
    
    // 翻译失败时退还积分 (与文档翻译相同的逻辑)
    if (job.userId && job.creditsUsed > 0) {
      try {
        const { createClient } = require('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )
        
        // 先查询用户当前积分
        const { data: userData, error: queryError } = await supabase
          .from('users')
          .select('credits')
          .eq('id', job.userId)
          .single()
        
        if (queryError) {
          console.error(`[Text Translation] 查询用户积分失败: ${jobId}`, queryError)
        } else if (userData) {
          // 计算退还后的积分
          const newCredits = userData.credits + job.creditsUsed
          
          // 更新用户积分
          const { error: refundError } = await supabase
            .from('users')
            .update({ 
              credits: newCredits
            })
            .eq('id', job.userId)

          if (refundError) {
            console.error(`[Text Translation] 退还积分失败: ${jobId}`, refundError)
          } else {
            console.log(`[Text Translation] 翻译失败，已退还积分: ${job.creditsUsed} 积分给用户 ${job.userId} (${userData.credits} -> ${newCredits})`)
          }
        }
      } catch (refundError) {
        console.error(`[Text Translation] 积分退还异常: ${jobId}`, refundError)
      }
    }
    
    textTranslationQueue.set(jobId, job)
  }
}


// 🔥 主要的POST处理函数 - Next.js App Router要求
export async function POST(request: NextRequest) {
  // 积分相关变量
  let userCredits = 0;
  let creditsRequired = 0;
  

  try {
    console.log('翻译配置说明:');
    console.log('- 分块大小: 800字符（考虑NLLB服务限制）');
    
    const body = await request.json();
    const { text, sourceLang, targetLang, mode = 'async' } = body;

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json({
        error: '缺少必要参数',
        code: 'MISSING_PARAMETERS'
      }, { status: 400 });
    }

    console.log(`[Text Translation] 收到翻译请求: ${text.length}字符 (${sourceLang} -> ${targetLang})`);

    // 获取用户信息（可选）
    const user = await getOptionalUser(request);
    console.log('[Text Translation] 用户状态:', user ? `已登录 (${user.id})` : '未登录');

    // 初始化全局队列
    if (!(global as any).textTranslationQueue) {
      (global as any).textTranslationQueue = new Map();
    }

    // 生成任务ID
    const jobId = `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 计算字符数
    const characterCount = text.length;
    
    console.log(`[Text Translation] 任务创建完成: jobId=${jobId}, creditsUsed=${creditsRequired}, userCredits=${userCredits}`);
    
    // 积分检查和扣除（仅对登录用户，与文档翻译逻辑完全一致）
    console.log(`[Text Translation] 积分检查开始: 用户=${user ? '已登录' : '未登录'}, 字符数=${characterCount}`);
    if (user) {
      console.log(`[Text Translation] 开始为登录用户进行积分检查和扣除`);
      // 计算所需积分
      const creditService = createServerCreditService()
      const calculation = creditService.calculateCreditsRequired(characterCount)
      creditsRequired = calculation.credits_required
      console.log(`[Text Translation] 积分计算结果: 需要 ${creditsRequired} 积分`)

      // 获取用户积分
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
          } else {
            console.error('[Text Translation] 查询用户积分失败:', userError)
          }
        } else if (userData) {
          userCredits = userData.credits
        }
      } catch (error) {
        console.error('[Text Translation] 积分查询异常:', error)
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

      // 先扣除积分（无论同步还是异步都先扣除）
      if (calculation.credits_required > 0) {
        try {
          const supabase = createSupabaseAdminClient()
          const { error: deductError } = await supabase
            .from('users')
            .update({ credits: userCredits - calculation.credits_required })
            .eq('id', user.id)

          if (deductError) {
            console.error('[Text Translation] 扣除积分失败:', deductError)
            return NextResponse.json({
              error: '积分扣除失败，请重试',
              code: 'CREDIT_DEDUCTION_FAILED'
            }, { status: 500 })
          }
          
          console.log(`[Text Translation] 积分扣除成功: ${calculation.credits_required} 积分，剩余: ${userCredits - calculation.credits_required}`)
        } catch (error) {
          console.error('[Text Translation] 积分扣除异常:', error)
          return NextResponse.json({
            error: '积分扣除失败，请重试',
            code: 'CREDIT_DEDUCTION_ERROR'
          }, { status: 500 })
        }
      }
    }



    // 创建翻译任务
    // 将文本分块处理
    const chunkSize = CONFIG.MAX_CHUNK_SIZE || 800;
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }

    const job = {
      id: jobId,
      text,
      chunks,
      sourceLang,
      targetLang,
      sourceLanguage: sourceLang, // 添加兼容字段
      targetLanguage: targetLang,  // 添加兼容字段
      status: 'pending',
      progress: 0,
      result: null,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user?.id || null,
      creditsUsed: creditsRequired,
      userCredits: user ? userCredits : 0,
      originalUserCredits: user ? userCredits : 0, // 保存原始积分用于退还
      characterCount
    };

    const textTranslationQueue = (global as any).textTranslationQueue;
    textTranslationQueue.set(jobId, job);

    // 异步处理翻译任务
    processTextTranslationJob(jobId).catch(error => {
      console.error(`[Text Translation] 任务处理失败: ${jobId}`, error);
    });

    // 立即返回任务ID - 匹配前端期望的格式
    return NextResponse.json({
      success: true,   // 长文本路径需要这个字段
      useQueue: true,  // 短文本路径需要这个字段
      jobId,
      status: 'pending',
      message: '翻译任务已创建',
      characterCount,
      creditsUsed: creditsRequired
    });

  } catch (error: any) {
    console.error('[Text Translation] API错误:', error);
    return NextResponse.json({
      error: '服务器内部错误',
      code: 'INTERNAL_ERROR',
      details: error.message
    }, { status: 500 });
  }
}
