import { NextResponse } from 'next/server'

export async function GET() {
  const robotsContent = `# Robots.txt for Loretrans - AI Translation Platform
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

# Disallow admin and test pages
Disallow: /en/admin/
Disallow: /en/dashboard/
Disallow: /en/test-*
Disallow: /en/demo-*
Disallow: /en/mock-*
Disallow: /api/

# Disallow auth pages (not useful for SEO)
Disallow: /en/auth/

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