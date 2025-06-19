import { APP_CONFIG } from '../../../config/app.config'

interface TranslationRequest {
  text: string
  sourceLanguage: string
  targetLanguage: string
}

interface TranslationResponse {
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence?: number
  processingTime: number
  method?: 'huggingface' | 'mock' | 'fallback'
}

interface HuggingFaceResponse {
  generated_text?: string
  error?: string
}

/**
 * NLLB语言代码映射
 */
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
}

/**
 * Mock翻译数据（用于开发和演示）
 */
const MOCK_TRANSLATIONS: Record<string, Record<string, string>> = {
  'ht': {
    'en': 'English translation of Haitian Creole text'
  },
  'sw': {
    'en': 'English translation of Swahili text'
  },
  'lo': {
    'en': 'English translation of Lao text'
  },
  'my': {
    'en': 'English translation of Burmese text'
  }
}

/**
 * 获取NLLB格式的语言代码
 */
function getNLLBLanguageCode(language: string): string {
  const nllbCode = NLLB_LANGUAGE_MAP[language]
  if (!nllbCode) {
    throw new Error(`Unsupported language: ${language}`)
  }
  return nllbCode
}

/**
 * 验证语言是否支持
 */
export function isSupportedLanguage(language: string): boolean {
  return language in NLLB_LANGUAGE_MAP
}

/**
 * Mock翻译函数（用于开发和测试）
 */
function mockTranslation(text: string, sourceLanguage: string, targetLanguage: string): string {
  // 如果有预定义的mock翻译，使用它
  const mockText = MOCK_TRANSLATIONS[sourceLanguage]?.[targetLanguage]
  if (mockText) {
    return `${mockText}: "${text}"`
  }

  // 否则生成通用的mock翻译
  return `[MOCK TRANSLATION] ${sourceLanguage} → ${targetLanguage}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`
}

/**
 * 检查是否应该使用mock模式
 */
function shouldUseMockMode(): boolean {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // 如果没有API key 或者明确设置了mock模式，使用mock
  return !apiKey || process.env.USE_MOCK_TRANSLATION === 'true' || 
         (isDevelopment && !apiKey)
}

/**
 * 调用Hugging Face API进行翻译
 */
async function callHuggingFaceAPI(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  if (!apiKey) {
    throw new Error('Hugging Face API key not configured')
  }

  const sourceCode = getNLLBLanguageCode(sourceLanguage)
  const targetCode = getNLLBLanguageCode(targetLanguage)
  
  // 构造NLLB格式的提示
  const prompt = `${sourceCode}: ${text} ${targetCode}:`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.nllb.timeout)

  try {
    const response = await fetch(`${APP_CONFIG.nllb.apiUrl}/${APP_CONFIG.nllb.model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: APP_CONFIG.nllb.maxLength,
          temperature: APP_CONFIG.nllb.temperature,
          do_sample: false,
          num_return_sequences: 1,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
        }
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as HuggingFaceResponse
      
      // 处理不同类型的API错误
      if (response.status === 503) {
        throw new Error('Model is loading, please try again in a few minutes')
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded, please try again later')
      } else if (response.status === 401) {
        throw new Error('Invalid API key')
      }
      
      throw new Error(`Hugging Face API error: ${response.status} ${errorData.error || response.statusText}`)
    }

    const data = await response.json() as HuggingFaceResponse[]
    
    if (!data || !Array.isArray(data) || !data[0]) {
      throw new Error('Invalid response from translation API')
    }

    const result = data[0]
    if (result.error) {
      throw new Error(`Translation API error: ${result.error}`)
    }

    if (!result.generated_text) {
      throw new Error('No translation generated')
    }

    // 提取翻译结果（移除提示部分）
    const generatedText = result.generated_text
    const targetPrefix = `${targetCode}:`
    const targetIndex = generatedText.indexOf(targetPrefix)
    
    if (targetIndex === -1) {
      // 如果找不到目标前缀，尝试直接使用生成的文本
      return generatedText.trim()
    }

    return generatedText.substring(targetIndex + targetPrefix.length).trim()

  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Fallback翻译函数（简单的基于规则的翻译）
 */
function fallbackTranslation(text: string, sourceLanguage: string, targetLanguage: string): string {
  // 这里可以实现简单的基于规则的翻译或使用其他翻译服务
  // 目前返回一个标识性的结果
  return `[FALLBACK] Translation from ${sourceLanguage} to ${targetLanguage}: ${text}`
}

/**
 * 主要翻译函数
 */
export async function translateText(request: TranslationRequest): Promise<TranslationResponse> {
  const startTime = Date.now()

  try {
    // 验证输入
    if (!request.text || request.text.trim().length === 0) {
      throw new Error('Text to translate is required')
    }

    if (request.text.length > APP_CONFIG.nllb.maxLength) {
      throw new Error(`Text too long. Maximum length is ${APP_CONFIG.nllb.maxLength} characters`)
    }

    // 验证语言支持
    if (!isSupportedLanguage(request.sourceLanguage)) {
      throw new Error(`Unsupported source language: ${request.sourceLanguage}`)
    }
    if (!isSupportedLanguage(request.targetLanguage)) {
      throw new Error(`Unsupported target language: ${request.targetLanguage}`)
    }

    // 如果源语言和目标语言相同，直接返回原文
    if (request.sourceLanguage === request.targetLanguage) {
      return {
        translatedText: request.text,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        processingTime: Date.now() - startTime,
        method: 'fallback',
      }
    }

    let translatedText: string
    let method: 'huggingface' | 'mock' | 'fallback' = 'huggingface'

    // 检查是否使用mock模式
    if (shouldUseMockMode()) {
      translatedText = mockTranslation(request.text, request.sourceLanguage, request.targetLanguage)
      method = 'mock'
      console.log('Using mock translation mode')
    } else {
      try {
        // 尝试使用Hugging Face API
        translatedText = await callHuggingFaceAPI(
          request.text,
          request.sourceLanguage,
          request.targetLanguage
        )
        method = 'huggingface'
      } catch (error) {
        console.warn('Hugging Face API failed, using fallback:', error)
        // 如果API失败，使用fallback
        translatedText = fallbackTranslation(request.text, request.sourceLanguage, request.targetLanguage)
        method = 'fallback'
      }
    }

    return {
      translatedText,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      processingTime: Date.now() - startTime,
      method,
    }
  } catch (error) {
    throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 批量翻译
 */
export async function translateBatch(
  texts: string[],
  sourceLanguage: string,
  targetLanguage: string
): Promise<TranslationResponse[]> {
  const results: TranslationResponse[] = []
  
  for (const text of texts) {
    try {
      const result = await translateText({
        text,
        sourceLanguage,
        targetLanguage,
      })
      results.push(result)
    } catch (error) {
      // 为失败的翻译添加错误信息
      results.push({
        translatedText: `[ERROR] ${error instanceof Error ? error.message : 'Translation failed'}`,
        sourceLanguage,
        targetLanguage,
        processingTime: 0,
        method: 'fallback',
      })
    }
  }
  
  return results
}

/**
 * 获取支持的语言列表
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(NLLB_LANGUAGE_MAP)
}

/**
 * 获取语言的本地名称
 */
export function getLanguageInfo(code: string) {
  const language = APP_CONFIG.languages.supported.find(lang => lang.code === code)
  return language || { code, name: code, nativeName: code, slug: code }
} 