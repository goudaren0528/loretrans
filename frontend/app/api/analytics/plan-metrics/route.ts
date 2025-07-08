export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const PLAN_NAMES: Record<string, string> = {
  'starter': 'Starter Pack',
  'basic': 'Basic Plan',
  'pro': 'Professional',
  'business': 'Business',
  'enterprise': 'Enterprise'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'
    
    const supabase = createClient()
    
    // 计算时间范围
    const now = new Date()
    const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    // 获取支付数据，按套餐分组
    const { data: payments, error } = await supabase
      .from('payments')
      .select('plan_id, amount_usd, user_id, completed_at')
      .eq('status', 'completed')
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: false })
    
    if (error) {
      throw error
    }
    
    // 按套餐分组统计
    const planStats: Record<string, {
      revenue: number
      transactions: number
      users: Set<string>
    }> = {}
    
    payments?.forEach(payment => {
      const planId = payment.plan_id || 'starter'
      if (!planStats[planId]) {
        planStats[planId] = {
          revenue: 0,
          transactions: 0,
          users: new Set()
        }
      }
      
      planStats[planId].revenue += payment.amount_usd
      planStats[planId].transactions += 1
      planStats[planId].users.add(payment.user_id)
    })
    
    // 获取总用户数用于计算转化率
    const { data: totalUsers } = await supabase
      .from('users')
      .select('id')
      .gte('created_at', startDate.toISOString())
    
    const totalUserCount = totalUsers?.length || 0
    
    // 转换为API响应格式
    const planMetrics = Object.entries(planStats).map(([planId, stats]) => ({
      planId,
      planName: PLAN_NAMES[planId] || planId,
      revenue: stats.revenue,
      transactions: stats.transactions,
      conversionRate: totalUserCount > 0 ? (stats.users.size / totalUserCount) * 100 : 0,
      averageOrderValue: stats.transactions > 0 ? stats.revenue / stats.transactions : 0
    }))
    
    // 按收入排序
    planMetrics.sort((a, b) => b.revenue - a.revenue)
    
    return NextResponse.json(planMetrics)
  } catch (error) {
    console.error('Plan metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plan metrics' },
      { status: 500 }
    )
  }
}
