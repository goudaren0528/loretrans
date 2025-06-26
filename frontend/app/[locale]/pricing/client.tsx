'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PricingTable } from '@/components/billing/pricing-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslations } from 'next-intl';

function PurchaseStatusAlert() {
  const searchParams = useSearchParams();
  const purchaseStatus = searchParams.get('purchase');
  const t = useTranslations('PricingPage.alert');

  if (purchaseStatus === 'canceled') {
    return (
      <Alert variant="destructive" className="mb-8 max-w-4xl mx-auto">
        <AlertTitle>{t('canceled_title')}</AlertTitle>
        <AlertDescription>
          {t('canceled_description')}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

export function PricingPageClient() {
  const t = useTranslations('PricingPage');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto py-16 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
            {t('hero.description')}
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-2 w-2 rounded-full bg-green-500"></div>
              <span>No Hidden Fees</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-2 w-2 rounded-full bg-blue-500"></div>
              <span>Credits Never Expire</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-2 w-2 rounded-full bg-purple-500"></div>
              <span>Instant Access</span>
            </div>
          </div>
        </div>
        
        {/* Suspense is required for useSearchParams in a Server Component page */}
        <Suspense fallback={<div className="text-center">{t('loading')}</div>}>
          <PurchaseStatusAlert />
        </Suspense>
        
        <PricingTable />
      </div>
    </div>
  );
}
