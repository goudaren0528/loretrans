/**
 * 翻译服务容错机制
 * 实现NLLB本地服务 + HuggingFace API双重备份
 * 包含健康检查、自动切换、重试机制和降级策略
 */

import { APP_CONFIG } from '../../config/app.config'

// 翻译服务类型
export type TranslationServiceType = 'nllb-local' | 'huggingface' | 'mock'

// 服务健康状态
export interface ServiceHealth {
  service: TranslationServiceType
  isHealthy: boolean
  responseTime: number
  lastCheck: Date
  errorCount: number
  consecutiveErrors: number
}

// 翻译请求接口
export interface TranslationRequest {
  text: string
  sourceLanguage: string
  targetLanguage: string
  options?: {
    priority?: 'speed' | 'quality'
    timeout?: number
    retries?: number
  }
}

// 翻译结果接口
export interface TranslationResult {
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence?: number
  processingTime: number
  method: TranslationServiceType
  fallbackUsed?: boolean
  retryCount?: number
}

// 服务配置
const SERVICE_CONFIG = {
  nllb: {
    url: process.env.NLLB_SERVICE_URL || 'http://localhost:8080',
    timeout: 30000,
    maxRetries: 3,
    healthCheckInterval: 60000, // 1分钟
    maxConsecutiveErrors: 5
  },
  huggingface: {
    url: 'https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M',
    timeout: 45000,
    maxRetries: 2,
    healthCheckInterval: 120000, // 2分钟
    maxConsecutiveErrors: 3
  }
}

class TranslationServiceManager {
  private serviceHealth: Map<TranslationServiceType, ServiceHealth> = new Map()
  private healthCheckIntervals: Map<TranslationServiceType, NodeJS.Timeout> = new Map()
  private circuitBreaker: Map<TranslationServiceType, boolean> = new Map()

  constructor() {
    this.initializeServices()
    this.startHealthChecks()
  }

  /**
   * 初始化服务状态
   */
  private initializeServices() {
    const services: TranslationServiceType[] = ['nllb-local', 'huggingface']
    
    services.forEach(service => {
      this.serviceHealth.set(service, {
        service,
        isHealthy: true,
        responseTime: 0,
        lastCheck: new Date(),
        errorCount: 0,
        consecutiveErrors: 0
      })
      this.circuitBreaker.set(service, false)
    })
  }

  /**
   * 启动健康检查
   */
  private startHealthChecks() {
    // NLLB本地服务健康检查
    const nllbInterval = setInterval(async () => {
      await this.checkServiceHealth('nllb-local')
    }, SERVICE_CONFIG.nllb.healthCheckInterval)
    
    this.healthCheckIntervals.set('nllb-local', nllbInterval)

    // HuggingFace服务健康检查
    const hfInterval = setInterval(async () => {
      await this.checkServiceHealth('huggingface')
    }, SERVICE_CONFIG.huggingface.healthCheckInterval)
    
    this.healthCheckIntervals.set('huggingface', hfInterval)
  }

