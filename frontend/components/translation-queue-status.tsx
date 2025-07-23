'use client'

import React, { useState, useEffect } from 'react'
import { queueChecker, type QueueJob } from '@/lib/translation-queue'
import { useGlobalCredits } from '@/lib/contexts/credits-context'

interface TranslationQueueStatusProps {
  jobId: string
  onComplete: (result: string) => void
  onError: (error: string) => void
}

export function TranslationQueueStatus({ jobId, onComplete, onError }: TranslationQueueStatusProps) {
  const [job, setJob] = useState<QueueJob | null>(null)
  const [isPolling, setIsPolling] = useState(true)
  const { refreshCredits } = useGlobalCredits()

  useEffect(() => {
    if (!jobId || !isPolling) return

    const pollStatus = async () => {
      try {
        await queueChecker.pollJobStatus(jobId, async (updatedJob) => {
          setJob(updatedJob)
          
          if (updatedJob.status === 'completed' && updatedJob.result) {
            setIsPolling(false)
            
            // 🔥 翻译完成后刷新积分余额
            console.log('[TranslationQueueStatus] 翻译完成，刷新积分余额...')
            await refreshCredits()
            
            onComplete(updatedJob.result)
          } else if (updatedJob.status === 'failed') {
            setIsPolling(false)
            onError(updatedJob.error || '翻译任务失败')
          }
        })
      } catch (error) {
        setIsPolling(false)
        onError(error instanceof Error ? error.message : '翻译任务失败')
      }
    }

    pollStatus()
  }, [jobId, isPolling, onComplete, onError, refreshCredits])

  if (!job) {
    return (
      <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-blue-700">正在初始化翻译任务...</span>
      </div>
    )
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待处理'
      case 'processing':
        return '正在翻译'
      case 'completed':
        return '翻译完成'
      case 'failed':
        return '翻译失败'
      default:
        return '未知状态'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700 bg-yellow-50'
      case 'processing':
        return 'text-blue-700 bg-blue-50'
      case 'completed':
        return 'text-green-700 bg-green-50'
      case 'failed':
        return 'text-red-700 bg-red-50'
      default:
        return 'text-gray-700 bg-gray-50'
    }
  }

  return (
    <div className={`p-4 rounded-lg ${getStatusColor(job.status)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {job.status === 'processing' && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          )}
          <span className="font-medium">{getStatusText(job.status)}</span>
        </div>
        <span className="text-sm opacity-75">
          {job.progress}% ({job.totalChunks} 个片段)
        </span>
      </div>
      
      {/* 进度条 */}
      <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mb-2">
        <div 
          className="bg-current h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${job.progress}%` }}
        ></div>
      </div>
      
      {/* 状态信息 */}
      <div className="text-sm opacity-75">
        {job.status === 'processing' && (
          <span>正在处理第 {Math.ceil((job.progress / 100) * job.totalChunks)} / {job.totalChunks} 个片段</span>
        )}
        {job.status === 'completed' && (
          <span>翻译已完成，共处理 {job.totalChunks} 个片段</span>
        )}
        {job.status === 'failed' && job.error && (
          <span>错误: {job.error}</span>
        )}
        {job.status === 'pending' && (
          <span>任务已排队，等待处理...</span>
        )}
      </div>
      
      {/* 时间信息 */}
      <div className="text-xs opacity-50 mt-2">
        创建时间: {new Date(job.createdAt).toLocaleTimeString()}
        {job.updatedAt !== job.createdAt && (
          <span> | 更新时间: {new Date(job.updatedAt).toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  )
}
