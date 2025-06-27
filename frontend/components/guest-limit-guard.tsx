'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, UserPlus, Zap } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { GuestLimitService, type GuestLimitStatus } from '@/lib/services/guest-limits'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { detectLocaleFromPath } from '@/lib/navigation'

// 创建 Context 来传递未登录用户限制状态
interface GuestLimitContextType {
  limitStatus: GuestLimitStatus | null
  recordTranslation: () => boolean
  canTranslate: boolean
  isLimitReached: boolean
}

const GuestLimitContext = createContext<GuestLimitContextType | null>(null)

interface GuestLimitGuardProps {
  children: React.ReactNode
  onLimitReached?: () => void
  showStatus?: boolean
}

/**
 * 未登录用户翻译限制守卫组件
 * 检查并显示翻译次数限制，超限时显示注册引导
 */
export function GuestLimitGuard({ 
  children, 
  onLimitReached,
  showStatus = true 
}: GuestLimitGuardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { locale } = detectLocaleFromPath(pathname)
  const t = useTranslations('Auth')
  const [limitStatus, setLimitStatus] = useState<GuestLimitStatus | null>(null)

  // 检查限制状态
  useEffect(() => {
    if (user) {
      // 已登录用户不受限制
      setLimitStatus(null)
      return
    }

    const status = GuestLimitService.checkGuestLimit()
    setLimitStatus(status)

    if (status.isLimitReached && onLimitReached) {
      onLimitReached()
    }
  }, [user, onLimitReached])

  // 记录翻译使用
  const recordTranslation = () => {
    if (user) return true // 已登录用户不受限制

    const success = GuestLimitService.recordTranslation()
    if (success) {
      // 更新状态
      const newStatus = GuestLimitService.checkGuestLimit()
      setLimitStatus(newStatus)
    }
    return success
  }

  // 处理注册跳转
  const handleSignUp = () => {
    router.push(`/${locale}/auth/signup?redirect=` + encodeURIComponent(window.location.pathname))
  }

  const handleSignIn = () => {
    router.push(`/${locale}/auth/signin?redirect=` + encodeURIComponent(window.location.pathname))
  }

  // Context 值
  const contextValue: GuestLimitContextType = {
    limitStatus,
    recordTranslation,
    canTranslate: user ? true : limitStatus?.canTranslate ?? true,
    isLimitReached: user ? false : limitStatus?.isLimitReached ?? false
  }

  // 已登录用户直接显示内容
  if (user) {
    return (
      <GuestLimitContext.Provider value={contextValue}>
        {children}
      </GuestLimitContext.Provider>
    )
  }

  // 未登录且超限
  if (limitStatus?.isLimitReached) {
    const message = GuestLimitService.getLimitMessage(limitStatus)
    
    return (
      <div className="space-y-6">
        {/* 超限提示卡片 */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              {message.title}
            </CardTitle>
            <CardDescription className="text-orange-700">
              {message.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleSignUp} className="flex-1">
                <UserPlus className="h-4 w-4 mr-2" />
                {t('SignUpForm.submit_button')}
              </Button>
              <Button variant="outline" onClick={handleSignIn} className="flex-1">
                {t('SignInForm.submit_button')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 注册优势展示 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">注册账户的优势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="rounded-full bg-green-100 p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-1">无限制翻译</h3>
                <p className="text-sm text-gray-600">500字符以下无限次翻译</p>
              </div>
              <div className="text-center">
                <div className="rounded-full bg-blue-100 p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-1">500积分奖励</h3>
                <p className="text-sm text-gray-600">注册即送500积分</p>
              </div>
              <div className="text-center">
                <div className="rounded-full bg-purple-100 p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium mb-1">文档翻译</h3>
                <p className="text-sm text-gray-600">支持PDF、Word等文档</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 未登录但未超限，显示状态和内容
  return (
    <GuestLimitContext.Provider value={contextValue}>
      <div className="space-y-4">
        {/* 翻译次数状态 */}
        {showStatus && limitStatus && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                {t('GuestLimit.remaining_translations', { count: limitStatus.remainingTranslations })}
              </span>
              <Button variant="link" size="sm" onClick={handleSignUp}>
                {t('GuestLimit.register_for_unlimited')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 子组件 */}
        {children}
      </div>
    </GuestLimitContext.Provider>
  )
}

/**
 * Hook: 使用未登录用户限制
 */
export function useGuestLimit() {
  const context = useContext(GuestLimitContext)
  const { user } = useAuth()
  const [limitStatus, setLimitStatus] = useState<GuestLimitStatus | null>(null)

  // 如果在 GuestLimitGuard 内部，使用 Context
  if (context) {
    return context
  }

  // 如果不在 GuestLimitGuard 内部，独立使用
  useEffect(() => {
    if (user) {
      setLimitStatus(null)
      return
    }

    const status = GuestLimitService.checkGuestLimit()
    setLimitStatus(status)
  }, [user])

  const recordTranslation = () => {
    if (user) return true

    const success = GuestLimitService.recordTranslation()
    if (success) {
      const newStatus = GuestLimitService.checkGuestLimit()
      setLimitStatus(newStatus)
    }
    return success
  }

  return {
    limitStatus,
    recordTranslation,
    canTranslate: user ? true : limitStatus?.canTranslate ?? true,
    isLimitReached: user ? false : limitStatus?.isLimitReached ?? false
  }
}
