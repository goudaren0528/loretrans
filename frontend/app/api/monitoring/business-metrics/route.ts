export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // 时间范围
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    // 用户指标
    const { data: dailyUsers } = await supabase
      .from('users')
      .select('id, last_sign_in_at')
      .gte('last_sign_in_at', today.toISOString())
    
    const { data: weeklyUsers } = await supabase
      .from('users')
      .select('id, last_sign_in_at')
      .gte('last_sign_in_at', weekAgo.toISOString())
    
    const { data: monthlyUsers } = await supabase
      .from('users')
      .select('id, last_sign_in_at')
      .gte('last_sign_in_at', monthAgo.toISOString())
    
    const { data: newUsers } = await supabase
      .from('users')
      .select('id, created_at')
      .gte('created_at', today.toISOString())
    
    // 收入指标
    const { data: dailyPayments } = await supabase
      .from('payments')
      .select('amount_usd')
      .eq('status', 'completed')
      .gte('completed_at', today.toISOString())
    
    const { data: monthlyPayments } = await supabase
      .from('payments')
      .select('amount_usd, user_id')
      .eq('status', 'completed')
      .gte('completed_at', monthAgo.toISOString())
    
    // 翻译使用数据（假设有translations表）
    const { data: translations } = await supabase
      .from('credit_transactions')
      .select('amount, created_at')
      .eq('type', 'consume')
      .gte('created_at', today.toISOString())
    
    // 计算指标
    const dailyActiveUsers = dailyUsers?.length || 0
    const weeklyActiveUsers = weeklyUsers?.length || 0
    const monthlyActiveUsers = monthlyUsers?.length || 0
    const newRegistrations = newUsers?.length || 0
    
    const dailyRevenue = dailyPayments?.reduce((sum, p) => sum + p.amount_usd, 0) || 0
    const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + p.amount_usd, 0) || 0
    const averageOrderValue = (monthlyPayments?.length ?? 0) > 0 ? monthlyRevenue / (monthlyPayments?.length ?? 1) : 0
    
    // 计算用户留存率（简化版本）
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, created_at, last_sign_in_at')
      .lt('created_at', weekAgo.toISOString())
    
    const activeOldUsers = allUsers?.filter(user => 
      user.last_sign_in_at && new Date(user.last_sign_in_at) >= weekAgo
    ).length || 0
    
    const userRetentionRate = (allUsers?.length ?? 0) > 0 ? (activeOldUsers / (allUsers?.length ?? 1)) * 100 : 0
    
    // 转化率计算
    const totalUsers = monthlyUsers?.length || 0
    const payingUsers = new Set(monthlyPayments?.map(p => p.user_id)).size
    const conversionRate = totalUsers > 0 ? (payingUsers / totalUsers) * 100 : 0
    
    // 客户生命价值（简化计算）
    const customerLifetimeValue = averageOrderValue * 3 // 假设平均购买3次
    
    // 产品使用指标
    const translationRequests = translations?.length || 0
    const averageTranslationLength = 500 // 假设平均长度
    const popularLanguages = ['海地克里奥尔语', '老挝语', '斯瓦希里语'] // 模拟数据
    const apiUsage = 0 // 需要从API调用日志获取
    
    // 系统指标（模拟数据，实际应该从监控系统获取）
    const systemUptime = 99.8
    const averageResponseTime = 1200
    const errorRate = 0.5
    
    // 趋势数据（简化计算）
    const { data: yesterdayPayments } = await supabase
      .from('payments')
      .select('amount_usd')
      .eq('status', 'completed')
      .gte('completed_at', yesterday.toISOString())
      .lt('completed_at', today.toISOString())
    
    const yesterdayRevenue = yesterdayPayments?.reduce((sum, p) => sum + p.amount_usd, 0) || 0
    const revenueGrowth = yesterdayRevenue > 0 ? ((dailyRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0
    
    const { data: yesterdayUsers } = await supabase
      .from('users')
      .select('id, last_sign_in_at')
      .gte('last_sign_in_at', yesterday.toISOString())
      .lt('last_sign_in_at', today.toISOString())
    
    const yesterdayActiveUsers = yesterdayUsers?.length || 0
    const userGrowth = yesterdayActiveUsers > 0 ? ((dailyActiveUsers - yesterdayActiveUsers) / yesterdayActiveUsers) * 100 : 0
    
    // 生成告警
    const alerts = []
    
    if (systemUptime < 99.5) {
      alerts.push({
        id: 'uptime_low',
        type: 'warning',
        title: '系统可用性告警',
        message: `系统可用性 ${systemUptime}% 低于目标值 99.5%`,
        timestamp: new Date().toISOString(),
        acknowledged: false
      })
    }
    
    if (conversionRate < 5) {
      alerts.push({
        id: 'conversion_low',
        type: 'warning',
        title: '转化率偏低',
        message: `当前转化率 ${conversionRate.toFixed(2)}% 低于目标值 8%`,
        timestamp: new Date().toISOString(),
        acknowledged: false
      })
    }
    
    if (dailyActiveUsers < 50) {
      alerts.push({
        id: 'dau_low',
        type: 'info',
        title: '日活用户较少',
        message: `今日活跃用户 ${dailyActiveUsers} 人，建议加强用户运营`,
        timestamp: new Date().toISOString(),
        acknowledged: false
      })
    }
    
    const metrics = {
      // 用户指标
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      newRegistrations,
      userRetentionRate,
      
      // 商业指标
      dailyRevenue,
      monthlyRevenue,
      averageOrderValue,
      conversionRate,
      customerLifetimeValue,
      
      // 产品指标
      translationRequests,
      averageTranslationLength,
      popularLanguages,
      apiUsage,
      
      // 系统指标
      systemUptime,
      averageResponseTime,
      errorRate,
      
      // 趋势数据
      trends: {
        revenue: revenueGrowth,
        users: userGrowth,
        conversions: 0, // 需要更复杂的计算
        retention: 0 // 需要更复杂的计算
      }
    }
    
    return NextResponse.json({
      metrics,
      alerts
    })
  } catch (error) {
    console.error('Business metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business metrics' },
      { status: 500 }
    )
  }
}
