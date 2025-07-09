import type { Metadata } from 'next'
import { BidirectionalTranslator } from '@/components/bidirectional-translator'
import { StructuredData } from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'English to Swahili Translation | Free Online Translator | Loretrans',
  description: 'Translate English to Swahili instantly with our AI-powered translator. Free, accurate, and fast translation service supporting text, documents, and more.',
  keywords: 'English to Swahili, translate English Swahili, English Swahili translator, free translation, AI translator',
  openGraph: {
    title: 'English to Swahili Translation | Free Online Translator',
    description: 'Translate English to Swahili instantly with our AI-powered translator. Free, accurate, and fast translation service.',
    type: 'website',
    locale: 'en_US',
  },
}

const features = [
  {
    title: "AI-Powered Translation",
    description: "Advanced neural machine translation technology specifically trained for English-Swahili language pairs",
    icon: "🤖"
  },
  {
    title: "Swahili Script Support", 
    description: "Full support for Swahili script (Kiswahili) with proper character encoding and text rendering",
    icon: "S"
  },
  {
    title: "Bidirectional Translation",
    description: "Switch between English-to-Swahili and Swahili-to-English translation with one click",
    icon: "🔄"
  },
  {
    title: "Cultural Context",
    description: "Translations consider cultural nuances and context specific to Swahili language usage",
    icon: "🏛️"
  },
  {
    title: "Free & Fast",
    description: "Get instant English to Swahili translations at no cost, with results in seconds",
    icon: "⚡"
  },
  {
    title: "No Registration",
    description: "Start translating immediately without creating accounts or providing personal information",
    icon: "🚀"
  }
]

const englishToSwahiliFAQs = [
  {
    question: "How accurate is the English to Swahili translation?",
    answer: "Our AI-powered translator provides high-accuracy English to Swahili translations using advanced NLLB (No Language Left Behind) technology. While very reliable for most content, we recommend human review for critical documents."
  },
  {
    question: "Can I translate Swahili text back to English?",
    answer: "Yes! Our translator supports bidirectional translation. You can easily switch between English-to-Swahili and Swahili-to-English translation using the swap button."
  },
  {
    question: "Is the English to Swahili translator free to use?",
    answer: "Yes, our English to Swahili translation service is completely free with no registration required. Simply enter your English text and get instant Swahili translations."
  },
  {
    question: "What types of text can I translate from English to Swahili?",
    answer: "You can translate various types of English content to Swahili including documents, emails, websites, social media posts, and casual conversations. Our translator handles both formal and informal language styles."
  },
  {
    question: "Does the translator support Swahili script properly?",
    answer: "Yes, our translator fully supports the Swahili script (Kiswahili) and handles the unique characteristics of the Swahili writing system, including proper character encoding and text direction."
  },
  {
    question: "Can I use this for business English to Swahili translation?",
    answer: "Our translator works well for business communications, but for important business documents, legal texts, or official communications, we recommend having translations reviewed by a native Swahili speaker."
  }
]

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://loretrans.app/english-to-swahili",
      "url": "https://loretrans.app/english-to-swahili",
      "name": "English to Swahili Translation | Free Online Translator",
      "description": "Translate English to Swahili instantly with our AI-powered translator. Free, accurate, and fast translation service.",
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://loretrans.app/#website",
        "name": "Loretrans",
        "url": "https://loretrans.app"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "English to Swahili Translator",
      "applicationCategory": "TranslationApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Real-time English to Swahili translation",
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
          "name": "How accurate is English to Swahili translation?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our AI-powered translator provides highly accurate English to Swahili translations, especially for common phrases and everyday communication."
          }
        },
        {
          "@type": "Question", 
          "name": "Can I translate documents from English to Swahili?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, you can upload documents in various formats (PDF, Word, etc.) for English to Swahili translation."
          }
        },
        {
          "@type": "Question",
          "name": "Is the English to Swahili translator free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, our English to Swahili translation service is completely free with no usage limits."
          }
        }
      ]
    },
    {
      "@type": "HowTo",
      "name": "How to Translate English to Swahili",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Enter English Text",
          "text": "Type or paste your English text in the input field"
        },
        {
          "@type": "HowToStep", 
          "name": "Click Translate",
          "text": "Press the translate button to convert English to Swahili"
        },
        {
          "@type": "HowToStep",
          "name": "Get Swahili Translation",
          "text": "Receive your accurate Swahili translation instantly"
        }
      ]
    }
  ]
}

