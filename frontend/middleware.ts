import createMiddleware from 'next-intl/middleware'
import { locales } from './lib/navigation'

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
})

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - /favicon.ico, /sitemap.xml, /robots.txt (static files)
    '/((?!api|_next|_vercel|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}