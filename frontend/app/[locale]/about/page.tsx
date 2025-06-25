import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { CheckCircle, Globe, Zap, Shield, Heart, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { APP_CONFIG } from '../../../../config/app.config';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'AboutPage.meta' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/about`,
      languages: {
        'en': '/en/about',
        'es': '/es/sobre-nosotros',
        'fr': '/fr/a-propos',
      },
    }
  };
}

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'AboutPage' });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('hero.title')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('hero.description')}
        </p>
      </div>

      {/* Mission Section */}
      <div className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">{t('mission.title')}</h2>
            <p className="text-lg text-muted-foreground mb-6">
              {t('mission.p1')}
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              {t('mission.p2')}
            </p>
            <Link href="/document-translate">
              <Button size="lg">
                {t('mission.cta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Globe className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('features.accessibility.title')}</h3>
                <p className="text-muted-foreground">
                  {t('features.accessibility.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Zap className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('features.accuracy.title')}</h3>
                <p className="text-muted-foreground">
                  {t('features.accuracy.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('features.privacy.title')}</h3>
                <p className="text-muted-foreground">
                  {t('features.privacy.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Languages */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{t('supported_languages.title')}</h2>
          <p className="text-lg text-muted-foreground">
            {t('supported_languages.description', {count: APP_CONFIG.languages.supported.length})}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {APP_CONFIG.languages.supported.map((language: { code: string; name: string; nativeName: string }) => (
            <div
              key={language.code}
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">{language.name}</div>
                <div className="text-sm text-muted-foreground">
                  {language.nativeName}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            {t('supported_languages.request_cta_description')}
          </p>
          <Button variant="outline">{t('supported_languages.request_cta')}</Button>
        </div>
      </div>

      {/* Technology Section */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{t('technology.title')}</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('technology.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{t('technology.cultural_preservation.title')}</h3>
            <p className="text-muted-foreground">
              {t('technology.cultural_preservation.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{t('technology.community_driven.title')}</h3>
            <p className="text-muted-foreground">
              {t('technology.community_driven.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{t('technology.continuous_improvement.title')}</h3>
            <p className="text-muted-foreground">
              {t('technology.continuous_improvement.description')}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{t('faq.title')}</h2>
        </div>

        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">
              {t('faq.q1_title')}
            </h3>
            <p className="text-muted-foreground">
              {t('faq.q1_answer')}
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">
              {t('faq.q2_title')}
            </h3>
            <p className="text-muted-foreground">
              {t('faq.q2_answer')}
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">
              {t('faq.q3_title')}
            </h3>
            <p className="text-muted-foreground">
              {t('faq.q3_answer')}
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">
              {t('faq.q4_title')}
            </h3>
            <p className="text-muted-foreground">
              {t('faq.q4_answer')}
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">
              {t('faq.q5_title')}
            </h3>
            <p className="text-muted-foreground">
              {t('faq.q5_answer')}
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">
              {t('faq.q6_title')}
            </h3>
            <p className="text-muted-foreground">
              {t('faq.q6_answer')}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">{t('cta_section.title')}</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          {t('cta_section.description')}
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/text-translate">
            <Button>{t('cta_section.primary_cta')}</Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline">{t('cta_section.secondary_cta')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 