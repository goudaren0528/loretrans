'use client'

import React, { useState, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface FileUploadProps {
  onFileSelect?: (file: File) => void
  onUploadComplete?: (result: any) => void
  onUploadError?: (error: string) => void
  acceptedTypes?: string[]
  maxSize?: number // in MB
  className?: string
  disabled?: boolean
  autoUpload?: boolean // 是否自动上传，默认为true
}

interface UploadedFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  result?: any
}

export function FileUpload({
  onFileSelect,
  onUploadComplete,
  onUploadError,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx'],
  maxSize = 10, // 10MB
  className,
  disabled = false,
  autoUpload = true,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateFileId = () => Math.random().toString(36).substr(2, 9)

  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      return { valid: false, error: `File size exceeds ${maxSize}MB limit` }
    }

    // 检查文件类型
    const fileName = file.name.toLowerCase()
    const isValidType = acceptedTypes.some(type => 
      type.startsWith('.') ? fileName.endsWith(type) : file.type.includes(type)
    )

    if (!isValidType) {
      return { valid: false, error: `File type not supported. Accepted: ${acceptedTypes.join(', ')}` }
    }

    return { valid: true }
  }, [acceptedTypes, maxSize])

  const handleFiles = useCallback((files: FileList | File[]) => {
    const filesArray = Array.from(files)
    
    filesArray.forEach(file => {
      const validation = validateFile(file)
      
      if (!validation.valid) {
        onUploadError?.(validation.error || 'Invalid file')
        return
      }

      const fileId = generateFileId()
      const uploadedFile: UploadedFile = {
        file,
        id: fileId,
        progress: 0,
        status: 'pending',
      }

      setUploadedFiles(prev => [...prev, uploadedFile])
      onFileSelect?.(file)

      // 只有在autoUpload为true时才自动上传
      if (autoUpload) {
        simulateUpload(fileId, file)
      }
    })
      }, [validateFile, onFileSelect, autoUpload])

  const simulateUpload = async (fileId: string, file: File) => {
    try {
      // 更新状态为上传中
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, status: 'uploading' as const } : f)
      )

      // 模拟上传进度
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, progress } : f)
        )
      }

      // 这里应该实际调用文件上传API
      // const formData = new FormData()
      // formData.append('file', file)
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData,
      // })
      // const result = await response.json()

      // 模拟成功结果
      const mockResult = {
        fileId,
        fileName: file.name,
        fileSize: file.size,
        uploadUrl: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
      }

      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'success' as const, 
          progress: 100,
          result: mockResult 
        } : f)
      )

      onUploadComplete?.(mockResult)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'error' as const, 
          error: errorMessage 
        } : f)
      )

      onUploadError?.(errorMessage)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [disabled, handleFiles])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
      // 重置input值，允许选择相同文件
      e.target.value = ''
    }
  }, [handleFiles])

  const handleBrowseClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }, [disabled])

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  const retryUpload = useCallback((fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId)
    if (file) {
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'pending', 
          progress: 0, 
          error: undefined 
        } : f)
      )
      simulateUpload(fileId, file.file)
    }
  }, [uploadedFiles])

  const startUpload = useCallback((fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId)
    if (file && file.status === 'pending') {
      simulateUpload(fileId, file.file)
    }
  }, [uploadedFiles])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop()
    // 这里可以根据文件扩展名返回不同的图标
    return <File className="h-8 w-8 text-muted-foreground" />
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          "hover:border-primary/50 hover:bg-muted/50",
          isDragOver && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            "rounded-full p-3 transition-colors",
            isDragOver ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            <Upload className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragOver ? "Drop files here" : "Drop files to upload"}
            </p>
            <p className="text-sm text-muted-foreground">
              or <span className="text-primary underline">browse</span> to choose files
            </p>
            <p className="text-xs text-muted-foreground">
              Supports: {acceptedTypes.join(', ')} • Max {maxSize}MB
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled}
        />
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {getFileIcon(uploadedFile.file.name)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                  
                  {/* Progress Bar */}
                  {uploadedFile.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadedFile.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {uploadedFile.progress}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadedFile.status === 'error' && uploadedFile.error && (
                    <p className="text-xs text-destructive mt-1">
                      {uploadedFile.error}
                    </p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {uploadedFile.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  {uploadedFile.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {uploadedFile.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-1">
                  {!autoUpload && uploadedFile.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation()
                        startUpload(uploadedFile.id)
                      }}
                    >
                      Upload
                    </Button>
                  )}
                  {uploadedFile.status === 'error' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        retryUpload(uploadedFile.id)
                      }}
                    >
                      Retry
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(uploadedFile.id)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 