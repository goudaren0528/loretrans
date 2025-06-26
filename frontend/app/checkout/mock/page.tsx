'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, CreditCard, Loader2, AlertCircle } from 'lucide-react'

/**
 * 模拟支付页面（开发测试用）
 * 在实际生产环境中，这个页面会被Creem的托管支付页面替代
 */
export default function MockCheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const packageId = searchParams.get('package')
  const userId = searchParams.get('user')
  const amount = searchParams.get('amount')
  const credits = searchParams.get('credits')

  // 积分包信息
  const packageInfo = {
    starter: { name: '入门包', description: '适合偶尔使用的用户' },
    basic: { name: '基础包', description: '最受欢迎的选择' },
    pro: { name: '专业包', description: '适合重度使用者' },
    business: { name: '商务包', description: '适合团队和企业' },
    enterprise: { name: '企业包', description: '大型企业解决方案' },
  }

  const currentPackage = packageInfo[packageId as keyof typeof packageInfo]

  useEffect(() => {
    // 验证必要参数
    if (!packageId || !userId || !amount || !credits) {
      setError('缺少必要的支付参数')
    }
  }, [packageId, userId, amount, credits])

  const handleMockPayment = async () => {
    setProcessing(true)
    setError(null)

    try {
      // 模拟支付处理延迟
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 调用模拟webhook来处理支付成功
      const response = await fetch('/api/webhooks/creem/mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'payment.succeeded',
          data: {
            id: `mock_payment_${Date.now()}`,
            customer_email: 'user@example.com',
            amount_total: Math.round(parseFloat(amount!) * 100),
            currency: 'usd',
            status: 'paid',
            metadata: {
              user_id: userId,
              package_id: packageId,
              credits: credits,
            },
          },
        }),
      })

      if (!response.ok) {
        throw new Error('支付处理失败')
      }

      // 重定向到成功页面
      router.push(`/checkout/success?session_id=mock_session_${Date.now()}&package=${packageId}&credits=${credits}`)

    } catch (error) {
      console.error('Mock payment error:', error)
      setError('支付处理失败，请重试')
    } finally {
      setProcessing(false)
    }
  }

  const handleCancel = () => {
    router.push('/pricing')
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">支付错误</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCancel} className="w-full">
              返回定价页面
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              完成支付
            </h1>
            <p className="text-gray-600">
              这是一个模拟支付页面，用于开发测试
            </p>
          </div>

          {/* 订单详情 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                订单详情
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
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span>积分数量</span>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {parseInt(credits!).toLocaleString()} 积分
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span>支付金额</span>
                <span className="text-xl font-bold text-green-600">
                  ${amount}
                </span>
              </div>
              
              <Separator />
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">新用户优惠</span>
                </div>
                <p className="text-sm text-blue-700">
                  首次充值将额外获得20%积分奖励！
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 支付按钮 */}
          <div className="space-y-4">
            <Button
              onClick={handleMockPayment}
              disabled={processing}
              className="w-full h-12 text-lg"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  处理支付中...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  确认支付 ${amount}
                </div>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={processing}
              className="w-full"
            >
              取消支付
            </Button>
          </div>

          {/* 安全提示 */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>🔒 这是一个安全的模拟支付环境</p>
            <p>在生产环境中，支付将通过Creem安全平台处理</p>
          </div>
        </div>
      </div>
    </div>
  )
}
