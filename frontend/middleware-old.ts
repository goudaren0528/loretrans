import { type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/settings';

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localeDetection: false,
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
  // 排除auth路由、API路由和静态文件
  matcher: ['/((?!api|auth|_next|_vercel|.*\\..*).*)']
};
