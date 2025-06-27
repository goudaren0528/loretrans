import { type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/settings';

export default createMiddleware({
  locales,
  defaultLocale: 'en', // 明确设置默认语言为英语
  localeDetection: true,
  localePrefix: 'always',
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
    }
  }
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
