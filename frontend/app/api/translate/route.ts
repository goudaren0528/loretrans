import { NextRequest, NextResponse } from 'next/server'
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
  console.log('=== MAIN API TRANSLATE ENDPOINT ===')
  
  try {
    const body = await request.json()
    console.log('Received request body:', JSON.stringify(body, null, 2))
    
    const { text, sourceLanguage, targetLanguage } = body

    if (!text || !targetLanguage) {
      console.error('Missing required fields:', { text: !!text, targetLanguage: !!targetLanguage })
      return NextResponse.json(
        { error: 'Missing required fields: text and targetLanguage' },
        { status: 400 }
      )
    }

    console.log('=== INPUT ANALYSIS ===')
    console.log('Text length:', text.length)
    console.log('Text preview:', text.substring(0, 100) + (text.length > 100 ? '...' : ''))
    console.log('Source language:', sourceLanguage)
    console.log('Target language:', targetLanguage)

    let finalSourceLanguage = sourceLanguage

    // 处理自动语言检测
    if (sourceLanguage === 'auto') {
      console.log('=== AUTO LANGUAGE DETECTION ===')
      try {
        const detectResponse = await fetch('http://localhost:3000/api/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, multiple: false })
        })

        if (detectResponse.ok) {
          const detectResult = await detectResponse.json()
          console.log('Language detection result:', JSON.stringify(detectResult, null, 2))
          
          if (detectResult.language) {
            finalSourceLanguage = detectResult.language
          } else if (detectResult.data?.language) {
            finalSourceLanguage = detectResult.data.language
          }
          
          console.log('Detected source language:', finalSourceLanguage)
        } else {
          console.error('Language detection failed with status:', detectResponse.status)
          finalSourceLanguage = 'en' // 默认假设英语
        }
      } catch (detectError) {
        console.error('Language detection error:', detectError)
        finalSourceLanguage = 'en' // 默认假设英语
      }
    }

    // 语言代码验证和映射
    const languageMap: { [key: string]: string } = {
      'zh': 'zho_Hans',
      'en': 'eng_Latn',
      'fr': 'fra_Latn',
      'es': 'spa_Latn',
      'de': 'deu_Latn',
      'ja': 'jpn_Jpan',
      'ko': 'kor_Hang',
      'ar': 'arb_Arab',
      'hi': 'hin_Deva',
      'pt': 'por_Latn',
      'ru': 'rus_Cyrl',
      'my': 'mya_Mymr',
      'lo': 'lao_Laoo',
      'sw': 'swh_Latn',
      'te': 'tel_Telu',
      'ht': 'hat_Latn'
    }

    const nllbSourceLang = languageMap[finalSourceLanguage]
    const nllbTargetLang = languageMap[targetLanguage]

    if (!nllbSourceLang || !nllbTargetLang) {
      console.error('Unsupported language mapping:', { 
        finalSourceLanguage, 
        targetLanguage, 
        nllbSourceLang, 
        nllbTargetLang 
      })
      return NextResponse.json(
        { error: `Unsupported language: ${finalSourceLanguage} -> ${targetLanguage}` },
        { status: 400 }
      )
    }

    console.log('=== LANGUAGE MAPPING ===')
    console.log('Original:', { source: finalSourceLanguage, target: targetLanguage })
    console.log('NLLB codes:', { source: nllbSourceLang, target: nllbTargetLang })

    // 调用NLLB本地服务
    console.log('=== CALLING NLLB SERVICE ===')
    const nllbPayload = {
      text,
      sourceLanguage: finalSourceLanguage,  // 传递简短代码，让NLLB服务自己映射
      targetLanguage: targetLanguage
    }
    console.log('NLLB request payload:', JSON.stringify(nllbPayload, null, 2))

    const nllbResponse = await fetch('http://localhost:8081/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nllbPayload)
    })

    console.log('NLLB response status:', nllbResponse.status)
    
    if (!nllbResponse.ok) {
      const errorText = await nllbResponse.text()
      console.error('NLLB service error:', errorText)
      throw new Error(`NLLB service failed: ${errorText}`)
    }

    const nllbResult = await nllbResponse.json()
    console.log('=== NLLB SERVICE RESPONSE ===')
    console.log('NLLB result:', JSON.stringify(nllbResult, null, 2))

    if (!nllbResult.translatedText) {
      console.error('No translatedText in NLLB response')
      throw new Error('Translation failed - no result from NLLB service')
    }

    const finalResult = {
      translatedText: nllbResult.translatedText,
      sourceLanguage: finalSourceLanguage,
      targetLanguage,
      detectedLanguage: sourceLanguage === 'auto' ? finalSourceLanguage : undefined,
      method: 'nllb-local',
      originalLength: text.length,
      translatedLength: nllbResult.translatedText.length
    }

    console.log('=== FINAL API RESPONSE ===')
    console.log('Final result:', JSON.stringify(finalResult, null, 2))

    return NextResponse.json(finalResult)

  } catch (error) {
    console.error('=== TRANSLATION API ERROR ===')
    console.error('Error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Translation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
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