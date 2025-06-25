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
  ApiErrorCodes,
  withApiAuth,
  type NextRequestWithUser
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

async function translateHandler(req: NextRequestWithUser) {
  try {
    const { text, sourceLang, targetLang } = await req.json()
    const { user, role } = req.userContext

    console.log(`Translation request by user ${user.id} with role ${role}`)

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // 在这里，我们可以调用实际的翻译服务。
    // 为了演示目的，我们只返回一个模拟的成功响应。
    const mockTranslation = `Translated: "${text}" from ${sourceLang} to ${targetLang} for user ${user.email}.`

    return NextResponse.json({ translation: mockTranslation })
  } catch (error: any) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// 使用 withApiAuth 包装处理器，并要求至少是 free_user 角色
export const POST = withApiAuth(translateHandler, ['free_user', 'pro_user', 'admin'])

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