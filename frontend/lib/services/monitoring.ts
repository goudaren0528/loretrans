/**
 * 基础监控系统
 * 收集关键指标、配置告警规则、实现实时系统状态页面
 */

import { createSupabaseBrowserClient } from '../supabase'

// 监控指标类型
export interface MetricData {
  name: string
  value: number
  timestamp: Date
  labels?: Record<string, string>
  unit?: string
}

// 告警规则
export interface AlertRule {
  id: string
  name: string
  metric: string
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
  threshold: number
  duration: number // 持续时间（秒）
  enabled: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

// 系统状态
export interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'down'
  services: {
    [key: string]: {
      status: 'healthy' | 'degraded' | 'down'
      responseTime?: number
      lastCheck: Date
      uptime?: number
    }
  }
  metrics: {
    [key: string]: number
  }
  alerts: Alert[]
}

// 告警信息
export interface Alert {
  id: string
  rule: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
}

class MonitoringService {
  private metrics: Map<string, MetricData[]> = new Map()
  private alerts: Alert[] = []
  private alertRules: AlertRule[] = []
  private supabase = createSupabaseBrowserClient()

  constructor() {
    this.initializeDefaultRules()
    this.startMetricsCollection()
  }

  /**
   * 初始化默认告警规则
   */
  private initializeDefaultRules() {
    const defaultRules: AlertRule[] = [
      {
        id: 'api_error_rate',
        name: 'API Error Rate High',
        metric: 'api_error_rate',
        condition: 'gt',
        threshold: 5, // 5%
        duration: 300, // 5分钟
        enabled: true,
        severity: 'high',
        description: 'API error rate exceeds 5% for 5 minutes'
      },
      {
        id: 'api_response_time',
        name: 'API Response Time High',
        metric: 'api_response_time_avg',
        condition: 'gt',
        threshold: 3000, // 3秒
        duration: 300,
        enabled: true,
        severity: 'medium',
        description: 'Average API response time exceeds 3 seconds'
      },
      {
        id: 'translation_service_down',
        name: 'Translation Service Down',
        metric: 'translation_service_health',
        condition: 'eq',
        threshold: 0,
        duration: 60,
        enabled: true,
        severity: 'critical',
        description: 'Translation service is down'
      },
      {
        id: 'credit_consumption_spike',
        name: 'Credit Consumption Spike',
        metric: 'credits_consumed_per_minute',
        condition: 'gt',
        threshold: 1000,
        duration: 60,
        enabled: true,
        severity: 'medium',
        description: 'Credit consumption exceeds 1000 per minute'
      },
      {
        id: 'user_registration_drop',
        name: 'User Registration Drop',
        metric: 'user_registrations_per_hour',
        condition: 'lt',
        threshold: 1,
        duration: 3600,
        enabled: true,
        severity: 'low',
        description: 'User registrations below 1 per hour'
      }
    ]

    this.alertRules = defaultRules
  }

  /**
   * 开始指标收集
   */
  private startMetricsCollection() {
    // 每分钟收集一次指标
    setInterval(async () => {
      await this.collectSystemMetrics()
    }, 60000)

    // 每30秒检查一次告警
    setInterval(() => {
      this.checkAlerts()
    }, 30000)
  }

  /**
   * 收集系统指标
   */
  private async collectSystemMetrics() {
    try {
      // API响应时间和错误率
      await this.collectAPIMetrics()
      
      // 翻译服务健康状态
      await this.collectTranslationServiceMetrics()
      
      // 积分消耗指标
      await this.collectCreditMetrics()
      
      // 用户活动指标
      await this.collectUserMetrics()
      
    } catch (error) {
      console.error('Failed to collect system metrics:', error)
    }
  }

  /**
   * 收集API指标
   */
  private async collectAPIMetrics() {
    // 这里应该从日志或数据库中获取API指标
    // 暂时使用模拟数据
    const now = new Date()
    
    this.recordMetric({
      name: 'api_requests_total',
      value: Math.floor(Math.random() * 100) + 50,
      timestamp: now,
      unit: 'count'
    })

    this.recordMetric({
      name: 'api_response_time_avg',
      value: Math.floor(Math.random() * 2000) + 500,
      timestamp: now,
      unit: 'ms'
    })

    this.recordMetric({
      name: 'api_error_rate',
      value: Math.random() * 10,
      timestamp: now,
      unit: 'percent'
    })
  }

