import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Upload, FileText, CheckCircle, ArrowRight } from 'lucide-react';
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
    alternates: {
      canonical: `/${locale}/document-translate`,
      languages: {
        'en': '/en/document-translate',
        'es': '/es/traducir-documento',
        'fr': '/fr/traduire-document',
      },
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('description')}
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
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

      {/* 文档翻译器组件 - 包含未登录用户限制 */}
      <GuestLimitGuard showStatus={false}>
        <DocumentTranslator />
      </GuestLimitGuard>

      {/* 支持的语言 */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">{t('languages.title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {AVAILABLE_LANGUAGES.map((lang: Language) => (
            <div key={lang.code} className="text-center p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="font-medium text-sm">{lang.name}</div>
              <div className="text-xs text-muted-foreground">{lang.nativeName}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center bg-primary/5 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">{t('cta.title')}</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          {t('cta.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href={`/${locale}/text-translate`} className="flex items-center gap-2">
              {t('cta.try_text_translation')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href={`/${locale}/pricing`}>
              {t('cta.view_pricing')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
