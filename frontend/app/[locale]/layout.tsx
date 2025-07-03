import type { Metadata } from 'next'
import { NextIntlClientProvider, createTranslator } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Providers } from '../providers';
import { Navigation, Footer } from '@/components/navigation';
import { Toaster } from '@/components/ui/toaster';
import { UserOnboarding } from '@/components/onboarding/user-onboarding';
import { FloatingFeedback } from '@/components/feedback/feedback-widget';

// This metadata can be removed if you have dynamic metadata in page.tsx
// or you can keep it as a fallback.
export const metadata: Metadata = {
  title: 'Transly International',
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
        <UserOnboarding />
        <FloatingFeedback />
      </Providers>
    </NextIntlClientProvider>
  )
}
