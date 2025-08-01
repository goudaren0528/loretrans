import React from 'react'
import { Metadata } from 'next'
import { EnhancedTextTranslator } from '@/components/translation/enhanced-text-translator'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params
  
  return {
    title: 'English to Khmer Translation - Free AI Translator | LoReTrans',
    description: 'Translate Khmer (ខ្មែរ) to English instantly with our AI-powered translator. Convert ខ្មែរ text to English with high accuracy. Support for long texts up to 5,000 characters.',
    keywords: ['English to Khmer translation', 'English to Khmer', 'English-Khmer translator', 'free English to Khmer translation', 'Khmer English converter', 'ខ្មែរ to English', 'Cambodian to English translation', 'Khmer language translator'],
    openGraph: {
      title: 'English to Khmer Translation - Free AI Translator',
      description: 'Translate Khmer (ខ្មែរ) to English instantly with our AI-powered translator. Convert ខ្មែរ text to English with high accuracy. Support for long texts and queue processing.',
      url: `https://loretrans.com/${locale}/english-to-khmer`,
      siteName: 'LoReTrans',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'English to Khmer Translation - Free AI Translator',
      description: 'Translate Khmer (ខ្មែর) to English instantly with our AI-powered translator. Convert ខ្មែរ text to English with high accuracy. Support for long texts and queue processing.',
    },
    alternates: {
      canonical: `https://loretrans.com/${locale}/english-to-khmer`,
    },
  }
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
    name: "Enter your English text for translation",
    text: "Type or paste your English text into the source text box. Our English-Khmer translator supports up to 5,000 characters, making it perfect for translating English documents, emails, or social media posts to Khmer."
  },
  {
    name: "Select English to Khmer translation direction",
    text: "Ensure 'English' is selected as the source language and 'Khmer' as the target language. Use the swap button to switch between English-to-Khmer and Khmer-to-English translation modes as needed."
  },
  {
    name: "Start your English-Khmer conversion",
    text: "Press the translate button to begin the English to Khmer translation process. Short English texts translate instantly, while longer English documents use our advanced queue processing system for optimal translation quality."
  },
  {
    name: "Review and use your Khmer translation",
    text: "Review the Khmer translation results from your English text. You can copy the translated Khmer text, download it as a file, or save it to your English-Khmer conversion history for future reference."
  }
];

export default function EnglishToKhmerPage({ params }: Props) {
  const { locale } = params
  
  // 优化的结构化数据 - 直接在JSX中渲染，确保SSR
  const webApplicationStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "English to Khmer Translator - LoReTrans",
    "alternateName": "English-Khmer AI Translator",
    "description": "Free AI-powered English to Khmer translation tool with queue processing, translation history, and support for long texts up to 5,000 characters.",
    "url": `https://loretrans.com/${locale}/english-to-khmer`,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript",
    "softwareVersion": "2.0",
    "datePublished": "2025-01-01",
    "dateModified": "2025-08-01",
    "inLanguage": ["en", "km"],
    "isAccessibleForFree": true,
    "creator": {
      "@type": "Organization",
      "name": "LoReTrans",
      "url": "https://loretrans.com",
      "logo": "https://loretrans.com/logo.png"
    },
    "provider": {
      "@type": "Organization", 
      "name": "LoReTrans",
      "url": "https://loretrans.com"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "validFrom": "2025-01-01"
    },
    "featureList": [
      "AI-powered English to Khmer translation",
      "Support for texts up to 5,000 characters", 
      "Queue processing for long texts",
      "Translation history tracking",
      "Bidirectional English-Khmer translation",
      "Free unlimited usage"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": englishToKhmerFAQs.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  const howToStructuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to translate English to Khmer",
    "description": "Step-by-step guide to translate Khmer text to English using our AI translator",
    "step": howToSteps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text
    }))
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `https://loretrans.com/${locale}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Translation Tools",
        "item": `https://loretrans.com/${locale}/text-translate`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "English to Khmer",
        "item": `https://loretrans.com/${locale}/english-to-khmer`
      }
    ]
  };
  
  return (
    <>
      {/* 结构化数据 - 确保SSR渲染 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationStructuredData, null, 2)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData, null, 2)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToStructuredData, null, 2)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData, null, 2)
        }}
      />
      
      <main className="min-h-screen bg-background">
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
                  Translate Khmer (ខ្មែរ) to English instantly with our AI-powered translator. Convert ខ្មែរ text to English with high accuracy.
                  Perfect for Khmer documents, emails, and conversations. Support for long Khmer texts, queue processing, and translation history.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Free ខ្មែរ translation
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Up to 5,000 Khmer characters
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  ខ្មែរ queue processing
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  ខ្មែរ translation history
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Translation Tool */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <EnhancedTextTranslator
              defaultSourceLang="km"
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
                  Advanced English-Khmer Translation Features
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Professional-grade English-Khmer translation with modern AI technology and user-friendly features
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: "AI-Powered Khmer Translation",
                    description: "Advanced NLLB technology for accurate English-Khmer translation with natural language processing",
                    icon: "🤖"
                  },
                  {
                    title: "Bidirectional English-Khmer Support", 
                    description: "Seamlessly switch between English-to-Khmer and English-to-Khmer translation modes",
                    icon: "🔄"
                  },
                  {
                    title: "Long Khmer Text Support",
                    description: "Handle Khmer documents up to 5,000 characters with intelligent queue processing",
                    icon: "📄"
                  },
                  {
                    title: "Fast Khmer Translation Processing",
                    description: "Background processing for long Khmer texts with progress tracking and translation history",
                    icon: "⚡"
                  },
                  {
                    title: "Khmer Translation History",
                    description: "Keep track of all your English-Khmer conversions with searchable history",
                    icon: "📚"
                  },
                  {
                    title: "Free Khmer Translation Service",
                    description: "Completely free English-Khmer translation service with no hidden costs or limitations",
                    icon: "💝"
                  }
                ].map((feature) => (
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

        {/* How to Use Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  How to Use Our English to Khmer Translator
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Follow these simple steps to translate your Khmer text to English with professional accuracy
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
        <section className="py-16 bg-gray-50">
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

        {/* About Khmer Language */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  About English to Khmer Translation
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Learn more about the Khmer language and our advanced English to Khmer translation capabilities
                </p>
              </div>
              
              <div className="prose prose-lg mx-auto text-gray-600">
                <p>
                  Khmer (ខ្មែរ) is the official language of Cambodia, spoken by over 16 million people worldwide. 
                  Our AI-powered English-Khmer translator specializes in providing accurate translations that preserve 
                  the cultural nuances and linguistic complexity of the Khmer language. Whether you're translating 
                  Khmer business documents, academic papers, or personal communications, our English to Khmer translation 
                  service delivers professional-quality results.
                </p>
                <p>
                  The Khmer script is one of the world's longest alphabets, with 74 letters including 33 consonants, 
                  23 vowels, and 12 independent vowels. Our English-Khmer translator understands these complexities 
                  and uses advanced NLLB technology to ensure accurate translation that respects both the source Khmer 
                  text and target English meaning. This makes our tool ideal for Khmer language learners, researchers, 
                  and professionals working with Khmer content.
                </p>
                <p>
                  Our English-Khmer translation service is particularly valuable for:
                </p>
                <ul>
                  <li>Khmer business documents and correspondence translation</li>
                  <li>Academic research involving Khmer texts and literature</li>
                  <li>Khmer news articles and media content translation</li>
                  <li>Personal Khmer communications and social media posts</li>
                  <li>Khmer legal documents and official paperwork (with human review recommended)</li>
                  <li>Khmer cultural content and historical texts translation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}