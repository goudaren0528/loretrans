'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, X, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_CONFIG } from '../config/app.config'

interface LanguageDetectionResult {
  language: string
  confidence: number
  languageName: string
  nativeName: string
}

interface LanguageDetectionProps {
  text: string
  onLanguageDetected: (language: string) => void
  onDetectionToggle?: (enabled: boolean) => void
  autoDetect?: boolean
  disabled?: boolean
  className?: string
  showConfidence?: boolean
  minConfidence?: number
}

export function LanguageDetection({
  text,
  onLanguageDetected,
  onDetectionToggle,
  autoDetect = true,
  disabled = false,
  className,
  showConfidence = true,
  minConfidence = 0.7
}: LanguageDetectionProps) {
  const [isDetecting, setIsDetecting] = React.useState(false)
  const [detectionResult, setDetectionResult] = React.useState<LanguageDetectionResult | null>(null)
  const [detectionError, setDetectionError] = React.useState<string | null>(null)
  const [isEnabled, setIsEnabled] = React.useState(autoDetect)

  // 检测语言的API调用
  const detectLanguage = React.useCallback(async (inputText: string) => {
    if (!inputText.trim() || inputText.length < 3) {
      setDetectionResult(null)
      setDetectionError(null)
      return
    }

    setIsDetecting(true)
    setDetectionError(null)

    try {
      const response = await fetch('/api/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      })

      if (!response.ok) {
        throw new Error(`Detection failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // 获取语言信息
      const languageInfo = APP_CONFIG.languages.supported.find(
        lang => lang.code === data.detectedLanguage
      )

      const result: LanguageDetectionResult = {
        language: data.detectedLanguage,
        confidence: data.confidence || 0.9,
        languageName: languageInfo?.name || data.detectedLanguage,
        nativeName: languageInfo?.nativeName || data.detectedLanguage,
      }

      setDetectionResult(result)

      // 如果置信度足够高，自动应用检测结果
      if (result.confidence >= minConfidence) {
        onLanguageDetected(result.language)
      }

    } catch (error) {
      console.error('Language detection error:', error)
      setDetectionError(error instanceof Error ? error.message : 'Detection failed')
      setDetectionResult(null)
    } finally {
      setIsDetecting(false)
    }
  }, [onLanguageDetected, minConfidence])

  // 当文本改变时自动检测（如果启用）
  React.useEffect(() => {
    if (isEnabled && !disabled && text.trim().length >= 3) {
      const timeoutId = setTimeout(() => {
        detectLanguage(text)
      }, 500) // 防抖：用户停止输入500ms后再检测

      return () => clearTimeout(timeoutId)
    } else {
      setDetectionResult(null)
      setDetectionError(null)
    }
  }, [text, isEnabled, disabled, detectLanguage])

  // 手动应用检测结果
  const handleApplyDetection = () => {
    if (detectionResult) {
      onLanguageDetected(detectionResult.language)
    }
  }

  // 忽略检测结果
  const handleIgnoreDetection = () => {
    setDetectionResult(null)
    setDetectionError(null)
  }

  // 切换自动检测开关
  const handleToggleDetection = () => {
    const newEnabled = !isEnabled
    setIsEnabled(newEnabled)
    if (onDetectionToggle) {
      onDetectionToggle(newEnabled)
    }
    if (!newEnabled) {
      setDetectionResult(null)
      setDetectionError(null)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* 控制开关 */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleDetection}
          disabled={disabled}
          className={cn(
            "text-xs gap-1.5 h-7 px-2",
            isEnabled ? "text-blue-600 bg-blue-50" : "text-gray-500"
          )}
        >
          {isEnabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          <span>Auto-detect</span>
        </Button>

        {isDetecting && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Detecting...</span>
          </div>
        )}
      </div>

      {/* 检测结果显示 */}
      {detectionResult && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-700">
                Detected language:
              </span>
              <Badge variant="secondary" className="text-xs">
                {detectionResult.nativeName}
              </Badge>
              {showConfidence && (
                <span className="text-xs text-blue-600">
                  ({Math.round(detectionResult.confidence * 100)}% confidence)
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1 ml-4">
              {detectionResult.confidence < minConfidence && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleApplyDetection}
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Apply
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleIgnoreDetection}
                className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 错误显示 */}
      {detectionError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Language detection failed: {detectionError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Hook for language detection utilities
export function useLanguageDetection() {
  const [isDetectionEnabled, setIsDetectionEnabled] = React.useState(true)
  const [lastDetectedLanguage, setLastDetectedLanguage] = React.useState<string | null>(null)

  const detectLanguageFromText = React.useCallback(async (text: string) => {
    if (!text.trim() || text.length < 3) {
      return null
    }

    try {
      const response = await fetch('/api/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`Detection failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setLastDetectedLanguage(data.detectedLanguage)
      return {
        language: data.detectedLanguage,
        confidence: data.confidence || 0.9,
      }

    } catch (error) {
      console.error('Language detection error:', error)
      return null
    }
  }, [])

  return {
    isDetectionEnabled,
    setIsDetectionEnabled,
    lastDetectedLanguage,
    detectLanguageFromText
  }
} 