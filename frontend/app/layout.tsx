import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Navigation, Footer } from '@/components/navigation'
import { Providers } from './providers'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Transly - Translate Low-Resource Languages to English',
    template: '%s | Transly',
  },
  description: 'Free AI-powered translation tool for 20+ low-resource languages. Translate Creole, Lao, Swahili, Burmese and more to English instantly.',
  keywords: [
    'translation',
    'AI',
    'low-resource languages',
    'English',
    'NLLB',
    'creole translator',
    'swahili translator',
    'burmese translator',
    'lao translator',
  ],
  authors: [{ name: 'Transly Team' }],
  creator: 'Transly Team',
  publisher: 'Transly',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://transly.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://transly.app',
    title: 'Transly - Translate Low-Resource Languages to English',
    description: 'Free AI-powered translation tool for 20+ low-resource languages.',
    siteName: 'Transly',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Transly - AI Translation Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transly - Translate Low-Resource Languages to English',
    description: 'Free AI-powered translation tool for 20+ low-resource languages.',
    images: ['/images/og-image.png'],
    creator: '@TranslyApp',
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(inter.variable, 'scroll-smooth')}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body 
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          'selection:bg-primary/20 selection:text-primary-foreground'
        )}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
} 