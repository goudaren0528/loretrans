'use client';

import { TranslatorWidget } from '@/components/translator-widget';
import { LanguageGrid } from '@/components/language-grid';
import { useTranslations } from 'next-intl';

// 文本翻译专用 FAQ 组件
function TextTranslateFAQ() {
  const t = useTranslations('TextTranslatePage.faq');

  const faqData = [
    {
      question: t('q1_title'),
      answer: t('q1_answer'),
    },
    {
      question: t('q2_title'),
      answer: t('q2_answer'),
    },
    {
      question: t('q3_title'),
      answer: t('q3_answer'),
    },
    {
      question: t('q4_title'),
      answer: t('q4_answer'),
    },
    {
      question: t('q5_title'),
      answer: t('q5_answer'),
    },
    {
      question: t('q6_title'),
      answer: t('q6_answer'),
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t('description')}
            </p>
          </div>

          <div className="space-y-6">
            {faqData.map((item, index) => (
              <details
                key={index}
                className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-gray-900 marker:content-['']">
                  {item.question}
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
                  {item.answer}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">
              {t('contact_text')}{' '}
              <a
                href="mailto:support@transly.app"
                className="font-medium text-primary hover:text-primary/80"
              >
                {t('contact_link')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TextTranslatePage() {
  const t = useTranslations('TextTranslatePage');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {t('hero.title')}
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
            <div className="mt-6 flex items-center justify-center gap-x-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-2 w-2 rounded-full bg-green-500"></div>
                <span>{t('hero.status_free')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-2 w-2 rounded-full bg-blue-500"></div>
                <span>{t('hero.status_ai')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-2 w-2 rounded-full bg-purple-500"></div>
                <span>{t('hero.status_instant')}</span>
              </div>
            </div>
          </div>

          {/* 翻译器组件 - 居中显示 */}
          <div className="max-w-5xl mx-auto">
            <TranslatorWidget />
          </div>
        </div>
      </section>

      {/* 其他语言推荐 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('other_languages.title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t('other_languages.description')}
            </p>
          </div>
          <LanguageGrid />
        </div>
      </section>

      {/* FAQ 部分 */}
      <TextTranslateFAQ />

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {t('cta.title')}
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            {t('cta.description')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/document-translate"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-base font-medium text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
            >
              {t('cta.try_document')}
            </a>
            <a
              href="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border-2 border-white px-6 py-3 text-base font-medium text-white hover:bg-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
            >
              {t('cta.view_pricing')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
} 