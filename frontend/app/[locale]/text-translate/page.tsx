'use client';

import { UnifiedTranslator } from '@/components/translation/unified-translator';
// import { MobileTranslator } from "@/components/mobile/mobile-translator"
import { LanguageGrid } from '@/components/language-grid';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

// 文本翻译专用 FAQ 组件
function TextTranslateFAQ() {
  const t = useTranslations('TextTranslatePage');
  
  const faqData = [
    {
      question: t('faq_items.q1.question'),
      answer: t('faq_items.q1.answer'),
    },
    {
      question: t('faq_items.q2.question'),
      answer: t('faq_items.q2.answer'),
    },
    {
      question: t('faq_items.q3.question'),
      answer: t('faq_items.q3.answer'),
    },
    {
      question: t('faq_items.q4.question'),
      answer: t('faq_items.q4.answer'),
    },
    {
      question: t('faq_items.q5.question'),
      answer: t('faq_items.q5.answer'),
    },
    {
      question: t('faq_items.q6.question'),
      answer: t('faq_items.q6.answer'),
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('sections.faq.title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t('sections.faq.subtitle')}
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
              {t('contact.more_questions')}{' '}
              <a
                href="mailto:support@loretrans.app"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {t('contact.contact_support')}
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
              {t('hero.subtitle')}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex h-2 w-2 rounded-full bg-green-500"></div>
                <span>{t('hero.features.free_500_chars')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex h-2 w-2 rounded-full bg-blue-500"></div>
                <span>{t('hero.features.smart_time_estimation')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex h-2 w-2 rounded-full bg-purple-500"></div>
                <span>{t('hero.features.unified_experience')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex h-2 w-2 rounded-full bg-orange-500"></div>
                <span>{t('hero.features.error_recovery')}</span>
              </div>
            </div>
          </div>

          {/* 翻译器组件 - 响应式显示 */}
          <div className="max-w-7xl mx-auto">
            {isMobile ? (
              <UnifiedTranslator 
                defaultSourceLang="ht"
                defaultTargetLang="en"
                showTimeEstimate={true}
              />
            ) : (
              <UnifiedTranslator 
                defaultSourceLang="ht"
                defaultTargetLang="en"
                showTimeEstimate={true}
              />
            )}
          </div>
        </div>
      </section>

      {/* 其他语言推荐 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('sections.explore_languages.title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t('sections.explore_languages.subtitle')}
            </p>
          </div>
          <LanguageGrid />
        </div>
      </section>

      {/* FAQ 部分 */}
      <TextTranslateFAQ />

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {t('sections.cta.title')}
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            {t('sections.cta.subtitle')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/document-translate"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 shadow-lg"
            >
              {t('sections.cta.try_document')}
            </a>
            <a
              href="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-base font-semibold text-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-200"
            >
              {t('sections.cta.view_pricing')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
} 