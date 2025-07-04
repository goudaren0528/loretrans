'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Coins, Zap, Star, Gift, Users, BookOpen, Building, Globe } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { ConditionalRender } from '@/components/auth/auth-guard'
import { CreditBalance } from '@/components/credits/credit-balance'
import { authService } from '@/lib/services/auth'

// 用户场景定义
const USER_SCENARIOS = {
  student: {
    id: 'student',
    name: '学生用户',
    icon: BookOpen,
    description: '学术论文、作业翻译',
    monthlyUsage: '1-5K字符',
    recommendedPlan: 'starter',
    features: ['学术文献翻译', '作业辅助', '研究资料处理'],
    testimonial: {
      text: '我用它翻译了整个学期的海地文学作品，准确率很高！',
      author: '张同学 - 语言学专业'
    }
  },
  individual: {
    id: 'individual',
    name: '个人用户',
    icon: Users,
    description: '博客内容、社交媒体',
    monthlyUsage: '5-15K字符',
    recommendedPlan: 'basic',
    features: ['个人博客翻译', '社交媒体内容', '日常沟通'],
    testimonial: {
      text: '作为移民，这个工具帮我处理了很多官方文件翻译。',
      author: 'Maria - 海地移民'
    }
  },
  professional: {
    id: 'professional',
    name: '专业人士',
    icon: Building,
    description: '客户文档、商务翻译',
    monthlyUsage: '15-50K字符',
    recommendedPlan: 'pro',
    features: ['商务文档翻译', '客户沟通', '专业资料'],
    testimonial: {
      text: '帮助我们公司成功进入了缅甸市场，翻译质量很专业。',
      author: 'David - 跨境电商经理'
    }
  },
  enterprise: {
    id: 'enterprise',
    name: '企业用户',
    icon: Globe,
    description: '大规模内容本地化',
    monthlyUsage: '50K+字符',
    recommendedPlan: 'business',
    features: ['批量翻译', 'API访问', '团队管理', '优先支持'],
    testimonial: {
      text: 'NGO工作中经常需要处理多语种文档，这个工具节省了大量时间。',
      author: 'Sarah - 国际NGO项目经理'
    }
  }
}

// 定价计划
const PRICING_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 5,
    originalPrice: 5,
    credits: 2500,
    discount: 0,
    popular: false,
    description: '适合轻度使用的学生和个人用户',
    features: [
      '2,500积分 (约25万字符)',
      '支持所有小语种',
      '文档翻译功能',
      '7天翻译历史',
      '邮件支持'
    ],
    limitations: [
      '不支持批量翻译',
      '不支持API访问'
    ],
    bestFor: ['学生', '轻度个人用户'],
    usageExample: '约可翻译10-15篇学术论文'
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 10,
    originalPrice: 12,
    credits: 6000,
    discount: 17,
    popular: true,
    description: '最受欢迎的个人用户套餐',
    features: [
      '6,000积分 (约60万字符)',
      '支持所有小语种',
      '文档翻译功能',
      '30天翻译历史',
      '语音播放功能',
      '优先处理',
      '邮件支持'
    ],
    limitations: [
      '不支持批量翻译',
      '不支持API访问'
    ],
    bestFor: ['个人博主', '移民用户', '自由职业者'],
    usageExample: '约可翻译30-40篇文档或博客'
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    price: 25,
    originalPrice: 30,
    credits: 20000,
    discount: 17,
    popular: false,
    description: '专业用户和小企业的理想选择',
    features: [
      '20,000积分 (约200万字符)',
      '支持所有小语种',
      '文档翻译功能',
      '90天翻译历史',
      '语音播放功能',
      '批量翻译工具',
      '基础API访问',
      '优先处理',
      '优先邮件支持'
    ],
    limitations: [
      '不支持团队管理'
    ],
    bestFor: ['专业人士', '小企业', '跨境电商'],
    usageExample: '约可翻译100-150篇商务文档'
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 50,
    originalPrice: 60,
    credits: 50000,
    discount: 17,
    popular: false,
    description: '企业级功能和支持',
    features: [
      '50,000积分 (约500万字符)',
      '支持所有小语种',
      '文档翻译功能',
      '无限翻译历史',
      '语音播放功能',
      '批量翻译工具',
      '完整API访问',
      '团队管理功能',
      '最高优先级处理',
      '专属客户支持'
    ],
    limitations: [],
    bestFor: ['中小企业', '团队协作', 'NGO组织'],
    usageExample: '约可翻译300-500篇企业文档'
  }
}

