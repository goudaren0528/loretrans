import { APP_CONFIG } from '../../../config/app.config'
import { TranslationRequest } from '../../../shared/types'
import { translateWithResilience, getTranslationServiceStatus } from './translation-resilience'

interface TranslationResponse {
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence?: number
  processingTime: number
  method?: 'nllb-local' | 'huggingface' | 'mock' | 'fallback'
  fallbackUsed?: boolean
  retryCount?: number
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
 * 检查是否应该使用mock模式
 */
function shouldUseMockMode(): boolean {
  // 强制禁用MOCK模式 - 始终使用真实翻译
  console.log('DEBUG: Mock mode forcibly disabled - using real translation with resilience')
  return false
}

/**
 * 主要翻译函数 - 使用容错机制
 */
export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  options?: {
    priority?: 'speed' | 'quality'
    timeout?: number
    retries?: number
    enableCache?: boolean
  }
): Promise<TranslationResponse> {
  console.log(`[translateText] Starting translation: ${sourceLanguage} → ${targetLanguage}, ${text.length} chars`)
  
  // 验证输入参数
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty')
  }

  if (!isSupportedLanguage(sourceLanguage)) {
    throw new Error(`Unsupported source language: ${sourceLanguage}`)
  }

  if (!isSupportedLanguage(targetLanguage)) {
    throw new Error(`Unsupported target language: ${targetLanguage}`)
  }

  // 检查文本长度限制
  if (text.length > APP_CONFIG.nllb.maxLength) {
    throw new Error(`Text too long. Maximum ${APP_CONFIG.nllb.maxLength} characters allowed, got ${text.length}`)
  }

  try {
    // 使用容错翻译服务
    console.log('[translateText] Using resilient translation service')
    
    const result = await translateWithResilience(
      text,
      sourceLanguage,
      targetLanguage,
      {
        priority: options?.priority || 'quality',
        timeout: options?.timeout || 30000,
        retries: options?.retries || 3
      }
    )

    console.log(`[translateText] Translation completed: method=${result.method}, time=${result.processingTime}ms, fallback=${result.fallbackUsed}`)

    return {
      translatedText: result.translatedText,
      sourceLanguage: result.sourceLanguage,
      targetLanguage: result.targetLanguage,
      confidence: result.confidence,
      processingTime: result.processingTime,
      method: result.method,
      fallbackUsed: result.fallbackUsed,
      retryCount: result.retryCount
    }

  } catch (error) {
    console.error('[translateText] Translation failed:', error)
    
    // 记录翻译失败的详细信息
    const errorDetails = {
      sourceLanguage,
      targetLanguage,
      textLength: text.length,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
    
    console.error('[translateText] Error details:', errorDetails)
    
    throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 批量翻译函数
 */
export async function translateBatch(
  texts: string[],
  sourceLanguage: string,
  targetLanguage: string,
  options?: {
    priority?: 'speed' | 'quality'
    timeout?: number
    retries?: number
    concurrency?: number
  }
): Promise<TranslationResponse[]> {
  console.log(`[translateBatch] Starting batch translation: ${texts.length} texts`)
  
  if (!texts || texts.length === 0) {
    return []
  }

  const concurrency = options?.concurrency || 3
  const results: TranslationResponse[] = []
  
  // 分批处理以控制并发
  for (let i = 0; i < texts.length; i += concurrency) {
    const batch = texts.slice(i, i + concurrency)
    
    const batchPromises = batch.map(text => 
      translateText(text, sourceLanguage, targetLanguage, options)
    )
    
    try {
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    } catch (error) {
      console.error(`[translateBatch] Batch ${i}-${i + batch.length} failed:`, error)
      throw error
    }
  }
  
  console.log(`[translateBatch] Batch translation completed: ${results.length} results`)
  return results
}

/**
 * 获取翻译服务状态
 */
export function getTranslationStatus() {
  return getTranslationServiceStatus()
}

/**
 * 语言检测函数（简化版）
 */
export async function detectLanguage(text: string): Promise<string> {
  // 简单的语言检测逻辑
  // 在实际应用中，这里应该调用专门的语言检测服务
  
  if (!text || text.trim().length === 0) {
    return 'en' // 默认英语
  }

  // 基于字符集的简单检测
  if (/[\u4e00-\u9fff]/.test(text)) {
    return 'zh' // 中文
  } else if (/[\u0600-\u06ff]/.test(text)) {
    return 'ar' // 阿拉伯语
  } else if (/[\u1000-\u109f]/.test(text)) {
    return 'my' // 缅甸语
  } else if (/[\u0e80-\u0eff]/.test(text)) {
    return 'lo' // 老挝语
  } else if (/[\u0c00-\u0c7f]/.test(text)) {
    return 'te' // 泰卢固语
  }
  
  // 默认返回英语
  return 'en'
}

/**
 * 翻译质量评估（简化版）
 */
export function assessTranslationQuality(
  originalText: string,
  translatedText: string,
  sourceLanguage: string,
  targetLanguage: string
): {
  score: number
  issues: string[]
  suggestions: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 1.0

  // 基本质量检查
  if (!translatedText || translatedText.trim().length === 0) {
    issues.push('Empty translation result')
    score = 0
  } else if (translatedText === originalText) {
    issues.push('Translation identical to source')
    score = 0.3
  } else if (translatedText.includes('[FALLBACK TRANSLATION]')) {
    issues.push('Fallback translation used')
    score = 0.5
    suggestions.push('Consider retrying with primary service')
  } else if (translatedText.includes('[MOCK TRANSLATION]')) {
    issues.push('Mock translation used')
    score = 0.2
    suggestions.push('Check translation service availability')
  }

  // 长度检查
  const lengthRatio = translatedText.length / originalText.length
  if (lengthRatio < 0.3 || lengthRatio > 3) {
    issues.push('Unusual length ratio between source and target')
    score *= 0.8
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    issues,
    suggestions
  }
}

/**
 * 调用本地NLLB服务进行翻译
 */
async function callLocalNLLBAPI(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  const localConfig = APP_CONFIG.nllb.localService
  
  if (!localConfig.enabled) {
    throw new Error('Local NLLB service is not enabled')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), localConfig.timeout)

  try {
    console.log('DEBUG: Calling NLLB service with:', {
      url: `${localConfig.url}/translate`,
      text,
      sourceLanguage,
      targetLanguage
    })

    const response = await fetch(`${localConfig.url}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage,
      }),
      signal: controller.signal,
    })

    console.log('DEBUG: NLLB response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('DEBUG: NLLB error response:', errorText)
      throw new Error(`Local NLLB API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log('DEBUG: NLLB response data:', data)
    
    if (!data.translatedText) {
      throw new Error('No translation returned from local service')
    }

    return data.translatedText

  } catch (error) {
    console.error('DEBUG: NLLB call failed:', error)
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
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
    if (request.sourceLanguage && !isSupportedLanguage(request.sourceLanguage)) {
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

    let translatedText: string = ''
    let method: 'nllb-local' | 'huggingface' | 'mock' | 'fallback' = 'huggingface'

    // 检查是否使用mock模式
    if (shouldUseMockMode()) {
      translatedText = mockTranslation(request.text, request.sourceLanguage || 'auto', request.targetLanguage)
      method = 'mock'
      console.log('Using mock translation mode')
    } else {
      // 优先尝试本地NLLB服务
      const localConfig = APP_CONFIG.nllb.localService
      let useLocalService = localConfig.enabled

      if (useLocalService) {
        try {
          console.log('DEBUG: Attempting to call local NLLB service...')
          console.log('DEBUG: URL:', localConfig.url)
          console.log('DEBUG: Request:', { text: request.text, sourceLanguage: request.sourceLanguage || 'auto', targetLanguage: request.targetLanguage })
          
          translatedText = await callLocalNLLBAPI(
            request.text,
            request.sourceLanguage || 'auto',
            request.targetLanguage
          )
          method = 'nllb-local'
          console.log('DEBUG: Local NLLB service success:', translatedText)
        } catch (error) {
          console.error('DEBUG: Local NLLB service failed:', error)
          console.error('DEBUG: Error details:', error.message)
          useLocalService = false
          
          // 如果不允许fallback到HuggingFace，直接抛出错误
          if (!localConfig.fallbackToHuggingFace) {
            throw error
          }
        }
      }

      // 如果本地服务不可用或失败，尝试Hugging Face API
      if (!useLocalService) {
        try {
          translatedText = await callHuggingFaceAPI(
            request.text,
            request.sourceLanguage || 'auto',
            request.targetLanguage
          )
          method = 'huggingface'
          console.log('Using Hugging Face API')
        } catch (error) {
          console.warn('Hugging Face API failed, using fallback:', error)
          // 如果API失败，使用fallback
          translatedText = fallbackTranslation(request.text, request.sourceLanguage || 'auto', request.targetLanguage)
          method = 'fallback'
        }
      }
    }

    return {
      translatedText,
      sourceLanguage: request.sourceLanguage || 'auto',
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
  const translations = await Promise.all(
    texts.map(async (text) => {
      try {
        const response = await translateText({ text, sourceLanguage, targetLanguage });
        return response;
      } catch (error) {
        console.error(`Batch translation error for text: "${text}"`, error);
        // For batch operations, we might want to return a partial success
        // with an error message instead of throwing.
        return {
          translatedText: '',
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage,
          processingTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        } as TranslationResponse;
      }
    })
  );

  return translations;
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