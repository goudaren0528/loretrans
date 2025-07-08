'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Target,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'

interface PaymentMetrics {
  totalRevenue: number
  totalTransactions: number
  averageOrderValue: number
  conversionRate: number
  newCustomers: number
  returningCustomers: number
  topPlan: string
  growthRate: number
  period: string
}

interface PlanMetrics {
  planId: string
  planName: string
  revenue: number
  transactions: number
  conversionRate: number
  averageOrderValue: number
}

interface ConversionFunnel {
  visitors: number
  pricingPageViews: number
  checkoutInitiated: number
  paymentCompleted: number
  conversionRates: {
    visitorToPricing: number
    pricingToCheckout: number
    checkoutToPayment: number
    overallConversion: number
  }
}

export function PaymentAnalytics() {
  const [metrics, setMetrics] = useState<PaymentMetrics | null>(null)
  const [planMetrics, setPlanMetrics] = useState<PlanMetrics[]>([])
  const [funnelData, setFunnelData] = useState<ConversionFunnel | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // 获取支付指标
      const metricsResponse = await fetch(`/api/analytics/payment-metrics?range=${timeRange}`)
      const metricsData = await metricsResponse.json()
      setMetrics(metricsData)

      // 获取套餐指标
      const plansResponse = await fetch(`/api/analytics/plan-metrics?range=${timeRange}`)
      const plansData = await plansResponse.json()
      setPlanMetrics(plansData)

      // 获取转化漏斗数据
      const funnelResponse = await fetch(`/api/analytics/conversion-funnel?range=${timeRange}`)
      const funnelData = await funnelResponse.json()
      setFunnelData(funnelData)
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch(`/api/analytics/export?range=${timeRange}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payment-analytics-${timeRange}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">支付数据分析</h2>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">支付数据分析</h2>
          <p className="text-gray-600">监控关键商业指标和转化表现</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <TabsList>
              <TabsTrigger value="7d">7天</TabsTrigger>
              <TabsTrigger value="30d">30天</TabsTrigger>
              <TabsTrigger value="90d">90天</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Button variant="outline" onClick={fetchAnalyticsData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 核心指标卡片 */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总收入</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {metrics.growthRate > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span className={metrics.growthRate > 0 ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(metrics.growthRate).toFixed(1)}%
                </span>
                <span className="ml-1">vs 上期</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">交易数量</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                新客户: {metrics.newCustomers} | 回购: {metrics.returningCustomers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均客单价</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.averageOrderValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                最受欢迎: {metrics.topPlan}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">转化率</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">
                访客到付费转化
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">套餐表现</TabsTrigger>
          <TabsTrigger value="funnel">转化漏斗</TabsTrigger>
          <TabsTrigger value="trends">趋势分析</TabsTrigger>
        </TabsList>

        {/* 套餐表现 */}
        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>套餐收入表现</CardTitle>
              <CardDescription>各套餐的收入贡献和转化表现</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {planMetrics.map((plan) => (
                  <div key={plan.planId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-semibold">{plan.planName}</h4>
                        <p className="text-sm text-gray-600">
                          {plan.transactions} 笔交易 • 转化率 {plan.conversionRate.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">${plan.revenue.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">
                        平均 ${plan.averageOrderValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 转化漏斗 */}
        <TabsContent value="funnel" className="space-y-4">
          {funnelData && (
            <Card>
              <CardHeader>
                <CardTitle>转化漏斗分析</CardTitle>
                <CardDescription>用户从访问到付费的转化路径</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 漏斗可视化 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">网站访客</h4>
                        <p className="text-sm text-gray-600">总访问用户</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{funnelData.visitors.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">100%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[20px] border-l-transparent border-r-transparent border-t-gray-300"></div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">定价页面访问</h4>
                        <p className="text-sm text-gray-600">查看定价信息</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{funnelData.pricingPageViews.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">
                          {funnelData.conversionRates.visitorToPricing.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[20px] border-l-transparent border-r-transparent border-t-gray-300"></div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">发起结账</h4>
                        <p className="text-sm text-gray-600">点击购买按钮</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{funnelData.checkoutInitiated.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">
                          {funnelData.conversionRates.pricingToCheckout.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[20px] border-l-transparent border-r-transparent border-t-gray-300"></div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">完成支付</h4>
                        <p className="text-sm text-gray-600">成功付费用户</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {funnelData.paymentCompleted.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {funnelData.conversionRates.checkoutToPayment.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 关键指标 */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {funnelData.conversionRates.overallConversion.toFixed(2)}%
                      </div>
                      <div className="text-sm text-gray-600">整体转化率</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {((funnelData.paymentCompleted / funnelData.visitors) * 100).toFixed(2)}%
                      </div>
                      <div className="text-sm text-gray-600">访客到付费</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 趋势分析 */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>趋势分析</CardTitle>
              <CardDescription>收入和转化率的时间趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-8 text-gray-500">
                  📊 趋势图表功能开发中...
                  <br />
                  <span className="text-sm">将显示收入、转化率、用户增长等关键指标的时间趋势</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
