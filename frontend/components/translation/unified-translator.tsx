'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Copy, Volume2, ArrowUpDown, Loader2, AlertTriangle, Coins, Zap } from 'lucide-react'
import { cn, copyToClipboard, getCharacterCount } from '@/lib/utils'
import { APP_CONFIG } from '@/config/app.config'
import { useAuth, useCredits } from '@/lib/hooks/useAuth'
import { useGuestLimit } from '@/components/guest-limit-guard'
import { ConditionalRender } from '@/components/auth/auth-guard'
import { CreditEstimate, FreeQuotaProgress } from '@/components/credits/credit-balance'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/hooks/use-toast'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { detectLocaleFromPath } from '@/lib/navigation'
import { BidirectionalNavigation } from '@/components/bidirectional-navigation'
import { DynamicTimeEstimate } from '@/components/translation/smart-time-estimate'
import { estimateProcessingTime, determineProcessingMode, type ProcessingMode } from '@/lib/services/smart-translation'

interface UnifiedTranslatorState {
  sourceText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  isLoading: boolean
  error: string | null
  processingMode: ProcessingMode | null
  jobId?: string // 用于队列任务
}

interface UnifiedTranslatorProps {
  defaultSourceLang?: string
  defaultTargetLang?: string
  placeholder?: string
  showTimeEstimate?: boolean
  className?: string
}