  /**
   * 收集翻译服务指标
   */
  private async collectTranslationServiceMetrics() {
    try {
      // 检查NLLB服务健康状态
      const nllbHealthy = await this.checkServiceHealth('http://localhost:8080/health')
      
      this.recordMetric({
        name: 'translation_service_health',
        value: nllbHealthy ? 1 : 0,
        timestamp: new Date(),
        labels: { service: 'nllb-local' }
      })

      // 翻译成功率
      this.recordMetric({
        name: 'translation_success_rate',
        value: Math.random() * 20 + 80, // 80-100%
        timestamp: new Date(),
        unit: 'percent'
      })

    } catch (error) {
      console.error('Failed to collect translation service metrics:', error)
    }
  }

  /**
   * 收集积分指标
   */
  private async collectCreditMetrics() {
    try {
      // 从数据库获取积分消耗数据
      const { data: creditData } = await this.supabase
        .from('credit_transactions')
        .select('credits_amount, created_at')
        .gte('created_at', new Date(Date.now() - 60000).toISOString()) // 最近1分钟
        .eq('transaction_type', 'consume')

      const creditsConsumed = creditData?.reduce((sum, tx) => sum + Math.abs(tx.credits_amount), 0) || 0

      this.recordMetric({
        name: 'credits_consumed_per_minute',
        value: creditsConsumed,
        timestamp: new Date(),
        unit: 'credits'
      })

    } catch (error) {
      console.error('Failed to collect credit metrics:', error)
    }
  }

  /**
   * 收集用户指标
   */
  private async collectUserMetrics() {
    try {
      // 最近1小时的用户注册数
      const { data: userData } = await this.supabase
        .from('users')
        .select('id, created_at')
        .gte('created_at', new Date(Date.now() - 3600000).toISOString())

      this.recordMetric({
        name: 'user_registrations_per_hour',
        value: userData?.length || 0,
        timestamp: new Date(),
        unit: 'count'
      })

      // 活跃用户数（最近24小时有翻译活动）
      const { data: activeUsers } = await this.supabase
        .from('credit_transactions')
        .select('user_id')
        .gte('created_at', new Date(Date.now() - 86400000).toISOString())
        .eq('transaction_type', 'consume')

      const uniqueActiveUsers = new Set(activeUsers?.map(tx => tx.user_id)).size

      this.recordMetric({
        name: 'daily_active_users',
        value: uniqueActiveUsers,
        timestamp: new Date(),
        unit: 'count'
      })

    } catch (error) {
      console.error('Failed to collect user metrics:', error)
    }
  }

  /**
   * 检查服务健康状态
   */
  private async checkServiceHealth(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        timeout: 5000
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * 记录指标
   */
  recordMetric(metric: MetricData) {
    const key = metric.name
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }

    const metrics = this.metrics.get(key)!
    metrics.push(metric)

    // 只保留最近1小时的数据
    const oneHourAgo = new Date(Date.now() - 3600000)
    this.metrics.set(key, metrics.filter(m => m.timestamp > oneHourAgo))
  }

