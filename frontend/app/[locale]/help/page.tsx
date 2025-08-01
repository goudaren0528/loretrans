import { Metadata } from 'next'
import { FAQStructuredData } from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'Help & FAQ - LoReTrans AI Translation Tool Support',
  description: 'Get help with LoReTrans AI translation tool. Find answers to common questions about using our free online translator for text, document, and voice translation.',
  keywords: 'help, FAQ, support, translation help, translator guide, AI translation questions',
  openGraph: {
    title: 'Help & FAQ - LoReTrans AI Translation Tool Support',
    description: 'Get help with LoReTrans AI translation tool. Find answers to common questions about using our free online translator.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help & FAQ - LoReTrans AI Translation Tool Support',
    description: 'Get help with LoReTrans AI translation tool. Find answers to common questions about using our free online translator.',
  },
  alternates: {
    canonical: '/help',
  },
}

const generalFAQs = [
  {
    question: "What is LoReTrans?",
    answer: "LoReTrans is a free online AI-powered translation tool that helps you translate text from one language to another instantly. We specialize in translating low-resource languages like Haitian Creole, Lao, Swahili, Burmese, and Telugu to English."
  },
  {
    question: "Is LoReTrans really free?",
    answer: "Yes, LoReTrans is 100% free to use with no hidden charges, no subscription fees, and no limitations on the number of translations you can perform."
  },
  {
    question: "Do I need to create an account?",
    answer: "No account registration is required. You can start using LoReTrans immediately without providing any personal information."
  },
  {
    question: "What languages does LoReTrans support?",
    answer: "We currently support specialized translation for Haitian Creole, Lao, Swahili, Burmese (Myanmar), and Telugu to English. We also offer a general text translator that supports over 200 languages."
  },
  {
    question: "How accurate are the translations?",
    answer: "We use Meta's NLLB (No Language Left Behind) AI model, which provides high-quality translations. While AI translation continues to improve, we recommend having important documents reviewed by native speakers for critical use cases."
  }
]

const usageFAQs = [
  {
    question: "How do I translate text?",
    answer: "Simply visit our text translator, type or paste your text in the input box, select your source language (if needed), and click 'Translate'. The English translation will appear instantly."
  },
  {
    question: "Can I translate documents?",
    answer: "Yes, we offer document translation for text files (.txt). Simply upload your document on our document translation page, and we'll translate the entire content while preserving the original formatting."
  },
  {
    question: "What file formats are supported for document translation?",
    answer: "Currently, we support plain text files (.txt). Support for additional formats like PDF, Word documents, and others is planned for future updates."
  },
  {
    question: "Is there a character limit for translations?",
    answer: "For optimal performance, we recommend keeping translations under 5,000 characters. For longer texts, consider breaking them into smaller segments or using our document translation feature."
  },
  {
    question: "Can I copy the translated text?",
    answer: "Yes, you can easily copy the translated text by clicking the copy button next to the translation result. You can also select and copy the text manually."
  }
]

const technicalFAQs = [
  {
    question: "Why isn't my text translating?",
    answer: "This could be due to several reasons: 1) Check your internet connection, 2) Ensure the text is in a supported language, 3) Try refreshing the page, 4) If the issue persists, contact our support team."
  },
  {
    question: "Can I use LoReTrans on mobile devices?",
    answer: "Yes, LoReTrans is fully responsive and works on all devices including smartphones, tablets, and desktop computers through any modern web browser."
  },
  {
    question: "Do you store my translations?",
    answer: "No, we do not store your translations or personal data. All translations are processed in real-time and are not saved on our servers for privacy and security."
  },
  {
    question: "Can I use LoReTrans offline?",
    answer: "Currently, LoReTrans requires an internet connection to access our AI translation models. An offline version is not available at this time."
  },
  {
    question: "Which browsers are supported?",
    answer: "LoReTrans works on all modern web browsers including Chrome, Firefox, Safari, Edge, and their mobile versions. We recommend using the latest browser version for the best experience."
  }
]

const languageFAQs = [
  {
    question: "Why do you focus on these specific languages?",
    answer: "We specialize in low-resource languages that are often underserved by other translation tools. Languages like Haitian Creole, Lao, Swahili, Burmese, and Telugu have large speaker populations but limited digital translation resources."
  },
  {
    question: "Will you add more languages?",
    answer: "Yes, we're continuously working to add support for more languages, especially those that are underrepresented in current translation tools. Check back regularly for updates."
  },
  {
    question: "Can I translate from English to these languages?",
    answer: "Currently, our specialized tools focus on translating from low-resource languages to English for optimal accuracy. Reverse translation (English to other languages) may be added in future updates."
  },
  {
    question: "How do you handle different dialects?",
    answer: "Our AI models are trained on various dialects and regional variations. However, translation accuracy may vary depending on the specific dialect. We continuously improve our models to handle more variations."
  },
  {
    question: "What about cultural context in translations?",
    answer: "Our AI models are trained to understand cultural context and idiomatic expressions. However, for content requiring deep cultural nuance, we recommend review by native speakers familiar with both cultures."
  }
]

export default function HelpPage() {
  const allFAQs = [
    ...generalFAQs,
    ...usageFAQs,
    ...technicalFAQs,
    ...languageFAQs
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Structured Data */}
      <FAQStructuredData questions={allFAQs} />

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Help & FAQ
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Find answers to common questions about using LoReTrans AI translation tool. 
              Need more help? Contact our support team.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Help Section */}
      <section className="relative py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Quick Start</h3>
                <p className="text-gray-600 text-sm mb-4">New to LoReTrans? Get started in seconds with our simple interface.</p>
                <a href="/text-translate" className="text-primary hover:text-primary/80 font-medium">
                  Start Translating →
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Document Translation</h3>
                <p className="text-gray-600 text-sm mb-4">Translate entire documents while preserving formatting.</p>
                <a href="/document-translate" className="text-primary hover:text-primary/80 font-medium">
                  Upload Document →
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Need Support?</h3>
                <p className="text-gray-600 text-sm mb-4">Can't find what you're looking for? Get direct help from our team.</p>
                <a href="/contact" className="text-primary hover:text-primary/80 font-medium">
                  Contact Support →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* General FAQ Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                General Questions
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Learn the basics about LoReTrans and our translation services
              </p>
            </div>
            
            <div className="space-y-6">
              {generalFAQs.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-gray-900 marker:content-['']">
                    {faq.question}
                    <svg
                      className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="mt-4 text-gray-600 leading-7">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Usage FAQ Section */}
      <section className="relative py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                How to Use LoReTrans
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Step-by-step guidance for using our translation features
              </p>
            </div>
            
            <div className="space-y-6">
              {usageFAQs.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-gray-900 marker:content-['']">
                    {faq.question}
                    <svg
                      className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="mt-4 text-gray-600 leading-7">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical FAQ Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Technical Support
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Troubleshooting and technical questions about our platform
              </p>
            </div>
            
            <div className="space-y-6">
              {technicalFAQs.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-gray-900 marker:content-['']">
                    {faq.question}
                    <svg
                      className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="mt-4 text-gray-600 leading-7">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Language FAQ Section */}
      <section className="relative py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Language Support
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Questions about supported languages and translation quality
              </p>
            </div>
            
            <div className="space-y-6">
              {languageFAQs.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-gray-900 marker:content-['']">
                    {faq.question}
                    <svg
                      className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="mt-4 text-gray-600 leading-7">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Still Need Help?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="mailto:support@loretrans.com"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Email Us Directly
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 