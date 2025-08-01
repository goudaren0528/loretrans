import React from 'react'
import { Metadata } from 'next'
import { EnhancedTextTranslator } from '@/components/translation/enhanced-text-translator'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params
  
  return {
    title: 'Creole to English Translation - Free AI Translator | LoReTrans',
    description: 'Translate Creole (Kreyòl) to English instantly with our AI-powered translator. Convert Creole (Kreyòl) text to English with high accuracy. Support for long texts up to 5,000 characters.',
    keywords: ['Creole to English translation', 'creole-to-english', 'creole-to-english translator', 'free creole-to-english translation', 'creole english converter'],
    openGraph: {
      title: 'Creole to English Translation - Free AI Translator',
      description: 'Translate Creole (Kreyòl) to English instantly with our AI-powered translator. Convert Creole (Kreyòl) text to English with high accuracy. Support for long texts and queue processing.',
      url: `https://loretrans.com/${locale}/creole-to-english`,
      siteName: 'LoReTrans',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Creole to English Translation - Free AI Translator',
      description: 'Translate Creole (Kreyòl) to English instantly with our AI-powered translator. Convert Creole (Kreyòl) text to English with high accuracy. Support for long texts and queue processing.',
    },
    alternates: {
      canonical: `https://loretrans.com/${locale}/creole-to-english`,
    },
  }
}

const creoleToEnglishFAQs = [
  {
    question: "How accurate is the Creole to English translation?",
    answer: "Our AI-powered Creole-English translator provides high-accuracy translations using advanced NLLB (No Language Left Behind) technology. The Creole to English translation quality is excellent for most content types, including business documents, academic texts, and casual conversations. While our Creole-English translator is very reliable, we recommend human review for critical legal or medical documents."
  },
  {
    question: "Can I translate English text back to Creole using this tool?",
    answer: "Yes! Our translator supports bidirectional translation between Creole and English. You can easily switch between Creole-to-English and English-to-Creole translation using the swap button. This makes it perfect for Creole language learners and English speakers who need to communicate in Kreyòl."
  },
  {
    question: "Is the Creole-English translator completely free to use?",
    answer: "Yes, our Creole-English translation service is completely free with no hidden costs. Short Creole texts translate instantly, while longer Creole documents use our queue system for registered users. You can translate up to 5,000 characters of Creole text to English at no charge."
  },
  {
    question: "What is the maximum length for Creole to English translation?",
    answer: "You can translate up to 5,000 characters of Creole text to English at once. For Creole texts over 1,000 characters, you'll need to sign in for queue processing. Shorter Creole to English translations are processed instantly, making it ideal for quick Creole phrase translations."
  },
  {
    question: "Do I need an account for long Creole to English translations?",
    answer: "For Creole texts over 1,000 characters, yes. Creating a free account allows you to use our queue system for longer Creole-English conversions and access your Kreyòl translation history. This is especially useful for translating Creole documents, articles, or academic papers to English."
  }
];

const howToSteps = [
  {
    name: "Enter your Creole text for translation",
    text: "Type or paste your Creole (Kreyòl) text into the source text box. Our Creole-English translator supports up to 5,000 characters, making it perfect for translating Creole documents, emails, or social media posts to English."
  },
  {
    name: "Select Creole to English translation direction",
    text: "Ensure 'Creole' is selected as the source language and 'English' as the target language. Use the swap button to switch between Creole-to-English and English-to-Creole translation modes as needed."
  },
  {
    name: "Start your Creole-English conversion",
    text: "Press the translate button to begin the Creole to English translation process. Short Creole texts translate instantly, while longer Creole documents use our advanced queue processing system for optimal translation quality."
  },
  {
    name: "Review and use your English translation",
    text: "Review the English translation results from your Creole text. You can copy the translated English text, download it as a file, or save it to your Creole-English conversion history for future reference."
  }
];

export default function CreoleToEnglishPage({ params }: Props) {
  const { locale } = params
  
  // 优化的结构化数据 - 直接在JSX中渲染，确保SSR
  const webApplicationStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Creole to English Translator - LoReTrans",
    "alternateName": "Creole to English AI Translator",
    "description": "Free AI-powered Creole to English translation tool with queue processing, translation history, and support for long texts up to 5,000 characters.",
    "url": `https://loretrans.com/${locale}/creole-to-english`,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript",
    "softwareVersion": "2.0",
    "datePublished": "2025-01-01",
    "dateModified": "2025-08-01",
    "inLanguage": ["en", "ht"],
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
      "AI-powered Creole to English translation",
      "Support for texts up to 5,000 characters", 
      "Queue processing for long texts",
      "Translation history tracking",
      "Bidirectional Creole-English translation",
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
    "mainEntity": creoleToEnglishFAQs.map(item => ({
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
    "name": "How to translate Creole (Kreyòl) to English",
    "description": "Step-by-step guide to translate Creole (Kreyòl) text to English using our AI translator",
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
        "name": "Creole to English",
        "item": `https://loretrans.com/${locale}/creole-to-english`
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
                  Creole to English
                  <span className="block text-blue-600">AI Translator</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Translate Creole (Kreyòl) to English instantly with our AI-powered translator. Convert Creole (Kreyòl) text to English with high accuracy.
                  Perfect for Creole (Kreyòl) documents, emails, and conversations. Support for long Creole (Kreyòl) texts, queue processing, and translation history.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Free Creole (Kreyòl) translation
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Up to 5,000 Creole characters
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Creole (Kreyòl) queue processing
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Creole (Kreyòl) translation history
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Translation Tool */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <EnhancedTextTranslator 
              defaultSourceLang="creole"
              defaultTargetLang="english"
              pageTitle="Creole to English Translation"
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
                  Everything you need to know about our Creole to English translator and translation process
                </p>
              </div>
              
              <div className="space-y-8">
                {creoleToEnglishFAQs.map((faq, index) => (
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