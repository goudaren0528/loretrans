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
  const { credits, hasEnoughCredits, estimateCredits, refreshCredits } = useCredits()
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

    // 检查用户登录状态和积分（基于300字符的产品方案）
    // 超过300字符需要积分，但为了避免认证问题，允许1000字符以下使用公共端点
    
    console.log('[Login Debug] User state check:', {
      characterCount,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      textLength: state.sourceText.length,
      needsLogin: characterCount > 300 && !user && state.sourceText.length > 1000
    })
    
    if (characterCount > 300 && !user && state.sourceText.length > 1000) {
      console.log('[Login Debug] Triggering login requirement')
      toast({
        title: t('errors.login_required_title'),
        description: 'For translations over 1000 characters, please sign in to continue.',
        variant: "destructive",
      })
      router.push(`/${locale}/auth/signin?redirect=` + encodeURIComponent(window.location.pathname))
      return
    }

    // 检查已登录用户的积分余额（对于需要积分的翻译）
    if (characterCount > 300 && user && !canAfford) {
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

    // 简化处理：直接开始翻译，不使用复杂的处理模式
    console.log('[Translation Start] Using simplified instant mode', {
      textLength: state.sourceText.length,
      estimatedCredits,
      timestamp: new Date().toISOString()
    })

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // 根据产品方案智能选择API端点
      let endpoint = '/api/translate'
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      // 智能选择API端点：
      // 临时方案：1000字符以下使用公共端点（保持功能可用）
      // 超过1000字符才需要认证和积分
      if (state.sourceText.length <= 1000) {
        endpoint = '/api/translate/public'
      } else {
        // 对于1000字符以上的文本，使用认证API并扣除积分
        endpoint = '/api/translate'
      }
      
      // 如果使用需要认证的端点，添加认证头
      if (endpoint !== '/api/translate/public' && user) {
        try {
          // 从Supabase获取当前session
          const { createSupabaseBrowserClient } = await import('@/lib/supabase')
          const supabase = createSupabaseBrowserClient()
          const { data: { session } } = await supabase.auth.getSession()
          
          console.log('[Auth Debug]', {
            endpoint,
            hasUser: !!user,
            hasSession: !!session,
            hasAccessToken: !!session?.access_token,
            tokenPreview: session?.access_token?.substring(0, 20) + '...'
          })
          
          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`
          }
        } catch (error) {
          console.warn('Failed to get auth token:', error)
        }
      }
      
      // 构建请求体
      const requestBody = {
        text: state.sourceText,
        sourceLang: state.sourceLanguage,
        targetLang: state.targetLanguage,
        sourceLanguage: state.sourceLanguage, // 保持兼容性
        targetLanguage: state.targetLanguage, // 保持兼容性
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      console.log('[API Response Debug]', {
        endpoint,
        status: response.status,
        ok: response.ok,
        responseKeys: Object.keys(data),
        hasTranslatedText: !!data.translatedText,
        hasDataTranslatedText: !!data.data?.translatedText,
        hasResult: !!data.result,
        errorMessage: data.error,
        timestamp: new Date().toISOString()
      })

      if (!response.ok) {
        throw new Error(data.error?.message || data.error || 'Translation failed')
      }

      // 直接处理翻译结果，不再使用复杂的处理模式判断
      const translatedText = data.translatedText || data.data?.translatedText || data.result
      
      console.log('[Translation Response]', {
        endpoint,
        responseData: data,
        extractedText: translatedText,
        timestamp: new Date().toISOString()
      })
      
      if (!translatedText) {
        throw new Error('No translation result received')
      }

      // 更新状态显示翻译结果
      setState(prev => ({
        ...prev,
        translatedText: translatedText,
        isLoading: false,
        error: null
      }))

      // 显示成功提示
      toast({
        title: 'Translation Complete',
        description: state.sourceText.length <= 1000 
          ? 'Free translation completed successfully'
          : `Translation completed using ${estimatedCredits} credits`,
      })

      // 如果使用了积分，刷新积分余额
      if (state.sourceText.length > 1000 && user) {
        await refreshCredits()
      }

    } catch (error) {
      console.error('[Translation Error]', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Translation failed',
      }))

      toast({
        title: 'Translation Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      })
    }
  }, [state, user, canTranslate, needsCredits, canAfford, estimatedCredits, credits, locale, router, t, recordTranslation])

  // 异步积分消费函数
  const consumeCreditsAsync = useCallback(async (
    creditsToConsume: number, 
    characterCount: number, 
    translationLength: number,
    retryCount = 0
  ) => {
    const maxRetries = 3
    
    try {
      // 获取认证头
      let authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (user) {
        try {
          const { createSupabaseBrowserClient } = await import('@/lib/supabase')
          const supabase = createSupabaseBrowserClient()
          const { data: { session } } = await supabase.auth.getSession()
          
          console.log('[Credit Debug] Auth check:', {
            hasUser: !!user,
            userId: user?.id,
            hasSession: !!session,
            hasAccessToken: !!session?.access_token,
            tokenPreview: session?.access_token?.substring(0, 20) + '...',
            creditsToConsume,
            currentCredits: credits
          })
          
          if (session?.access_token) {
            authHeaders['Authorization'] = `Bearer ${session.access_token}`
          } else {
            console.warn('[Credit Debug] No access token available')
          }
        } catch (error) {
          console.warn('Failed to get auth token for credit consumption:', error)
        }
      }

      const creditResponse = await fetch('/api/credits/consume', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          amount: creditsToConsume,
          reason: 'text_translation',
          metadata: {
            characterCount,
            sourceLanguage: state.sourceLanguage,
            targetLanguage: state.targetLanguage,
            translationLength,
            endpoint: 'public_with_async_billing',
            timestamp: new Date().toISOString()
          }
        })
      })
      
      const creditData = await creditResponse.json()
      
      console.log('[Credit Debug] API Response:', {
        status: creditResponse.status,
        ok: creditResponse.ok,
        data: creditData,
        requestAmount: creditsToConsume,
        timestamp: new Date().toISOString()
      })
      
      if (creditResponse.ok) {
        console.log('[Credits] Successfully consumed:', creditData)
        
        // 更新本地积分状态
        if (typeof credits === 'number') {
          // 这里可以触发积分刷新
          // refreshCredits?.()
        }
        
        toast({
          title: 'Translation Complete',
          description: t('success.credits_consumed', { credits: creditsToConsume }),
        })
      } else if (creditResponse.status === 402) {
        // 积分不足
        console.warn('[Credits] Insufficient credits:', creditData)
        toast({
          title: 'Translation Complete',
          description: `Translation successful, but insufficient credits (${creditData.available}/${creditData.required})`,
          variant: "destructive",
        })
      } else {
        throw new Error(`Credit API error: ${creditData.error || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.warn(`[Credits] Consumption failed (attempt ${retryCount + 1}):`, error)
      
      if (retryCount < maxRetries) {
        // 指数退避重试
        const delay = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
        setTimeout(() => {
          consumeCreditsAsync(creditsToConsume, characterCount, translationLength, retryCount + 1)
        }, delay)
      } else {
        // 最终失败
        toast({
          title: 'Translation Complete',
          description: 'Translation successful, but credit deduction failed. Please contact support if this persists.',
          variant: "default",
        })
      }
    }
  }, [user, state.sourceLanguage, state.targetLanguage, credits, t])

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
      // 不交换文本内容，保持原有的文本在原有的位置
      // sourceText 保持不变
      // translatedText 清空，因为语言方向改变了，之前的翻译结果不再有效
      translatedText: '',
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
      return state.processingMode === 'background' ? 'Submitting...' : 'Translating...'
    }
    return 'Start Translation'
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
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="zh">中文 (Chinese)</SelectItem>
              <SelectItem value="es">Español (Spanish)</SelectItem>
              <SelectItem value="fr">Français (French)</SelectItem>
              <SelectItem value="ar">العربية (Arabic)</SelectItem>
              <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
              <SelectItem value="pt">Português (Portuguese)</SelectItem>
              <SelectItem value="ht">Kreyòl Ayisyen (Haitian Creole)</SelectItem>
              <SelectItem value="lo">ລາວ (Lao)</SelectItem>
              <SelectItem value="sw">Kiswahili (Swahili)</SelectItem>
              <SelectItem value="my">မြန်မာ (Burmese)</SelectItem>
              <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 智能时间预估 - 已隐藏 */}
      {false && showTimeEstimate && state.sourceText.trim() && (
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
            when={user ? 'authenticated' : 'unauthenticated'}
            fallback={<FreeQuotaProgress currentLength={limitStatus ? (limitStatus.totalLimit - limitStatus.remainingTranslations) : 0} />}
          >
            <CreditEstimate 
              textLength={characterCount}
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
                {/* Voice playback functionality hidden */}
                {/* <Button variant="ghost" size="sm" className="h-8 px-2 hidden">
                  <Volume2 className="h-3 w-3 mr-1" />
                  {t('TranslatorWidget.actions.listen')}
                </Button> */}
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


    </div>
  )
}
