import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Upload, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { TranslationNavButtons } from '@/components/translation-nav-buttons';
import { Button } from '@/components/ui/button';
import { Language, AVAILABLE_LANGUAGES } from '../../../../config/app.config';
import { DocumentTranslator } from '@/components/document-translator';
import { GuestLimitGuard } from '@/components/guest-limit-guard';
import Link from 'next/link';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'DocumentTranslatePage.meta' });
  return {
    title: t('title'),
    description: t('description'),
    keywords: [
      'document translation',
      'PDF translator',
      'Word document translation',
      'PowerPoint translation',
      'AI document translator',
      'low-resource languages',
      'file translation',
      'upload and translate',
      'NLLB document translation'
    ],
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://loretrans.com/${locale}/document-translate`,
      siteName: 'Loretrans',
      images: [
        {
          url: '/images/og-document-translate.png',
          width: 1200,
          height: 630,
          alt: 'Document Translation - Loretrans',
        },
      ],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/images/og-document-translate.png'],
    },
    alternates: {
      canonical: `/${locale}/document-translate`,
      languages: {
        'en': '/en/document-translate',
        'es': '/es/traducir-documento',
        'fr': '/fr/traduire-document',
        'de': '/de/dokument-uebersetzen',
        'it': '/it/traduci-documento',
        'pt': '/pt/traduzir-documento',
        'ru': '/ru/perevesti-dokument',
        'ja': '/ja/document-honyaku',
        'ko': '/ko/document-beonyeok',
        'zh': '/zh/document-fanyi',
        'ar': '/ar/tarjamat-watheeqa',
        'hi': '/hi/dastavez-anuvad'
      }
    }
  };
}

export default async function DocumentTranslatePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'DocumentTranslatePage' });

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>
      </div>

      {/* 跳转到文本翻译的按钮 */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <TranslationNavButtons currentPage="document" locale={locale} />
        </div>
      </div>

      {/* 文档翻译器组件 - 包含未登录用户限制 */}
      <GuestLimitGuard showStatus={false}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <DocumentTranslator />
          </div>
        </div>
      </GuestLimitGuard>

      {/* 步骤说明 - How It Works */}
      <div className="mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple three-step process to translate your documents with AI precision
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('steps.step1.title')}</h3>
              <p className="text-muted-foreground">{t('steps.step1.description')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('steps.step2.title')}</h3>
              <p className="text-muted-foreground">{t('steps.step2.description')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('steps.step3.title')}</h3>
              <p className="text-muted-foreground">{t('steps.step3.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 支持的语言 */}
      <div className="mt-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">{t('languages.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {AVAILABLE_LANGUAGES.map((lang: Language) => (
              <div key={lang.code} className="text-center p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="font-medium text-sm">{lang.name}</div>
                <div className="text-xs text-muted-foreground">{lang.nativeName}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 mb-16">
        <div className="container mx-auto px-4">
          <div className="text-center bg-primary/5 rounded-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${locale}/text-translate`}>
                <Button size="lg" className="w-full sm:w-auto">
                  {t('cta.try_text_translation')}
                </Button>
              </Link>
              <Link href={`/${locale}/pricing`}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t('cta.view_pricing')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}