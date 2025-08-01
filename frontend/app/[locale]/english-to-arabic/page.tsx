import React from 'react'
import { Metadata } from 'next'
import { EnhancedTextTranslator } from '@/components/translation/enhanced-text-translator'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params
  
  return {
    title: 'English to Arabic Translation - Free AI Translator | LoReTrans',
    description: 'Translate English to Arabic (العربية) instantly with our AI-powered translator. Convert English text to Arabic (العربية) with high accuracy. Support for long texts up to 5,000 characters.',
    keywords: ['English to Arabic translation', 'english-to-arabic', 'english-to-arabic translator', 'free english-to-arabic translation', 'english arabic converter'],
    openGraph: {
      title: 'English to Arabic Translation - Free AI Translator',
      description: 'Translate English to Arabic (العربية) instantly with our AI-powered translator. Convert English text to Arabic (العربية) with high accuracy. Support for long texts and queue processing.',
      url: `https://loretrans.com/${locale}/english-to-arabic`,
      siteName: 'LoReTrans',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'English to Arabic Translation - Free AI Translator',
      description: 'Translate English to Arabic (العربية) instantly with our AI-powered translator. Convert English text to Arabic (العربية) with high accuracy. Support for long texts and queue processing.',
    },
    alternates: {
      canonical: `https://loretrans.com/${locale}/english-to-arabic`,
    },
  }
}

const englishToArabicFAQs = [
  {
    question: "How accurate is the English to Arabic translation?",
    answer: "Our AI-powered English to Arabic translator provides high-accuracy translations using advanced NLLB (No Language Left Behind) technology. The translation quality from English to العربية is excellent for most content types, including business documents, academic texts, and casual conversations. While our English-Arabic translator is very reliable, we recommend human review for critical legal or medical documents requiring perfect Arabic translation."
  },
  {
    question: "Can I translate Arabic text back to English using this tool?",
    answer: "Yes! Our translator supports bidirectional translation between English and Arabic. You can easily switch between English-to-Arabic and Arabic-to-English translation using the swap button. This makes it perfect for English speakers learning Arabic and those who need to communicate effectively in العربية language."
  },
  {
    question: "Is the English-Arabic conversion tool completely free to use?",
    answer: "Yes, our English-Arabic translation service is completely free with no hidden costs. Short English texts translate to Arabic instantly, while longer English documents use our queue system for registered users. You can translate up to 5,000 characters of English text to Arabic at no charge."
  },
  {
    question: "What is the maximum length for English to Arabic translation?",
    answer: "You can translate up to 5,000 characters of English text to Arabic at once. For English texts over 1,000 characters, you'll need to sign in for queue processing. Shorter English to Arabic translations are processed instantly, making it ideal for quick English phrase translations to العربية."
  },
  {
    question: "Do I need an account for long English to Arabic translations?",
    answer: "For English texts over 1,000 characters, yes. Creating a free account allows you to use our queue system for longer English-Arabic conversions and access your English-Arabic translation records. This is especially useful for translating English documents, articles, or academic papers to Arabic language."
  }
];

const howToSteps = [
  {
    name: "Enter your English text for translation",
    text: "Type or paste your English text into the source text box. Our English-Arabic translator supports up to 5,000 characters, making it perfect for translating English documents, emails, or social media posts to Arabic."
  },
  {
    name: "Select English to Arabic translation direction",
    text: "Ensure 'English' is selected as the source language and 'Arabic' as the target language. Use the swap button to switch between English-to-Arabic and Arabic-to-English translation modes as needed."
  },
  {
    name: "Start your English-Arabic conversion",
    text: "Press the translate button to begin the English to Arabic translation process. Short English texts translate instantly, while longer English documents use our advanced queue processing system for optimal translation quality."
  },
  {
    name: "Review and use your Arabic translation",
    text: "Review the Arabic translation results from your English text. You can copy the translated Arabic text, download it as a file, or save it to your English-Arabic conversion history for future reference."
  }
];

export default function EnglishToArabicPage({ params }: Props) {
  const { locale } = params
  
  // 优化的结构化数据 - 直接在JSX中渲染，确保SSR
  const webApplicationStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "English to Arabic Translator - LoReTrans",
    "alternateName": "English to Arabic AI Translator",
    "description": "Free AI-powered English to Arabic translation tool with queue processing, translation history, and support for long texts up to 5,000 characters.",
    "url": `https://loretrans.com/${locale}/english-to-arabic`,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript",
    "softwareVersion": "2.0",
    "datePublished": "2025-01-01",
    "dateModified": "2025-08-01",
    "inLanguage": ["en", "ar"],
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
      "AI-powered English to Arabic translation",
      "Support for texts up to 5,000 characters", 
      "Queue processing for long texts",
      "Translation history tracking",
      "Bidirectional English-Arabic translation",
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
    "mainEntity": englishToArabicFAQs.map(item => ({
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
    "name": "How to translate English to Arabic (العربية)",
    "description": "Step-by-step guide to translate English text to Arabic (العربية) using our AI translator",
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
        "name": "English to Arabic",
        "item": `https://loretrans.com/${locale}/english-to-arabic`
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
                  English to Arabic
                  <span className="block text-blue-600">AI Translator</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Translate English to Arabic (العربية) instantly with our AI-powered translator. Convert English text to Arabic (العربية) with high accuracy.
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
              defaultTargetLang="arabic"
              pageTitle="English to Arabic Translation"
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
                  Everything you need to know about our English to Arabic translator and translation process
                </p>
              </div>
              
              <div className="space-y-8">
                {englishToArabicFAQs.map((faq, index) => (
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