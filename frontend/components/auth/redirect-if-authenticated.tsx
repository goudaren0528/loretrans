'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTranslations } from 'next-intl'

interface RedirectIfAuthenticatedProps {
  children: ReactNode
  redirectTo?: string
}

/**
 * 高阶组件：如果用户已认证则重定向
 * 用于登录/注册页面，防止已登录用户访问
 */
export function RedirectIfAuthenticated({ 
  children, 
  redirectTo = '/'
}: RedirectIfAuthenticatedProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const t = useTranslations('Auth.Status')

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
          <p className="text-sm text-muted-foreground">{t('checking_login')}</p>
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
          <p className="text-sm text-muted-foreground">{t('redirecting')}</p>
        </div>
      </div>
    )
  }

  // 如果未认证，显示子组件
  return <>{children}</>
}
