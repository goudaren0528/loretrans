export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // 创建Supabase客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 验证管理员权限
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '需要登录' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '无效的认证信息' },
        { status: 401 }
      )
    }

    // 检查管理员权限（简化版本）
    const adminEmails = ['admin@loretrans.com', 'support@loretrans.com']
    if (!adminEmails.includes(user.email || '')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    // 获取系统级统计数据
    const analytics = await getSystemAnalytics(supabase)

    // 记录管理员访问
    try {
      await supabase
        .from('admin_access_logs')
        .insert({
          user_id: user.id,
          action: 'view_analytics',
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          timestamp: new Date().toISOString()
        })
    } catch (logError) {
      console.log('Failed to log admin access:', logError)
    }

    return NextResponse.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('Admin analytics API error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

async function getSystemAnalytics(supabase: any) {
  try {
    // 系统概览数据
    const [
      { count: totalUsers },
      { count: totalTranslations },
      { data: recentUsers },
      { data: translationStats },
      { data: errorStats },
      { data: performanceStats }
    ] = await Promise.all([
      // 总用户数
      supabase.from('users').select('*', { count: 'exact', head: true }),
      
      // 总翻译次数
      supabase.from('translations').select('*', { count: 'exact', head: true }),
      
      // 最近7天活跃用户
      supabase
        .from('translations')
        .select('user_id')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .not('user_id', 'is', null),
      
      // 翻译统计
      supabase
        .from('translations')
        .select('source_language, target_language, character_count, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      
      // 错误统计
      supabase
        .from('javascript_errors')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      
      // 性能统计
      supabase
        .from('page_performance')
        .select('load_complete_time, ttfb')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1000)
    ])

    // 计算活跃用户数
    const activeUsers = new Set(recentUsers?.map((u: any) => u.user_id) || []).size

    // 计算热门语言
    const languageCount = (translationStats || []).reduce((acc: any, t: any) => {
      const pair = `${t.source_language} → ${t.target_language}`
      acc[pair] = (acc[pair] || 0) + 1
      return acc
    }, {})

    const topLanguages = Object.entries(languageCount)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([language, count]) => ({ language, count }))

    // 计算平均性能
    const avgPageLoadTime = performanceStats?.length > 0 
      ? Math.round(performanceStats.reduce((sum: number, p: any) => sum + (p.load_complete_time || 0), 0) / performanceStats.length)
      : 0

    const avgTTFB = performanceStats?.length > 0
      ? Math.round(performanceStats.reduce((sum: number, p: any) => sum + (p.ttfb || 0), 0) / performanceStats.length)
      : 0

    // 计算收入数据（模拟）
    const totalRevenue = 0 // 需要从支付记录计算
    const monthlyRevenue = 0 // 需要从本月支付记录计算
    const paidUsers = 0 // 需要从支付记录计算

    return {
      overview: {
        totalUsers: totalUsers || 0,
        activeUsers,
        totalTranslations: totalTranslations || 0,
        totalRevenue,
        errorRate: errorStats?.length > 0 ? Math.min((errorStats.length / 1000) * 100, 100) : 0,
        avgResponseTime: avgTTFB
      },
      performance: {
        pageLoadTime: avgPageLoadTime,
        translationTime: 1200, // 需要从翻译性能统计计算
        errorCount: errorStats?.length || 0,
        uptime: 99.9 // 需要从系统监控获取
      },
      userBehavior: {
        topLanguages,
        conversionRate: totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0,
        retentionRate: 65, // 需要计算7天留存率
        avgSessionTime: 8.5 // 需要从用户会话数据计算
      },
      business: {
        monthlyRevenue,
        paidUsers,
        churnRate: 5.2, // 需要计算流失率
        ltv: 45 // 需要计算用户生命周期价值
      }
    }

  } catch (error) {
    console.error('Failed to get system analytics:', error)
    return {
      overview: {
        totalUsers: 0,
        activeUsers: 0,
        totalTranslations: 0,
        totalRevenue: 0,
        errorRate: 0,
        avgResponseTime: 0
      },
      performance: {
        pageLoadTime: 0,
        translationTime: 0,
        errorCount: 0,
        uptime: 0
      },
      userBehavior: {
        topLanguages: [],
        conversionRate: 0,
        retentionRate: 0,
        avgSessionTime: 0
      },
      business: {
        monthlyRevenue: 0,
        paidUsers: 0,
        churnRate: 0,
        ltv: 0
      }
    }
  }
}
