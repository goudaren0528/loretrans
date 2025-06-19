import { MetadataRoute } from 'next'
import { APP_CONFIG } from '../../config/app.config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://transly.app'
  
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

  // 语言特定页面
  const languagePages: MetadataRoute.Sitemap = APP_CONFIG.languages.supported.map((language) => ({
    url: `${baseUrl}/${language.code}-to-english`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...languagePages]
} 