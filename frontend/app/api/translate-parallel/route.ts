import { NextRequest, NextResponse } from 'next/server'

// 并行翻译配置 - 针对长文本优化
const PARALLEL_CONFIG = {
  MAX_CHUNK_SIZE: 300,        // 300字符分块
  MAX_RETRIES: 5,             // 每个块最多重试5次
  RETRY_DELAY: 1000,          // 重试延迟1秒
  CONCURRENT_LIMIT: 3,        // 最大并发数（避免限流）
  REQUEST_TIMEOUT: 30000,     // 请求超时30秒
  CHUNK_DELAY: 200,           // 块启动间隔200ms
};

// NLLB语言代码映射
const NLLB_LANGUAGE_MAP: Record<string, string> = {
  'am': 'amh_Ethi', 'ar': 'arb_Arab', 'en': 'eng_Latn', 'es': 'spa_Latn',
  'fr': 'fra_Latn', 'ha': 'hau_Latn', 'hi': 'hin_Deva', 'ht': 'hat_Latn',
  'ig': 'ibo_Latn', 'km': 'khm_Khmr', 'ky': 'kir_Cyrl', 'lo': 'lao_Laoo',
  'mg': 'plt_Latn', 'mn': 'khk_Cyrl', 'my': 'mya_Mymr', 'ne': 'npi_Deva',
  'ps': 'pbt_Arab', 'pt': 'por_Latn', 'sd': 'snd_Arab', 'si': 'sin_Sinh',
  'sw': 'swh_Latn', 'te': 'tel_Telu', 'tg': 'tgk_Cyrl', 'xh': 'xho_Latn',
  'yo': 'yor_Latn', 'zh': 'zho_Hans', 'zu': 'zul_Latn'
};

const NLLB_SERVICE_URL = 'https://wane0528-my-nllb-api.hf.space/api/v4/translator';

function getNLLBLanguageCode(language: string): string {
  const nllbCode = NLLB_LANGUAGE_MAP[language];
  if (!nllbCode) throw new Error(`Unsupported language: ${language}`);
  return nllbCode;
}

/**
 * 智能文本分块 - 300字符并行优化版本
 */
function smartTextChunking(text: string, maxChunkSize: number = PARALLEL_CONFIG.MAX_CHUNK_SIZE): Array<{index: number, text: string}> {
  if (text.length <= maxChunkSize) {
    return [{index: 0, text: text}];
  }

  console.log(`📝 智能分块: ${text.length}字符 -> ${maxChunkSize}字符/块`);
  
  const chunks: string[] = [];
  
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
  
  const finalChunks = chunks
    .filter(chunk => chunk.trim().length > 0)
    .map((text, index) => ({ index, text }));
  
  console.log(`✅ 分块完成: ${finalChunks.length}个块`);
  
  return finalChunks;
}

/**
 * 强制分块处理超长句子
 */
function forceChunkBySentence(sentence: string, maxSize: number): string[] {
  const chunks: string[] = [];
  
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
          if ((wordChunk + ' ' + word).length <= maxSize) {
            wordChunk += (wordChunk ? ' ' : '') + word;
          } else {
            if (wordChunk) chunks.push(wordChunk);
            wordChunk = word;
          }
        }
        
        if (wordChunk) currentChunk = wordChunk;
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

/**
 * 带重试机制的单块翻译函数
 */
