'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SignUpForm } from '@/components/auth/signup-form'
import { useAuth } from '@/lib/hooks/useAuth'
import { detectLocaleFromPath } from '@/lib/navigation'
import LocaleSwitcher from '@/components/LocaleSwitcher'

export default function SignUpPage() {
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
      // 从浏览器语言检测
      const browserLang = navigator.language.split('-')[0]
      if (['en', 'zh', 'es', 'fr'].includes(browserLang)) {
        setLocale(browserLang)
      }
    }
  }, [searchParams])

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
        {/* 语言选择器 - 仅用于测试密码强度提示 */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white">
            <Globe className="h-4 w-4 text-gray-500" />
            <select 
              value={locale} 
              onChange={(e) => setLocale(e.target.value)}
              className="text-sm bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="en">🇺🇸 English</option>
              <option value="zh">🇨🇳 中文</option>
              <option value="es">🇪🇸 Español</option>
              <option value="fr">🇫🇷 Français</option>
            </select>
          </div>
        </div>
        
        <SignUpForm onSuccess={handleSignUpSuccess} locale={locale} />
      </div>
    </div>
  )
} 