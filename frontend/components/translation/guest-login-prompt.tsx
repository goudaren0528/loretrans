'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  LogIn, 
  History, 
  Download, 
  Clock, 
  Shield, 
  X,
  CheckCircle,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface GuestLoginPromptProps {
  className?: string
  variant?: 'card' | 'banner' | 'inline'
  showDismiss?: boolean
  onDismiss?: () => void
  context?: 'text-translation' | 'document-translation' | 'general'
}

// Hardcoded translations as fallback
const FALLBACK_TRANSLATIONS = {
  context: {
    text: {
      title: "Sign in to access translation history",
      description: "Create a free account to save your translations, access history, and enjoy unlimited features."
    },
    document: {
      title: "Save Your Document Translations",
      description: "Create a free account to save your document translations and access them anytime."
    },
    general: {
      title: "Unlock Translation History",
      description: "Create a free account to unlock advanced features and save your translation history."
    }
  },
  actions: {
    login: "Sign In",
    signup: "Create Free Account",
    existing: "Already have an account?"
  },
  benefits: {
    history: {
      title: "Translation History",
      description: "Save and access all your translations anytime"
    },
    download: {
      title: "Download Results",
      description: "Download your translations in various formats"
    },
    background: {
      title: "Background Processing",
      description: "Large documents processed in the background"
    },
    secure: {
      title: "Secure & Private",
      description: "Your translations are encrypted and secure"
    }
  },
  features: {
    free: "Free Account",
    instant: "Instant Setup",
    secure: "Secure & Private"
  },
  info: {
    privacy: "We respect your privacy. Your data is encrypted and never shared."
  }
}

export function GuestLoginPrompt({ 
  className = '',
  variant = 'card',
  showDismiss = true,
  onDismiss,
  context = 'general'
}: GuestLoginPromptProps) {
  const router = useRouter()
  const t = useTranslations('GuestLoginPrompt')
  const [isDismissed, setIsDismissed] = useState(false)

  const handleLogin = () => {
    router.push('/auth/signin')
  }

  const handleSignup = () => {
    router.push('/auth/signup')
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  if (isDismissed) {
    return null
  }

  // Safe translation function with robust fallback
  const safeT = (key: string, fallbackValue: string) => {
    try {
      const result = t(key)
      // If the result is the same as the key, it means translation failed
      if (result === key || result.startsWith('GuestLoginPrompt.')) {
        return fallbackValue
      }
      return result
    } catch {
      return fallbackValue
    }
  }

  const benefits = [
    {
      icon: <History className="h-4 w-4" />,
      title: safeT('benefits.history.title', FALLBACK_TRANSLATIONS.benefits.history.title),
      description: safeT('benefits.history.description', FALLBACK_TRANSLATIONS.benefits.history.description),
    },
    {
      icon: <Download className="h-4 w-4" />,
      title: safeT('benefits.download.title', FALLBACK_TRANSLATIONS.benefits.download.title),
      description: safeT('benefits.download.description', FALLBACK_TRANSLATIONS.benefits.download.description),
    },
    {
      icon: <Clock className="h-4 w-4" />,
      title: safeT('benefits.background.title', FALLBACK_TRANSLATIONS.benefits.background.title),
      description: safeT('benefits.background.description', FALLBACK_TRANSLATIONS.benefits.background.description),
    },
    {
      icon: <Shield className="h-4 w-4" />,
      title: safeT('benefits.secure.title', FALLBACK_TRANSLATIONS.benefits.secure.title),
      description: safeT('benefits.secure.description', FALLBACK_TRANSLATIONS.benefits.secure.description),
    },
  ]

  const getContextMessage = () => {
    switch (context) {
      case 'text-translation':
        return {
          title: safeT('context.text.title', FALLBACK_TRANSLATIONS.context.text.title),
          description: safeT('context.text.description', FALLBACK_TRANSLATIONS.context.text.description),
        }
      case 'document-translation':
        return {
          title: safeT('context.document.title', FALLBACK_TRANSLATIONS.context.document.title),
          description: safeT('context.document.description', FALLBACK_TRANSLATIONS.context.document.description),
        }
      default:
        return {
          title: safeT('context.general.title', FALLBACK_TRANSLATIONS.context.general.title),
          description: safeT('context.general.description', FALLBACK_TRANSLATIONS.context.general.description),
        }
    }
  }

  const contextMessage = getContextMessage()

  if (variant === 'banner') {
    return (
      <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
        <LogIn className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1">
            <span className="font-medium text-blue-900">{contextMessage.title}</span>
            <span className="ml-2 text-blue-700">{contextMessage.description}</span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button 
              size="sm" 
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {safeT('actions.login', FALLBACK_TRANSLATIONS.actions.login)}
            </Button>
            {showDismiss && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismiss}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <LogIn className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{contextMessage.title}</h4>
            <p className="text-sm text-gray-600">{contextMessage.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleLogin}>
            {safeT('actions.login', FALLBACK_TRANSLATIONS.actions.login)}
          </Button>
          {showDismiss && (
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Default card variant
  return (
    <Card className={`border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 ${className}`}>
      <CardHeader className="relative">
        {showDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="absolute right-2 top-2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900">
              {contextMessage.title}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {contextMessage.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                {benefit.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm text-gray-900">{benefit.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Features Highlight */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            {safeT('features.free', FALLBACK_TRANSLATIONS.features.free)}
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Zap className="h-3 w-3 mr-1" />
            {safeT('features.instant', FALLBACK_TRANSLATIONS.features.instant)}
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Shield className="h-3 w-3 mr-1" />
            {safeT('features.secure', FALLBACK_TRANSLATIONS.features.secure)}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleSignup}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <LogIn className="h-4 w-4 mr-2" />
            {safeT('actions.signup', FALLBACK_TRANSLATIONS.actions.signup)}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleLogin}
            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            {safeT('actions.existing', FALLBACK_TRANSLATIONS.actions.existing)}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {safeT('info.privacy', FALLBACK_TRANSLATIONS.info.privacy)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// 简化版本，用于快速集成
export function SimpleGuestPrompt({ 
  onLogin, 
  className = '' 
}: { 
  onLogin?: () => void
  className?: string 
}) {
  const router = useRouter()
  
  const handleLogin = () => {
    if (onLogin) {
      onLogin()
    } else {
      router.push('/auth/signin')
    }
  }

  return (
    <div className={`flex items-center justify-center p-6 bg-blue-50 rounded-lg border border-blue-200 ${className}`}>
      <div className="text-center space-y-3">
        <LogIn className="h-8 w-8 text-blue-600 mx-auto" />
        <div>
          <h3 className="font-medium text-gray-900">Login to Save History</h3>
          <p className="text-sm text-gray-600">Keep your translations safe and accessible</p>
        </div>
        <Button onClick={handleLogin} size="sm">
          Login Now
        </Button>
      </div>
    </div>
  )
}
