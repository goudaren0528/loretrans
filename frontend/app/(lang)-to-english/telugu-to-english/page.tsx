import { Metadata } from 'next'
import { TranslatorWidget } from '@/components/translator-widget'
import { 
  WebApplicationStructuredData, 
  FAQStructuredData, 
  HowToStructuredData 
} from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'Telugu to English Translator – Free & Accurate Online Tool',
  description: 'Easily translate Telugu to English using our free online tool powered by advanced AI. No signup, no ads – just simple and fast translation.',
  keywords: 'Telugu to English, Telugu translator, Telugu translation, free translator, AI translation',
  openGraph: {
    title: 'Telugu to English Translator – Free & Accurate Online Tool',
    description: 'Easily translate Telugu to English using our free online tool powered by advanced AI.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Telugu to English Translator – Free & Accurate Online Tool',
    description: 'Easily translate Telugu to English using our free online tool powered by advanced AI.',
  },
  alternates: {
    canonical: '/telugu-to-english',
  },
}

const faqData = [
  {
    question: "Is this Telugu to English translator accurate?",
    answer: "Yes, we use Meta's NLLB AI model to ensure high-quality translations from Telugu to English. Our system handles both formal and colloquial Telugu text effectively."
  },
  {
    question: "Is it free to use?",
    answer: "Yes. It is 100% free with no limits or hidden charges. You can translate Telugu text to English as many times as you need."
  },
  {
    question: "Do I need to create an account?",
    answer: "No account required. Simply type or paste your Telugu text and get instant English translation."
  },
  {
    question: "What types of Telugu text can I translate?",
    answer: "Our translator works with all types of Telugu text including everyday conversations, business documents, academic texts, literature, and technical content."
  },
  {
    question: "Can I translate from English to Telugu?",
    answer: "Currently, our tool specializes in Telugu to English translation for optimal accuracy. English to Telugu translation may be added in future updates."
  }
]

const howToSteps = [
  { step: "Enter your Telugu text in the input box above" },
  { step: "Click the 'Translate' button to process your text" },
  { step: "Copy or listen to the English translation result" }
]

export default function TeluguToEnglishPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Structured Data */}
      <WebApplicationStructuredData />
      <FAQStructuredData questions={faqData} />
      <HowToStructuredData 
        title="How to Translate Telugu to English"
        steps={howToSteps.map(item => ({ name: `Step ${howToSteps.indexOf(item) + 1}`, text: item.step }))}
      />

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Telugu to English Translator
            </h1>
            <h2 className="mt-4 text-xl text-gray-700 sm:text-2xl">
              Free & Accurate Online Tool
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Easily translate Telugu to English using our free online tool powered by advanced AI. 
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
              defaultSourceLang="te"
              placeholder="Type your Telugu text here... (మీ తెలుగు వచనాన్ని ఇక్కడ టైప్ చేయండి...)"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Use Our Telugu to English Translator?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Instant Translation</h3>
                <p className="text-gray-600">Get immediate Telugu to English translation with high accuracy using advanced AI models.</p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Dravidian Language Expert</h3>
                <p className="text-gray-600">Specialized understanding of Telugu script, cultural context, and South Indian linguistic patterns.</p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">100% Free & Secure</h3>
                <p className="text-gray-600">No registration required. Your Telugu text is processed securely and not stored on our servers.</p>
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
              How to Translate Telugu to English
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-2">Enter Telugu Text</h3>
                <p className="text-gray-600">Type or paste your Telugu text in the input box. Both formal and colloquial Telugu are supported.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-2">Click Translate</h3>
                <p className="text-gray-600">Press the translate button to process your Telugu text using our advanced AI translation engine.</p>
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
              Perfect for Telugu Translation Needs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-3">💼 Tech Industry</h3>
                <p className="text-gray-600">
                  Essential for IT professionals in Hyderabad, Bangalore, and other tech hubs for business communications.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-3">📚 Education & Research</h3>
                <p className="text-gray-600">
                  Perfect for students and researchers working with Telugu literature, history, or South Indian studies.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-3">🎬 Media & Entertainment</h3>
                <p className="text-gray-600">
                  Translate Telugu film content, news articles, and entertainment media for global audiences.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-3">🏛️ Government & Legal</h3>
                <p className="text-gray-600">
                  Essential for translating official documents, legal papers, and government communications in Andhra Pradesh and Telangana.
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
                Frequently Asked Questions - Telugu to English Translation
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Everything you need to know about our Telugu translator
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
              <a href="/swahili-to-english" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
                <h3 className="font-semibold text-primary">Swahili to English</h3>
                <p className="text-sm text-gray-600 mt-1">Kiswahili translator</p>
              </a>
              <a href="/burmese-to-english" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
                <h3 className="font-semibold text-primary">Burmese to English</h3>
                <p className="text-sm text-gray-600 mt-1">Myanmar language translator</p>
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