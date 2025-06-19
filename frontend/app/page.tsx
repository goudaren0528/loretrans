import { Metadata } from 'next'
import { TranslationOptions } from '@/components/translation-options'
import { LanguageGrid } from '@/components/language-grid'
import { FeatureSection } from '@/components/feature-section'
import { FAQ } from '@/components/faq'
import { WebApplicationStructuredData, OrganizationStructuredData } from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'Transly - Translate Low-Resource Languages to English',
  description: 'Free AI-powered translation tool for 20+ low-resource languages. Translate Creole, Lao, Swahili, Burmese and more to English instantly.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Structured Data */}
      <WebApplicationStructuredData />
      <OrganizationStructuredData />
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                  Translate Low-Resource
                  <span className="text-primary"> Languages to English</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
                  Free AI-powered translation tool for 20+ low-resource languages. 
                  Translate Creole, Lao, Swahili, Burmese and more to English instantly.
                </p>
                <div className="mt-8 flex items-center justify-center lg:justify-start gap-x-6">
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
                    <span>20+ Languages</span>
                  </div>
                </div>
                <div className="mt-10 flex items-center justify-center lg:justify-start gap-4">
                  <a
                    href="/text-translate"
                    className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Start Translating
                  </a>
                  <a
                    href="/document-translate"
                    className="inline-flex items-center rounded-md border border-gray-300 px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Upload Document
                  </a>
                </div>
              </div>
              
              {/* Hero Illustration */}
              <div className="flex justify-center lg:justify-end">
                <img 
                  src="/images/hero-illustration.svg" 
                  alt="AI Translation Platform Illustration" 
                  className="w-full max-w-md h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Translation Options */}
      <TranslationOptions />

      {/* Supported Languages */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Supported Languages
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Translate from these low-resource languages to English
              </p>
            </div>
            <LanguageGrid />
          </div>
        </div>
      </section>

      {/* Features */}
      <FeatureSection />

      {/* FAQ */}
      <FAQ />

      {/* CTA Section */}
      <section className="relative py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Start Translating Today
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of users who trust Transly for their translation needs
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <a
              href="/text-translate"
              className="inline-flex items-center rounded-md bg-white px-6 py-3 text-base font-medium text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
            >
              Try Now - It's Free
            </a>
            <a
              href="/document-translate"
              className="inline-flex items-center rounded-md border-2 border-white px-6 py-3 text-base font-medium text-white hover:bg-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
            >
              Translate Documents
            </a>
          </div>
        </div>
      </section>
    </div>
  )
} 