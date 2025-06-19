import { NextRequest } from 'next/server'
import { generateSpeech, sanitizeTextForTTS, isTTSSupported, getVoiceOptions } from '@/lib/services/tts'
import { 
  apiResponse, 
  apiError, 
  validateMethod, 
  parseRequestBody, 
  validateRequiredFields,
  validateTextLength,
  getClientIP,
  ApiErrorCodes 
} from '@/lib/api-utils'

interface TTSRequest {
  text: string
  language: string
  voice?: string
  rate?: number  // 语速 0.5-2.0
  pitch?: number // 音调 0.5-2.0
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
    let body: TTSRequest
    try {
      body = await parseRequestBody<TTSRequest>(request)
    } catch (error) {
      return apiError(
        ApiErrorCodes.INVALID_JSON,
        'Invalid JSON in request body',
        400
      )
    }

    // 验证必需字段
    const validation = validateRequiredFields(body, ['text', 'language'])
    if (!validation.valid) {
      return apiError(
        ApiErrorCodes.MISSING_FIELDS,
        `Missing required fields: ${validation.missing.join(', ')}`,
        400,
        { missingFields: validation.missing }
      )
    }

    // 清理和验证文本
    const sanitizedText = sanitizeTextForTTS(body.text)
    if (!sanitizedText) {
      return apiError(
        ApiErrorCodes.INVALID_REQUEST,
        'Text cannot be empty',
        400
      )
    }

    // 验证文本长度（TTS有更严格的限制）
    const lengthValidation = validateTextLength(sanitizedText, 500)
    if (!lengthValidation.valid) {
      return apiError(
        ApiErrorCodes.TEXT_TOO_LONG,
        `Text is too long for TTS. Maximum ${500} characters allowed, got ${lengthValidation.length}`,
        400,
        { 
          maxLength: 500, 
          actualLength: lengthValidation.length 
        }
      )
    }

    // 验证语言代码格式
    const langCodeRegex = /^[a-z]{2,3}$/
    if (!langCodeRegex.test(body.language)) {
      return apiError(
        ApiErrorCodes.INVALID_REQUEST,
        'Invalid language code format',
        400
      )
    }

    // 验证语音参数
    if (body.rate !== undefined && (body.rate < 0.5 || body.rate > 2.0)) {
      return apiError(
        ApiErrorCodes.INVALID_REQUEST,
        'Speech rate must be between 0.5 and 2.0',
        400
      )
    }

    if (body.pitch !== undefined && (body.pitch < 0.5 || body.pitch > 2.0)) {
      return apiError(
        ApiErrorCodes.INVALID_REQUEST,
        'Speech pitch must be between 0.5 and 2.0',
        400
      )
    }

    // 验证语音选项
    if (body.voice) {
      const availableVoices = getVoiceOptions(body.language)
      const isValidVoice = availableVoices.some(voice => voice.code === body.voice)
      if (!isValidVoice) {
        return apiError(
          ApiErrorCodes.INVALID_REQUEST,
          `Invalid voice for language ${body.language}`,
          400,
          { 
            availableVoices: availableVoices.map(v => ({ code: v.code, name: v.name }))
          }
        )
      }
    }

    // 获取客户端IP（用于日志记录）
    const clientIP = getClientIP(request)
    console.log(`TTS request from ${clientIP}: ${body.language} (${sanitizedText.slice(0, 50)}...)`)

    // 检查是否支持该语言的TTS
    if (!isTTSSupported(body.language)) {
      console.log(`TTS not supported for ${body.language}, falling back to English`)
    }

    // 执行TTS生成
    const ttsResult = await generateSpeech({
      text: sanitizedText,
      language: body.language,
      voice: body.voice,
      rate: body.rate,
      pitch: body.pitch,
    })

    // 返回成功响应
    return apiResponse(ttsResult, 200, {
      'Cache-Control': 'public, max-age=7200', // 缓存2小时
    })

  } catch (error) {
    console.error('TTS API error:', error)
    
    // 处理特定的TTS错误
    if (error instanceof Error) {
      if (error.message.includes('Text is too long')) {
        return apiError(
          ApiErrorCodes.TEXT_TOO_LONG,
          error.message,
          400
        )
      }
      
      if (error.message.includes('TTS services are currently unavailable')) {
        return apiError(
          ApiErrorCodes.TTS_FAILED,
          'Text-to-speech service is temporarily unavailable. Please try again later.',
          503
        )
      }

      if (error.message.includes('TTS generation failed')) {
        return apiError(
          ApiErrorCodes.TTS_FAILED,
          'Failed to generate speech audio. Please try again.',
          500
        )
      }
    }

    // 通用错误响应
    return apiError(
      ApiErrorCodes.INTERNAL_ERROR,
      'An unexpected error occurred during speech generation',
      500
    )
  }
}

/**
 * GET请求：获取支持的语音选项
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const language = url.searchParams.get('language')

    if (language) {
      // 获取指定语言的语音选项
      const voices = getVoiceOptions(language)
      return apiResponse({
        language,
        voices,
        supported: isTTSSupported(language),
      })
    } else {
      // 获取所有支持的语言和语音
      const allVoices: Record<string, any> = {}
      
      // 这里应该从配置中获取所有支持的语言
      const supportedLanguages = ['en', 'sw', 'am', 'ne']
      
      for (const lang of supportedLanguages) {
        allVoices[lang] = {
          supported: isTTSSupported(lang),
          voices: getVoiceOptions(lang),
        }
      }

      return apiResponse({
        supportedLanguages: allVoices,
        totalLanguages: supportedLanguages.length,
      })
    }

  } catch (error) {
    console.error('TTS GET API error:', error)
    
    return apiError(
      ApiErrorCodes.INTERNAL_ERROR,
      'Failed to retrieve voice options',
      500
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
} 