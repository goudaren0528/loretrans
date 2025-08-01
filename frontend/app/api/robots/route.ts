import { NextResponse } from 'next/server'

export async function GET() {
  const robotsContent = `# Robots.txt for LoReTrans - AI Translation Platform
# https://loretrans.com

User-agent: *
Allow: /

# Allow all translation pages
Allow: /en/*-to-english
Allow: /en/english-to-*

# Allow main functionality pages
Allow: /en/text-translate
Allow: /en/document-translate
Allow: /en/about
Allow: /en/contact
Allow: /en/pricing

# Disallow admin and management pages
Disallow: /*/admin/
Disallow: /*/dashboard/
Disallow: /api/admin/

# Disallow all test, demo, and mock pages
Disallow: /*/test-*
Disallow: /*/demo-*
Disallow: /*/mock-*
Disallow: /en/test-*
Disallow: /en/demo-*
Disallow: /en/mock-*

# Disallow API endpoints
Disallow: /api/
Disallow: /api/auth/debug
Disallow: /api/auth/mock-*
Disallow: /api/webhooks/*/mock

# Disallow auth pages (not useful for SEO)
Disallow: /*/auth/
Disallow: /en/auth/

# Disallow checkout test pages
Disallow: /checkout/mock

# Allow sitemap
Sitemap: https://loretrans.com/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1`

  return new NextResponse(robotsContent, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}