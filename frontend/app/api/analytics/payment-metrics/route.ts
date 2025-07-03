import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'
    
    const supabase = createClient()
    
    // 计算时间范围
    const now = new Date()
    const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    // 获取支付数据
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'completed')
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: false })
    
    if (paymentsError) {
      throw paymentsError
    }
    
    // 获取上一期数据用于对比
    const previousStartDate = new Date(startDate.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    const { data: previousPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'completed')
      .gte('completed_at', previousStartDate.toISOString())
      .lt('completed_at', startDate.toISOString())
    
    // 计算指标
    const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount_usd, 0) || 0
    const totalTransactions = payments?.length || 0
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    
    // 计算新客户和回购客户
    const userIds = payments?.map(p => p.user_id) || []
    const uniqueUsers = [...new Set(userIds)]
    const newCustomers = uniqueUsers.length
    const returningCustomers = totalTransactions - newCustomers
    
    // 计算增长率
    const previousRevenue = previousPayments?.reduce((sum, payment) => sum + payment.amount_usd, 0) || 0
    const growthRate = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
    
    // 找出最受欢迎的套餐
    const planCounts: Record<string, number> = {}
    payments?.forEach(payment => {
      const planId = payment.plan_id || 'unknown'
      planCounts[planId] = (planCounts[planId] || 0) + 1
    })
    const topPlan = Object.entries(planCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'starter'
    
    // 获取用户数据计算转化率
    const { data: users } = await supabase
      .from('users')
      .select('id, created_at')
      .gte('created_at', startDate.toISOString())
    
    const totalUsers = users?.length || 0
    const conversionRate = totalUsers > 0 ? (newCustomers / totalUsers) * 100 : 0
    
    const metrics = {
      totalRevenue,
      totalTransactions,
      averageOrderValue,
      conversionRate,
      newCustomers,
      returningCustomers,
      topPlan,
      growthRate,
      period: range
    }
    
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Payment metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment metrics' },
      { status: 500 }
    )
  }
}
