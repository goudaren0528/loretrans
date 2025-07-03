'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Copy, Volume2, ArrowUpDown, Loader2, AlertTriangle, Coins, Zap, Star, CheckCircle } from 'lucide-react'
import { cn, copyToClipboard, getCharacterCount } from '@/lib/utils'
import { APP_CONFIG } from '@/config/app.config'
import { useAuth, useCredits } from '@/lib/hooks/useAuth'
import { useGuestLimit } from '@/components/guest-limit-guard'
import { ConditionalRender } from '@/components/auth/auth-guard'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/hooks/use-toast'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { detectLocaleFromPath } from '@/lib/navigation'
import { QuickFeedback } from '@/components/feedback/feedback-widget'
import { usePerformanceMonitor } from '@/lib/analytics/performance-monitor'

interface TranslationState {
  sourceText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  isLoading: boolean
  error: string | null
  translationTime?: number
  characterCount: number
}

interface TranslatorWidgetV2Props {
  defaultSourceLang?: string
  defaultTargetLang?: string
  placeholder?: string
  showLanguageInfo?: boolean
}

// 语言配置
const LANGUAGES = {
  'ht': { name: '海地克里奥尔语', nativeName: 'Kreyòl Ayisyen', flag: '🇭🇹' },
  'lo': { name: '老挝语', nativeName: 'ລາວ', flag: '🇱🇦' },
  'sw': { name: '斯瓦希里语', nativeName: 'Kiswahili', flag: '🇹🇿' },
  'my': { name: '缅甸语', nativeName: 'မြန်မာ', flag: '🇲🇲' },
  'te': { name: '泰卢固语', nativeName: 'తెలుగు', flag: '🇮🇳' },
  'en': { name: '英语', nativeName: 'English', flag: '🇺🇸' }
}

