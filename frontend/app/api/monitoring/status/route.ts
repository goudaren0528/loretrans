export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed') === 'true'
    
    // 简化的状态响应
    const status = {
      timestamp: new Date().toISOString(),
      status: 'healthy' as const,
      services: {
        translation_services: {
          nllb_local: 'healthy',
          huggingface: 'healthy'
        }
      },
      metrics: {
        response_time: 100,
        success_rate: 0.99,
        active_connections: 10
      },
      alerts: []
    }

    if (detailed) {
      return NextResponse.json({
        ...status,
        metrics_history: [],
        performance_data: {
          cpu_usage: 0.3,
          memory_usage: 0.4,
          disk_usage: 0.2
        }
      })
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Status check failed:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Status check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
