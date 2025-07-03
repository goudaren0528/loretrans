'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { 
  Copy, 
  Volume2, 
  ArrowUpDown, 
  Loader2, 
  AlertTriangle, 
  Coins,
  Clock,
  Zap,
  CheckCircle
} from 'lucide-react'
import { cn, copyToClipboard, getCharacterCount } from '@/lib/utils'
import { APP_CONFIG } from '@/config/app.config'
import { useAuth, useCredits } from '@/lib/hooks/useAuth'
import { useGuestLimit } from '@/components/guest-limit-guard'
import { ConditionalRender } from '@/components/auth/auth-guard'
import { CreditEstimate, FreeQuotaProgress } from '@/components/credits/credit-balance'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/hooks/use-toast'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { detectLocaleFromPath } from '@/lib/navigation'
import { BidirectionalNavigation } from '@/components/bidirectional-navigation'

interface TranslationState {
  sourceText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  isLoading: boolean
  error: string | null
}

interface TranslatorWidgetProps {
  defaultSourceLang?: string
  defaultTargetLang?: string
  placeholder?: string
}

// 队列处理阈值配置
const QUEUE_THRESHOLDS = {
  TEXT_LENGTH: 2000, // 超过2000字符使用队列
  ESTIMATED_TIME: 60, // 预计处理时间超过60秒使用队列
}

