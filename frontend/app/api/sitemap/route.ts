import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://loretrans.com'
  const lastmod = new Date().toISOString()
  
  const urls = [
    { url: baseUrl, priority: '1.0', changefreq: 'weekly' },
    { url: `${baseUrl}/en`, priority: '1.0', changefreq: 'weekly' },
    { url: `${baseUrl}/en/text-translate`, priority: '0.9', changefreq: 'weekly' },
    { url: `${baseUrl}/en/document-translate`, priority: '0.9', changefreq: 'weekly' },
    { url: `${baseUrl}/en/about`, priority: '0.7', changefreq: 'monthly' },
    { url: `${baseUrl}/en/pricing`, priority: '0.8', changefreq: 'monthly' },
    { url: `${baseUrl}/en/contact`, priority: '0.6', changefreq: 'monthly' },
    // 主要翻译页面
    { url: `${baseUrl}/en/igbo-to-english`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/en/pashto-to-english`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/en/sindhi-to-english`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/en/sinhala-to-english`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/en/amharic-to-english`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/en/hausa-to-english`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/en/yoruba-to-english`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/en/swahili-to-english`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/en/creole-to-english`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/en/lao-to-english`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/en/burmese-to-english`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/en/telugu-to-english`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/en/khmer-to-english`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/en/nepali-to-english`, priority: '0.8', changefreq: 'weekly' },
  ]
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(item => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}