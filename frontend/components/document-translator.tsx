'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Download,
  Coins,
  Clock,
  Shield,
  Languages
} from 'lucide-react'
import { useAuth, useCredits } from '@/lib/hooks/useAuth'
import { ConditionalRender } from '@/components/auth/auth-guard'
import { CreditEstimate, FreeQuotaProgress } from '@/components/credits/credit-balance'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/hooks/use-toast'
import { useTranslations } from 'next-intl'

interface DocumentTranslatorProps {
  className?: string
}

// 支持的小语种列表（与文本翻译保持一致）
const SUPPORTED_SOURCE_LANGUAGES = [
  { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano (Italian)', flag: '🇮🇹' },
  { code: 'pt', name: 'Português (Portuguese)', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский (Russian)', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'th', name: 'ไทย (Thai)', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt (Vietnamese)', flag: '🇻🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu (Malay)', flag: '🇲🇾' },
  { code: 'tl', name: 'Filipino (Tagalog)', flag: '🇵🇭' },
  { code: 'sw', name: 'Kiswahili (Swahili)', flag: '🇰🇪' },
  { code: 'am', name: 'አማርኛ (Amharic)', flag: '🇪🇹' },
  { code: 'my', name: 'မြန်မာ (Myanmar)', flag: '🇲🇲' },
  { code: 'km', name: 'ខ្មែរ (Khmer)', flag: '🇰🇭' },
  { code: 'lo', name: 'ລາວ (Lao)', flag: '🇱🇦' },
  { code: 'si', name: 'සිංහල (Sinhala)', flag: '🇱🇰' },
  { code: 'ne', name: 'नेपाली (Nepali)', flag: '🇳🇵' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇧🇩' },
  { code: 'ur', name: 'اردو (Urdu)', flag: '🇵🇰' },
]

// 目标语言固定为英文
const TARGET_LANGUAGE = { code: 'en', name: 'English', flag: '🇺🇸' }

interface UploadResult {
  fileId: string
  fileName: string
  fileSize: number
  extractedText: string
  characterCount: number
  creditCalculation: {
    total_characters: number
    free_characters: number
    billable_characters: number
    credits_required: number
  }
  userCredits: number
  hasEnoughCredits: boolean
  canProceed: boolean
}

interface TranslationResult {
  translationId: string
  status: 'processing' | 'completed' | 'failed'
  estimatedTime: number
  creditsConsumed: number
  downloadUrl?: string
}

export function DocumentTranslator({ className }: DocumentTranslatorProps) {
  const { user } = useAuth()
  const { credits, refreshCredits } = useCredits()
  const router = useRouter()
  const t = useTranslations('DocumentTranslator')

  // 语言选择状态（只需要选择源语言，目标语言固定为英文）
  const [sourceLanguage, setSourceLanguage] = useState<string>('zh')

  const [uploadState, setUploadState] = useState<{
    isUploading: boolean
    uploadResult: UploadResult | null
    error: string | null
  }>({
    isUploading: false,
    uploadResult: null,
    error: null
  })

  const [translationState, setTranslationState] = useState<{
    isTranslating: boolean
    result: TranslationResult | null
    progress: number
    error: string | null
  }>({
    isTranslating: false,
    result: null,
    progress: 0,
    error: null
  })

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!user) {
      toast({
        title: t('auth_required.title'),
        description: t('auth_required.description'),
        variant: "destructive",
      })
      router.push('/auth/signin?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    setUploadState({
      isUploading: true,
      uploadResult: null,
      error: null
    })

    try {
      const formData = new FormData()
      formData.append('file', file)

      // 获取认证token
      let headers: Record<string, string> = {}
      
      if (user) {
        try {
          const { createSupabaseBrowserClient } = await import('@/lib/supabase')
          const supabase = createSupabaseBrowserClient()
          const { data: { session } } = await supabase.auth.getSession()
          
          console.log('[Document Upload Auth]', {
            hasUser: !!user,
            hasSession: !!session,
            hasAccessToken: !!session?.access_token,
            tokenPreview: session?.access_token?.substring(0, 20) + '...'
          })
          
          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`
          } else {
            console.warn('No access token available for document upload')
          }
        } catch (error) {
          console.error('Failed to get auth token for document upload:', error)
        }
      }

      const response = await fetch('/api/document/upload', {
        method: 'POST',
        headers, // 添加认证头
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('upload.upload_failed'))
      }

      setUploadState({
        isUploading: false,
        uploadResult: data,
        error: null
      })

      toast({
        title: t('upload.upload_success'),
        description: t('upload.extracted_characters', { count: data.characterCount }),
      })

    } catch (error: any) {
      setUploadState({
        isUploading: false,
        uploadResult: null,
        error: error.message
      })

      toast({
        title: t('upload.upload_failed'),
        description: error.message,
        variant: "destructive",
      })
    }
  }, [user, router, t])

  const handleTranslate = useCallback(async (sourceLanguage: string, targetLanguage: string) => {
    if (!uploadState.uploadResult || !user) return

    const { fileId, characterCount, creditCalculation } = uploadState.uploadResult

    // 实时检查积分余额，不依赖上传时的数据
    console.log('[Document Translation] Real-time credit check', {
      characterCount,
      creditsRequired: creditCalculation.credits_required,
      currentCredits: credits
    })

    // 如果需要积分但积分不足
    if (creditCalculation.credits_required > 0 && credits < creditCalculation.credits_required) {
      console.log('[Document Translation] Insufficient credits', {
        required: creditCalculation.credits_required,
        available: credits
      })
      
      toast({
        title: t('analysis.insufficient_credits', { 
          required: creditCalculation.credits_required, 
          current: credits 
        }),
        description: t('analysis.recharge_now'),
        variant: "destructive",
      })
      router.push('/pricing')
      return
    }

    // 积分充足，继续翻译
    console.log('[Document Translation] Credits sufficient, proceeding with translation')

    setTranslationState({
      isTranslating: true,
      result: null,
      progress: 0,
      error: null
    })

    try {
      // 获取认证token
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (user) {
        try {
          const { createSupabaseBrowserClient } = await import('@/lib/supabase')
          const supabase = createSupabaseBrowserClient()
          const { data: { session } } = await supabase.auth.getSession()
          
          console.log('[Document Translation Auth]', {
            hasUser: !!user,
            hasSession: !!session,
            hasAccessToken: !!session?.access_token,
            tokenPreview: session?.access_token?.substring(0, 20) + '...'
          })
          
          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`
          } else {
            console.warn('No access token available for document translation')
          }
        } catch (error) {
          console.error('Failed to get auth token for document translation:', error)
        }
      }

      const response = await fetch('/api/document/translate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fileId,
          sourceLanguage,
          targetLanguage,
          characterCount
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('translation.translation_failed'))
      }

      console.log('[Document Translation] API Response:', data)
      console.log('[Document Translation] Extracted translatedText:', data.result?.translatedText || data.translatedText)

      // 翻译成功，立即设置为完成状态
      const translatedText = data.result?.translatedText || data.translatedText || ''
      console.log('[Document Translation] Final translatedText length:', translatedText.length)
      
      setTranslationState({
        isTranslating: false,
        result: {
          ...data,
          translatedText: translatedText
        },
        progress: 100,
        error: null
      })

      // 刷新积分余额
      await refreshCredits()

      toast({
        title: t('translation.completed'),
        description: t('translation.credits_consumed', { credits: data.creditsConsumed || 0 }),
      })

    } catch (error: any) {
      setTranslationState({
        isTranslating: false,
        result: null,
        progress: 0,
        error: error.message
      })

      toast({
        title: t('translation.translation_failed'),
        description: error.message,
        variant: "destructive",
      })
    }
  }, [uploadState.uploadResult, user, credits, router, refreshCredits, t])

  // 下载翻译结果
  const downloadTranslationResult = useCallback(() => {
    if (!(translationState.result as any)?.translatedText) return
    
    const { translatedText } = translationState.result as any
    const originalFileName = (uploadState.uploadResult as any)?.fileName || (uploadState.uploadResult as any)?.filename || 'document'
    const fileExtension = originalFileName.split('.').pop()?.toLowerCase() || 'txt'
    
    // 根据原文件类型决定下载格式
    let downloadExtension = 'txt' // 默认为txt
    let mimeType = 'text/plain;charset=utf-8'
    
    // 保持文本类型文件的原格式
    if (['txt', 'html', 'htm'].includes(fileExtension)) {
      downloadExtension = fileExtension
      if (fileExtension === 'html' || fileExtension === 'htm') {
        mimeType = 'text/html;charset=utf-8'
      }
    }
    // 其他格式（PDF, DOCX, PPTX）统一转为txt
    
    const downloadFileName = `${originalFileName.replace(/\.[^/.]+$/, '')}_translated.${downloadExtension}`
    
    console.log('[Download] Original file:', originalFileName)
    console.log('[Download] Original extension:', fileExtension)
    console.log('[Download] Download extension:', downloadExtension)
    console.log('[Download] Download filename:', downloadFileName)
    console.log('[Download] MIME type:', mimeType)
    
    // 创建下载链接
    const blob = new Blob([translatedText], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = downloadFileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast({
      title: t('translation.download_started'),
      description: t('translation.download_description', { filename: downloadFileName }),
    })
  }, [translationState.result, uploadState.uploadResult, t])

  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      uploadResult: null,
      error: null
    })
    setTranslationState({
      isTranslating: false,
      result: null,
      progress: 0,
      error: null
    })
  }, [])

  const maxSize = user?.role === 'free_user' ? '5MB' : '50MB'

  return (
    <div className={className}>
      {/* 未登录用户提示 */}
      <ConditionalRender when="unauthenticated">
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            {t('auth_required.description')}
            <Button variant="link" className="p-0 h-auto ml-2" asChild>
              <a href="/auth/signin">{t('auth_required.login_button')}</a>
            </Button>
          </AlertDescription>
        </Alert>
      </ConditionalRender>

      <ConditionalRender when="authenticated">
        <div className="space-y-6">
          {/* 文件上传区域 */}
          {!uploadState.uploadResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {t('upload.title')}
                </CardTitle>
                <CardDescription>
                  {t('upload.description', { maxSize })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".txt,.html,.pdf,.docx,.pptx"
                    onChange={handleFileUpload}
                    disabled={uploadState.isUploading}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <div className="rounded-full bg-blue-50 p-4">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">
                        {uploadState.isUploading ? t('upload.uploading') : t('upload.click_to_select')}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('upload.drag_drop')}
                      </p>
                    </div>
                  </label>
                </div>

                {uploadState.error && (
                  <Alert className="mt-4" variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{uploadState.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* 文件信息和积分预估 */}
          {uploadState.uploadResult && !translationState.result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('analysis.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t('analysis.filename')}</p>
                    <p className="font-medium">{uploadState.uploadResult.fileName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('analysis.filesize')}</p>
                    <p className="font-medium">
                      {(uploadState.uploadResult.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">{t('analysis.text_preview')}</p>
                  <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                    {uploadState.uploadResult.extractedText}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('analysis.character_count')}</span>
                    <Badge variant="outline">
                      {uploadState.uploadResult.characterCount.toLocaleString()} {t('analysis.characters')}
                    </Badge>
                  </div>

                  <FreeQuotaProgress currentLength={uploadState.uploadResult.characterCount} />

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('analysis.credit_consumption')}</span>
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        {uploadState.uploadResult.creditCalculation.credits_required} {t('analysis.credits')}
                      </span>
                      {uploadState.uploadResult.creditCalculation.credits_required === 0 && (
                        <Badge variant="secondary">{t('analysis.free')}</Badge>
                      )}
                    </div>
                  </div>

                  {!uploadState.uploadResult.hasEnoughCredits && uploadState.uploadResult.creditCalculation.credits_required > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {t('analysis.insufficient_credits', { 
                          required: uploadState.uploadResult.creditCalculation.credits_required,
                          current: uploadState.uploadResult.userCredits
                        })}
                        <Button variant="link" className="p-0 h-auto ml-2" asChild>
                          <a href="/pricing">{t('analysis.recharge_now')}</a>
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* 语言选择区域 */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Languages className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">{t('analysis.language_selection')}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        {t('analysis.source_language')}
                      </label>
                      <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('analysis.select_source_language')} />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_SOURCE_LANGUAGES.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              <div className="flex items-center gap-2">
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="text-center py-2">
                      <div className="flex items-center justify-center gap-3 text-lg">
                        <div className="flex items-center gap-2">
                          <span>{SUPPORTED_SOURCE_LANGUAGES.find(l => l.code === sourceLanguage)?.flag}</span>
                          <span className="text-sm font-medium">
                            {SUPPORTED_SOURCE_LANGUAGES.find(l => l.code === sourceLanguage)?.name}
                          </span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center gap-2">
                          <span>{TARGET_LANGUAGE.flag}</span>
                          <span className="text-sm font-medium">{TARGET_LANGUAGE.name}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('analysis.translate_to_english_only')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleTranslate(sourceLanguage, TARGET_LANGUAGE.code)}
                    disabled={!uploadState.uploadResult.canProceed}
                    className="flex-1"
                  >
                    {t('analysis.start_translation')}
                  </Button>
                  <Button variant="outline" onClick={resetUpload}>
                    {t('analysis.reupload')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 翻译进度 */}
          {(translationState.isTranslating || translationState.result) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('translation.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('translation.progress')}</span>
                    <span>{translationState.progress}%</span>
                  </div>
                  <Progress value={translationState.progress} />
                </div>

                {translationState.isTranslating && (
                  <div className="text-center text-sm text-gray-600">
                    {t('translation.processing')}
                  </div>
                )}

                {!translationState.isTranslating && translationState.progress === 100 && (
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-4">{t('translation.completed')}</p>
                    
                    {/* 显示翻译结果预览 */}
                    {(translationState.result as any)?.translatedText && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg text-left max-h-40 overflow-y-auto">
                        <p className="text-sm text-gray-600 mb-2">{t('translation.result_preview')}:</p>
                        <p className="text-sm">{(translationState.result as any).translatedText.substring(0, 200)}...</p>
                      </div>
                    )}
                    
                    <Button 
                      onClick={downloadTranslationResult} 
                      disabled={!(translationState.result as any)?.translatedText}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t('translation.download_result')}
                    </Button>
                  </div>
                )}

                {translationState.error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{translationState.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </ConditionalRender>
    </div>
  )
}
