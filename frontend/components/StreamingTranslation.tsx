'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Clock, Zap } from 'lucide-react'

interface StreamingTranslationProps {
  text: string
  sourceLang: string
  targetLang: string
  onComplete?: (result: string) => void
  onError?: (error: string) => void
}

interface StreamTask {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  currentChunk: number
  totalChunks: number
  result?: string
  error?: string
  createdAt: string
  updatedAt: string
}

export default function StreamingTranslation({
  text,
  sourceLang,
  targetLang,
  onComplete,
  onError
}: StreamingTranslationProps) {
  const [task, setTask] = useState<StreamTask | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  // 启动串流翻译
  const startStreamTranslation = async () => {
    setIsStarting(true)
    
    try {
      const token = localStorage.getItem('supabase.auth.token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/translate/stream', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || '启动串流翻译失败')
      }
      
      if (result.success) {
        setEstimatedTime(result.estimatedTime)
        // 开始轮询任务状态
        pollTaskStatus(result.taskId)
      } else {
        throw new Error(result.error || '创建串流任务失败')
      }
      
    } catch (error) {
      console.error('启动串流翻译失败:', error)
      onError?.(error instanceof Error ? error.message : '启动串流翻译失败')
    } finally {
      setIsStarting(false)
    }
  }

  // 轮询任务状态
  const pollTaskStatus = async (taskId: string) => {
    const startTime = Date.now()
    
    const poll = async () => {
      try {
        const response = await fetch(`/api/translate/stream?taskId=${taskId}`)
        const result = await response.json()
        
        if (response.ok && result.success) {
          setTask(result.task)
          setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
          
          if (result.task.status === 'completed') {
            onComplete?.(result.task.result)
            return
          } else if (result.task.status === 'failed') {
            onError?.(result.task.error || '串流翻译失败')
            return
          }
          
          // 继续轮询
          if (result.task.status === 'processing' || result.task.status === 'pending') {
            setTimeout(poll, 2000) // 每2秒轮询一次
          }
        } else {
          throw new Error(result.error || '查询任务状态失败')
        }
        
      } catch (error) {
        console.error('轮询任务状态失败:', error)
        onError?.(error instanceof Error ? error.message : '查询任务状态失败')
      }
    }
    
    poll()
  }

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`
  }

  // 计算预估剩余时间
  const getRemainingTime = () => {
    if (!task || task.progress === 0) return estimatedTime
    
    const progressRatio = task.progress / 100
    const estimatedTotal = elapsedTime / progressRatio
    const remaining = Math.max(0, Math.ceil(estimatedTotal - elapsedTime))
    
    return remaining
  }

  // 获取状态图标
  const getStatusIcon = () => {
    if (isStarting) return <Loader2 className="h-4 w-4 animate-spin" />
    if (!task) return <Zap className="h-4 w-4" />
    
    switch (task.status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // 获取状态文本
  const getStatusText = () => {
    if (isStarting) return '正在启动串流翻译...'
    if (!task) return '准备开始串流翻译'
    
    switch (task.status) {
      case 'pending':
        return '任务已创建，等待处理...'
      case 'processing':
        return `正在处理第 ${task.currentChunk}/${task.totalChunks} 个文本块...`
      case 'completed':
        return '串流翻译完成！'
      case 'failed':
        return `翻译失败: ${task.error}`
      default:
        return '未知状态'
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          串流长文本翻译
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 文本信息 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">文本长度:</span> {text.length.toLocaleString()} 字符
          </div>
          <div>
            <span className="font-medium">翻译方向:</span> {sourceLang} → {targetLang}
          </div>
        </div>

        {/* 启动按钮 */}
        {!task && (
          <Button 
            onClick={startStreamTranslation} 
            disabled={isStarting}
            className="w-full"
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                启动中...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                开始串流翻译
              </>
            )}
          </Button>
        )}

        {/* 进度显示 */}
        {task && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{getStatusText()}</span>
              <span>{task.progress}%</span>
            </div>
            
            <Progress value={task.progress} className="w-full" />
            
            {/* 时间信息 */}
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                已用时间: {formatTime(elapsedTime)}
              </div>
              <div>
                预计剩余: {formatTime(getRemainingTime())}
              </div>
            </div>

            {/* 块处理信息 */}
            {task.status === 'processing' && (
              <div className="text-xs text-muted-foreground">
                每个文本块最大800字符，块间间隔2秒，确保稳定处理
              </div>
            )}
          </div>
        )}

        {/* 错误提示 */}
        {task?.status === 'failed' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {task.error}
            </AlertDescription>
          </Alert>
        )}

        {/* 成功提示 */}
        {task?.status === 'completed' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              串流翻译已完成！共处理 {task.totalChunks} 个文本块，用时 {formatTime(elapsedTime)}。
            </AlertDescription>
          </Alert>
        )}

        {/* 串流翻译说明 */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <div className="font-medium mb-1">串流翻译特点：</div>
          <ul className="space-y-1">
            <li>• 文本分割为800字符的小块，逐个处理</li>
            <li>• 每个块独立翻译，避免长时间等待</li>
            <li>• 块间2秒间隔，确保服务稳定</li>
            <li>• 适合超过1600字符的长文本</li>
            <li>• 有效规避30秒超时限制</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
