'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { SignUpForm } from '@/components/auth/signup-form'
import { useAuth } from '@/lib/hooks/useAuth'
import { detectLocaleFromPath } from '@/lib/navigation'
import LocaleSwitcher from '@/components/LocaleSwitcher'

function SignUpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [locale, setLocale] = useState('en')

  // 从URL路径获取locale
  useEffect(() => {
    const { locale: detectedLocale } = detectLocaleFromPath(pathname)
    if (detectedLocale) {
      setLocale(detectedLocale)
    }
  }, [pathname])

  // 如果用户已登录，重定向到首页
  useEffect(() => {
    if (!loading && user) {
      const redirectTo = searchParams.get('redirectTo') || '/'
      router.push(redirectTo)
    }
  }, [user, loading, router, searchParams])

  const handleSignUpSuccess = () => {
    const redirectTo = searchParams.get('redirectTo') || '/'
    router.push(redirectTo)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user) {
    return null // 将重定向，不显示内容
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* 语言切换器 */}
      <div className="absolute top-4 right-4">
        <LocaleSwitcher />
      </div>

      <div className="w-full max-w-md">
        <SignUpForm onSuccess={handleSignUpSuccess} locale={locale} />
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  )
}
