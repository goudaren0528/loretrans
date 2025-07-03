'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Check, 
  Crown, 
  Zap, 
  Calendar, 
  CreditCard,
  Shield,
  Star,
  Repeat
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

interface SubscriptionPlan {
  id: string
  name: string
  monthlyPrice: number
  yearlyPrice: number
  monthlyCredits: number
  yearlyCredits: number
  features: string[]
  limitations: string[]
  popular: boolean
  recommended: boolean
  description: string
  savings: number // 年付节省的百分比
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic_monthly',
    name: '基础月付',
    monthlyPrice: 12,
    yearlyPrice: 120,
    monthlyCredits: 7200,
    yearlyCredits: 86400,
    savings: 17,
    popular: false,
    recommended: false,
    description: '适合稳定需求的个人用户',
    features: [
      '每月7,200积分 (约72万字符)',
      '支持所有小语种翻译',
      '文档翻译功能',
      '30天翻译历史',
      '语音播放功能',
      '优先处理',
      '邮件支持',
      '自动续费，无需手动充值'
    ],
    limitations: [
      '不支持批量翻译',
      '不支持API访问'
    ]
  },
  {
    id: 'professional_monthly',
    name: '专业月付',
    monthlyPrice: 30,
    yearlyPrice: 300,
    monthlyCredits: 25000,
    yearlyCredits: 300000,
    savings: 17,
    popular: true,
    recommended: true,
    description: '专业用户和小团队的理想选择',
    features: [
      '每月25,000积分 (约250万字符)',
      '支持所有小语种翻译',
      '文档翻译功能',
      '90天翻译历史',
      '语音播放功能',
      '批量翻译工具',
      '基础API访问 (1000次/月)',
      '优先处理',
      '优先邮件支持',
      '自动续费 + 10%积分奖励'
    ],
    limitations: [
      '不支持团队管理'
    ]
  },
  {
    id: 'enterprise_monthly',
    name: '企业月付',
    monthlyPrice: 80,
    yearlyPrice: 800,
    monthlyCredits: 70000,
    yearlyCredits: 840000,
    savings: 17,
    popular: false,
    recommended: false,
    description: '企业级功能和专属支持',
    features: [
      '每月70,000积分 (约700万字符)',
      '支持所有小语种翻译',
      '文档翻译功能',
      '无限翻译历史',
      '语音播放功能',
      '批量翻译工具',
      '完整API访问 (10000次/月)',
      '团队管理功能 (最多10人)',
      '最高优先级处理',
      '专属客户支持',
      '自动续费 + 15%积分奖励',
      '定制化功能支持'
    ],
    limitations: []
  }
]

interface UserSubscription {
  id: string
  planId: string
  status: 'active' | 'cancelled' | 'past_due'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  isYearly: boolean
}

