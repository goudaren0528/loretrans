#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

console.log('🔧 改进文本翻译功能...\n');

async function simplifyTranslationStatus() {
    const translatorPath = path.join(__dirname, 'frontend/components/translation/enhanced-text-translator.tsx');
    
    try {
        let content = await fs.readFile(translatorPath, 'utf8');
        
        // 简化翻译状态显示，只保留 "Translating" 状态
        const simplifiedStatusDisplay = `              {/* 简化的翻译状态显示 */}
              {isTranslating && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm font-medium text-blue-700">
                        Translating...
                      </span>
                    </div>
                    <span className="text-sm text-blue-600">
                      {currentTask?.progress || 0}%
                    </span>
                  </div>
                  
                  {currentTask && (
                    <>
                      <Progress 
                        value={currentTask.progress || 0} 
                        className="w-full h-2" 
                      />
                      <div className="flex justify-between text-xs text-blue-600">
                        <span>Processing your translation...</span>
                        {willUseQueue && (
                          <span>Queue mode - You can leave this page</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}`;

        // 替换复杂的状态显示
        content = content.replace(
            /\{\/\* 统一的翻译状态和进度显示 \*\/\}[\s\S]*?\{isTranslating && \([\s\S]*?\)\s*\}\s*\)\s*\}/,
            simplifiedStatusDisplay
        );

        await fs.writeFile(translatorPath, content, 'utf8');
        console.log('✅ 已简化翻译状态显示');
        
    } catch (error) {
        console.error('❌ 简化翻译状态失败:', error.message);
    }
}

