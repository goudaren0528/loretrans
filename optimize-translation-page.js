#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

console.log('🔧 优化文本翻译页面...\n');

async function removeTranslatingDuplicates() {
    const translatorPath = path.join(__dirname, 'frontend/components/translation/enhanced-text-translator.tsx');
    
    try {
        let content = await fs.readFile(translatorPath, 'utf8');
        
        // 查找并移除重复的翻译状态组件
        // 只保留一个简洁的 translating 状态显示
        const optimizedStatusDisplay = `              {/* 翻译状态显示 */}
              {isTranslating && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm font-medium text-blue-700">Translating...</span>
                    <span className="text-sm text-blue-600 ml-auto">
                      {currentTask?.progress || 0}%
                    </span>
                  </div>
                  {currentTask && currentTask.progress > 0 && (
                    <Progress 
                      value={currentTask.progress || 0} 
                      className="w-full h-1 mt-2" 
                    />
                  )}
                </div>
              )}`;

        // 替换所有翻译状态显示相关的代码
        content = content.replace(
            /\{\/\* 简化的翻译状态显示 \*\/\}[\s\S]*?\}\s*\)\s*\}/,
            optimizedStatusDisplay
        );

        // 如果上面的替换没有成功，尝试其他可能的模式
        if (!content.includes('Translating...')) {
            content = content.replace(
                /\{\/\* 翻译状态和进度显示 \*\/\}[\s\S]*?\}\s*\)\s*\}/,
                optimizedStatusDisplay
            );
        }

        await fs.writeFile(translatorPath, content, 'utf8');
        console.log('✅ 已优化翻译状态显示');
        
    } catch (error) {
        console.error('❌ 优化翻译状态失败:', error.message);
    }
}

