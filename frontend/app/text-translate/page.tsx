import { Metadata } from 'next'
import { TranslatorWidget } from '@/components/translator-widget'
import { FAQ } from '@/components/faq'
import { WebApplicationStructuredData } from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'Text Translator - Free AI Translation Tool | Transly',
  description: 'Free online text translator for 20+ low-resource languages. Translate Creole, Lao, Swahili, Burmese and more to English instantly with AI.',
  keywords: 'text translator, language translation, AI translator, free translation, online translator',
  openGraph: {
    title: 'Text Translator - Free AI Translation Tool | Transly',
    description: 'Free online text translator for 20+ low-resource languages. Translate instantly with AI.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Text Translator - Free AI Translation Tool | Transly',
    description: 'Free online text translator for 20+ low-resource languages. Translate instantly with AI.',
  },
  alternates: {
    canonical: '/text-translate',
  },
}

export default function TextTranslatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Structured Data */}
      <WebApplicationStructuredData />

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Free Text Translator
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Translate text between 20+ low-resource languages and English using advanced AI. 
              Fast, accurate, and completely free.
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-2 w-2 rounded-full bg-green-500"></div>
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-2 w-2 rounded-full bg-blue-500"></div>
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-2 w-2 rounded-full bg-purple-500"></div>
                <span>Instant Results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Translator Widget */}
      <section className="relative py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <TranslatorWidget />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose Our Text Translator?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-600">Get instant translations powered by advanced AI models. No waiting, no delays.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">High Accuracy</h3>
                <p className="text-gray-600">Powered by Meta's NLLB model, ensuring high-quality translations for all supported languages.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Always Free</h3>
                <p className="text-gray-600">No hidden fees, no limits, no registration required. Translate as much as you need.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="relative py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              How to Use the Text Translator
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-2">Select Languages</h3>
                <p className="text-gray-600">Choose your source language and target language (English) from the dropdown menus.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-2">Enter Text</h3>
                <p className="text-gray-600">Type or paste your text in the input box. Up to 1000 characters supported.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-2">Get Translation</h3>
                <p className="text-gray-600">Click translate and instantly get your result. Copy or listen to the translation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Languages Preview */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Supported Languages
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              We support translation from these languages to English:
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                'Haitian Creole', 'Lao', 'Swahili', 'Burmese', 'Telugu',
                'Bengali', 'Nepali', 'Sinhala', 'Khmer', 'Mongolian'
              ].map((lang) => (
                <span 
                  key={lang}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {lang}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              And many more low-resource languages...
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <section className="relative py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Need to Translate Documents?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Try our document translation service for PDF, Word, and PowerPoint files
          </p>
          <div className="mt-8">
            <a
              href="/document-translate"
              className="inline-flex items-center rounded-md bg-white px-6 py-3 text-base font-medium text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
            >
              Translate Documents
            </a>
          </div>
        </div>
      </section>
    </div>
  )
} 