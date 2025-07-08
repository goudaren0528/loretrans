'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  RefreshCw, 
  Scissors, 
  Coins,
  FileText,
  TrendingUp,
  Clock,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/hooks/use-toast'
import { useTranslations } from 'next-intl'

// 错误恢复数据接口
interface ErrorRecoveryData {
  jobId: string
  originalText: string
  totalChunks: number
  completedChunks: number
  failedChunks: number
  partialResults: Array<{
    chunkIndex: number
    originalText: string
    translatedText: string
    status: 'completed' | 'failed'
  }>
  estimatedCredits: number
  consumedCredits: number
  refundedCredits: number
  errorMessage: string
  canRetry: boolean
  canDownload: boolean
  canSegment: boolean
}

interface ErrorRecoveryProps {
  data: ErrorRecoveryData
  onRetry?: (options: RetryOptions) => void
  onDownload?: () => void
  onSegment?: () => void
  onClose?: () => void
  className?: string
}

interface RetryOptions {
  retryType: 'all' | 'failed_only' | 'segment'
  maxChunkSize?: number
}

export function ErrorRecovery({
  data,
  onRetry,
  onDownload,
  onSegment,
  onClose,
  className
}: ErrorRecoveryProps) {
  const t = useTranslations()
  const [isRetrying, setIsRetrying] = useState(false)
  const [selectedRetryType, setSelectedRetryType] = useState<'all' | 'failed_only' | 'segment'>('failed_only')

  const successRate = (data.completedChunks / data.totalChunks) * 100
  const hasPartialSuccess = data.completedChunks > 0
  const completedWords = data.partialResults
    .filter(r => r.status === 'completed')
    .reduce((acc, r) => acc + r.translatedText.split(' ').length, 0)

  const handleRetry = async (retryType: 'all' | 'failed_only' | 'segment') => {
    if (!onRetry) return
    
    setIsRetrying(true)
    try {
      await onRetry({ retryType })
      toast({
        title: t('ui.retrying'),
        description: t('translation.task_resubmitted'),
      })
    } catch (error) {
      toast({
        title: '重试失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      })
    } finally {
      setIsRetrying(false)
    }
  }

  const handleDownload = () => {
    if (!onDownload) return
    onDownload()
    toast({
      title: '下载已开始',
      description: '部分翻译结果正在下载',
    })
  }

  return (
    <Card className={cn('w-full max-w-4xl mx-auto', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>翻译部分完成</span>
            </CardTitle>
            <CardDescription>
              翻译过程中遇到了一些问题，但我们已为您保存了部分结果
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 成功率展示 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">翻译进度</span>
            <span className="text-sm text-muted-foreground">
              {data.completedChunks}/{data.totalChunks} 段落完成
            </span>
          </div>
          <Progress value={successRate} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>成功率: {successRate.toFixed(1)}%</span>
            <span>约 {completedWords} 个词已翻译</span>
          </div>
        </div>

        {/* 价值展示 */}
        {hasPartialSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-2">
                <div className="font-medium">已完成的翻译仍然有价值！</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-3 w-3" />
                    <span>{data.completedChunks} 段落成功翻译</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-3 w-3" />
                    <span>约 {completedWords} 个词的内容</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Coins className="h-3 w-3" />
                    <span>已消耗 {data.consumedCredits} 积分</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-3 w-3" />
                    <span>已退还 {data.refundedCredits} 积分</span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* 错误信息 */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">遇到的问题:</div>
              <div className="text-sm">{data.errorMessage}</div>
              <div className="text-xs text-muted-foreground mt-2">
                任务ID: {data.jobId}
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* 部分结果预览 */}
        {hasPartialSuccess && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">已完成的翻译片段</h4>
              <Badge variant="secondary">
                {data.completedChunks} 个片段
              </Badge>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3 bg-muted/30">
              {data.partialResults
                .filter(r => r.status === 'completed')
                .slice(0, 3) // 只显示前3个
                .map((result, index) => (
                  <div key={result.chunkIndex} className="text-sm">
                    <div className="text-muted-foreground text-xs mb-1">
                      片段 {result.chunkIndex + 1}:
                    </div>
                    <div className="bg-white p-2 rounded border">
                      {result.translatedText}
                    </div>
                  </div>
                ))}
              {data.completedChunks > 3 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  还有 {data.completedChunks - 3} 个片段...
                </div>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* 恢复选项 */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">选择恢复方式</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 重试失败部分 */}
            {data.canRetry && (
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">重试失败部分</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      只重新翻译失败的 {data.failedChunks} 个片段
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Coins className="h-3 w-3" />
                      <span>预计消耗积分较少</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 下载部分结果 */}
            {data.canDownload && hasPartialSuccess && (
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Download className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">下载已完成部分</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      获取已翻译的 {data.completedChunks} 个片段
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>立即可用</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 分段重新翻译 */}
            {data.canSegment && (
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Scissors className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-sm">分段重新翻译</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      将文本分成更小的片段重新处理
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>提高成功率</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3 pt-2">
            {data.canRetry && (
              <Button
                onClick={() => handleRetry('failed_only')}
                disabled={isRetrying}
                className="flex-1 min-w-[120px]"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    重试中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重试失败部分
                  </>
                )}
              </Button>
            )}

            {data.canDownload && hasPartialSuccess && (
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex-1 min-w-[120px]"
              >
                <Download className="h-4 w-4 mr-2" />
                下载部分结果
              </Button>
            )}

            {data.canSegment && (
              <Button
                variant="outline"
                onClick={() => handleRetry('segment')}
                disabled={isRetrying}
                className="flex-1 min-w-[120px]"
              >
                <Scissors className="h-4 w-4 mr-2" />
                分段重试
              </Button>
            )}
          </div>
        </div>

        {/* 积分说明 */}
        <Alert className="border-blue-200 bg-blue-50">
          <Coins className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-1">
              <div className="font-medium">积分处理说明</div>
              <div className="text-sm space-y-1">
                <div>• 已消耗积分: {data.consumedCredits} (用于成功翻译的部分)</div>
                <div>• 已退还积分: {data.refundedCredits} (失败部分按比例退还)</div>
                <div>• 重试时只需为失败部分支付积分</div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// 简化版错误恢复组件
export function CompactErrorRecovery({
  data,
  onRetry,
  onDownload,
  className
}: Pick<ErrorRecoveryProps, 'data' | 'onRetry' | 'onDownload' | 'className'>) {
  const successRate = (data.completedChunks / data.totalChunks) * 100
  const hasPartialSuccess = data.completedChunks > 0

  return (
    <Alert className={cn('border-orange-200 bg-orange-50', className)}>
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="space-y-3">
          <div>
            <div className="font-medium">翻译部分完成 ({successRate.toFixed(1)}%)</div>
            <div className="text-sm">{data.completedChunks}/{data.totalChunks} 段落成功</div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {data.canRetry && (
              <Button
                size="sm"
                onClick={() => onRetry?.({ retryType: 'failed_only' })}
                className="h-8"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                重试
              </Button>
            )}
            
            {hasPartialSuccess && data.canDownload && (
              <Button
                size="sm"
                variant="outline"
                onClick={onDownload}
                className="h-8"
              >
                <Download className="h-3 w-3 mr-1" />
                下载
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
