'use client'

import React from 'react'
import { APP_CONFIG } from '../../config/app.config'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface LanguageGridProps {
  currentLanguage?: string
  showComingSoon?: boolean
}

export function LanguageGrid({
  currentLanguage,
  showComingSoon = true,
}: LanguageGridProps = {}) {
  const supportedLanguages = APP_CONFIG.languages.supported.filter(
    (lang) => lang.code !== currentLanguage
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {supportedLanguages.map((language) => {
        const isAvailable = language.available
        const cardClassName = `group relative overflow-hidden rounded-lg border bg-card p-4 transition-all ${
          isAvailable
            ? 'hover:shadow-md hover:scale-105 cursor-pointer'
            : 'opacity-70 cursor-not-allowed'
        }`

        if (isAvailable) {
          return (
            <Link
              key={language.code}
              href={`/${language.slug}-to-english` as any}
              className={cardClassName}
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">
                    {language.name}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {language.nativeName}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Try {language.name}
                </Button>
              </div>

              {/* 状态指示器 */}
              <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-green-500"></div>
            </Link>
          )
        } else {
          return (
            <div key={language.code} className={cardClassName}>
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">
                    {language.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {language.nativeName}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  disabled
                >
                  Coming Soon
                </Button>
              </div>

              {/* 状态指示器 */}
              <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-yellow-500"></div>
            </div>
          )
        }
      })}
    </div>
  )
} 