import { PricingPageClient } from './client';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'PricingPage.meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/pricing`,
      languages: {
        'en': '/en/pricing',
        'es': '/es/precios',
        'fr': '/fr/tarifs',
      },
    }
  };
}

export default function PricingPage() {
  return <PricingPageClient />;
}
