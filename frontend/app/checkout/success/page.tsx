'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Gift, ArrowRight, Home, CreditCard } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { CreditBalance } from '@/components/credits/credit-balance'
import Link from 'next/link'

function CheckoutSuccessComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)

  const sessionId = searchParams.get('session_id')
  const packageId = searchParams.get('package')
  const credits = searchParams.get('credits')

  // 积分包信息
  const packageInfo = {
    starter: { name: '入门包', description: '1,000 翻译积分' },
    basic: { name: '基础包', description: '5,000 翻译积分' },
    pro: { name: '专业包', description: '10,000 翻译积分' },
    business: { name: '商务包', description: '25,000 翻译积分' },
    enterprise: { name: '企业包', description: '50,000 翻译积分' },
  }

  const currentPackage = packageInfo[packageId as keyof typeof packageInfo]

  useEffect(() => {
    // 刷新用户信息以获取最新积分余额
    const refreshUserData = async () => {
      if (user) {
        await refreshUser()
      }
      setLoading(false)
    }

    // 延迟刷新，确保webhook处理完成
    const timer = setTimeout(refreshUserData, 1000)
    return () => clearTimeout(timer)
  }, [user, refreshUser])

  const handleContinue = () => {
    router.push('/')
  }

  const handleViewDashboard = () => {
    router.push('/dashboard')
  }

  if (!sessionId || !packageId || !credits) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">页面错误</CardTitle>
            <CardDescription>缺少必要的支付信息</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/pricing')} className="w-full">
              返回定价页面
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* 成功标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              支付成功！
            </h1>
            <p className="text-gray-600">
              您的积分已成功充值到账户
            </p>
          </div>

          {/* 订单详情 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                购买详情
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">积分包</span>
                <div className="text-right">
                  <div className="font-medium">{currentPackage?.name}</div>
                  <div className="text-sm text-gray-500">{currentPackage?.description}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>获得积分</span>
                <Badge variant="default" className="text-base px-3 py-1">
                  {parseInt(credits).toLocaleString()} 积分
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span>订单号</span>
                <span className="text-sm text-gray-500 font-mono">
                  {sessionId}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 当前积分余额 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>当前积分余额</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>更新余额中...</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span>您的积分余额：</span>
                  <CreditBalance showPurchaseButton={false} size="lg" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 奖励提示 */}
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-800">
                  恭喜获得奖励积分！
                </h3>
              </div>
              <p className="text-purple-700 mb-2">
                🎉 首次充值额外获得20%奖励积分
              </p>
              <p className="text-sm text-purple-600">
                奖励积分已自动添加到您的账户余额中
              </p>
            </CardContent>
          </Card>

          {/* 下一步操作 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center mb-4">
              现在您可以：
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Button asChild className="h-12">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  开始翻译
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button variant="outline" onClick={handleViewDashboard} className="h-12">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  查看控制台
                </div>
              </Button>
            </div>
          </div>

          {/* 使用提示 */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 使用提示</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 500字符以下的翻译完全免费</li>
              <li>• 超出部分按0.1积分/字符计费</li>
              <li>• 支持所有语言对的双向翻译</li>
              <li>• 积分有效期根据套餐而定，请及时使用</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}


/**
 * 支付成功页面
 * 显示支付完成信息和积分到账情况
 */
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccessComponent />
    </Suspense>
  )
}
