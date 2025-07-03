'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  Zap, 
  Coffee, 
  BookOpen, 
  Rocket, 
  Heart,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// 进度状态类型
type ProgressStatus = 'preparing' | 'processing' | 'finalizing' | 'completed' | 'paused' | 'error'

// 进度数据接口
interface ProgressData {
  status: ProgressStatus
  percentage: number
  currentStep: string
  estimatedTimeRemaining: number // 秒
  totalSteps?: number
  currentStepIndex?: number
  canPause?: boolean
  canCancel?: boolean
  message?: string
}

interface FriendlyProgressProps {
  data: ProgressData
  onPause?: () => void
  onResume?: () => void
  onCancel?: () => void
  className?: string
  showControls?: boolean
  compact?: boolean
}

// 情感化的状态配置
const STATUS_CONFIG = {
  preparing: {
    icon: Sparkles,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    title: '准备中',
    messages: [
      '正在理解您的文本...',
      '分析语言特征中...',
      '准备翻译引擎...',
      '即将开始翻译...'
    ],
    emoji: '✨'
  },
  processing: {
    icon: Rocket,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    title: '翻译中',
    messages: [
      '翻译进行中，请稍候...',
      '正在处理您的内容...',
      '翻译引擎全力运转中...',
      '马上就要完成了...'
    ],
    emoji: '🚀'
  },
  finalizing: {
    icon: Heart,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    title: '完善中',
    messages: [
      '正在优化翻译质量...',
      '检查语法和流畅度...',
      '最后的润色中...',
      '即将为您呈现结果...'
    ],
    emoji: '💝'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    title: '完成',
    messages: [
      '翻译完成！',
      '结果已准备就绪',
      '感谢您的耐心等待'
    ],
    emoji: '✅'
  },
  paused: {
    icon: Pause,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    title: '已暂停',
    messages: [
      '翻译已暂停',
      '点击继续按钮恢复翻译',
      '您的进度已保存'
    ],
    emoji: '⏸️'
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    title: '遇到问题',
    messages: [
      '翻译过程中遇到了问题',
      '我们正在尝试解决',
      '请稍候或联系客服'
    ],
    emoji: '⚠️'
  }
}

