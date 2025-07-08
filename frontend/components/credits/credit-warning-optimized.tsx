'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Zap, Gift, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCreditWarningExperiment } from '@/components/experiments/ab-test-provider'

interface CreditWarningOptimizedProps {
  currentCredits: number
  threshold?: number // 警告阈值，默认100
  onPurchaseClick?: () => void
}

export function CreditWarningOptimized({ 
  currentCredits, 
  threshold = 100,
  onPurchaseClick 
}: CreditWarningOptimizedProps) {
  const router = useRouter()
  const { variant, config, trackEvent } = useCreditWarningExperiment()
  const [dismissed, setDismissed] = useState(false)
  const [showUrgentAnimation, setShowUrgentAnimation] = useState(false)

  const shouldShowWarning = currentCredits <= threshold && !dismissed

  useEffect(() => {
    if (shouldShowWarning) {
      // 记录警告显示事件
      trackEvent('warning_shown', {
        currentCredits,
        threshold,
        urgencyLevel: config.urgency
      })

      // 高紧急度变体显示动画
      if (config.urgency === 'high') {
        setShowUrgentAnimation(true)
        const timer = setTimeout(() => setShowUrgentAnimation(false), 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [shouldShowWarning, currentCredits, threshold, config.urgency, trackEvent])

  const handlePurchaseClick = () => {
    trackEvent('purchase_clicked', {
      currentCredits,
      urgencyLevel: config.urgency
    })
    
    if (onPurchaseClick) {
      onPurchaseClick()
    } else {
      router.push('/pricing')
    }
  }

  const handleDismiss = () => {
    trackEvent('warning_dismissed', {
      currentCredits,
      urgencyLevel: config.urgency
    })
    setDismissed(true)
  }

  if (!shouldShowWarning) {
    return null
  }

  // 控制组 - 简单提醒
  if (variant === 'control') {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-orange-900">{config.title}</h4>
                <p className="text-sm text-orange-700">{config.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handlePurchaseClick}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {config.buttonText}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-orange-600 hover:text-orange-700"
              >
                ×
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 变体A - 紧急感提醒
  return (
    <Card className={`border-red-300 bg-gradient-to-r from-red-50 to-orange-50 ${
      showUrgentAnimation ? 'animate-pulse shadow-lg' : ''
    }`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* 标题行 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Zap className="w-6 h-6 text-red-600" />
                {showUrgentAnimation && (
                  <div className="absolute -inset-1 bg-red-400 rounded-full animate-ping opacity-75" />
                )}
              </div>
              <h4 className="font-bold text-red-900 text-lg">{config.title}</h4>
              <Badge variant="destructive" className="animate-bounce">
                紧急
              </Badge>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              ×
            </Button>
          </div>

          {/* 消息内容 */}
          <div className="bg-white/70 rounded-lg p-3 border border-red-200">
            <p className="text-red-800 font-medium mb-2">{config.message}</p>
            
            {/* 积分状态 */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-red-600">当前积分:</span>
                <span className="font-bold text-red-700">{currentCredits}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-600">建议充值:</span>
                <span className="font-bold text-green-600">2,500积分</span>
              </div>
            </div>
          </div>

          {/* 优惠信息 */}
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-800">限时优惠</span>
              <Badge className="bg-green-500">立即享受</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-blue-600" />
                <span>首次充值额外赠送20%</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-purple-600" />
                <span>即时到账，立即可用</span>
              </div>
            </div>
          </div>

          {/* 行动按钮 */}
          <div className="flex gap-2">
            <Button
              onClick={handlePurchaseClick}
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold shadow-lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              {config.buttonText}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                trackEvent('learn_more_clicked', { currentCredits })
                router.push('/pricing')
              }}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              了解套餐
            </Button>
          </div>

          {/* 社会证明 */}
          <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
            💡 <strong>用户反馈:</strong> "及时充值让我的翻译工作不间断，效率提升了300%！" - 专业用户张先生
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
