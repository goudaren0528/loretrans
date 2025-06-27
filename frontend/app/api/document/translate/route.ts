import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth, type NextRequestWithUser } from '@/lib/api-utils'
import { createServerCreditService } from '@/lib/services/credits'

interface DocumentTranslateRequest {
  fileId: string
  sourceLanguage: string
  targetLanguage: string
  characterCount: number
}

async function documentTranslateHandler(req: NextRequestWithUser) {
  try {
    const { user, role } = req.userContext
    const { fileId, sourceLanguage, targetLanguage, characterCount } = await req.json() as DocumentTranslateRequest

    if (!user) {
      return NextResponse.json({
        error: '文档翻译需要登录账户',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    if (!fileId || !sourceLanguage || !targetLanguage || !characterCount) {
      return NextResponse.json({
        error: '缺少必要参数',
        code: 'MISSING_PARAMETERS'
      }, { status: 400 })
    }

    const creditService = createServerCreditService()

    // 计算积分消耗
    const calculation = creditService.calculateCreditsRequired(characterCount)

    // 消费积分（如果需要）
    if (calculation.credits_required > 0) {
      const consumeResult = await creditService.consumeTranslationCredits(
        user.id,
        characterCount,
        sourceLanguage,
        targetLanguage,
        'document'
      )

      if (!consumeResult.success) {
        return NextResponse.json({
          error: '积分不足，请先充值',
          code: 'INSUFFICIENT_CREDITS',
          calculation: consumeResult.calculation
        }, { status: 402 })
      }
    }

    try {
      // 调用文件处理微服务进行翻译
      const fileServiceUrl = process.env.FILE_SERVICE_URL || 'http://localhost:3010'
      const translateResponse = await fetch(`${fileServiceUrl}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId,
          sourceLanguage,
          targetLanguage,
          userId: user.id
        }),
      })

      if (!translateResponse.ok) {
        throw new Error('文档翻译失败')
      }

      const translateResult = await translateResponse.json()

      return NextResponse.json({
        success: true,
        translationId: translateResult.translationId,
        status: 'processing',
        estimatedTime: Math.ceil(characterCount / 1000) * 2, // 估算处理时间（秒）
        creditsConsumed: calculation.credits_required,
        message: '翻译正在处理中，请稍候...'
      })

    } catch (translationError: any) {
      console.error('Document translation failed:', translationError)

      // 翻译失败，退还积分
      if (calculation.credits_required > 0) {
        await creditService.refundCredits(
          user.id,
          calculation.credits_required,
          '文档翻译失败退款',
          {
            file_id: fileId,
            character_count: characterCount,
            error_message: translationError.message
          }
        )
      }

      return NextResponse.json({
        error: '文档翻译失败，积分已退还',
        code: 'TRANSLATION_FAILED'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Document translate error:', error)
    return NextResponse.json({
      error: '处理请求失败，请重试',
      code: 'PROCESSING_ERROR'
    }, { status: 500 })
  }
}

// 要求至少是注册用户
export const POST = withApiAuth(documentTranslateHandler, ['free_user', 'pro_user', 'admin'])

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
