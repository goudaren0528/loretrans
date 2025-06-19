import React from 'react'

const faqs = [
  {
    question: 'Is Transly really free to use?',
    answer: 'Yes! Transly is completely free for text translation up to 1000 characters per request. There are no hidden fees or subscription requirements.',
  },
  {
    question: 'How accurate are the translations?',
    answer: 'We use Meta\'s NLLB (No Language Left Behind) model, which provides high-quality translations for low-resource languages. While no automated translation is perfect, NLLB is specifically designed to handle languages with limited training data.',
  },
  {
    question: 'Which languages do you support?',
    answer: 'We support 20+ low-resource languages including Haitian Creole, Lao, Swahili, Burmese, Telugu, Sinhala, Amharic, Khmer, Nepali, and Malagasy. All languages can be translated to English.',
  },
  {
    question: 'Is my data safe and private?',
    answer: 'Absolutely. We don\'t store your translation text on our servers. Your text is processed securely and deleted immediately after translation. We take privacy seriously.',
  },
  {
    question: 'Can I translate documents?',
    answer: 'Yes! We support PDF, Word (.docx), and PowerPoint (.pptx) file translation. Simply upload your file and we\'ll extract the text, translate it, and provide you with the results.',
  },
  {
    question: 'How does the text-to-speech feature work?',
    answer: 'Our text-to-speech feature supports English output with high-quality voice synthesis. Simply click the speaker icon next to any translation to hear it pronounced.',
  },
  {
    question: 'Is there a character limit?',
    answer: 'Free users can translate up to 1000 characters per request. For longer texts, you can break them into smaller chunks or upload documents for processing.',
  },
  {
    question: 'Can I use Transly for commercial purposes?',
    answer: 'Yes, you can use Transly for both personal and commercial purposes. For high-volume commercial use, please contact us about our API services.',
  },
]

export function FAQ() {
  return (
    <section className="relative py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to know about Transly
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
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
  )
} 