'use client';

import { UnifiedTranslator } from '@/components/translation/unified-translator';
import { MobileTranslator } from '@/components/mobile/mobile-translator';
import { LanguageGrid } from '@/components/language-grid';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

// 文本翻译专用 FAQ 组件
function TextTranslateFAQ() {
  const faqData = [
    {
      question: '支持哪些语言翻译？',
      answer: '我们专注于小语种翻译，支持海地克里奥尔语、老挝语、斯瓦希里语、缅甸语、泰卢固语等20+种Google翻译覆盖不足的语言。',
    },
    {
      question: '翻译准确率如何？',
      answer: '基于Meta NLLB模型，我们的翻译准确率超过90%。特别是在小语种翻译方面，比传统翻译工具更加专业和准确。',
    },
    {
      question: '免费额度是多少？',
      answer: '500字符以下完全免费，无需注册。注册用户还可获得500积分奖励，约可翻译5万字符的长文本。',
    },
    {
      question: '如何计算翻译费用？',
      answer: '超过500字符的部分按0.1积分/字符计费。例如翻译1000字符需要消耗50积分，成本约$0.05，比人工翻译节省99%。',
    },
    {
      question: '支持哪些文件格式？',
      answer: '除了文本翻译，我们还支持PDF、Word、PPT等文档格式的翻译。文档翻译会自动提取文本并保持原有格式。',
    },
    {
      question: '翻译结果可以保存吗？',
      answer: '注册用户的翻译历史会自动保存。Starter套餐保存7天，Basic套餐保存30天，Pro套餐保存90天，Business套餐无限保存。',
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              常见问题
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              关于小语种翻译的常见疑问解答
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
              还有其他问题？{' '}
              <a
                href="mailto:support@transly.app"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                联系我们的客服团队
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TextTranslatePage() {
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
              智能小语种翻译
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              AI智能判断处理模式，支持海地克里奥尔语、老挝语、缅甸语等20+种小语种专业翻译
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex h-2 w-2 rounded-full bg-green-500"></div>
                <span>500字符内免费</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex h-2 w-2 rounded-full bg-blue-500"></div>
                <span>智能时间预估</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex h-2 w-2 rounded-full bg-purple-500"></div>
                <span>统一翻译体验</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex h-2 w-2 rounded-full bg-orange-500"></div>
                <span>错误智能恢复</span>
              </div>
            </div>
          </div>

          {/* 翻译器组件 - 响应式显示 */}
          <div className="max-w-7xl mx-auto">
            {isMobile ? (
              <MobileTranslator 
                defaultSourceLang="ht"
                defaultTargetLang="en"
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
              探索更多小语种翻译
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              我们支持20+种小语种的专业翻译服务
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
            准备开始翻译了吗？
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            立即体验专业的小语种翻译服务，500字符内完全免费
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/document-translate"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 shadow-lg"
            >
              尝试文档翻译
            </a>
            <a
              href="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-base font-semibold text-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-200"
            >
              查看定价套餐
            </a>
          </div>
        </div>
      </section>
    </div>
  );
} 