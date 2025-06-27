import { Metadata } from 'next'
import { PricingPage } from '@/components/billing/pricing-page'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'pricing' })
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    keywords: [
      'translation pricing',
      'AI translation cost',
      'credit packages',
      'translation credits',
      'low-resource languages',
      'NLLB pricing'
    ],
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.title'),
      description: t('meta.description'),
    },
  }
}

export default function Pricing({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return <PricingPage />
}
