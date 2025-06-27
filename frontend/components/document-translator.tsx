'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Download,
  Coins,
  Clock,
  Shield
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

      const response = await fetch('/api/document/upload', {
        method: 'POST',
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

    if (!uploadState.uploadResult.canProceed) {
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

    setTranslationState({
      isTranslating: true,
      result: null,
      progress: 0,
      error: null
    })

    try {
      const response = await fetch('/api/document/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      setTranslationState({
        isTranslating: true,
        result: data,
        progress: 10,
        error: null
      })

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setTranslationState(prev => {
          if (prev.progress >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return {
            ...prev,
            progress: prev.progress + 10
          }
        })
      }, 1000)

      // 刷新积分余额
      await refreshCredits()

      toast({
        title: t('translation.translation_started'),
        description: t('translation.credits_consumed', { credits: data.creditsConsumed }),
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
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
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

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleTranslate('auto', 'en')}
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
          {translationState.result && (
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

                <div className="text-center text-sm text-gray-600">
                  {t('translation.estimated_time', { 
                    seconds: Math.max(0, translationState.result.estimatedTime - Math.floor(translationState.progress / 10))
                  })}
                </div>

                {translationState.result.status === 'completed' && (
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-4">{t('translation.completed')}</p>
                    <Button asChild>
                      <a href={translationState.result.downloadUrl} download>
                        <Download className="h-4 w-4 mr-2" />
                        {t('translation.download_result')}
                      </a>
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
