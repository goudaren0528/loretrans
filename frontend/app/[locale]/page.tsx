import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { TranslationOptions } from '@/components/translation-options'
import { LanguageGrid } from '@/components/language-grid'
import { FeatureSection } from '@/components/feature-section'
import { FAQ } from '@/components/faq'
import {
  WebApplicationStructuredData,
  OrganizationStructuredData,
} from '@/components/structured-data'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'es': '/es',
        'fr': '/fr',
      },
    },
  };
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  console.log(`[Page] Rendering for locale: ${locale}`);
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Structured Data */}
      <WebApplicationStructuredData />
      <OrganizationStructuredData />
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-left">
                {/* Value Proposition Badge */}
                <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-6">
                  <span className="mr-2">🌍</span>
                  专业小语种翻译 • Google翻译覆盖不到的语言
                </div>
                
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                  让每种语言都能被
                  <span className="text-blue-600">理解</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
                  专注海地克里奥尔语、老挝语、缅甸语等20+小语种翻译，基于Meta NLLB模型，准确率超过90%
                </p>

                {/* Differentiation Comparison */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-xs">✗</span>
                    </div>
                    <div>
                      <div className="font-medium text-red-800">Google翻译</div>
                      <div className="text-red-600">不支持小语种</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <div>
                      <div className="font-medium text-green-800">Transly</div>
                      <div className="text-green-600">专业支持20+小语种</div>
                    </div>
                  </div>
                </div>

                {/* Key Features */}
                <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="flex h-2 w-2 rounded-full bg-green-500"></div>
                    <span>500字符内完全免费</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="flex h-2 w-2 rounded-full bg-blue-500"></div>
                    <span>Meta NLLB AI驱动</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="flex h-2 w-2 rounded-full bg-purple-500"></div>
                    <span>支持文档翻译</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <a
                    href={`/${locale}/text-translate`}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <span className="mr-2">🚀</span>
                    立即免费翻译
                  </a>
                  <a
                    href={`/${locale}/pricing`}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border-2 border-gray-300 px-8 py-4 text-base font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    查看定价
                  </a>
                </div>

                {/* Social Proof */}
                <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★★★★★</span>
                    <span>4.8/5</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <span>已服务10,000+用户</span>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <span>翻译准确率&gt;90%</span>
                </div>
              </div>

              {/* Hero Illustration */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <img
                    src="/images/hero-illustration.svg"
                    alt="AI Translation Platform Illustration"
                    className="w-full max-w-md h-auto"
                  />
                  {/* Floating Language Cards */}
                  <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-3 border">
                    <div className="text-xs font-medium text-gray-600">海地克里奥尔语</div>
                    <div className="text-sm text-gray-800">Bonjou, kijan ou ye?</div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3 border">
                    <div className="text-xs font-medium text-gray-600">English</div>
                    <div className="text-sm text-gray-800">Hello, how are you?</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="relative py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                为什么选择Transly？
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                专业解决Google翻译等主流工具无法处理的小语种翻译需求
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* User Scenario 1 */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">👨‍🎓</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">学术研究者</h3>
                <p className="text-gray-600 mb-4">
                  需要翻译海地克里奥尔语、老挝语等小语种学术文献和研究资料
                </p>
                <div className="text-sm text-blue-600 font-medium">
                  推荐：Starter套餐 ($5) • 适合论文翻译
                </div>
              </div>

              {/* User Scenario 2 */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">移民群体</h3>
                <p className="text-gray-600 mb-4">
                  处理官方文件、法律文档等重要材料的准确翻译需求
                </p>
                <div className="text-sm text-green-600 font-medium">
                  推荐：Basic套餐 ($10) • 高准确率保证
                </div>
              </div>

              {/* User Scenario 3 */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🏢</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">跨境电商</h3>
                <p className="text-gray-600 mb-4">
                  产品描述本地化，批量翻译商品信息到小语种市场
                </p>
                <div className="text-sm text-purple-600 font-medium">
                  推荐：Pro套餐 ($25) • 支持批量翻译
                </div>
              </div>
            </div>

            {/* Cost Comparison */}
            <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm border">
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
                成本对比：为什么Transly更划算？
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-red-50 rounded-xl">
                  <div className="text-3xl font-bold text-red-600 mb-2">$120</div>
                  <div className="text-sm text-red-800 font-medium mb-2">人工翻译</div>
                  <div className="text-xs text-red-600">1000字符 × $0.12/字</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-gray-500 mb-2">不支持</div>
                  <div className="text-sm text-gray-700 font-medium mb-2">Google翻译</div>
                  <div className="text-xs text-gray-500">小语种覆盖不足</div>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">$1</div>
                  <div className="text-sm text-green-800 font-medium mb-2">Transly</div>
                  <div className="text-xs text-green-600">1000字符 × $0.001/字</div>
                  <div className="mt-2 text-xs font-semibold text-green-700">节省99%成本</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Translation Options */}
      <TranslationOptions />

      {/* Supported Languages */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {t('languages.title')}
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                {t('languages.description')}
              </p>
            </div>
            <LanguageGrid />
          </div>
        </div>
      </section>

      {/* Features */}
      <FeatureSection />

      {/* FAQ */}
      <FAQ />

      {/* CTA Section */}
      <section className="relative py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {t('cta.title')}
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            {t('cta.description')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={`/${locale}/text-translate`}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-base font-medium text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
            >
              {t('cta.try_now')}
            </a>
            <a
              href={`/${locale}/document-translate`}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border-2 border-white px-6 py-3 text-base font-medium text-white hover:bg-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
            >
              {t('cta.translate_documents')}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
} 