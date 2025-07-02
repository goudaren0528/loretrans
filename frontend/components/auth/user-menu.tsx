'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useToastMessages } from '@/lib/hooks/use-toast-messages'
import { ConditionalRender } from '@/components/auth/auth-guard'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Settings, 
  CreditCard, 
  LogOut, 
  BarChart3,
  UserPlus,
  LogIn,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

/**
 * 增强版用户菜单组件
 * 包含调试信息和错误处理
 */
export function UserMenuEnhanced() {
  const { user, signOut, loading, refreshUser } = useAuth()
  const { showSignOutSuccess } = useToastMessages()
  const router = useRouter()
  const t = useTranslations('UserMenu')
  const [refreshing, setRefreshing] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      showSignOutSuccess()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleRefreshUser = async () => {
    setRefreshing(true)
    try {
      await refreshUser()
    } catch (error) {
      console.error('Refresh user error:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const getUserInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserDisplayName = () => {
    if (user?.name && user.name !== 'User') {
      return user.name
    }
    if (user?.profile?.name && user.profile.name !== 'User') {
      return user.profile.name
    }
    return user?.email?.split('@')[0] || 'User'
  }

  const getUserEmail = () => {
    return user?.email || 'No email'
  }

  const getUserCredits = () => {
    return user?.credits ?? 0
  }

  // 调试信息组件
  const DebugInfo = () => null // 移除debug信息显示

  return (
    <>
      {/* 已登录用户菜单 */}
      <ConditionalRender when="authenticated">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user?.profile?.avatar_url || undefined} 
                  alt={getUserDisplayName()} 
                />
                <AvatarFallback className="text-xs">
                  {getUserInitials(getUserDisplayName())}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {getUserEmail()}
                </p>
                <p className="text-xs leading-none text-blue-600 font-medium">
                  {getUserCredits()} {t('credits')}
                </p>
                
                {/* 用户状态指示器 */}
                <div className="flex items-center space-x-1 mt-1">
                  {user?.emailVerified ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs text-yellow-600">Unverified</span>
                    </div>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            {/* 如果用户数据不完整，显示警告 */}
            {(!user?.name || user.name === 'User') && (
              <>
                <DropdownMenuItem className="text-yellow-600" disabled>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  <span className="text-xs">Profile incomplete</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            
            {/* 主要功能菜单项 */}
            <DropdownMenuItem asChild>
              <Link href="/pricing" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>{t('purchase_credits')}</span>
              </Link>
            </DropdownMenuItem>
            
            {/* 调试信息 */}
            <DebugInfo />
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('sign_out')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ConditionalRender>

      {/* 未登录用户按钮 */}
      <ConditionalRender when="unauthenticated">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/signin" className="flex items-center gap-1">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">{t('sign_in')}</span>
            </Link>
          </Button>
          
          <Button size="sm" asChild>
            <Link href="/auth/signup" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('sign_up')}</span>
            </Link>
          </Button>
        </div>
      </ConditionalRender>

      <ConditionalRender when="loading">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </ConditionalRender>
    </>
  )
}

/**
 * 简化版用户菜单（用于移动端）
 */
export function UserMenuMobileEnhanced() {
  const { user, signOut, refreshUser } = useAuth()
  const { showSignOutSuccess } = useToastMessages()
  const router = useRouter()
  const t = useTranslations('UserMenu')
  const [refreshing, setRefreshing] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      showSignOutSuccess()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleRefreshUser = async () => {
    setRefreshing(true)
    try {
      await refreshUser()
    } catch (error) {
      console.error('Refresh user error:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const getUserDisplayName = () => {
    if (user?.name && user.name !== 'User') {
      return user.name
    }
    if (user?.profile?.name && user.profile.name !== 'User') {
      return user.profile.name
    }
    return user?.email?.split('@')[0] || 'User'
  }

  return (
    <>
      <ConditionalRender when="authenticated">
        <div className="space-y-2">
          <div className="px-4 py-2 border-b">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{getUserDisplayName()}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-blue-600 font-medium">
                  {user?.credits || 0} {t('credits')}
                </p>
              </div>
              
              {/* 刷新按钮 - 移除debug模式下的显示 */}
            </div>
            
            {/* 状态指示器 */}
            <div className="flex items-center space-x-1 mt-2">
              {user?.emailVerified ? (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">已验证</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-yellow-600">未验证</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-1 px-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/pricing">
                <CreditCard className="mr-2 h-4 w-4" />
                {t('purchase_credits')}
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('sign_out')}
            </Button>
          </div>
        </div>
      </ConditionalRender>

      <ConditionalRender when="unauthenticated">
        <div className="space-y-2 px-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/auth/signin">
              <LogIn className="mr-2 h-4 w-4" />
              {t('sign_in')}
            </Link>
          </Button>
          
          <Button className="w-full justify-start" asChild>
            <Link href="/auth/signup">
              <UserPlus className="mr-2 h-4 w-4" />
              {t('sign_up')}
            </Link>
          </Button>
        </div>
      </ConditionalRender>
    </>
  )
}

// 为了向后兼容，导出别名
export const UserMenu = UserMenuEnhanced
export const UserMenuMobile = UserMenuMobileEnhanced
