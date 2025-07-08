'use client'

import React from 'react'
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button'
import { ArrowLeftRight, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageSwitchProps {
  sourceLanguage: string
  targetLanguage: string
  sourceText: string
  targetText: string
  onSwitch: (newSourceLang: string, newTargetLang: string, newSourceText: string) => void
  disabled?: boolean
  className?: string
  showResetButton?: boolean
  onReset?: () => void
}

export function LanguageSwitch({
  sourceLanguage,
  targetLanguage,
  sourceText,
  targetText,
  onSwitch,
  disabled = false,
  className,
  showResetButton = false,
  onReset
}: LanguageSwitchProps) {
  
  const handleSwitch = () => {
    if (disabled) return
    
    // 交换语言和文本内容
    onSwitch(targetLanguage, sourceLanguage, targetText)
  }

  const handleReset = () => {
    if (onReset) {
      onReset()
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* 语言切换按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSwitch}
        disabled={disabled}
        className={cn(
          "relative group transition-all duration-200",
          "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        )}
        aria-label="t('Common.switch_source_target')"
        title="t('Common.switch_languages') (source ↔ target)"
      >
        <ArrowLeftRight 
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            "group-hover:scale-110 group-active:scale-95",
            disabled ? "text-gray-400" : "text-gray-600"
          )} 
        />
        <span className="sr-only">t('Common.switch_languages')</span>
      </Button>

      {/* 重置按钮（可选） */}
      {showResetButton && onReset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={disabled}
          className={cn(
            "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          aria-label="t('Common.reset_translation')"
          title="t('Common.clear_reset')"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only">Reset</span>
        </Button>
      )}
    </div>
  )
}

// Hook for managing language switch state
export function useLanguageSwitch(
  initialSourceLang: string,
  initialTargetLang: string,
  initialSourceText: string = '',
  initialTargetText: string = ''
) {
  const [sourceLanguage, setSourceLanguage] = React.useState(initialSourceLang)
  const [targetLanguage, setTargetLanguage] = React.useState(initialTargetLang)
  const [sourceText, setSourceText] = React.useState(initialSourceText)
  const [targetText, setTargetText] = React.useState(initialTargetText)

  const switchLanguages = React.useCallback((
    newSourceLang: string,
    newTargetLang: string,
    newSourceText: string
  ) => {
    setSourceLanguage(newSourceLang)
    setTargetLanguage(newTargetLang)
    setSourceText(newSourceText)
    setTargetText('') // 清空目标文本，等待新的翻译
  }, [])

  const resetAll = React.useCallback(() => {
    setSourceText('')
    setTargetText('')
    // 保持语言设置不变
  }, [])

  const updateSourceText = React.useCallback((text: string) => {
    setSourceText(text)
  }, [])

  const updateTargetText = React.useCallback((text: string) => {
    setTargetText(text)
  }, [])

  return {
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
  }
} 