async function enhanceTranslationHistory() {
    const historyPath = path.join(__dirname, 'frontend/components/translation/task-history-table.tsx');
    
    try {
        let content = await fs.readFile(historyPath, 'utf8');
        
        // 增强历史记录组件，添加复制和下载功能
        const enhancedHistoryComponent = `'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, AlertCircle, Loader2, Copy, Download, RefreshCw, FileText } from 'lucide-react'
import { TranslationTask, translationQueue } from '@/lib/translation-queue'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from '@/lib/hooks/use-toast'

interface TaskHistoryTableProps {
  className?: string
  sessionId: string
}

export function TaskHistoryTable({ className, sessionId }: TaskHistoryTableProps) {
  const [tasks, setTasks] = useState<TranslationTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  const truncateText = (text: string | undefined, maxLength: number = 50): string => {
    if (!text || typeof text !== 'string') return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const formatTimeAgo = (date: Date) => {
    try {
      return new Date(date).toLocaleString()
    } catch (error) {
      return 'Unknown time'
    }
  }

  const loadTasks = () => {
    if (!user) return
    try {
      const userTasks = translationQueue?.getUserTasks?.(sessionId) || []
      setTasks(userTasks)
      setIsLoading(false)
    } catch (error) {
      console.error('加载任务历史失败:', error)
      setTasks([])
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
    
    const handleTaskUpdate = (event: CustomEvent<TranslationTask>) => {
      const task = event.detail
      console.log('[TaskHistory] 收到任务更新:', task.id, task.status);
      
      setTasks(prevTasks => {
        const existingIndex = prevTasks.findIndex(t => t.id === task.id)
        if (existingIndex >= 0) {
          const newTasks = [...prevTasks]
          newTasks[existingIndex] = task
          console.log('[TaskHistory] 更新现有任务');
          return newTasks
        } else {
          console.log('[TaskHistory] 添加新任务');
          return [task, ...prevTasks]
        }
      })
    }

    // 监听多种事件
    window.addEventListener('translationTaskUpdate', handleTaskUpdate as EventListener)
    window.addEventListener('taskUpdate', handleTaskUpdate as EventListener)
    window.addEventListener('taskHistoryUpdate', handleTaskUpdate as EventListener)
    
    // 定期刷新任务列表
    const refreshInterval = setInterval(() => {
      if (user) {
        loadTasks()
      }
    }, 5000) // 每5秒刷新一次
    
    return () => {
      window.removeEventListener('translationTaskUpdate', handleTaskUpdate as EventListener)
      window.removeEventListener('taskUpdate', handleTaskUpdate as EventListener)
      window.removeEventListener('taskHistoryUpdate', handleTaskUpdate as EventListener)
      clearInterval(refreshInterval)
    }
  }, [sessionId, user])

  // 复制翻译结果到剪贴板
  const copyTranslation = async (task: TranslationTask) => {
    const textToCopy = task.translatedText || task.result || ''
    if (!textToCopy) {
      toast({
        title: "Nothing to copy",
        description: "This translation has no result to copy.",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(textToCopy)
      toast({
        title: "Copied to clipboard",
        description: "Translation result has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy translation to clipboard.",
        variant: "destructive",
      })
    }
  }

  // 复制完整翻译记录到剪贴板
  const copyFullRecord = async (task: TranslationTask) => {
    const record = \`Translation Record
===================
Source Text: \${task.text}
Translation: \${task.translatedText || task.result || 'No translation available'}
Source Language: \${task.sourceLanguage}
Target Language: \${task.targetLanguage}
Status: \${task.status}
Created: \${formatTimeAgo(task.createdAt)}
Task ID: \${task.id}
\`;

    try {
      await navigator.clipboard.writeText(record)
      toast({
        title: "Record copied",
        description: "Full translation record has been copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy translation record.",
        variant: "destructive",
      })
    }
  }

  // 下载翻译结果为TXT文件
  const downloadTranslation = (task: TranslationTask) => {
    const textToDownload = task.translatedText || task.result || ''
    if (!textToDownload) {
      toast({
        title: "Nothing to download",
        description: "This translation has no result to download.",
        variant: "destructive",
      })
      return
    }

    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = \`translation-\${task.sourceLanguage}-to-\${task.targetLanguage}-\${Date.now()}.txt\`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Download started",
      description: "Translation file has been downloaded.",
    })
  }

  // 下载完整翻译记录为TXT文件
  const downloadFullRecord = (task: TranslationTask) => {
    const record = \`Translation Record
===================
Source Text:
\${task.text}

Translation:
\${task.translatedText || task.result || 'No translation available'}

Details:
- Source Language: \${task.sourceLanguage}
- Target Language: \${task.targetLanguage}
- Status: \${task.status}
- Created: \${formatTimeAgo(task.createdAt)}
- Task ID: \${task.id}

Generated by Loretrans Translation Service
\`;

    const blob = new Blob([record], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = \`translation-record-\${task.sourceLanguage}-to-\${task.targetLanguage}-\${Date.now()}.txt\`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Record downloaded",
      description: "Full translation record has been downloaded.",
    })
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Translation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Translation History</CardTitle>
          <CardDescription>Your translation tasks will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No translation tasks yet</p>
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
            <CardDescription>Your recent translation tasks ({tasks.length} total)</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadTasks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.slice(0, 10).map((task) => (
            <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {task.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {task.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-600" />}
                  {task.status === 'processing' && <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />}
                  {task.status === 'pending' && <Clock className="h-4 w-4 text-gray-400" />}
                  
                  <Badge variant="secondary" className={
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'failed' ? 'bg-red-100 text-red-800' :
                    task.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {task.status}
                  </Badge>
                  
                  <span className="text-sm text-muted-foreground">
                    {task.sourceLanguage} → {task.targetLanguage}
                  </span>
                </div>
                
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(task.createdAt)}
                </span>
              </div>
              
              <div className="space-y-2 mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Source:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {truncateText(task.text, 150)}
                  </p>
                </div>
                
                {task.status === 'completed' && (task.translatedText || task.result) && (
                  <div>
                    <p className="text-sm font-medium text-green-700">Translation:</p>
                    <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
                      {truncateText(task.translatedText || task.result, 150)}
                    </p>
                  </div>
                )}
                
                {task.status === 'failed' && task.error && (
                  <div>
                    <p className="text-sm font-medium text-red-700">Error:</p>
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {truncateText(task.error, 100)}
                    </p>
                  </div>
                )}
                
                {task.status === 'processing' && (
                  <div>
                    <p className="text-sm text-blue-600">
                      Processing... {task.progress || 0}%
                    </p>
                  </div>
                )}
              </div>
              
              {/* 操作按钮 */}
              {task.status === 'completed' && (task.translatedText || task.result) && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyTranslation(task)}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Result
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadTranslation(task)}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download Result
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyFullRecord(task)}
                    className="flex items-center gap-1"
                  >
                    <FileText className="h-3 w-3" />
                    Copy Record
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFullRecord(task)}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download Record
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {tasks.length > 10 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Showing 10 of {tasks.length} tasks
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}`;

        // 完全替换历史记录组件
        await fs.writeFile(historyPath, enhancedHistoryComponent, 'utf8');
        console.log('✅ 已增强翻译历史记录功能');
        
    } catch (error) {
        console.error('❌ 增强历史记录失败:', error.message);
    }
}

async function main() {
    console.log('🔍 改进内容:');
    console.log('1. 简化翻译状态显示 - 只保留 "Translating" 状态');
    console.log('2. 增强历史记录功能 - 添加复制和下载功能\n');
    
    console.log('🛠️  具体改进:');
    console.log('翻译状态:');
    console.log('- 移除复杂的 processing/translating 状态判断');
    console.log('- 统一显示 "Translating..." 状态');
    console.log('- 保留进度条和百分比显示\n');
    
    console.log('历史记录:');
    console.log('- 添加 "Copy Result" 按钮 - 复制翻译结果');
    console.log('- 添加 "Download Result" 按钮 - 下载翻译结果为TXT');
    console.log('- 添加 "Copy Record" 按钮 - 复制完整翻译记录');
    console.log('- 添加 "Download Record" 按钮 - 下载完整记录为TXT');
    console.log('- 改进视觉设计和用户体验\n');
    
    await simplifyTranslationStatus();
    await enhanceTranslationHistory();
    
    console.log('\n✅ 文本翻译功能改进完成！');
    console.log('现在翻译状态更简洁，历史记录支持复制和下载功能。');
}

main().catch(console.error);