async function optimizeHistoryLayout() {
    const historyPath = path.join(__dirname, 'frontend/components/translation/task-history-table.tsx');
    
    try {
        let content = await fs.readFile(historyPath, 'utf8');
        
        // 创建优化后的历史记录组件 - 更紧凑的布局，只保留必要按钮
        const optimizedHistoryComponent = `'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, AlertCircle, Loader2, Copy, Download, RefreshCw } from 'lucide-react'
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

  const truncateText = (text: string | undefined, maxLength: number = 80): string => {
    if (!text || typeof text !== 'string') return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const formatTimeAgo = (date: Date) => {
    try {
      const now = new Date()
      const diff = now.getTime() - new Date(date).getTime()
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      
      if (days > 0) return \`\${days}d ago\`
      if (hours > 0) return \`\${hours}h ago\`
      if (minutes > 0) return \`\${minutes}m ago\`
      return 'Just now'
    } catch (error) {
      return 'Unknown'
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
      setTasks(prevTasks => {
        const existingIndex = prevTasks.findIndex(t => t.id === task.id)
        if (existingIndex >= 0) {
          const newTasks = [...prevTasks]
          newTasks[existingIndex] = task
          return newTasks
        } else {
          return [task, ...prevTasks]
        }
      })
    }

    window.addEventListener('translationTaskUpdate', handleTaskUpdate as EventListener)
    window.addEventListener('taskUpdate', handleTaskUpdate as EventListener)
    window.addEventListener('taskHistoryUpdate', handleTaskUpdate as EventListener)
    
    const refreshInterval = setInterval(() => {
      if (user) loadTasks()
    }, 10000) // 每10秒刷新一次
    
    return () => {
      window.removeEventListener('translationTaskUpdate', handleTaskUpdate as EventListener)
      window.removeEventListener('taskUpdate', handleTaskUpdate as EventListener)
      window.removeEventListener('taskHistoryUpdate', handleTaskUpdate as EventListener)
      clearInterval(refreshInterval)
    }
  }, [sessionId, user])

  // 复制翻译结果
  const copyResult = async (task: TranslationTask) => {
    const result = task.translatedText || task.result || ''
    if (!result) {
      toast({
        title: "Nothing to copy",
        description: "This translation has no result.",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(result)
      toast({
        title: "Copied",
        description: "Translation result copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  // 下载翻译结果
  const downloadResult = (task: TranslationTask) => {
    const result = task.translatedText || task.result || ''
    if (!result) {
      toast({
        title: "Nothing to download",
        description: "This translation has no result.",
        variant: "destructive",
      })
      return
    }

    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = \`translation-\${task.sourceLanguage}-to-\${task.targetLanguage}-\${Date.now()}.txt\`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded",
      description: "Translation file downloaded.",
    })
  }

  if (!user) return null

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Translation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Translation History</CardTitle>
          <CardDescription>Your translation tasks will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No translations yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Translation History</CardTitle>
            <CardDescription className="text-sm">
              {tasks.length} translation{tasks.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadTasks}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {tasks.slice(0, 15).map((task) => (
            <div key={task.id} className="border rounded-lg p-3 hover:bg-gray-50/50 transition-colors">
              {/* 头部信息 - 状态和时间 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {task.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-600" />}
                  {task.status === 'failed' && <AlertCircle className="h-3 w-3 text-red-600" />}
                  {task.status === 'processing' && <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />}
                  {task.status === 'pending' && <Clock className="h-3 w-3 text-gray-400" />}
                  
                  <Badge variant="secondary" className={\`text-xs \${
                    task.status === 'completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'failed' ? 'bg-red-100 text-red-700' :
                    task.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }\`}>
                    {task.status}
                  </Badge>
                  
                  <span className="text-xs text-muted-foreground">
                    {task.sourceLanguage} → {task.targetLanguage}
                  </span>
                </div>
                
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(task.createdAt)}
                </span>
              </div>
              
              {/* 文本内容 - 紧凑布局 */}
              <div className="space-y-1 mb-2">
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Source:</span> {truncateText(task.text, 100)}
                </div>
                
                {task.status === 'completed' && (task.translatedText || task.result) && (
                  <div className="text-xs text-green-700">
                    <span className="font-medium">Result:</span> {truncateText(task.translatedText || task.result, 100)}
                  </div>
                )}
                
                {task.status === 'failed' && task.error && (
                  <div className="text-xs text-red-600">
                    <span className="font-medium">Error:</span> {truncateText(task.error, 80)}
                  </div>
                )}
                
                {task.status === 'processing' && (
                  <div className="text-xs text-blue-600">
                    Processing... {task.progress || 0}%
                  </div>
                )}
              </div>
              
              {/* 操作按钮 - 只保留Copy和Download */}
              {task.status === 'completed' && (task.translatedText || task.result) && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyResult(task)}
                    className="h-7 px-2 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadResult(task)}
                    className="h-7 px-2 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {tasks.length > 15 && (
          <div className="mt-3 text-center">
            <p className="text-xs text-muted-foreground">
              Showing 15 of {tasks.length} translations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}`;

        // 完全替换历史记录组件
        await fs.writeFile(historyPath, optimizedHistoryComponent, 'utf8');
        console.log('✅ 已优化历史记录布局和功能');
        
    } catch (error) {
        console.error('❌ 优化历史记录失败:', error.message);
    }
}

async function main() {
    console.log('🔍 优化目标:');
    console.log('1. 移除重复的翻译状态组件');
    console.log('2. 简化历史记录按钮 - 只保留Copy和Download');
    console.log('3. 优化样式高度 - 让页面更紧凑\n');
    
    console.log('🛠️  具体优化:');
    console.log('翻译状态:');
    console.log('- 移除重复的processing组件');
    console.log('- 只保留简洁的Translating状态');
    console.log('- 减少组件高度和内边距\n');
    
    console.log('历史记录:');
    console.log('- 移除Copy Record和Download Record按钮');
    console.log('- 只保留Copy result和Download result');
    console.log('- 减少记录项高度');
    console.log('- 优化文字大小和间距');
    console.log('- 限制显示15条记录\n');
    
    await removeTranslatingDuplicates();
    await optimizeHistoryLayout();
    
    console.log('\n✅ 文本翻译页面优化完成！');
    console.log('页面现在更简洁紧凑，功能更专注。');
}

main().catch(console.error);
