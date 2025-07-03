import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PaymentSuccess } from '@/components/billing/payment-success';
import { PaymentTestTools } from '@/components/billing/payment-test-tools';
import { Suspense } from 'react';

interface DashboardPageProps {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: DashboardPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Dashboard' });
  
  return {
    title: t('title', { defaultValue: 'Dashboard' }),
    description: t('description', { defaultValue: 'Manage your account and view your translation credits' }),
  };
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Dashboard' });
  
  // 检查是否是支付成功页面
  const isPurchaseSuccess = searchParams.purchase === 'success';

  if (isPurchaseSuccess) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <PaymentSuccess />
      </Suspense>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t('title', { defaultValue: 'Dashboard' })}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {t('subtitle', { defaultValue: 'Manage your account and translation credits' })}
        </p>
      </div>

      <div className="space-y-8">
        {/* Payment Test Tools (Development Only) */}
        <PaymentTestTools />

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Credit Balance Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('creditBalance', { defaultValue: 'Credit Balance' })}
            </h3>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              0
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('creditsAvailable', { defaultValue: 'Credits available for translation' })}
            </p>
          </div>

          {/* Usage Stats Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('usageStats', { defaultValue: 'Usage This Month' })}
            </h3>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              0
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('creditsUsed', { defaultValue: 'Credits used' })}
            </p>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('quickActions', { defaultValue: 'Quick Actions' })}
            </h3>
            <div className="space-y-2">
              <a
                href="/text-translate"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                {t('startTranslating', { defaultValue: 'Start Translating' })}
              </a>
              <a
                href="/payments"
                className="block w-full text-center border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 py-2 px-4 rounded-md transition-colors"
              >
                {t('buyCredits', { defaultValue: 'Buy Credits' })}
              </a>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('recentActivity', { defaultValue: 'Recent Activity' })}
          </h3>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('noActivity', { defaultValue: 'No recent activity to display' })}
          </div>
        </div>
      </div>
    </div>
  );
}
