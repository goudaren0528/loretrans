'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  DollarSign, 
  Target, 
  Activity,
  RefreshCw,
  Bell,
  Calendar,
  BarChart3
} from 'lucide-react'

interface BusinessMetrics {
  // 用户指标
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  newRegistrations: number
  userRetentionRate: number
  
  // 商业指标
  dailyRevenue: number
  monthlyRevenue: number
  averageOrderValue: number
  conversionRate: number
  customerLifetimeValue: number
  
  // 产品指标
  translationRequests: number
  averageTranslationLength: number
  popularLanguages: string[]
  apiUsage: number
  
  // 系统指标
  systemUptime: number
  averageResponseTime: number
  errorRate: number
  
  // 趋势数据
  trends: {
    revenue: number // 相比上期的增长率
    users: number
    conversions: number
    retention: number
  }
}

interface Alert {
  id: string
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
}

const METRIC_TARGETS = {
  dailyActiveUsers: 100,
  conversionRate: 8, // 8%
  userRetentionRate: 60, // 60%
  systemUptime: 99.5, // 99.5%
  averageResponseTime: 3000, // 3秒
  errorRate: 1, // 1%
  monthlyRevenue: 3000 // $3000
}

export function BusinessMetricsDashboard() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchMetrics()
    // 每5分钟刷新一次
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/monitoring/business-metrics')
      const data = await response.json()
      setMetrics(data.metrics)
      setAlerts(data.alerts || [])
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch business metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`/api/monitoring/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      })
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ))
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const getMetricStatus = (value: number, target: number, higherIsBetter: boolean = true) => {
    const ratio = value / target
    if (higherIsBetter) {
      if (ratio >= 1) return 'success'
      if (ratio >= 0.8) return 'warning'
      return 'error'
    } else {
      if (ratio <= 1) return 'success'
      if (ratio <= 1.2) return 'warning'
      return 'error'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Activity className="w-4 h-4 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">商业指标监控</h2>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-500">加载中...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">无法加载指标数据</h3>
        <p className="text-gray-600 mb-4">请检查监控服务是否正常运行</p>
        <Button onClick={fetchMetrics}>
          <RefreshCw className="w-4 h-4 mr-2" />
          重试
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">商业指标监控</h2>
          <p className="text-gray-600">
            实时监控关键业务指标 • 最后更新: {lastUpdated?.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            实时监控
          </Badge>
          <Button variant="outline" onClick={fetchMetrics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 告警信息 */}
      {alerts.filter(alert => !alert.acknowledged).length > 0 && (
        <div className="space-y-2">
          {alerts.filter(alert => !alert.acknowledged).map((alert) => (
            <Alert key={alert.id} className={`border-l-4 ${
              alert.type === 'error' ? 'border-l-red-500 bg-red-50' :
              alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
              alert.type === 'success' ? 'border-l-green-500 bg-green-50' :
              'border-l-blue-500 bg-blue-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <div>
                    <h4 className="font-semibold">{alert.title}</h4>
                    <AlertDescription>{alert.message}</AlertDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => acknowledgeAlert(alert.id)}
                >
                  确认
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="users">用户指标</TabsTrigger>
          <TabsTrigger value="revenue">收入指标</TabsTrigger>
          <TabsTrigger value="system">系统指标</TabsTrigger>
        </TabsList>

        {/* 总览 */}
        <TabsContent value="overview" className="space-y-6">
          {/* 核心KPI */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={getStatusColor(getMetricStatus(metrics.dailyActiveUsers, METRIC_TARGETS.dailyActiveUsers))}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">日活用户</CardTitle>
                <Users className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.dailyActiveUsers}</div>
                <div className="flex items-center text-xs">
                  {getTrendIcon(metrics.trends.users)}
                  <span className="ml-1">
                    {metrics.trends.users > 0 ? '+' : ''}{metrics.trends.users.toFixed(1)}% vs 昨日
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  目标: {METRIC_TARGETS.dailyActiveUsers}
                </div>
              </CardContent>
            </Card>

            <Card className={getStatusColor(getMetricStatus(metrics.monthlyRevenue, METRIC_TARGETS.monthlyRevenue))}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">月收入</CardTitle>
                <DollarSign className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.monthlyRevenue.toFixed(0)}</div>
                <div className="flex items-center text-xs">
                  {getTrendIcon(metrics.trends.revenue)}
                  <span className="ml-1">
                    {metrics.trends.revenue > 0 ? '+' : ''}{metrics.trends.revenue.toFixed(1)}% vs 上月
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  目标: ${METRIC_TARGETS.monthlyRevenue}
                </div>
              </CardContent>
            </Card>

            <Card className={getStatusColor(getMetricStatus(metrics.conversionRate, METRIC_TARGETS.conversionRate))}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">转化率</CardTitle>
                <Target className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(2)}%</div>
                <div className="flex items-center text-xs">
                  {getTrendIcon(metrics.trends.conversions)}
                  <span className="ml-1">
                    {metrics.trends.conversions > 0 ? '+' : ''}{metrics.trends.conversions.toFixed(1)}% vs 上期
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  目标: {METRIC_TARGETS.conversionRate}%
                </div>
              </CardContent>
            </Card>

            <Card className={getStatusColor(getMetricStatus(metrics.systemUptime, METRIC_TARGETS.systemUptime))}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">系统可用性</CardTitle>
                <CheckCircle className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.systemUptime.toFixed(2)}%</div>
                <div className="text-xs text-gray-500">
                  响应时间: {metrics.averageResponseTime}ms
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  目标: {METRIC_TARGETS.systemUptime}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 趋势图表占位 */}
          <Card>
            <CardHeader>
              <CardTitle>关键指标趋势</CardTitle>
              <CardDescription>过去30天的核心业务指标变化</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>趋势图表功能开发中...</p>
                  <p className="text-sm">将显示收入、用户、转化率等关键指标的时间趋势</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用户指标 */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>用户活跃度</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">日活用户 (DAU)</span>
                  <span className="font-semibold">{metrics.dailyActiveUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">周活用户 (WAU)</span>
                  <span className="font-semibold">{metrics.weeklyActiveUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">月活用户 (MAU)</span>
                  <span className="font-semibold">{metrics.monthlyActiveUsers}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>用户增长</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">新注册用户</span>
                  <span className="font-semibold">{metrics.newRegistrations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">用户留存率</span>
                  <span className="font-semibold">{metrics.userRetentionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">增长趋势</span>
                  <div className="flex items-center">
                    {getTrendIcon(metrics.trends.users)}
                    <span className="ml-1 text-sm">
                      {metrics.trends.users > 0 ? '+' : ''}{metrics.trends.users.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>产品使用</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">翻译请求</span>
                  <span className="font-semibold">{metrics.translationRequests.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">平均长度</span>
                  <span className="font-semibold">{metrics.averageTranslationLength} 字符</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">API调用</span>
                  <span className="font-semibold">{metrics.apiUsage.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 收入指标 */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>收入概览</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">日收入</span>
                  <span className="font-semibold">${metrics.dailyRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">月收入</span>
                  <span className="font-semibold">${metrics.monthlyRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">平均客单价</span>
                  <span className="font-semibold">${metrics.averageOrderValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">客户生命价值</span>
                  <span className="font-semibold">${metrics.customerLifetimeValue.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>转化表现</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">整体转化率</span>
                  <span className="font-semibold">{metrics.conversionRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">转化趋势</span>
                  <div className="flex items-center">
                    {getTrendIcon(metrics.trends.conversions)}
                    <span className="ml-1 text-sm">
                      {metrics.trends.conversions > 0 ? '+' : ''}{metrics.trends.conversions.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  💡 转化率目标: {METRIC_TARGETS.conversionRate}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 系统指标 */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={getStatusColor(getMetricStatus(metrics.systemUptime, METRIC_TARGETS.systemUptime))}>
              <CardHeader>
                <CardTitle>系统可用性</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.systemUptime.toFixed(3)}%</div>
                <div className="text-sm text-gray-600 mt-2">
                  目标: {METRIC_TARGETS.systemUptime}%
                </div>
              </CardContent>
            </Card>

            <Card className={getStatusColor(getMetricStatus(metrics.averageResponseTime, METRIC_TARGETS.averageResponseTime, false))}>
              <CardHeader>
                <CardTitle>响应时间</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.averageResponseTime}ms</div>
                <div className="text-sm text-gray-600 mt-2">
                  目标: &lt;{METRIC_TARGETS.averageResponseTime}ms
                </div>
              </CardContent>
            </Card>

            <Card className={getStatusColor(getMetricStatus(metrics.errorRate, METRIC_TARGETS.errorRate, false))}>
              <CardHeader>
                <CardTitle>错误率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.errorRate.toFixed(2)}%</div>
                <div className="text-sm text-gray-600 mt-2">
                  目标: &lt;{METRIC_TARGETS.errorRate}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
