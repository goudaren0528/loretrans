import React from 'react'
import { Metadata } from 'next'
import { EnhancedTextTranslator } from '@/components/translation/enhanced-text-translator'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params
  
  return {
    title: 'Arabic to English Translation - Free AI Translator | LoReTrans',
    description: 'Translate Arabic (العربية) to English instantly with our AI-powered translator. Convert Arabic (العربية) text to English with high accuracy. Support for long texts up to 5,000 characters.',
    keywords: ['Arabic to English translation', 'arabic-to-english', 'arabic-to-english translator', 'free arabic-to-english translation', 'arabic english converter'],
    openGraph: {
      title: 'Arabic to English Translation - Free AI Translator',
      description: 'Translate Arabic (العربية) to English instantly with our AI-powered translator. Convert Arabic (العربية) text to English with high accuracy. Support for long texts and queue processing.',
      url: `https://loretrans.com/${locale}/arabic-to-english`,
      siteName: 'LoReTrans',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Arabic to English Translation - Free AI Translator',
      description: 'Translate Arabic (العربية) to English instantly with our AI-powered translator. Convert Arabic (العربية) text to English with high accuracy. Support for long texts and queue processing.',
    },
    alternates: {
      canonical: `https://loretrans.com/${locale}/arabic-to-english`,
    },
  }
}

const arabicToEnglishFAQs = [
  {
    question: "How accurate is the Arabic to English translation?",
    answer: "Our AI-powered Arabic-English translator provides high-accuracy translations using advanced NLLB (No Language Left Behind) technology. The Arabic to English translation quality is excellent for most content types, including business documents, academic texts, and casual conversations. While our Arabic-English translator is very reliable, we recommend human review for critical legal or medical documents."
  },
  {
    question: "Can I translate English text back to Arabic using this tool?",
    answer: "Yes! Our translator supports bidirectional translation between Arabic and English. You can easily switch between Arabic-to-English and English-to-Arabic translation using the swap button. This makes it perfect for Arabic language learners and English speakers who need to communicate in العربية."
  },
  {
    question: "Is the Arabic-English translator completely free to use?",
    answer: "Yes, our Arabic-English translation service is completely free with no hidden costs. Short Arabic texts translate instantly, while longer Arabic documents use our queue system for registered users. You can translate up to 5,000 characters of Arabic text to English at no charge."
  },
  {
    question: "What is the maximum length for Arabic to English translation?",
    answer: "You can translate up to 5,000 characters of Arabic text to English at once. For Arabic texts over 1,000 characters, you'll need to sign in for queue processing. Shorter Arabic to English translations are processed instantly, making it ideal for quick Arabic phrase translations."
  },
  {
    question: "Do I need an account for long Arabic to English translations?",
    answer: "For Arabic texts over 1,000 characters, yes. Creating a free account allows you to use our queue system for longer Arabic-English conversions and access your العربية translation history. This is especially useful for translating Arabic documents, articles, or academic papers to English."
  }
];

const howToSteps = [
  {
    name: "Enter your Arabic text for translation",
    text: "Type or paste your Arabic (العربية) text into the source text box. Our Arabic-English translator supports up to 5,000 characters, making it perfect for translating Arabic documents, emails, or social media posts to English."
  },
  {
    name: "Select Arabic to English translation direction",
    text: "Ensure 'Arabic' is selected as the source language and 'English' as the target language. Use the swap button to switch between Arabic-to-English and English-to-Arabic translation modes as needed."
  },
  {
    name: "Start your Arabic-English conversion",
    text: "Press the translate button to begin the Arabic to English translation process. Short Arabic texts translate instantly, while longer Arabic documents use our advanced queue processing system for optimal translation quality."
  },
  {
    name: "Review and use your English translation",
    text: "Review the English translation results from your Arabic text. You can copy the translated English text, download it as a file, or save it to your Arabic-English conversion history for future reference."
  }
];

export default function ArabicToEnglishPage({ params }: Props) {
  const { locale } = params
  
  // 优化的结构化数据 - 直接在JSX中渲染，确保SSR
  const webApplicationStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Arabic to English Translator - LoReTrans",
    "alternateName": "Arabic to English AI Translator",
    "description": "Free AI-powered Arabic to English translation tool with queue processing, translation history, and support for long texts up to 5,000 characters.",
    "url": `https://loretrans.com/${locale}/arabic-to-english`,
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
      "AI-powered Arabic to English translation",
      "Support for texts up to 5,000 characters", 
      "Queue processing for long texts",
      "Translation history tracking",
      "Bidirectional Arabic-English translation",
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
    "mainEntity": arabicToEnglishFAQs.map(item => ({
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
    "name": "How to translate Arabic (العربية) to English",
    "description": "Step-by-step guide to translate Arabic (العربية) text to English using our AI translator",
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
        "name": "Arabic to English",
        "item": `https://loretrans.com/${locale}/arabic-to-english`
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
                  Arabic to English
                  <span className="block text-blue-600">AI Translator</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Translate Arabic (العربية) to English instantly with our AI-powered translator. Convert Arabic (العربية) text to English with high accuracy.
                  Perfect for Arabic (العربية) documents, emails, and conversations. Support for long Arabic (العربية) texts, queue processing, and translation history.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Free Arabic (العربية) translation
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Up to 5,000 Arabic characters
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Arabic (العربية) queue processing
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Arabic (العربية) translation history
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Translation Tool */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <EnhancedTextTranslator 
              defaultSourceLang="arabic"
              defaultTargetLang="english"
              pageTitle="Arabic to English Translation"
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
                  Everything you need to know about our Arabic to English translator and translation process
                </p>
              </div>
              
              <div className="space-y-8">
                {arabicToEnglishFAQs.map((faq, index) => (
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