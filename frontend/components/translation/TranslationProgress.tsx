'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Zap, CheckCircle, AlertTriangle } from 'lucide-react'

interface TranslationProgressProps {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  currentChunk?: number
  totalChunks?: number
  estimatedTime?: number
  elapsedTime?: number
}

export function TranslationProgress({
  status,
  progress,
  currentChunk = 0,
  totalChunks = 0,
  estimatedTime = 0,
  elapsedTime = 0
}: TranslationProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'processing':
        return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }
  
  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return '等待处理...'
      case 'processing':
        return `正在处理第 ${currentChunk}/${totalChunks} 个文本块...`
      case 'completed':
        return '翻译完成！'
      case 'failed':
        return '翻译失败'
      default:
        return '未知状态'
    }
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon()}
          长文本翻译进度
        </CardTitle>
        <CardDescription>
          {getStatusText()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>翻译进度</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
        
        {totalChunks > 0 && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">文本块:</span> {currentChunk}/{totalChunks}
            </div>
            <div>
              <span className="font-medium">状态:</span>
              <Badge variant={status === 'completed' ? 'default' : status === 'failed' ? 'destructive' : 'secondary'} className="ml-1">
                {status}
              </Badge>
            </div>
          </div>
        )}
        
        {(estimatedTime > 0 || elapsedTime > 0) && (
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              已用时间: {formatTime(elapsedTime)}
            </div>
            <div>
              预计总时间: {formatTime(estimatedTime)}
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          💡 长文本翻译采用分块处理，每个块独立翻译后合并结果
        </div>
      </CardContent>
    </Card>
  )
}
