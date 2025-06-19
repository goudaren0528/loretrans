'use client'

import React, { useRef, useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Upload, File, X } from 'lucide-react'

interface SimpleFileSelectorV2Props {
  onFileSelect?: (file: File | null) => void
  selectedFile?: File | null
  acceptedTypes?: string[]
  maxSize?: number // in MB
  className?: string
  disabled?: boolean
}

export function SimpleFileSelectorV2({
  onFileSelect,
  selectedFile,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx'],
  maxSize = 50,
  className,
  disabled = false,
}: SimpleFileSelectorV2Props) {
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

  const processFile = useCallback((file: File) => {
    const validation = validateFile(file)
    
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    onFileSelect?.(file)
  }, [validateFile, onFileSelect])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
    // 重置input值
    e.target.value = ''
  }, [processFile])

  const handleButtonClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

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
      processFile(files[0])
    }
  }, [disabled, processFile])

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

  return (
    <div className={cn("space-y-4", className)}>
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      
      {!selectedFile ? (
        // File Selection Area
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            "hover:border-primary/50 hover:bg-muted/50",
            isDragOver && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
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
              <Button 
                onClick={handleButtonClick}
                disabled={disabled}
                variant="outline"
              >
                点击浏览文件
              </Button>
              <p className="text-xs text-muted-foreground">
                支持: {acceptedTypes.join(', ')} • 最大 {maxSize}MB
              </p>
            </div>
          </div>
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
              onClick={handleButtonClick}
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