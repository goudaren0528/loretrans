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

    // 验证必需字段
    const validation = validateRequiredFields(body, ['text', 'sourceLanguage', 'targetLanguage'])
    if (!validation.valid) {
      return apiError(
        ApiErrorCodes.MISSING_FIELDS,
        `Missing required fields: ${validation.missing.join(', ')}`,
        400,
        { missingFields: validation.missing }
      )
    }

    // 清理和验证文本
    const sanitizedText = sanitizeText(body.text)
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

    // 验证语言代码格式 (允许 auto 作为源语言)
    const langCodeRegex = /^[a-z]{2,4}$/
    if (!langCodeRegex.test(body.sourceLanguage) || !langCodeRegex.test(body.targetLanguage)) {
      return apiError(
        ApiErrorCodes.INVALID_REQUEST,
        'Invalid language code format',
        400
      )
    }

    // 获取客户端IP（用于日志记录）
    const clientIP = getClientIP(request)
    console.log(`Translation request from ${clientIP}: ${body.sourceLanguage} -> ${body.targetLanguage}`)

    // 生成缓存键
    const cacheKey = getTranslationCacheKey(sanitizedText, body.sourceLanguage, body.targetLanguage)

    // 执行翻译（带缓存）
    const translationResult = await withCache(
      cacheKey,
      () => translateText({
        text: sanitizedText,
        sourceLanguage: body.sourceLanguage,
        targetLanguage: body.targetLanguage,
      }),
      3600 // 缓存1小时
    )

    // 返回成功响应
    return apiResponse(translationResult, 200, {
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