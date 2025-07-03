'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Pause, 
  Play, 
  Download,
  RefreshCw,
  Trash2,
  FileText,
  File,
  Users
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from '@/lib/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

// 翻译任务状态
type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'partial_success'

// 翻译任务接口
interface TranslationJob {
  id: string
  jobType: 'text' | 'document' | 'batch'
  status: JobStatus
  sourceLanguage: string
  targetLanguage: string
  progressPercentage: number
  totalChunks: number
  completedChunks: number
  failedChunks: number
  estimatedCredits: number
  consumedCredits: number
  refundedCredits: number
  createdAt: string
  processingStartedAt?: string
  processingCompletedAt?: string
  errorMessage?: string
  translatedContent?: string
  partialResults?: any
}

// 任务进度信息
interface JobProgress {
  jobId: string
  totalChunks: number
  completedChunks: number
  failedChunks: number
  progressPercentage: number
  status: JobStatus
  estimatedTimeRemaining?: number
}

// 状态样式映射
const statusConfig = {
  pending: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
    label: '等待中'
  },
  processing: {
    icon: RefreshCw,
    color: 'bg-blue-100 text-blue-800',
    label: '处理中'
  },
  completed: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    label: '已完成'
  },
  failed: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
    label: '失败'
  },
  cancelled: {
    icon: Pause,
    color: 'bg-gray-100 text-gray-800',
    label: '已取消'
  },
  partial_success: {
    icon: AlertCircle,
    color: 'bg-orange-100 text-orange-800',
    label: '部分成功'
  }
}

// 任务类型图标
const jobTypeIcons = {
  text: FileText,
  document: File,
  batch: Users
}

export function TranslationQueue() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<TranslationJob[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [jobProgress, setJobProgress] = useState<Record<string, JobProgress>>({})

  // 获取翻译任务列表
  const fetchJobs = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch('/api/translate/queue', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch translation jobs')
      }

      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast({
        title: '获取任务失败',
        description: '无法加载翻译任务列表',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [user])

  // 获取任务详情和进度
  const fetchJobDetails = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/translate/queue/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch job details')
      }

      const data = await response.json()
      
      // 更新任务信息
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, ...data.job } : job
      ))

      // 更新进度信息
      if (data.progress) {
        setJobProgress(prev => ({
          ...prev,
          [jobId]: data.progress
        }))
      }

      return data.job
    } catch (error) {
      console.error('Error fetching job details:', error)
      return null
    }
  }, [])

  // 取消任务
  const cancelJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/translate/queue/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to cancel job')
      }

      toast({
        title: '任务已取消',
        description: '翻译任务已成功取消'
      })

      // 刷新任务列表
      await fetchJobs()
    } catch (error) {
      console.error('Error cancelling job:', error)
      toast({
        title: '取消失败',
        description: '无法取消翻译任务',
        variant: 'destructive'
      })
    }
  }

  // 重试任务
  const retryJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/translate/queue/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to retry job')
      }

      toast({
        title: '任务已重试',
        description: '翻译任务已重新加入队列'
      })

      // 刷新任务列表
      await fetchJobs()
    } catch (error) {
      console.error('Error retrying job:', error)
      toast({
        title: '重试失败',
        description: '无法重试翻译任务',
        variant: 'destructive'
      })
    }
  }

  // 下载翻译结果
  const downloadResult = (job: TranslationJob) => {
    if (!job.translatedContent && !job.partialResults) return

    const content = job.translatedContent || JSON.stringify(job.partialResults, null, 2)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `translation_${job.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 定期更新进行中的任务
  useEffect(() => {
    const interval = setInterval(async () => {
      const processingJobs = jobs.filter(job => 
        ['pending', 'processing'].includes(job.status)
      )

      for (const job of processingJobs) {
        await fetchJobDetails(job.id)
      }
    }, 5000) // 每5秒更新一次

    return () => clearInterval(interval)
  }, [jobs, fetchJobDetails])

  // 初始加载
  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          请先登录以查看翻译任务队列
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>加载中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">翻译队列</h2>
          <p className="text-muted-foreground">
            管理您的翻译任务，支持后台处理长文本和文档
          </p>
        </div>
        <Button onClick={fetchJobs} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无翻译任务</h3>
            <p className="text-muted-foreground text-center">
              您还没有提交任何翻译任务。<br />
              长文本和文档翻译将在这里显示处理进度。
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => {
            const StatusIcon = statusConfig[job.status].icon
            const JobTypeIcon = jobTypeIcons[job.jobType]
            const progress = jobProgress[job.id]

            return (
              <Card key={job.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <JobTypeIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-base">
                          {job.sourceLanguage.toUpperCase()} → {job.targetLanguage.toUpperCase()}
                        </CardTitle>
                        <CardDescription>
                          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusConfig[job.status].color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[job.status].label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 进度条 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>进度</span>
                      <span>{job.progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={job.progressPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{job.completedChunks}/{job.totalChunks} 块已完成</span>
                      {progress?.estimatedTimeRemaining && (
                        <span>预计剩余 {progress.estimatedTimeRemaining}s</span>
                      )}
                    </div>
                  </div>

                  {/* 积分信息 */}
                  <div className="flex justify-between text-sm">
                    <span>积分消耗:</span>
                    <span>
                      {job.consumedCredits}/{job.estimatedCredits}
                      {job.refundedCredits > 0 && (
                        <span className="text-green-600 ml-1">
                          (已退还 {job.refundedCredits})
                        </span>
                      )}
                    </span>
                  </div>

                  {/* 错误信息 */}
                  {job.errorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{job.errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex justify-end space-x-2">
                    {job.status === 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => downloadResult(job)}
                        className="flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        下载
                      </Button>
                    )}

                    {job.status === 'partial_success' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadResult(job)}
                        className="flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        下载部分结果
                      </Button>
                    )}

                    {job.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryJob(job.id)}
                        className="flex items-center"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        重试
                      </Button>
                    )}

                    {['pending', 'processing'].includes(job.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelJob(job.id)}
                        className="flex items-center"
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        取消
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => fetchJobDetails(job.id)}
                      className="flex items-center"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      刷新
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
