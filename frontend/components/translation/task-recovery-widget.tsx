'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity,
  Loader2
} from 'lucide-react'
import { toast } from '@/lib/hooks/use-toast'

interface TaskHealthStatus {
  totalTasks: number
  processingTasks: number
  stuckTasks: number
  recentFailures: number
  timestamp: string
}

interface TaskRecoveryWidgetProps {
  className?: string
  showHealthStatus?: boolean
  autoCheck?: boolean
}

export function TaskRecoveryWidget({ 
  className = '',
  showHealthStatus = true,
  autoCheck = false
}: TaskRecoveryWidgetProps) {
  const [healthStatus, setHealthStatus] = useState<TaskHealthStatus | null>(null)
  const [isRecovering, setIsRecovering] = useState(false)
  const [isCheckingHealth, setIsCheckingHealth] = useState(false)
  const [lastRecovery, setLastRecovery] = useState<string | null>(null)

  // 检查任务健康状态
  const checkTaskHealth = async () => {
    setIsCheckingHealth(true)
    try {
      const response = await fetch('/api/translate/recover-tasks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        setHealthStatus(data.data)
      } else {
        console.error('Health check failed:', data.error)
      }
    } catch (error) {
      console.error('Health check error:', error)
    } finally {
      setIsCheckingHealth(false)
    }
  }

  // 修复卡住的任务
  const recoverStuckTasks = async () => {
    setIsRecovering(true)
    try {
      const response = await fetch('/api/translate/recover-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        const { recoveredTasks, failedTasks } = data.data
        
        if (recoveredTasks > 0) {
          toast({
            title: "任务恢复成功",
            description: `已修复 ${recoveredTasks} 个卡住的任务`,
          })
          setLastRecovery(new Date().toISOString())
        } else {
          toast({
            title: "无需修复",
            description: "没有发现卡住的任务",
          })
        }
        
        // 刷新健康状态
        await checkTaskHealth()
      } else {
        toast({
          title: "修复失败",
          description: data.error || "任务修复过程中出现错误",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Recovery error:', error)
      toast({
        title: "修复失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsRecovering(false)
    }
  }

  // 初始化和自动检查
  useEffect(() => {
    checkTaskHealth()
    
    if (autoCheck) {
      const interval = setInterval(checkTaskHealth, 60000) // 每分钟检查一次
      return () => clearInterval(interval)
    }
  }, [autoCheck])

  const hasIssues = healthStatus && (healthStatus.stuckTasks > 0 || healthStatus.recentFailures > 2)

  return (
    <Card className={`${className} ${hasIssues ? 'border-orange-200 bg-orange-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              翻译任务状态
            </CardTitle>
            <CardDescription>
              监控和修复翻译任务问题
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkTaskHealth}
            disabled={isCheckingHealth}
          >
            {isCheckingHealth ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 健康状态显示 */}
        {showHealthStatus && healthStatus && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{healthStatus.totalTasks}</div>
              <div className="text-xs text-blue-600">总任务数</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{healthStatus.processingTasks}</div>
              <div className="text-xs text-yellow-600">处理中</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{healthStatus.stuckTasks}</div>
              <div className="text-xs text-orange-600">卡住任务</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{healthStatus.recentFailures}</div>
              <div className="text-xs text-red-600">近期失败</div>
            </div>
          </div>
        )}

        {/* 问题警告 */}
        {hasIssues && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {healthStatus!.stuckTasks > 0 && (
                <span>发现 {healthStatus!.stuckTasks} 个卡住的任务。</span>
              )}
              {healthStatus!.recentFailures > 2 && (
                <span>近期失败任务较多 ({healthStatus!.recentFailures} 个)。</span>
              )}
              建议点击下方按钮进行修复。
            </AlertDescription>
          </Alert>
        )}

        {/* 修复按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {healthStatus?.stuckTasks === 0 ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                任务正常
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <Clock className="h-3 w-3 mr-1" />
                需要修复
              </Badge>
            )}
            
            {lastRecovery && (
              <span className="text-xs text-gray-500">
                上次修复: {new Date(lastRecovery).toLocaleTimeString()}
              </span>
            )}
          </div>

          <Button
            onClick={recoverStuckTasks}
            disabled={isRecovering || healthStatus?.stuckTasks === 0}
            variant={healthStatus?.stuckTasks === 0 ? "outline" : "default"}
            size="sm"
          >
            {isRecovering ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                修复中...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                修复卡住的任务
              </>
            )}
          </Button>
        </div>

        {/* 使用说明 */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• 如果长文本翻译任务长时间显示"处理中"，可能是任务卡住了</p>
          <p>• 点击"修复卡住的任务"会将超时任务标记为失败，你可以重新提交</p>
          <p>• 系统会自动检测超过30分钟的处理中任务</p>
        </div>
      </CardContent>
    </Card>
  )
}