export function TranslatorWidgetEnhanced({ 
  defaultSourceLang = 'ht',
  defaultTargetLang = 'en',
  placeholder = 'Type your text here...'
}: TranslatorWidgetProps = {}) {
  const { user } = useAuth()
  const { credits, hasEnoughCredits, estimateCredits } = useCredits()
  const { limitStatus, recordTranslation, canTranslate, isLimitReached } = useGuestLimit()
  const router = useRouter()
  const pathname = usePathname()
  const { locale } = detectLocaleFromPath(pathname)
  const t = useTranslations('TranslatorWidget')
  
  const [state, setState] = useState<TranslationState>({
    sourceText: '',
    translatedText: '',
    sourceLanguage: defaultSourceLang,
    targetLanguage: defaultTargetLang,
    isLoading: false,
    error: null,
  })

  const [useQueue, setUseQueue] = useState(false)
  const [queueJobId, setQueueJobId] = useState<string | null>(null)

  const maxLength = APP_CONFIG.nllb.maxLength
  const characterCount = getCharacterCount(state.sourceText)
  const isOverLimit = characterCount > maxLength
  
  // 积分消耗计算
  const estimatedCredits = estimateCredits(characterCount)
  const canAfford = hasEnoughCredits(estimatedCredits)
  const needsCredits = estimatedCredits > 0

  // 判断是否应该使用队列
  const shouldUseQueue = useCallback(() => {
    if (!user) return false // 未登录用户不能使用队列
    
    return (
      useQueue || 
      characterCount > QUEUE_THRESHOLDS.TEXT_LENGTH ||
      estimatedCredits > 100 // 高积分消耗任务
    )
  }, [useQueue, characterCount, estimatedCredits, user])

  // 即时翻译处理
  const handleInstantTranslate = useCallback(async () => {
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

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: state.sourceText,
          sourceLang: state.sourceLanguage,
          targetLang: state.targetLanguage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Translation failed')
      }

      const data = await response.json()
      
      setState(prev => ({
        ...prev,
        translatedText: data.translatedText,
        isLoading: false,
      }))

      // 记录翻译成功
      if (!user) {
        recordTranslation()
      }

      toast({
        title: t('success.translation_complete'),
        description: needsCredits ? t('success.credits_consumed', { credits: data.credits?.consumed || 0 }) : undefined,
      })

    } catch (error) {
      console.error('Translation error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : t('errors.translation_failed'),
        isLoading: false,
      }))

      toast({
        title: t('errors.translation_failed'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      })
    }
  }, [state.sourceText, state.sourceLanguage, state.targetLanguage, isOverLimit, user, canTranslate, needsCredits, canAfford, estimatedCredits, credits, locale, router, recordTranslation, t])

  // 队列翻译处理
  const handleQueueTranslate = useCallback(async () => {
    if (!state.sourceText.trim() || isOverLimit || !user) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/translate/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobType: 'text',
          sourceLanguage: state.sourceLanguage,
          targetLanguage: state.targetLanguage,
          originalContent: state.sourceText,
          priority: 5,
          metadata: {
            source: 'translator_widget',
            character_count: characterCount
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create translation job')
      }

      const data = await response.json()
      setQueueJobId(data.jobId)
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        translatedText: '', // 清空即时结果
      }))

      toast({
        title: '翻译任务已创建',
        description: `任务已加入队列，预计处理时间: ${Math.ceil(data.estimatedProcessingTime / 60)} 分钟`,
      })

      // 跳转到队列页面
      router.push('/dashboard?tab=queue')

    } catch (error) {
      console.error('Queue translation error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '创建翻译任务失败',
        isLoading: false,
      }))

      toast({
        title: '创建任务失败',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      })
    }
  }, [state.sourceText, state.sourceLanguage, state.targetLanguage, isOverLimit, user, characterCount, router])

  // 主翻译处理函数
  const handleTranslate = useCallback(async () => {
    if (shouldUseQueue()) {
      await handleQueueTranslate()
    } else {
      await handleInstantTranslate()
    }
  }, [shouldUseQueue, handleQueueTranslate, handleInstantTranslate])

  // 切换语言
  const handleSwapLanguages = useCallback(() => {
    setState(prev => ({
      ...prev,
      sourceLanguage: prev.targetLanguage,
      targetLanguage: prev.sourceLanguage,
      sourceText: prev.translatedText,
      translatedText: prev.sourceText,
    }))
  }, [])

  // 复制翻译结果
  const handleCopyResult = useCallback(() => {
    if (state.translatedText) {
      copyToClipboard(state.translatedText)
      toast({
        title: "已复制",
        description: "翻译结果已复制到剪贴板",
      })
    }
  }, [state.translatedText])

  // 语音播放
  const handlePlayAudio = useCallback(() => {
    if (state.translatedText && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(state.translatedText)
      utterance.lang = state.targetLanguage === 'en' ? 'en-US' : state.targetLanguage
      speechSynthesis.speak(utterance)
    }
  }, [state.translatedText, state.targetLanguage])

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 翻译模式选择 */}
      {user && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <Label htmlFor="instant-mode">即时翻译</Label>
              <Switch
                id="instant-mode"
                checked={!useQueue}
                onCheckedChange={(checked) => setUseQueue(!checked)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <Label htmlFor="queue-mode">队列处理</Label>
              <Switch
                id="queue-mode"
                checked={useQueue}
                onCheckedChange={setUseQueue}
              />
            </div>
          </div>
          
          {shouldUseQueue() && (
            <div className="text-sm text-muted-foreground">
              <Clock className="h-4 w-4 inline mr-1" />
              将使用后台队列处理
            </div>
          )}
        </div>
      )}

      {/* 语言选择器 */}
      <BidirectionalNavigation
        sourceLanguage={state.sourceLanguage}
        targetLanguage={state.targetLanguage}
        onSourceLanguageChange={(lang) => setState(prev => ({ ...prev, sourceLanguage: lang }))}
        onTargetLanguageChange={(lang) => setState(prev => ({ ...prev, targetLanguage: lang }))}
        onSwapLanguages={handleSwapLanguages}
      />

      {/* 翻译区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 源文本输入 */}
        <div className="space-y-2">
          <Label htmlFor="source-text">源文本</Label>
          <div className="relative">
            <Textarea
              id="source-text"
              placeholder={placeholder}
              value={state.sourceText}
              onChange={(e) => setState(prev => ({ ...prev, sourceText: e.target.value }))}
              className={cn(
                "min-h-[200px] resize-none",
                isOverLimit && "border-red-500 focus:border-red-500"
              )}
              maxLength={maxLength}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              <span className={cn(isOverLimit && "text-red-500")}>
                {characterCount}/{maxLength}
              </span>
            </div>
          </div>
          
          {/* 字符限制警告 */}
          {isOverLimit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                文本长度超出限制。最大支持 {maxLength} 个字符。
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* 翻译结果 */}
        <div className="space-y-2">
          <Label htmlFor="translated-text">翻译结果</Label>
          <div className="relative">
            <Textarea
              id="translated-text"
              value={state.translatedText}
              readOnly
              className="min-h-[200px] resize-none bg-muted/50"
              placeholder={state.isLoading ? "翻译中..." : "翻译结果将显示在这里..."}
            />
            
            {/* 操作按钮 */}
            {state.translatedText && (
              <div className="absolute top-2 right-2 flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyResult}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePlayAudio}
                  className="h-8 w-8 p-0"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 积分信息和翻译按钮 */}
      <div className="space-y-4">
        <ConditionalRender condition={!!user}>
          <CreditEstimate 
            characterCount={characterCount}
            showDetails={needsCredits}
          />
        </ConditionalRender>

        <ConditionalRender condition={!user}>
          <FreeQuotaProgress 
            used={limitStatus.used}
            limit={limitStatus.limit}
            resetTime={limitStatus.resetTime}
          />
        </ConditionalRender>

        {/* 错误提示 */}
        {state.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* 翻译按钮 */}
        <div className="flex justify-center">
          <Button
            onClick={handleTranslate}
            disabled={!state.sourceText.trim() || isOverLimit || state.isLoading}
            size="lg"
            className="min-w-[200px]"
          >
            {state.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {shouldUseQueue() ? '创建任务中...' : t('buttons.translating')}
              </>
            ) : (
              <>
                {shouldUseQueue() ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    加入队列翻译
                  </>
                ) : needsCredits ? (
                  <>
                    <Coins className="h-4 w-4 mr-2" />
                    {t('buttons.translate_with_credits', { credits: estimatedCredits })}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    {t('buttons.free_translate')}
                  </>
                )}
              </>
            )}
          </Button>
        </div>

        {/* 队列提示 */}
        {shouldUseQueue() && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              由于文本较长或处理复杂，此翻译将在后台队列中处理。您可以离开此页面，稍后在"我的任务"中查看结果。
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
