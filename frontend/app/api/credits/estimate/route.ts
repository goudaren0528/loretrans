import { NextRequest, NextResponse } from 'next/server'
import { createServerCreditService } from '@/lib/services/credits'
import { withApiAuth, type NextRequestWithUser } from '@/lib/api-utils'

interface EstimateRequest {
  text: string
  sourceLanguage?: string
  targetLanguage?: string
}

async function estimateHandler(req: NextRequestWithUser) {
  try {
    const { text, sourceLanguage, targetLanguage } = await req.json() as EstimateRequest
    const { user } = req.userContext

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const creditService = createServerCreditService()
    
    // 计算积分需求
    const calculation = creditService.calculateCreditsRequired(text.length)
    
    // 获取用户当前积分余额
    const currentCredits = user ? await creditService.getUserCredits(user.id) : 0
    
    // 检查积分是否充足
    const hasEnoughCredits = currentCredits >= calculation.credits_required
    
    return NextResponse.json({
      calculation,
      user_credits: currentCredits,
      has_enough_credits: hasEnoughCredits,
      shortfall: hasEnoughCredits ? 0 : calculation.credits_required - currentCredits,
      is_free: calculation.credits_required === 0,
      metadata: {
        source_language: sourceLanguage,
        target_language: targetLanguage,
        character_count: text.length
      }
    })

  } catch (error) {
    console.error('Credit estimation error:', error)
    return NextResponse.json(
      { error: 'Failed to estimate credits' },
      { status: 500 }
    )
  }
}

// 允许游客用户访问（用于预估）
export const POST = withApiAuth(estimateHandler, ['guest', 'free_user', 'pro_user', 'admin'])

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
