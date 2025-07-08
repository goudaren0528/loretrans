export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      nllb_service: 'unknown'
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    nllb_provider: 'Hugging Face Space',
    nllb_model: 'NLLB-1.3B'
  }

  try {
    // 检查数据库连接
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 是没有数据的错误，这是正常的
      console.error('Database health check failed:', error)
      healthStatus.services.database = 'unhealthy'
      healthStatus.status = 'degraded'
    } else {
      healthStatus.services.database = 'healthy'
    }
  } catch (dbError) {
    console.error('Database connection failed:', dbError)
    healthStatus.services.database = 'unhealthy'
    healthStatus.status = 'degraded'
  }

  // 检查Hugging Face Space NLLB服务
  try {
    const nllbUrl = process.env.NLLB_SERVICE_URL || 'https://wane0528-my-nllb-api.hf.space/api/v4/translator'
    const timeout = 10000 // 10秒超时用于健康检查
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    // 发送一个简单的测试请求
    const response = await fetch(nllbUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello',
        source_language: 'en',
        target_language: 'zh',
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      healthStatus.services.nllb_service = 'healthy'
    } else {
      console.error(`NLLB service returned status: ${response.status}`)
      healthStatus.services.nllb_service = 'degraded'
      if (healthStatus.status === 'healthy') {
        healthStatus.status = 'degraded'
      }
    }
  } catch (nllbError: any) {
    console.error('NLLB service health check failed:', nllbError.message)
    healthStatus.services.nllb_service = 'unhealthy'
    healthStatus.status = 'degraded'
  }

  // 根据整体状态设置HTTP状态码
  const httpStatus = healthStatus.status === 'healthy' ? 200 : 503

  return NextResponse.json(healthStatus, { status: httpStatus })
}
