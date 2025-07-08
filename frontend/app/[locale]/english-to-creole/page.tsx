import { Metadata } from 'next'
import { BidirectionalTranslator } from '@/components/bidirectional-translator'
import { StructuredData } from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'English to Haitian Creole Translator – Free & Accurate Online Tool',
  description: 'Easily translate English to Haitian Creole using our free online tool powered by advanced AI. No signup, no ads – just simple and fast translation.',
  keywords: 'English to Creole, English to Haitian Creole translator, English Kreyòl translation, free online translator, AI translation',
  openGraph: {
    title: 'English to Haitian Creole Translator – Free & Accurate',
    description: 'Translate English to Haitian Creole instantly with our AI-powered tool. Perfect for communication, documents, and learning.',
    url: 'https://loretrans.app/english-to-creole',
    siteName: 'Loretrans',
    images: [
      {
        url: '/images/og-english-to-creole.png',
        width: 1200,
        height: 630,
        alt: 'English to Haitian Creole Translator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'English to Haitian Creole Translator – Free Tool',
    description: 'Translate English to Haitian Creole with AI. Free, accurate, and instant.',
    images: ['/images/twitter-english-to-creole.png'],
  },
  alternates: {
    canonical: 'https://loretrans.app/english-to-creole',
    languages: {
      'en': 'https://loretrans.app/english-to-creole',
      'ht': 'https://loretrans.app/creole-to-english',
    },
  },
}

export default function EnglishToCreolePage() {
  const faqData = [
    {
      question: "Is this English to Creole translator accurate?",
      answer: "Yes, we use Meta's NLLB AI model specifically trained for Haitian Creole translation to ensure high-quality, culturally appropriate results."
    },
    {
      question: "Is it free to use?",
      answer: "Yes, our English to Haitian Creole translator is completely free with no limits or hidden charges."
    },
    {
      question: "Can I translate documents from English to Creole?",
      answer: "Yes, you can upload PDF, Word, and other document formats for translation from English to Haitian Creole."
    },
    {
      question: "How do I type in Haitian Creole characters?",
      answer: "You can type standard English characters, and our system will handle the translation. For viewing results, Haitian Creole uses the Latin alphabet."
    },
    {
      question: "Can I switch back to Creole to English translation?",
      answer: "Yes, you can easily switch to Creole to English translation using the language switch button or visit our Creole to English page."
    }
  ]

  const howToSteps = [
    { step: "Type or paste your English text in the input box" },
    { step: "The system automatically detects English as the source language" },
    { step: "Click the 'Translate' button to convert to Haitian Creole" },
    { step: "Copy, download, or listen to your Haitian Creole translation" }
  ]

  const commonExamples = [
    { english: "Hello, how are you?", creole: "Bonjou, kijan ou ye?" },
    { english: "Thank you very much", creole: "Mèsi anpil" },
    { english: "Good morning", creole: "Bon maten" },
    { english: "I love you", creole: "Mwen renmen ou" },
    { english: "How much does it cost?", creole: "Konben sa koute?" },
    { english: "Where is the bathroom?", creole: "Ki kote twalèt la ye?" }
  ]

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            English to Haitian Creole Translator
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Translate English to Haitian Creole (Kreyòl Ayisyen) instantly with our AI-powered tool. 
            Perfect for communication, business, education, and cultural exchange.
          </p>
          
          {/* Feature Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              🎯 Native Haitian Creole Support
            </span>
            <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
              ⚡ Instant Results
            </span>
            <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
              📄 Document Translation
            </span>
            <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
              🔊 Voice Playback
            </span>
            <span className="bg-pink-100 text-pink-800 text-sm font-medium px-3 py-1 rounded-full">
              🔒 Privacy First
            </span>
            <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
              💯 Always Free
            </span>
          </div>
        </div>

        {/* Translation Widget */}
        <div className="mb-16">
          <BidirectionalTranslator
            defaultSourceLang="en"
            defaultTargetLang="ht"
            placeholder="Type your English text here..."
            showNavigation={true}
            showLanguageDetection={true}
            enableBidirectionalMode={true}
          />
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Our English to Creole Translator?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">Native Haitian Creole Support</h3>
              <p className="text-gray-600">
                Specialized in English to Haitian Creole translation with understanding of cultural context and expressions.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3">Instant Results</h3>
              <p className="text-gray-600">
                Get your English text translated to Haitian Creole in seconds with our advanced AI technology.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-semibold mb-3">Document Translation</h3>
              <p className="text-gray-600">
                Upload PDF, Word, or text files to translate entire documents from English to Haitian Creole.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🔊</div>
              <h3 className="text-xl font-semibent mb-3">Voice Playback</h3>
              <p className="text-gray-600">
                Listen to the pronunciation of your Haitian Creole translations with our text-to-speech feature.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3">Privacy First</h3>
              <p className="text-gray-600">
                Your translations are processed securely and not stored on our servers for maximum privacy.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💯</div>
              <h3 className="text-xl font-semibold mb-3">Always Free</h3>
              <p className="text-gray-600">
                No registration, no limits, no hidden fees. Our English to Creole translator is always free to use.
              </p>
            </div>
          </div>
        </div>

        {/* Examples Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Common English to Haitian Creole Translations
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {commonExamples.map((example, index) => (
              <div key={index} className="border rounded-lg p-6 bg-gray-50">
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">English:</p>
                  <p className="text-lg font-medium text-gray-900">{example.english}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Haitian Creole:</p>
                  <p className="text-lg font-medium text-blue-600">{example.creole}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How to Translate English to Haitian Creole
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howToSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <p className="text-gray-700">{step.step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqData.map((faq, index) => (
              <details key={index} className="border border-gray-200 rounded-lg p-6">
                <summary className="font-semibold text-lg cursor-pointer text-gray-900 mb-3">
                  {faq.question}
                </summary>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Related Languages */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Other Language Translators
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a 
              href="/english-to-lao" 
              className="block p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🇱🇦</div>
                <p className="font-medium">English to Lao</p>
              </div>
            </a>
            <a 
              href="/english-to-swahili" 
              className="block p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🇹🇿</div>
                <p className="font-medium">English to Swahili</p>
              </div>
            </a>
            <a 
              href="/english-to-burmese" 
              className="block p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🇲🇲</div>
                <p className="font-medium">English to Burmese</p>
              </div>
            </a>
            <a 
              href="/english-to-telugu" 
              className="block p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🇮🇳</div>
                <p className="font-medium">English to Telugu</p>
              </div>
            </a>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-4">
            Start Translating English to Haitian Creole Today
          </h2>
          <p className="text-xl mb-6 text-blue-100">
            Join thousands of users who trust our AI-powered translation tool
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#translator" 
              className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Translate Text Now
            </a>
            <a 
              href="/document-translate" 
              className="bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-400 transition-colors"
            >
              Translate Documents
            </a>
          </div>
        </div>
      </div>

      {/* Structured Data */}
      <StructuredData
        type="SoftwareApplication"
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "SoftwareApplication",
              "name": "English to Haitian Creole Translator",
              "applicationCategory": "Translation",
              "operatingSystem": "All",
              "browserRequirements": "Requires JavaScript",
              "url": "https://loretrans.app/english-to-creole",
              "description": "Free online tool to translate English to Haitian Creole instantly using AI technology.",
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "USD"
              },
              "featureList": [
                "English to Haitian Creole translation",
                "Voice playback",
                "Document translation",
                "Instant results",
                "Free to use"
              ]
            },
            {
              "@type": "FAQPage",
              "mainEntity": faqData.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            },
            {
              "@type": "HowTo",
              "name": "How to Translate English to Haitian Creole",
              "step": howToSteps.map((step, index) => ({
                "@type": "HowToStep",
                "position": index + 1,
                "text": step.step
              }))
            }
          ]
        }}
      />
    </>
  )
} 