'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

interface RedirectIfAuthenticatedProps {
  children: ReactNode
  redirectTo?: string
  loadingMessage?: string
}

/**
 * 高阶组件：如果用户已认证则重定向
 * 用于登录/注册页面，防止已登录用户访问
 */
export function RedirectIfAuthenticated({ 
  children, 
  redirectTo = '/', 
  loadingMessage = '检查登录状态...' 
}: RedirectIfAuthenticatedProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.replace(redirectTo)
    }
  }, [loading, isAuthenticated, user, router, redirectTo])

  // 如果正在检查认证状态，显示加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  // 如果已认证，显示跳转状态（虽然应该很快就重定向了）
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">已登录，正在跳转...</p>
        </div>
      </div>
    )
  }

  // 如果未认证，显示子组件
  return <>{children}</>
}
