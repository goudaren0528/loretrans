import { NextRequest, NextResponse } from 'next/server'
import { createServerCreditService } from '@/lib/services/credits'
import { withApiAuth, type NextRequestWithUser } from '@/lib/api-utils'

async function balanceHandler(req: NextRequestWithUser) {
  try {
    const { user } = req.userContext

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const creditService = createServerCreditService()
    
    // 获取用户积分余额
    const credits = await creditService.getUserCredits(user.id)
    
    // 获取最近的交易记录
    const { transactions } = await creditService.getCreditTransactions(user.id, {
      limit: 5
    })
    
    // 获取使用统计
    const stats = await creditService.getCreditUsageStats(user.id, 'month')
    
    return NextResponse.json({
      credits,
      recent_transactions: transactions,
      monthly_stats: stats,
      user_id: user.id
    })

  } catch (error) {
    console.error('Credit balance error:', error)
    return NextResponse.json(
      { error: 'Failed to get credit balance' },
      { status: 500 }
    )
  }
}

export const GET = withApiAuth(balanceHandler, ['free_user', 'pro_user', 'admin'])

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}
