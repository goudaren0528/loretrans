import { type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/settings';

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localeDetection: true,
  localePrefix: 'as-needed',
  pathnames: {
    '/': '/',
    '/about': {
      en: '/about',
      es: '/acerca-de', 
      fr: '/a-propos'
    },
    '/contact': {
      en: '/contact',
      es: '/contacto',
      fr: '/contact'
    },
    '/pricing': {
      en: '/pricing',
      es: '/precios',
      fr: '/tarifs'
    },
    '/text-translate': {
      en: '/text-translate',
      es: '/traducir-texto',
      fr: '/traduire-texte'
    },
    '/document-translate': {
      en: '/document-translate',
      es: '/traducir-documentos',
      fr: '/traduire-documents'
    },
    '/help': {
      en: '/help',
      es: '/ayuda',
      fr: '/aide'
    },
    '/privacy': {
      en: '/privacy',
      es: '/privacidad',
      fr: '/confidentialite'
    },
    '/terms': {
      en: '/terms',
      es: '/terminos',
      fr: '/conditions'
    },
    '/compliance': {
      en: '/compliance',
      es: '/cumplimiento',
      fr: '/conformite'
    }
  }
});

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(es|fr)/:path*',

    // Enable redirects that add missing locales but exclude auth, api, and static files
    '/((?!auth|api|_next|_vercel|.*\\..*).*)'
  ]
};