export function PricingPageV2() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const t = useTranslations('PricingPage')
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<string>('individual')

  const handlePurchase = async (planId: string) => {
    if (authLoading) return
    
    if (!user) {
      router.push('/auth/signin?redirect=/pricing')
      return
    }

    setLoading(planId)
    
    try {
      const session = await authService.getSession()
      if (!session?.access_token) {
        throw new Error('No valid session')
      }

      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          planId: planId,
          userId: user.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { checkoutUrl } = await response.json()
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Purchase error:', error)
      alert('购买失败，请稍后重试')
    } finally {
      setLoading(null)
    }
  }

  const currentScenario = USER_SCENARIOS[selectedScenario as keyof typeof USER_SCENARIOS]
  const recommendedPlan = PRICING_PLANS[currentScenario.recommendedPlan as keyof typeof PRICING_PLANS]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            选择适合您的翻译套餐
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            基于使用场景的智能推荐，让每一分钱都物有所值
          </p>
          
          {/* Credit Balance for logged in users */}
          <ConditionalRender condition={!!user}>
            <div className="mt-6">
              <CreditBalance />
            </div>
          </ConditionalRender>
        </div>

        {/* User Scenario Selector */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            🎯 首先，告诉我们您的使用场景
          </h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            {Object.values(USER_SCENARIOS).map((scenario) => {
              const Icon = scenario.icon
              return (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedScenario === scenario.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedScenario === scenario.id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        selectedScenario === scenario.id ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{scenario.name}</div>
                      <div className="text-sm text-gray-500">{scenario.monthlyUsage}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{scenario.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Recommended Plan Highlight */}
        <div className="mb-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 text-yellow-300" />
                <span className="text-lg font-semibold">为您推荐</span>
              </div>
              <h3 className="text-3xl font-bold mb-2">{recommendedPlan.name} 套餐</h3>
              <p className="text-blue-100 mb-4">{recommendedPlan.description}</p>
              <div className="text-2xl font-bold">
                ${recommendedPlan.price}
                {recommendedPlan.discount > 0 && (
                  <span className="text-lg text-blue-200 line-through ml-2">
                    ${recommendedPlan.originalPrice}
                  </span>
                )}
              </div>
              <p className="text-blue-100 mt-2">{recommendedPlan.usageExample}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6">
              <h4 className="font-semibold mb-3">用户评价</h4>
              <blockquote className="text-blue-100 italic mb-3">
                "{currentScenario.testimonial.text}"
              </blockquote>
              <cite className="text-sm text-blue-200">
                — {currentScenario.testimonial.author}
              </cite>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {Object.values(PRICING_PLANS).map((plan) => {
            const isRecommended = plan.id === currentScenario.recommendedPlan
            const isLoading = loading === plan.id
            
            return (
              <Card key={plan.id} className={`relative ${
                isRecommended ? 'ring-2 ring-blue-500 shadow-xl scale-105' : ''
              } ${plan.popular ? 'border-green-500' : ''}`}>
                {isRecommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      推荐给您
                    </Badge>
                  </div>
                )}
                {plan.popular && !isRecommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-4 py-1">
                      最受欢迎
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    {plan.discount > 0 && (
                      <div className="text-right">
                        <div className="text-lg text-gray-500 line-through">
                          ${plan.originalPrice}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          省{plan.discount}%
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardDescription className="text-center">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {plan.credits.toLocaleString()}积分
                    </div>
                    <div className="text-sm text-gray-600">
                      约{Math.floor(plan.credits / 10)}万字符
                    </div>
                  </div>

                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

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

                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-600 mb-1">适合：</div>
                    <div className="flex flex-wrap gap-1">
                      {plan.bestFor.map((user, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {user}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    💡 {plan.usageExample}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isRecommended ? "default" : "outline"}
                    onClick={() => handlePurchase(plan.id)}
                    disabled={isLoading || authLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        处理中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4" />
                        选择此套餐
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Value Comparison */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            {t('cost_comparison.title')}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-red-50 rounded-xl">
              <div className="text-4xl font-bold text-red-600 mb-2">{t('cost_comparison.human_translation.price')}</div>
              <div className="text-lg font-medium text-red-800 mb-2">{t('cost_comparison.human_translation.title')}</div>
              <div className="text-sm text-red-600">{t('cost_comparison.human_translation.description')}</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="text-4xl font-bold text-gray-500 mb-2">{t('cost_comparison.google_translate.price')}</div>
              <div className="text-lg font-medium text-gray-700 mb-2">{t('cost_comparison.google_translate.title')}</div>
              <div className="text-sm text-gray-500">{t('cost_comparison.google_translate.description')}</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
              <div className="text-4xl font-bold text-green-600 mb-2">{t('cost_comparison.transly.price')}</div>
              <div className="text-lg font-medium text-green-800 mb-2">{t('cost_comparison.transly.title')}</div>
              <div className="text-sm text-green-600">{t('cost_comparison.transly.description')}</div>
              <div className="mt-3 text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                {t('cost_comparison.transly.savings')}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            常见问题
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">积分如何计算？</h4>
              <p className="text-gray-600 text-sm">
                500字符以下完全免费，超出部分按0.1积分/字符计费。例如翻译1000字符需要消耗50积分。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">积分会过期吗？</h4>
              <p className="text-gray-600 text-sm">
                积分永不过期，您可以随时使用。我们建议根据实际使用量选择合适的套餐。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">支持哪些支付方式？</h4>
              <p className="text-gray-600 text-sm">
                支持信用卡、借记卡等主流支付方式，通过安全的Creem支付系统处理。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">可以随时升级套餐吗？</h4>
              <p className="text-gray-600 text-sm">
                当然可以！您可以随时购买更大的积分包，积分会立即到账并累加到您的账户中。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
