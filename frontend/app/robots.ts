import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/*/admin/',
          '/*/dashboard/',
          '/*/auth/',
          '/*/test-*',
          '/*/demo-*',
          '/*/mock-*',
          '/checkout/mock',
        ],
      },
    ],
    sitemap: 'https://loretrans.com/sitemap.xml',
  }
}