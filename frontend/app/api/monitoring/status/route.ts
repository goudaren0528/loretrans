import { NextRequest, NextResponse } from 'next/server'
import { getSystemStatus, getMetricHistory } from '@/lib/services/monitoring'
import { getTranslationServiceStatus } from '@/lib/services/translation-resilience'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed') === 'true'
    const duration = parseInt(searchParams.get('duration') || '3600')

    // 获取基础系统状态
    const systemStatus = getSystemStatus()
    
    // 获取翻译服务详细状态
    const translationStatus = getTranslationServiceStatus()

    const response = {
      timestamp: new Date().toISOString(),
      status: systemStatus.overall,
      services: {
        ...systemStatus.services,
        translation_services: translationStatus
      },
      metrics: systemStatus.metrics,
      alerts: systemStatus.alerts.map(alert => ({
        id: alert.id,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
        resolved: alert.resolved
      }))
    }

    // 如果需要详细信息，包含指标历史
    if (detailed) {
      const metricNames = [
        'api_response_time_avg',
        'api_error_rate',
        'translation_success_rate',
        'credits_consumed_per_minute',
        'daily_active_users'
      ]

      const metricsHistory: Record<string, any[]> = {}
      metricNames.forEach(metricName => {
        const history = getMetricHistory(metricName, duration)
        metricsHistory[metricName] = history.map(m => ({
          value: m.value,
          timestamp: m.timestamp,
          unit: m.unit
        }))
      })

      response['metrics_history'] = metricsHistory
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Failed to get system status:', error)
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: 'Failed to retrieve system status',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 健康检查端点
export async function HEAD() {
  try {
    const status = getSystemStatus()
    
    if (status.overall === 'down') {
      return new NextResponse(null, { status: 503 })
    } else if (status.overall === 'degraded') {
      return new NextResponse(null, { status: 200, headers: { 'X-Status': 'degraded' } })
    } else {
      return new NextResponse(null, { status: 200 })
    }
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
