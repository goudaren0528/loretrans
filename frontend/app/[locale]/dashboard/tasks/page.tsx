'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { TaskDashboard } from '@/components/translation/task-dashboard'
import { FriendlyProgress } from '@/components/translation/friendly-progress'
import { ErrorRecovery } from '@/components/translation/error-recovery'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Zap,
  FileText,
  Users
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/hooks/use-toast'

// 模拟任务数据
const mockTasks = [
  {
    id: 'task-001',
    title: '海地克里奥尔语商务文档翻译',
    type: 'document' as const,
    status: 'processing' as const,
    priority: 'high' as const,
    sourceLanguage: 'ht',
    targetLanguage: 'en',
    progressPercentage: 65,
    totalChunks: 20,
    completedChunks: 13,
    failedChunks: 0,
    estimatedCredits: 500,
    consumedCredits: 325,
    createdAt: '2024-07-03T06:00:00Z',
    processingStartedAt: '2024-07-03T06:05:00Z',
    estimatedTimeRemaining: 180,
    canPause: true,
    canCancel: true,
  },
  {
    id: 'task-002',
    title: '老挝语用户手册翻译',
    type: 'text' as const,
    status: 'completed' as const,
    priority: 'normal' as const,
    sourceLanguage: 'lo',
    targetLanguage: 'zh',
    progressPercentage: 100,
    totalChunks: 8,
    completedChunks: 8,
    failedChunks: 0,
    estimatedCredits: 200,
    consumedCredits: 200,
    createdAt: '2024-07-03T04:00:00Z',
    processingStartedAt: '2024-07-03T04:02:00Z',
    processingCompletedAt: '2024-07-03T04:15:00Z',
    canDownload: true,
  },
  {
    id: 'task-003',
    title: '缅甸语新闻文章批量翻译',
    type: 'batch' as const,
    status: 'partial_success' as const,
    priority: 'urgent' as const,
    sourceLanguage: 'my',
    targetLanguage: 'en',
    progressPercentage: 75,
    totalChunks: 50,
    completedChunks: 37,
    failedChunks: 13,
    estimatedCredits: 1000,
    consumedCredits: 740,
    createdAt: '2024-07-03T02:00:00Z',
    processingStartedAt: '2024-07-03T02:05:00Z',
    errorMessage: '部分文档格式不支持，已保存成功翻译的内容',
    canRetry: true,
    canDownload: true,
  },
  {
    id: 'task-004',
    title: '斯瓦希里语技术文档翻译',
    type: 'document' as const,
    status: 'pending' as const,
    priority: 'low' as const,
    sourceLanguage: 'sw',
    targetLanguage: 'fr',
    progressPercentage: 0,
    totalChunks: 15,
    completedChunks: 0,
    failedChunks: 0,
    estimatedCredits: 300,
    consumedCredits: 0,
    createdAt: '2024-07-03T07:30:00Z',
    canCancel: true,
  },
  {
    id: 'task-005',
    title: '泰卢固语法律文件翻译',
    type: 'document' as const,
    status: 'failed' as const,
    priority: 'high' as const,
    sourceLanguage: 'te',
    targetLanguage: 'en',
    progressPercentage: 25,
    totalChunks: 30,
    completedChunks: 7,
    failedChunks: 23,
    estimatedCredits: 600,
    consumedCredits: 140,
    createdAt: '2024-07-03T01:00:00Z',
    processingStartedAt: '2024-07-03T01:05:00Z',
    errorMessage: '翻译服务暂时不可用，请稍后重试',
    canRetry: true,
  }
]

// 模拟错误恢复数据
const mockErrorRecoveryData = {
  jobId: 'task-003',
  originalText: '缅甸语新闻文章批量翻译内容...',
  totalChunks: 50,
  completedChunks: 37,
  failedChunks: 13,
  partialResults: [
    {
      chunkIndex: 0,
      originalText: '缅甸政府宣布新的经济政策...',
      translatedText: 'The Myanmar government announced new economic policies...',
      status: 'completed' as const
    },
    {
      chunkIndex: 1,
      originalText: '这项政策将影响多个行业...',
      translatedText: 'This policy will affect multiple industries...',
      status: 'completed' as const
    },
    {
      chunkIndex: 2,
      originalText: '专家认为这将促进经济增长...',
      translatedText: 'Experts believe this will promote economic growth...',
      status: 'completed' as const
    }
  ],
  estimatedCredits: 1000,
  consumedCredits: 740,
  refundedCredits: 260,
  errorMessage: '部分文档格式不支持，已保存成功翻译的内容',
  canRetry: true,
  canDownload: true,
  canSegment: true
}

