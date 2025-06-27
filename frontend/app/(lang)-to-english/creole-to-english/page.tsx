import React from 'react'
import { Metadata } from 'next'
import { TranslatorWidget } from '@/components/translator-widget'
import { LanguageGrid } from '@/components/language-grid'
import { GuestLimitGuard } from '@/components/guest-limit-guard'

import { Button } from '@/components/ui/button'
import { CheckCircle, Globe, Zap, FileText, Volume2, Shield } from 'lucide-react'
import Link from 'next/link'
import { TranslationServiceStructuredData, FAQStructuredData, HowToStructuredData } from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'Haitian Creole to English Translator - Free AI Translation Tool | Transly',
  description: 'Free online Haitian Creole to English translator. Accurate AI-powered translation for Kreyòl Ayisyen text, documents, and phrases. Instant results with NLLB technology.',
  keywords: [
    'haitian creole translator',
    'creole to english',
    'kreyol ayisyen translator',
    'haitian translator',
    'creole translation',
    'haiti language translator',
    'free creole translator',
    'AI creole translation'
  ],
  alternates: {
    canonical: '/creole-to-english',
  },
  openGraph: {
    title: 'Haitian Creole to English Translator - Free AI Translation',
    description: 'Professional Haitian Creole to English translation powered by AI. Translate Kreyòl Ayisyen text, documents and phrases instantly.',
    type: 'website',
    url: 'https://transly.app/creole-to-english',
  },
  twitter: {
    title: 'Free Haitian Creole to English Translator | Transly',
    description: 'Accurate AI-powered Haitian Creole to English translation. Perfect for Kreyòl Ayisyen speakers.',
  }
}

const creoleExamples = [
  {
    creole: "Bonjou, kijan ou ye?",
    english: "Hello, how are you?",
    category: "Greetings"
  },
  {
    creole: "Mwen bezwen èd ou.",
    english: "I need your help.",
    category: "Common Phrases"
  },
  {
    creole: "Ki kote ou rete?",
    english: "Where do you live?",
    category: "Questions"
  },
  {
    creole: "Mwen pa konprann.",
    english: "I don't understand.",
    category: "Communication"
  }
]

const creoleFAQ = [
  {
    question: "Is this Haitian Creole translator accurate?",
    answer: "Our translator uses Meta's NLLB AI model, specifically trained on Haitian Creole (Kreyòl Ayisyen). It provides significantly better accuracy than traditional translation services for Creole text."
  },
  {
    question: "Can I translate documents from Creole to English?",
    answer: "Yes! Our document translation feature supports PDF, Word, and text files. Upload your Haitian Creole document and get an English translation while preserving the original formatting."
  },
  {
    question: "Do you support both Haitian Creole dialects?",
    answer: "Our AI model is trained on standard Haitian Creole (Kreyòl Ayisyen) and works well with common dialectal variations found in Haiti and Haitian diaspora communities."
  },
  {
    question: "Is this translator free to use?",
    answer: "Yes, our basic Haitian Creole to English translation is completely free. For document translation and advanced features, we offer premium options."
  },
  {
    question: "Can I translate from English back to Haitian Creole?",
    answer: "Absolutely! Our translator supports bidirectional translation between English and Haitian Creole. Just use the language switch button to reverse the translation direction."
  }
]

