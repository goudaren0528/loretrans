'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Copy, Volume2, ArrowUpDown, Loader2, AlertTriangle, Coins, Zap, Clock, CheckCircle, XCircle } from 'lucide-react'
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

interface TranslationState {
  sourceText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  isLoading: boolean
  error: string | null
  processingStats?: {
    totalChunks: number
    processedChunks: number
    successChunks: number
    failedChunks: number
    processingTime: number
    chunkResults: Array<{
      index: number
      status: 'success' | 'failed'
      attempts: number
      originalLength: number
      translatedLength: number
      error?: string
    }>
  }
}

interface ParallelTranslatorWidgetProps {
  defaultSourceLang?: string
  defaultTargetLang?: string
  placeholder?: string
  enableParallel?: boolean
}

export function ParallelTranslatorWidget({ 
  defaultSourceLang = 'ht',
  defaultTargetLang = 'en',
  placeholder = 'Type your text here...',
  enableParallel = true
}: ParallelTranslatorWidgetProps = {}) {
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
    error: null
  })

  // 计算是否应该使用并行处理
  const shouldUseParallel = enableParallel && state.sourceText.length > 1000

  const handleTranslate = useCallback(async () => {
    if (!state.sourceText.trim()) {
      toast({
        title: t('error.emptyText'),
        description: t('error.emptyTextDescription'),
        variant: 'destructive'
      })
      return
    }

    // 检查用户限制
    if (!user && !canTranslate) {
      toast({
        title: t('error.limitReached'),
        description: t('error.guestLimitDescription'),
        variant: 'destructive'
      })
      return
    }

    const characterCount = getCharacterCount(state.sourceText)
    const estimatedCredits = estimateCredits(characterCount)

    // 检查积分
    if (user && !hasEnoughCredits(estimatedCredits)) {
      toast({
        title: t('error.insufficientCredits'),
        description: t('error.insufficientCreditsDescription'),
        variant: 'destructive'
      })
      return
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      processingStats: undefined
    }))

    try {
      // 选择API端点
      const apiEndpoint = shouldUseParallel ? '/api/translate-parallel' : '/api/translate'
      
      console.log(`🚀 使用${shouldUseParallel ? '并行' : '顺序'}翻译API: ${apiEndpoint}`)
      console.log(`📝 文本长度: ${characterCount}字符`)

      const response = await fetch(apiEndpoint, {
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

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Translation failed')
      }

      // 记录翻译使用
      if (!user) {
        recordTranslation(characterCount)
      }

      // 更新状态
      setState(prev => ({
        ...prev,
        translatedText: result.translatedText,
        isLoading: false,
        processingStats: result.chunkResults ? {
          totalChunks: result.chunksProcessed || 1,
          processedChunks: result.chunksProcessed || 1,
          successChunks: result.successCount || (result.chunkResults?.filter((r: any) => r.status === 'success').length) || 1,
          failedChunks: result.failedCount || (result.chunkResults?.filter((r: any) => r.status === 'failed').length) || 0,
          processingTime: result.processingTime || 0,
          chunkResults: result.chunkResults || []
        } : undefined
      }))

      toast({
        title: t('success.translationComplete'),
        description: shouldUseParallel 
          ? `${t('success.parallelProcessing')} ${result.chunksProcessed} ${t('success.chunks')}`
          : t('success.translationCompleteDescription')
      })

    } catch (error: any) {
      console.error('Translation error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Translation failed'
      }))

      toast({
        title: t('error.translationFailed'),
        description: error.message || t('error.translationFailedDescription'),
        variant: 'destructive'
      })
    }
  }, [state.sourceText, state.sourceLanguage, state.targetLanguage, user, canTranslate, hasEnoughCredits, estimateCredits, recordTranslation, shouldUseParallel, t])

  const handleSwapLanguages = useCallback(() => {
    setState(prev => ({
      ...prev,
      sourceLanguage: prev.targetLanguage,
      targetLanguage: prev.sourceLanguage,
      sourceText: prev.translatedText,
      translatedText: prev.sourceText,
      error: null,
      processingStats: undefined
    }))
  }, [])

  const handleCopyResult = useCallback(() => {
    if (state.translatedText) {
      copyToClipboard(state.translatedText)
      toast({
        title: t('success.copied'),
        description: t('success.copiedDescription')
      })
    }
  }, [state.translatedText, t])

  const characterCount = getCharacterCount(state.sourceText)
  const estimatedCredits = estimateCredits(characterCount)

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 翻译模式指示器 */}
      {shouldUseParallel && (
        <Alert className="border-blue-200 bg-blue-50">
          <Zap className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>并行翻译模式已启用</strong> - 长文本将被智能分块并行处理，提高翻译速度和成功率
          </AlertDescription>
        </Alert>
      )}

      {/* 语言选择器 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="source-lang">{t('sourceLanguage')}</Label>
          <Select
            value={state.sourceLanguage}
            onValueChange={(value) => setState(prev => ({ ...prev, sourceLanguage: value }))}
          >
            <SelectTrigger id="source-lang">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APP_CONFIG.SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapLanguages}
            disabled={state.isLoading}
            className="rounded-full"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-lang">{t('targetLanguage')}</Label>
          <Select
            value={state.targetLanguage}
            onValueChange={(value) => setState(prev => ({ ...prev, targetLanguage: value }))}
          >
            <SelectTrigger id="target-lang">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APP_CONFIG.SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 翻译区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 源文本输入 */}
        <div className="space-y-2">
          <Label htmlFor="source-text">{t('sourceText')}</Label>
          <Textarea
            id="source-text"
            placeholder={placeholder}
            value={state.sourceText}
            onChange={(e) => setState(prev => ({ ...prev, sourceText: e.target.value }))}
            className="min-h-[200px] resize-none"
            disabled={state.isLoading}
          />
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{characterCount} {t('characters')}</span>
            {shouldUseParallel && (
              <span className="flex items-center gap-1 text-blue-600">
                <Zap className="h-3 w-3" />
                {t('parallelMode')}
              </span>
            )}
          </div>
        </div>

        {/* 翻译结果 */}
        <div className="space-y-2">
          <Label htmlFor="translated-text">{t('translatedText')}</Label>
          <div className="relative">
            <Textarea
              id="translated-text"
              value={state.translatedText}
              readOnly
              className="min-h-[200px] resize-none bg-gray-50"
              placeholder={state.isLoading ? t('translating') : t('translationWillAppearHere')}
            />
            {state.translatedText && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyResult}
                className="absolute top-2 right-2"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 处理进度和统计 */}
      {state.isLoading && state.processingStats && (
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="font-medium text-blue-800">并行处理中...</span>
          </div>
          <Progress 
            value={(state.processingStats.processedChunks / state.processingStats.totalChunks) * 100} 
            className="w-full"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-gray-500" />
              <span>总块数: {state.processingStats.totalChunks}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>成功: {state.processingStats.successChunks}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              <span>失败: {state.processingStats.failedChunks}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-500" />
              <span>耗时: {state.processingStats.processingTime}ms</span>
            </div>
          </div>
        </div>
      )}

      {/* 处理完成后的统计信息 */}
      {!state.isLoading && state.processingStats && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800">并行翻译完成</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-green-700">
            <span>总块数: {state.processingStats.totalChunks}</span>
            <span>成功: {state.processingStats.successChunks}</span>
            <span>失败: {state.processingStats.failedChunks}</span>
            <span>耗时: {state.processingStats.processingTime}ms</span>
          </div>
          
          {/* 详细块信息 */}
          {state.processingStats.chunkResults.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium text-green-800">
                查看详细处理信息
              </summary>
              <div className="mt-2 space-y-1 text-xs">
                {state.processingStats.chunkResults.map((chunk) => (
                  <div key={chunk.index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="flex items-center gap-2">
                      {chunk.status === 'success' ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      块 {chunk.index}
                    </span>
                    <span>{chunk.originalLength} → {chunk.translatedLength} 字符</span>
                    <span>{chunk.attempts} 次尝试</span>
                    {chunk.error && (
                      <span className="text-red-500 text-xs">{chunk.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* 错误显示 */}
      {state.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* 积分和限制信息 */}
      <div className="space-y-4">
        <ConditionalRender condition={!user}>
          <FreeQuotaProgress 
            used={limitStatus.used} 
            limit={limitStatus.limit} 
            resetTime={limitStatus.resetTime}
          />
        </ConditionalRender>

        <ConditionalRender condition={!!user}>
          <CreditEstimate 
            characterCount={characterCount}
            estimatedCredits={estimatedCredits}
            currentCredits={credits}
          />
        </ConditionalRender>
      </div>

      {/* 翻译按钮 */}
      <div className="flex justify-center">
        <Button
          onClick={handleTranslate}
          disabled={state.isLoading || !state.sourceText.trim() || (!user && !canTranslate)}
          size="lg"
          className="min-w-[200px]"
        >
          {state.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {shouldUseParallel ? t('parallelTranslating') : t('translating')}
            </>
          ) : (
            <>
              {shouldUseParallel ? (
                <Zap className="mr-2 h-4 w-4" />
              ) : (
                <Volume2 className="mr-2 h-4 w-4" />
              )}
              {shouldUseParallel ? t('parallelTranslate') : t('translate')}
            </>
          )}
        </Button>
      </div>

      {/* 双向导航 */}
      <BidirectionalNavigation 
        currentSourceLang={state.sourceLanguage}
        currentTargetLang={state.targetLanguage}
      />
    </div>
  )
}
