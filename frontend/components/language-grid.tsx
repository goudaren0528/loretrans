'use client'

import React from 'react'
import { APP_CONFIG } from '../../config/app.config'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface LanguageGridProps {
  currentLanguage?: string
}

export function LanguageGrid({ currentLanguage }: LanguageGridProps = {}) {
  const supportedLanguages = APP_CONFIG.languages.supported.filter(
    lang => lang.code !== currentLanguage
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {supportedLanguages.map((language) => (
        <div
          key={language.code}
          className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:scale-105"
        >
          <div className="flex flex-col items-center text-center">
            <h3 className="font-semibold text-foreground">{language.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{language.nativeName}</p>
            <Link href={`/${language.slug}-to-english`}>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Try {language.name}
              </Button>
            </Link>
          </div>
          
          {/* 装饰性元素 */}
          <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary/20"></div>
        </div>
      ))}
    </div>
  )
} 