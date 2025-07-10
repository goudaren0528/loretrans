'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { TranslationTask, translationQueue } from '@/lib/translation-queue'
import { toast } from '@/lib/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

interface TaskHistoryProps {
  sessionId: string
  className?: string
}

export function TaskHistory({ sessionId, className }: TaskHistoryProps) {
  const [tasks, setTasks] = useState<TranslationTask[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 初始加载任务
    loadTasks()

    // 监听任务更新
    const handleTaskUpdate = (event: CustomEvent<TranslationTask>) => {
      const updatedTask = event.detail
      if (updatedTask.sessionId === sessionId) {
        loadTasks()
      }
    }

    window.addEventListener('translationTaskUpdate', handleTaskUpdate as EventListener)

    // 定期刷新任务状态
    const interval = setInterval(loadTasks, 5000)

    return () => {
      window.removeEventListener('translationTaskUpdate', handleTaskUpdate as EventListener)
      clearInterval(interval)
    }
  }, [sessionId])

  const loadTasks = () => {
    const userTasks = translationQueue.getUserTasks(sessionId)
    setTasks(userTasks)
    setIsLoading(false)
  }

  const getStatusIcon = (status: TranslationTask['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: TranslationTask['status']) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      completed: 'success',
      failed: 'destructive'
    } as const

    const labels = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed'
    }

    return (
      <Badge variant={variants[status] as any}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status]}</span>
      </Badge>
    )
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "Translation has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy translation to clipboard.",
        variant: "destructive",
      })
    }
  }

  const downloadTranslation = (task: TranslationTask) => {
    if (!task.translatedText) return

    const blob = new Blob([task.translatedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `translation-${task.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getProgressValue = (task: TranslationTask): number => {
    switch (task.status) {
      case 'pending':
        return 0
      case 'processing':
        return 50
      case 'completed':
        return 100
      case 'failed':
        return 0
      default:
        return 0
    }
  }

  const formatCharacterCount = (count: number): string => {
    if (count < 1000) return `${count} chars`
    return `${(count / 1000).toFixed(1)}k chars`
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Translation History
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Translation History</CardTitle>
          <CardDescription>
            Your translation tasks will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No translation tasks yet</p>
            <p className="text-sm">Start translating to see your history</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Translation History</CardTitle>
            <CardDescription>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadTasks}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="border rounded-lg p-4 space-y-3"
              >
                {/* Task Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(task.status)}
                    <span className="text-sm text-muted-foreground">
                      {formatCharacterCount(task.characterCount)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(task.createdAt, { addSuffix: true })}
                  </span>
                </div>

                {/* Language Info */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{task.sourceLanguage}</span>
                  <span>→</span>
                  <span className="font-medium">{task.targetLanguage}</span>
                </div>

                {/* Progress Bar */}
                {(task.status === 'processing' || task.status === 'pending') && (
                  <div className="space-y-1">
                    <Progress value={getProgressValue(task)} className="h-2" />
                    {task.status === 'processing' && task.estimatedTime && (
                      <p className="text-xs text-muted-foreground">
                        Estimated time: {Math.ceil(task.estimatedTime / 1000)}s
                      </p>
                    )}
                  </div>
                )}

                {/* Source Text Preview */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Source:</p>
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded text-ellipsis overflow-hidden">
                    {task.sourceText.length > 100 
                      ? `${task.sourceText.substring(0, 100)}...`
                      : task.sourceText
                    }
                  </p>
                </div>

                {/* Translation Result */}
                {task.status === 'completed' && task.translatedText && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Translation:</p>
                    <div className="bg-green-50 border border-green-200 p-2 rounded">
                      <p className="text-sm text-green-800">
                        {task.translatedText.length > 100 
                          ? `${task.translatedText.substring(0, 100)}...`
                          : task.translatedText
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(task.translatedText!)}
                        className="flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadTranslation(task)}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {task.status === 'failed' && task.error && (
                  <div className="bg-red-50 border border-red-200 p-2 rounded">
                    <p className="text-sm text-red-800">
                      Error: {task.error}
                    </p>
                    {task.retryCount < task.maxRetries && (
                      <p className="text-xs text-red-600 mt-1">
                        Retry {task.retryCount + 1}/{task.maxRetries + 1}
                      </p>
                    )}
                  </div>
                )}

                {/* Task Metadata */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>Task ID: {task.id.substring(0, 8)}</span>
                  {task.actualTime && (
                    <span>Completed in {(task.actualTime / 1000).toFixed(1)}s</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