  /**
   * 检查服务健康状态
   */
  private async checkServiceHealth(service: TranslationServiceType): Promise<void> {
    const startTime = Date.now()
    const health = this.serviceHealth.get(service)!
    
    try {
      let isHealthy = false
      
      if (service === 'nllb-local') {
        const response = await fetch(`${SERVICE_CONFIG.nllb.url}/health`, {
          method: 'GET',
          timeout: 5000
        })
        isHealthy = response.ok
      } else if (service === 'huggingface') {
        // HuggingFace健康检查 - 发送小测试请求
        const response = await fetch(SERVICE_CONFIG.huggingface.url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: 'Hello',
            parameters: {
              src_lang: 'eng_Latn',
              tgt_lang: 'fra_Latn'
            }
          }),
          timeout: 10000
        })
        isHealthy = response.ok
      }

      const responseTime = Date.now() - startTime

      // 更新健康状态
      health.isHealthy = isHealthy
      health.responseTime = responseTime
      health.lastCheck = new Date()
      
      if (isHealthy) {
        health.consecutiveErrors = 0
        this.circuitBreaker.set(service, false)
      } else {
        health.errorCount++
        health.consecutiveErrors++
        
        // 熔断器逻辑
        if (health.consecutiveErrors >= SERVICE_CONFIG[service === 'nllb-local' ? 'nllb' : 'huggingface'].maxConsecutiveErrors) {
          this.circuitBreaker.set(service, true)
          console.warn(`Circuit breaker activated for ${service} after ${health.consecutiveErrors} consecutive errors`)
        }
      }

      console.log(`Health check for ${service}: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'} (${responseTime}ms)`)
      
    } catch (error) {
      console.error(`Health check failed for ${service}:`, error)
      
      health.isHealthy = false
      health.errorCount++
      health.consecutiveErrors++
      health.lastCheck = new Date()
      
      if (health.consecutiveErrors >= SERVICE_CONFIG[service === 'nllb-local' ? 'nllb' : 'huggingface'].maxConsecutiveErrors) {
        this.circuitBreaker.set(service, true)
      }
    }
  }

  /**
   * 获取最佳可用服务
   */
  private getBestAvailableService(): TranslationServiceType {
    // 优先使用NLLB本地服务
    const nllbHealth = this.serviceHealth.get('nllb-local')!
    if (nllbHealth.isHealthy && !this.circuitBreaker.get('nllb-local')) {
      return 'nllb-local'
    }

    // 备用HuggingFace服务
    const hfHealth = this.serviceHealth.get('huggingface')!
    if (hfHealth.isHealthy && !this.circuitBreaker.get('huggingface')) {
      return 'huggingface'
    }

    // 降级到mock服务
    console.warn('All translation services are unhealthy, falling back to mock service')
    return 'mock'
  }

  /**
   * 执行翻译（带重试和容错）
   */
  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const startTime = Date.now()
    let lastError: Error | null = null
    let retryCount = 0
    let fallbackUsed = false

    // 获取最佳服务
    let service = this.getBestAvailableService()
    const maxRetries = request.options?.retries || 3

    while (retryCount <= maxRetries) {
      try {
        let result: TranslationResult

        if (service === 'nllb-local') {
          result = await this.translateWithNLLB(request)
        } else if (service === 'huggingface') {
          result = await this.translateWithHuggingFace(request)
          fallbackUsed = true
        } else {
          result = await this.translateWithMock(request)
          fallbackUsed = true
        }

        result.retryCount = retryCount
        result.fallbackUsed = fallbackUsed
        
        return result

      } catch (error) {
        console.error(`Translation attempt ${retryCount + 1} failed with ${service}:`, error)
        lastError = error instanceof Error ? error : new Error('Unknown error')
        
        // 更新服务健康状态
        const health = this.serviceHealth.get(service)
        if (health) {
          health.errorCount++
          health.consecutiveErrors++
        }

        retryCount++

        // 如果当前服务失败，尝试切换到备用服务
        if (retryCount <= maxRetries) {
          if (service === 'nllb-local') {
            service = 'huggingface'
            fallbackUsed = true
          } else if (service === 'huggingface') {
            service = 'mock'
            fallbackUsed = true
          }
          
          // 等待一段时间再重试
          await new Promise(resolve => setTimeout(resolve, Math.min(1000 * retryCount, 5000)))
        }
      }
    }

    // 所有重试都失败了
    throw new Error(`Translation failed after ${retryCount} attempts. Last error: ${lastError?.message}`)
  }

  /**
   * NLLB本地服务翻译
   */
  private async translateWithNLLB(request: TranslationRequest): Promise<TranslationResult> {
    const startTime = Date.now()
    
    const response = await fetch(`${SERVICE_CONFIG.nllb.url}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: request.text,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage
      }),
      timeout: request.options?.timeout || SERVICE_CONFIG.nllb.timeout
    })

    if (!response.ok) {
      throw new Error(`NLLB service error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const processingTime = Date.now() - startTime

    return {
      translatedText: data.translatedText,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      confidence: data.confidence,
      processingTime,
      method: 'nllb-local'
    }
  }

  /**
   * HuggingFace API翻译
   */
  private async translateWithHuggingFace(request: TranslationRequest): Promise<TranslationResult> {
    const startTime = Date.now()
    
    // NLLB语言代码映射
    const langMap: Record<string, string> = {
      'ht': 'hat_Latn',
      'lo': 'lao_Laoo',
      'sw': 'swh_Latn',
      'my': 'mya_Mymr',
      'te': 'tel_Telu',
      'en': 'eng_Latn',
      'zh': 'zho_Hans',
      'fr': 'fra_Latn',
      'es': 'spa_Latn',
      'pt': 'por_Latn',
      'ar': 'arb_Arab'
    }

    const srcLang = langMap[request.sourceLanguage] || 'eng_Latn'
    const tgtLang = langMap[request.targetLanguage] || 'eng_Latn'

    const response = await fetch(SERVICE_CONFIG.huggingface.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: request.text,
        parameters: {
          src_lang: srcLang,
          tgt_lang: tgtLang
        }
      }),
      timeout: request.options?.timeout || SERVICE_CONFIG.huggingface.timeout
    })

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const processingTime = Date.now() - startTime

    return {
      translatedText: data[0]?.translation_text || data.generated_text || request.text,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      processingTime,
      method: 'huggingface'
    }
  }

  /**
   * Mock翻译服务（降级方案）
   */
  private async translateWithMock(request: TranslationRequest): Promise<TranslationResult> {
    const startTime = Date.now()
    
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const processingTime = Date.now() - startTime

    return {
      translatedText: `[FALLBACK TRANSLATION] ${request.sourceLanguage} → ${request.targetLanguage}: "${request.text.substring(0, 100)}${request.text.length > 100 ? '...' : ''}"`,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      processingTime,
      method: 'mock'
    }
  }

  /**
   * 获取服务状态
   */
  getServiceStatus() {
    const status: Record<string, any> = {}
    
    this.serviceHealth.forEach((health, service) => {
      status[service] = {
        isHealthy: health.isHealthy,
        responseTime: health.responseTime,
        lastCheck: health.lastCheck,
        errorCount: health.errorCount,
        consecutiveErrors: health.consecutiveErrors,
        circuitBreakerOpen: this.circuitBreaker.get(service)
      }
    })

    return status
  }

  /**
   * 清理资源
   */
  destroy() {
    this.healthCheckIntervals.forEach(interval => {
      clearInterval(interval)
    })
    this.healthCheckIntervals.clear()
  }
}

// 单例实例
let translationManager: TranslationServiceManager | null = null

export function getTranslationManager(): TranslationServiceManager {
  if (!translationManager) {
    translationManager = new TranslationServiceManager()
  }
  return translationManager
}

// 主要翻译接口
export async function translateWithResilience(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  options?: {
    priority?: 'speed' | 'quality'
    timeout?: number
    retries?: number
  }
): Promise<TranslationResult> {
  const manager = getTranslationManager()
  
  return await manager.translate({
    text,
    sourceLanguage,
    targetLanguage,
    options
  })
}

// 获取服务状态
export function getTranslationServiceStatus() {
  const manager = getTranslationManager()
  return manager.getServiceStatus()
}