async function translateChunkWithRetry(
  chunkData: {index: number, text: string}, 
  sourceNLLB: string, 
  targetNLLB: string
): Promise<{index: number, result: string, status: 'success' | 'failed', attempts: number, error?: string}> {
  
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= PARALLEL_CONFIG.MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PARALLEL_CONFIG.REQUEST_TIMEOUT);
    
    try {
      console.log(`🔄 块${chunkData.index + 1} 翻译尝试 ${attempt}/${PARALLEL_CONFIG.MAX_RETRIES}: ${chunkData.text.length}字符`);
      
      const response = await fetch(NLLB_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text: chunkData.text,
          source: sourceNLLB,
          target: targetNLLB,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NLLB service error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      // 处理不同的响应格式
      let translatedText = '';
      if (result.result) {
        translatedText = result.result;
      } else if (result.translated_text) {
        translatedText = result.translated_text;
      } else if (result.translation) {
        translatedText = result.translation;
      } else if (typeof result === 'string') {
        translatedText = result;
      } else {
        throw new Error('No translation returned from NLLB service');
      }
      
      console.log(`✅ 块${chunkData.index + 1} 翻译成功 (尝试${attempt}): ${translatedText.length}字符`);
      
      return {
        index: chunkData.index,
        result: translatedText,
        status: 'success',
        attempts: attempt
      };
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;
      console.log(`❌ 块${chunkData.index + 1} 翻译失败 (尝试${attempt}): ${error.message}`);
      
      // 如果不是最后一次尝试，等待后重试
      if (attempt < PARALLEL_CONFIG.MAX_RETRIES) {
        console.log(`⏳ 块${chunkData.index + 1} 等待${PARALLEL_CONFIG.RETRY_DELAY}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, PARALLEL_CONFIG.RETRY_DELAY));
      }
    }
  }
  
  // 所有重试都失败了
  console.log(`💥 块${chunkData.index + 1} 重试次数已用完`);
  return {
    index: chunkData.index,
    result: getFallbackTranslation(chunkData.text, 'unknown', 'unknown'),
    status: 'failed',
    attempts: PARALLEL_CONFIG.MAX_RETRIES,
    error: lastError?.message || 'Unknown error'
  };
}

/**
 * 并发限制的Promise执行器
 */
async function executeWithConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  const executing: Promise<void>[] = [];
  
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    
    const promise = task().then(result => {
      results[i] = result;
    });
    
    executing.push(promise);
    
    // 如果达到并发限制，等待一个任务完成
    if (executing.length >= limit) {
      await Promise.race(executing);
      // 移除已完成的任务
      const completedIndex = executing.findIndex(p => 
        p === promise || (p as any).isResolved
      );
      if (completedIndex !== -1) {
        executing.splice(completedIndex, 1);
      }
    }
    
    // 添加启动延迟避免瞬间大量请求
    if (i < tasks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, PARALLEL_CONFIG.CHUNK_DELAY));
    }
  }
  
  // 等待所有任务完成
  await Promise.all(executing);
  
  return results;
}

/**
 * 备用翻译（当主服务完全失败时）
 */
function getFallbackTranslation(text: string, sourceLang: string, targetLang: string): string {
  const langNames: Record<string, string> = {
    'en': 'English', 'es': 'Spanish', 'fr': 'French', 'ar': 'Arabic',
    'zh': 'Chinese', 'hi': 'Hindi', 'pt': 'Portuguese', 'sw': 'Swahili',
    'te': 'Telugu', 'my': 'Burmese', 'lo': 'Lao', 'ht': 'Haitian Creole'
  };
  
  const sourceLanguage = langNames[sourceLang] || sourceLang;
  const targetLanguage = langNames[targetLang] || targetLang;
  
  return `[${targetLanguage} Translation] ${text.substring(0, 100)}${text.length > 100 ? '...' : ''} (from ${sourceLanguage})`;
}

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLang, targetLang } = await request.json();
    
    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json(
        { error: 'Missing required parameters: text, sourceLang, targetLang' },
        { status: 400 }
      );
    }

    console.log(`\n🚀 并行翻译开始: ${text.length}字符, ${sourceLang} -> ${targetLang}`);
    const startTime = Date.now();

    try {
      const sourceNLLB = getNLLBLanguageCode(sourceLang);
      const targetNLLB = getNLLBLanguageCode(targetLang);
      
      console.log(`🔄 语言代码转换: ${sourceLang} -> ${sourceNLLB}, ${targetLang} -> ${targetNLLB}`);
      
      // 智能分块 - 300字符
      const chunks = smartTextChunking(text, PARALLEL_CONFIG.MAX_CHUNK_SIZE);
      
      if (chunks.length === 1) {
        // 单块处理
        console.log(`📄 单块翻译模式`);
        const result = await translateChunkWithRetry(chunks[0], sourceNLLB, targetNLLB);
        
        const processingTime = Date.now() - startTime;
        
        return NextResponse.json({
          translatedText: result.result,
          sourceLang: sourceLang,
          targetLang: targetLang,
          characterCount: text.length,
          chunksProcessed: 1,
          service: 'nllb-parallel-300char',
          chunkSize: PARALLEL_CONFIG.MAX_CHUNK_SIZE,
          processingTime: processingTime,
          chunkResults: [{
            index: 1,
            status: result.status,
            attempts: result.attempts,
            originalLength: chunks[0].text.length,
            translatedLength: result.result.length,
            error: result.error
          }]
        });
      } else {
        // 多块并行处理
        console.log(`🚀 并行翻译模式: ${chunks.length}个块，最大并发${PARALLEL_CONFIG.CONCURRENT_LIMIT}`);
        
        // 创建翻译任务
        const translationTasks = chunks.map(chunk => 
          () => translateChunkWithRetry(chunk, sourceNLLB, targetNLLB)
        );
        
        // 执行并行翻译
        const results = await executeWithConcurrencyLimit(
          translationTasks, 
          PARALLEL_CONFIG.CONCURRENT_LIMIT
        );
        
        // 按索引排序结果
        results.sort((a, b) => a.index - b.index);
        
        // 拼接翻译结果
        const finalTranslation = results.map(r => r.result).join(' ');
        
        const processingTime = Date.now() - startTime;
        const successCount = results.filter(r => r.status === 'success').length;
        const failedCount = results.filter(r => r.status === 'failed').length;
        
        console.log(`\n✅ 并行翻译完成: ${finalTranslation.length}字符`);
        console.log(`📊 成功: ${successCount}块, 失败: ${failedCount}块, 耗时: ${processingTime}ms`);
        
        return NextResponse.json({
          translatedText: finalTranslation,
          sourceLang: sourceLang,
          targetLang: targetLang,
          characterCount: text.length,
          chunksProcessed: chunks.length,
          service: 'nllb-parallel-300char',
          chunkSize: PARALLEL_CONFIG.MAX_CHUNK_SIZE,
          processingTime: processingTime,
          successCount: successCount,
          failedCount: failedCount,
          chunkResults: results.map(r => ({
            index: r.index + 1,
            status: r.status,
            attempts: r.attempts,
            originalLength: chunks[r.index].text.length,
            translatedLength: r.result.length,
            error: r.error
          }))
        });
      }
    } catch (translationError: any) {
      console.error('Translation service error:', translationError);
      
      // 使用备用翻译
      const fallbackTranslation = getFallbackTranslation(text, sourceLang, targetLang);
      
      return NextResponse.json({
        translatedText: fallbackTranslation,
        sourceLang: sourceLang,
        targetLang: targetLang,
        characterCount: text.length,
        service: 'fallback-parallel',
        error: translationError.message
      });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
