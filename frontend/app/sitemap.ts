import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://loretrans.com'
  const lastModified = new Date()
  
  // 实际支持的界面语言
  const supportedLocales = [
  "en",
  "zh",
  "es",
  "fr",
  "ar",
  "hi",
  "ht",
  "lo",
  "pt",
  "sw"
]
  
  // 主要语言（包含翻译页面）
  const majorLanguages = [
  "en",
  "zh",
  "es",
  "fr",
  "pt"
]
  
  // 基础页面
  const basePages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    }
  ]
  
  // 多语言主页面和核心页面
  const localePages: MetadataRoute.Sitemap = []
  supportedLocales.forEach(locale => {
    // 主页
    localePages.push({
      url: `${baseUrl}/${locale}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    })
    
    // 核心功能页面（所有语言都有）
    const corePages = [
      { path: 'about', priority: 0.7, freq: 'monthly' as const },
      { path: 'contact', priority: 0.6, freq: 'monthly' as const },
      { path: 'document-translate', priority: 0.9, freq: 'weekly' as const },
      { path: 'help', priority: 0.6, freq: 'monthly' as const },
      { path: 'pricing', priority: 0.8, freq: 'monthly' as const },
      { path: 'privacy', priority: 0.3, freq: 'yearly' as const },
      { path: 'terms', priority: 0.3, freq: 'yearly' as const },
      { path: 'text-translate', priority: 0.9, freq: 'weekly' as const },
    ]
    
    corePages.forEach(page => {
      localePages.push({
        url: `${baseUrl}/${locale}/${page.path}`,
        lastModified,
        changeFrequency: page.freq,
        priority: page.priority,
      })
    })
  })
  
  // 翻译页面（主要语言）
  const translationPages: MetadataRoute.Sitemap = []
  
  // 所有翻译页面列表
  const allTranslationPages = [
    'amharic-to-english',
    'arabic-to-english',
    'burmese-to-english',
    'chinese-to-english',
    'creole-to-english',
    'english-to-amharic',
    'english-to-arabic',
    'english-to-burmese',
    'english-to-chinese',
    'english-to-creole',
    'english-to-french',
    'english-to-hausa',
    'english-to-hindi',
    'english-to-igbo',
    'english-to-khmer',
    'english-to-kyrgyz',
    'english-to-lao',
    'english-to-malagasy',
    'english-to-mongolian',
    'english-to-nepali',
    'english-to-pashto',
    'english-to-portuguese',
    'english-to-sindhi',
    'english-to-sinhala',
    'english-to-spanish',
    'english-to-swahili',
    'english-to-tajik',
    'english-to-telugu',
    'english-to-xhosa',
    'english-to-yoruba',
    'english-to-zulu',
    'french-to-english',
    'hausa-to-english',
    'hindi-to-english',
    'igbo-to-english',
    'khmer-to-english',
    'kyrgyz-to-english',
    'lao-to-english',
    'malagasy-to-english',
    'mongolian-to-english',
    'nepali-to-english',
    'pashto-to-english',
    'portuguese-to-english',
    'sindhi-to-english',
    'sinhala-to-english',
    'spanish-to-english',
    'swahili-to-english',
    'tajik-to-english',
    'telugu-to-english',
    'xhosa-to-english',
    'yoruba-to-english',
    'zulu-to-english',
  ]
  
  // 为主要语言添加翻译页面
  majorLanguages.forEach(locale => {
    allTranslationPages.forEach(page => {
      translationPages.push({
        url: `${baseUrl}/${locale}/${page}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: locale === 'en' ? 0.8 : 0.7, // 英语优先级稍高
      })
    })
  })
  
  // 功能页面（主要语言）
  const functionalPages: MetadataRoute.Sitemap = []
  
  const allFunctionalPages = [
    'api-docs',
    'compliance',
    'document-translate-enhanced',
    'payment-success',
    'payments',
  ]
  
  majorLanguages.forEach(locale => {
    allFunctionalPages.forEach(page => {
      functionalPages.push({
        url: `${baseUrl}/${locale}/${page}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    })
  })
  
  return [
    ...basePages,
    ...localePages,
    ...translationPages,
    ...functionalPages,
  ]
}