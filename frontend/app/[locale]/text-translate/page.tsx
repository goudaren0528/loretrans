import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { TextTranslateClient } from './text-translate-client'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'TextTranslatePage.meta' });
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: [
      'free text translation',
      'AI translator',
      'low-resource languages',
      'Creole translator',
      'Lao translator',
      'Swahili translator',
      'Burmese translator',
      'online translation tool',
      'NLLB translation',
      'text to English translation'
    ],
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://loretrans.com/${locale}/text-translate`,
      type: 'website',
      images: ['/images/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/images/og-image.png'],
    },
    alternates: {
      canonical: `/${locale}/text-translate`,
      languages: {
        'en': '/en/text-translate',
        'es': '/es/traducir-texto',
        'fr': '/fr/traduire-texte',
      },
    },
  };
}

export default function TextTranslatePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return <TextTranslateClient locale={locale} />;
}
