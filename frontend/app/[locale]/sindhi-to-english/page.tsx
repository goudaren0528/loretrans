import React from 'react'
import { Metadata } from 'next'
import { EnhancedTextTranslator } from '@/components/translation/enhanced-text-translator'
import { generateHreflangAlternates, getOpenGraphLocale } from '@/lib/seo-utils'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params
  
  // 本地化元数据
  const metadata = {
    en: {
      title: 'Sindhi to English Translation - Free AI Translator | LoReTrans',
      description: 'Translate Sindhi (سنڌي) to English instantly with our AI-powered translator. Convert Sindhi (سنڌي) text to English with high accuracy. Support for long texts up to 5,000 characters.',
      keywords: ['Sindhi to English translation', 'sindhi-to-english', 'sindhi-to-english translator', 'free sindhi-to-english translation', 'sindhi english converter'],
      ogTitle: 'Sindhi to English Translation - Free AI Translator',
      ogDescription: 'Translate Sindhi (سنڌي) to English instantly with our AI-powered translator. Convert Sindhi (سنڌي) text to English with high accuracy. Support for long texts and queue processing.'
    },
    fr: {
      title: 'Traduction Sindhi vers Anglais - Traducteur IA Gratuit | LoReTrans',
      description: 'Traduisez le sindhi (سنڌي) vers l\'anglais instantanément avec notre traducteur IA. Convertissez le texte sindhi en anglais avec une grande précision. Support pour les longs textes jusqu\'à 5 000 caractères.',
      keywords: ['traduction sindhi anglais', 'traducteur sindhi-anglais', 'traduction sindhi-anglais gratuite', 'convertisseur sindhi anglais', 'traducteur IA sindhi'],
      ogTitle: 'Traduction Sindhi vers Anglais - Traducteur IA Gratuit',
      ogDescription: 'Traduisez le sindhi (سنڌي) vers l\'anglais instantanément avec notre traducteur IA. Convertissez le texte sindhi en anglais avec une grande précision. Support pour les longs textes et traitement en file d\'attente.'
    },
    es: {
      title: 'Traducción de Sindhi a Inglés - Traductor IA Gratuito | LoReTrans',
      description: 'Traduce sindhi (سنڌي) al inglés instantáneamente con nuestro traductor IA. Convierte texto sindhi al inglés con alta precisión. Soporte para textos largos hasta 5,000 caracteres.',
      keywords: ['traducción sindhi inglés', 'traductor sindhi-inglés', 'traducción sindhi-inglés gratis', 'convertidor sindhi inglés', 'traductor IA sindhi'],
      ogTitle: 'Traducción de Sindhi a Inglés - Traductor IA Gratuito',
      ogDescription: 'Traduce sindhi (سنڌي) al inglés instantáneamente con nuestro traductor IA. Convierte texto sindhi al inglés con alta precisión. Soporte para textos largos y procesamiento en cola.'
    },
    zh: {
      title: '信德语到英语翻译 - 免费AI翻译器 | LoReTrans',
      description: '使用我们的AI翻译器即时将信德语(سنڌي)翻译成英语。高精度将信德语文本转换为英语。支持最多5,000字符的长文本。',
      keywords: ['信德语英语翻译', '信德语-英语翻译器', '免费信德语-英语翻译', '信德语英语转换器', 'AI信德语翻译器'],
      ogTitle: '信德语到英语翻译 - 免费AI翻译器',
      ogDescription: '使用我们的AI翻译器即时将信德语(سنڌي)翻译成英语。高精度将信德语文本转换为英语。支持长文本和队列处理。'
    }
  };

  // 获取当前语言的元数据，如果不存在则使用英语
  const currentMetadata = metadata[locale as keyof typeof metadata] || metadata.en;
  
  // 生成 hreflang alternates
  const alternates = generateHreflangAlternates('sindhi-to-english', locale);
  
  return {
    title: currentMetadata.title,
    description: currentMetadata.description,
    keywords: currentMetadata.keywords,
    openGraph: {
      title: currentMetadata.ogTitle,
      description: currentMetadata.ogDescription,
      url: `https://loretrans.com/${locale}/sindhi-to-english`,
      siteName: 'LoReTrans',
      locale: getOpenGraphLocale(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: currentMetadata.ogTitle,
      description: currentMetadata.ogDescription,
    },
    alternates,
  }
}

