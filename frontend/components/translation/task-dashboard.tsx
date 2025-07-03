'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Filter,
  Search,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Star,
  Calendar,
  User,
  Zap,
  Rocket,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/hooks/use-toast'
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 任务状态和优先级类型
type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'partial_success' | 'paused'
type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'
type TaskType = 'text' | 'document' | 'batch'

// 任务接口
interface Task {
  id: string
  title: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  sourceLanguage: string
  targetLanguage: string
  progressPercentage: number
  totalChunks: number
  completedChunks: number
  failedChunks: number
  estimatedCredits: number
  consumedCredits: number
  createdAt: string
  processingStartedAt?: string
  processingCompletedAt?: string
  estimatedTimeRemaining?: number
  errorMessage?: string
  canPause?: boolean
  canCancel?: boolean
  canRetry?: boolean
  canDownload?: boolean
}

// 批量操作类型
type BatchAction = 'pause' | 'resume' | 'cancel' | 'retry' | 'delete' | 'download' | 'priority'

interface TaskDashboardProps {
  tasks: Task[]
  onTaskAction?: (taskId: string, action: string, options?: any) => void
  onBatchAction?: (taskIds: string[], action: BatchAction, options?: any) => void
  onRefresh?: () => void
  className?: string
}

export function TaskDashboard({
  tasks,
  onTaskAction,
  onBatchAction,
  onRefresh,
  className
}: TaskDashboardProps) {
  const t = useTranslations()
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'created' | 'priority' | 'progress'>('created')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // 过滤和排序任务
  const filteredTasks = tasks
    .filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'progress':
          comparison = a.progressPercentage - b.progressPercentage
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // 统计数据
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    processing: tasks.filter(t => t.status === 'processing').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    paused: tasks.filter(t => t.status === 'paused').length,
  }

  // 选择所有任务
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedTasks(filteredTasks.map(t => t.id))
    } else {
      setSelectedTasks([])
    }
  }, [filteredTasks])

  // 选择单个任务
  const handleSelectTask = useCallback((taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId])
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId))
    }
  }, [])

  // 批量操作
  const handleBatchAction = useCallback(async (action: BatchAction, options?: any) => {
    if (selectedTasks.length === 0) {
      toast({
        title: t('task.select_tasks_first'),
        description: t('task.select_tasks_first'),
        variant: 'destructive'
      })
      return
    }

    try {
      await onBatchAction?.(selectedTasks, action, options)
      setSelectedTasks([])
      toast({
        title: t('success.operation_success'),
        description: t('task.batch_operation_success', { count: selectedTasks.length, action: getActionName(action) }),
      })
    } catch (error) {
      toast({
        title: '操作失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      })
    }
  }, [selectedTasks, onBatchAction])

  // 单个任务操作
  const handleTaskAction = useCallback(async (taskId: string, action: string, options?: any) => {
    try {
      await onTaskAction?.(taskId, action, options)
      toast({
        title: '操作成功',
        description: `任务${getActionName(action as BatchAction)}成功`,
      })
    } catch (error) {
      toast({
        title: '操作失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      })
    }
  }, [onTaskAction])

  const getActionName = (action: BatchAction): string => {
    const names = {
      pause: '暂停',
      resume: '恢复',
      cancel: '取消',
      retry: '重试',
      delete: '删除',
      download: '下载',
      priority: '设置优先级'
    }
    return names[action] || action
  }

  const getStatusConfig = (status: TaskStatus) => {
    const configs = {
      pending: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50', label: '等待中' },
      processing: { icon: Rocket, color: 'text-blue-500', bg: 'bg-blue-50', label: '处理中' },
      completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: '已完成' },
      failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: '失败' },
      cancelled: { icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-50', label: '已取消' },
      partial_success: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50', label: '部分成功' },
      paused: { icon: Pause, color: 'text-orange-500', bg: 'bg-orange-50', label: '已暂停' },
    }
    return configs[status]
  }

  const getPriorityConfig = (priority: TaskPriority) => {
    const configs = {
      low: { color: 'text-gray-500', bg: 'bg-gray-100', label: '低' },
      normal: { color: 'text-blue-500', bg: 'bg-blue-100', label: '普通' },
      high: { color: 'text-orange-500', bg: 'bg-orange-100', label: '高' },
      urgent: { color: 'text-red-500', bg: 'bg-red-100', label: '紧急' },
    }
    return configs[priority]
  }

  const getTypeIcon = (type: TaskType) => {
    const icons = {
      text: Zap,
      document: FileText,
      batch: RotateCcw
    }
    return icons[type]
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">总任务</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
              <div className="text-xs text-muted-foreground">等待中</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.processing}</div>
              <div className="text-xs text-muted-foreground">处理中</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
              <div className="text-xs text-muted-foreground">已完成</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
              <div className="text-xs text-muted-foreground">失败</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{stats.paused}</div>
              <div className="text-xs text-muted-foreground">已暂停</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 过滤和搜索 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索任务..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48"
              />
            </div>

            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">等待中</SelectItem>
                <SelectItem value="processing">处理中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
                <SelectItem value="paused">已暂停</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="优先级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部优先级</SelectItem>
                <SelectItem value="urgent">紧急</SelectItem>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="normal">普通</SelectItem>
                <SelectItem value="low">低</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="排序" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">创建时间</SelectItem>
                <SelectItem value="priority">优先级</SelectItem>
                <SelectItem value="progress">进度</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </Button>

            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 批量操作 */}
      {selectedTasks.length > 0 && (
        <Alert>
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>已选择 {selectedTasks.length} 个任务</span>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBatchAction('pause')}
                >
                  <Pause className="h-3 w-3 mr-1" />
                  暂停
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBatchAction('resume')}
                >
                  <Play className="h-3 w-3 mr-1" />
                  恢复
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBatchAction('retry')}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  重试
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBatchAction('download')}
                >
                  <Download className="h-3 w-3 mr-1" />
                  下载
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBatchAction('delete')}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  删除
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 任务列表 */}
      <div className="space-y-4">
        {/* 全选 */}
        <div className="flex items-center space-x-2 px-4">
          <Checkbox
            checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            全选 ({filteredTasks.length} 个任务)
          </span>
        </div>

        {/* 任务卡片 */}
        {filteredTasks.map((task) => {
          const statusConfig = getStatusConfig(task.status)
          const priorityConfig = getPriorityConfig(task.priority)
          const TypeIcon = getTypeIcon(task.type)
          const StatusIcon = statusConfig.icon

          return (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                  />

                  <div className="flex-1 space-y-3">
                    {/* 任务头部 */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium">{task.title}</h3>
                          <Badge variant="outline" className={cn('text-xs', priorityConfig.color, priorityConfig.bg)}>
                            {priorityConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{task.sourceLanguage} → {task.targetLanguage}</span>
                          <span>创建于 {formatDistanceToNow(new Date(task.createdAt), { locale: zhCN, addSuffix: true })}</span>
                          <span>ID: {task.id.slice(0, 8)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className={cn('text-xs', statusConfig.color, statusConfig.bg)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>进度</span>
                        <span>{task.progressPercentage}%</span>
                      </div>
                      <Progress value={task.progressPercentage} className="h-1" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{task.completedChunks}/{task.totalChunks} 段落完成</span>
                        {task.estimatedTimeRemaining && task.estimatedTimeRemaining > 0 && (
                          <span>剩余约 {Math.ceil(task.estimatedTimeRemaining / 60)} 分钟</span>
                        )}
                      </div>
                    </div>

                    {/* 积分信息 */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>消耗积分: {task.consumedCredits}/{task.estimatedCredits}</span>
                      {task.failedChunks > 0 && (
                        <span className="text-red-500">失败: {task.failedChunks} 段落</span>
                      )}
                    </div>

                    {/* 错误信息 */}
                    {task.errorMessage && (
                      <Alert variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3" />
                        <AlertDescription>{task.errorMessage}</AlertDescription>
                      </Alert>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {task.status === 'processing' && task.canPause && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskAction(task.id, 'pause')}
                          >
                            <Pause className="h-3 w-3 mr-1" />
                            暂停
                          </Button>
                        )}

                        {task.status === 'paused' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskAction(task.id, 'resume')}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            恢复
                          </Button>
                        )}

                        {(task.status === 'failed' || task.status === 'partial_success') && task.canRetry && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskAction(task.id, 'retry')}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            重试
                          </Button>
                        )}

                        {(task.status === 'completed' || task.status === 'partial_success') && task.canDownload && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskAction(task.id, 'download')}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            下载
                          </Button>
                        )}

                        {task.canCancel && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskAction(task.id, 'cancel')}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            取消
                          </Button>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTaskAction(task.id, 'view_details')}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredTasks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-2">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="font-medium">暂无任务</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
                    ? '没有符合条件的任务'
                    : '还没有翻译任务，去创建一个吧！'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
