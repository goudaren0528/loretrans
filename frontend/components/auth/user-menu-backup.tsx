'use client'

import { useAuth } from '@/lib/hooks/useAuth'
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
  LogIn
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

/**
 * 用户菜单组件
 * 显示用户头像和下拉菜单，包含个人资料、控制台、退出等选项
 */
export function UserMenu() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const t = useTranslations('UserMenu')

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

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
                  alt={user?.name || 'User'} 
                />
                <AvatarFallback className="text-xs">
                  {user?.name ? getUserInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || t('user')}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <p className="text-xs leading-none text-blue-600 font-medium">
                  {user?.credits || 0} {t('credits')}
                </p>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            {/* 暂时隐藏这些功能，专注于核心翻译功能 */}
            {/* 
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>{t('profile')}</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>{t('dashboard')}</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/credits/purchase" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>{t('purchase_credits')}</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('settings')}</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            */}
            
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

      {/* 加载状态 */}
      <ConditionalRender when="loading">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
      </ConditionalRender>
    </>
  )
}

/**
 * 简化版用户菜单（用于移动端）
 */
export function UserMenuMobile() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const t = useTranslations('UserMenu')

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <>
      <ConditionalRender when="authenticated">
        <div className="space-y-2">
          <div className="px-4 py-2 border-b">
            <p className="font-medium">{user?.name || t('user')}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-sm text-blue-600 font-medium">
              {user?.credits || 0} {t('credits')}
            </p>
          </div>
          
          <div className="space-y-1 px-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                {t('profile')}
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/dashboard">
                <BarChart3 className="mr-2 h-4 w-4" />
                {t('dashboard')}
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/credits/purchase">
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
