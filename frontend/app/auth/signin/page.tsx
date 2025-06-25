'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { SignInForm } from '@/components/auth/signin-form'
import { useAuth } from '@/lib/hooks/useAuth'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()

  // 获取重定向URL
  const redirectTo = searchParams.get('redirect') || '/'

  // 如果用户已登录，重定向到目标页面
  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  // 登录成功处理
  const handleSignInSuccess = () => {
    // 重定向到目标页面或首页
    router.push(redirectTo)
  }

  // 加载中或已登录用户的处理
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user) {
    return null // 等待重定向
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <SignInForm 
          onSuccess={handleSignInSuccess} 
          redirectTo={redirectTo}
        />
      </div>
    </div>
  )
} 