import { useTranslations } from 'next-intl'
import { Link } from '@/lib/navigation'

export default function LocaleNotFound() {
  const t = useTranslations('NotFound')
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('description')}
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {t('goHome')}
          </Link>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400">
              {t('contactSupport')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
