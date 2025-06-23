'use client'

import React, { useState } from 'react'
import { SimpleFileSelectorV2 } from '@/components/simple-file-selector-v2'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Download, FileText, Languages, CheckCircle, AlertCircle } from 'lucide-react'
import { APP_CONFIG } from '../../../config/app.config'

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
        <h1 className="text-3xl font-bold mb-2">Document Translation</h1>
        <p className="text-muted-foreground">
          Upload documents and translate them to English
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* File Upload Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Document
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose a document to translate. Supported: PDF, Word, PowerPoint, Text files
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
                  Translation Settings
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="source-language">Source Language</Label>
                      <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                        <SelectTrigger>
                          <SelectValue placeholder="Auto-detect" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-detect</SelectItem>
                          {APP_CONFIG.languages.supported.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name} ({lang.nativeName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target-language">Target Language</Label>
                      <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                        <SelectTrigger>
                          <SelectValue placeholder="English" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <Button 
                      onClick={startTranslation}
                      disabled={isProcessing}
                      size="lg"
                    >
                      {isProcessing ? 'Processing...' : 'Start Translation'}
                    </Button>
                  </div>
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

      {/* Translation History */}
      {translationJobs.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Translation History</h2>
          <div className="space-y-4">
            {translationJobs.map((job) => (
              <div key={job.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      {job.status === 'processing' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                      {job.status === 'completed' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                      )}
                      {job.status === 'failed' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{job.fileName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(job.fileSize)} • {job.sourceLanguage} → {job.targetLanguage}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Started: {formatDuration(job.createdAt)}
                        {job.completedAt && ` • Completed: ${formatDuration(job.completedAt)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 min-w-0 ml-4">
                    {/* Status and Progress */}
                    <div className="flex items-center gap-2">
                      {job.status === 'pending' && (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                          <span className="text-sm text-muted-foreground">Waiting...</span>
                        </>
                      )}
                      {job.status === 'processing' && (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-blue-600"></div>
                          <span className="text-sm text-blue-600 font-medium">{job.progress}%</span>
                        </>
                      )}
                      {job.status === 'completed' && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600 font-medium">Completed</span>
                        </div>
                      )}
                      {job.status === 'failed' && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <span className="text-sm text-destructive font-medium">Failed</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar for Processing */}
                    {job.status === 'processing' && (
                      <div className="w-48">
                        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                            style={{ width: `${Math.max(job.progress, 5)}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse"></div>
                          </div>
                        </div>
                        {job.message && (
                          <p className="text-xs text-muted-foreground mt-1 text-right truncate" title={job.message}>
                            {job.message}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Download Button */}
                    {job.status === 'completed' && job.downloadUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = job.downloadUrl!
                          link.download = `translated_${job.fileName}`
                          link.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {job.error && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <p className="text-sm text-destructive">{job.error}</p>
                    </div>
                  </div>
                )}

                {/* Processing Details */}
                {job.status === 'processing' && job.message && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-blue-600 mt-0.5 shrink-0"></div>
                      <p className="text-sm text-blue-700">{job.message}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 