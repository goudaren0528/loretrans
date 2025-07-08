import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Admin' })
  
  return {
    title: t('dashboard.title'),
    description: t('dashboard.description'),
    robots: 'noindex, nofollow' // 管理页面不应被搜索引擎索引
  }
}

export default async function AdminPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'Admin' })
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.title')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('dashboard.description')}
        </p>
      </div>
      
      <AdminDashboard />
    </div>
  )
}
