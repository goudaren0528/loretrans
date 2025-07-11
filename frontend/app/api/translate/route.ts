import { NextRequest, NextResponse } from 'next/server'

// 增强的翻译服务配置 - 300字符分块
const ENHANCED_CONFIG = {
  MAX_CHUNK_SIZE: 300,        // 减少到300字符提高成功率
  MAX_RETRIES: 3,             // 每个块最多重试3次
  RETRY_DELAY: 1000,          // 重试延迟1秒
  CHUNK_DELAY: 500,           // 块间延迟500ms
  REQUEST_TIMEOUT: 25000,     // 请求超时25秒
  CONCURRENT_CHUNKS: 1        // 顺序处理，避免限流
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
 * 智能文本分块 - 300字符优化版本
 * 优先级: 段落边界 > 句子边界 > 逗号边界 > 词汇边界
 */
function smartTextChunking(text: string, maxChunkSize: number = ENHANCED_CONFIG.MAX_CHUNK_SIZE): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
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
  
  const finalChunks = chunks.filter(chunk => chunk.trim().length > 0);
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
 * 带重试机制的翻译函数
 */
async function translateWithRetry(text: string, sourceNLLB: string, targetNLLB: string, retryCount: number = 0): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ENHANCED_CONFIG.REQUEST_TIMEOUT);
  
  try {
    console.log(`🔄 翻译请求 (尝试 ${retryCount + 1}/${ENHANCED_CONFIG.MAX_RETRIES + 1}): ${text.length}字符`);
    
    const response = await fetch(NLLB_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text: text,
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
    
    console.log(`✅ 翻译成功: ${translatedText.length}字符`);
    return translatedText;
    
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.log(`❌ 翻译失败 (尝试 ${retryCount + 1}): ${error.message}`);
    
    // 检查是否需要重试
    if (retryCount < ENHANCED_CONFIG.MAX_RETRIES) {
      console.log(`⏳ ${ENHANCED_CONFIG.RETRY_DELAY}ms后重试...`);
      await new Promise(resolve => setTimeout(resolve, ENHANCED_CONFIG.RETRY_DELAY));
      return translateWithRetry(text, sourceNLLB, targetNLLB, retryCount + 1);
    } else {
      console.log(`💥 重试次数已用完，抛出错误`);
      throw error;
    }
  }
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

    console.log(`\n🌍 增强翻译开始: ${text.length}字符, ${sourceLang} -> ${targetLang}`);

    try {
      const sourceNLLB = getNLLBLanguageCode(sourceLang);
      const targetNLLB = getNLLBLanguageCode(targetLang);
      
      console.log(`🔄 语言代码转换: ${sourceLang} -> ${sourceNLLB}, ${targetLang} -> ${targetNLLB}`);
      
      // 智能分块 - 300字符
      const chunks = smartTextChunking(text, ENHANCED_CONFIG.MAX_CHUNK_SIZE);
      
      if (chunks.length === 1) {
        // 单块处理
        console.log(`📄 单块翻译模式`);
        const translatedText = await translateWithRetry(chunks[0], sourceNLLB, targetNLLB);
        
        return NextResponse.json({
          translatedText: translatedText,
          sourceLang: sourceLang,
          targetLang: targetLang,
          characterCount: text.length,
          chunksProcessed: 1,
          service: 'nllb-enhanced-300char',
          chunkSize: ENHANCED_CONFIG.MAX_CHUNK_SIZE
        });
      } else {
        // 多块处理
        console.log(`📚 多块翻译模式: ${chunks.length}个块`);
        const translatedChunks: string[] = [];
        const chunkResults: any[] = [];
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          console.log(`\n📖 处理块 ${i + 1}/${chunks.length}: ${chunk.length}字符`);
          
          try {
            const chunkResult = await translateWithRetry(chunk, sourceNLLB, targetNLLB);
            translatedChunks.push(chunkResult);
            chunkResults.push({ 
              index: i + 1, 
              status: 'success', 
              originalLength: chunk.length,
              translatedLength: chunkResult.length 
            });
          } catch (chunkError: any) {
            console.log(`⚠️ 块 ${i + 1} 翻译失败，使用备用翻译`);
            const fallbackChunk = getFallbackTranslation(chunk, sourceLang, targetLang);
            translatedChunks.push(fallbackChunk);
            chunkResults.push({ 
              index: i + 1, 
              status: 'fallback', 
              originalLength: chunk.length,
              error: chunkError.message 
            });
          }
          
          // 块间延迟避免限流
          if (i < chunks.length - 1) {
            console.log(`⏳ 块间延迟 ${ENHANCED_CONFIG.CHUNK_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, ENHANCED_CONFIG.CHUNK_DELAY));
          }
        }
        
        const finalTranslation = translatedChunks.join(' ');
        
        console.log(`\n✅ 多块翻译完成: ${finalTranslation.length}字符`);
        
        return NextResponse.json({
          translatedText: finalTranslation,
          sourceLang: sourceLang,
          targetLang: targetLang,
          characterCount: text.length,
          chunksProcessed: chunks.length,
          chunkResults: chunkResults,
          service: 'nllb-enhanced-300char',
          chunkSize: ENHANCED_CONFIG.MAX_CHUNK_SIZE
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
        service: 'fallback-enhanced',
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