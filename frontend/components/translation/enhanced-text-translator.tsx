'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Languages, 
  ArrowRightLeft, 
  Copy, 
  Download, 
  Loader2,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  LogIn
} from 'lucide-react'
import { useAuth, useCredits } from '@/lib/hooks/useAuth'
import { toast } from '@/lib/hooks/use-toast'
import { useTranslations } from 'next-intl'
import { 
  getMaxTextInputLimit, 
  getQueueThreshold, 
  shouldUseQueue,
  calculateTranslationCost 
} from '@/lib/config'
import { translationQueue, TranslationTask } from '@/lib/translation-queue'
import { TaskHistoryTable } from './task-history-table'

interface EnhancedTextTranslatorProps {
  className?: string
  defaultSourceLang?: string
  defaultTargetLang?: string
}

// 支持的语言列表
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ht', name: 'Haitian Creole', flag: '🇭🇹' },
  { code: 'lo', name: 'Lao', flag: '🇱🇦' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'my', name: 'Burmese', flag: '🇲🇲' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
]

export function EnhancedTextTranslator({ 
  className,
  defaultSourceLang = 'ht',
  defaultTargetLang = 'en'
}: EnhancedTextTranslatorProps) {
  const t = useTranslations('TextTranslatePage')
  const { user } = useAuth()
  const { credits, refreshCredits } = useCredits()
  
  // 配置
  const maxInputLimit = getMaxTextInputLimit()
  const queueThreshold = getQueueThreshold()
  
  // 状态管理
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState(defaultSourceLang)
  const [targetLanguage, setTargetLanguage] = useState(defaultTargetLang)
  const [isTranslating, setIsTranslating] = useState(false)
  const [currentTask, setCurrentTask] = useState<TranslationTask | null>(null)
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  
  // 计算相关状态
  const characterCount = sourceText.length
  const willUseQueue = shouldUseQueue(characterCount)
  const costInfo = calculateTranslationCost(characterCount)
  const canAfford = !user || credits >= costInfo.creditsRequired
  const needsLoginForQueue = willUseQueue && !user // 长文本需要登录

  useEffect(() => {
    // 监听任务更新
    const handleTaskUpdate = (event: CustomEvent<TranslationTask>) => {
      const task = event.detail
      if (currentTask && task.id === currentTask.id) {
        setCurrentTask(task)
        
        if (task.status === 'completed' && task.translatedText) {
          setTranslatedText(task.translatedText)
          setIsTranslating(false)
          refreshCredits()
          toast({
            title: "Translation completed",
            description: "Your text has been successfully translated.",
          })
        } else if (task.status === 'failed') {
          setIsTranslating(false)
          toast({
            title: "Translation failed",
            description: task.error || "An error occurred during translation.",
            variant: "destructive",
          })
        }
      }
    }

    window.addEventListener('translationTaskUpdate', handleTaskUpdate as EventListener)
    return () => {
      window.removeEventListener('translationTaskUpdate', handleTaskUpdate as EventListener)
    }
  }, [currentTask, refreshCredits])

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "No text to translate",
        description: "Please enter some text to translate.",
        variant: "destructive",
      })
      return
    }

    if (characterCount > maxInputLimit) {
      toast({
        title: "Text too long",
        description: `Maximum ${maxInputLimit} characters allowed.`,
        variant: "destructive",
      })
      return
    }

    // 如果需要登录，跳转到登录页面
    if (willUseQueue && !user) {
      window.location.href = '/auth/signin'
      return
    }

    if (!canAfford) {
      toast({
        title: "Insufficient credits",
        description: `You need ${costInfo.creditsRequired} credits for this translation.`,
        variant: "destructive",
      })
      return
    }

    setIsTranslating(true)
    setTranslatedText('')

    try {
      if (willUseQueue) {
        // 使用队列模式 (需要登录)
        const task = translationQueue.addTask(
          sourceText,
          sourceLanguage,
          targetLanguage,
          {
            type: 'text',
            priority: 2, // 注册用户优先级
            userId: user?.id,
            sessionId
          }
        )
        
        setCurrentTask(task)
        
        toast({
          title: "Translation queued",
          description: `Your translation has been added to the queue. You can leave this page and come back later.`,
        })
      } else {
        // 直接翻译模式
        const task = translationQueue.addTask(
          sourceText,
          sourceLanguage,
          targetLanguage,
          {
            type: 'text',
            priority: 3, // 直接翻译优先级最高
            userId: user?.id,
            sessionId
          }
        )
        
        setCurrentTask(task)
      }
    } catch (error) {
      setIsTranslating(false)
      toast({
        title: "Translation failed",
        description: "An error occurred while starting the translation.",
        variant: "destructive",
      })
    }
  }

  const handleSwapLanguages = () => {
    // 支持双向切换：英语可以与任何语言互换
    if ((sourceLanguage === 'en' && targetLanguage !== 'en') || 
        (targetLanguage === 'en' && sourceLanguage !== 'en')) {
      // 只交换语言方向，不交换文本内容
      const tempLang = sourceLanguage
      setSourceLanguage(targetLanguage)
      setTargetLanguage(tempLang)
    }
  }

  const copyToClipboard = async () => {
    if (!translatedText) return
    
    try {
      await navigator.clipboard.writeText(translatedText)
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

  const downloadTranslation = () => {
    if (!translatedText) return

    const blob = new Blob([translatedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'translation.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getTranslationModeInfo = () => {
    if (willUseQueue) {
      if (!user) {
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          title: "Login Required",
          description: "Large text translation requires user login",
          variant: "destructive" as const
        }
      }
      return {
        icon: <Clock className="h-4 w-4" />,
        title: "Queue Mode",
        description: "Large text will be processed in the background",
        variant: "secondary" as const
      }
    } else {
      return {
        icon: <Zap className="h-4 w-4" />,
        title: "Instant Mode",
        description: "Text will be translated immediately",
        variant: "default" as const
      }
    }
  }

  const modeInfo = getTranslationModeInfo()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Translation Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Enhanced Text Translator
              </CardTitle>
              <CardDescription>
                Translate up to {maxInputLimit.toLocaleString()} characters with queue processing
              </CardDescription>
            </div>
            <Badge variant={modeInfo.variant} className="flex items-center gap-1">
              {modeInfo.icon}
              {modeInfo.title}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">From</label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapLanguages}
              className="mt-6"
              disabled={!(
                (sourceLanguage === 'en' && targetLanguage !== 'en') || 
                (targetLanguage === 'en' && sourceLanguage !== 'en')
              )}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">To</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Translation Mode Info */}
          <Alert variant={modeInfo.variant}>
            {modeInfo.icon}
            <AlertDescription>
              {!needsLoginForQueue ? (
                <div className="flex items-center gap-2">
                  <span><strong>{modeInfo.title}:</strong> {modeInfo.description}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Please sign in to translate texts over 1000 characters.</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/auth/signin'}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </div>
              )}
              {willUseQueue && user && (
                <p className="mt-1 text-sm">
                  You can leave this page and return later to check your translation progress.
                </p>
              )}
            </AlertDescription>
          </Alert>

          {/* Input and Output Areas */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between h-5"> {/* 固定标签区域高度 */}
                <label className="text-sm font-medium">Source Text</label>
                <span className={`text-sm ${
                  characterCount > maxInputLimit ? 'text-red-500' : 
                  characterCount > queueThreshold ? 'text-yellow-600' : 'text-muted-foreground'
                }`}>
                  {characterCount.toLocaleString()} / {maxInputLimit.toLocaleString()}
                </span>
              </div>
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
                className="min-h-[200px] resize-none" // 扩大高度
                maxLength={maxInputLimit}
              />
              
              {/* Character Count Progress */}
              <div className="space-y-1">
                <Progress 
                  value={(characterCount / maxInputLimit) * 100} 
                  className="h-2"
                />
                {characterCount > queueThreshold && (
                  <p className="text-xs text-yellow-600">
                    ⚠️ Large text will use queue mode (background processing)
                  </p>
                )}
              </div>
            </div>

            {/* Output Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between h-5"> {/* 固定标签区域高度 */}
                <label className="text-sm font-medium">Translation</label>
                {translatedText && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadTranslation}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
              <Textarea
                value={translatedText}
                readOnly
                placeholder="Translation will appear here..."
                className="min-h-[200px] resize-none bg-muted" // 扩大高度
              />
              
              {/* Current Task Status */}
              {currentTask && isTranslating && (
                <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-center gap-2">
                    {currentTask.status === 'processing' ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    ) : currentTask.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm font-medium capitalize">
                      {currentTask.status}
                    </span>
                  </div>
                  
                  {currentTask.status === 'processing' && currentTask.estimatedTime && (
                    <div className="space-y-1">
                      <Progress value={50} className="h-2" />
                      <p className="text-xs text-blue-600">
                        Estimated time: {Math.ceil(currentTask.estimatedTime / 1000)}s
                      </p>
                    </div>
                  )}
                  
                  {currentTask.status === 'pending' && (
                    <p className="text-xs text-yellow-600">
                      Your translation is in the queue. Position updates automatically.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cost Information */}
          {characterCount > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Translation Cost</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Characters:</span>
                  <p className="font-medium">{costInfo.totalCharacters.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Free Characters:</span>
                  <p className="font-medium text-green-600">{costInfo.freeCharacters.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Billable Characters:</span>
                  <p className="font-medium">{costInfo.billableCharacters.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Credits Required:</span>
                  <p className={`font-medium ${canAfford ? 'text-blue-600' : 'text-red-600'}`}>
                    {costInfo.creditsRequired}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Translate Button */}
          <Button
            onClick={handleTranslate}
            disabled={!sourceText.trim() || isTranslating || (!needsLoginForQueue && !canAfford) || characterCount > maxInputLimit}
            className="w-full"
            size="lg"
          >
            {isTranslating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {willUseQueue ? 'Adding to Queue...' : 'Translating...'}
              </>
            ) : (
              <>
                <Languages className="mr-2 h-4 w-4" />
                {needsLoginForQueue ? 'Login Required for Long Text' : 
                 willUseQueue ? 'Add to Translation Queue' : 'Translate Now'}
              </>
            )}
          </Button>

          {/* Error Messages */}
          {!canAfford && characterCount > 0 && !needsLoginForQueue && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Insufficient credits. You need {costInfo.creditsRequired} credits but only have {credits}.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Task History - 只有登录用户才显示 */}
      <TaskHistoryTable sessionId={sessionId} />
    </div>
  )
}
