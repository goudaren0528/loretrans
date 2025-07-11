import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/en/admin/',
          '/en/dashboard/',
          '/en/auth/',
        ],
      },
    ],
    sitemap: 'https://loretrans.com/sitemap.xml',
  }
}