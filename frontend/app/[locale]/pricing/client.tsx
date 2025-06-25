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
      <Alert variant="destructive" className="mb-8">
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
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {t('hero.title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('hero.description')}
        </p>
      </div>
      
      {/* Suspense is required for useSearchParams in a Server Component page */}
      <Suspense fallback={<div>{t('loading')}</div>}>
        <PurchaseStatusAlert />
      </Suspense>
      
      <PricingTable />
    </div>
  );
}