const sindhiToEnglishFAQs = [
  {
    question: "How accurate is the Sindhi to English translation?",
    answer: "Our AI-powered Sindhi-English translator provides high-accuracy translations using advanced NLLB (No Language Left Behind) technology. The Sindhi to English translation quality is excellent for most content types, including business documents, academic texts, and casual conversations. While our Sindhi-English translator is very reliable, we recommend human review for critical legal or medical documents."
  },
  {
    question: "Can I translate English text back to Sindhi using this tool?",
    answer: "Yes! Our translator supports bidirectional translation between Sindhi and English. You can easily switch between Sindhi-to-English and English-to-Sindhi translation using the swap button. This makes it perfect for Sindhi language learners and English speakers who need to communicate in سنڌي."
  },
  {
    question: "Is the Sindhi-English translator completely free to use?",
    answer: "Yes, our Sindhi-English translation service is completely free with no hidden costs. Short Sindhi texts translate instantly, while longer Sindhi documents use our queue system for registered users. You can translate up to 5,000 characters of Sindhi text to English at no charge."
  },
  {
    question: "What is the maximum length for Sindhi to English translation?",
    answer: "You can translate up to 5,000 characters of Sindhi text to English at once. For Sindhi texts over 1,000 characters, you'll need to sign in for queue processing. Shorter Sindhi to English translations are processed instantly, making it ideal for quick Sindhi phrase translations."
  },
  {
    question: "Do I need an account for long Sindhi to English translations?",
    answer: "For Sindhi texts over 1,000 characters, yes. Creating a free account allows you to use our queue system for longer Sindhi-English conversions and access your سنڌي translation history. This is especially useful for translating Sindhi documents, articles, or academic papers to English."
  }
];

const howToSteps = [
  {
    name: "Enter your Sindhi text for translation",
    text: "Type or paste your Sindhi (سنڌي) text into the source text box. Our Sindhi-English translator supports up to 5,000 characters, making it perfect for translating Sindhi documents, emails, or social media posts to English."
  },
  {
    name: "Select Sindhi to English translation direction",
    text: "Ensure 'Sindhi' is selected as the source language and 'English' as the target language. Use the swap button to switch between Sindhi-to-English and English-to-Sindhi translation modes as needed."
  },
  {
    name: "Start your Sindhi-English conversion",
    text: "Press the translate button to begin the Sindhi to English translation process. Short Sindhi texts translate instantly, while longer Sindhi documents use our advanced queue processing system for optimal translation quality."
  },
  {
    name: "Review and use your English translation",
    text: "Review the English translation results from your Sindhi text. You can copy the translated English text, download it as a file, or save it to your Sindhi-English conversion history for future reference."
  }
];

export default function SindhiToEnglishPage({ params }: Props) {
  const { locale } = params
  
  // 优化的结构化数据 - 直接在JSX中渲染，确保SSR
  const webApplicationStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Sindhi to English Translator - LoReTrans",
    "alternateName": "Sindhi to English AI Translator",
    "description": "Free AI-powered Sindhi to English translation tool with queue processing, translation history, and support for long texts up to 5,000 characters.",
    "url": `https://loretrans.com/${locale}/sindhi-to-english`,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript",
    "softwareVersion": "2.0",
    "datePublished": "2025-01-01",
    "dateModified": "2025-08-01",
    "inLanguage": ["en", "sd"],
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
      "AI-powered Sindhi to English translation",
      "Support for texts up to 5,000 characters", 
      "Queue processing for long texts",
      "Translation history tracking",
      "Bidirectional Sindhi-English translation",
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
    "mainEntity": sindhiToEnglishFAQs.map(item => ({
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
    "name": "How to translate Sindhi (سنڌي) to English",
    "description": "Step-by-step guide to translate Sindhi (سنڌي) text to English using our AI translator",
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
        "name": "Sindhi to English",
        "item": `https://loretrans.com/${locale}/sindhi-to-english`
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
                  AI翻译器<span className="block text-blue-600">信德语到英语</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  使用我们的AI翻译器即时将信德语(سنڌي)翻译成英语。高精度将信德语(سنڌي)文本转换为英语。完美适用于信德语(سنڌي)文档、电子邮件和对话。支持长信德语(سنڌي)文本、队列处理和翻译历史。</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Free Sindhi (سنڌي) translation
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Up to 5,000 Sindhi characters
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Sindhi (سنڌي) queue processing
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Sindhi (سنڌي) translation history
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Translation Tool */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <EnhancedTextTranslator 
              defaultSourceLang="sindhi"
              defaultTargetLang="english"
              pageTitle="Sindhi to English Translation"
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  常见问题</h2>
                <p className="text-lg text-gray-600">
                  关于我们的信德语到英语翻译器和翻译过程的所有信息</p>
              </div>
              
              <div className="space-y-8">
                {sindhiToEnglishFAQs.map((faq, index) => (
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