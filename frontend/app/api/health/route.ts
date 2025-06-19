import { NextRequest } from 'next/server'
import { apiResponse } from '@/lib/api-utils'

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  services: {
    translation: {
      status: 'available' | 'unavailable'
      responseTime?: number
    }
    tts: {
      status: 'available' | 'unavailable'
      responseTime?: number
    }
    languageDetection: {
      status: 'available' | 'unavailable'
      responseTime?: number
    }
  }
  uptime: number
  memory: {
    used: number
    total: number
    percentage: number
  }
}

// 启动时间
const startTime = Date.now()

/**
 * 检查翻译服务状态
 */
async function checkTranslationService(): Promise<{ status: 'available' | 'unavailable'; responseTime?: number }> {
  try {
    const start = Date.now()
    const hasApiKey = !!process.env.HUGGINGFACE_API_KEY
    const responseTime = Date.now() - start
    
    return {
      status: hasApiKey ? 'available' : 'unavailable',
      responseTime,
    }
  } catch (error) {
    return { status: 'unavailable' }
  }
}

/**
 * 检查TTS服务状态
 */
async function checkTTSService(): Promise<{ status: 'available' | 'unavailable'; responseTime?: number }> {
  try {
    const start = Date.now()
    // 检查是否有可用的TTS配置
    const hasGoogleTTS = !!process.env.GOOGLE_TTS_API_KEY
    // 在服务器端，我们假设浏览器TTS是可用的（客户端功能）
    const hasBrowserTTS = true
    const responseTime = Date.now() - start
    
    return {
      status: hasGoogleTTS || hasBrowserTTS ? 'available' : 'unavailable',
      responseTime,
    }
  } catch (error) {
    return { status: 'unavailable' }
  }
}

/**
 * 检查语言检测服务状态
 */
async function checkLanguageDetectionService(): Promise<{ status: 'available' | 'unavailable'; responseTime?: number }> {
  try {
    const start = Date.now()
    // 语言检测是本地服务，总是可用
    const responseTime = Date.now() - start
    
    return {
      status: 'available',
      responseTime,
    }
  } catch (error) {
    return { status: 'unavailable' }
  }
}

/**
 * 获取内存使用情况
 */
function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    const total = usage.heapTotal
    const used = usage.heapUsed
    
    return {
      used: Math.round(used / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
      percentage: Math.round((used / total) * 100),
    }
  }
  
  return {
    used: 0,
    total: 0,
    percentage: 0,
  }
}

export async function GET(request: NextRequest) {
  try {
    // 检查各个服务状态
    const [translationStatus, ttsStatus, languageDetectionStatus] = await Promise.all([
      checkTranslationService(),
      checkTTSService(),
      checkLanguageDetectionService(),
    ])

    const services = {
      translation: translationStatus,
      tts: ttsStatus,
      languageDetection: languageDetectionStatus,
    }

    // 确定整体健康状态
    const allServicesAvailable = Object.values(services).every(service => service.status === 'available')
    const anyServiceUnavailable = Object.values(services).some(service => service.status === 'unavailable')
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy'
    if (allServicesAvailable) {
      overallStatus = 'healthy'
    } else if (anyServiceUnavailable) {
      overallStatus = 'degraded'
    } else {
      overallStatus = 'unhealthy'
    }

    const healthData: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services,
      uptime: Date.now() - startTime,
      memory: getMemoryUsage(),
    }

    // 根据健康状态设置HTTP状态码
    const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 207 : 503

    return apiResponse(healthData, httpStatus, {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    })

  } catch (error) {
    console.error('Health check failed:', error)
    
    const healthData: HealthCheck = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        translation: { status: 'unavailable' },
        tts: { status: 'unavailable' },
        languageDetection: { status: 'unavailable' },
      },
      uptime: Date.now() - startTime,
      memory: getMemoryUsage(),
    }

    return apiResponse(healthData, 503)
  }
} 