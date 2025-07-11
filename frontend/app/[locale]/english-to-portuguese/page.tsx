import React from 'react'
import { Metadata } from 'next'
import { EnhancedTextTranslator } from '@/components/translation/enhanced-text-translator'
import { StructuredData } from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'English to Portuguese Translation - Free AI Translator | Loretrans',
  description: 'Translate English to Portuguese (Português) instantly with our AI-powered translator. Convert Português text to English with high accuracy. Support for long texts up to 5,000 characters.',
  keywords: ['English to Portuguese translation', 'English to Português', 'English to Portuguese translator', 'free English to Portuguese translation', 'English Portuguese converter', 'queue translation'],
  openGraph: {
    title: 'English to Portuguese Translation - Free AI Translator',
    description: 'Translate English to Portuguese (Português) instantly with AI. Support for long texts and queue processing.',
    url: 'https://loretrans.com/english-to-portuguese',
    siteName: 'Loretrans',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'English to Portuguese Translation - Free AI Translator',
    description: 'Translate English to Portuguese (Português) instantly with AI. Support for long texts and queue processing.',
  },
  alternates: {
    canonical: 'https://loretrans.com/english-to-portuguese',
  },
}

const englishtoportugueseFAQs = [
  {
    question: "How accurate is the English to Portuguese translation?",
    answer: "Our AI-powered translator provides high-accuracy English to Portuguese translations using advanced NLLB (No Language Left Behind) technology. While very reliable for most content, we recommend human review for critical documents."
  },
  {
    question: "Can I translate Portuguese text back to English?",
    answer: "Yes! Our translator supports bidirectional translation. You can easily switch between English-to-Portuguese and Portuguese-to-English translation using the swap button."
  },
  {
    question: "Is the English to Portuguese translator free to use?",
    answer: "Yes, our English to Portuguese translation service is completely free. Short texts translate instantly, while longer texts use our queue system for registered users."
  },
  {
    question: "How long can the text be for English to Portuguese translation?",
    answer: "You can translate up to 5,000 characters at once. For texts over 1,000 characters, you'll need to sign in for queue processing. Shorter texts are translated instantly."
  },
  {
    question: "Do I need to create an account to translate long texts?",
    answer: "For texts over 1,000 characters, yes. Creating a free account allows you to use our queue system for longer translations and access your translation history."
  },
  {
    question: "Does the translator support Portuguese script properly?",
    answer: "Yes, our translator fully supports the Haitian Creole script (Português) and handles the unique characteristics of the Portuguese writing system, including proper character encoding and text direction."
  },
  {
    question: "Can I use this for business English to Portuguese translation?",
    answer: "Yes, our translator is suitable for business use. However, for critical business documents, we recommend having translations reviewed by a professional translator to ensure accuracy and cultural appropriateness."
  },
  {
    question: "What is queue processing for long texts?",
    answer: "Queue processing allows you to translate long texts (1,000+ characters) in the background. You can submit your text and return later to check the results, with full translation history tracking."
  }
]

const features = [
  {
    title: "AI-Powered Translation",
    description: "Advanced NLLB technology ensures accurate English to Portuguese translations with cultural context",
    icon: "🤖"
  },
  {
    title: "Bidirectional Support",
    description: "Seamlessly switch between English-to-Portuguese and Portuguese-to-English translation",
    icon: "🔄"
  },
  {
    title: "Long Text Support",
    description: "Handle texts up to 5,000 characters with intelligent queue processing",
    icon: "📄"
  },
  {
    title: "Queue Processing",
    description: "Background processing for long texts with progress tracking and history",
    icon: "⚡"
  },
  {
    title: "Translation History",
    description: "Keep track of your translations with comprehensive task management",
    icon: "📝"
  },
  {
    title: "Instant & Queue Modes",
    description: "Short texts translate instantly, longer texts use smart queue processing",
    icon: "🚀"
  }
]

export default function EnglishToPortuguesePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Structured Data */}
      <StructuredData 
        type="WebApplication"
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "English to Portuguese Translator",
          "description": "Free AI-powered English to Portuguese translation tool with queue processing and translation history",
          "url": "https://loretrans.com/english-to-portuguese",
          "applicationCategory": "TranslationApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250"
          }
        }}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                English to Portuguese
                <span className="block text-blue-600">AI Translator</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Translate English to Portuguese (Português) instantly with our advanced AI translator. 
                Support for long texts, queue processing, and translation history.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Free to use
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Up to 5,000 characters
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Queue processing
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Translation history
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Translation Tool */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <EnhancedTextTranslator
            defaultSourceLang="en"
            defaultTargetLang="pt"
            className="max-w-6xl mx-auto"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Advanced Translation Features
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Professional-grade English to Portuguese translation with modern features
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  About the Portuguese Language
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    English is a widely spoken language with rich cultural heritage and linguistic features.
                    Our AI translator respects these linguistic characteristics to provide accurate English to Portuguese translations.
                  </p>
                  <p>
                    Whether you're translating English documents to Portuguese, communicating with Portuguese speakers, or learning languages, 
                    our enhanced translator helps bridge the language gap with cultural sensitivity and linguistic accuracy.
                  </p>
                  <p>
                    With support for long texts up to 5,000 characters and intelligent queue processing, you can handle everything 
                    from short messages to lengthy documents with ease.
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Language Info</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium">Portuguese</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Native Name:</span>
                      <span className="font-medium">Português</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Code:</span>
                      <span className="font-medium">pt</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Length:</span>
                      <span className="font-medium">5,000 chars</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Everything you need to know about our English to Portuguese translator
              </p>
            </div>
            
            <div className="space-y-8">
              {englishtoportugueseFAQs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
