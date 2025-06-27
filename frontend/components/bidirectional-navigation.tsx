'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, ArrowLeft, Globe, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_CONFIG } from '../config/app.config'

interface BidirectionalNavigationProps {
  currentSourceLang: string
  currentTargetLang: string
  className?: string
  showRelatedLanguages?: boolean
  maxRelatedLanguages?: number
}

export function BidirectionalNavigation({
  currentSourceLang,
  currentTargetLang,
  className,
  showRelatedLanguages = true,
  maxRelatedLanguages = 4,
}: BidirectionalNavigationProps) {
  const router = useRouter()

  // 获取当前语言信息
  const sourceLanguageInfo = APP_CONFIG.languages.supported.find(
    (lang) => lang.code === currentSourceLang
  )
  const targetLanguageInfo =
    currentTargetLang === 'en'
      ? APP_CONFIG.languages.target
      : APP_CONFIG.languages.supported.find(
          (lang) => lang.code === currentTargetLang
        )

  // 生成反向翻译URL
  const getReverseUrl = () => {
    if (currentTargetLang === 'en') {
      // 当前是 小语种→英文，反向是 英文→小语种
      const sourceSlug = sourceLanguageInfo?.slug
      return sourceSlug ? `/english-to-${sourceSlug}` : '#'
    } else {
      // 当前是 英文→小语种，反向是 小语种→英文
      const targetSlug = targetLanguageInfo?.slug
      return targetSlug ? `/${targetSlug}-to-english` : '#'
    }
  }

  // 获取相关语言（排除当前语言）
  const getRelatedLanguages = () => {
    return APP_CONFIG.languages.supported
      .filter(
        (lang) =>
          lang.code !== currentSourceLang && lang.code !== currentTargetLang
      )
      .slice(0, maxRelatedLanguages)
  }

  const reverseUrl = getReverseUrl()
  const relatedLanguages = getRelatedLanguages()

  return (
    <div className={cn('space-y-4', className)}>
      {/* 当前翻译方向显示 */}
      <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm font-medium">
            {sourceLanguageInfo?.nativeName || currentSourceLang}
          </Badge>
          <ArrowRight className="h-4 w-4 text-blue-600" />
          <Badge variant="secondary" className="text-sm font-medium">
            {targetLanguageInfo?.nativeName || currentTargetLang}
          </Badge>
        </div>
      </div>

      {/* 反向翻译切换 */}
      <div className="flex items-center justify-center">
        <Link href={reverseUrl} className="group">
          <Button
            variant="outline"
            className="gap-2 transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 group-hover:translate-x-[-2px] transition-transform" />
            <span>Switch to</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">
                {targetLanguageInfo?.nativeName || 'English'}
              </span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-medium">
                {sourceLanguageInfo?.nativeName || 'English'}
              </span>
            </div>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Button>
        </Link>
      </div>

      {/* 相关语言推荐 */}
      {showRelatedLanguages && relatedLanguages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Globe className="h-4 w-4" />
            <span>Try other languages</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {relatedLanguages.map((language) => {
              const toEnglishUrl = `/${language.slug}-to-english`
              const fromEnglishUrl = `/english-to-${language.slug}`

              return (
                <div key={language.code} className="space-y-1">
                  {/* 小语种→英文 */}
                  <Link href={toEnglishUrl}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2 hover:bg-gray-50"
                    >
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>{language.nativeName}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span>English</span>
                        </div>
                      </div>
                    </Button>
                  </Link>

                  {/* 英文→小语种 */}
                  <Link href={fromEnglishUrl}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2 hover:bg-gray-50"
                    >
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>English</span>
                          <ArrowRight className="h-3 w-3" />
                          <span>{language.nativeName}</span>
                        </div>
                      </div>
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 其他翻译工具链接 */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-4 text-sm">
          <Link
            href="/text-translate"
            className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Text Translator
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/document-translate"
            className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Document Translator
          </Link>
        </div>
      </div>
    </div>
  )
}

// Hook for navigation utilities
export function useBidirectionalNavigation() {
  const router = useRouter()

  const navigateToLanguagePair = React.useCallback(
    (sourceLang: string, targetLang: string) => {
      let url = ''

      if (targetLang === 'en') {
        // 小语种→英文
        const sourceInfo = APP_CONFIG.languages.supported.find(
          (lang) => lang.code === sourceLang
        )
        url = sourceInfo ? `/${sourceInfo.slug}-to-english` : '/text-translate'
      } else if (sourceLang === 'en') {
        // 英文→小语种
        const targetInfo = APP_CONFIG.languages.supported.find(
          (lang) => lang.code === targetLang
        )
        url = targetInfo ? `/english-to-${targetInfo.slug}` : '/text-translate'
      } else {
        // 其他情况，使用通用翻译页面
        url = '/text-translate'
      }

      router.push(url)
    },
    [router]
  )

  const getLanguagePairUrl = React.useCallback(
    (sourceLang: string, targetLang: string) => {
      if (targetLang === 'en') {
        const sourceInfo = APP_CONFIG.languages.supported.find(
          (lang) => lang.code === sourceLang
        )
        return sourceInfo
          ? `/${sourceInfo.slug}-to-english`
          : '/text-translate'
      } else if (sourceLang === 'en') {
        const targetInfo = APP_CONFIG.languages.supported.find(
          (lang) => lang.code === targetLang
        )
        return targetInfo
          ? `/english-to-${targetInfo.slug}`
          : '/text-translate'
      } else {
        return '/text-translate'
      }
    },
    []
  )

  return {
    navigateToLanguagePair,
    getLanguagePairUrl,
  }
} 