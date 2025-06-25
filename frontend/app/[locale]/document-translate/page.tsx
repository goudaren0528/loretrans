'use client'

import React, { useState } from 'react'
import { SimpleFileSelectorV2 } from '@/components/simple-file-selector-v2'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Download, FileText, Languages, CheckCircle, AlertCircle } from 'lucide-react'
import { APP_CONFIG } from '../../../../config/app.config'
import { useTranslations } from 'next-intl'

interface Language {
  code: string;
  name: string;
  nativeName: string;
  slug: string;
  available: boolean;
  bidirectional: boolean;
}

interface TranslationJob {
  id: string
  fileName: string
  fileSize: number
  sourceLanguage: string
  targetLanguage: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  message?: string
  createdAt: string
  completedAt?: string
  downloadUrl?: string
  error?: string
}

export default function DocumentTranslatePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sourceLanguage, setSourceLanguage] = useState<string>('auto')
  const [targetLanguage, setTargetLanguage] = useState<string>('en')
  const [translationJobs, setTranslationJobs] = useState<TranslationJob[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const t = useTranslations('DocumentTranslatePage');

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file)
  }

  const startTranslation = async () => {
    if (!selectedFile) return

    setIsProcessing(true)

    try {
      // 1. 首先上传文件到微服务
      const formData = new FormData()
      formData.append('file', selectedFile)

      const uploadResponse = await fetch('http://localhost:3010/upload', {
        method: 'POST',
        body: formData,
      })

      const uploadResult = await uploadResponse.json()
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error?.message || 'File upload failed')
      }

      const fileId = uploadResult.data.fileId

      // 2. 启动翻译任务
      const translateResponse = await fetch('http://localhost:3010/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          sourceLanguage,
          targetLanguage
        })
      })

      const translateResult = await translateResponse.json()
      
      if (!translateResult.success) {
        throw new Error(translateResult.error?.message || 'Translation failed to start')
      }

      const jobId = translateResult.data.jobId

      // 3. 创建本地任务记录
      const newJob: TranslationJob = {
        id: jobId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        sourceLanguage,
        targetLanguage,
        status: 'pending',
        progress: 0,
        createdAt: new Date().toISOString(),
      }

      setTranslationJobs(prev => [newJob, ...prev])

      // 4. 轮询任务状态
      pollJobStatus(jobId)

      // 成功开始翻译后清除选定文件
      setSelectedFile(null)

    } catch (error) {
      console.error('Translation start failed:', error)
      // 创建失败的任务记录
      const failedJobId = `failed_${Date.now()}`
      const failedJob: TranslationJob = {
        id: failedJobId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        sourceLanguage,
        targetLanguage,
        status: 'failed',
        progress: 0,
        createdAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Translation failed'
      }
      setTranslationJobs(prev => [failedJob, ...prev])
    }

    setIsProcessing(false)
  }

  const pollJobStatus = async (jobId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`http://localhost:3010/job/${jobId}`)
        const result = await response.json()
        
        if (result.success && result.data) {
          const jobData = result.data
          
          setTranslationJobs(prev => 
            prev.map(job => job.id === jobId ? {
              ...job,
              status: jobData.status,
              progress: jobData.progress,
              message: jobData.message,
              downloadUrl: jobData.downloadUrl,
              completedAt: jobData.completedAt,
              error: jobData.error
            } : job)
          )

          // 如果任务还在进行中，继续轮询
          if (jobData.status === 'pending' || jobData.status === 'processing') {
            // 减少轮询间隔，提供更实时的反馈
            const pollInterval = jobData.status === 'processing' ? 1000 : 2000 // 处理中时每1秒，等待中时每2秒
            setTimeout(poll, pollInterval)
          }
        }
      } catch (error) {
        console.error('Failed to poll job status:', error)
        // 停止轮询并标记为失败
        setTranslationJobs(prev => 
          prev.map(job => job.id === jobId ? {
            ...job,
            status: 'failed',
            error: 'Failed to get job status'
          } : job)
        )
      }
    }

    // 开始轮询
    poll()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (startTime: string, endTime?: string): string => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const durationMs = end.getTime() - start.getTime()
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('hero.title')}</h1>
        <p className="text-muted-foreground">
          {t('hero.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* File Upload Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('upload_section.title')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('upload_section.description')}
              </p>
              <SimpleFileSelectorV2
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
                acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx']}
                maxSize={50}
              />
            </div>
          </div>

          {/* Translation Settings */}
          {selectedFile && (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  {t('settings_section.title')}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="source-language">{t('settings_section.source_language_label')}</Label>
                      <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('settings_section.source_language_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">{t('settings_section.source_language_placeholder')}</SelectItem>
                          {APP_CONFIG.languages.supported.map((lang: Language) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name} ({lang.nativeName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target-language">{t('settings_section.target_language_label')}</Label>
                      <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('settings_section.target_language_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">{t('settings_section.target_language_placeholder')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={startTranslation} disabled={isProcessing} className="w-full">
                    {isProcessing ? t('settings_section.processing_button') : t('settings_section.submit_button')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">How it works</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">1. Upload Document</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload your document in supported format
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <Languages className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">2. Choose Languages</h4>
                    <p className="text-sm text-muted-foreground">
                      Select source language or use auto-detection
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <Download className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">3. Download Result</h4>
                    <p className="text-sm text-muted-foreground">
                      Get your translated document
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Supported Formats</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  PDF documents
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Microsoft Word (.doc, .docx)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  PowerPoint (.ppt, .pptx)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Plain text files (.txt)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Translation Jobs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">
          {t('jobs_section.title')}
        </h3>
        {translationJobs.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground p-8 border rounded-lg">
            {t('jobs_section.empty_message')}
          </div>
        ) : (
          translationJobs.map((job) => (
            <div key={job.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold break-all">{job.fileName}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(job.fileSize)}</p>
                </div>
                <div className="text-xs font-medium px-2 py-1 rounded-full" style={{
                  backgroundColor: job.status === 'completed' ? '#22c55e' : job.status === 'failed' ? '#ef4444' : '#3b82f6',
                  color: 'white'
                }}>
                  {t(`jobs_section.job_status.${job.status}`)}
                </div>
              </div>

              {job.status === 'processing' && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${job.progress}%` }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{job.message}</p>
                </div>
              )}
              
              {job.status === 'failed' && job.error && (
                <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {job.error}
                </div>
              )}

              <div className="mt-2 pt-2 border-t flex justify-between items-center text-xs text-muted-foreground">
                <span>ID: {job.id.substring(0, 8)}...</span>
                <span>{formatDuration(job.createdAt, job.completedAt)}</span>
              </div>

              {job.status === 'completed' && job.downloadUrl && (
                <a
                  href={`http://localhost:3010${job.downloadUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Download className="h-3 w-3 mr-1" />
                    {t('jobs_section.download_button')}
                  </Button>
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
} 