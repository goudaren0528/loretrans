import { NextRequest, NextResponse } from 'next/server'

// NLLB语言代码映射
const NLLB_LANGUAGE_MAP: Record<string, string> = {
  'ht': 'hat_Latn', // Haitian Creole
  'lo': 'lao_Laoo', // Lao
  'sw': 'swh_Latn', // Swahili
  'my': 'mya_Mymr', // Burmese
  'te': 'tel_Telu', // Telugu
  'si': 'sin_Sinh', // Sinhala
  'am': 'amh_Ethi', // Amharic
  'km': 'khm_Khmr', // Khmer
  'ne': 'npi_Deva', // Nepali
  'mg': 'plt_Latn', // Malagasy
  'en': 'eng_Latn', // English
  'zh': 'zho_Hans', // Chinese (Simplified)
  'fr': 'fra_Latn', // French
  'es': 'spa_Latn', // Spanish
  'pt': 'por_Latn', // Portuguese
  'ar': 'arb_Arab', // Arabic
  'hi': 'hin_Deva', // Hindi
  'ja': 'jpn_Jpan', // Japanese
  'ko': 'kor_Hang', // Korean
  'de': 'deu_Latn', // German
  'it': 'ita_Latn', // Italian
  'ru': 'rus_Cyrl', // Russian
  'th': 'tha_Thai', // Thai
  'vi': 'vie_Latn', // Vietnamese
};

// 智能文本分块函数
function smartTextChunking(text: string, maxChunkSize = 400): string[] {
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
          
          // 处理超长句子 - 强制分割
          if (sentence.length > maxChunkSize) {
            const words = sentence.split(' ');
            let subChunk = '';
            for (const word of words) {
              if ((subChunk + ' ' + word).length <= maxChunkSize) {
                subChunk += (subChunk ? ' ' : '') + word;
              } else {
                if (subChunk) chunks.push(subChunk);
                subChunk = word;
              }
            }
            if (subChunk) chunks.push(subChunk);
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
  
  console.log(`✅ 分块完成: ${chunks.length}个块`);
  return chunks.filter(chunk => chunk.trim().length > 0);
}

// 长文本翻译函数
async function translateLongText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const chunks = smartTextChunking(text, 400);
  const translatedChunks: string[] = [];
  
  console.log(`📚 多块翻译模式: ${chunks.length}个块`);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`📖 处理块 ${i + 1}/${chunks.length}: ${chunk.length}字符`);
    
    try {
      const translatedChunk = await translateWithRetry(chunk, sourceLang, targetLang);
      translatedChunks.push(translatedChunk);
      console.log(`✅ 翻译成功: ${translatedChunk.length}字符`);
      
      // 块间延迟，避免API限制
      if (i < chunks.length - 1) {
        console.log(`⏳ 块间延迟 1000ms...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`❌ 块 ${i + 1} 翻译失败:`, error);
      throw error;
    }
  }
  
  const result = translatedChunks.join(' ');
  console.log(`✅ 多块翻译完成: ${result.length}字符`);
  return result;
}

// 获取NLLB格式的语言代码
function getNLLBLanguageCode(langCode: string): string {
  return NLLB_LANGUAGE_MAP[langCode] || langCode;
}

// 备用翻译服务列表
const TRANSLATION_SERVICES = [
  {
    name: 'NLLB-Primary',
    url: 'https://wane0528-my-nllb-api.hf.space/api/v4/translator',
    timeout: 30000
  },
  {
    name: 'NLLB-Backup',
    url: 'https://huggingface.co/spaces/facebook/nllb-translation',
    timeout: 45000
  }
];

// 调用翻译服务（带重试机制）
async function translateWithRetry(text: string, sourceLang: string, targetLang: string, maxRetries = 2) {
  let lastError: Error | null = null;
  
  for (const service of TRANSLATION_SERVICES) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Translation] Attempting ${service.name} (attempt ${attempt + 1})`);
        
        const result = await translateWithService(text, sourceLang, targetLang, service);
        
        console.log(`[Translation] Success with ${service.name}`);
        return result;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`[Translation] ${service.name} attempt ${attempt + 1} failed:`, lastError.message);
        
        // 如果不是最后一次尝试，等待一下再重试
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
  }
  
  throw lastError || new Error('All translation services failed');
}

