import { NextRequest, NextResponse } from 'next/server'

// NLLB语言代码映射
const NLLB_LANGUAGE_MAP: Record<string, string> = {
  'am': 'amh_Ethi', // Amharic
  'ar': 'arb_Arab', // Arabic
  'en': 'eng_Latn', // English
  'es': 'spa_Latn', // Spanish
  'fr': 'fra_Latn', // French
  'ha': 'hau_Latn', // Hausa
  'hi': 'hin_Deva', // Hindi
  'ht': 'hat_Latn', // Haitian Creole
  'ig': 'ibo_Latn', // Igbo
  'km': 'khm_Khmr', // Khmer
  'ky': 'kir_Cyrl', // Kyrgyz
  'lo': 'lao_Laoo', // Lao
  'mg': 'plt_Latn', // Malagasy
  'mn': 'khk_Cyrl', // Mongolian
  'my': 'mya_Mymr', // Burmese
  'ne': 'npi_Deva', // Nepali
  'ps': 'pbt_Arab', // Pashto
  'pt': 'por_Latn', // Portuguese
  'sd': 'snd_Arab', // Sindhi
  'si': 'sin_Sinh', // Sinhala
  'sw': 'swh_Latn', // Swahili
  'te': 'tel_Telu', // Telugu
  'tg': 'tgk_Cyrl', // Tajik
  'xh': 'xho_Latn', // Xhosa
  'yo': 'yor_Latn', // Yoruba
  'zh': 'zho_Hans', // Chinese
  'zu': 'zul_Latn', // Zulu
};

// 获取NLLB格式的语言代码
function getNLLBLanguageCode(language: string): string {
  const nllbCode = NLLB_LANGUAGE_MAP[language];
  if (!nllbCode) {
    throw new Error(`Unsupported language: ${language}`);
  }
  return nllbCode;
}

// 智能文本分块函数
function splitTextIntoChunks(text: string, maxChunkSize: number = 1000): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  const sentences = text.split(/[.!?。！？]\s+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + sentence;
    
    if (potentialChunk.length <= maxChunkSize) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk + '.');
        currentChunk = sentence;
      } else {
        // 如果单个句子就超过限制，按段落分割
        const paragraphs = sentence.split(/\n\s*\n/);
        for (const paragraph of paragraphs) {
          if (paragraph.length <= maxChunkSize) {
            chunks.push(paragraph);
          } else {
            // 如果段落还是太长，按字符强制分割
            for (let i = 0; i < paragraph.length; i += maxChunkSize) {
              chunks.push(paragraph.substring(i, i + maxChunkSize));
            }
          }
        }
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk + '.');
  }

  return chunks.filter(chunk => chunk.trim().length > 0);
}

// 翻译单个文本块
async function translateChunk(
  text: string,
  sourceNLLB: string,
  targetNLLB: string,
  nllbServiceUrl: string,
  timeout: number
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const nllbResponse = await fetch(nllbServiceUrl, {
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

    if (!nllbResponse.ok) {
      const errorText = await nllbResponse.text();
      throw new Error(`NLLB service error: ${nllbResponse.status} - ${errorText}`);
    }

    const nllbResult = await nllbResponse.json();
    
    // 检查不同可能的响应格式
    let translatedText = null;
    if (nllbResult.translated_text) {
      translatedText = nllbResult.translated_text;
    } else if (nllbResult.translation) {
      translatedText = nllbResult.translation;
    } else if (nllbResult.result) {
      translatedText = nllbResult.result;
    } else if (typeof nllbResult === 'string') {
      translatedText = nllbResult;
    } else if (Array.isArray(nllbResult) && nllbResult.length > 0) {
      translatedText = nllbResult[0];
    }

    if (!translatedText) {
      throw new Error('No translation returned from NLLB service');
    }

    return translatedText;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLang, targetLang } = await request.json()

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json(
        { error: 'Missing required parameters: text, sourceLang, targetLang' },
        { status: 400 }
      )
    }

    console.log(`[Smart Translation] ${text.length} chars, ${sourceLang} -> ${targetLang}`)

    // 使用智能分块翻译
    try {
      const nllbServiceUrl = process.env.NLLB_SERVICE_URL || 'https://wane0528-my-nllb-api.hf.space/api/v4/translator';
      const timeout = parseInt(process.env.NLLB_SERVICE_TIMEOUT || '30000'); // 减少单个请求超时时间
      const maxChunkSize = 800; // 减少块大小以提高成功率
      
      // Convert to NLLB language codes
      const sourceNLLB = getNLLBLanguageCode(sourceLang);
      const targetNLLB = getNLLBLanguageCode(targetLang);
      
      console.log(`Converting language codes: ${sourceLang} -> ${sourceNLLB}, ${targetLang} -> ${targetNLLB}`);
      
      // 分块处理
      const chunks = splitTextIntoChunks(text, maxChunkSize);
      console.log(`Text split into ${chunks.length} chunks`);
      
      if (chunks.length === 1) {
        // 单块处理
        console.log(`Single chunk translation: ${chunks[0].length} chars`);
        const translatedText = await translateChunk(chunks[0], sourceNLLB, targetNLLB, nllbServiceUrl, timeout);
        
        return NextResponse.json({
          translated_text: translatedText,
          source_language: sourceLang,
          target_language: targetLang,
          character_count: text.length,
          service: 'nllb-huggingface',
          chunks_processed: 1
        });
      } else {
        // 多块处理
        console.log(`Multi-chunk translation: ${chunks.length} chunks`);
        const translatedChunks: string[] = [];
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          console.log(`Translating chunk ${i + 1}/${chunks.length}: ${chunk.length} chars`);
          
          try {
            const translatedChunk = await translateChunk(chunk, sourceNLLB, targetNLLB, nllbServiceUrl, timeout);
            translatedChunks.push(translatedChunk);
            
            // 添加小延迟避免API限流
            if (i < chunks.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (chunkError: any) {
            console.error(`Error translating chunk ${i + 1}:`, chunkError);
            throw new Error(`Failed to translate chunk ${i + 1}: ${chunkError.message}`);
          }
        }
        
        const finalTranslation = translatedChunks.join(' ');
        console.log(`Multi-chunk translation completed: ${finalTranslation.length} chars`);
        
        return NextResponse.json({
          translated_text: finalTranslation,
          source_language: sourceLang,
          target_language: targetLang,
          character_count: text.length,
          service: 'nllb-huggingface',
          chunks_processed: chunks.length
        });
      }

    } catch (translationError: any) {
      console.error('Translation service error:', translationError);
      
      // 如果是超时错误，返回特定错误信息
      if (translationError.name === 'AbortError') {
        return NextResponse.json({ 
          error: 'Translation service timeout. Please try again with shorter text.' 
        }, { status: 408 });
      }
      
      return NextResponse.json({ 
        error: `Translation failed: ${translationError.message}` 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Unexpected error in smart translation API:', error);
    return NextResponse.json({ 
      error: `Unexpected error: ${error.message}` 
    }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}

// 不支持的方法
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
