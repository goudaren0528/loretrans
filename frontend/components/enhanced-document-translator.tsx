'use client'

import React, { useState, useCallback, useEffect } from 'react'
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
  Languages,
  Loader2
} from 'lucide-react'
import { useAuth, useCredits } from '@/lib/hooks/useAuth'
import { ConditionalRender } from '@/components/auth/auth-guard'
import { CreditEstimate, FreeQuotaProgress } from '@/components/credits/credit-balance'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/hooks/use-toast'
import { useTranslations } from 'next-intl'

interface EnhancedDocumentTranslatorProps {
  className?: string
}

// 支持的小语种列表
const SUPPORTED_SOURCE_LANGUAGES = [
  { code: 'am', name: 'አማርኛ (Amharic)', flag: '🇪🇹' },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' },
  { code: 'my', name: 'မြန်မာ (Burmese)', flag: '🇲🇲' },
  { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
  { code: 'ht', name: 'Kreyòl Ayisyen (Haitian Creole)', flag: '🇭🇹' },
  { code: 'ha', name: 'Hausa (Hausa)', flag: '🇳🇬' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'ig', name: 'Igbo (Igbo)', flag: '🇳🇬' },
  { code: 'km', name: 'ខ្មែរ (Khmer)', flag: '🇰🇭' },
  { code: 'ky', name: 'Кыргызча (Kyrgyz)', flag: '🇰🇬' },
  { code: 'lo', name: 'ລາວ (Lao)', flag: '🇱🇦' },
  { code: 'mg', name: 'Malagasy (Malagasy)', flag: '🇲🇬' },
  { code: 'mn', name: 'Монгол (Mongolian)', flag: '🇲🇳' },
  { code: 'ne', name: 'नेपाली (Nepali)', flag: '🇳🇵' },
  { code: 'ps', name: 'پښتو (Pashto)', flag: '🇦🇫' },
  { code: 'pt', name: 'Português (Portuguese)', flag: '🇵🇹' },
  { code: 'sd', name: 'سنڌي (Sindhi)', flag: '🇵🇰' },
  { code: 'si', name: 'සිංහල (Sinhala)', flag: '🇱🇰' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'sw', name: 'Kiswahili (Swahili)', flag: '🇹🇿' },
  { code: 'tg', name: 'Тоҷикӣ (Tajik)', flag: '🇹🇯' },
  { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: 'xh', name: 'isiXhosa (Xhosa)', flag: '🇿🇦' },
  { code: 'yo', name: 'Yorùbá (Yoruba)', flag: '🇳🇬' },
  { code: 'zu', name: 'isiZulu (Zulu)', flag: '🇿🇦' },
]

const TARGET_LANGUAGE = { code: 'en', name: 'English', flag: '🇺🇸' }

interface UploadState {
  isUploading: boolean
  uploadResult: any | null
  error: string | null
}

interface TranslationState {
  isTranslating: boolean
  result: any | null
  progress: number
  error: string | null
  jobId?: string
  isAsync?: boolean
  estimatedTime?: number
}

export function EnhancedDocumentTranslator({ className }: EnhancedDocumentTranslatorProps) {
  const { user } = useAuth()
  const { credits, loading: creditsLoading, refreshCredits } = useCredits()
  const router = useRouter()
  const t = useTranslations('document')
  
  const [localCredits, setLocalCredits] = useState<number>(credits || 0)
  const [sourceLanguage, setSourceLanguage] = useState<string>('')
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    uploadResult: null,
    error: null
  })
  const [translationState, setTranslationState] = useState<TranslationState>({
    isTranslating: false,
    result: null,
    progress: 0,
    error: null
  })

  // 同步积分状态
  useEffect(() => {
    if (credits !== null && credits !== undefined) {
      setLocalCredits(credits)
    }
  }, [credits])

  // 文件上传处理
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 重置状态
    setUploadState({
      isUploading: true,
      uploadResult: null,
      error: null
    })
    setTranslationState({
      isTranslating: false,
      result: null,
      progress: 0,
      error: null
    })

    try {
      const formData = new FormData()
      formData.append('file', file)

      // 获取认证头
      let headers: Record<string, string> = {}
      
      if (user) {
        try {
          const { createSupabaseBrowserClient } = await import('@/lib/supabase')
          const supabase = createSupabaseBrowserClient()
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`
          }
        } catch (error) {
          console.error('[Document Upload] 获取认证token失败:', error)
          toast({
            title: '认证失败',
            description: '请重新登录后再试',
            variant: "destructive",
          })
          router.push('/auth/signin?redirect=' + encodeURIComponent(window.location.pathname))
          return
        }
      } else {
        toast({
          title: t('auth_required.title'),
          description: t('auth_required.description'),
          variant: "destructive",
        })
        router.push('/auth/signin?redirect=' + encodeURIComponent(window.location.pathname))
        return
      }

      const response = await fetch('/api/document/upload', {
        method: 'POST',
        headers,
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

  // 翻译处理 - 支持异步任务
  const handleTranslate = useCallback(async (sourceLanguage: string, targetLanguage: string) => {
    if (!uploadState.uploadResult || !user) return

    // 等待积分加载完成
    if (creditsLoading) {
      toast({
        title: '正在加载积分信息...',
        description: '请稍候',
        variant: "default",
      })
      return
    }

    // 刷新积分状态
    const updatedCredits = await refreshCredits()
    if (typeof updatedCredits === 'number') {
      setLocalCredits(updatedCredits)
    }

    const { fileId, characterCount, creditCalculation } = uploadState.uploadResult

    // 检查积分余额
    if (creditCalculation.credits_required > 0 && localCredits < creditCalculation.credits_required) {
      toast({
        title: t('analysis.insufficient_credits', { 
          required: creditCalculation.credits_required, 
          current: localCredits 
        }),
        description: t('analysis.recharge_now'),
        variant: "destructive",
      })
      router.push('/pricing')
      return
    }

    // 开始翻译
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
          
          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`
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

      console.log('[Enhanced Document Translation] API Response:', data)

      // 检查是否是异步任务
      if (data.isAsync && data.jobId) {
        console.log('[Enhanced Document Translation] Async task created:', data.jobId)
        
        // 更新状态为异步任务
        setTranslationState({
          isTranslating: true,
          result: null,
          progress: 5,
          error: null,
          jobId: data.jobId,
          isAsync: true,
          estimatedTime: data.estimatedTime
        })
        
        // 显示异步任务信息
        toast({
          title: '大文档翻译任务已创建',
          description: `正在后台处理，预计需要 ${data.estimatedTime} 秒`,
          variant: "default",
        })

        // 开始监控异步任务
        await monitorAsyncTranslation(data.jobId, headers)
        
      } else {
        // 同步任务 - 立即处理结果
        console.log('[Enhanced Document Translation] Sync task completed')
        
        const translatedText = data.result?.translatedText || data.translatedText || ''
        
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
        const updatedCredits = await refreshCredits()
        if (typeof updatedCredits === 'number') {
          setLocalCredits(updatedCredits)
        }

        toast({
          title: t('translation.translation_success'),
          description: t('translation.translation_completed'),
        })
      }

    } catch (error: any) {
      console.error('[Enhanced Document Translation] Translation failed:', error)
      
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
  }, [uploadState.uploadResult, user, creditsLoading, localCredits, refreshCredits, t, router])

  // 监控异步翻译任务
  const monitorAsyncTranslation = useCallback(async (jobId: string, headers: Record<string, string>) => {
    console.log('[Enhanced Document Translation] Starting async task monitoring:', jobId)
    
    let pollCount = 0
    const maxPolls = 60 // 最多轮询60次（2分钟）
    const pollInterval = 2000 // 2秒轮询一次
    
    const pollStatus = async (): Promise<boolean> => {
      try {
        pollCount++
        console.log(`[Enhanced Document Translation] Polling status (${pollCount}/${maxPolls}):`, jobId)
        
        const response = await fetch(`/api/document/translate/status?jobId=${jobId}`, {
          method: 'GET',
          headers
        })
        
        const statusData = await response.json()
        
        if (!response.ok) {
          if (statusData.code === 'JOB_NOT_FOUND') {
            throw new Error('任务不存在或已过期，请重新提交翻译请求')
          }
          throw new Error(statusData.error || '查询任务状态失败')
        }
        
        const job = statusData.job
        console.log(`[Enhanced Document Translation] Task status:`, {
          status: job.status,
          progress: job.progress,
          hasResult: !!job.result
        })
        
        // 更新进度
        setTranslationState(prev => ({
          ...prev,
          progress: job.progress
        }))
        
        if (job.status === 'completed') {
          console.log('[Enhanced Document Translation] Async task completed')
          
          // 完成任务并扣除积分
          const completeResponse = await fetch('/api/document/translate/status', {
            method: 'POST',
            headers,
            body: JSON.stringify({ jobId })
          })
          
          const completeData = await completeResponse.json()
          
          if (!completeResponse.ok) {
            throw new Error(completeData.error || '完成任务失败')
          }
          
          // 设置翻译结果
          setTranslationState({
            isTranslating: false,
            result: {
              success: true,
              translatedText: completeData.translatedText,
              originalLength: completeData.originalLength,
              translatedLength: completeData.translatedLength,
              creditsUsed: completeData.creditsUsed
            },
            progress: 100,
            error: null
          })
          
          // 刷新积分余额
          const updatedCredits = await refreshCredits()
          if (typeof updatedCredits === 'number') {
            setLocalCredits(updatedCredits)
          }
          
          toast({
            title: '文档翻译完成',
            description: `已使用 ${completeData.creditsUsed} 积分`,
          })
          
          return true // 完成
          
        } else if (job.status === 'failed') {
          throw new Error(job.error || '翻译任务失败')
          
        } else if (job.status === 'processing' || job.status === 'pending') {
          // 继续轮询
          if (pollCount >= maxPolls) {
            throw new Error('任务处理超时，请稍后查看结果或重新提交')
          }
          return false // 继续轮询
        }
        
        return false
        
      } catch (error: any) {
        console.error('[Enhanced Document Translation] Status polling failed:', error)
        
        setTranslationState({
          isTranslating: false,
          result: null,
          progress: 0,
          error: error.message
        })
        
        toast({
          title: '翻译任务失败',
          description: error.message,
          variant: "destructive",
        })
        
        return true // 停止轮询
      }
    }
    
    // 开始轮询
    const poll = async () => {
      const completed = await pollStatus()
      if (!completed) {
        setTimeout(poll, pollInterval)
      }
    }
    
    // 延迟开始第一次轮询
    setTimeout(poll, 1000)
    
  }, [refreshCredits, t])

  // 下载翻译结果
  const handleDownload = useCallback(async () => {
    if (!translationState.result?.translatedText || !uploadState.uploadResult) return

    try {
      const response = await fetch('/api/document/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          translatedText: translationState.result.translatedText,
          originalFileName: uploadState.uploadResult.fileName,
          sourceLanguage,
          targetLanguage: TARGET_LANGUAGE.code
        }),
      })

      if (!response.ok) {
        throw new Error('下载失败')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `translated_${uploadState.uploadResult.fileName}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: '下载成功',
        description: '翻译文档已下载',
      })

    } catch (error: any) {
      toast({
        title: '下载失败',
        description: error.message,
        variant: "destructive",
      })
    }
  }, [translationState.result, uploadState.uploadResult, sourceLanguage])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 文件上传区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            上传文档
          </CardTitle>
          <CardDescription>
            支持 TXT、PDF、DOCX 格式，最大 10MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".txt,.pdf,.docx"
                onChange={handleFileUpload}
                disabled={uploadState.isUploading}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {uploadState.isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
                <span className="text-sm text-gray-600">
                  {uploadState.isUploading ? '上传中...' : '点击选择文件或拖拽到此处'}
                </span>
              </label>
            </div>

            {uploadState.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{uploadState.error}</AlertDescription>
              </Alert>
            )}

            {uploadState.uploadResult && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  文件上传成功！提取了 {uploadState.uploadResult.characterCount} 个字符
                  {uploadState.uploadResult.creditCalculation.credits_required > 0 && (
                    <span className="ml-2">
                      (需要 {uploadState.uploadResult.creditCalculation.credits_required} 积分)
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 语言选择和翻译 */}
      {uploadState.uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              翻译设置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">源语言</label>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择源语言" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_SOURCE_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">目标语言</label>
                <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
                  <span>{TARGET_LANGUAGE.flag}</span>
                  <span>{TARGET_LANGUAGE.name}</span>
                </div>
              </div>

              <Button
                onClick={() => handleTranslate(sourceLanguage, TARGET_LANGUAGE.code)}
                disabled={!sourceLanguage || translationState.isTranslating}
                className="w-full"
              >
                {translationState.isTranslating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translationState.isAsync ? '后台处理中...' : '翻译中...'}
                  </>
                ) : (
                  '开始翻译'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 翻译进度 */}
      {translationState.isTranslating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              翻译进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={translationState.progress} className="w-full" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>进度: {translationState.progress}%</span>
                {translationState.isAsync && translationState.estimatedTime && (
                  <span>预计时间: {translationState.estimatedTime}秒</span>
                )}
              </div>
              {translationState.isAsync && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    大文档正在后台处理，您可以关闭页面稍后回来查看结果
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 翻译结果 */}
      {translationState.result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              翻译完成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">原文字符数:</span>
                  <span className="ml-2">{translationState.result.originalLength || uploadState.uploadResult.characterCount}</span>
                </div>
                <div>
                  <span className="font-medium">译文字符数:</span>
                  <span className="ml-2">{translationState.result.translatedLength || translationState.result.translatedText?.length}</span>
                </div>
                <div>
                  <span className="font-medium">使用积分:</span>
                  <span className="ml-2">{translationState.result.creditsUsed}</span>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50 max-h-60 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">
                  {translationState.result.translatedText}
                </p>
              </div>

              <Button onClick={handleDownload} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                下载翻译文档
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误信息 */}
      {translationState.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{translationState.error}</AlertDescription>
        </Alert>
      )}

      {/* 积分信息 */}
      <ConditionalRender condition={!!user}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              积分余额
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>当前积分: {localCredits}</span>
              <Button variant="outline" size="sm" onClick={() => router.push('/pricing')}>
                充值积分
              </Button>
            </div>
          </CardContent>
        </Card>
      </ConditionalRender>
    </div>
  )
}