export default function CreoleToEnglishPage() {
  const translationSteps = [
    {
      name: "Enter your Haitian Creole text",
      text: "Type or paste your Kreyòl Ayisyen text into the input area on our homepage."
    },
    {
      name: "Select language options",
      text: "Ensure 'Haitian Creole' is selected as the source language and 'English' as the target language."
    },
    {
      name: "Click translate",
      text: "Press the translate button to get instant AI-powered translation results."
    },
    {
      name: "Copy or listen to results",
      text: "Copy the English translation to your clipboard or use the audio feature to hear pronunciation."
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Structured Data */}
      <TranslationServiceStructuredData 
        sourceLanguage="Haitian Creole" 
        targetLanguage="English" 
      />
      <FAQStructuredData questions={creoleFAQ} />
      <HowToStructuredData 
        title="How to Translate Haitian Creole to English"
        steps={translationSteps}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Haitian Creole to English Translator
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional Kreyòl Ayisyen to English translation powered by AI. 
              Translate text, documents, and phrases instantly with high accuracy.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                🇭🇹 Kreyòl Ayisyen
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                AI Powered
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                Instant Translation
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                Free to Use
              </span>
            </div>
          </div>

          {/* Translation Widget */}
          <div className="max-w-4xl mx-auto">
            <GuestLimitGuard>
              <TranslatorWidget 
                defaultSourceLang="ht"
                defaultTargetLang="en"
                placeholder="Type your Haitian Creole text here... (Ekri teks Kreyòl ou a isit la...)"
              />
            </GuestLimitGuard>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose Our Haitian Creole Translator?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Designed specifically for Haitian Creole speakers with advanced AI technology 
              that understands the nuances of Kreyòl Ayisyen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 border rounded-lg">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Native Haitian Creole Support</h3>
              <p className="text-muted-foreground">
                Trained specifically on Kreyòl Ayisyen with deep understanding of cultural context and expressions.
              </p>
            </div>

            <div className="text-center p-6 border rounded-lg">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Instant Results</h3>
              <p className="text-muted-foreground">
                Get accurate English translations in seconds. No waiting, no delays - just fast, reliable translation.
              </p>
            </div>

            <div className="text-center p-6 border rounded-lg">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Document Translation</h3>
              <p className="text-muted-foreground">
                Upload PDF, Word, or text files in Haitian Creole and download professional English translations.
              </p>
            </div>

            <div className="text-center p-6 border rounded-lg">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Volume2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Audio Pronunciation</h3>
              <p className="text-muted-foreground">
                Listen to English pronunciations to improve your language learning and communication skills.
              </p>
            </div>

            <div className="text-center p-6 border rounded-lg">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Privacy Protected</h3>
              <p className="text-muted-foreground">
                Your translations are not stored. We respect your privacy and protect your personal information.
              </p>
            </div>

            <div className="text-center p-6 border rounded-lg">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Completely Free</h3>
              <p className="text-muted-foreground">
                Basic text translation is always free. No hidden fees, no subscriptions required for standard use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Common Haitian Creole Phrases and Translations
            </h2>
            <p className="text-lg text-muted-foreground">
              See how our AI translates everyday Kreyòl Ayisyen expressions into natural English.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {creoleExamples.map((example, index) => (
              <div key={index} className="bg-background border rounded-lg p-6">
                <div className="text-sm text-primary font-medium mb-2">{example.category}</div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Haitian Creole:</div>
                    <div className="font-medium text-lg">{example.creole}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">English:</div>
                    <div className="font-medium text-lg text-primary">{example.english}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              Try translating your own Haitian Creole text with our advanced AI translator.
            </p>
            <Button size="lg">
              <a href="#translator">Start Translating</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Document Translation CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Translate Haitian Creole Documents
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              From business reports to personal letters, get your Haitian Creole documents 
              translated to English accurately.
            </p>
            <Link href="/document-translate">
              <Button size="lg">Translate Your Document Now</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Common questions about our Haitian Creole to English translation service.
            </p>
          </div>

          <div className="space-y-6">
            {creoleFAQ.map((item, index) => (
              <div key={index} className="bg-background border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3">{item.question}</h3>
                <p className="text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Languages */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Explore Other Language Translators
            </h2>
            <p className="text-lg text-muted-foreground">
              We support translation for many low-resource languages beyond Haitian Creole.
            </p>
          </div>
          <LanguageGrid currentLanguage="ht" />
        </div>
      </section>
    </div>
  )
} 