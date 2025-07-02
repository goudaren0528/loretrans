'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
  requireCredits?: number
  fallback?: ReactNode
  redirectTo?: string
}

/**
 * 身份验证守卫组件
 * 用于保护需要登录或特定权限的页面和组件
 */
export function AuthGuard({ 
  children, 
  requireAuth = false, 
  requireCredits = 0,
  fallback,
  redirectTo = '/auth/signin'
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      // 构建重定向URL，包含当前页面作为回调
      const currentPath = window.location.pathname + window.location.search
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
      router.push(redirectUrl)
    }
  }, [user, loading, requireAuth, router, redirectTo])

  // 显示加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">加载中...</span>
      </div>
    )
  }

  // 需要登录但用户未登录
  if (requireAuth && !user) {
    return fallback || (
      <div className="text-center py-8">
        <p className="text-muted-foreground">正在跳转到登录页面...</p>
      </div>
    )
  }

  // 需要积分但积分不足
  if (requireCredits > 0 && user && user.credits < requireCredits) {
    return fallback || (
      <div className="text-center py-8 space-y-4">
        <p className="text-muted-foreground">积分不足，需要 {requireCredits} 积分</p>
        <button 
          onClick={() => router.push('/pricing')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          购买积分
        </button>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * 用户状态显示组件
 * 根据用户登录状态显示不同内容
 */
interface ConditionalRenderProps {
  children: ReactNode
  when: 'authenticated' | 'unauthenticated' | 'loading' | 'hasCredits' | 'noCredits'
  fallback?: ReactNode
}

export function ConditionalRender({ children, when, fallback }: ConditionalRenderProps) {
  const { user, loading } = useAuth()

  const shouldRender = () => {
    switch (when) {
      case 'loading':
        return loading
      case 'authenticated':
        return !loading && !!user
      case 'unauthenticated':
        return !loading && !user
      case 'hasCredits':
        return !loading && user && user.credits > 0
      case 'noCredits':
        return !loading && user && user.credits <= 0
      default:
        return false
    }
  }

  if (shouldRender()) {
    return <>{children}</>
  }

  return fallback ? <>{fallback}</> : null
}

/**
 * 权限检查Hook的组件版本
 */
interface PermissionCheckProps {
  children: ReactNode
  userType: 'guest' | 'registered' | 'paid'
  fallback?: ReactNode
}

export function PermissionCheck({ children, userType, fallback }: PermissionCheckProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  const currentUserType = !user ? 'guest' : user.credits > 0 ? 'paid' : 'registered'

  if (currentUserType === userType) {
    return <>{children}</>
  }

  return fallback ? <>{fallback}</> : null
}
