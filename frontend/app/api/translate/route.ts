import { NextRequest } from 'next/server'
import { translateText } from '@/lib/services/translation'
import { getTranslationCacheKey, withCache } from '@/lib/services/cache'
import { 
  apiResponse, 
  apiError, 
  validateMethod, 
  parseRequestBody, 
  validateRequiredFields,
  validateTextLength,
  sanitizeText,
  getClientIP,
  ApiErrorCodes 
} from '@/lib/api-utils'

interface TranslateRequest {
  text: string
  sourceLanguage: string
  targetLanguage: string
  // 双向翻译增强参数
  mode?: 'single' | 'bidirectional' | 'batch' | 'auto-direction'
  options?: {
    enableCache?: boolean
    enableFallback?: boolean
    priority?: 'speed' | 'quality'
    format?: 'text' | 'structured'
    autoDetectDirection?: boolean // 智能检测翻译方向
  }
  // 批量翻译支持
  texts?: string[]
}

export async function POST(request: NextRequest) {
  try {
    // 验证请求方法
    if (!validateMethod(request, ['POST'])) {
      return apiError(
        ApiErrorCodes.METHOD_NOT_ALLOWED,
        'Only POST method is allowed',
        405
      )
    }

    // 解析请求体
    let body: TranslateRequest
    try {
      body = await parseRequestBody<TranslateRequest>(request)
    } catch (error) {
      return apiError(
        ApiErrorCodes.INVALID_JSON,
        'Invalid JSON in request body',
        400
      )
    }

    // 确定操作模式
    const mode = body.mode || 'single'
    const options = body.options || {}

    // 根据模式验证不同的字段
    if (mode === 'batch') {
      if (!body.texts || !Array.isArray(body.texts) || body.texts.length === 0) {
        return apiError(
          ApiErrorCodes.INVALID_REQUEST,
          'Batch mode requires a non-empty texts array',
          400
        )
      }
      if (body.texts.length > 10) {
        return apiError(
          ApiErrorCodes.INVALID_REQUEST,
          'Maximum 10 texts allowed per batch request',
          400
        )
      }
    } else {
      // 单个或双向翻译验证
    const validation = validateRequiredFields(body, ['text', 'sourceLanguage', 'targetLanguage'])
    if (!validation.valid) {
      return apiError(
        ApiErrorCodes.MISSING_FIELDS,
        `Missing required fields: ${validation.missing.join(', ')}`,
        400,
        { missingFields: validation.missing }
      )
    }
    }

    // 验证和清理文本（仅对非批量模式）
    let sanitizedText: string = ''
    if (mode !== 'batch') {
      sanitizedText = sanitizeText(body.text || '')
    if (!sanitizedText) {
      return apiError(
        ApiErrorCodes.INVALID_REQUEST,
        'Text cannot be empty',
        400
      )
    }

    // 验证文本长度
    const lengthValidation = validateTextLength(sanitizedText, 1000)
    if (!lengthValidation.valid) {
      return apiError(
        ApiErrorCodes.TEXT_TOO_LONG,
        `Text is too long. Maximum ${1000} characters allowed, got ${lengthValidation.length}`,
        400,
        { 
          maxLength: 1000, 
          actualLength: lengthValidation.length 
        }
      )
      }
    }

    // 获取客户端IP（用于日志记录）
    const clientIP = getClientIP(request)
    
    // 智能方向检测和语言代码处理
    let actualSourceLang = body.sourceLanguage
    let actualTargetLang = body.targetLanguage
    let directionSwitched = false

    // 处理自动语言检测
    if (body.sourceLanguage === 'auto' || mode === 'auto-direction' || options.autoDetectDirection) {
      // 使用语言检测API来确定源语言
      try {
        const { detectLanguage } = await import('@/lib/services/language-detection')
        const detectedResult = detectLanguage(sanitizedText)
        
        if (detectedResult.language !== 'unknown' && detectedResult.confidence > 0.3) {
          actualSourceLang = detectedResult.language
          console.log(`Auto-detected source language: ${actualSourceLang} (confidence: ${detectedResult.confidence})`)
          
          // 如果检测到的语言与目标语言相同，可能需要切换方向
          if (actualSourceLang === body.targetLanguage && body.targetLanguage !== 'en') {
            actualTargetLang = 'en'
            directionSwitched = true
            console.log(`Auto-switched translation direction: ${actualSourceLang} -> ${actualTargetLang}`)
          }
        } else {
          // 如果检测失败，默认使用英语
          actualSourceLang = 'en'
          console.warn('Language detection failed or low confidence, defaulting to English')
        }
      } catch (error) {
        console.warn('Language detection failed, defaulting to English:', error)
        actualSourceLang = 'en'
      }
    }

    // 验证语言代码格式（现在actualSourceLang不应该是auto了）
    const langCodeRegex = /^[a-z]{2,4}$/
    if (!langCodeRegex.test(actualSourceLang) || !langCodeRegex.test(actualTargetLang)) {
      return apiError(
        ApiErrorCodes.INVALID_REQUEST,
        'Invalid language code format',
        400
      )
    }

    console.log(`Translation request from ${clientIP}: ${actualSourceLang} -> ${actualTargetLang}`)

    // 生成缓存键
    const cacheKey = getTranslationCacheKey(sanitizedText, actualSourceLang, actualTargetLang)

    // 根据模式执行不同的翻译逻辑
    let translationResult: any

    if (mode === 'batch') {
      // 批量翻译
      const { translateBatch } = await import('@/lib/services/translation')
      const sanitizedTexts = body.texts!.map(text => sanitizeText(text)).filter(Boolean)
      
      console.log(`Batch translation request: ${sanitizedTexts.length} texts, ${body.sourceLanguage} -> ${body.targetLanguage}`)

      translationResult = await translateBatch(
        sanitizedTexts,
        actualSourceLang,
        actualTargetLang
      )
      
    } else if (mode === 'bidirectional') {
      // 双向翻译：同时获得正向和反向翻译
      const cacheKeyReverse = getTranslationCacheKey(sanitizedText, actualTargetLang, actualSourceLang)
      
      const [forwardResult, reverseResult] = await Promise.all([
        options.enableCache !== false ? 
          withCache(cacheKey, () => translateText({
        text: sanitizedText,
            sourceLanguage: actualSourceLang,
            targetLanguage: actualTargetLang,
          }), 3600) :
          translateText({
            text: sanitizedText,
            sourceLanguage: actualSourceLang,
            targetLanguage: actualTargetLang,
          }),
        
        // 反向翻译（用翻译结果作为输入）
        options.enableCache !== false ?
          withCache(cacheKeyReverse, () => translateText({
            text: sanitizedText, // 先用原文预翻译
            sourceLanguage: actualTargetLang,
            targetLanguage: actualSourceLang,
          }), 3600) :
          translateText({
            text: sanitizedText,
            sourceLanguage: actualTargetLang,
            targetLanguage: actualSourceLang,
          })
      ])
      
      translationResult = {
        forward: forwardResult,
        reverse: reverseResult,
        mode: 'bidirectional'
      }
      
    } else {
      // 单向翻译（默认模式）
      translationResult = options.enableCache !== false ?
        await withCache(cacheKey, () => translateText({
          text: sanitizedText,
          sourceLanguage: actualSourceLang,
          targetLanguage: actualTargetLang,
        }), 3600) :
        await translateText({
          text: sanitizedText,
          sourceLanguage: actualSourceLang,
          targetLanguage: actualTargetLang,
        })
    }

    // 构建响应数据，包含方向切换信息
    const responseData = {
      ...translationResult,
      metadata: {
        originalSourceLanguage: body.sourceLanguage,
        originalTargetLanguage: body.targetLanguage,
        actualSourceLanguage: actualSourceLang,
        actualTargetLanguage: actualTargetLang,
        directionSwitched,
        mode,
        ...(mode === 'auto-direction' || options.autoDetectDirection ? {
          autoDetection: true
        } : {})
      }
    }

    // 返回成功响应
    return apiResponse(responseData, 200, {
      'Cache-Control': 'public, max-age=3600', // 缓存1小时
    })

  } catch (error) {
    console.error('Translation API error:', error)
    
    // 处理特定的翻译错误
    if (error instanceof Error) {
      if (error.message.includes('Unsupported language')) {
        return apiError(
          ApiErrorCodes.UNSUPPORTED_LANGUAGE,
          error.message,
          400
        )
      }
      
      if (error.message.includes('API key not configured')) {
        return apiError(
          ApiErrorCodes.INTERNAL_ERROR,
          'Translation service temporarily unavailable',
          503
        )
      }

      if (error.message.includes('Translation failed')) {
        return apiError(
          ApiErrorCodes.TRANSLATION_FAILED,
          'Failed to translate text. Please try again.',
          500
        )
      }
    }

    // 通用错误响应
    return apiError(
      ApiErrorCodes.INTERNAL_ERROR,
      'An unexpected error occurred',
      500
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
} 