export function UnifiedTranslator({ 
  defaultSourceLang = 'ht',
  defaultTargetLang = 'en',
  placeholder = 'Type your text here...',
  showTimeEstimate = true,
  className
}: UnifiedTranslatorProps) {
  const { user } = useAuth()
  const { credits, hasEnoughCredits, estimateCredits } = useCredits()
  const { limitStatus, recordTranslation, canTranslate, isLimitReached } = useGuestLimit()
  const router = useRouter()
  const pathname = usePathname()
  const { locale } = detectLocaleFromPath(pathname)
  const t = useTranslations('TranslatorWidget')

  const [state, setState] = useState<UnifiedTranslatorState>({
    sourceText: '',
    translatedText: '',
    sourceLanguage: defaultSourceLang,
    targetLanguage: defaultTargetLang,
    isLoading: false,
    error: null,
    processingMode: null,
  })

  const maxLength = APP_CONFIG.nllb.maxLength
  const characterCount = getCharacterCount(state.sourceText)
  const isOverLimit = characterCount > maxLength
  
  // 积分消耗计算
  const estimatedCredits = estimateCredits(characterCount)
  const canAfford = hasEnoughCredits(estimatedCredits)
  const needsCredits = estimatedCredits > 0

  // 用户上下文信息
  const userContext = {
    isLoggedIn: !!user,
    creditBalance: credits,
    hasActiveTasks: false // TODO: 从API获取
  }

  // 智能判断处理模式
  useEffect(() => {
    if (state.sourceText.trim()) {
      const mode = determineProcessingMode(
        state.sourceText,
        state.sourceLanguage,
        state.targetLanguage,
        userContext
      )
      setState(prev => ({ ...prev, processingMode: mode }))
      
      // 内部日志记录（不显示给用户）
      console.log(`[Translation Mode] Auto-selected: ${mode}`, {
        textLength: state.sourceText.length,
        userLoggedIn: userContext.isLoggedIn,
        creditBalance: userContext.creditBalance
      })
    } else {
      setState(prev => ({ ...prev, processingMode: null }))
    }
  }, [state.sourceText, state.sourceLanguage, state.targetLanguage, userContext.isLoggedIn, userContext.creditBalance])

  const handleTranslate = useCallback(async () => {
    if (!state.sourceText.trim() || isOverLimit) return

    // 检查未登录用户限制
    if (!user && !canTranslate) {
      toast({
        title: t('errors.limit_reached_title'),
        description: t('errors.limit_reached_description'),
        variant: "destructive",
      })
      router.push(`/${locale}/auth/signup?redirect=` + encodeURIComponent(window.location.pathname))
      return
    }

    // 检查用户登录状态和积分
    if (needsCredits && !user) {
      toast({
        title: t('errors.login_required_title'),
        description: t('errors.login_required_description'),
        variant: "destructive",
      })
      router.push(`/${locale}/auth/signin?redirect=` + encodeURIComponent(window.location.pathname))
      return
    }

    if (needsCredits && !canAfford) {
      toast({
        title: t('credits.insufficient_balance', { required: estimatedCredits, current: credits }),
        description: t('credits.recharge_now'),
        variant: "destructive",
      })
      router.push('/pricing')
      return
    }

    // 记录未登录用户翻译次数
    if (!user) {
      const recorded = recordTranslation()
      if (!recorded) {
        toast({
          title: t('errors.daily_limit_title'),
          description: t('errors.daily_limit_description'),
          variant: "destructive",
        })
        return
      }
    }

    const processingMode = state.processingMode || 'instant'
    
    // 内部日志记录处理模式
    console.log(`[Translation Start] Mode: ${processingMode}`, {
      textLength: state.sourceText.length,
      estimatedCredits,
      timestamp: new Date().toISOString()
    })

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // 根据处理模式选择不同的API端点
      const endpoint = processingMode === 'instant' ? '/api/translate' : '/api/translate/queue'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: state.sourceText,
          sourceLanguage: state.sourceLanguage,
          targetLanguage: state.targetLanguage,
          processingMode, // 内部标识
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Translation failed')
      }

      if (processingMode === 'instant') {
        // 即时翻译结果
        setState(prev => ({
          ...prev,
          translatedText: data.data.translatedText,
          isLoading: false,
        }))

        // 显示积分消耗提示
        if (needsCredits) {
          toast({
            title: t('success.translation_complete'),
            description: t('success.credits_consumed', { credits: estimatedCredits }),
          })
        }
      } else {
        // 队列任务创建成功
        setState(prev => ({
          ...prev,
          jobId: data.data.jobId,
          isLoading: false,
        }))

        toast({
          title: t('task.queue_created'),
          description: processingMode === 'background' 
            ? t('task.can_leave_page')
            : t('translation.processing'),
        })

        // 如果是快速队列，开始轮询状态
        if (processingMode === 'fast_queue') {
          pollJobStatus(data.data.jobId)
        }
      }

    } catch (error) {
      console.error('[Translation Error]', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Translation failed',
      }))

      toast({
        title: t('errors.translation_failed'),
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      })
    }
  }, [state, user, canTranslate, needsCredits, canAfford, estimatedCredits, credits, locale, router, t, recordTranslation])

  // 轮询任务状态（用于快速队列）
  const pollJobStatus = useCallback(async (jobId: string) => {
    const maxAttempts = 30 // 最多轮询30次（5分钟）
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/translate/queue/${jobId}`)
        const data = await response.json()

        if (data.data.status === 'completed') {
          setState(prev => ({
            ...prev,
            translatedText: data.data.translatedContent,
            isLoading: false,
          }))
          toast({
            title: t('translation.translation_complete'),
            description: t('success.results_shown_below'),
          })
          return
        } else if (data.data.status === 'failed') {
          setState(prev => ({
            ...prev,
            error: data.data.errorMessage || '翻译失败',
            isLoading: false,
          }))
          return
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 10000) // 10秒后再次轮询
        } else {
          // 超时，提示用户到任务页面查看
          setState(prev => ({ ...prev, isLoading: false }))
          toast({
            title: '处理时间较长',
            description: '请到"我的任务"页面查看翻译进度',
          })
        }
      } catch (error) {
        console.error('[Poll Error]', error)
        if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 10000)
        }
      }
    }

    poll()
  }, [])

  const handleSwapLanguages = useCallback(() => {
    setState(prev => ({
      ...prev,
      sourceLanguage: prev.targetLanguage,
      targetLanguage: prev.sourceLanguage,
      sourceText: prev.translatedText,
      translatedText: prev.sourceText,
    }))
  }, [])

  const handleCopyResult = useCallback(() => {
    if (state.translatedText) {
      copyToClipboard(state.translatedText)
      toast({
        title: t('success.copied'),
        description: t('success.copied_description'),
      })
    }
  }, [state.translatedText, t])

  const getTranslateButtonText = () => {
    if (state.isLoading) {
      return state.processingMode === 'background' ? '提交中...' : '翻译中...'
    }
    return '开始翻译' // 统一的按钮文案
  }

  const getTranslateButtonIcon = () => {
    if (state.isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }
    return <Zap className="h-4 w-4" />
  }

  return (
    <div className={cn('w-full max-w-4xl mx-auto space-y-6', className)}>
      {/* 语言选择器 */}
      <div className="flex items-center justify-center space-x-4">
        <div className="flex-1">
          <Label htmlFor="source-lang" className="text-sm font-medium">
            {t('labels.from')}
          </Label>
          <Select
            value={state.sourceLanguage}
            onValueChange={(value) => setState(prev => ({ ...prev, sourceLanguage: value }))}
          >
            <SelectTrigger id="source-lang" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APP_CONFIG.languages.supported.filter(lang => lang.available).map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleSwapLanguages}
          className="mt-6 shrink-0"
          disabled={state.isLoading}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>

        <div className="flex-1">
          <Label htmlFor="target-lang" className="text-sm font-medium">
            {t('labels.to')}
          </Label>
          <Select
            value={state.targetLanguage}
            onValueChange={(value) => setState(prev => ({ ...prev, targetLanguage: value }))}
          >
            <SelectTrigger id="target-lang" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[APP_CONFIG.languages.target, ...APP_CONFIG.languages.supported.filter(lang => lang.available)].map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.nativeName || lang.name} {lang.nativeName && lang.nativeName !== lang.name ? `(${lang.name})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 智能时间预估 */}
      {showTimeEstimate && state.sourceText.trim() && (
        <DynamicTimeEstimate
          text={state.sourceText}
          sourceLanguage={state.sourceLanguage}
          targetLanguage={state.targetLanguage}
          userContext={userContext}
          className="mb-4"
        />
      )}

      {/* 翻译区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 源文本输入 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="source-text" className="text-sm font-medium">
              {t('labels.source_text')}
            </Label>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className={cn(
                isOverLimit && "text-red-500 font-medium"
              )}>
                {characterCount.toLocaleString()}/{maxLength.toLocaleString()}
              </span>
              {needsCredits && (
                <div className="flex items-center space-x-1">
                  <Coins className="h-3 w-3" />
                  <span>{estimatedCredits}</span>
                </div>
              )}
            </div>
          </div>
          
          <Textarea
            id="source-text"
            placeholder={placeholder}
            value={state.sourceText}
            onChange={(e) => setState(prev => ({ ...prev, sourceText: e.target.value }))}
            className="min-h-[200px] resize-none"
            disabled={state.isLoading}
          />

          {isOverLimit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t('errors.text_too_long', { max: maxLength.toLocaleString() })}
              </AlertDescription>
            </Alert>
          )}

          {/* 积分和配额信息 */}
          <ConditionalRender
            condition={!!user}
            fallback={<FreeQuotaProgress current={limitStatus.used} max={limitStatus.limit} />}
          >
            <CreditEstimate 
              characters={characterCount}
              showBalance={true}
            />
          </ConditionalRender>
        </div>

        {/* 翻译结果 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="translated-text" className="text-sm font-medium">
              {t('labels.translated_text')}
            </Label>
            {state.translatedText && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyResult}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {t('actions.copy')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  disabled
                >
                  <Volume2 className="h-3 w-3 mr-1" />
                  {t('actions.listen')}
                </Button>
              </div>
            )}
          </div>
          
          <Textarea
            id="translated-text"
            value={state.translatedText}
            readOnly
            className="min-h-[200px] resize-none bg-muted/50"
            placeholder={state.isLoading ? t('placeholders.translating') : t('placeholders.translation_result')}
          />

          {state.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state.jobId && !state.translatedText && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                翻译任务已创建 (ID: {state.jobId.slice(0, 8)}...)
                {state.processingMode === 'background' && (
                  <span className="block mt-1">您可以在"我的任务"页面查看进度</span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* 翻译按钮 */}
      <div className="flex justify-center">
        <Button
          onClick={handleTranslate}
          disabled={!state.sourceText.trim() || isOverLimit || state.isLoading}
          size="lg"
          className="px-8"
        >
          {getTranslateButtonIcon()}
          {getTranslateButtonText()}
        </Button>
      </div>

      {/* 双向导航 */}
      <BidirectionalNavigation 
        sourceLanguage={state.sourceLanguage}
        targetLanguage={state.targetLanguage}
      />
    </div>
  )
}
