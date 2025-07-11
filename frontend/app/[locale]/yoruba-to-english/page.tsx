import React from 'react'
import { Metadata } from 'next'
import { EnhancedTextTranslator } from '@/components/translation/enhanced-text-translator'
import { StructuredData } from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'Yoruba to English Translation - Free AI Translator | Loretrans',
  description: 'Translate Yoruba (Yorùbá) to English instantly with our AI-powered translator. Convert Yorùbá text to English with high accuracy. Support for long texts up to 5,000 characters.',
  keywords: ['Yoruba to English translation', 'Yoruba to English', 'Yoruba to English translator', 'free Yoruba to English translation', 'Yoruba English converter', 'queue translation'],
  openGraph: {
    title: 'Yoruba to English Translation - Free AI Translator',
    description: 'Translate Yoruba (Yorùbá) to English instantly with our AI-powered translator. Convert Yorùbá text to English with high accuracy. Support for long texts and queue processing.',
    url: 'https://loretrans.com/yoruba-to-english',
    siteName: 'Loretrans',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yoruba to English Translation - Free AI Translator',
    description: 'Translate Yoruba (Yorùbá) to English instantly with our AI-powered translator. Convert Yorùbá text to English with high accuracy. Support for long texts and queue processing.',
  },
  alternates: {
    canonical: 'https://loretrans.com/yoruba-to-english',
  },
}

const yorubaToenglishFAQs = [
  {
    question: "How accurate is the Yoruba to English translation?",
    answer: "Our AI-powered translator provides high-accuracy Yoruba to English translations using advanced NLLB (No Language Left Behind) technology. While very reliable for most content, we recommend human review for critical documents."
  },
  {
    question: "Can I translate English text back to Yoruba?",
    answer: "Yes! Our translator supports bidirectional translation. You can easily switch between Yoruba-to-English and English-to-Yoruba translation using the swap button."
  },
  {
    question: "Is the Yoruba to English translator free to use?",
    answer: "Yes, our Yoruba to English translation service is completely free. Short texts translate instantly, while longer texts use our queue system for registered users."
  },
  {
    question: "How long can the text be for Yoruba to English translation?",
    answer: "You can translate up to 5,000 characters at once. For texts over 1,000 characters, you'll need to sign in for queue processing. Shorter texts are translated instantly."
  },
  {
    question: "Do I need to create an account to translate long texts?",
    answer: "For texts over 1,000 characters, yes. Creating a free account allows you to use our queue system for longer translations and access your translation history."
  }
];

const features = [
  {
    title: "AI-Powered Translation",
    description: "Advanced NLLB technology for accurate Yoruba to English translation",
    icon: "🤖"
  },
  {
    title: "Bidirectional Support", 
    description: "Seamlessly switch between Yoruba-to-English and English-to-Yoruba translation",
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
    description: "Keep track of all your translations with searchable history",
    icon: "📚"
  },
  {
    title: "Free Service",
    description: "Completely free translation service with no hidden costs",
    icon: "💝"
  }
];

export default function YorubaToEnglishPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Structured Data */}
      <StructuredData 
        type="WebApplication"
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Yoruba to English Translator",
          "description": "Free AI-powered Yoruba to English translation tool with queue processing and translation history",
          "url": "https://loretrans.com/yoruba-to-english",
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
                Yoruba to English
                <span className="block text-blue-600">AI Translator</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Translate Yoruba (Yorùbá) to English instantly with our AI-powered translator. Convert Yorùbá text to English with high accuracy.
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
            defaultSourceLang="yo"
            defaultTargetLang="en"
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
                Professional-grade Yoruba to English translation with modern features
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="relative group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Yoruba Language */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                About Yoruba Language
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Learn more about the Yoruba language and our translation capabilities
              </p>
            </div>
            
            <div className="prose prose-lg mx-auto text-gray-600">
              <p>
                Yoruba (Yorùbá) is a fascinating language with rich cultural heritage. 
                Our AI translator specializes in providing accurate translations between Yoruba and English, 
                helping bridge communication gaps and preserve linguistic diversity.
              </p>
              <p>
                Whether you're translating documents, communicating with Yoruba speakers, or learning the language, 
                our advanced NLLB technology ensures high-quality translations that respect the nuances and context of both languages.
              </p>
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
                Everything you need to know about our Yoruba to English translator
              </p>
            </div>
            
            <div className="space-y-8">
              {yorubaToenglishFAQs.map((faq, index) => (
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