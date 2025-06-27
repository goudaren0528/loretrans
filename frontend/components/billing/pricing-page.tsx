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

// 积分包配置（基于产品文档）
const creditPackages = [
  {
    id: 'starter',
    credits: 1000,
    price: 1.99,
    originalPrice: 1.99,
    discount: 0,
    popular: false,
  },
  {
    id: 'basic',
    credits: 5000,
    price: 8.99,
    originalPrice: 9.95,
    discount: 10,
    popular: true,
  },
  {
    id: 'pro',
    credits: 10000,
    price: 15.99,
    originalPrice: 19.90,
    discount: 20,
    popular: false,
  },
  {
    id: 'business',
    credits: 25000,
    price: 34.99,
    originalPrice: 49.75,
    discount: 30,
    popular: false,
  },
  {
    id: 'enterprise',
    credits: 50000,
    price: 59.99,
    originalPrice: 99.50,
    discount: 40,
    popular: false,
  },
]

export function PricingPage() {
  const t = useTranslations('pricing')
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      router.push('/auth/signin?redirect=/pricing')
      return
    }

    setLoading(packageId)
    
    try {
      // 创建Creem checkout会话
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { checkoutUrl } = await response.json()
      
      // 重定向到Creem支付页面
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Purchase error:', error)
      // TODO: 显示错误提示
    } finally {
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
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
                        ${pkg.price}
                      </span>
                      {pkg.discount > 0 && (
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span className="text-sm text-gray-500 line-through">
                            ${pkg.originalPrice}
                          </span>
                          <Badge variant="destructive" className="text-xs">
                            {t('save')} {pkg.discount}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-4 pb-4 flex-1">
                  <ul className="space-y-2">
                    {Object.keys(t.raw(`packages.${pkg.id}.features`)).map((featureKey) => (
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
                    disabled={loading === pkg.id}
                  >
                    {loading === pkg.id ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {t('processing')}
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

        {/* FAQ部分 */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">{t('faq.title')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">{t('faq.credit_calculation.question')}</h3>
                <p className="text-sm text-gray-600">
                  {t('faq.credit_calculation.answer')}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">{t('faq.expiration.question')}</h3>
                <p className="text-sm text-gray-600">
                  {t('faq.expiration.answer')}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">{t('faq.payment_methods.question')}</h3>
                <p className="text-sm text-gray-600">
                  {t('faq.payment_methods.answer')}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">{t('faq.refund.question')}</h3>
                <p className="text-sm text-gray-600">
                  {t('faq.refund.answer')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
