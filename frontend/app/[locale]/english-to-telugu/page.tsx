import type { Metadata } from 'next'
import { BidirectionalTranslator } from '@/components/bidirectional-translator'
import { StructuredData } from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'English to Telugu Translation | Free Online Translator | Transly',
  description: 'Translate English to Telugu instantly with our AI-powered translator. Free, accurate, and fast translation service supporting text, documents, and more.',
  keywords: 'English to Telugu, translate English Telugu, English Telugu translator, free translation, AI translator',
  openGraph: {
    title: 'English to Telugu Translation | Free Online Translator',
    description: 'Translate English to Telugu instantly with our AI-powered translator. Free, accurate, and fast translation service.',
    type: 'website',
    locale: 'en_US',
  },
  alternates: {
    canonical: '/english-to-telugu',
    languages: {
      'en': '/english-to-telugu',
      'te': '/telugu-to-english',
    },
  },
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://transly.app/english-to-telugu",
      "url": "https://transly.app/english-to-telugu",
      "name": "English to Telugu Translation | Free Online Translator",
      "description": "Translate English to Telugu instantly with our AI-powered translator. Free, accurate, and fast translation service.",
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://transly.app/#website",
        "name": "Transly",
        "url": "https://transly.app"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "English to Telugu Translator",
      "applicationCategory": "TranslationApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Real-time English to Telugu translation",
        "AI-powered translation engine",
        "Document translation support",
        "Free unlimited translations"
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How accurate is English to Telugu translation?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our AI-powered translator provides highly accurate English to Telugu translations, especially for common phrases and everyday communication."
          }
        },
        {
          "@type": "Question", 
          "name": "Can I translate documents from English to Telugu?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, you can upload documents in various formats (PDF, Word, etc.) for English to Telugu translation."
          }
        },
        {
          "@type": "Question",
          "name": "Is the English to Telugu translator free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, our English to Telugu translation service is completely free with no usage limits."
          }
        }
      ]
    },
    {
      "@type": "HowTo",
      "name": "How to Translate English to Telugu",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Enter English Text",
          "text": "Type or paste your English text in the input field"
        },
        {
          "@type": "HowToStep", 
          "name": "Click Translate",
          "text": "Press the translate button to convert English to Telugu"
        },
        {
          "@type": "HowToStep",
          "name": "Get Telugu Translation",
          "text": "Receive your accurate Telugu translation instantly"
        }
      ]
    }
  ]
}

export default function EnglishToTeluguPage() {
  return (
    <>
      <StructuredData type="WebPage" data={structuredData} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              English to Telugu Translation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Translate English to Telugu instantly with our advanced AI translator. 
              Perfect for communication, learning, and business needs.
            </p>
          </div>

          {/* Main Translator */}
          <div className="mb-12">
            <BidirectionalTranslator 
              defaultSourceLang="en"
              defaultTargetLang="te"
              placeholder="Enter English text to translate..."
            />
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Translation</h3>
              <p className="text-gray-600">Get immediate English to Telugu translations powered by advanced AI technology.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">High Accuracy</h3>
              <p className="text-gray-600">Our AI model ensures accurate and contextually appropriate Telugu translations.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free & Unlimited</h3>
              <p className="text-gray-600">Translate as much English text to Telugu as you need, completely free.</p>
            </div>
          </div>

          {/* Example Translations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Common English to Telugu Translations</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-900 font-medium">Hello</span>
                  <span className="text-blue-600">నమస్కారం</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-900 font-medium">Thank you</span>
                  <span className="text-blue-600">ధన్యవాదాలు</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-900 font-medium">Good morning</span>
                  <span className="text-blue-600">శుభోదయం</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-900 font-medium">How are you?</span>
                  <span className="text-blue-600">ఎలా ఉన్నారు?</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-900 font-medium">Goodbye</span>
                  <span className="text-blue-600">వీడ్కోలు</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-900 font-medium">Please</span>
                  <span className="text-blue-600">దయచేసి</span>
                </div>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use English to Telugu Translator</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">1</div>
                <h3 className="font-semibold text-gray-900 mb-2">Enter English Text</h3>
                <p className="text-gray-600 text-sm">Type or paste your English text in the input field above.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">2</div>
                <h3 className="font-semibold text-gray-900 mb-2">Click Translate</h3>
                <p className="text-gray-600 text-sm">Press the translate button to convert your text to Telugu.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">3</div>
                <h3 className="font-semibold text-gray-900 mb-2">Get Telugu Translation</h3>
                <p className="text-gray-600 text-sm">Receive your accurate Telugu translation instantly.</p>
              </div>
            </div>
          </div>

          {/* About Telugu */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About Telugu Language</h2>
            <p className="text-gray-600 mb-4">
              Telugu is a Dravidian language spoken by over 95 million people, primarily in the Indian states of 
              Andhra Pradesh and Telangana. It is the fourth most spoken language in India and the 15th most spoken 
              language in the world. Telugu has a rich literary tradition spanning over a thousand years.
            </p>
            <p className="text-gray-600">
              Our English to Telugu translator helps bridge communication gaps, making it easier for English speakers 
              to connect with Telugu-speaking communities for business, travel, education, and cultural exchange.
            </p>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is English to Telugu translation?</h3>
                <p className="text-gray-600">Our AI-powered translator provides highly accurate English to Telugu translations, especially for common phrases and everyday communication. For complex or specialized content, we recommend reviewing the translation.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I translate documents from English to Telugu?</h3>
                <p className="text-gray-600">Yes, you can upload documents in various formats (PDF, Word, etc.) for English to Telugu translation. Visit our document translation page for this feature.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is the English to Telugu translator free?</h3>
                <p className="text-gray-600">Yes, our English to Telugu translation service is completely free with no usage limits. You can translate as much text as you need.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the translator work for Telugu to English?</h3>
                <p className="text-gray-600">Yes! We also offer Telugu to English translation. You can switch languages using the swap button or visit our Telugu to English page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 