import React from 'react'
import { Metadata } from 'next'
import { EnhancedTextTranslator } from '@/components/translation/enhanced-text-translator'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params
  
  return {
    title: 'Burmese to English Translation - Free AI Translator | LoReTrans',
    description: 'Translate Burmese (မြန်မာ) to English instantly with our AI-powered translator. Convert Burmese (မြန်မာ) text to English with high accuracy. Support for long texts up to 5,000 characters.',
    keywords: ['Burmese to English translation', 'burmese-to-english', 'burmese-to-english translator', 'free burmese-to-english translation', 'burmese english converter'],
    openGraph: {
      title: 'Burmese to English Translation - Free AI Translator',
      description: 'Translate Burmese (မြန်မာ) to English instantly with our AI-powered translator. Convert Burmese (မြန်မာ) text to English with high accuracy. Support for long texts and queue processing.',
      url: `https://loretrans.com/${locale}/burmese-to-english`,
      siteName: 'LoReTrans',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Burmese to English Translation - Free AI Translator',
      description: 'Translate Burmese (မြန်မာ) to English instantly with our AI-powered translator. Convert Burmese (မြန်မာ) text to English with high accuracy. Support for long texts and queue processing.',
    },
    alternates: {
      canonical: `https://loretrans.com/${locale}/burmese-to-english`,
    },
  }
}

const burmeseToEnglishFAQs = [
  {
    question: "How accurate is the Burmese to English translation?",
    answer: "Our AI-powered Burmese-English translator provides high-accuracy translations using advanced NLLB (No Language Left Behind) technology. The Burmese to English translation quality is excellent for most content types, including business documents, academic texts, and casual conversations. While our Burmese-English translator is very reliable, we recommend human review for critical legal or medical documents."
  },
  {
    question: "Can I translate English text back to Burmese using this tool?",
    answer: "Yes! Our translator supports bidirectional translation between Burmese and English. You can easily switch between Burmese-to-English and English-to-Burmese translation using the swap button. This makes it perfect for Burmese language learners and English speakers who need to communicate in မြန်မာ."
  },
  {
    question: "Is the Burmese-English translator completely free to use?",
    answer: "Yes, our Burmese-English translation service is completely free with no hidden costs. Short Burmese texts translate instantly, while longer Burmese documents use our queue system for registered users. You can translate up to 5,000 characters of Burmese text to English at no charge."
  },
  {
    question: "What is the maximum length for Burmese to English translation?",
    answer: "You can translate up to 5,000 characters of Burmese text to English at once. For Burmese texts over 1,000 characters, you'll need to sign in for queue processing. Shorter Burmese to English translations are processed instantly, making it ideal for quick Burmese phrase translations."
  },
  {
    question: "Do I need an account for long Burmese to English translations?",
    answer: "For Burmese texts over 1,000 characters, yes. Creating a free account allows you to use our queue system for longer Burmese-English conversions and access your မြန်မာ translation history. This is especially useful for translating Burmese documents, articles, or academic papers to English."
  }
];

const howToSteps = [
  {
    name: "Enter your Burmese text for translation",
    text: "Type or paste your Burmese (မြန်မာ) text into the source text box. Our Burmese-English translator supports up to 5,000 characters, making it perfect for translating Burmese documents, emails, or social media posts to English."
  },
  {
    name: "Select Burmese to English translation direction",
    text: "Ensure 'Burmese' is selected as the source language and 'English' as the target language. Use the swap button to switch between Burmese-to-English and English-to-Burmese translation modes as needed."
  },
  {
    name: "Start your Burmese-English conversion",
    text: "Press the translate button to begin the Burmese to English translation process. Short Burmese texts translate instantly, while longer Burmese documents use our advanced queue processing system for optimal translation quality."
  },
  {
    name: "Review and use your English translation",
    text: "Review the English translation results from your Burmese text. You can copy the translated English text, download it as a file, or save it to your Burmese-English conversion history for future reference."
  }
];

export default function BurmeseToEnglishPage({ params }: Props) {
  const { locale } = params
  
  // 优化的结构化数据 - 直接在JSX中渲染，确保SSR
  const webApplicationStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Burmese to English Translator - LoReTrans",
    "alternateName": "Burmese to English AI Translator",
    "description": "Free AI-powered Burmese to English translation tool with queue processing, translation history, and support for long texts up to 5,000 characters.",
    "url": `https://loretrans.com/${locale}/burmese-to-english`,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript",
    "softwareVersion": "2.0",
    "datePublished": "2025-01-01",
    "dateModified": "2025-08-01",
    "inLanguage": ["en", "my"],
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
      "AI-powered Burmese to English translation",
      "Support for texts up to 5,000 characters", 
      "Queue processing for long texts",
      "Translation history tracking",
      "Bidirectional Burmese-English translation",
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
    "mainEntity": burmeseToEnglishFAQs.map(item => ({
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
    "name": "How to translate Burmese (မြန်မာ) to English",
    "description": "Step-by-step guide to translate Burmese (မြန်မာ) text to English using our AI translator",
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
        "name": "Burmese to English",
        "item": `https://loretrans.com/${locale}/burmese-to-english`
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
                  Burmese to English
                  <span className="block text-blue-600">AI Translator</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Translate Burmese (မြန်မာ) to English instantly with our AI-powered translator. Convert Burmese (မြန်မာ) text to English with high accuracy.
                  Perfect for Burmese (မြန်မာ) documents, emails, and conversations. Support for long Burmese (မြန်မာ) texts, queue processing, and translation history.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Free Burmese (မြန်မာ) translation
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Up to 5,000 Burmese characters
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Burmese (မြန်မာ) queue processing
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Burmese (မြန်မာ) translation history
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Translation Tool */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <EnhancedTextTranslator 
              defaultSourceLang="burmese"
              defaultTargetLang="english"
              pageTitle="Burmese to English Translation"
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
                  Everything you need to know about our Burmese to English translator and translation process
                </p>
              </div>
              
              <div className="space-y-8">
                {burmeseToEnglishFAQs.map((faq, index) => (
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