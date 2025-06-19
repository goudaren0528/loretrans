'use client'

import React, { useRef, useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Upload, File, X } from 'lucide-react'

interface SimpleFileSelectorProps {
  onFileSelect?: (file: File | null) => void
  selectedFile?: File | null
  acceptedTypes?: string[]
  maxSize?: number // in MB
  className?: string
  disabled?: boolean
}

export function SimpleFileSelector({
  onFileSelect,
  selectedFile,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx'],
  maxSize = 50,
  className,
  disabled = false,
}: SimpleFileSelectorProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      return { valid: false, error: `文件大小超过 ${maxSize}MB 限制` }
    }

    // 检查文件类型
    const fileName = file.name.toLowerCase()
    const isValidType = acceptedTypes.some(type => 
      type.startsWith('.') ? fileName.endsWith(type) : file.type.includes(type)
    )

    if (!isValidType) {
      return { valid: false, error: `不支持的文件类型。支持: ${acceptedTypes.join(', ')}` }
    }

    return { valid: true }
  }, [acceptedTypes, maxSize])

  const handleFileSelect = useCallback((file: File) => {
    console.log('SimpleFileSelector: File being selected:', file.name)
    const validation = validateFile(file)
    
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    console.log('SimpleFileSelector: Calling onFileSelect with:', file.name)
    onFileSelect?.(file)
  }, [validateFile, onFileSelect])

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
      handleFileSelect(files[0]) // 只选择第一个文件
    }
  }, [disabled, handleFileSelect])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('SimpleFileSelector: File input change triggered, files:', e.target.files?.length || 0)
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0])
      // 重置input值，允许选择相同文件
      e.target.value = ''
    }
  }, [handleFileSelect])

  const handleBrowseClick = useCallback((e?: React.MouseEvent) => {
    console.log('SimpleFileSelector: Browse click triggered, disabled:', disabled)
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!disabled && fileInputRef.current) {
      console.log('SimpleFileSelector: Triggering file input click')
      // 使用setTimeout确保事件处理器已准备好
      setTimeout(() => {
        fileInputRef.current?.click()
      }, 0)
    }
  }, [disabled])

  const removeFile = useCallback(() => {
    onFileSelect?.(null)
  }, [onFileSelect])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // console.log('SimpleFileSelector render: selectedFile =', selectedFile?.name || 'null')
  
  return (
    <div className={cn("space-y-4", className)}>
      {!selectedFile ? (
        // File Selection Area
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
                {isDragOver ? "拖放文件到这里" : "选择要翻译的文档"}
              </p>
              <p className="text-sm text-muted-foreground">
                或 <span className="text-primary underline">点击浏览</span> 选择文件
              </p>
              <p className="text-xs text-muted-foreground">
                支持: {acceptedTypes.join(', ')} • 最大 {maxSize}MB
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            onInput={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={disabled}
            style={{ pointerEvents: 'auto' }}
          />
        </div>
      ) : (
        // Selected File Display
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
          <div className="flex-shrink-0">
            <File className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleBrowseClick}
              disabled={disabled}
            >
              更换文件
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={removeFile}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 