export default function TasksPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState(mockTasks)
  const [isLoading, setIsLoading] = useState(false)
  const [showErrorRecovery, setShowErrorRecovery] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // 检查用户登录状态
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin?redirect=/dashboard/tasks')
    }
  }, [user, router])

  // 刷新任务列表
  const handleRefresh = useCallback(async () => {
    setIsLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      // 这里应该调用实际的API
      toast({
        title: '刷新成功',
        description: '任务列表已更新',
      })
    } catch (error) {
      toast({
        title: '刷新失败',
        description: '请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 单个任务操作
  const handleTaskAction = useCallback(async (taskId: string, action: string, options?: any) => {
    console.log(`Task ${taskId} action: ${action}`, options)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (action === 'view_details') {
      // 如果是查看详情，可能显示错误恢复界面
      if (taskId === 'task-003') {
        setShowErrorRecovery(true)
      }
    }
    
    // 更新任务状态
    setTasks(prev => prev.map((task: any) => {
      if (task.id === taskId) {
        switch (action) {
          case 'pause':
            return { ...task, status: 'paused' as const }
          case 'resume':
            return { ...task, status: 'processing' as const }
          case 'cancel':
            return { ...task, status: 'cancelled' as const }
          case 'retry':
            return { ...task, status: 'pending' as const, progressPercentage: 0 }
          default:
            return task
        }
      }
      return task
    }) as any)
  }, [])

  // 批量操作
  const handleBatchAction = useCallback(async (taskIds: string[], action: string, options?: any) => {
    console.log(`Batch action ${action} on tasks:`, taskIds, options)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新任务状态
    setTasks(prev => prev.map(task => {
      if (taskIds.includes(task.id)) {
        switch (action) {
          case 'pause':
            return { ...task, status: 'paused' as const }
          case 'resume':
            return { ...task, status: 'processing' as const }
          case 'cancel':
            return { ...task, status: 'cancelled' as const }
          case 'retry':
            return { ...task, status: 'pending' as const, progressPercentage: 0 }
          case 'delete':
            return null // 将在filter中移除
          default:
            return task
        }
      }
      return task
    }).filter(Boolean) as typeof tasks)
  }, [])

  // 错误恢复操作
  const handleErrorRecovery = useCallback(async (options: any) => {
    console.log('Error recovery:', options)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setShowErrorRecovery(false)
  }, [])

  const handleErrorRecoveryDownload = useCallback(() => {
    console.log('Download partial results')
    // 实现下载逻辑
  }, [])

  // 统计数据
  const stats = {
    total: tasks.length,
    active: tasks.filter(t => ['pending', 'processing'].includes(t.status)).length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => ['failed', 'partial_success'].includes(t.status)).length,
  }

  if (!user) {
    return null // 或者显示加载状态
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">翻译任务管理</h1>
          <p className="text-muted-foreground mt-1">
            管理您的翻译任务，查看进度和结果
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button onClick={() => router.push('/text-translate')}>
            <Plus className="h-4 w-4 mr-2" />
            新建翻译
          </Button>
        </div>
      </div>

      {/* 快速统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">总任务</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.active}</div>
                <div className="text-xs text-muted-foreground">进行中</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-xs text-muted-foreground">已完成</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{stats.failed}</div>
                <div className="text-xs text-muted-foreground">需处理</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 任务列表 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="active">进行中</TabsTrigger>
          <TabsTrigger value="completed">已完成</TabsTrigger>
          <TabsTrigger value="failed">需处理</TabsTrigger>
          <TabsTrigger value="paused">已暂停</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <TaskDashboard
            tasks={tasks}
            onTaskAction={handleTaskAction}
            onBatchAction={handleBatchAction}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <TaskDashboard
            tasks={tasks.filter(t => ['pending', 'processing'].includes(t.status))}
            onTaskAction={handleTaskAction}
            onBatchAction={handleBatchAction}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <TaskDashboard
            tasks={tasks.filter(t => t.status === 'completed')}
            onTaskAction={handleTaskAction}
            onBatchAction={handleBatchAction}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="failed" className="mt-6">
          <TaskDashboard
            tasks={tasks.filter(t => ['failed', 'partial_success'].includes(t.status))}
            onTaskAction={handleTaskAction}
            onBatchAction={handleBatchAction}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="paused" className="mt-6">
          <TaskDashboard
            tasks={tasks.filter((t: any) => t.status === 'paused')}
            onTaskAction={handleTaskAction}
            onBatchAction={handleBatchAction}
            onRefresh={handleRefresh}
          />
        </TabsContent>
      </Tabs>

      {/* 错误恢复界面 */}
      {showErrorRecovery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full">
            <ErrorRecovery
              data={mockErrorRecoveryData}
              onRetry={handleErrorRecovery}
              onDownload={handleErrorRecoveryDownload}
              onClose={() => setShowErrorRecovery(false)}
            />
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1">
            <div className="font-medium">任务管理小贴士</div>
            <div className="text-sm space-y-1">
              <div>• 长文本会自动使用队列处理，您可以离开页面</div>
              <div>• 翻译失败时会保存部分结果并按比例退还积分</div>
              <div>• 可以批量管理多个任务，提高工作效率</div>
              <div>• 高优先级任务会优先处理</div>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
