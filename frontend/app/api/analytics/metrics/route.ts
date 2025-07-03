import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface AnalyticsMetric {
  name: string
  data: any
  url: string
  userAgent: string
  timestamp: number
  sessionId: string
}

interface MetricsPayload {
  metrics: AnalyticsMetric[]
  timestamp: number
  retry?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { metrics, timestamp, retry }: MetricsPayload = await request.json()
    
    if (!Array.isArray(metrics) || metrics.length === 0) {
      return NextResponse.json(
        { error: '无效的指标数据' },
        { status: 400 }
      )
    }

    // 创建Supabase客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 获取用户信息（如果已登录）
    const authHeader = request.headers.get('authorization')
    let userId = null
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const { data: { user } } = await supabase.auth.getUser(token)
        userId = user?.id
      } catch (error) {
        // 允许匿名分析数据
        console.log('Auth error in analytics:', error)
      }
    }

    // 获取请求信息
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // 批量插入指标数据
    const analyticsData = metrics.map(metric => ({
      user_id: userId,
      session_id: metric.sessionId,
      metric_name: metric.name,
      metric_data: metric.data,
      url: metric.url,
      user_agent: metric.userAgent || userAgent,
      ip_address: ipAddress,
      timestamp: new Date(metric.timestamp).toISOString(),
      created_at: new Date().toISOString()
    }))

    // 分批插入，避免单次插入过多数据
    const batchSize = 50
    const results = []
    
    for (let i = 0; i < analyticsData.length; i += batchSize) {
      const batch = analyticsData.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('analytics_metrics')
        .insert(batch)
        .select('id')

      if (error) {
        console.error('Analytics batch insert error:', error)
        // 继续处理其他批次
        continue
      }
      
      results.push(...(data || []))
    }

    // 处理特定类型的指标
    await processSpecialMetrics(supabase, metrics, userId)

    return NextResponse.json({
      success: true,
      processed: results.length,
      total: metrics.length,
      message: retry ? '重试指标已处理' : '指标已记录'
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: '分析数据处理失败' },
      { status: 500 }
    )
  }
}

// 处理特殊类型的指标
async function processSpecialMetrics(
  supabase: any, 
  metrics: AnalyticsMetric[], 
  userId: string | null
) {
  for (const metric of metrics) {
    try {
      switch (metric.name) {
        case 'translation_performance':
          await processTranslationMetric(supabase, metric, userId)
          break
        case 'user_journey':
          await processUserJourneyMetric(supabase, metric, userId)
          break
        case 'page_load':
          await processPageLoadMetric(supabase, metric, userId)
          break
        case 'javascript_error':
          await processErrorMetric(supabase, metric, userId)
          break
      }
    } catch (error) {
      console.error(`Failed to process ${metric.name} metric:`, error)
    }
  }
}

// 处理翻译性能指标
async function processTranslationMetric(
  supabase: any, 
  metric: AnalyticsMetric, 
  userId: string | null
) {
  const data = metric.data
  
  // 更新翻译性能统计
  await supabase
    .from('translation_performance_stats')
    .insert({
      user_id: userId,
      source_language: data.sourceLanguage,
      target_language: data.targetLanguage,
      character_count: data.characterCount,
      translation_time: data.translationTime,
      success: data.success,
      error_message: data.error,
      timestamp: new Date(metric.timestamp).toISOString()
    })

  // 如果翻译失败，记录错误统计
  if (!data.success && data.error) {
    await supabase
      .from('translation_errors')
      .insert({
        user_id: userId,
        error_type: 'translation_failure',
        error_message: data.error,
        context: {
          sourceLanguage: data.sourceLanguage,
          targetLanguage: data.targetLanguage,
          characterCount: data.characterCount
        },
        timestamp: new Date(metric.timestamp).toISOString()
      })
  }
}

// 处理用户行为路径指标
async function processUserJourneyMetric(
  supabase: any, 
  metric: AnalyticsMetric, 
  userId: string | null
) {
  await supabase
    .from('user_journey_events')
    .insert({
      user_id: userId,
      session_id: metric.sessionId,
      action: metric.data.action,
      action_data: metric.data.data,
      url: metric.url,
      timestamp: new Date(metric.timestamp).toISOString()
    })
}

// 处理页面加载性能指标
async function processPageLoadMetric(
  supabase: any, 
  metric: AnalyticsMetric, 
  userId: string | null
) {
  const data = metric.data
  
  await supabase
    .from('page_performance')
    .insert({
      user_id: userId,
      url: metric.url,
      dns_time: data.dns,
      tcp_time: data.tcp,
      ssl_time: data.ssl,
      ttfb: data.ttfb,
      download_time: data.download,
      dom_parse_time: data.domParse,
      dom_ready_time: data.domReady,
      load_complete_time: data.loadComplete,
      timestamp: new Date(metric.timestamp).toISOString()
    })
}

// 处理错误指标
async function processErrorMetric(
  supabase: any, 
  metric: AnalyticsMetric, 
  userId: string | null
) {
  const data = metric.data
  
  await supabase
    .from('javascript_errors')
    .insert({
      user_id: userId,
      error_message: data.message,
      filename: data.filename,
      line_number: data.lineno,
      column_number: data.colno,
      stack_trace: data.stack,
      url: metric.url,
      user_agent: metric.userAgent,
      timestamp: new Date(metric.timestamp).toISOString()
    })
}
