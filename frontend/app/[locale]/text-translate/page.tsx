import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { TextTranslateClient } from './text-translate-client'
import { 
  StructuredData, 
  FAQStructuredData, 
  HowToStructuredData,
  WebApplicationStructuredData,
  BreadcrumbStructuredData
} from '@/components/structured-data'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'TextTranslatePage.meta' });
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: [
      'free text translation',
      'AI translator',
      'low-resource languages',
      'Creole translator',
      'Lao translator',
      'Swahili translator',
      'Burmese translator',
      'online translation tool',
      'NLLB translation',
      'text to English translation'
    ],
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://loretrans.com/${locale}/text-translate`,
      type: 'website',
      images: ['/images/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/images/og-image.png'],
    },
    alternates: {
      canonical: `/${locale}/text-translate`,
      languages: {
        'en': '/en/text-translate',
        'es': '/es/traducir-texto',
        'fr': '/fr/traduire-texte',
      },
    },
  };
}

const textTranslateFAQs = [
  {
    question: "How much does text translation cost?",
    answer: "Text translation is completely free for up to 5,000 characters per request. For longer texts, we charge 0.1 credits per character. New users get 500 welcome credits when they register, perfect for translating longer texts."
  },
  {
    question: "Which languages do you support for text translation?",
    answer: "We specialize in low-resource languages that are often poorly supported by mainstream translation services. We support 20+ languages including Haitian Creole, Lao, Swahili, Burmese, Telugu, Khmer, and more. All languages support bidirectional translation with English."
  },
  {
    question: "How accurate are the text translations?",
    answer: "Our text translations are powered by Meta's NLLB (No Language Left Behind) model, which is specifically designed for low-resource languages. While no automated translation is perfect, NLLB provides significantly better accuracy for small languages compared to traditional translation services."
  },
  {
    question: "Do I need to create an account for text translation?",
    answer: "No account required for translations under 5,000 characters. However, registering gives you 500 bonus credits, translation history, and access to premium features like document translation."
  },
  {
    question: "Can I translate from English to other languages?",
    answer: "Yes! All our supported languages work bidirectionally. You can translate from English to any supported language, or from any supported language to English. Just use the language selector to choose your desired translation direction."
  }
];

const howToSteps = [
  {
    name: "Select your languages",
    text: "Choose your source language and target language from our dropdown menus. We support 20+ low-resource languages with bidirectional translation to and from English."
  },
  {
    name: "Enter your text",
    text: "Type or paste your text in the input box. Our text translator supports up to 5,000 characters for free, making it perfect for translating documents, emails, or social media posts."
  },
  {
    name: "Get instant translation",
    text: "Click translate and instantly get your result. Short texts translate immediately, while longer texts use our advanced queue processing system for optimal translation quality."
  },
  {
    name: "Copy or save your translation",
    text: "Copy the translated text to your clipboard, listen to the pronunciation, or save it to your translation history for future reference."
  }
];

export default function TextTranslatePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data */}
      <WebApplicationStructuredData />
      
      <StructuredData 
        type="WebApplication"
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Text Translation Tool - LoReTrans",
          "description": "Free AI-powered text translator for 20+ low-resource languages. Translate Creole, Lao, Swahili, Burmese and more to English instantly.",
          "url": `https://loretrans.com/${locale}/text-translate`,
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "provider": {
            "@type": "Organization",
            "name": "LoReTrans",
            "url": "https://loretrans.com"
          },
          "featureList": [
            "Free text translation up to 5000 characters",
            "20+ low-resource languages supported",
            "Bidirectional translation",
            "AI-powered NLLB technology",
            "Instant translation results",
            "Text-to-speech functionality"
          ]
        }}
      />
      
      <FAQStructuredData questions={textTranslateFAQs} />
      
      <HowToStructuredData 
        title="How to use our text translator"
        steps={howToSteps}
      />
      
      <BreadcrumbStructuredData 
        items={[
          { name: "Home", url: `https://loretrans.com/${locale}` },
          { name: "Text Translation", url: `https://loretrans.com/${locale}/text-translate` }
        ]}
      />
      
      <TextTranslateClient locale={locale} />
    </div>
  );
}
