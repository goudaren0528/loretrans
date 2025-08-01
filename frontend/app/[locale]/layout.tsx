import '@/lib/regenerator-polyfill'
import type { Metadata } from 'next'
import { NextIntlClientProvider, createTranslator } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Providers } from '../providers';
import { Navigation, Footer } from '@/components/navigation';
import { Toaster } from '@/components/ui/toaster';
// import { UserOnboarding } from '@/components/onboarding/user-onboarding'; // Temporarily disabled
import { FloatingFeedback } from '@/components/feedback/feedback-widget-multilingual';
import { locales, type Locale } from '@/lib/navigation';
import { headers } from 'next/headers';

// Generate metadata with proper hreflang and canonical URLs
export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const headersList = headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;
  
  // For production, use the correct domain
  const productionBaseUrl = 'https://loretrans.com';
  const canonicalBaseUrl = host.includes('localhost') ? productionBaseUrl : baseUrl;
  
  // Generate alternate language URLs
  const alternates: Record<string, string> = {};
  locales.forEach(loc => {
    alternates[loc] = `${canonicalBaseUrl}/${loc}`;
  });

  return {
    title: 'LoReTrans - Free AI Low-Resource Language Translator',
    description: 'LoReTrans: Free AI translator for 20+ low-resource languages including Creole, Lao, Swahili, Burmese. Instant translation to English with advanced NLLB technology.',
    alternates: {
      canonical: locale === 'en' ? canonicalBaseUrl : `${canonicalBaseUrl}/${locale}`,
      languages: alternates
    },
    openGraph: {
      title: 'LoReTrans - Free AI Low-Resource Language Translator',
      description: 'LoReTrans: Free AI translator for 20+ low-resource languages including Creole, Lao, Swahili, Burmese. Instant translation to English.',
      url: locale === 'en' ? canonicalBaseUrl : `${canonicalBaseUrl}/${locale}`,
      siteName: 'LoReTrans',
      locale: locale,
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  console.log(`[Layout] Rendering for locale: ${locale}`);

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>
        <div className="relative flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
        {/* <UserOnboarding /> */} {/* Temporarily disabled - users go directly to homepage after signup */}
        <FloatingFeedback />
      </Providers>
    </NextIntlClientProvider>
  )
}
