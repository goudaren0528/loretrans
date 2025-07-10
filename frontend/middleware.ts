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
    // - API routes
    // - Next.js internals
    // - Static files
    // - AI search optimization file
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|llm.txt|images|icons|logo|manifest.json).*)',
  ],
}