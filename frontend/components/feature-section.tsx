'use client'

import React from 'react'
import { Zap, Shield, Globe, Volume2, FileText, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

type FeatureName =
  | 'ai_powered'
  | 'fast'
  | 'privacy'
  | 'languages'
  | 'tts'
  | 'documents'

const featureIcons: Record<FeatureName, React.ElementType> = {
  ai_powered: Sparkles,
  fast: Zap,
  privacy: Shield,
  languages: Globe,
  tts: Volume2,
  documents: FileText,
}

export function FeatureSection() {
  const t = useTranslations('IndexPage.feature_section')

  const features: FeatureName[] = ['ai_powered', 'fast', 'privacy', 'languages', 'tts', 'documents']

  return (
    <section className="relative py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t('description')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const IconComponent = featureIcons[feature]
              return (
                <div
                  key={feature}
                  className="relative group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconComponent className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold text-gray-900">
                      {t(`features.${feature}.name`)}
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    {t(`features.${feature}.description`)}
                  </p>
                  <div className="absolute top-0 right-0 h-2 w-16 bg-gradient-to-r from-primary/20 to-transparent rounded-bl-lg" />
                </div>
              )
            })}
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">20+</div>
              <div className="text-sm text-gray-600 mt-1">{t('stats.languages')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-gray-600 mt-1">{t('stats.free')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-gray-600 mt-1">{t('stats.characters')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-gray-600 mt-1">{t('stats.availability')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
