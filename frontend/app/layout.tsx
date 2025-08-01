import '@/lib/regenerator-polyfill'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { AuthProvider } from '@/components/auth/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import { GoogleAnalytics } from '@/components/analytics/google-analytics'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'LoReTrans - Free AI Low-Resource Language Translator',
    template: '%s',
  },
  description:
    'LoReTrans: Free AI translator for 20+ low-resource languages including Creole, Lao, Swahili, Burmese. Instant translation to English with advanced NLLB technology.',
  keywords: [
    'free translator',
    'AI translation',
    'low-resource languages',
    'English translation',
    'NLLB translator',
    'creole translator',
    'swahili translator',
    'burmese translator',
    'lao translator',
    'minority languages',
    'underrepresented languages',
    'neural machine translation',
    'multilingual AI',
    'language technology',
    'free translation tool',
  ],
  authors: [{ name: 'LoReTrans Team' }],
  creator: 'LoReTrans Team',
  publisher: 'LoReTrans',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://loretrans.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://loretrans.com',
    title: 'LoReTrans - Free AI Low-Resource Language Translator',
    description:
      'LoReTrans: Free AI translator for 20+ low-resource languages including Creole, Lao, Swahili, Burmese. Instant translation to English.',
    siteName: 'LoReTrans',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LoReTrans - AI Translation Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LoReTrans - Free AI Low-Resource Language Translator',
    description:
      'LoReTrans: Free AI translator for 20+ low-resource languages including Creole, Lao, Swahili, Burmese. Instant translation to English.',
    images: ['/images/og-image.png'],
    creator: '@LoReTransApp',
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
    google: 'google9879f9edb25bbe5e',
    yandex: 'your-yandex-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icon.svg', color: '#2563eb' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(inter.variable, 'scroll-smooth')} suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
        <script src="/polyfills-inline.js" defer></script>
        {/* Favicon configuration */}
        <link rel="icon" href="/favicon.ico" sizes="16x16 32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-512.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          'selection:bg-primary/20 selection:text-primary-foreground'
        )}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
