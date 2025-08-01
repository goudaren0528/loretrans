import React from 'react'
import { Metadata } from 'next'
import { EnhancedTextTranslator } from '@/components/translation/enhanced-text-translator'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params
  
  return {
    title: 'English to Lao Translation - Free AI Translator | LoReTrans',
    description: 'Translate English to Lao (ລາວ) instantly with our AI-powered translator. Convert English text to Lao (ລາວ) with high accuracy. Support for long texts up to 5,000 characters.',
    keywords: ['English to Lao translation', 'english-to-lao', 'english-to-lao translator', 'free english-to-lao translation', 'english lao converter'],
    openGraph: {
      title: 'English to Lao Translation - Free AI Translator',
      description: 'Translate English to Lao (ລາວ) instantly with our AI-powered translator. Convert English text to Lao (ລາວ) with high accuracy. Support for long texts and queue processing.',
      url: `https://loretrans.com/${locale}/english-to-lao`,
      siteName: 'LoReTrans',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'English to Lao Translation - Free AI Translator',
      description: 'Translate English to Lao (ລາວ) instantly with our AI-powered translator. Convert English text to Lao (ລາວ) with high accuracy. Support for long texts and queue processing.',
    },
    alternates: {
      canonical: `https://loretrans.com/${locale}/english-to-lao`,
    },
  }
}

const englishToLaoFAQs = [
  {
    question: "How accurate is the English to Lao translation?",
    answer: "Our AI-powered English to Lao translator provides high-accuracy translations using advanced NLLB (No Language Left Behind) technology. The translation quality from English to ລາວ is excellent for most content types, including business documents, academic texts, and casual conversations. While our English-Lao translator is very reliable, we recommend human review for critical legal or medical documents requiring perfect Lao translation."
  },
  {
    question: "Can I translate Lao text back to English using this tool?",
    answer: "Yes! Our translator supports bidirectional translation between English and Lao. You can easily switch between English-to-Lao and Lao-to-English translation using the swap button. This makes it perfect for English speakers learning Lao and those who need to communicate effectively in ລາວ language."
  },
  {
    question: "Is the English-Lao conversion tool completely free to use?",
    answer: "Yes, our English-Lao translation service is completely free with no hidden costs. Short English texts translate to Lao instantly, while longer English documents use our queue system for registered users. You can translate up to 5,000 characters of English text to Lao at no charge."
  },
  {
    question: "What is the maximum length for English to Lao translation?",
    answer: "You can translate up to 5,000 characters of English text to Lao at once. For English texts over 1,000 characters, you'll need to sign in for queue processing. Shorter English to Lao translations are processed instantly, making it ideal for quick English phrase translations to ລາວ."
  },
  {
    question: "Do I need an account for long English to Lao translations?",
    answer: "For English texts over 1,000 characters, yes. Creating a free account allows you to use our queue system for longer English-Lao conversions and access your English-Lao translation records. This is especially useful for translating English documents, articles, or academic papers to Lao language."
  }
];

const howToSteps = [
  {
    name: "Enter your English text for translation",
    text: "Type or paste your English text into the source text box. Our English-Lao translator supports up to 5,000 characters, making it perfect for translating English documents, emails, or social media posts to Lao."
  },
  {
    name: "Select English to Lao translation direction",
    text: "Ensure 'English' is selected as the source language and 'Lao' as the target language. Use the swap button to switch between English-to-Lao and Lao-to-English translation modes as needed."
  },
  {
    name: "Start your English-Lao conversion",
    text: "Press the translate button to begin the English to Lao translation process. Short English texts translate instantly, while longer English documents use our advanced queue processing system for optimal translation quality."
  },
  {
    name: "Review and use your Lao translation",
    text: "Review the Lao translation results from your English text. You can copy the translated Lao text, download it as a file, or save it to your English-Lao conversion history for future reference."
  }
];

export default function EnglishToLaoPage({ params }: Props) {
  const { locale } = params
  
  // 优化的结构化数据 - 直接在JSX中渲染，确保SSR
  const webApplicationStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "English to Lao Translator - LoReTrans",
    "alternateName": "English to Lao AI Translator",
    "description": "Free AI-powered English to Lao translation tool with queue processing, translation history, and support for long texts up to 5,000 characters.",
    "url": `https://loretrans.com/${locale}/english-to-lao`,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript",
    "softwareVersion": "2.0",
    "datePublished": "2025-01-01",
    "dateModified": "2025-08-01",
    "inLanguage": ["en", "lo"],
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
      "AI-powered English to Lao translation",
      "Support for texts up to 5,000 characters", 
      "Queue processing for long texts",
      "Translation history tracking",
      "Bidirectional English-Lao translation",
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
    "mainEntity": englishToLaoFAQs.map(item => ({
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
    "name": "How to translate English to Lao (ລາວ)",
    "description": "Step-by-step guide to translate English text to Lao (ລາວ) using our AI translator",
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
        "name": "English to Lao",
        "item": `https://loretrans.com/${locale}/english-to-lao`
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
                  English to Lao
                  <span className="block text-blue-600">AI Translator</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Translate English to Lao (ລາວ) instantly with our AI-powered translator. Convert English text to Lao (ລາວ) with high accuracy.
                  Perfect for English documents, emails, and conversations. Support for long English texts, queue processing, and translation history.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Free English translation
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Up to 5,000 English characters
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  English queue processing
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  English translation history
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Translation Tool */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <EnhancedTextTranslator 
              defaultSourceLang="english"
              defaultTargetLang="lao"
              pageTitle="English to Lao Translation"
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-gray-600">
                  Everything you need to know about our English to Lao translator and translation process
                </p>
              </div>
              
              <div className="space-y-8">
                {englishToLaoFAQs.map((faq, index) => (
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
    </>
  )
}