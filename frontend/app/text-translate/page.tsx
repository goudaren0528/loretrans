import { Metadata } from 'next'
import { TranslatorWidget } from '@/components/translator-widget'
import { LanguageGrid } from '@/components/language-grid'
import { FAQ } from '@/components/faq'
import {
  WebApplicationStructuredData,
  TranslationServiceStructuredData,
} from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'Text Translator - Free AI Translation Tool | Transly',
  description:
    'Free online text translator for 20+ low-resource languages. Translate between English and Creole, Lao, Swahili, Burmese, Telugu and more with AI.',
  keywords: [
    'text translator',
    'online translator',
    'free translation',
    'AI translator',
    'language translator',
    'multilingual translation',
  ],
  alternates: {
    canonical: '/text-translate',
  },
}

export default function TextTranslatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Structured Data */}
      <WebApplicationStructuredData />
      <TranslationServiceStructuredData 
        sourceLanguage="Multiple Languages" 
        targetLanguage="English" 
      />

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Free Text Translator
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
                Translate text between English and 20+ low-resource languages using advanced AI technology.
                Get instant, accurate translations for free.
              </p>
              <div className="mt-8 flex items-center justify-center gap-x-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-2 w-2 rounded-full bg-green-500"></div>
                  <span>100% Free</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>Instant Results</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-2 w-2 rounded-full bg-purple-500"></div>
                  <span>20+ Languages</span>
                </div>
              </div>
            </div>

            {/* Translation Widget */}
            <div className="max-w-4xl mx-auto">
              <TranslatorWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Supported Languages */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Supported Languages
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Translate between these languages and English
              </p>
            </div>
            <LanguageGrid />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Use Our Text Translator?</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered translator specializes in low-resource languages often overlooked by mainstream services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Get instant translations powered by advanced AI models trained specifically for accuracy.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-3">High Accuracy</h3>
              <p className="text-muted-foreground">
                Using Meta's NLLB model, we provide superior translation quality for underserved languages.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-3">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your text is processed securely and not stored. Privacy and security are our top priorities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* CTA Section */}
      <section className="relative py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Translate?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of users who trust Transly for accurate translations
          </p>
          <div className="mt-8">
            <a
              href="#translator"
              className="inline-flex items-center rounded-md bg-white px-6 py-3 text-base font-medium text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
            >
              Start Translating Now
            </a>
          </div>
        </div>
      </section>
    </div>
  )
} 