import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { FileText, Upload, Languages } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  illustration?: string
  className?: string
}

export function EmptyState({ 
  title, 
  description, 
  action, 
  illustration,
  className = "" 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      {illustration && (
        <div className="mb-6 flex justify-center">
          <Image
            src={illustration}
            alt={title}
            width={280}
            height={200}
            className="max-w-full h-auto"
          />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
    </div>
  )
}

// 预定义的空状态组件

export function TranslationEmptyState({ onStartTranslating }: { onStartTranslating?: () => void }) {
  return (
    <EmptyState
      illustration="/images/empty-state-translation.svg"
      title="Ready to Translate"
      description="Enter your text above and select your source and target languages to get started with AI-powered translation."
      action={onStartTranslating ? {
        label: "Start Translating",
        onClick: onStartTranslating
      } : undefined}
    />
  )
}

export function FileUploadEmptyState({ onSelectFile }: { onSelectFile?: () => void }) {
  return (
    <EmptyState
      illustration="/images/empty-state-upload.svg"
      title="Upload Your Document"
      description="Drag and drop your files here or click to browse. We support PDF, Word, PowerPoint, and text files up to 10MB."
      action={onSelectFile ? {
        label: "Choose Files",
        onClick: onSelectFile
      } : undefined}
    />
  )
}

export function NoResultsState({ onTryAgain }: { onTryAgain?: () => void }) {
  return (
    <div className="text-center py-8 px-6">
      <div className="mb-4 flex justify-center">
        <div className="rounded-full bg-muted p-3">
          <Languages className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No Translation Available
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        We couldn't process your translation request. Please check your input and try again.
      </p>
      
      {onTryAgain && (
        <Button onClick={onTryAgain} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  )
}

export function UploadErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="text-center py-8 px-6">
      <div className="mb-4 flex justify-center">
        <div className="rounded-full bg-destructive/10 p-3">
          <Upload className="h-8 w-8 text-destructive" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Upload Failed
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        There was a problem uploading your file. Please check the file format and size, then try again.
      </p>
      
      {onRetry && (
        <Button onClick={onRetry} variant="default">
          Try Again
        </Button>
      )}
    </div>
  )
} 