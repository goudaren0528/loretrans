'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Copy, Volume2, Loader2, AlertCircle } from 'lucide-react'
import { cn, copyToClipboard, getCharacterCount } from '@/lib/utils'
import { APP_CONFIG } from '../../config/app.config'
import { LanguageSwitch, useLanguageSwitch } from './language-switch'
import { LanguageDetection } from './language-detection'
import { BidirectionalNavigation } from './bidirectional-navigation'

interface BidirectionalTranslatorProps {
  defaultSourceLang?: string
  defaultTargetLang?: string
  placeholder?: string
  showNavigation?: boolean
  showLanguageDetection?: boolean
  enableBidirectionalMode?: boolean
  className?: string
}

export function BidirectionalTranslator({
  defaultSourceLang = 'ht',
  defaultTargetLang = 'en',
  placeholder = 'Type your text here...',
  showNavigation = true,
  showLanguageDetection = true,
  enableBidirectionalMode = true,
  className
}: BidirectionalTranslatorProps) {
  
  // 使用自定义Hook管理语言切换状态
  const {
    sourceLanguage,
    targetLanguage,
    sourceText,
    targetText,
    switchLanguages,
    resetAll,
    updateSourceText,
    updateTargetText,
    setSourceLanguage,
    setTargetLanguage
  } = useLanguageSwitch(defaultSourceLang, defaultTargetLang)

  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [translationMode, setTranslationMode] = React.useState<'single' | 'bidirectional'>('single')

  const maxLength = APP_CONFIG.nllb.maxLength
  const characterCount = getCharacterCount(sourceText)
  const isOverLimit = characterCount > maxLength

  // 执行翻译
  const handleTranslate = React.useCallback(async () => {
    if (!sourceText.trim() || isOverLimit) return

    setIsLoading(true)
    setError(null)

    try {
      const requestBody = {
        text: sourceText,
        sourceLanguage,
        targetLanguage,
        mode: enableBidirectionalMode ? translationMode : 'single',
        options: {
          enableCache: true,
          enableFallback: true,
          priority: 'quality' as const
        }
      }

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Translation failed')
      }

      if (translationMode === 'bidirectional' && data.data.mode === 'bidirectional') {
        // 双向翻译结果
        updateTargetText(data.data.forward.translatedText)
      } else {
        // 单向翻译结果
        updateTargetText(data.data.translatedText)
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Translation failed')
    } finally {
      setIsLoading(false)
    }
  }, [sourceText, sourceLanguage, targetLanguage, isOverLimit, translationMode, enableBidirectionalMode, updateTargetText])

  // 处理语言检测结果
  const handleLanguageDetected = React.useCallback((detectedLanguage: string) => {
    setSourceLanguage(detectedLanguage)
  }, [setSourceLanguage])

  // 复制文本
  const handleCopy = React.useCallback(async (text: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      console.log('Copied to clipboard')
    }
  }, [])

  // 语音播放
  const handleSpeak = React.useCallback(async (text: string, language: string) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language }),
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

  // 获取目标语言选项
  const getTargetLanguageOptions = () => {
    if (sourceLanguage === 'en') {
      // 英文到小语种
      return APP_CONFIG.languages.supported
    } else {
      // 小语种到英文和其他小语种（支持双向翻译）
      return [APP_CONFIG.languages.target, ...APP_CONFIG.languages.supported.filter(lang => lang.code !== sourceLanguage)]
    }
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      {/* 双向翻译导航 */}
      {showNavigation && (
        <BidirectionalNavigation
          currentSourceLang={sourceLanguage}
          currentTargetLang={targetLanguage}
        />
      )}

      <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
        <div className="p-6">
          {/* 语言选择器和切换 */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="source-language" className="text-sm font-medium">
                From
              </Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
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
                  {APP_CONFIG.languages.supported.map((lang) => (
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

            {/* 语言切换按钮 */}
            <LanguageSwitch
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
              sourceText={sourceText}
              targetText={targetText}
              onSwitch={switchLanguages}
              disabled={isLoading}
              className="mt-6"
              showResetButton
              onReset={resetAll}
            />

            <div className="flex-1">
              <Label htmlFor="target-language" className="text-sm font-medium">
                To
              </Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {getTargetLanguageOptions().map((lang) => (
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

          {/* 语言检测 */}
          {showLanguageDetection && (
            <div className="mb-4">
              <LanguageDetection
                text={sourceText}
                onLanguageDetected={handleLanguageDetected}
                disabled={isLoading}
              />
            </div>
          )}

          {/* 翻译模式选择 */}
          {enableBidirectionalMode && (
            <div className="mb-4 flex items-center gap-4">
              <Label className="text-sm font-medium">Translation Mode:</Label>
              <div className="flex gap-2">
                <Button
                  variant={translationMode === 'single' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTranslationMode('single')}
                >
                  Single
                </Button>
                <Button
                  variant={translationMode === 'bidirectional' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTranslationMode('bidirectional')}
                >
                  Bidirectional
                </Button>
              </div>
            </div>
          )}

          {/* 翻译界面 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 源文本输入 */}
            <div className="space-y-2">
              <Label htmlFor="source-text">Enter text to translate</Label>
              <div className="relative">
                <Textarea
                  id="source-text"
                  placeholder={placeholder}
                  className="min-h-[120px] resize-y"
                  value={sourceText}
                  onChange={(e) => updateSourceText(e.target.value)}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  {sourceText && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSpeak(sourceText, sourceLanguage)}
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
              </div>
            </div>

            {/* 翻译结果 */}
            <div className="space-y-2">
              <Label>Translation</Label>
              <div className="relative">
                <Textarea
                  className="min-h-[120px] resize-y bg-muted/50"
                  value={targetText}
                  readOnly
                  placeholder="Translation will appear here..."
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  {targetText && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(targetText)}
                        className="h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSpeak(targetText, targetLanguage)}
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

          {/* 错误显示 */}
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* 翻译按钮 */}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleTranslate}
              disabled={!sourceText.trim() || isOverLimit || isLoading}
              size="lg"
              className="min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                'Translate'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 