export function TranslatorWidgetV2({ 
  defaultSourceLang = 'ht',
  defaultTargetLang = 'en',
  placeholder = '在此输入您要翻译的文本...',
  showLanguageInfo = true
}: TranslatorWidgetV2Props = {}) {
  const { user } = useAuth()
  const { credits, hasEnoughCredits, estimateCredits } = useCredits()
  const { limitStatus, recordTranslation, canTranslate, isLimitReached } = useGuestLimit()
  const router = useRouter()
  const pathname = usePathname()
  const { locale } = detectLocaleFromPath(pathname)
  const { trackTranslation, trackUserJourney } = usePerformanceMonitor()
  
  const [state, setState] = useState<TranslationState>({
    sourceText: '',
    translatedText: '',
    sourceLanguage: defaultSourceLang,
    targetLanguage: defaultTargetLang,
    isLoading: false,
    error: null,
    characterCount: 0
  })

  const [translationId, setTranslationId] = useState<string | null>(null)

  const maxLength = APP_CONFIG.nllb.maxLength
  const freeLimit = 500 // 免费字符限制
  const characterCount = getCharacterCount(state.sourceText)
  const isOverLimit = characterCount > maxLength
  const isFree = characterCount <= freeLimit
  const estimatedCredits = estimateCredits(characterCount)
  const canAfford = hasEnoughCredits(estimatedCredits)
  const needsCredits = estimatedCredits > 0

  // 更新字符计数
  useEffect(() => {
    setState(prev => ({ ...prev, characterCount }))
  }, [characterCount])

  // 语言切换
  const handleLanguageSwap = useCallback(() => {
    setState(prev => ({
      ...prev,
      sourceLanguage: prev.targetLanguage,
      targetLanguage: prev.sourceLanguage,
      sourceText: prev.translatedText,
      translatedText: prev.sourceText,
      error: null
    }))
  }, [])

  // 翻译处理
  const handleTranslate = useCallback(async () => {
    if (!state.sourceText.trim() || isOverLimit) return

    const startTime = Date.now()

    // 记录用户行为
    trackUserJourney('translation_started', {
      sourceLanguage: state.sourceLanguage,
      targetLanguage: state.targetLanguage,
      characterCount,
      isFree,
      estimatedCredits
    })

    // 检查未登录用户限制
    if (!user && !canTranslate) {
      toast({
        title: '翻译次数已达上限',
        description: '注册账户获得更多免费翻译额度',
        variant: "destructive",
      })
      router.push(`/${locale}/auth/signup?redirect=` + encodeURIComponent(window.location.pathname))
      return
    }

    // 检查用户登录状态和积分
    if (needsCredits && !user) {
      toast({
        title: '需要登录',
        description: '长文本翻译需要登录账户',
        variant: "destructive",
      })
      router.push(`/${locale}/auth/signin?redirect=` + encodeURIComponent(window.location.pathname))
      return
    }

    if (needsCredits && !canAfford) {
      toast({
        title: `积分不足 (需要${estimatedCredits}积分，当前${credits}积分)`,
        description: '点击充值获得更多积分',
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
          source_language: state.sourceLanguage,
          target_language: state.targetLanguage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '翻译失败')
      }

      const data = await response.json()
      const translationTime = Date.now() - startTime

      setState(prev => ({
        ...prev,
        translatedText: data.translated_text,
        isLoading: false,
        translationTime,
        error: null
      }))

      // 设置翻译ID用于反馈
      setTranslationId(data.translationId || `temp_${Date.now()}`)

      // 记录翻译性能
      trackTranslation({
        sourceLanguage: state.sourceLanguage,
        targetLanguage: state.targetLanguage,
        characterCount,
        translationTime,
        success: true
      })

      // 记录翻译完成事件
      trackUserJourney('translation_completed', {
        translationTime,
        success: true,
        characterCount
      })

      // 记录翻译（用于未登录用户限制）
      if (!user) {
        recordTranslation()
      }

      toast({
        title: '翻译完成',
        description: `耗时 ${(translationTime / 1000).toFixed(1)}秒`,
      })

    } catch (error) {
      console.error('Translation error:', error)
      const translationTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : '翻译失败，请稍后重试'
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))

      // 记录翻译错误
      trackTranslation({
        sourceLanguage: state.sourceLanguage,
        targetLanguage: state.targetLanguage,
        characterCount,
        translationTime,
        success: false,
        error: errorMessage
      })

      // 记录错误事件
      trackUserJourney('translation_failed', {
        error: errorMessage,
        translationTime
      })
      
      toast({
        title: '翻译失败',
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [state.sourceText, state.sourceLanguage, state.targetLanguage, user, canTranslate, needsCredits, canAfford, estimatedCredits, credits, router, locale, recordTranslation, trackTranslation, trackUserJourney, characterCount, isFree, isOverLimit])

  // 复制功能
  const handleCopy = useCallback(async (text: string) => {
    try {
      await copyToClipboard(text)
      toast({
        title: '已复制到剪贴板',
        description: '翻译结果已成功复制',
      })
    } catch (error) {
      toast({
        title: '复制失败',
        description: '请手动选择并复制文本',
        variant: "destructive",
      })
    }
  }, [])

  // 语音播放
  const handleSpeak = useCallback((text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang === 'en' ? 'en-US' : 'en-US' // 暂时只支持英语
      speechSynthesis.speak(utterance)
    } else {
      toast({
        title: '不支持语音播放',
        description: '您的浏览器不支持语音合成功能',
        variant: "destructive",
      })
    }
  }, [])

  const sourceLanguageInfo = LANGUAGES[state.sourceLanguage as keyof typeof LANGUAGES]
  const targetLanguageInfo = LANGUAGES[state.targetLanguage as keyof typeof LANGUAGES]

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Language Info Banner */}
      {showLanguageInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{sourceLanguageInfo?.flag}</span>
                <div>
                  <div className="font-medium text-gray-900">{sourceLanguageInfo?.name}</div>
                  <div className="text-sm text-gray-600">{sourceLanguageInfo?.nativeName}</div>
                </div>
              </div>
              <ArrowUpDown className="w-5 h-5 text-gray-400" />
              <div className="flex items-center gap-2">
                <span className="text-2xl">{targetLanguageInfo?.flag}</span>
                <div>
                  <div className="font-medium text-gray-900">{targetLanguageInfo?.name}</div>
                  <div className="text-sm text-gray-600">{targetLanguageInfo?.nativeName}</div>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              专业小语种翻译
            </Badge>
          </div>
        </div>
      )}

      {/* Main Translation Interface */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Source Text Input */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-xl">{sourceLanguageInfo?.flag}</span>
                {sourceLanguageInfo?.name}
              </CardTitle>
              <Select
                value={state.sourceLanguage}
                onValueChange={(value) => setState(prev => ({ ...prev, sourceLanguage: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGES).map(([code, lang]) => (
                    <SelectItem key={code} value={code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                value={state.sourceText}
                onChange={(e) => setState(prev => ({ ...prev, sourceText: e.target.value }))}
                placeholder={placeholder}
                className="min-h-[200px] resize-none"
                maxLength={maxLength}
              />
              {state.sourceText && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setState(prev => ({ ...prev, sourceText: '' }))}
                >
                  清空
                </Button>
              )}
            </div>

            {/* Character Count and Credit Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-medium",
                    isOverLimit ? "text-red-600" : 
                    characterCount > freeLimit ? "text-orange-600" : "text-green-600"
                  )}>
                    {characterCount.toLocaleString()} / {maxLength.toLocaleString()} 字符
                  </span>
                  {isFree && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      免费
                    </Badge>
                  )}
                </div>
                {!isFree && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Coins className="w-4 h-4" />
                    <span className="font-medium">预计消耗: {estimatedCredits}积分</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress 
                  value={(characterCount / maxLength) * 100} 
                  className="h-2"
                />
                {characterCount > freeLimit && (
                  <div className="text-xs text-gray-600">
                    超出免费额度 {characterCount - freeLimit} 字符
                  </div>
                )}
              </div>

              {/* Credit Status for Logged Users */}
              <ConditionalRender condition={!!user && needsCredits}>
                <div className={cn(
                  "flex items-center gap-2 p-3 rounded-lg text-sm",
                  canAfford ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                )}>
                  {canAfford ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>积分充足 (当前: {credits}积分)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>积分不足 (需要: {estimatedCredits}积分，当前: {credits}积分)</span>
                      <Button size="sm" variant="outline" onClick={() => router.push('/pricing')}>
                        充值
                      </Button>
                    </>
                  )}
                </div>
              </ConditionalRender>

              {/* Guest User Limit Info */}
              <ConditionalRender condition={!user}>
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span>
                        今日免费翻译: {limitStatus.used}/{limitStatus.limit}次
                      </span>
                    </div>
                    {isLimitReached && (
                      <Button size="sm" variant="outline" onClick={() => router.push(`/${locale}/auth/signup`)}>
                        注册获得更多
                      </Button>
                    )}
                  </div>
                  <Progress 
                    value={(limitStatus.used / limitStatus.limit) * 100} 
                    className="h-1 mt-2"
                  />
                </div>
              </ConditionalRender>
            </div>
          </CardContent>
        </Card>

        {/* Translation Result */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-xl">{targetLanguageInfo?.flag}</span>
                {targetLanguageInfo?.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLanguageSwap}
                  className="flex items-center gap-2"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  切换
                </Button>
                <Select
                  value={state.targetLanguage}
                  onValueChange={(value) => setState(prev => ({ ...prev, targetLanguage: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LANGUAGES).map(([code, lang]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                value={state.translatedText}
                readOnly
                placeholder="翻译结果将在这里显示..."
                className="min-h-[200px] resize-none bg-gray-50"
              />
              {state.isLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>正在翻译中...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {state.translatedText && !state.isLoading && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(state.translatedText)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    复制
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSpeak(state.translatedText, state.targetLanguage)}
                    className="flex items-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    播放
                  </Button>
                  {state.translationTime && (
                    <Badge variant="secondary" className="ml-auto">
                      耗时 {(state.translationTime / 1000).toFixed(1)}秒
                    </Badge>
                  )}
                </div>
                
                {/* 快速反馈 */}
                <div className="pt-2 border-t">
                  <QuickFeedback translationId={translationId} />
                </div>
              </div>
            )}

            {/* Error Display */}
            {state.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Translate Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleTranslate}
          disabled={!state.sourceText.trim() || isOverLimit || state.isLoading || (needsCredits && !canAfford) || (!user && isLimitReached)}
          size="lg"
          className="px-12 py-6 text-lg font-semibold"
        >
          {state.isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              翻译中...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {isFree ? '免费翻译' : `翻译 (${estimatedCredits}积分)`}
            </div>
          )}
        </Button>
      </div>

      {/* Tips */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium text-gray-900 mb-1">翻译小贴士</div>
            <ul className="space-y-1 text-xs">
              <li>• 500字符以下完全免费，无需注册</li>
              <li>• 注册用户获得500积分奖励，约可翻译5万字符</li>
              <li>• 支持海地克里奥尔语、老挝语、缅甸语等20+小语种</li>
              <li>• 基于Meta NLLB模型，翻译准确率超过90%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
