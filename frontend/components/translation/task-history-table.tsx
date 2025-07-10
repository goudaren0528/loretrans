'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Download,
  RefreshCw,
  ChevronDown
} from 'lucide-react'
import { TranslationTask, translationQueue } from '@/lib/translation-queue'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from '@/lib/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

interface TaskHistoryTableProps {
  sessionId: string
  className?: string
}

export function TaskHistoryTable({ sessionId, className }: TaskHistoryTableProps) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<TranslationTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [displayCount, setDisplayCount] = useState(10)
  const [showLoadMore, setShowLoadMore] = useState(false)

  useEffect(() => {
    // 如果用户未登录，不执行任何操作
    if (!user) {
      setIsLoading(false)
      return
    }

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
  }, [sessionId, user])

  const loadTasks = () => {
    if (!user) return
    
    const userTasks = translationQueue.getUserTasks(sessionId)
    setTasks(userTasks)
    setShowLoadMore(userTasks.length > displayCount)
    setIsLoading(false)
  }

  // 如果用户未登录，不显示该组件
  if (!user) {
    return null
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
      completed: 'default',
      failed: 'destructive'
    } as const

    const labels = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed'
    }

    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    }

    return (
      <Badge className={`${colors[status]} border-0`}>
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
    a.download = `translation-${task.id.substring(0, 8)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatCharacterCount = (count: number): string => {
    if (count < 1000) return `${count}`
    return `${(count / 1000).toFixed(1)}k`
  }

  const formatDuration = (task: TranslationTask): string => {
    if (task.actualTime) {
      return `${(task.actualTime / 1000).toFixed(1)}s`
    }
    if (task.status === 'processing' && task.estimatedTime) {
      return `~${Math.ceil(task.estimatedTime / 1000)}s`
    }
    return '-'
  }

  const truncateText = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const displayedTasks = tasks.slice(0, displayCount)

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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px]">Languages</TableHead>
                <TableHead className="w-[80px]">Chars</TableHead>
                <TableHead className="min-w-[200px]">Source Text</TableHead>
                <TableHead className="min-w-[200px]">Translation</TableHead>
                <TableHead className="w-[80px]">Time</TableHead>
                <TableHead className="w-[100px]">Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    {getStatusBadge(task.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{task.sourceLanguage}</div>
                      <div className="text-muted-foreground">↓ {task.targetLanguage}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">
                      {formatCharacterCount(task.characterCount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <p className="text-sm text-muted-foreground truncate" title={task.sourceText}>
                        {truncateText(task.sourceText, 60)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      {task.status === 'completed' && task.translatedText ? (
                        <p className="text-sm text-green-800 truncate" title={task.translatedText}>
                          {truncateText(task.translatedText, 60)}
                        </p>
                      ) : task.status === 'failed' && task.error ? (
                        <p className="text-sm text-red-600 truncate" title={task.error}>
                          Error: {truncateText(task.error, 40)}
                        </p>
                      ) : task.status === 'processing' ? (
                        <p className="text-sm text-blue-600">Processing...</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Pending...</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">
                      {formatDuration(task)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(task.createdAt, { addSuffix: true })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {task.status === 'completed' && task.translatedText && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(task.translatedText!)}
                            className="h-8 w-8 p-0"
                            title="Copy translation"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadTranslation(task)}
                            className="h-8 w-8 p-0"
                            title="Download translation"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Load More Button */}
        {showLoadMore && displayCount < tasks.length && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setDisplayCount(prev => prev + 10)}
              className="flex items-center gap-2"
            >
              <ChevronDown className="h-4 w-4" />
              Load More ({tasks.length - displayCount} remaining)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
