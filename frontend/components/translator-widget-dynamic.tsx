'use client'

import dynamic from 'next/dynamic'

const TranslatorWidget = dynamic(
  () => import('./translator-widget').then((mod) => ({ default: mod.TranslatorWidget })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-4xl mx-auto">
        <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default TranslatorWidget