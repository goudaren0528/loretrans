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
    // - Static files (including all icon files)
    // - AI search optimization file
    // - Google verification files
    '/((?!api|_next/static|_next/image|favicon\\.ico|icon-.*\\.png|icon\\.svg|apple-touch-icon\\.png|loretrans-logo\\.svg|sitemap\\.xml|robots\\.txt|llm\\.txt|images|icons|logo|manifest\\.json|google.*\\.html).*)',
  ],
}