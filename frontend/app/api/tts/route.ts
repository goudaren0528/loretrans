import { NextRequest, NextResponse } from 'next/server'
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
import { getLocale, getTranslations } from 'next-intl/server'

interface TTSRequest {
  text: string
  language: string
  voice?: string
  rate?: number  // 语速 0.5-2.0
  pitch?: number // 音调 0.5-2.0
}

export async function POST(request: NextRequest) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Errors' });

  try {
    // 验证请求方法
    if (!validateMethod(request, ['POST'])) {
      return NextResponse.json({ error: t('method_not_allowed') }, { status: 405 });
    }

    // 解析请求体
    let body: TTSRequest
    try {
      body = await parseRequestBody<TTSRequest>(request)
    } catch (error) {
      return NextResponse.json({ error: t('invalid_json') }, { status: 400 });
    }

    // 验证必需字段
    const validation = validateRequiredFields(body, ['text', 'language'])
    if (!validation.valid) {
      const missingFields = validation.missing.join(', ');
      return NextResponse.json({ error: t('missing_fields', { fields: missingFields }) }, { status: 400 });
    }

    // 清理和验证文本
    const sanitizedText = sanitizeTextForTTS(body.text)
    if (!sanitizedText) {
      return NextResponse.json({ error: t('empty_text') }, { status: 400 });
    }

    // 验证文本长度（TTS有更严格的限制）
    const lengthValidation = validateTextLength(sanitizedText, 500)
    if (!lengthValidation.valid) {
      return NextResponse.json({ 
        error: t('text_too_long', { maxLength: 500, actualLength: lengthValidation.length }) 
      }, { status: 400 });
    }

    // 验证语言代码格式
    const langCodeRegex = /^[a-z]{2,3}$/
    if (!langCodeRegex.test(body.language)) {
      return NextResponse.json({ error: t('invalid_lang_code') }, { status: 400 });
    }

    // 验证语音参数
    if (body.rate !== undefined && (body.rate < 0.5 || body.rate > 2.0)) {
      return NextResponse.json({ error: t('invalid_speech_rate') }, { status: 400 });
    }

    if (body.pitch !== undefined && (body.pitch < 0.5 || body.pitch > 2.0)) {
      return NextResponse.json({ error: t('invalid_speech_pitch') }, { status: 400 });
    }

    // 验证语音选项
    if (body.voice) {
      const availableVoices = getVoiceOptions(body.language)
      const isValidVoice = availableVoices.some(voice => voice.code === body.voice)
      if (!isValidVoice) {
        return NextResponse.json({ error: t('invalid_voice', { language: body.language }) }, { status: 400 });
      }
    }

    // 获取客户端IP（用于日志记录）
    const clientIP = getClientIP(request)
    console.log(`[POST /api/tts] TTS request from ${clientIP}: ${body.language} (${sanitizedText.slice(0, 50)}...)`)

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
        // This case might be redundant if validated before, but good for safety
        return NextResponse.json({ 
          error: t('text_too_long', { maxLength: 500, actualLength: error.message.length }) 
        }, { status: 400 });
      }
      
      if (error.message.includes('TTS services are currently unavailable')) {
        return NextResponse.json({ error: t('tts_unavailable') }, { status: 503 });
      }

      if (error.message.includes('TTS generation failed')) {
        return NextResponse.json({ error: t('tts_failed') }, { status: 500 });
      }
    }

    // 通用错误响应
    return NextResponse.json({ error: t('unexpected_tts_error') }, { status: 500 });
  }
}

/**
 * GET请求：获取支持的语音选项
 */
export async function GET(request: NextRequest) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Errors' });

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
    
    return NextResponse.json({ error: t('failed_to_get_voices') }, { status: 500 });
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