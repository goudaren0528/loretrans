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
  Languages
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useGlobalCredits } from '@/lib/contexts/credits-context'
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
  { code: 'sw', name: 'Kiswahili (Swahili)', flag: '🇰🇪' },
  { code: 'tg', name: 'Тоҷикӣ (Tajik)', flag: '🇹🇯' },
  { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: 'xh', name: 'isiXhosa (Xhosa)', flag: '🇿🇦' },
  { code: 'yo', name: 'Yorùbá (Yoruba)', flag: '🇳🇬' },
  { code: 'zu', name: 'isiZulu (Zulu)', flag: '🇿🇦' }
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

  const { credits, refreshCredits, isLoading: creditsLoading, updateCredits } = useGlobalCredits()
  
  // 添加本地积分状态以确保实时更新
  const [localCredits, setLocalCredits] = useState<number>(credits)
  
  // 同步全局积分状态到本地状态
  useEffect(() => {
    setLocalCredits(credits)
  }, [credits])
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
      
      console.log('[Document Upload] 开始获取认证token', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email
      });
      
      if (user) {
        try {
          const { createSupabaseBrowserClient } = await import('@/lib/supabase')
          const supabase = createSupabaseBrowserClient()
          
          // 先检查当前会话
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          console.log('[Document Upload] 会话检查结果:', {
            hasSession: !!session,
            hasAccessToken: !!session?.access_token,
            sessionError: sessionError,
            tokenLength: session?.access_token?.length,
            tokenPreview: session?.access_token?.substring(0, 20) + '...'
          });
          
          if (sessionError) {
            console.error('[Document Upload] 获取会话失败:', sessionError);
            // 尝试刷新会话
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('[Document Upload] 刷新会话失败:', refreshError);
              throw new Error('会话已过期，请重新登录');
            } else if (refreshData.session?.access_token) {
              headers['Authorization'] = `Bearer ${refreshData.session.access_token}`;
              console.log('[Document Upload] 使用刷新后的token');
            }
          } else if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
            console.log('[Document Upload] 使用当前会话token');
          } else {
            console.warn('[Document Upload] 没有可用的访问token');
            throw new Error('无法获取认证token，请重新登录');
          }
        } catch (error) {
          console.error('[Document Upload] 获取认证token失败:', error);
          toast({
            title: '认证失败',
            description: '请重新登录后再试',
            variant: "destructive",
          });
          router.push('/auth/signin?redirect=' + encodeURIComponent(window.location.pathname));
          return;
        }
      } else {
        console.error('[Document Upload] 用户未登录');
        toast({
          title: t('auth_required.title'),
          description: t('auth_required.description'),
          variant: "destructive",
        });
        router.push('/auth/signin?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }

      console.log('[Document Upload] 准备发送请求', {
        hasAuthHeader: !!headers['Authorization'],
        headerCount: Object.keys(headers).length
      });

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

    // 等待积分加载完成
    if (creditsLoading) {
      console.log('[Document Translation] Waiting for credits to load...')
      toast({
        title: '正在加载积分信息...',
        description: '请稍候',
        variant: "default",
      })
      return
    }

    // 强制刷新积分以确保最新状态
    const updatedCredits = await refreshCredits()
    if (typeof updatedCredits === 'number') {
      setLocalCredits(updatedCredits)
      console.log('[Document Translation] Credits updated:', updatedCredits)
    }

    const { fileId, characterCount, creditCalculation } = uploadState.uploadResult

    // 实时检查积分余额，不依赖上传时的数据
    console.log('[Document Translation] Real-time credit check', {
      characterCount,
      creditsRequired: creditCalculation.credits_required,
      currentCredits: credits,
      creditsLoading,
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    // 如果需要积分但积分不足 - 使用实时积分检查
    console.log('[Document Translation] Real-time credit check', {
      required: creditCalculation.credits_required,
      localCredits: localCredits,
      globalCredits: credits,
      uploadResultCredits: uploadState.uploadResult.userCredits,
      timestamp: new Date().toISOString()
    })
    
    if (creditCalculation.credits_required > 0 && localCredits < creditCalculation.credits_required) {
      console.log('[Document Translation] Insufficient credits', {
        required: creditCalculation.credits_required,
        available: localCredits,
        globalCredits: credits
      })
      
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

      // 立即更新本地积分显示（预扣除）
      if (creditCalculation.credits_required > 0) {
        const newCredits = Math.max(0, localCredits - creditCalculation.credits_required);
        setLocalCredits(newCredits);
        updateCredits(newCredits); // 同时更新全局积分状态
        console.log(`[Credits] 立即预扣除积分显示: ${creditCalculation.credits_required}, 剩余显示: ${newCredits}`);
        
        // 显示积分扣除提示
        toast({
          title: '积分已扣除',
          description: `本次翻译消耗 ${creditCalculation.credits_required} 积分，剩余 ${newCredits} 积分`,
          duration: 3000,
        });
      }

      console.log('[Translation] Starting translation with:', {
        fileId,
        sourceLanguage,
        targetLanguage,
        characterCount,
        creditsRequired: creditCalculation.credits_required,
        creditsAfterDeduction: Math.max(0, localCredits - creditCalculation.credits_required)
      });

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
        // 特殊处理积分不足的情况
        if (response.status === 402 && data.code === 'INSUFFICIENT_CREDITS') {
        // 积分不足时不预扣除，直接显示错误
        if (data.code === 'INSUFFICIENT_CREDITS') {
          toast({
            title: '积分不足',
            description: `需要 ${data.required} 积分，当前余额 ${data.available} 积分。请前往充值页面购买积分。`,
            variant: "destructive",
          });
          
          setTranslationState({
            isTranslating: false,
            result: null,
            progress: 0,
            error: `积分不足：需要 ${data.required} 积分，当前余额 ${data.available} 积分`
          });
          
          return;
        }
          toast({
            title: '积分不足',
            description: `需要 ${data.required} 积分，当前余额 ${data.available} 积分。请前往充值页面购买积分。`,
            variant: "destructive",
          })
          
          // 显示充值按钮
          setTranslationState({
            isTranslating: false,
            result: null,
            progress: 0,
            error: `积分不足：需要 ${data.required} 积分，当前余额 ${data.available} 积分`
          })
          
          return
        }
        
        // 翻译失败时恢复本地积分显示
      if (calculation.credits_required > 0) {
        const restoredCredits = localCredits + calculation.credits_required;
        setLocalCredits(restoredCredits);
          updateCredits(restoredCredits); // 同时更新全局积分状态
        console.log(`[Credits] 翻译失败，恢复积分: ${calculation.credits_required}, 总计: ${restoredCredits}`);
        
        toast({
          title: '积分已退还',
          description: `翻译失败，已退还 ${calculation.credits_required} 积分`,
          duration: 3000,
        });
      }
      
      // 翻译失败时恢复本地积分显示
        if (creditCalculation.credits_required > 0) {
          const restoredCredits = localCredits + creditCalculation.credits_required;
          setLocalCredits(restoredCredits);
          updateCredits(restoredCredits); // 同时更新全局积分状态
          console.log(`[Credits] 翻译失败，恢复积分显示: ${creditCalculation.credits_required}, 总计: ${restoredCredits}`);
          
          toast({
            title: '积分已退还',
            description: `翻译失败，已退还 ${creditCalculation.credits_required} 积分`,
            duration: 3000,
          });
        }
        
        throw new Error(data.error || t('translation.translation_failed'))
      }

      console.log('[Document Translation] API Response:', data)
      
      // 检查是否是异步任务
      if (data.isAsync && data.jobId) {
        console.log('[Document Translation] 异步任务创建:', data.jobId)
        // 开始轮询异步任务状态
        await pollAsyncTranslationStatus(data.jobId)
        return
      }
      
      // 同步任务 - 修复：API直接返回translatedText字段，不是嵌套在result中
      const translatedText = data.translatedText || data.result?.translatedText || ''
      console.log('[Document Translation] Extracted translatedText:', translatedText)
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
      const updatedCredits = await refreshCredits()
      if (typeof updatedCredits === 'number') {
        setLocalCredits(updatedCredits)
        console.log('[Document Translation] Credits refreshed after completion:', updatedCredits)
      }

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

  // 轮询异步翻译任务状态
  const pollAsyncTranslationStatus = useCallback(async (jobId: string) => {
    console.log('[Document Translation] 开始轮询异步任务:', jobId)
    
    const maxAttempts = 300 // 最多轮询5分钟 (300 * 1秒)，增加轮询次数
    let attempts = 0
    let consecutiveErrors = 0
    const maxConsecutiveErrors = 5 // 最多连续5次错误后停止
    
    const poll = async () => {
      try {
        attempts++
        console.log(`[Document Translation] 轮询尝试 ${attempts}/${maxAttempts}`)
        
        // 构建认证头
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        
        if (user) {
          try {
            const { createSupabaseBrowserClient } = await import('@/lib/supabase')
            const supabase = createSupabaseBrowserClient()
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session?.access_token) {
              headers['Authorization'] = `Bearer ${session.access_token}`
            } else {
              console.warn('No access token available for status check')
            }
          } catch (error) {
            console.error('Failed to get auth token for status check:', error)
          }
        }
        
        const response = await fetch(`/api/document/translate/status?jobId=${jobId}`, {
          method: 'GET',
          headers,
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || '查询任务状态失败')
        }
        
        if (!data.success || !data.job) {
          throw new Error('任务不存在或已过期')
        }
        
        const job = data.job
        console.log(`[Document Translation] 任务状态: ${job.status}, 进度: ${job.progress}%`)
        
        // 更新进度
        setTranslationState(prev => ({
          ...prev,
          progress: job.progress || 0
        }))
        
        if (job.status === 'completed' && job.result) {
          console.log('[Document Translation] 异步任务完成，结果长度:', job.result.length)
          
          // 完成任务并扣除积分
          // 构建认证头
          const completeHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
          }
          
          if (user) {
            try {
              const { createSupabaseBrowserClient } = await import('@/lib/supabase')
              const supabase = createSupabaseBrowserClient()
              const { data: { session } } = await supabase.auth.getSession()
              
              if (session?.access_token) {
                completeHeaders['Authorization'] = `Bearer ${session.access_token}`
              } else {
                console.warn('No access token available for task completion')
              }
            } catch (error) {
              console.error('Failed to get auth token for task completion:', error)
            }
          }
          
          const completeResponse = await fetch('/api/document/translate/status', {
            method: 'POST',
            headers: completeHeaders,
            body: JSON.stringify({ jobId })
          })
          
          const completeData = await completeResponse.json()
          
          if (completeResponse.ok && completeData.success) {
            // 设置翻译完成状态
            setTranslationState({
              isTranslating: false,
              result: {
                translatedText: job.result,
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
              console.log('[Document Translation] Credits refreshed after async completion:', updatedCredits)
            }
            
            toast({
              title: t('translation.completed'),
              description: t('translation.credits_consumed', { credits: completeData.creditsUsed || 0 }),
            })
          } else {
            throw new Error(completeData.error || '完成任务失败')
          }
          
          return // 任务完成，停止轮询
        }
        
        if (job.status === 'failed') {
          throw new Error(job.error || '翻译任务失败')
        }
        
        // 如果任务还在进行中，继续轮询
        if (job.status === 'processing' || job.status === 'pending') {
          consecutiveErrors = 0 // 重置连续错误计数
          if (attempts < maxAttempts) {
            setTimeout(poll, 1000) // 1秒后再次轮询
          } else {
            throw new Error('翻译任务超时，请重试')
          }
        }
        
      } catch (error: any) {
        console.error('[Document Translation] 轮询异步任务失败:', error)
        consecutiveErrors++
        
        // 区分网络错误和其他错误
        const isNetworkError = error.message.includes('fetch failed') || 
                              error.message.includes('Failed to fetch') ||
                              error.message.includes('Network Error') ||
                              error.name === 'TypeError'
        
        if (isNetworkError && consecutiveErrors < maxConsecutiveErrors && attempts < maxAttempts) {
          console.log(`[Document Translation] 网络错误，${2000}ms后重试 (连续错误: ${consecutiveErrors}/${maxConsecutiveErrors})`)
          setTimeout(poll, 2000) // 网络错误时等待2秒后重试
          return
        }
        
        // 如果不是网络错误，或者连续错误太多，或者超过最大尝试次数，则停止轮询
        console.error('[Document Translation] 轮询停止:', {
          isNetworkError,
          consecutiveErrors,
          maxConsecutiveErrors,
          attempts,
          maxAttempts
        })
        
        setTranslationState({
          isTranslating: false,
          result: null,
          progress: 0,
          error: isNetworkError ? '网络连接不稳定，请检查网络后重试' : error.message
        })
        
        toast({
          title: t('translation.translation_failed'),
          description: isNetworkError ? '网络连接不稳定，请检查网络后重试' : error.message,
          variant: 'destructive'
        })
      }
    }
    
    // 开始轮询
    setTimeout(poll, 1000) // 1秒后开始第一次轮询
  }, [user, refreshCredits, t, toast])

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

  // 组件挂载时强制刷新积分
  useEffect(() => {
    if (user?.id) {
      console.log('[Document Translator] Component mounted, refreshing credits for user:', user.id)
      refreshCredits()
    }
  }, [user?.id, refreshCredits])

  // 文件上传成功后刷新积分并同步状态
  useEffect(() => {
    if (uploadState.uploadResult && user?.id) {
      console.log('[Document Translator] File uploaded, refreshing credits')
      refreshCredits().then(updatedCredits => {
        if (typeof updatedCredits === 'number') {
          setLocalCredits(updatedCredits)
          console.log('[Document Translator] Credits synced after upload:', updatedCredits)
        }
      })
    }
  }, [uploadState.uploadResult, user?.id, refreshCredits])

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

                  {uploadState.uploadResult.creditCalculation.credits_required > 0 && localCredits < uploadState.uploadResult.creditCalculation.credits_required && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {t('analysis.insufficient_credits', { 
                          required: uploadState.uploadResult.creditCalculation.credits_required,
                          current: localCredits
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
                    disabled={uploadState.uploadResult.creditCalculation.credits_required > 0 && localCredits < uploadState.uploadResult.creditCalculation.credits_required}
                    className="flex-shrink-0"
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
                      className="w-auto max-w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t('translation.download_result')}
                    </Button>
                  </div>
                )}

                {translationState.error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-3">
                        <p>{translationState.error}</p>
                        {translationState.error.includes('积分不足') && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => router.push('/pricing')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Coins className="h-4 w-4 mr-1" />
                              前往充值
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setTranslationState({
                                  isTranslating: false,
                                  result: null,
                                  progress: 0,
                                  error: null
                                })
                              }}
                            >
                              重新尝试
                            </Button>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
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
