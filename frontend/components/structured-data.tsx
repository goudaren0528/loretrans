import React from 'react'
import Script from 'next/script'

interface StructuredDataProps {
  type: 'WebApplication' | 'SoftwareApplication' | 'WebPage' | 'FAQ' | 'HowTo'
  data: any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  return (
    <Script
      id={`structured-data-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2)
      }}
    />
  )
}

// 预定义的结构化数据模板
export const StructuredDataTemplates = {
  webApplication: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Loretrans - AI Translation Tool",
    "url": "https://loretrans.app",
    "description": "Professional translation for low-resource languages to English using AI technology.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web",
    "softwareVersion": "1.0",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "provider": {
      "@type": "Organization",
      "name": "Loretrans",
      "url": "https://loretrans.app"
    },
    "featureList": [
      "AI-powered translation",
      "20+ supported languages",
      "Document translation",
      "Text-to-speech",
      "Privacy-first approach"
    ]
  },

  translationService: (sourceLanguage: string, targetLanguage: string) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${sourceLanguage} to ${targetLanguage} Translation`,
    "provider": {
      "@type": "Organization",
      "name": "Loretrans",
      "url": "https://loretrans.app"
    },
    "description": `Professional AI-powered translation from ${sourceLanguage} to ${targetLanguage}`,
    "serviceType": "Translation Service",
    "areaServed": "Worldwide",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  }),

  faq: (questions: Array<{ question: string; answer: string }>) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }),

  howTo: (title: string, steps: Array<{ name: string; text: string }>) => ({
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text
    }))
  }),

  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Loretrans",
    "url": "https://loretrans.app",
    "logo": "https://loretrans.app/logo.png",
    "description": "Professional translation platform for low-resource languages powered by AI technology.",
    "foundingDate": "2024",
    "sameAs": [
      "https://twitter.com/LoretransApp",
      "https://github.com/loretrans-app"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@loretrans.app"
    }
  },

  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  })
}

// 便捷组件
export function WebApplicationStructuredData() {
  return (
    <StructuredData 
      type="WebApplication" 
      data={StructuredDataTemplates.webApplication} 
    />
  )
}

export function TranslationServiceStructuredData({ 
  sourceLanguage, 
  targetLanguage 
}: { 
  sourceLanguage: string
  targetLanguage: string 
}) {
  return (
    <StructuredData 
      type="SoftwareApplication" 
      data={StructuredDataTemplates.translationService(sourceLanguage, targetLanguage)} 
    />
  )
}

export function FAQStructuredData({ 
  questions 
}: { 
  questions: Array<{ question: string; answer: string }> 
}) {
  return (
    <StructuredData 
      type="FAQ" 
      data={StructuredDataTemplates.faq(questions)} 
    />
  )
}

export function HowToStructuredData({ 
  title, 
  steps 
}: { 
  title: string
  steps: Array<{ name: string; text: string }> 
}) {
  return (
    <StructuredData 
      type="HowTo" 
      data={StructuredDataTemplates.howTo(title, steps)} 
    />
  )
}

export function OrganizationStructuredData() {
  return (
    <StructuredData 
      type="WebPage" 
      data={StructuredDataTemplates.organization} 
    />
  )
}

export function BreadcrumbStructuredData({ 
  items 
}: { 
  items: Array<{ name: string; url: string }> 
}) {
  return (
    <StructuredData 
      type="WebPage" 
      data={StructuredDataTemplates.breadcrumb(items)} 
    />
  )
} 