// 调用特定翻译服务
async function translateWithService(text: string, sourceLang: string, targetLang: string, service: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), service.timeout);

  try {
    const requestBody = {
      text: text,
      source: getNLLBLanguageCode(sourceLang),
      target: getNLLBLanguageCode(targetLang),
    };

    console.log(`[Translation] Request to ${service.name}:`, requestBody);

    const response = await fetch(service.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Translation-Service/1.0',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`[Translation] ${service.name} response status:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Translation] ${service.name} error response:`, errorText);
      throw new Error(`${service.name} API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`[Translation] ${service.name} response data:`, data);
    
    // 尝试不同的响应字段
    const translatedText = data.result || data.translated_text || data.translation || data.output;
    
    if (!translatedText) {
      throw new Error(`No translation result found in response: ${JSON.stringify(data)}`);
    }

    return translatedText;

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`${service.name} timeout after ${service.timeout}ms`);
      }
      throw error;
    }
    throw new Error(`Unknown ${service.name} error`);
  }
}

// 简单翻译备用方案（基于字典）
function getSimpleTranslation(text: string, sourceLang: string, targetLang: string): string | null {
  // 简单的常用词汇翻译
  const simpleTranslations: Record<string, Record<string, string>> = {
    'en-zh': {
      'hello': '你好',
      'goodbye': '再见',
      'thank you': '谢谢',
      'yes': '是',
      'no': '不',
      'please': '请',
      'sorry': '对不起',
    },
    'zh-en': {
      '你好': 'hello',
      '再见': 'goodbye',
      '谢谢': 'thank you',
      '是': 'yes',
      '不': 'no',
      '请': 'please',
      '对不起': 'sorry',
    }
  };

  const key = `${sourceLang}-${targetLang}`;
  const translations = simpleTranslations[key];
  
  if (translations) {
    const lowerText = text.toLowerCase().trim();
    return translations[lowerText] || null;
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { text, sourceLang, targetLang } = body;

    console.log('[Translation API] Request received:', {
      textLength: text?.length,
      sourceLang,
      targetLang,
      timestamp: new Date().toISOString()
    });

    // 验证输入
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { 
          error: 'Text is required and must be a string',
          success: false,
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      );
    }

    if (!sourceLang || !targetLang) {
      return NextResponse.json(
        { 
          error: 'Source and target languages are required',
          success: false,
          code: 'MISSING_LANGUAGES'
        },
        { status: 400 }
      );
    }

    // 如果源语言和目标语言相同，直接返回原文
    if (sourceLang === targetLang) {
      return NextResponse.json({
        success: true,
        translatedText: text,
        sourceLang,
        targetLang,
        characterCount: text.length,
        isFree: true,
        processingTime: Date.now() - startTime,
        method: 'same-language'
      });
    }

    // 文本长度限制 - 5000字符以下免费
    const maxFreeLength = 5000;
    if (text.length > maxFreeLength) {
      return NextResponse.json(
        { 
          error: 'Text too long for free translation. Please register to translate longer texts.',
          maxLength: maxFreeLength,
          currentLength: text.length,
          requiresLogin: true,
          success: false,
          code: 'TEXT_TOO_LONG'
        },
        { status: 400 }
      );
    }

    let translatedText: string;
    let method = 'api';

    try {
      // 对于长文本（超过800字符），使用分块处理
      if (text.length > 800) {
        console.log(`[Translation API] 长文本分块处理: ${text.length}字符`);
        translatedText = await translateLongText(text, sourceLang, targetLang);
        method = 'chunked-api';
      } else {
        // 短文本直接翻译
        translatedText = await translateWithRetry(text, sourceLang, targetLang);
      }
    } catch (apiError) {
      console.error('[Translation API] All API services failed:', apiError);
      
      // 尝试简单翻译备用方案
      const simpleResult = getSimpleTranslation(text, sourceLang, targetLang);
      if (simpleResult) {
        translatedText = simpleResult;
        method = 'dictionary';
        console.log('[Translation API] Using dictionary fallback');
      } else {
        // 如果所有方法都失败，返回详细错误信息
        return NextResponse.json(
          { 
            error: 'Translation service temporarily unavailable. Please try again later.',
            details: apiError instanceof Error ? apiError.message : 'Unknown error',
            success: false,
            code: 'SERVICE_UNAVAILABLE',
            retryAfter: 60
          },
          { status: 503 }
        );
      }
    }

    const response = {
      success: true,
      translatedText,
      sourceLang,
      targetLang,
      characterCount: text.length,
      isFree: true,
      processingTime: Date.now() - startTime,
      method
    };

    console.log('[Translation API] Success:', {
      method,
      processingTime: response.processingTime,
      characterCount: response.characterCount
    });

    return NextResponse.json(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('[Translation API] Unexpected error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : 
          'Please try again later',
        success: false,
        code: 'INTERNAL_ERROR',
        processingTime
      },
      { status: 500 }
    );
  }
}

// 支持CORS预检请求
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// 健康检查端点
export async function GET(request: NextRequest) {
  try {
    // 测试翻译服务是否可用
    const testResult = await translateWithService(
      'test', 
      'en', 
      'zh', 
      TRANSLATION_SERVICES[0]
    ).catch(() => null);

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        primary: testResult ? 'available' : 'unavailable',
        fallback: 'available'
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}