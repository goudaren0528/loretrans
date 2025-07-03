'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowUpDown, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Volume2, 
  Zap,
  Languages,
  Minimize2,
  Maximize2,
  Mic,
  Camera,
  FileText,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_CONFIG } from '@/config/app.config'
import { useAuth, useCredits } from '@/lib/hooks/useAuth'
import { toast } from '@/lib/hooks/use-toast'
import { useTranslations } from 'next-intl'
import { CompactTimeEstimate } from '@/components/translation/smart-time-estimate'
import { FriendlyProgress } from '@/components/translation/friendly-progress'
import { estimateProcessingTime, determineProcessingMode } from '@/lib/services/smart-translation'

interface MobileTranslatorState {
  sourceText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  isLoading: boolean
  error: string | null
  isInputCollapsed: boolean
  isResultCollapsed: boolean
}

interface MobileTranslatorProps {
  defaultSourceLang?: string
  defaultTargetLang?: string
  className?: string
}

export function MobileTranslator({
  defaultSourceLang = 'ht',
  defaultTargetLang = 'en',
  className
}: MobileTranslatorProps) {
  const { user } = useAuth()
  const { credits, estimateCredits } = useCredits()
  const t = useTranslations()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = useState(false)
  const [activeLanguageType, setActiveLanguageType] = useState<'source' | 'target'>('source')

  const [state, setState] = useState<MobileTranslatorState>({
    sourceText: '',
    translatedText: '',
    sourceLanguage: defaultSourceLang,
    targetLanguage: defaultTargetLang,
    isLoading: false,
    error: null,
    isInputCollapsed: false,
    isResultCollapsed: false,
  })

  const characterCount = state.sourceText.length
  const estimatedCredits = estimateCredits(characterCount)
  const maxLength = APP_CONFIG.nllb.maxLength

  // 用户上下文
  const userContext = {
    isLoggedIn: !!user,
    creditBalance: credits,
    hasActiveTasks: false
  }

  // 获取时间预估
  const timeEstimate = state.sourceText.trim() 
    ? estimateProcessingTime(
        state.sourceText,
        state.sourceLanguage,
        state.targetLanguage,
        userContext
      )
    : null

  // 自动调整文本框高度
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [state.sourceText, adjustTextareaHeight])

  const handleTranslate = useCallback(async () => {
    if (!state.sourceText.trim()) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const processingMode = determineProcessingMode(
        state.sourceText,
        state.sourceLanguage,
        state.targetLanguage,
        userContext
      )

      const endpoint = processingMode === 'instant' ? '/api/translate' : '/api/translate/queue'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: state.sourceText,
          sourceLanguage: state.sourceLanguage,
          targetLanguage: state.targetLanguage,
          processingMode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Translation failed')
      }

      if (processingMode === 'instant') {
        setState(prev => ({
          ...prev,
          translatedText: data.data.translatedText,
          isLoading: false,
          isResultCollapsed: false, // 展开结果区域
        }))
        
        toast({
          title: t('translation.translation_complete'),
          description: t('credits.credits_consumed', { credits: estimatedCredits }),
        })
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
        toast({
          title: t('task.queue_created'),
          description: t('task.check_in_tasks'),
        })
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Translation failed',
      }))
      
      toast({
        title: '翻译失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      })
    }
  }, [state, userContext, estimatedCredits])

  const handleSwapLanguages = useCallback(() => {
    setState(prev => ({
      ...prev,
      sourceLanguage: prev.targetLanguage,
      targetLanguage: prev.sourceLanguage,
      sourceText: prev.translatedText,
      translatedText: prev.sourceText,
    }))
  }, [])

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: '已复制',
        description: '文本已复制到剪贴板',
      })
    })
  }, [])

  const openLanguageSheet = (type: 'source' | 'target') => {
    setActiveLanguageType(type)
    setIsLanguageSheetOpen(true)
  }

  const selectLanguage = (languageCode: string) => {
    if (activeLanguageType === 'source') {
      setState(prev => ({ ...prev, sourceLanguage: languageCode }))
    } else {
      setState(prev => ({ ...prev, targetLanguage: languageCode }))
    }
    setIsLanguageSheetOpen(false)
  }

  const getLanguageInfo = (code: string) => {
    return APP_CONFIG.languages.find(lang => lang.code === code) || APP_CONFIG.languages[0]
  }

  const sourceLanguageInfo = getLanguageInfo(state.sourceLanguage)
  const targetLanguageInfo = getLanguageInfo(state.targetLanguage)

  return (
    <div className={cn('w-full max-w-lg mx-auto space-y-4 p-4', className)}>
      {/* 语言选择器 - 移动端优化 */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="flex-1 justify-start h-12 px-3"
          onClick={() => openLanguageSheet('source')}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{sourceLanguageInfo.flag}</span>
            <div className="text-left">
              <div className="text-sm font-medium">{sourceLanguageInfo.name}</div>
              <div className="text-xs text-muted-foreground">源语言</div>
            </div>
          </div>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSwapLanguages}
          disabled={state.isLoading}
          className="shrink-0 h-12 w-12"
        >
          <ArrowUpDown className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          className="flex-1 justify-start h-12 px-3"
          onClick={() => openLanguageSheet('target')}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{targetLanguageInfo.flag}</span>
            <div className="text-left">
              <div className="text-sm font-medium">{targetLanguageInfo.name}</div>
              <div className="text-xs text-muted-foreground">目标语言</div>
            </div>
          </div>
        </Button>
      </div>

      {/* 输入区域 - 可折叠 */}
      <Collapsible
        open={!state.isInputCollapsed}
        onOpenChange={(open) => setState(prev => ({ ...prev, isInputCollapsed: !open }))}
      >
        <div className="space-y-3">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-auto p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">输入文本</span>
                {characterCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {characterCount} 字符
                  </Badge>
                )}
              </div>
              {state.isInputCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="输入要翻译的文本..."
                value={state.sourceText}
                onChange={(e) => setState(prev => ({ ...prev, sourceText: e.target.value }))}
                className="min-h-[120px] resize-none pr-12 text-base"
                disabled={state.isLoading}
                style={{ fontSize: '16px' }} // 防止iOS缩放
              />
              
              {/* 快捷操作按钮 */}
              <div className="absolute bottom-2 right-2 flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 字符计数和积分信息 */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className={cn(
                characterCount > maxLength && "text-red-500 font-medium"
              )}>
                {characterCount.toLocaleString()}/{maxLength.toLocaleString()} 字符
              </span>
              {estimatedCredits > 0 && (
                <span className="flex items-center space-x-1">
                  <span>预计消耗</span>
                  <Badge variant="outline" className="text-xs">
                    {estimatedCredits} 积分
                  </Badge>
                </span>
              )}
            </div>

            {/* 时间预估 */}
            {timeEstimate && (
              <CompactTimeEstimate 
                estimate={timeEstimate}
                className="text-xs"
              />
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* 翻译按钮 */}
      <Button
        onClick={handleTranslate}
        disabled={!state.sourceText.trim() || characterCount > maxLength || state.isLoading}
        className="w-full h-12 text-base font-medium"
        size="lg"
      >
        {state.isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>翻译中...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>开始翻译</span>
          </div>
        )}
      </Button>

      {/* 进度显示 */}
      {state.isLoading && (
        <FriendlyProgress
          data={{
            status: 'processing',
            percentage: 50,
            currentStep: '翻译中',
            estimatedTimeRemaining: timeEstimate?.estimatedSeconds || 30,
          }}
          compact
        />
      )}

      {/* 结果区域 - 可折叠 */}
      {(state.translatedText || state.error) && (
        <Collapsible
          open={!state.isResultCollapsed}
          onOpenChange={(open) => setState(prev => ({ ...prev, isResultCollapsed: !open }))}
        >
          <div className="space-y-3">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between h-auto p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <Languages className="h-4 w-4" />
                  <span className="font-medium">翻译结果</span>
                  {state.translatedText && (
                    <Badge variant="secondary" className="text-xs">
                      {state.translatedText.length} 字符
                    </Badge>
                  )}
                </div>
                {state.isResultCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-3">
              <div className="relative">
                <Textarea
                  value={state.translatedText || state.error || ''}
                  readOnly
                  className={cn(
                    "min-h-[120px] resize-none text-base",
                    state.error ? "text-red-600 bg-red-50" : "bg-muted/30"
                  )}
                  placeholder="翻译结果将显示在这里..."
                />

                {/* 结果操作按钮 */}
                {state.translatedText && (
                  <div className="absolute bottom-2 right-2 flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopy(state.translatedText)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {/* 语言选择器弹窗 */}
      <Dialog open={isLanguageSheetOpen} onOpenChange={setIsLanguageSheetOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Languages className="h-5 w-5" />
              <span>选择{activeLanguageType === 'source' ? '源' : '目标'}语言</span>
            </DialogTitle>
            <DialogDescription>
              选择要{activeLanguageType === 'source' ? '翻译的' : '翻译成的'}语言
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-2 max-h-[50vh] overflow-y-auto">
            {APP_CONFIG.languages.map((language) => (
              <Button
                key={language.code}
                variant="ghost"
                className="w-full justify-start h-auto p-4"
                onClick={() => selectLanguage(language.code)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{language.flag}</span>
                  <div className="text-left">
                    <div className="font-medium">{language.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {language.nativeName}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
