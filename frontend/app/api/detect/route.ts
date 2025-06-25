import { NextRequest } from 'next/server'
import { detectLanguage, detectLanguageMultiple } from '@/lib/services/language-detection'
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

interface DetectRequest {
  text: string
  multiple?: boolean // 是否返回多个候选语言
  limit?: number     // 返回候选语言的数量
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
    let body: DetectRequest
    try {
      body = await parseRequestBody<DetectRequest>(request)
    } catch (error) {
      return apiError(
        ApiErrorCodes.INVALID_JSON,
        'Invalid JSON in request body',
        400
      )
    }

    // 验证必需字段
    const validation = validateRequiredFields(body, ['text'])
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

    // 验证文本长度（检测允许更长的文本）
    const lengthValidation = validateTextLength(sanitizedText, 2000)
    if (!lengthValidation.valid) {
      return apiError(
        ApiErrorCodes.TEXT_TOO_LONG,
        `Text is too long. Maximum ${2000} characters allowed, got ${lengthValidation.length}`,
        400,
        { 
          maxLength: 2000, 
          actualLength: lengthValidation.length 
        }
      )
    }

    // 获取客户端IP（用于日志记录）
    const clientIP = getClientIP(request)
    console.log(`[POST /api/detect] Language detection request from ${clientIP}`)

    // 执行语言检测
    let detectionResult
    
    if (body.multiple) {
      const limit = body.limit && body.limit > 0 && body.limit <= 10 ? body.limit : 3
      const results = detectLanguageMultiple(sanitizedText, limit)
      detectionResult = {
        candidates: results,
        primary: results[0] || { language: 'unknown', confidence: 0, languageName: 'Unknown' },
        textLength: Array.from(sanitizedText).length,
      }
    } else {
      const result = detectLanguage(sanitizedText)
      detectionResult = {
        language: result.language,
        confidence: result.confidence,
        languageName: result.languageName,
        textLength: Array.from(sanitizedText).length,
      }
    }

    // 返回成功响应
    return apiResponse(detectionResult, 200, {
      'Cache-Control': 'public, max-age=1800', // 缓存30分钟
    })

  } catch (error) {
    console.error('Language detection API error:', error)
    
    // 通用错误响应
    return apiError(
      ApiErrorCodes.INTERNAL_ERROR,
      'An unexpected error occurred during language detection',
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