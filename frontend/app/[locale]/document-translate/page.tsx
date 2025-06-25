import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Upload, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language, AVAILABLE_LANGUAGES } from '../../../../config/app.config';
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
        <div className="text-center mt-8">
          <Button size="lg">{t('upload_button')}</Button>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-6">{t('supported_formats.title')}</h2>
        <div className="flex justify-center gap-4">
          <div className="bg-background border rounded-lg p-4 flex items-center gap-3">
            <FileText className="h-6 w-6 text-red-500" />
            <span>PDF</span>
          </div>
          <div className="bg-background border rounded-lg p-4 flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-500" />
            <span>DOCX</span>
          </div>
          <div className="bg-background border rounded-lg p-4 flex items-center gap-3">
            <FileText className="h-6 w-6 text-orange-500" />
            <span>PPTX</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-center mb-6">{t('supported_languages.title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {AVAILABLE_LANGUAGES.map((lang: Language) => (
            <Link href={`/${lang.slug}-to-english`} key={lang.code} className="group">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors flex justify-between items-center">
                <div>
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-sm text-muted-foreground">{lang.nativeName}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 