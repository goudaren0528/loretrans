// 性能监控和用户行为分析
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, any> = new Map()
  private isEnabled: boolean = true

  private constructor() {
    this.initializeMonitoring()
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private initializeMonitoring() {
    if (typeof window === 'undefined') return

    // 监听页面加载性能
    this.trackPageLoad()
    
    // 监听用户交互
    this.trackUserInteractions()
    
    // 监听错误
    this.trackErrors()
    
    // 监听网络状态
    this.trackNetworkStatus()
  }

  // 页面加载性能监控
  private trackPageLoad() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          
          const metrics = {
            dns: perfData.domainLookupEnd - perfData.domainLookupStart,
            tcp: perfData.connectEnd - perfData.connectStart,
            ssl: perfData.connectEnd - perfData.secureConnectionStart,
            ttfb: perfData.responseStart - perfData.requestStart,
            download: perfData.responseEnd - perfData.responseStart,
            domParse: perfData.domContentLoadedEventEnd - perfData.responseEnd,
            domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,
            loadComplete: perfData.loadEventEnd - perfData.navigationStart,
            redirect: perfData.redirectEnd - perfData.redirectStart,
            unload: perfData.unloadEventEnd - perfData.unloadEventStart
          }

          this.recordMetric('page_load', {
            url: window.location.href,
            ...metrics,
            timestamp: Date.now()
          })

          // 记录Core Web Vitals
          this.trackCoreWebVitals()
        }, 0)
      })
    }
  }

  // Core Web Vitals监控
  private trackCoreWebVitals() {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          
          this.recordMetric('lcp', {
            value: lastEntry.startTime,
            url: window.location.href,
            timestamp: Date.now()
          })
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            this.recordMetric('fid', {
              value: entry.processingStart - entry.startTime,
              url: window.location.href,
              timestamp: Date.now()
            })
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // CLS (Cumulative Layout Shift)
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          
          this.recordMetric('cls', {
            value: clsValue,
            url: window.location.href,
            timestamp: Date.now()
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (error) {
        console.warn('Core Web Vitals monitoring failed:', error)
      }
    }
  }

  // 用户交互监控
  private trackUserInteractions() {
    // 点击事件
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const tagName = target.tagName.toLowerCase()
      const className = target.className
      const id = target.id
      const text = target.textContent?.slice(0, 50)

      this.recordMetric('user_click', {
        tagName,
        className,
        id,
        text,
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now()
      })
    })

    // 滚动事件（节流）
    let scrollTimeout: NodeJS.Timeout
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        this.recordMetric('user_scroll', {
          scrollY: window.scrollY,
          scrollX: window.scrollX,
          documentHeight: document.documentElement.scrollHeight,
          viewportHeight: window.innerHeight,
          scrollPercentage: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100),
          timestamp: Date.now()
        })
      }, 100)
    })

    // 表单交互
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement
      if (target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea') {
        this.recordMetric('form_interaction', {
          fieldName: target.name || target.id,
          fieldType: target.type,
          valueLength: target.value.length,
          timestamp: Date.now()
        })
      }
    })
  }

  // 错误监控
  private trackErrors() {
    // JavaScript错误
    window.addEventListener('error', (event) => {
      this.recordMetric('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      })
    })

    // Promise rejection错误
    window.addEventListener('unhandledrejection', (event) => {
      this.recordMetric('promise_rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack,
        timestamp: Date.now()
      })
    })

    // 资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLElement
        this.recordMetric('resource_error', {
          tagName: target.tagName,
          src: (target as any).src || (target as any).href,
          timestamp: Date.now()
        })
      }
    }, true)
  }

  // 网络状态监控
  private trackNetworkStatus() {
    if ('navigator' in window && 'connection' in navigator) {
      const connection = (navigator as any).connection
      
      this.recordMetric('network_info', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
        timestamp: Date.now()
      })

      connection.addEventListener('change', () => {
        this.recordMetric('network_change', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          timestamp: Date.now()
        })
      })
    }

    // 在线/离线状态
    window.addEventListener('online', () => {
      this.recordMetric('network_status', { status: 'online', timestamp: Date.now() })
    })

    window.addEventListener('offline', () => {
      this.recordMetric('network_status', { status: 'offline', timestamp: Date.now() })
    })
  }

  // 记录自定义指标
  public recordMetric(name: string, data: any) {
    if (!this.isEnabled) return

    const metric = {
      name,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    }

    this.metrics.set(`${name}_${Date.now()}`, metric)

    // 批量发送指标（避免频繁请求）
    this.batchSendMetrics()
  }

  // 翻译性能监控
  public trackTranslation(data: {
    sourceLanguage: string
    targetLanguage: string
    characterCount: number
    translationTime: number
    success: boolean
    error?: string
  }) {
    this.recordMetric('translation_performance', {
      ...data,
      timestamp: Date.now()
    })
  }

  // 用户行为路径追踪
  public trackUserJourney(action: string, data?: any) {
    this.recordMetric('user_journey', {
      action,
      data,
      timestamp: Date.now()
    })
  }

  // 获取会话ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('analytics_session_id', sessionId)
    }
    return sessionId
  }

  // 批量发送指标
  private batchSendMetrics() {
    // 防抖处理，避免频繁发送
    if (this.sendTimeout) {
      clearTimeout(this.sendTimeout)
    }

    this.sendTimeout = setTimeout(() => {
      this.sendMetricsToServer()
    }, 2000) // 2秒后发送
  }

  private sendTimeout: NodeJS.Timeout | null = null

  // 发送指标到服务器
  private async sendMetricsToServer() {
    if (this.metrics.size === 0) return

    const metricsToSend = Array.from(this.metrics.values())
    this.metrics.clear()

    try {
      await fetch('/api/analytics/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: metricsToSend,
          timestamp: Date.now()
        })
      })
    } catch (error) {
      console.warn('Failed to send metrics:', error)
      // 失败的指标可以存储到localStorage，稍后重试
      this.storeFailedMetrics(metricsToSend)
    }
  }

  // 存储失败的指标
  private storeFailedMetrics(metrics: any[]) {
    try {
      const stored = localStorage.getItem('failed_metrics') || '[]'
      const failedMetrics = JSON.parse(stored)
      failedMetrics.push(...metrics)
      
      // 限制存储数量，避免占用过多空间
      if (failedMetrics.length > 100) {
        failedMetrics.splice(0, failedMetrics.length - 100)
      }
      
      localStorage.setItem('failed_metrics', JSON.stringify(failedMetrics))
    } catch (error) {
      console.warn('Failed to store metrics:', error)
    }
  }

  // 重试发送失败的指标
  public async retryFailedMetrics() {
    try {
      const stored = localStorage.getItem('failed_metrics')
      if (stored) {
        const failedMetrics = JSON.parse(stored)
        if (failedMetrics.length > 0) {
          await fetch('/api/analytics/metrics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              metrics: failedMetrics,
              timestamp: Date.now(),
              retry: true
            })
          })
          localStorage.removeItem('failed_metrics')
        }
      }
    } catch (error) {
      console.warn('Failed to retry metrics:', error)
    }
  }

  // 启用/禁用监控
  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  // 获取当前性能快照
  public getPerformanceSnapshot() {
    if (typeof window === 'undefined') return null

    return {
      memory: (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null,
      timing: performance.timing ? {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime
      } : null,
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : null
    }
  }
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance()

// React Hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance()

  const trackTranslation = (data: Parameters<typeof monitor.trackTranslation>[0]) => {
    monitor.trackTranslation(data)
  }

  const trackUserJourney = (action: string, data?: any) => {
    monitor.trackUserJourney(action, data)
  }

  const recordMetric = (name: string, data: any) => {
    monitor.recordMetric(name, data)
  }

  return {
    trackTranslation,
    trackUserJourney,
    recordMetric,
    getSnapshot: () => monitor.getPerformanceSnapshot()
  }
}
