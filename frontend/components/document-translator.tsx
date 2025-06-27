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
        title: "需要登录",
        description: "文档翻译功能需要登录账户",
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
        throw new Error(data.error || '文件上传失败')
      }

      setUploadState({
        isUploading: false,
        uploadResult: data,
        error: null
      })

      toast({
        title: "文件上传成功",
        description: `提取了 ${data.characterCount} 个字符`,
      })

    } catch (error: any) {
      setUploadState({
        isUploading: false,
        uploadResult: null,
        error: error.message
      })

      toast({
        title: "上传失败",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [user, router])

  const handleTranslate = useCallback(async (sourceLanguage: string, targetLanguage: string) => {
    if (!uploadState.uploadResult || !user) return

    const { fileId, characterCount, creditCalculation } = uploadState.uploadResult

    if (!uploadState.uploadResult.canProceed) {
      toast({
        title: "积分不足",
        description: `需要 ${creditCalculation.credits_required} 积分，当前余额 ${credits} 积分`,
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
        throw new Error(data.error || '翻译失败')
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
        title: "翻译开始",
        description: `消耗了 ${data.creditsConsumed} 积分`,
      })

    } catch (error: any) {
      setTranslationState({
        isTranslating: false,
        result: null,
        progress: 0,
        error: error.message
      })

      toast({
        title: "翻译失败",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [uploadState.uploadResult, user, credits, router, refreshCredits])

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

  return (
    <div className={className}>
      {/* 未登录用户提示 */}
      <ConditionalRender when="unauthenticated">
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            文档翻译功能需要登录账户。
            <Button variant="link" className="p-0 h-auto ml-2" asChild>
              <a href="/auth/signin">立即登录</a>
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
                  上传文档
                </CardTitle>
                <CardDescription>
                  支持 PDF、Word、PowerPoint 和文本文件，最大 {user?.role === 'free_user' ? '5MB' : '50MB'}
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
                        {uploadState.isUploading ? '上传中...' : '点击选择文件'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        或拖拽文件到此处
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
                  文件分析结果
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">文件名</p>
                    <p className="font-medium">{uploadState.uploadResult.fileName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">文件大小</p>
                    <p className="font-medium">
                      {(uploadState.uploadResult.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">提取的文本预览</p>
                  <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                    {uploadState.uploadResult.extractedText}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">字符数统计</span>
                    <Badge variant="outline">
                      {uploadState.uploadResult.characterCount.toLocaleString()} 字符
                    </Badge>
                  </div>

                  <FreeQuotaProgress currentLength={uploadState.uploadResult.characterCount} />

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">积分消耗</span>
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        {uploadState.uploadResult.creditCalculation.credits_required} 积分
                      </span>
                      {uploadState.uploadResult.creditCalculation.credits_required === 0 && (
                        <Badge variant="secondary">免费</Badge>
                      )}
                    </div>
                  </div>

                  {!uploadState.uploadResult.hasEnoughCredits && uploadState.uploadResult.creditCalculation.credits_required > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        积分不足！需要 {uploadState.uploadResult.creditCalculation.credits_required} 积分，
                        当前余额 {uploadState.uploadResult.userCredits} 积分。
                        <Button variant="link" className="p-0 h-auto ml-2" asChild>
                          <a href="/pricing">立即充值</a>
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
                    开始翻译
                  </Button>
                  <Button variant="outline" onClick={resetUpload}>
                    重新上传
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
                  翻译进度
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>处理进度</span>
                    <span>{translationState.progress}%</span>
                  </div>
                  <Progress value={translationState.progress} />
                </div>

                <div className="text-center text-sm text-gray-600">
                  预计还需 {Math.max(0, translationState.result.estimatedTime - Math.floor(translationState.progress / 10))} 秒
                </div>

                {translationState.result.status === 'completed' && (
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-4">翻译完成！</p>
                    <Button asChild>
                      <a href={translationState.result.downloadUrl} download>
                        <Download className="h-4 w-4 mr-2" />
                        下载翻译结果
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
