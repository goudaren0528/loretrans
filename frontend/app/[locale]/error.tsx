'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/navigation'

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('Error')
  
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Locale error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('description')}
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
              <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                {t('errorDetails')}
              </summary>
              <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>
          )}
        </div>
        
        <div className="space-y-4">
          <button
            onClick={reset}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {t('tryAgain')}
          </button>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
              {t('goHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
