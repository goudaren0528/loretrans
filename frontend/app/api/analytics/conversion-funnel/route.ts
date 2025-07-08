export const dynamic = "force-dynamic";
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
    
    // 模拟数据 - 在实际应用中，这些数据应该来自分析服务（如Google Analytics）
    // 这里提供一个基础的实现框架
    
    // 1. 获取网站访客数（需要集成分析工具）
    // 暂时使用估算：基于注册用户数推算访客数
    const { data: users } = await supabase
      .from('users')
      .select('id, created_at')
      .gte('created_at', startDate.toISOString())
    
    const registeredUsers = users?.length || 0
    // 假设注册转化率为15%，反推访客数
    const estimatedVisitors = Math.round(registeredUsers / 0.15)
    
    // 2. 定价页面访问数（需要页面访问统计）
    // 暂时估算为访客数的40%
    const pricingPageViews = Math.round(estimatedVisitors * 0.4)
    
    // 3. 发起结账数（从支付记录获取）
    const { data: allPaymentAttempts } = await supabase
      .from('payments')
      .select('id, status, created_at')
      .gte('created_at', startDate.toISOString())
    
    const checkoutInitiated = allPaymentAttempts?.length || 0
    
    // 4. 完成支付数
    const { data: completedPayments } = await supabase
      .from('payments')
      .select('id')
      .eq('status', 'completed')
      .gte('completed_at', startDate.toISOString())
    
    const paymentCompleted = completedPayments?.length || 0
    
    // 计算转化率
    const conversionRates = {
      visitorToPricing: estimatedVisitors > 0 ? (pricingPageViews / estimatedVisitors) * 100 : 0,
      pricingToCheckout: pricingPageViews > 0 ? (checkoutInitiated / pricingPageViews) * 100 : 0,
      checkoutToPayment: checkoutInitiated > 0 ? (paymentCompleted / checkoutInitiated) * 100 : 0,
      overallConversion: estimatedVisitors > 0 ? (paymentCompleted / estimatedVisitors) * 100 : 0
    }
    
    const funnelData = {
      visitors: estimatedVisitors,
      pricingPageViews,
      checkoutInitiated,
      paymentCompleted,
      conversionRates
    }
    
    return NextResponse.json(funnelData)
  } catch (error) {
    console.error('Conversion funnel error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversion funnel data' },
      { status: 500 }
    )
  }
}