export function SubscriptionPlans() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [isYearly, setIsYearly] = useState(false)
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push('/auth/signin?redirect=/pricing')
      return
    }

    setLoading(planId)
    
    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          isYearly,
          userId: user.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create subscription')
      }

      const { checkoutUrl } = await response.json()
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Subscription error:', error)
      alert('订阅失败，请稍后重试')
    } finally {
      setLoading(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!userSubscription) return

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: userSubscription.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      // 刷新订阅状态
      // fetchUserSubscription()
      alert('订阅已取消，将在当前周期结束后停止')
    } catch (error) {
      console.error('Cancel subscription error:', error)
      alert('取消订阅失败，请联系客服')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">订阅套餐</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          选择月度或年度订阅，享受自动续费便利和额外积分奖励。随时可以取消，剩余积分保留。
        </p>
        
        {/* 年付/月付切换 */}
        <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg inline-flex">
          <span className={`font-medium ${!isYearly ? 'text-blue-600' : 'text-gray-600'}`}>
            月付
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-green-600"
          />
          <span className={`font-medium ${isYearly ? 'text-green-600' : 'text-gray-600'}`}>
            年付
          </span>
          {isYearly && (
            <Badge className="bg-green-100 text-green-800 ml-2">
              节省17%
            </Badge>
          )}
        </div>
      </div>

      {/* 当前订阅状态 */}
      {userSubscription && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-blue-900">当前订阅</CardTitle>
                <Badge className={
                  userSubscription.status === 'active' ? 'bg-green-100 text-green-800' :
                  userSubscription.status === 'cancelled' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }>
                  {userSubscription.status === 'active' ? '活跃' :
                   userSubscription.status === 'cancelled' ? '已取消' : '逾期'}
                </Badge>
              </div>
              {userSubscription.status === 'active' && !userSubscription.cancelAtPeriodEnd && (
                <Button variant="outline" size="sm" onClick={handleCancelSubscription}>
                  取消订阅
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">订阅类型:</span>
                <span className="ml-2 font-medium">
                  {userSubscription.isYearly ? '年付' : '月付'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">下次续费:</span>
                <span className="ml-2 font-medium">
                  {new Date(userSubscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>
            {userSubscription.cancelAtPeriodEnd && (
              <div className="mt-3 p-3 bg-orange-100 rounded-lg text-orange-800 text-sm">
                ⚠️ 订阅将在 {new Date(userSubscription.currentPeriodEnd).toLocaleDateString()} 结束，不会自动续费
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 订阅套餐 */}
      <div className="grid md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
          const credits = isYearly ? plan.yearlyCredits : plan.monthlyCredits
          const isCurrentPlan = userSubscription?.planId === plan.id
          const isLoading = loading === plan.id

          return (
            <Card key={plan.id} className={`relative ${
              plan.recommended ? 'ring-2 ring-blue-500 shadow-xl scale-105' : ''
            } ${plan.popular ? 'border-green-500' : ''}`}>
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    推荐
                  </Badge>
                </div>
              )}
              {plan.popular && !plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-4 py-1">
                    最受欢迎
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    ${price}
                    <span className="text-lg text-gray-500 font-normal">
                      /{isYearly ? '年' : '月'}
                    </span>
                  </div>
                  {isYearly && (
                    <div className="text-sm text-green-600">
                      相比月付节省 ${(plan.monthlyPrice * 12 - plan.yearlyPrice).toFixed(0)}
                    </div>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 积分信息 */}
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {credits.toLocaleString()}积分
                  </div>
                  <div className="text-sm text-gray-600">
                    {isYearly ? '每年' : '每月'} • 约{Math.floor(credits / 10000)}万字符
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    <Repeat className="w-3 h-3 inline mr-1" />
                    自动续费 + {plan.id.includes('enterprise') ? '15%' : '10%'}积分奖励
                  </div>
                </div>

                {/* 功能列表 */}
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* 限制 */}
                {plan.limitations.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-500 mb-2">限制：</div>
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="text-xs text-gray-500">
                        • {limitation}
                      </div>
                    ))}
                  </div>
                )}

                {/* 订阅优势 */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-green-800 mb-2">
                    <Shield className="w-4 h-4 inline mr-1" />
                    订阅优势
                  </div>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• 自动续费，无需手动充值</li>
                    <li>• 订阅用户专享积分奖励</li>
                    <li>• 优先客服支持</li>
                    <li>• 随时取消，剩余积分保留</li>
                  </ul>
                </div>
              </CardContent>

              <CardFooter>
                {isCurrentPlan ? (
                  <Button className="w-full" disabled>
                    <Crown className="w-4 h-4 mr-2" />
                    当前套餐
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.recommended ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        处理中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        开始订阅
                      </div>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* 订阅说明 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">订阅说明</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">自动续费</h4>
            <p>订阅会自动续费，确保您的翻译服务不中断。您可以随时在账户设置中取消订阅。</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">积分奖励</h4>
            <p>订阅用户每次续费时会获得额外的积分奖励，专业版10%，企业版15%。</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">取消政策</h4>
            <p>可随时取消订阅，取消后将在当前计费周期结束时停止，剩余积分会保留在您的账户中。</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">升级降级</h4>
            <p>可随时升级或降级订阅套餐，价格差异会按比例计算并在下次账单中调整。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