  /**
   * 检查告警规则
   */
  private checkAlerts() {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue

      const metrics = this.metrics.get(rule.metric)
      if (!metrics || metrics.length === 0) continue

      // 获取指定时间窗口内的指标
      const windowStart = new Date(Date.now() - rule.duration * 1000)
      const windowMetrics = metrics.filter(m => m.timestamp >= windowStart)

      if (windowMetrics.length === 0) continue

      // 计算平均值
      const avgValue = windowMetrics.reduce((sum, m) => sum + m.value, 0) / windowMetrics.length

      // 检查是否触发告警条件
      let triggered = false
      switch (rule.condition) {
        case 'gt':
          triggered = avgValue > rule.threshold
          break
        case 'lt':
          triggered = avgValue < rule.threshold
          break
        case 'eq':
          triggered = avgValue === rule.threshold
          break
        case 'gte':
          triggered = avgValue >= rule.threshold
          break
        case 'lte':
          triggered = avgValue <= rule.threshold
          break
      }

      if (triggered) {
        this.triggerAlert(rule, avgValue)
      }
    }
  }

  /**
   * 触发告警
   */
  private triggerAlert(rule: AlertRule, currentValue: number) {
    // 检查是否已经有相同的未解决告警
    const existingAlert = this.alerts.find(
      alert => alert.rule === rule.id && !alert.resolved
    )

    if (existingAlert) return // 避免重复告警

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rule: rule.id,
      severity: rule.severity,
      message: `${rule.name}: ${rule.description}. Current value: ${currentValue}`,
      timestamp: new Date(),
      resolved: false
    }

    this.alerts.push(alert)
    console.warn(`🚨 ALERT TRIGGERED: ${alert.message}`)

    // 发送告警通知（可以集成邮件、Slack等）
    this.sendAlertNotification(alert)
  }

  /**
   * 发送告警通知
   */
  private async sendAlertNotification(alert: Alert) {
    // 这里可以集成各种通知渠道
    console.log(`📧 Sending alert notification: ${alert.message}`)
    
    // 示例：发送到Webhook
    if (process.env.ALERT_WEBHOOK_URL) {
      try {
        await fetch(process.env.ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 Transly Alert: ${alert.message}`,
            severity: alert.severity,
            timestamp: alert.timestamp
          })
        })
      } catch (error) {
        console.error('Failed to send webhook notification:', error)
      }
    }
  }

  /**
   * 获取系统状态
   */
  getSystemStatus(): SystemStatus {
    const now = new Date()
    const recentAlerts = this.alerts.filter(
      alert => !alert.resolved && (now.getTime() - alert.timestamp.getTime()) < 3600000
    )

    // 确定整体状态
    let overallStatus: 'healthy' | 'degraded' | 'down' = 'healthy'
    if (recentAlerts.some(alert => alert.severity === 'critical')) {
      overallStatus = 'down'
    } else if (recentAlerts.some(alert => ['high', 'medium'].includes(alert.severity))) {
      overallStatus = 'degraded'
    }

    // 获取最新指标值
    const latestMetrics: Record<string, number> = {}
    this.metrics.forEach((metricList, name) => {
      if (metricList.length > 0) {
        latestMetrics[name] = metricList[metricList.length - 1].value
      }
    })

    return {
      overall: overallStatus,
      services: {
        'nllb-translation': {
          status: latestMetrics['translation_service_health'] === 1 ? 'healthy' : 'down',
          responseTime: latestMetrics['api_response_time_avg'],
          lastCheck: now,
          uptime: latestMetrics['translation_service_health'] === 1 ? 99.9 : 0
        },
        'database': {
          status: 'healthy', // 简化处理
          lastCheck: now,
          uptime: 99.9
        },
        'payment': {
          status: 'healthy', // 简化处理
          lastCheck: now,
          uptime: 99.9
        }
      },
      metrics: latestMetrics,
      alerts: recentAlerts
    }
  }

  /**
   * 获取指标历史数据
   */
  getMetricHistory(metricName: string, duration: number = 3600): MetricData[] {
    const metrics = this.metrics.get(metricName) || []
    const cutoff = new Date(Date.now() - duration * 1000)
    return metrics.filter(m => m.timestamp >= cutoff)
  }

  /**
   * 解决告警
   */
  resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      alert.resolvedAt = new Date()
      console.log(`✅ Alert resolved: ${alert.message}`)
    }
  }

  /**
   * 添加自定义告警规则
   */
  addAlertRule(rule: AlertRule) {
    this.alertRules.push(rule)
  }

  /**
   * 获取所有告警规则
   */
  getAlertRules(): AlertRule[] {
    return [...this.alertRules]
  }
}

// 单例实例
let monitoringService: MonitoringService | null = null

export function getMonitoringService(): MonitoringService {
  if (!monitoringService) {
    monitoringService = new MonitoringService()
  }
  return monitoringService
}

// 便捷函数
export function recordMetric(metric: MetricData) {
  const service = getMonitoringService()
  service.recordMetric(metric)
}

export function getSystemStatus(): SystemStatus {
  const service = getMonitoringService()
  return service.getSystemStatus()
}

export function getMetricHistory(metricName: string, duration?: number): MetricData[] {
  const service = getMonitoringService()
  return service.getMetricHistory(metricName, duration)
}
