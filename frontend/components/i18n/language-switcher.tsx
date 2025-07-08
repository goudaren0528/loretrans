'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Globe, Check, Languages } from 'lucide-react'
import { locales, localeNames, getLocaleName, isRTL, type Locale } from '@/i18n/settings'

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'icon-only'
  showNativeNames?: boolean
  className?: string
}

export function LanguageSwitcher({ 
  variant = 'default', 
  showNativeNames = true,
  className = '' 
}: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale() as Locale
  const [isChanging, setIsChanging] = useState(false)

  const handleLanguageChange = async (newLocale: Locale) => {
    if (newLocale === currentLocale) return
    
    setIsChanging(true)
    
    try {
      // 构建新的路径
      const segments = pathname.split('/')
      segments[1] = newLocale // 替换语言代码
      const newPath = segments.join('/')
      
      // 设置语言偏好到localStorage
      localStorage.setItem('preferred-locale', newLocale)
      
      // 导航到新语言页面
      router.push(newPath)
      
      // 如果是RTL语言，更新文档方向
      if (typeof document !== 'undefined') {
        document.documentElement.dir = isRTL(newLocale) ? 'rtl' : 'ltr'
        document.documentElement.lang = newLocale
      }
    } catch (error) {
      console.error('Language change failed:', error)
    } finally {
      setIsChanging(false)
    }
  }

  const currentLanguageName = getLocaleName(currentLocale, showNativeNames ? 'native' : 'english')

  if (variant === 'icon-only') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={`w-10 h-10 p-0 ${className}`}>
            <Globe className="h-4 w-4" />
            <span className="sr-only">切换语言</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Languages className="w-4 h-4" />
            选择界面语言
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* 所有支持的语言 */}
          {locales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => handleLanguageChange(locale)}
              className="flex items-center justify-between cursor-pointer"
              disabled={isChanging}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {localeNames[locale].native}
                </span>
                <span className="text-xs text-gray-500">
                  {localeNames[locale].english}
                </span>
              </div>
              {currentLocale === locale && (
                <Check className="w-4 h-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={`gap-2 ${className}`} disabled={isChanging}>
            <Globe className="h-4 w-4" />
            <span className="text-sm">{currentLanguageName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {locales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => handleLanguageChange(locale)}
              className="flex items-center justify-between cursor-pointer"
              disabled={isChanging}
            >
              <span>{getLocaleName(locale, 'native')}</span>
              {currentLocale === locale && (
                <Check className="w-4 h-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Default variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`gap-2 ${className}`} disabled={isChanging}>
          <Globe className="h-4 w-4" />
          <span>{currentLanguageName}</span>
          {isChanging && (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>选择界面语言</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* 所有支持的语言 */}
        <div className="space-y-1">
          {locales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => handleLanguageChange(locale)}
              className="flex items-center justify-between cursor-pointer p-3"
              disabled={isChanging}
            >
              <div>
                <div className="font-medium">{localeNames[locale].native}</div>
                <div className="text-sm text-gray-500">{localeNames[locale].english}</div>
              </div>
              {currentLocale === locale && (
                <Check className="w-4 h-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
