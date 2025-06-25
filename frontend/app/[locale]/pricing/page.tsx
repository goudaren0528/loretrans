import { PricingPageClient } from './client';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'PricingPage.meta' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function PricingPage() {
  return <PricingPageClient />;
}
