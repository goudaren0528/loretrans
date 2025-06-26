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
    name: '入门包',
    credits: 1000,
    price: 1.99,
    originalPrice: 1.99,
    discount: 0,
    popular: false,
    description: '适合偶尔使用的用户',
    features: [
      '1,000 翻译积分',
      '支持所有语言对',
      '文档翻译功能',
      '7天有效期',
    ],
  },
  {
    id: 'basic',
    name: '基础包',
    credits: 5000,
    price: 8.99,
    originalPrice: 9.95,
    discount: 10,
    popular: true,
    description: '最受欢迎的选择',
    features: [
      '5,000 翻译积分',
      '支持所有语言对',
      '文档翻译功能',
      '30天有效期',
      '优先客服支持',
    ],
  },
  {
    id: 'pro',
    name: '专业包',
    credits: 10000,
    price: 15.99,
    originalPrice: 19.90,
    discount: 20,
    popular: false,
    description: '适合重度使用者',
    features: [
      '10,000 翻译积分',
      '支持所有语言对',
      '文档翻译功能',
      '60天有效期',
      '优先客服支持',
      '批量翻译功能',
    ],
  },
  {
    id: 'business',
    name: '商务包',
    credits: 25000,
    price: 34.99,
    originalPrice: 49.75,
    discount: 30,
    popular: false,
    description: '适合团队和企业',
    features: [
      '25,000 翻译积分',
      '支持所有语言对',
      '文档翻译功能',
      '90天有效期',
      '优先客服支持',
      '批量翻译功能',
      'API访问权限',
    ],
  },
  {
    id: 'enterprise',
    name: '企业包',
    credits: 50000,
    price: 59.99,
    originalPrice: 99.50,
    discount: 40,
    popular: false,
    description: '大型企业解决方案',
    features: [
      '50,000 翻译积分',
      '支持所有语言对',
      '文档翻译功能',
      '180天有效期',
      '专属客服支持',
      '批量翻译功能',
      'API访问权限',
      '自定义集成',
    ],
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
        {/* 页面标题 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            选择适合您的积分包
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            灵活的积分制度，按需付费，无月费订阅
          </p>
          
          {/* 当前积分余额 */}
          <ConditionalRender when="authenticated">
            <div className="flex justify-center mb-8">
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">当前积分余额：</div>
                  <CreditBalance showPurchaseButton={false} />
                </div>
              </Card>
            </div>
          </ConditionalRender>
        </div>

        {/* 免费额度说明 */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">
                  免费额度
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-green-700">
                <div>
                  <p className="font-medium mb-2">✅ 完全免费：</p>
                  <ul className="space-y-1 ml-4">
                    <li>• 500字符以下文本翻译</li>
                    <li>• 支持所有语言对</li>
                    <li>• 无限次数使用</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">💰 积分计费：</p>
                  <ul className="space-y-1 ml-4">
                    <li>• 超过500字符的文本</li>
                    <li>• 大型文档翻译</li>
                    <li>• 0.1积分/字符（超出部分）</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 积分包列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {creditPackages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative ${
                pkg.popular 
                  ? 'border-blue-500 shadow-lg scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    最受欢迎
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold">
                  {pkg.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {pkg.description}
                </CardDescription>
                
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="h-5 w-5 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">
                      {pkg.credits.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">积分</span>
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
                          省{pkg.discount}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-4 pb-4">
                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="px-4 pt-0">
                <Button
                  className="w-full"
                  variant={pkg.popular ? 'default' : 'outline'}
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading === pkg.id}
                >
                  {loading === pkg.id ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      处理中...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      立即购买
                    </div>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* 新用户优惠 */}
        <ConditionalRender when="authenticated">
          <div className="max-w-2xl mx-auto mt-12">
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Gift className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-800">
                    新用户专享优惠
                  </h3>
                </div>
                <p className="text-purple-700 mb-4">
                  🎉 注册即送500积分 + 首次充值额外赠送20%积分
                </p>
                <p className="text-sm text-purple-600">
                  优惠将在支付完成后自动应用到您的账户
                </p>
              </CardContent>
            </Card>
          </div>
        </ConditionalRender>

        {/* 未登录用户提示 */}
        <ConditionalRender when="unauthenticated">
          <div className="max-w-2xl mx-auto mt-12">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  立即注册，享受更多优惠
                </h3>
                <p className="text-blue-700 mb-6">
                  注册用户可享受500积分新手礼包 + 首充20%额外奖励
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild>
                    <a href="/auth/signup">立即注册</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/auth/signin">已有账户</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ConditionalRender>

        {/* FAQ部分 */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">常见问题</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">积分如何计算？</h3>
                <p className="text-sm text-gray-600">
                  500字符以下完全免费，超出部分按0.1积分/字符计费。例如：翻译1000字符的文本需要消耗50积分。
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">积分会过期吗？</h3>
                <p className="text-sm text-gray-600">
                  积分有效期根据购买的套餐而定，从7天到180天不等。过期前我们会提前通知您。
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">支持哪些支付方式？</h3>
                <p className="text-sm text-gray-600">
                  支持信用卡、借记卡和数字钱包支付，所有支付都通过安全的Creem平台处理。
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">可以退款吗？</h3>
                <p className="text-sm text-gray-600">
                  购买后7天内，如果您对服务不满意，可以申请全额退款。未使用的积分将被回收。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
