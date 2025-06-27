'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Copy, Volume2, ArrowUpDown, Loader2, AlertTriangle, Coins } from 'lucide-react'
import { cn, copyToClipboard, getCharacterCount } from '@/lib/utils'
import { APP_CONFIG } from '../../config/app.config'
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
import { LanguageTabs } from '@/components/language-tabs'

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

export function TranslatorWidget({ 
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

  const maxLength = APP_CONFIG.nllb.maxLength
  const characterCount = getCharacterCount(state.sourceText)
  const isOverLimit = characterCount > maxLength
  
  // 积分消耗计算
  const estimatedCredits = estimateCredits(characterCount)
  const canAfford = hasEnoughCredits(estimatedCredits)
  const needsCredits = estimatedCredits > 0

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

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: state.sourceText,
          sourceLanguage: state.sourceLanguage,
          targetLanguage: state.targetLanguage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Translation failed')
      }

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
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Translation failed',
        isLoading: false,
      }))
    }
  }, [state.sourceText, state.sourceLanguage, state.targetLanguage, isOverLimit, needsCredits, user, canAfford, estimatedCredits, credits, router])

  const handleSwapLanguages = useCallback(() => {
    // 交换语言和文本内容
    setState(prev => ({
      ...prev,
      sourceLanguage: prev.targetLanguage,
      targetLanguage: prev.sourceLanguage,
      sourceText: prev.translatedText,
      translatedText: prev.sourceText,
    }))
  }, [state.targetLanguage, state.translatedText, state.sourceText])

  const handleCopy = useCallback(async (text: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      // 这里可以添加toast通知
      console.log('Copied to clipboard')
    }
  }, [])

  const handleSpeak = useCallback(async (text: string, language: string) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language,
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.data.audioUrl) {
        const audio = new Audio(data.data.audioUrl)
        audio.play()
      }
    } catch (error) {
      console.error('TTS failed:', error)
    }
  }, [])

  return (
    <div id="translator" className="w-full max-w-4xl mx-auto">
      <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
        <div className="p-6">
          {/* Language Selectors */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="source-language" className="text-sm font-medium">
                From
              </Label>
              <Select
                value={state.sourceLanguage}
                onValueChange={(value) => setState(prev => ({ ...prev, sourceLanguage: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2">
                      <span>English</span>
                      <span className="text-muted-foreground text-xs">(English)</span>
                    </div>
                  </SelectItem>
                  {APP_CONFIG.languages.supported
                    .filter(lang => lang.available)
                    .map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.name}</span>
                        <span className="text-muted-foreground text-xs">({lang.nativeName})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwapLanguages}
              disabled={state.isLoading}
              className="mt-6"
              title="Switch languages"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>

            <div className="flex-1">
              <Label htmlFor="target-language" className="text-sm font-medium">
                To
              </Label>
              <Select
                value={state.targetLanguage}
                onValueChange={(value) => setState(prev => ({ ...prev, targetLanguage: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2">
                      <span>English</span>
                      <span className="text-muted-foreground text-xs">(English)</span>
                    </div>
                  </SelectItem>
                  {APP_CONFIG.languages.supported
                    .filter(lang => lang.available)
                    .map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.name}</span>
                        <span className="text-muted-foreground text-xs">({lang.nativeName})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Translation Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Text */}
            <div className="space-y-2">
              <Label htmlFor="source-text">Enter text to translate</Label>
              <div className="relative">
                <Textarea
                  id="source-text"
                  placeholder={placeholder}
                  className="min-h-[120px] resize-y"
                  value={state.sourceText}
                  onChange={(e) => setState(prev => ({ ...prev, sourceText: e.target.value }))}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  {state.sourceText && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSpeak(state.sourceText, state.sourceLanguage)}
                      className="h-8 w-8"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className={cn(isOverLimit && 'text-destructive')}>
                  {characterCount}/{maxLength} characters
                </span>
                <CreditEstimate textLength={characterCount} />
              </div>
              
              {/* 免费额度进度条 */}
              <FreeQuotaProgress currentLength={characterCount} />
              
              {/* 积分不足警告 */}
              {needsCredits && !canAfford && (
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {t('credits.insufficient_balance', { required: estimatedCredits, current: credits })}
                    <Button variant="link" className="p-0 h-auto ml-1" onClick={() => router.push('/credits/purchase')}>
                      {t('credits.recharge_now')}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* 未登录用户提示 */}
              <ConditionalRender when="unauthenticated">
                {needsCredits && (
                  <Alert className="mt-2">
                    <Coins className="h-4 w-4" />
                    <AlertDescription>
                      {t('alerts.login_required_for_long_text')}
                      <Button variant="link" className="p-0 h-auto ml-1" onClick={() => router.push(`/${locale}/auth/signin`)}>
                        {t('alerts.login_now')}
                      </Button>
                      {t('alerts.or')}
                      <Button variant="link" className="p-0 h-auto ml-1" onClick={() => router.push(`/${locale}/auth/signup`)}>
                        {t('alerts.register_account')}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </ConditionalRender>
            </div>

            {/* Translation Result */}
            <div className="space-y-2">
              <Label>Translation</Label>
              <div className="relative">
                <Textarea
                  className="min-h-[120px] resize-y bg-muted/50"
                  value={state.translatedText}
                  readOnly
                  placeholder="Translation will appear here..."
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  {state.translatedText && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(state.translatedText)}
                        className="h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSpeak(state.translatedText, state.targetLanguage)}
                        className="h-8 w-8"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {state.error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{state.error}</p>
            </div>
          )}

          {/* Translate Button */}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleTranslate}
              disabled={!state.sourceText.trim() || isOverLimit || state.isLoading || (needsCredits && !canAfford)}
              size="lg"
              className="min-w-[140px]"
            >
              {state.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('buttons.translating')}
                </>
              ) : needsCredits ? (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  {t('buttons.translate_with_credits', { credits: estimatedCredits })}
                </>
              ) : (
                t('buttons.free_translate')
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Examples */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">Try these examples:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { text: 'Bonjou, kijan ou ye?', lang: 'ht', label: 'Creole greeting' },
            { text: 'ສະບາຍດີ, ເຈົ້າເປັນແນວໃດ?', lang: 'lo', label: 'Lao greeting' },
            { text: 'Habari za asubuhi', lang: 'sw', label: 'Swahili greeting' },
          ].map((example, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => {
                setState(prev => ({
                  ...prev,
                  sourceText: example.text,
                  sourceLanguage: example.lang,
                }))
              }}
              className="text-xs"
            >
              {example.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
} 