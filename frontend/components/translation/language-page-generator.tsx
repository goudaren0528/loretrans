'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowRightLeft, 
  Copy, 
  Volume2, 
  Loader2, 
  CheckCircle,
  Globe,
  Users,
  Star,
  Zap
} from 'lucide-react'
import { getFreeCharacterLimit, getCreditRatePerCharacter } from '@/lib/config'
import type { Language } from '../../../config/app.config'

interface LanguagePageGeneratorProps {
  sourceLanguage: Language
  targetLanguage: Language
  examples?: Array<{
    source: string
    target: string
    context?: string
  }>
}

export function LanguagePageGenerator({ 
  sourceLanguage, 
  targetLanguage, 
  examples = [] 
}: LanguagePageGeneratorProps) {
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  // 获取配置
  const freeCharLimit = getFreeCharacterLimit()
  const creditRate = getCreditRatePerCharacter()

  const handleTranslate = async () => {
    if (!sourceText.trim()) return

    setIsTranslating(true)
    setError(null)

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLanguage: sourceLanguage.code,
          targetLanguage: targetLanguage.code,
        }),
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const data = await response.json()
      setTranslatedText(data.translatedText)
    } catch (err) {
      setError('翻译失败，请稍后重试')
      console.error('Translation error:', err)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleCopy = async () => {
    if (!translatedText) return

    try {
      await navigator.clipboard.writeText(translatedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const handleTTS = async () => {
    if (!translatedText) return

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: translatedText,
          language: targetLanguage.code,
        }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play()
      }
    } catch (err) {
      console.error('TTS failed:', err)
    }
  }

  const characterCount = sourceText.length
  const isOverFreeLimit = characterCount > 1000

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {sourceLanguage.name} 到 {targetLanguage.name} 翻译器
            </h1>
            <p className="text-gray-600 mt-2">
              使用先进的AI技术翻译 {sourceLanguage.nativeName} 文本
            </p>
          </div>
        </div>

        {/* 语言信息 */}
        <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>{sourceLanguage.region || 'Global'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{sourceLanguage.speakers || 'N/A'} 使用者</span>
          </div>
          {sourceLanguage.priority === 1 && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>核心支持语言</span>
            </div>
          )}
        </div>
      </div>

      {/* 翻译界面 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              {sourceLanguage.name}
            </CardTitle>
            <CardDescription>
              输入您要翻译的 {sourceLanguage.nativeName} 文本
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder={`输入 ${sourceLanguage.nativeName} 文本...`}
              className="min-h-[200px] resize-none"
              maxLength={10000}
            />
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`${isOverFreeLimit ? 'text-orange-600' : 'text-gray-600'}`}>
                  {characterCount}/10,000 字符
                </span>
                {isOverFreeLimit && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    需要积分
                  </Badge>
                )}
              </div>
              
              {characterCount > freeCharLimit && (
                <div className="text-xs text-gray-500">
                  超出部分: {Math.ceil((characterCount - freeCharLimit) * creditRate)} 积分
                </div>
              )}
            </div>

            <Button 
              onClick={handleTranslate}
              disabled={!sourceText.trim() || isTranslating}
              className="w-full"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  翻译中...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  翻译
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 输出区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              {targetLanguage.name}
            </CardTitle>
            <CardDescription>
              翻译结果将显示在这里
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="min-h-[200px] p-4 bg-gray-50 rounded-lg border">
              {translatedText ? (
                <p className="text-gray-900 leading-relaxed">{translatedText}</p>
              ) : (
                <p className="text-gray-500 italic">翻译结果将显示在这里...</p>
              )}
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopy}
                disabled={!translatedText}
                className="flex-1"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    复制
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleTTS}
                disabled={!translatedText}
                className="flex-1"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                朗读
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 示例翻译 */}
      {examples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>翻译示例</CardTitle>
            <CardDescription>
              常见的 {sourceLanguage.name} 到 {targetLanguage.name} 翻译示例
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examples.map((example, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="text-sm font-medium text-gray-900">
                    {example.source}
                  </div>
                  <ArrowRightLeft className="w-4 h-4 text-gray-400 mx-auto" />
                  <div className="text-sm text-gray-600">
                    {example.target}
                  </div>
                  {example.context && (
                    <div className="text-xs text-gray-500 italic">
                      {example.context}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSourceText(example.source)}
                    className="w-full mt-2"
                  >
                    使用此示例
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 功能特色 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="p-6">
            <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">即时翻译</h3>
            <p className="text-sm text-gray-600">
              基于先进AI技术的快速翻译服务
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <Star className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">高质量翻译</h3>
            <p className="text-sm text-gray-600">
              专门针对小语种优化的翻译模型
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <Globe className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">双向支持</h3>
            <p className="text-sm text-gray-600">
              支持 {sourceLanguage.name} 和 {targetLanguage.name} 双向翻译
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
