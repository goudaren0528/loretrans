'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Check, Coins, Zap, Star, Gift } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { ConditionalRender } from '@/components/auth/auth-guard'
import { CreditBalance } from '@/components/credits/credit-balance'
import { PRICING_PLANS } from '@/config/pricing.config'
// 定义本地类型以避免导入错误
type PricingPlan = {
  id: string
  name: string
  description: string
  credits: number
  priceUSD: number
  popular?: boolean
  discount?: number
  features: string[]
  validityDays?: number
}
import { authService } from '@/lib/services/auth'

export function PricingPage() {
  const t = useTranslations('pricing')
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  // 过滤出付费商品（排除免费计划和高级套餐）
  const creditPackages = (PRICING_PLANS || []).filter(plan => 
    plan.id !== 'free' && 
    plan.id !== 'business' && 
    plan.id !== 'enterprise'
  )

  const handlePurchase = async (packageId: string) => {
    console.log('🛒 Purchase button clicked for package:', packageId)
    console.log('👤 Current user:', user ? user.email : 'Not logged in')
    console.log('🔄 Auth loading:', authLoading)
    
    // 如果认证状态还在加载中，等待一下
    if (authLoading) {
      console.log('⏳ Auth still loading, waiting...')
      return
    }
    
    if (!user) {
      console.log('🔒 User not logged in, redirecting to signin')
      router.push('/auth/signin?redirect=/pricing')
      return
    }

    console.log('⏳ Setting loading state for package:', packageId)
    setLoading(packageId)
    
    try {
      // 获取认证token
      console.log('🔑 Getting authentication token...')
      const session = await authService.getSession()
      
      if (!session?.access_token) {
        throw new Error('No authentication token available')
      }
      
      console.log('✅ Got authentication token')
      console.log('📡 Sending checkout request to API...')
      
      // 创建Creem checkout会话
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`, // 添加认证头
        },
        body: JSON.stringify({
          planId: packageId,
        }),
      })

      console.log('📊 API Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const responseData = await response.json()
      console.log('✅ API Response data:', responseData)
      
      const { url } = responseData
      
      if (!url) {
        throw new Error('No checkout URL returned from server')
      }
      
      console.log('🔗 Opening payment URL in new window:', url)
      // 在新窗口打开Creem支付页面
      const paymentWindow = window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
      
      if (!paymentWindow) {
        // 如果弹窗被阻止，提示用户并fallback到当前窗口
        alert('请允许弹窗以打开支付页面，或者我们将在当前页面打开支付')
        window.location.href = url
      } else {
        // 监听支付窗口关闭事件
        const checkClosed = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkClosed)
            console.log('💳 Payment window closed, refreshing user data...')
            // 支付窗口关闭后刷新用户数据
            window.location.reload()
          }
        }, 1000)
      }
    } catch (error) {
      console.error('💥 Purchase error:', error)
      // TODO: 显示错误提示
    } finally {
      console.log('🏁 Clearing loading state')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* 立即注册模块 - 放在头部显眼位置 */}
        <ConditionalRender when="unauthenticated">
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Gift className="h-8 w-8" />
                  <h2 className="text-2xl font-bold">
                    {t('register_prompt.title')}
                  </h2>
                </div>
                <p className="text-lg mb-6 text-blue-100">
                  {t('register_prompt.description')}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg" variant="secondary" asChild>
                    <a href="/auth/signup">{t('register_prompt.register_button')}</a>
                  </Button>
                  <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm" asChild>
                    <a href="/auth/signin">{t('register_prompt.signin_button')}</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ConditionalRender>

        {/* 页面标题 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('subtitle')}
          </p>
          
          {/* 当前积分余额 */}
          <ConditionalRender when="authenticated">
            <div className="flex justify-center mb-8">
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">{t('current_balance')}</div>
                  <CreditBalance showPurchaseButton={false} />
                </div>
              </Card>
            </div>
          </ConditionalRender>
        </div>

        {/* 免费额度说明 - 统一样式 */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* 免费额度卡片 */}
            <Card className="bg-green-50 border-green-200 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-500 text-white px-3 py-1">
                  <Gift className="h-3 w-3 mr-1" />
                  {t('free_tier.title')}
                </Badge>
              </div>

              <CardHeader className="text-center pb-4 pt-6">
                <CardTitle className="text-xl font-bold text-green-800">
                  {t('free_tier.title')}
                </CardTitle>
                <CardDescription className="text-sm text-green-700">
                  {t('free_tier.subtitle')}
                </CardDescription>
                
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      FREE
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <span className="text-3xl font-bold text-green-800">
                      $0
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-4 pb-4 flex-1">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-green-800 mb-2 text-sm">
                      {t('free_tier.completely_free')}
                    </p>
                    <ul className="space-y-1 text-xs text-green-700">
                      <li className="flex items-start gap-2">
                        <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{t('free_tier.features.free_text')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{t('free_tier.features.all_languages')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{t('free_tier.features.unlimited_use')}</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-green-800 mb-2 text-sm">
                      {t('free_tier.credit_based')}
                    </p>
                    <ul className="space-y-1 text-xs text-green-700">
                      <li className="flex items-start gap-2">
                        <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{t('free_tier.features.large_text')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{t('free_tier.features.document_translation')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{t('free_tier.features.rate')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="px-4 pt-0">
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Always Free
                </Button>
              </CardFooter>
            </Card>

            {/* 积分包列表 */}
            {creditPackages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative flex flex-col ${
                  pkg.popular 
                    ? 'border-blue-500 shadow-lg scale-105' 
                    : 'border-gray-200'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      {t('popular')}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold">
                    {t(`packages.${pkg.id}.name`)}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {t(`packages.${pkg.id}.description`)}
                  </CardDescription>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Coins className="h-5 w-5 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-600">
                        {pkg.credits.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">{t('credits')}</span>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-3xl font-bold text-gray-900">
                        ${pkg.priceUSD}
                      </span>
                      {(pkg.discount ?? 0 ?? 0) > 0 && (
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span className="text-sm text-gray-500 line-through">
                            ${(pkg.priceUSD / (1 - (pkg.discount ?? 0 ?? 0) / 100)).toFixed(2)}
                          </span>
                          <Badge variant="destructive" className="text-xs">
                            {t('save')} {pkg.discount ?? 0 ?? 0}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-4 pb-4 flex-1">
                  <ul className="space-y-2">
                    {(pkg.features || []).map((featureKey) => (
                      <li key={featureKey} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{t(`packages.${pkg.id}.features.${featureKey}`)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="px-4 pt-0 mt-auto">
                  <Button
                    className="w-full"
                    variant={pkg.popular ? 'default' : 'outline'}
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={loading === pkg.id || authLoading}
                  >
                    {loading === pkg.id ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {t('processing')}
                      </div>
                    ) : authLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Loading...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        {t('purchase_button')}
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* 新用户优惠 */}
        <ConditionalRender when="authenticated">
          <div className="max-w-2xl mx-auto mt-12">
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Gift className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-800">
                    {t('new_user_bonus.title')}
                  </h3>
                </div>
                <p className="text-purple-700 mb-4">
                  {t('new_user_bonus.description')}
                </p>
                <p className="text-sm text-purple-600">
                  {t('new_user_bonus.note')}
                </p>
              </CardContent>
            </Card>
          </div>
        </ConditionalRender>

        {/* FAQ部分 - 使用与首页一致的样式 */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('faq.title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t('faq.subtitle')}
            </p>
          </div>

          <div className="space-y-6">
            {[
              'credit_calculation',
              'expiration', 
              'payment_methods',
              'bulk_discount',
              'unused_credits',
              'business_invoicing',
              'api_pricing'
            ].map((faqKey) => (
              <details
                key={faqKey}
                className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-gray-900 marker:content-['']">
                  {t(`faq.${faqKey}.question`)}
                  <svg
                    className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="mt-4 text-gray-600 leading-7">
                  {t(`faq.${faqKey}.answer`)}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">
              {t('faq.contact_support')}{' '}
              <a
                href="mailto:Loretrans@proton.me"
                className="font-medium text-primary hover:text-primary/80"
              >
                Loretrans@proton.me
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
