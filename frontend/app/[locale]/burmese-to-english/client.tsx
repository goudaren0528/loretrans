'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Globe, Zap, FileText, Volume2, Shield } from 'lucide-react'
import Link from 'next/link'
import { TranslationServiceStructuredData, FAQStructuredData, HowToStructuredData } from '@/components/structured-data'
import nextDynamic from 'next/dynamic'

const TranslatorWidget = nextDynamic(() => import('@/components/translator-widget').then(mod => mod.TranslatorWidget), {
  ssr: false,
  loading: () => <div className="h-96" />, // Placeholder
})

const burmeseExamples = [
  {
    burmese: "မင်္ဂလာပါ၊ နေကောင်းလား?",
    english: "Hello, how are you?",
    category: "Greetings"
  },
  {
    burmese: "ကျွန်တော် အကူအညီ လိုတယ်။",
    english: "I need help.",
    category: "Common Phrases"
  },
  {
    burmese: "ဘယ်နေရာက လာတာလဲ?",
    english: "Where are you from?",
    category: "Questions"
  },
  {
    burmese: "ကျေးဇူးတင်ပါတယ်။",
    english: "Thank you.",
    category: "Politeness"
  },
  {
    burmese: "ကျွန်တော် အင်္ဂလိပ် မသိပါဘူး။",
    english: "I don't know English.",
    category: "Communication"
  },
  {
    burmese: "စျေးဘယ်လောက် ကျသလဲ?",
    english: "How much does it cost?",
    category: "Shopping"
  }
]

const burmeseFAQ = [
  {
    question: "Is this Burmese to English translator accurate?",
    answer: "Our translator uses Meta's NLLB AI model, specifically trained on Burmese (မြန်မာ). It provides significantly better accuracy than traditional translation services for Myanmar text and script."
  },
  {
    question: "Can I translate documents from Burmese to English?",
    answer: "Yes! Our document translation feature supports PDF, Word, and text files. Upload your Burmese document and get an English translation while preserving the original formatting."
  },
  {
    question: "Do you support Myanmar script properly?",
    answer: "Absolutely! Our AI model is fully trained on the Myanmar script (မြန်မာအက္ခရာ) and can accurately process complex Burmese text with proper character rendering."
  },
  {
    question: "Is this translator free to use?",
    answer: "Yes, our basic Burmese to English translation is completely free. For document translation and advanced features, we offer premium options."
  },
  {
    question: "Can I translate from English back to Burmese?",
    answer: "Absolutely! Our translator supports bidirectional translation between English and Burmese. Just use the language switch button to reverse the translation direction."
  }
]

export default function BurmeseToEnglishClient() {
  const translationSteps = [
    {
      name: "Enter your Burmese text",
      text: "Type or paste your မြန်မာ text into the input area on our homepage."
    },
    {
      name: "Select language options",
      text: "Ensure 'Burmese' is selected as the source language and 'English' as the target language."
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
        sourceLanguage="Burmese" 
        targetLanguage="English" 
      />
      <FAQStructuredData questions={burmeseFAQ} />
      <HowToStructuredData 
        title="How to Translate Burmese to English"
        steps={translationSteps}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Burmese to English Translator
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional မြန်မာ to English translation powered by AI. 
              Translate text, documents, and phrases instantly with high accuracy.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                🇲🇲 မြန်မာ
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
            <TranslatorWidget 
              defaultSourceLang="my"
              defaultTargetLang="en"
              placeholder="Type your Burmese text here... (မြန်မာစာသား ရိုက်ထည့်ပါ...)"
            />
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose Our Burmese Translator?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Designed specifically for Burmese speakers with advanced AI technology 
              that understands the nuances of Myanmar language and script.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 border rounded-lg">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Native Burmese Support</h3>
              <p className="text-muted-foreground">
                Trained specifically on မြန်မာ with deep understanding of Myanmar cultural context and script complexity.
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
                Upload PDF, Word, or text files in Burmese and download professional English translations.
              </p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Volume2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Voice Playback</h3>
              <p className="text-muted-foreground">
                Listen to English translations with natural-sounding text-to-speech technology.
              </p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Privacy First</h3>
              <p className="text-muted-foreground">
                Your text is processed securely and never stored. Complete privacy and confidentiality guaranteed.
              </p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Always Free</h3>
              <p className="text-muted-foreground">
                Basic translation services are completely free. No registration required, no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Examples Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Common Burmese Phrases
            </h2>
            <p className="text-lg text-muted-foreground">
              Practice with these everyday မြန်မာ expressions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {burmeseExamples.map((example, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="mb-4">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mb-2">
                    {example.category}
                  </span>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">
                      "{example.burmese}"
                    </p>
                    <p className="text-gray-600">
                      "{example.english}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              How to Translate Burmese to English
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple steps to get accurate translations
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {translationSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="rounded-full bg-primary text-white p-4 w-12 h-12 mx-auto mb-4 flex items-center justify-center text-lg font-bold">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.name}</h3>
                <p className="text-muted-foreground text-sm">{step.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/text-translate">
              <Button size="lg">
                Start Translating Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Burmese translation
            </p>
          </div>
          <div className="space-y-6">
            {burmeseFAQ.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-lg mb-3 text-gray-900">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Related Languages */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              More Language Translators
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore other low-resource language translation tools
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="/creole-to-english" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
              <h3 className="font-semibold">Creole to English</h3>
              <p className="text-sm text-muted-foreground mt-1">Kreyòl Ayisyen → English</p>
            </a>
            <a href="/lao-to-english" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
              <h3 className="font-semibold">Lao to English</h3>
              <p className="text-sm text-muted-foreground mt-1">ລາວ → English</p>
            </a>
            <a href="/swahili-to-english" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
              <h3 className="font-semibold">Swahili to English</h3>
              <p className="text-sm text-muted-foreground mt-1">Kiswahili → English</p>
            </a>
            <a href="/telugu-to-english" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
              <h3 className="font-semibold">Telugu to English</h3>
              <p className="text-sm text-muted-foreground mt-1">తెలుగు → English</p>
            </a>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Translate Burmese?
          </h2>
          <p className="text-lg mb-8 text-blue-100">
            Start translating မြန်မာ to English today - it's fast, accurate, and free!
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/text-translate">
              <Button variant="secondary" size="lg">
                Translate Text
              </Button>
            </Link>
            <Link href="/document-translate">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                Translate Documents
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 