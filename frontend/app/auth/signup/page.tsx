'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { SignUpForm } from '@/components/auth/signup-form'
import { useAuth } from '@/lib/hooks/useAuth'

export default function SignUpPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // 如果用户已登录，重定向到首页
  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  // 注册成功处理
  const handleSignUpSuccess = () => {
    // 重定向到首页或用户控制台
    router.push('/')
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
        <SignUpForm onSuccess={handleSignUpSuccess} />
      </div>
    </div>
  )
} 