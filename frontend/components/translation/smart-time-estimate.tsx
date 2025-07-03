'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Zap, Rocket, RotateCcw, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimeEstimate } from '@/lib/services/smart-translation'

interface SmartTimeEstimateProps {
  estimate: TimeEstimate
  className?: string
  showDetails?: boolean
}

export function SmartTimeEstimate({ 
  estimate, 
  className,
  showDetails = true 
}: SmartTimeEstimateProps) {
  const getModeConfig = () => {
    switch (estimate.mode) {
      case 'instant':
        return {
          icon: Zap,
          color: 'bg-green-50 border-green-200 text-green-800',
          badgeColor: 'bg-green-100 text-green-700',
          iconColor: 'text-green-600'
        }
      case 'fast_queue':
        return {
          icon: Rocket,
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          badgeColor: 'bg-blue-100 text-blue-700',
          iconColor: 'text-blue-600'
        }
      case 'background':
        return {
          icon: RotateCcw,
          color: 'bg-orange-50 border-orange-200 text-orange-800',
          badgeColor: 'bg-orange-100 text-orange-700',
          iconColor: 'text-orange-600'
        }
    }
  }

  const config = getModeConfig()
  const IconComponent = config.icon

  const getConfidenceText = () => {
    switch (estimate.confidence) {
      case 'high':
        return '预估准确'
      case 'medium':
        return '大致预估'
      case 'low':
        return '粗略预估'
    }
  }

  return (
    <Card className={cn('border-2', config.color, className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn('p-2 rounded-full bg-white/50')}>
              <IconComponent className={cn('h-5 w-5', config.iconColor)} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg">
                  {estimate.displayTime}
                </span>
                <Badge variant="secondary" className={config.badgeColor}>
                  {getConfidenceText()}
                </Badge>
              </div>
              <p className="text-sm opacity-80 mt-1">
                {estimate.description}
              </p>
            </div>
          </div>
          
          {estimate.canLeave && (
            <div className="flex items-center space-x-1 text-xs opacity-70">
              <Info className="h-3 w-3" />
              <span>可离开页面</span>
            </div>
          )}
        </div>

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-current/20">
            <div className="flex items-center justify-between text-xs opacity-70">
              <span>处理模式: {getModeDisplayName(estimate.mode)}</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>预计 {estimate.estimatedSeconds}秒</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getModeDisplayName(mode: string): string {
  switch (mode) {
    case 'instant':
      return '即时处理'
    case 'fast_queue':
      return '快速队列'
    case 'background':
      return '后台处理'
    default:
      return '智能处理'
  }
}

// 紧凑版本的时间预估组件
export function CompactTimeEstimate({ 
  estimate, 
  className 
}: SmartTimeEstimateProps) {
  const config = getModeConfig(estimate.mode)
  const IconComponent = config.icon

  return (
    <div className={cn(
      'inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm',
      config.color,
      className
    )}>
      <IconComponent className={cn('h-4 w-4', config.iconColor)} />
      <span className="font-medium">{estimate.displayTime}</span>
      {estimate.canLeave && (
        <Badge variant="outline" className="text-xs">
          可离开
        </Badge>
      )}
    </div>
  )
}

function getModeConfig(mode: string) {
  switch (mode) {
    case 'instant':
      return {
        icon: Zap,
        color: 'bg-green-50 border-green-200 text-green-800',
        iconColor: 'text-green-600'
      }
    case 'fast_queue':
      return {
        icon: Rocket,
        color: 'bg-blue-50 border-blue-200 text-blue-800',
        iconColor: 'text-blue-600'
      }
    case 'background':
      return {
        icon: RotateCcw,
        color: 'bg-orange-50 border-orange-200 text-orange-800',
        iconColor: 'text-orange-600'
      }
    default:
      return {
        icon: Clock,
        color: 'bg-gray-50 border-gray-200 text-gray-800',
        iconColor: 'text-gray-600'
      }
  }
}

// 动态时间预估组件 - 随着文本输入实时更新
interface DynamicTimeEstimateProps {
  text: string
  sourceLanguage: string
  targetLanguage: string
  userContext?: {
    isLoggedIn: boolean
    creditBalance: number
    hasActiveTasks: boolean
  }
  className?: string
}

export function DynamicTimeEstimate({
  text,
  sourceLanguage,
  targetLanguage,
  userContext,
  className
}: DynamicTimeEstimateProps) {
  const [estimate, setEstimate] = React.useState<TimeEstimate | null>(null)

  React.useEffect(() => {
    if (!text.trim()) {
      setEstimate(null)
      return
    }

    // 动态导入服务以避免SSR问题
    import('@/lib/services/smart-translation').then(({ estimateProcessingTime }) => {
      const newEstimate = estimateProcessingTime(
        text,
        sourceLanguage,
        targetLanguage,
        userContext
      )
      setEstimate(newEstimate)
    })
  }, [text, sourceLanguage, targetLanguage, userContext])

  if (!estimate || !text.trim()) {
    return null
  }

  return (
    <SmartTimeEstimate 
      estimate={estimate} 
      className={className}
      showDetails={text.length > 100} // 长文本显示详情
    />
  )
}
