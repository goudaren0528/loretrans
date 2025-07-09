import React from 'react'
import { Metadata } from 'next'
import { BidirectionalTranslator } from '@/components/bidirectional-translator'
import { StructuredData } from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'Telugu to English Translation - Free AI Translator | Loretrans',
  description: 'Translate Telugu (తెలుగు) to English instantly with our AI-powered translator. Convert తెలుగు text to English with high accuracy. Free online translation tool.',
  keywords: ['Telugu to English translation', 'తెలుగు to English', 'Telugu translator', 'free Telugu translation', 'Telugu English converter'],
  openGraph: {
    title: 'Telugu to English Translation - Free AI Translator',
    description: 'Translate Telugu (తెలుగు) to English instantly with AI. Free, accurate, and easy to use.',
    url: 'https://loretrans.app/telugu-to-english',
    siteName: 'Loretrans',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Telugu to English Translation - Free AI Translator',
    description: 'Translate Telugu (తెలుగు) to English instantly with AI. Free, accurate, and easy to use.',
  },
  alternates: {
    canonical: 'https://loretrans.app/telugu-to-english',
  },
}

const teluguToEnglishFAQs = [
  {
    question: "How accurate is the Telugu to English translation?",
    answer: "Our AI-powered translator provides high-accuracy Telugu to English translations using advanced NLLB (No Language Left Behind) technology. While very reliable for most content, we recommend human review for critical documents."
  },
  {
    question: "Can I translate English text back to Telugu?",
    answer: "Yes! Our translator supports bidirectional translation. You can easily switch between Telugu-to-English and English-to-Telugu translation using the swap button."
  },
  {
    question: "Is the Telugu to English translator free to use?",
    answer: "Yes, our Telugu to English translation service is completely free with no registration required. Simply enter your Telugu text and get instant English translations."
  },
  {
    question: "What types of text can I translate from Telugu to English?",
    answer: "You can translate various types of Telugu content to English including documents, emails, websites, social media posts, and casual conversations. Our translator handles both formal and informal language styles."
  },
  {
    question: "Does the translator support Telugu script properly?",
    answer: "Yes, our translator fully supports the Telugu script (తెలుగు) and handles the unique characteristics of the Telugu writing system, including proper character encoding and text direction."
  },
  {
    question: "Can I use this for business Telugu to English translation?",
    answer: "Our translator works well for business communications, but for important business documents, legal texts, or official communications, we recommend having translations reviewed by a professional translator."
  }
]

const features = [
  {
    title: "AI-Powered Translation",
    description: "Advanced neural machine translation technology specifically trained for Telugu-English language pairs",
    icon: "🤖"
  },
  {
    title: "Telugu Script Support", 
    description: "Full support for Telugu script (తెలుగు) with proper character encoding and text rendering",
    icon: "త"
  },
  {
    title: "Bidirectional Translation",
    description: "Switch between Telugu-to-English and English-to-Telugu translation with one click",
    icon: "🔄"
  },
  {
    title: "Cultural Context",
    description: "Translations consider cultural nuances and context specific to Telugu language usage",
    icon: "🏛️"
  },
  {
    title: "Free & Fast",
    description: "Get instant Telugu to English translations at no cost, with results in seconds",
    icon: "⚡"
  },
  {
    title: "No Registration",
    description: "Start translating immediately without creating accounts or providing personal information",
    icon: "🚀"
  }
]

export default function TeluguToEnglishPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Structured Data */}
      <StructuredData 
        type="WebApplication"
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Telugu to English Translator",
          "description": "Free AI-powered Telugu to English translation tool",
          "url": "https://loretrans.app/telugu-to-english",
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
                <span className="text-blue-600">Telugu</span> to English Translation
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Transform Telugu text into clear English instantly with our AI-powered translator.
                <span className="block mt-2 text-lg">
                  Free, accurate, and designed for the Telugu language community.
                </span>
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Free Forever
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                AI-Powered
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Bidirectional
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Instant Results
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Translation Tool */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <BidirectionalTranslator
            defaultSourceLang="te"
            defaultTargetLang="en"
            placeholder="Enter Telugu text to translate to English..."
            showNavigation={true}
            showLanguageDetection={true}
            enableBidirectionalMode={true}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Why Choose Our Telugu to English Translator?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Experience the most advanced AI translation technology tailored for the Telugu-English language pair
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

      {/* About Telugu Language */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  About the Telugu Language
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Telugu (తెలుగు) is a widely spoken language with rich cultural heritage and linguistic features.
                    Our AI translator respects these linguistic characteristics to provide accurate Telugu to English translations.
                  </p>
                  <p>
                    Whether you're translating Telugu documents, communicating with English speakers, or learning languages, 
                    our AI translator helps bridge the language gap with cultural sensitivity and linguistic accuracy.
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Language Info</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium">Telugu</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Native Name:</span>
                      <span className="font-medium">తెలుగు</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Code:</span>
                      <span className="font-medium">te</span>
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
                Everything you need to know about Telugu to English translation
              </p>
            </div>
            
            <div className="space-y-6">
              {teluguToEnglishFAQs.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-gray-900 marker:content-['']">
                    {faq.question}
                    <svg
                      className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="mt-4 text-gray-600 leading-7">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}