export function FriendlyProgress({
  data,
  onPause,
  onResume,
  onCancel,
  className,
  showControls = true,
  compact = false
}: FriendlyProgressProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  const config = STATUS_CONFIG[data.status]
  const IconComponent = config.icon

  // 消息轮播
  useEffect(() => {
    if (data.status === 'completed' || data.status === 'error') return

    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % config.messages.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [data.status, config.messages.length])

  // 进度条动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(data.percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [data.percentage])

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) {
      return `约 ${Math.ceil(seconds / 10) * 10} 秒`
    } else if (seconds < 300) {
      return `约 ${Math.ceil(seconds / 60)} 分钟`
    } else {
      return `约 ${Math.ceil(seconds / 300) * 5} 分钟`
    }
  }

  const getProgressMessage = (): string => {
    if (data.message) return data.message
    return config.messages[messageIndex] || config.messages[0]
  }

  if (compact) {
    return (
      <div className={cn(
        'flex items-center space-x-3 p-3 rounded-lg border',
        config.bgColor,
        config.borderColor,
        className
      )}>
        <div className={cn('p-1 rounded-full bg-white/50')}>
          <IconComponent className={cn('h-4 w-4', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{config.title}</span>
            <span className="text-xs text-muted-foreground">
              {data.percentage}%
            </span>
          </div>
          <Progress value={animatedPercentage} className="h-1 mt-1" />
        </div>
        {data.estimatedTimeRemaining > 0 && (
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTimeRemaining(data.estimatedTimeRemaining)}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* 状态图标和标题 */}
          <div className="text-center space-y-2">
            <motion.div
              className={cn(
                'w-16 h-16 mx-auto rounded-full flex items-center justify-center',
                config.bgColor,
                config.borderColor,
                'border-2'
              )}
              animate={{ 
                scale: data.status === 'processing' ? [1, 1.05, 1] : 1,
                rotate: data.status === 'processing' ? [0, 5, -5, 0] : 0
              }}
              transition={{ 
                duration: 2, 
                repeat: data.status === 'processing' ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <IconComponent className={cn('h-8 w-8', config.color)} />
            </motion.div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-semibold flex items-center justify-center space-x-2">
                <span>{config.emoji}</span>
                <span>{config.title}</span>
              </h3>
              
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-muted-foreground"
                >
                  {getProgressMessage()}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">进度</span>
              <span className="text-muted-foreground">{data.percentage}%</span>
            </div>
            
            <Progress 
              value={animatedPercentage} 
              className="h-2"
            />
            
            {/* 步骤指示器 */}
            {data.totalSteps && data.currentStepIndex !== undefined && (
              <div className="flex items-center justify-center space-x-1 mt-2">
                {Array.from({ length: data.totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors',
                      i <= data.currentStepIndex 
                        ? 'bg-primary' 
                        : 'bg-muted'
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 时间预估 */}
          {data.estimatedTimeRemaining > 0 && data.status !== 'completed' && (
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>预计剩余时间: {formatTimeRemaining(data.estimatedTimeRemaining)}</span>
            </div>
          )}

          {/* 控制按钮 */}
          {showControls && (data.canPause || data.canCancel) && data.status !== 'completed' && (
            <div className="flex justify-center space-x-2 pt-2">
              {data.status === 'paused' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResume}
                  className="flex items-center space-x-1"
                >
                  <Play className="h-3 w-3" />
                  <span>继续</span>
                </Button>
              ) : (
                data.canPause && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPause}
                    className="flex items-center space-x-1"
                  >
                    <Pause className="h-3 w-3" />
                    <span>暂停</span>
                  </Button>
                )
              )}
              
              {data.canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                  <span>取消</span>
                </Button>
              )}
            </div>
          )}

          {/* 鼓励性文案 */}
          {data.status === 'processing' && data.percentage > 50 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Coffee className="h-3 w-3 mr-1" />
                已完成一半以上，继续加油！
              </Badge>
            </motion.div>
          )}

          {data.status === 'processing' && data.percentage > 80 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Sparkles className="h-3 w-3 mr-1" />
                马上就要完成了！
              </Badge>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// 多任务进度概览组件
interface MultiTaskProgressProps {
  tasks: Array<{
    id: string
    title: string
    status: ProgressStatus
    percentage: number
    estimatedTimeRemaining: number
  }>
  className?: string
}

export function MultiTaskProgress({ tasks, className }: MultiTaskProgressProps) {
  const activeTasks = tasks.filter(t => t.status !== 'completed')
  const completedTasks = tasks.filter(t => t.status === 'completed')

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">翻译任务进度</h3>
            <Badge variant="secondary">
              {completedTasks.length}/{tasks.length} 已完成
            </Badge>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => {
              const config = STATUS_CONFIG[task.status]
              return (
                <div key={task.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={cn('w-2 h-2 rounded-full', 
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'error' ? 'bg-red-500' :
                        task.status === 'paused' ? 'bg-orange-500' :
                        'bg-blue-500'
                      )} />
                      <span className="font-medium truncate">{task.title}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{task.percentage}%</span>
                      {task.estimatedTimeRemaining > 0 && task.status !== 'completed' && (
                        <span>剩余 {Math.ceil(task.estimatedTimeRemaining / 60)}分钟</span>
                      )}
                    </div>
                  </div>
                  <Progress value={task.percentage} className="h-1" />
                </div>
              )
            })}
          </div>

          {activeTasks.length > 0 && (
            <div className="text-center text-xs text-muted-foreground">
              {activeTasks.length} 个任务正在处理中
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
