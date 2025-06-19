import { Metadata } from 'next'
import { TranslatorWidget } from '@/components/translator-widget'
import { 
  WebApplicationStructuredData, 
  FAQStructuredData, 
  HowToStructuredData 
} from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'Swahili to English Translator – Free & Accurate Online Tool',
  description: 'Easily translate Swahili to English using our free online tool powered by advanced AI. No signup, no ads – just simple and fast translation.',
  keywords: 'Swahili to English, Kiswahili translator, Swahili translation, free translator, AI translation',
  openGraph: {
    title: 'Swahili to English Translator – Free & Accurate Online Tool',
    description: 'Easily translate Swahili to English using our free online tool powered by advanced AI.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swahili to English Translator – Free & Accurate Online Tool',
    description: 'Easily translate Swahili to English using our free online tool powered by advanced AI.',
  },
  alternates: {
    canonical: '/swahili-to-english',
  },
}

const faqData = [
  {
    question: "Is this Swahili to English translator accurate?",
    answer: "Yes, we use Meta's NLLB AI model to ensure high-quality translations from Swahili to English. Our system handles both standard Swahili and regional variations effectively."
  },
  {
    question: "Is it free to use?",
    answer: "Yes. It is 100% free with no limits or hidden charges. You can translate Swahili text to English as many times as you need."
  },
  {
    question: "Do I need to create an account?",
    answer: "No account required. Simply type or paste your Swahili text and get instant English translation."
  },
  {
    question: "What types of Swahili text can I translate?",
    answer: "Our translator works with all types of Swahili text including everyday conversations, business documents, academic texts, news articles, and cultural content."
  },
  {
    question: "Can I translate from English to Swahili?",
    answer: "Currently, our tool specializes in Swahili to English translation for optimal accuracy. English to Swahili translation may be added in future updates."
  }
]

const howToSteps = [
  { step: "Enter your Swahili text in the input box above" },
  { step: "Click the 'Translate' button to process your text" },
  { step: "Copy or listen to the English translation result" }
]

export default function SwahiliToEnglishPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Structured Data */}
      <WebApplicationStructuredData />
      <FAQStructuredData questions={faqData} />
      <HowToStructuredData 
        title="How to Translate Swahili to English"
        steps={howToSteps.map(item => ({ name: `Step ${howToSteps.indexOf(item) + 1}`, text: item.step }))}
      />

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Swahili to English Translator
            </h1>
            <h2 className="mt-4 text-xl text-gray-700 sm:text-2xl">
              Free & Accurate Online Tool
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Easily translate Swahili (Kiswahili) to English using our free online tool powered by advanced AI. 
              No signup, no ads – just simple and fast translation.
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-2 w-2 rounded-full bg-green-500"></div>
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-2 w-2 rounded-full bg-blue-500"></div>
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-2 w-2 rounded-full bg-purple-500"></div>
                <span>Instant Results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Translator Widget */}
      <section className="relative py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <TranslatorWidget 
              defaultSourceLang="sw"
              placeholder="Type your Swahili text here... (Andika maandishi yako ya Kiswahili hapa...)"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Use Our Swahili to English Translator?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Instant Translation</h3>
                <p className="text-gray-600">Get immediate Swahili to English translation with high accuracy using advanced AI models.</p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">East African Expertise</h3>
                <p className="text-gray-600">Specialized in East African Swahili variants, understanding cultural context and regional expressions.</p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">100% Free & Secure</h3>
                <p className="text-gray-600">No registration required. Your Swahili text is processed securely and not stored on our servers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="relative py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              How to Translate Swahili to English
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-2">Enter Swahili Text</h3>
                <p className="text-gray-600">Type or paste your Swahili text in the input box. We support all Swahili dialects and variations.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-2">Click Translate</h3>
                <p className="text-gray-600">Press the translate button to process your Swahili text using our advanced AI translation engine.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-2">Get English Result</h3>
                <p className="text-gray-600">Instantly receive accurate English translation. Copy the result or listen to the pronunciation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Perfect for Swahili Translation Needs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-3">📚 Academic & Research</h3>
                <p className="text-gray-600">
                  Essential for students and researchers working with Swahili literature, history, or East African studies.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-3">💼 Business in East Africa</h3>
                <p className="text-gray-600">
                  Translate business communications, contracts, and documents for trade with Kenya, Tanzania, and Uganda.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-3">🌍 Cultural Understanding</h3>
                <p className="text-gray-600">
                  Bridge cultural gaps for news articles, social media content, and community communications.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-3">✈️ Travel & Tourism</h3>
                <p className="text-gray-600">
                  Perfect for travelers to East Africa or those working in tourism and hospitality sectors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Frequently Asked Questions - Swahili to English Translation
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Everything you need to know about our Swahili translator
              </p>
            </div>
            
            <div className="space-y-6">
              {faqData.map((faq, index) => (
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
            
            <div className="mt-12 text-center">
              <p className="text-gray-600">
                Have more questions?{' '}
                <a
                  href="mailto:support@transly.app"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Contact our support team
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* More Translators Section */}
      <section className="relative py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              More Language Translators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a href="/creole-to-english" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
                <h3 className="font-semibold text-primary">Creole to English</h3>
                <p className="text-sm text-gray-600 mt-1">Haitian Creole translator</p>
              </a>
              <a href="/lao-to-english" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
                <h3 className="font-semibold text-primary">Lao to English</h3>
                <p className="text-sm text-gray-600 mt-1">Laotian translator</p>
              </a>
              <a href="/burmese-to-english" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
                <h3 className="font-semibold text-primary">Burmese to English</h3>
                <p className="text-sm text-gray-600 mt-1">Myanmar language translator</p>
              </a>
              <a href="/telugu-to-english" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
                <h3 className="font-semibold text-primary">Telugu to English</h3>
                <p className="text-sm text-gray-600 mt-1">Telugu translator</p>
              </a>
              <a href="/burmese-to-english" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
                <h3 className="font-semibold text-primary">Burmese to English</h3>
                <p className="text-sm text-gray-600 mt-1">Myanmar language translator</p>
              </a>
              <a href="/telugu-to-english" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
                <h3 className="font-semibold text-primary">Telugu to English</h3>
                <p className="text-sm text-gray-600 mt-1">Telugu translator</p>
              </a>
              <a href="/text-translate" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
                <h3 className="font-semibold text-primary">All Languages</h3>
                <p className="text-sm text-gray-600 mt-1">Universal text translator</p>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 