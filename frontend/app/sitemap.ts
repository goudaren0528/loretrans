import { MetadataRoute } from 'next'
import { APP_CONFIG } from '../../config/app.config'
import { locales } from '@/lib/navigation'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://loretrans.app'
  
  // 基础页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/document-translate`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // 小语种到英文页面
  const languageToEnglishPages: MetadataRoute.Sitemap = APP_CONFIG.languages.supported.map((language) => ({
    url: `${baseUrl}/${language.code}-to-english`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // 英文到小语种页面  
  const englishToLanguagePages: MetadataRoute.Sitemap = APP_CONFIG.languages.supported.map((language) => ({
    url: `${baseUrl}/english-to-${language.code}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // 通用翻译页面
  const translationPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/text-translate`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  return [...staticPages, ...languageToEnglishPages, ...englishToLanguagePages, ...translationPages]
} 