export default function EnglishToSwahiliPage() {
  return (
    <>
                <StructuredData type="WebPage" data={structuredData} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              English to Swahili Translation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Translate English to Swahili instantly with our advanced AI translator. 
              Perfect for communication, learning, and business needs.
            </p>
          </div>

          {/* Main Translator */}
          <div className="mb-12">
            <BidirectionalTranslator 
              defaultSourceLang="en"
              defaultTargetLang="sw"
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
              <p className="text-gray-600">Get immediate English to Swahili translations powered by advanced AI technology.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">High Accuracy</h3>
              <p className="text-gray-600">Our AI model ensures accurate and contextually appropriate Swahili translations.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free & Unlimited</h3>
              <p className="text-gray-600">Translate as much English text to Swahili as you need, completely free.</p>
            </div>
          </div>

          {/* Example Translations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Common English to Swahili Translations</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-900 font-medium">Hello</span>
                  <span className="text-blue-600">Hujambo</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-900 font-medium">Thank you</span>
                  <span className="text-blue-600">Asante</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-900 font-medium">Good morning</span>
                  <span className="text-blue-600">Habari za asubuhi</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-900 font-medium">How are you?</span>
                  <span className="text-blue-600">Habari yako?</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-900 font-medium">Goodbye</span>
                  <span className="text-blue-600">Kwaheri</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-900 font-medium">Please</span>
                  <span className="text-blue-600">Tafadhali</span>
                </div>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use English to Swahili Translator</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">1</div>
                <h3 className="font-semibold text-gray-900 mb-2">Enter English Text</h3>
                <p className="text-gray-600 text-sm">Type or paste your English text in the input field above.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">2</div>
                <h3 className="font-semibold text-gray-900 mb-2">Click Translate</h3>
                <p className="text-gray-600 text-sm">Press the translate button to convert your text to Swahili.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">3</div>
                <h3 className="font-semibold text-gray-900 mb-2">Get Swahili Translation</h3>
                <p className="text-gray-600 text-sm">Receive your accurate Swahili translation instantly.</p>
              </div>
            </div>
          </div>

          {/* About Swahili */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About Swahili Language</h2>
            <p className="text-gray-600 mb-4">
              Swahili (Kiswahili) is a Bantu language spoken by over 100 million people across East Africa, 
              including Tanzania, Kenya, Uganda, and the Democratic Republic of Congo. It serves as a lingua franca 
              throughout the region and is one of the official languages of the African Union.
            </p>
            <p className="text-gray-600">
              Our English to Swahili translator helps bridge communication gaps, making it easier for English speakers 
              to connect with Swahili-speaking communities for business, travel, education, and cultural exchange.
            </p>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is English to Swahili translation?</h3>
                <p className="text-gray-600">Our AI-powered translator provides highly accurate English to Swahili translations, especially for common phrases and everyday communication. For complex or specialized content, we recommend reviewing the translation.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I translate documents from English to Swahili?</h3>
                <p className="text-gray-600">Yes, you can upload documents in various formats (PDF, Word, etc.) for English to Swahili translation. Visit our document translation page for this feature.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is the English to Swahili translator free?</h3>
                <p className="text-gray-600">Yes, our English to Swahili translation service is completely free with no usage limits. You can translate as much text as you need.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the translator work for Swahili to English?</h3>
                <p className="text-gray-600">Yes! We also offer Swahili to English translation. You can switch languages using the swap button or visit our Swahili to English page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 