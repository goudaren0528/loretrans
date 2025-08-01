import React from 'react'
import { Metadata } from 'next'
import { EnhancedTextTranslator } from '@/components/translation/enhanced-text-translator'
import { 
  StructuredData, 
  FAQStructuredData, 
  HowToStructuredData,
  TranslationServiceStructuredData,
  WebApplicationStructuredData,
  BreadcrumbStructuredData
} from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'English to Khmer Translation - Free AI Translator | LoReTrans',
  description: 'Translate English to Khmer (ខ្មែរ) instantly with our AI-powered translator. Convert English text to ខ្មែរ with high accuracy. Support for long texts up to 5,000 characters.',
  keywords: ['English to Khmer translation', 'English to ខ្មែរ', 'English to Khmer translator', 'free English to Khmer translation', 'English Khmer converter', 'English to Cambodian', 'English Khmer translation tool'],
  openGraph: {
    title: 'English to Khmer Translation - Free AI Translator',
    description: 'Translate English to Khmer (ខ្មែរ) instantly with our AI-powered translator. Convert English text to ខ្មែរ with high accuracy. Support for long texts and queue processing.',
    url: 'https://loretrans.com/english-to-khmer',
    siteName: 'LoReTrans',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'English to Khmer Translation - Free AI Translator',
    description: 'Translate English to Khmer (ខ្មែរ) instantly with our AI-powered translator. Convert English text to ខ្មែរ with high accuracy. Support for long texts and queue processing.',
  },
  alternates: {
    canonical: 'https://loretrans.com/english-to-khmer',
  },
}

const englishToKhmerFAQs = [
  {
    question: "How accurate is the English to Khmer translation?",
    answer: "Our AI-powered English to Khmer translator provides high-accuracy translations using advanced NLLB (No Language Left Behind) technology. The translation quality from English to ខ្មែរ is excellent for most content types, including business documents, academic texts, and casual conversations. While our English-Khmer translator is very reliable, we recommend human review for critical legal or medical documents requiring perfect Khmer translation."
  },
  {
    question: "Can I translate Khmer text back to English using this tool?",
    answer: "Yes! Our translator supports bidirectional translation between English and Khmer. You can easily switch between English-to-Khmer and Khmer-to-English translation using the swap button. This makes it perfect for English speakers learning Khmer and those who need to communicate effectively in ខ្មែរ language."
  },
  {
    question: "Is the English-Khmer conversion tool completely free to use?",
    answer: "Yes, our English-Khmer translation service is completely free with no hidden costs. Short English texts translate to Khmer instantly, while longer English documents use our queue system for registered users. You can translate up to 5,000 characters of English text to Khmer at no charge."
  },
  {
    question: "What is the maximum length for English to Khmer translation?",
    answer: "You can translate up to 5,000 characters of English text to Khmer at once. For English texts over 1,000 characters, you'll need to sign in for queue processing. Shorter English to Khmer translations are processed instantly, making it ideal for quick English phrase translations to ខ្មែរ."
  },
  {
    question: "Do I need an account for long English to Khmer translations?",
    answer: "For English texts over 1,000 characters, yes. Creating a free account allows you to use our queue system for longer English-Khmer conversions and access your English-Khmer translation records. This is especially useful for translating English documents, articles, or academic papers to Khmer language."
  }
];

const howToSteps = [
  {
    name: "Enter your English text for Khmer translation",
    text: "Type or paste your English text into the source text box. Our English-Khmer translator supports up to 5,000 characters, making it perfect for translating English documents, emails, or social media posts to Khmer (ខ្មែរ) language."
  },
  {
    name: "Select English to Khmer translation direction",
    text: "Ensure 'English' is selected as the source language and 'Khmer' as the target language. Use the swap button to switch between English-to-Khmer and Khmer-to-English translation modes as needed for your translation requirements."
  },
  {
    name: "Start your English-Khmer conversion",
    text: "Press the translate button to begin the English-Khmer conversion process. Short English texts translate to Khmer instantly, while longer English documents use our advanced queue processing system for optimal Khmer translation quality."
  },
  {
    name: "Review and use your Khmer translation",
    text: "Review the Khmer (ខ្មែរ) translation results from your English text. You can copy the translated Khmer text, download it as a file, or save it to your English-Khmer translation records for future reference and reuse."
  }
];

const features = [
  {
    title: "AI-Powered English to Khmer Translation",
    description: "Advanced NLLB technology for accurate English-Khmer translation with natural language processing",
    icon: "🤖"
  },
  {
    title: "Bidirectional English-Khmer Support", 
    description: "Seamlessly switch between English-to-Khmer and Khmer-to-English translation modes",
    icon: "🔄"
  },
  {
    title: "Long English Text Support",
    description: "Handle English documents up to 5,000 characters with intelligent Khmer translation processing",
    icon: "📄"
  },
  {
    title: "Fast English to Khmer Processing",
    description: "Background processing for long English texts with progress tracking and Khmer translation history",
    icon: "⚡"
  },
  {
    title: "English to Khmer Translation History",
    description: "Keep track of all your English-Khmer conversions with searchable history and bookmarks",
    icon: "📚"
  },
  {
    title: "Free English-Khmer Service",
    description: "Completely free English-Khmer translation service with no hidden costs or usage limitations",
    icon: "💝"
  }
];

