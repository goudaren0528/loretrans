import { createNavigation } from 'next-intl/navigation';
import { LANG_TO_ENGLISH_PAGES } from '../../config/app.config';

// 支持的语言代码
export const locales = ['en', 'es', 'fr'] as const;
export type Locale = typeof locales[number];

// 页面路径的国际化映射
export const PAGE_TRANSLATIONS = {
  en: {
    '/': '/',
    '/about': '/about',
    '/contact': '/contact',
    '/pricing': '/pricing',
    '/text-translate': '/text-translate',
    '/document-translate': '/document-translate',
    '/help': '/help',
    '/privacy': '/privacy',
    '/terms': '/terms',
    '/compliance': '/compliance',
    '/api-docs': '/api-docs',
    // 语言特定页面
    '/creole-to-english': '/creole-to-english',
    '/lao-to-english': '/lao-to-english', 
    '/swahili-to-english': '/swahili-to-english',
    '/burmese-to-english': '/burmese-to-english',
    '/telugu-to-english': '/telugu-to-english',
    '/english-to-creole': '/english-to-creole',
    '/english-to-lao': '/english-to-lao',
    '/english-to-swahili': '/english-to-swahili',
    '/english-to-burmese': '/english-to-burmese',
    '/english-to-telugu': '/english-to-telugu',
  },
  es: {
    '/': '/',
    '/about': '/acerca-de',
    '/contact': '/contacto',
    '/pricing': '/precios',
    '/text-translate': '/traducir-texto',
    '/document-translate': '/traducir-documentos',
    '/help': '/ayuda',
    '/privacy': '/privacidad',
    '/terms': '/terminos',
    '/compliance': '/cumplimiento',
    '/api-docs': '/documentacion-api',
    // 语言特定页面保持英文（更好的SEO）
    '/creole-to-english': '/creole-to-english',
    '/lao-to-english': '/lao-to-english',
    '/swahili-to-english': '/swahili-to-english',
    '/burmese-to-english': '/burmese-to-english',
    '/telugu-to-english': '/telugu-to-english',
    '/english-to-creole': '/english-to-creole',
    '/english-to-lao': '/english-to-lao',
    '/english-to-swahili': '/english-to-swahili',
    '/english-to-burmese': '/english-to-burmese',
    '/english-to-telugu': '/english-to-telugu',
  },
  fr: {
    '/': '/',
    '/about': '/a-propos',
    '/contact': '/contact',
    '/pricing': '/tarifs',
    '/text-translate': '/traduire-texte',
    '/document-translate': '/traduire-documents',
    '/help': '/aide',
    '/privacy': '/confidentialite',
    '/terms': '/conditions',
    '/compliance': '/conformite',
    '/api-docs': '/documentation-api',
    // 语言特定页面保持英文（更好的SEO）
    '/creole-to-english': '/creole-to-english',
    '/lao-to-english': '/lao-to-english',
    '/swahili-to-english': '/swahili-to-english',
    '/burmese-to-english': '/burmese-to-english',
    '/telugu-to-english': '/telugu-to-english',
    '/english-to-creole': '/english-to-creole',
    '/english-to-lao': '/english-to-lao',
    '/english-to-swahili': '/english-to-swahili',
    '/english-to-burmese': '/english-to-burmese',
    '/english-to-telugu': '/english-to-telugu',
  },
} as const;

// 获取给定locale的页面路径
export function getLocalizedPath(locale: Locale, path: string): string {
  const localizedPath = PAGE_TRANSLATIONS[locale][path as keyof typeof PAGE_TRANSLATIONS[typeof locale]];
  return localizedPath || path;
}

// 获取英文原始路径
export function getOriginalPath(locale: Locale, localizedPath: string): string {
  const translations = PAGE_TRANSLATIONS[locale];
  const entry = Object.entries(translations).find(([, translated]) => translated === localizedPath);
  return entry ? entry[0] : localizedPath;
}

// 为给定路径生成所有语言版本的URL
export function generateAlternateUrls(basePath: string, currentLocale: Locale): Record<Locale, string> {
  const alternates: Record<string, string> = {};
  
  for (const locale of locales) {
    const localizedPath = getLocalizedPath(locale, basePath);
    alternates[locale] = locale === 'en' ? localizedPath : `/${locale}${localizedPath}`;
  }
  
  return alternates as Record<Locale, string>;
}

// 检查路径是否需要国际化
export function isInternationalizable(path: string): boolean {
  // 排除API路由、静态文件和特定语言页面
  if (path.startsWith('/api') || 
      path.includes('.') || 
      path.startsWith('/_next') ||
      path.match(/^\/(creole|lao|swahili|burmese|telugu|english)-to-(english|creole|lao|swahili|burmese|telugu)$/)) {
    return false;
  }
  
  return true;
}

// 检测路径中的locale
export function detectLocaleFromPath(path: string): { locale: Locale | null; cleanPath: string } {
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return { locale: null, cleanPath: '/' };
  }
  
  const firstSegment = segments[0];
  
  if (locales.includes(firstSegment as Locale)) {
    const locale = firstSegment as Locale;
    const cleanPath = '/' + segments.slice(1).join('/');
    return { locale, cleanPath: cleanPath === '/' ? '/' : cleanPath };
  }
  
  return { locale: null, cleanPath: path };
}

// 构建带locale的完整URL
export function buildLocalizedUrl(locale: Locale, path: string, baseUrl?: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const localizedPath = getLocalizedPath(locale, cleanPath);
  const fullPath = locale === 'en' ? localizedPath : `/${locale}${localizedPath}`;
  
  if (baseUrl) {
    return new URL(fullPath, baseUrl).toString();
  }
  
  return fullPath;
}

// 语言切换时的路径转换
export function switchLocale(currentPath: string, currentLocale: Locale, targetLocale: Locale): string {
  // 检测当前路径中的locale
  const { cleanPath } = detectLocaleFromPath(currentPath);
  
  // 如果是语言特定页面（如/creole-to-english），保持不变
  if (!isInternationalizable(cleanPath)) {
    return currentPath;
  }
  
  // 获取英文原始路径
  const originalPath = getOriginalPath(currentLocale, cleanPath);
  
  // 构建目标语言的路径
  return buildLocalizedUrl(targetLocale, originalPath);
}

// 导航菜单项配置（支持国际化）
export const navigationItems = [
  { 
    key: 'home',
    href: '/',
    translationKey: 'Navigation.home'
  },
  { 
    key: 'about',
    href: '/about',
    translationKey: 'Navigation.about'
  },
  { 
    key: 'pricing',
    href: '/pricing',
    translationKey: 'Navigation.pricing'
  },
  { 
    key: 'contact',
    href: '/contact',
    translationKey: 'Navigation.contact'
  },
] as const;

export const { Link, redirect, usePathname, useRouter } =
  createNavigation({ locales }); 