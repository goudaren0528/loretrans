export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// 健康检查缓存
let healthCache = {
  nllb_status: 'unknown',
  last_check: 0,
  cache_duration: 60000, // 增加到60秒缓存
  consecutive_failures: 0 // 连续失败次数
};

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

  // 智能NLLB服务检查
  const now = Date.now();
  const cacheValid = (now - healthCache.last_check) < healthCache.cache_duration;
  
  if (cacheValid && healthCache.nllb_status !== 'unknown') {
    // 使用缓存的状态
    healthStatus.services.nllb_service = healthCache.nllb_status;
    console.log(`[Health] 使用缓存的NLLB状态: ${healthCache.nllb_status} (${healthCache.consecutive_failures}次连续失败)`);
    
    if (healthCache.nllb_status === 'unhealthy') {
      healthStatus.status = 'degraded';
    }
  } else {
    // 执行实际的健康检查
    try {
      const nllbUrl = process.env.NLLB_SERVICE_URL || 'https://wane0528-my-nllb-api.hf.space/api/v4/translator'
      
      // 根据连续失败次数调整超时时间
      let timeout = 6000; // 基础6秒
      if (healthCache.consecutive_failures > 2) {
        timeout = 4000; // 如果连续失败多次，减少超时时间
      }
      
      console.log(`[Health] 执行NLLB健康检查 (超时: ${timeout}ms, 连续失败: ${healthCache.consecutive_failures}次)...`);
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log(`[Health] NLLB健康检查超时 (${timeout}ms)`);
        controller.abort();
      }, timeout)
      
      // 发送一个简单的测试请求
      const response = await fetch(nllbUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Hi',
          source: 'eng_Latn',
          target: 'zho_Hans',
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const result = await response.json()
        if (result.result || result.translated_text) {
          healthStatus.services.nllb_service = 'healthy'
          healthCache.nllb_status = 'healthy';
          healthCache.consecutive_failures = 0; // 重置失败计数
          console.log(`[Health] NLLB服务正常，重置失败计数`);
        } else {
          console.error('NLLB service returned empty result')
          healthStatus.services.nllb_service = 'degraded'
          healthCache.nllb_status = 'degraded';
          healthCache.consecutive_failures++;
          healthStatus.status = 'degraded'
        }
      } else {
        console.error(`NLLB service returned status: ${response.status}`)
        healthStatus.services.nllb_service = 'degraded'
        healthCache.nllb_status = 'degraded';
        healthCache.consecutive_failures++;
        healthStatus.status = 'degraded'
      }
      
      healthCache.last_check = now;
      
    } catch (nllbError: any) {
      console.error('NLLB service health check failed:', nllbError.message)
      healthCache.consecutive_failures++;
      
      // 根据错误类型和失败次数决定状态
      if (nllbError.message.includes('aborted') || nllbError.message.includes('timeout')) {
        // 超时错误 - 如果连续失败次数不多，标记为degraded
        if (healthCache.consecutive_failures <= 3) {
          healthStatus.services.nllb_service = 'degraded'
          healthCache.nllb_status = 'degraded';
          healthStatus.status = 'degraded'
          console.log(`[Health] NLLB服务响应慢，标记为degraded (${healthCache.consecutive_failures}/3)`);
        } else {
          // 连续失败太多次，标记为unhealthy
          healthStatus.services.nllb_service = 'unhealthy'
          healthCache.nllb_status = 'unhealthy';
          healthStatus.status = 'degraded'
          console.log(`[Health] NLLB服务连续失败${healthCache.consecutive_failures}次，标记为unhealthy`);
        }
      } else {
        // 其他错误 - 直接标记为unhealthy
        healthStatus.services.nllb_service = 'unhealthy'
        healthCache.nllb_status = 'unhealthy';
        healthStatus.status = 'degraded'
        console.log(`[Health] NLLB服务不可用，标记为unhealthy`);
      }
      
      healthCache.last_check = now;
    }
  }

  // 根据整体状态设置HTTP状态码
  // 只有当关键服务完全不可用时才返回503
  let httpStatus = 200;
  if (healthStatus.services.database === 'unhealthy' || 
      healthStatus.services.nllb_service === 'unhealthy') {
    httpStatus = 503;
  } else if (healthStatus.status === 'degraded') {
    // degraded状态返回200但标记状态
    httpStatus = 200;
  }

  console.log(`[Health] 最终状态: ${healthStatus.status}, HTTP: ${httpStatus}, NLLB: ${healthStatus.services.nllb_service}`);

  return NextResponse.json(healthStatus, { status: httpStatus })
}
