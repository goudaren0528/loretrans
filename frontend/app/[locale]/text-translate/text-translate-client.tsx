'use client';

import { EnhancedTextTranslator } from '@/components/translation/enhanced-text-translator';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getFreeCharacterLimit, getMaxTextInputLimit, getCreditRatePerCharacter } from '@/lib/config';
import { TranslationNavButtons } from '@/components/translation-nav-buttons';

// 文本翻译专用 FAQ 组件
function TextTranslateFAQ({ locale }: { locale: string }) {
  const t = useTranslations('TextTranslatePage');
  const freeCharLimit = getFreeCharacterLimit();
  const maxInputLimit = getMaxTextInputLimit();
  const creditRate = getCreditRatePerCharacter(); // 从配置获取
  
  // 计算示例值
  const exampleChars = 2000;
  const billableChars = exampleChars - freeCharLimit;
  const exampleCredits = billableChars * creditRate;
  const exampleCost = (exampleCredits * 0.001).toFixed(2); // 假设1积分=0.001美元
  
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
      question: "What's the maximum text length I can translate?",
      answer: `You can translate up to ${maxInputLimit.toLocaleString()} characters in a single request. Text over ${freeCharLimit} characters will be processed using our queue system.`,
    },
    {
      question: "What is queue mode?",
      answer: "When your text exceeds 1000 characters, it enters queue mode for background processing. You can leave the page and return later to check your translation progress. All translations are saved in your task history.",
    },
    {
      question: t('faq_items.q4.question'),
      answer: t('faq_items.q4.answer', { 
        limit: freeCharLimit, 
        rate: creditRate,
        example: exampleChars,
        credits: exampleCredits,
        billable: billableChars,
        cost: exampleCost
      }),
    },
    {
      question: t('faq_items.q5.question'),
      answer: t('faq_items.q5.answer'),
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('faq.title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t('faq.description')}
            </p>
          </div>
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <details
                key={index}
                className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {item.question}
                  </h3>
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
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              {t('contact.still_have_questions')}
            </p>
            <a
              href="mailto:support@loretrans.com"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t('contact.contact_support')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

interface TextTranslateClientProps {
  locale: string;
}

export function TextTranslateClient({ locale }: TextTranslateClientProps) {
  const t = useTranslations('TextTranslatePage');
  const [isMobile, setIsMobile] = useState(false);
  const freeCharLimit = getFreeCharacterLimit();
  const maxInputLimit = getMaxTextInputLimit();

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
      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-6">
              <span className="mr-2">🌍</span>
              Enhanced Translation Experience
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {t('hero.title')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Translate up to {maxInputLimit.toLocaleString()} characters with intelligent queue processing
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex h-2 w-2 rounded-full bg-green-500"></div>
                <span>Up to {maxInputLimit.toLocaleString()} characters</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex h-2 w-2 rounded-full bg-blue-500"></div>
                <span>Queue processing for large texts</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex h-2 w-2 rounded-full bg-purple-500"></div>
                <span>Background processing</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex h-2 w-2 rounded-full bg-orange-500"></div>
                <span>Translation history</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Translation Interface */}
      <section className="relative py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto mb-8">
            <TranslationNavButtons currentPage="text" locale={locale} />
          </div>
          <EnhancedTextTranslator className="mx-auto max-w-6xl" />
        </div>
      </section>

      {/* FAQ Section */}
      <TextTranslateFAQ locale={locale} />
    </div>
  );
}
