'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  UserPlus, 
  LogIn, 
  Zap, 
  Clock,
  Shield,
  Star
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LoginPromptProps {
  title?: string
  description?: string
  feature?: string
  className?: string
}

export function LoginPrompt({ 
  title = "Login Required",
  description = "Please sign in to access this feature",
  feature = "this feature",
  className 
}: LoginPromptProps) {
  const router = useRouter()

  const handleLogin = () => {
    router.push('/auth/signin')
  }

  const handleSignup = () => {
    router.push('/auth/signup')
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Star className="h-4 w-4" />
          <AlertDescription>
            <strong>Why sign in?</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-blue-500" />
                Access to long text translation (up to 5000 characters)
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-green-500" />
                Background processing - leave and come back later
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-purple-500" />
                Translation history and task management
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button 
            onClick={handleLogin}
            className="flex-1"
            variant="default"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
          <Button 
            onClick={handleSignup}
            className="flex-1"
            variant="outline"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create Account
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Free account • No credit card required
        </p>
      </CardContent>
    </Card>
  )
}