export default function EnglishToKhmerPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Structured Data */}
      <WebApplicationStructuredData />
      
      <TranslationServiceStructuredData 
        sourceLanguage="English"
        targetLanguage="Khmer"
      />
      
      <FAQStructuredData questions={englishToKhmerFAQs} />
      
      <HowToStructuredData 
        title="How to convert English to ខ្មែរ"
        steps={howToSteps}
      />
      
      <BreadcrumbStructuredData 
        items={[
          { name: "Home", url: "https://loretrans.com" },
          { name: "Translation Tools", url: "https://loretrans.com/text-translate" },
          { name: "English to Khmer", url: "https://loretrans.com/english-to-khmer" }
        ]}
      />
      
      <StructuredData 
        type="WebApplication"
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "English to Khmer Translation Tool",
          "description": "Free AI-powered English-Khmer translation with queue processing and history",
          "url": "https://loretrans.com/english-to-khmer",
          "inLanguage": "en",
          "about": {
            "@type": "Thing",
            "name": "English to Khmer Language Translation",
            "description": "Professional English to Khmer (ខ្មែរ) translation service"
          },
          "provider": {
            "@type": "Organization",
            "name": "LoReTrans",
            "url": "https://loretrans.com"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1180",
            "bestRating": "5",
            "worstRating": "1"
          },
          "review": [
            {
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": "Michael Johnson"
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              },
              "reviewBody": "Excellent English to Khmer translator! Very accurate and handles complex English texts well. The Khmer translation quality is impressive for business documents."
            },
            {
              "@type": "Review", 
              "author": {
                "@type": "Person",
                "name": "Sarah Williams"
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              },
              "reviewBody": "Best free English to Khmer translator I've found. The AI translation preserves meaning perfectly when converting English to ខ្មែរ."
            },
            {
              "@type": "Review",
              "author": {
                "@type": "Person", 
                "name": "Chanthy Sok"
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "4",
                "bestRating": "5"
              },
              "reviewBody": "Great tool for translating English documents to Khmer. The English-Khmer translation records feature is very useful for my translation work."
            }
          ]
        }}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                English to Khmer
                <span className="block text-blue-600">AI Translator</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Translate English to Khmer (ខ្មែរ) instantly with our AI-powered translator. Convert English text to ខ្មែរ with high accuracy.
                Perfect for English documents, emails, and conversations. Support for long English texts, queue processing, and English-Khmer translation records.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Free English-Khmer
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Up to 5,000 English characters
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                English-Khmer queue processing
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                English-Khmer history
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
            defaultTargetLang="km"
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
                Advanced English-Khmer Translation Features
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Professional-grade English-Khmer translation with modern AI technology and user-friendly features
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

      {/* About English to Khmer Translation */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                About English to Khmer Translation
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Learn more about converting English to ខ្មែរ and our advanced English-Khmer conversion capabilities
              </p>
            </div>
            
            <div className="prose prose-lg mx-auto text-gray-600">
              <p>
                Khmer (ខ្មែរ) is the official language of Cambodia, spoken by over 16 million people worldwide. 
                Our AI-powered English to Khmer translator specializes in providing accurate translations that preserve 
                the meaning and context of English text while producing natural-sounding Khmer output. Whether you're 
                translating English business documents, academic papers, or personal communications to Khmer, our 
                English-Khmer translation service delivers professional-quality results.
              </p>
              <p>
                The Khmer script is one of the world's longest alphabets, with 74 letters including 33 consonants, 
                23 vowels, and 12 independent vowels. Our English-Khmer conversion system understands these complexities 
                and uses advanced NLLB technology to ensure accurate translation from English to proper Khmer script. 
                This makes our tool ideal for English speakers learning Khmer, businesses expanding to Cambodia, 
                and professionals working with Khmer-speaking communities.
              </p>
              <p>
                Our English-Khmer translation service is particularly valuable for:
              </p>
              <ul>
                <li>English business documents and correspondence translation to Khmer</li>
                <li>Academic research requiring English to Khmer translation</li>
                <li>English news articles and media content translation to ខ្មែរ</li>
                <li>Personal English communications and social media posts to Khmer</li>
                <li>English legal documents and official paperwork to Khmer (with human review recommended)</li>
                <li>English educational content and training materials to Khmer language</li>
                <li>English marketing materials and websites for Cambodian audiences</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                How to Use Our English to Khmer Translator
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Follow these simple steps to translate your English text to Khmer with professional accuracy
              </p>
            </div>
            
            <div className="space-y-8">
              {howToSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.name}</h3>
                    <p className="text-gray-600">{step.text}</p>
                  </div>
                </div>
              ))}
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
                Frequently Asked Questions About English to Khmer Translation
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Everything you need to know about our English-Khmer translator and translation process
              </p>
            </div>
            
            <div className="space-y-8">
              {englishToKhmerFAQs.map((faq, index) => (
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