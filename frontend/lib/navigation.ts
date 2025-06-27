import { LANG_TO_ENGLISH_PAGES } from '../../config/app.config';
import { createLocalizedPathnamesNavigation, Pathnames } from 'next-intl/navigation';

// 支持的语言代码
export const locales = ['en', 'zh', 'es', 'pt', 'fr', 'ar'] as const;
export type Locale = typeof locales[number];

// 页面路径的国际化映射
export const PAGE_TRANSLATIONS: Pathnames<typeof locales> = {
  '/': '/',
  '/about': {
    en: '/about',
    es: '/acerca-de',
    fr: '/a-propos',
    zh: '/about',
    pt: '/about',
    ar: '/about',
  },
  '/contact': {
    en: '/contact',
    es: '/contacto',
    fr: '/contact',
    zh: '/contact',
    pt: '/contact',
    ar: '/contact',
  },
  '/pricing': {
    en: '/pricing',
    es: '/precios',
    fr: '/tarifs',
    zh: '/pricing',
    pt: '/pricing',
    ar: '/pricing',
  },
  '/text-translate': {
    en: '/text-translate',
    es: '/traducir-texto',
    fr: '/traduire-texte',
    zh: '/text-translate',
    pt: '/text-translate',
    ar: '/text-translate',
  },
  '/document-translate': {
    en: '/document-translate',
    es: '/traducir-documentos',
    fr: '/traduire-documents',
    zh: '/document-translate',
    pt: '/document-translate',
    ar: '/document-translate',
  },
  '/help': {
    en: '/help',
    es: '/ayuda',
    fr: '/aide',
    zh: '/help',
    pt: '/help',
    ar: '/help',
  },
  '/privacy': {
    en: '/privacy',
    es: '/privacidad',
    fr: '/confidentialite',
    zh: '/privacy',
    pt: '/privacy',
    ar: '/privacy',
  },
  '/terms': {
    en: '/terms',
    es: '/terminos',
    fr: '/conditions',
    zh: '/terms',
    pt: '/terms',
    ar: '/terms',
  },
  '/compliance': {
    en: '/compliance',
    es: '/cumplimiento',
    fr: '/conformite',
    zh: '/compliance',
    pt: '/compliance',
    ar: '/compliance',
  },
  '/api-docs': {
    en: '/api-docs',
    es: '/documentacion-api',
    fr: '/documentation-api',
    zh: '/api-docs',
    pt: '/api-docs',
    ar: '/api-docs',
  },
  // ... 其他语言特定页面
};


// 获取给定locale的页面路径
export function getLocalizedPath(locale: Locale, path: string): string {
  const pathConfig = PAGE_TRANSLATIONS[path as keyof typeof PAGE_TRANSLATIONS];
  if (typeof pathConfig === 'string') {
    return pathConfig;
  }
  if (pathConfig && typeof pathConfig === 'object' && pathConfig[locale]) {
    return pathConfig[locale]!;
  }
  return path;
}

// 获取英文原始路径
export function getOriginalPath(locale: Locale, localizedPath: string): string {
  for (const [originalPath, pathConfig] of Object.entries(PAGE_TRANSLATIONS)) {
    if (typeof pathConfig === 'object') {
      const entry = Object.entries(pathConfig).find(([, translated]) => translated === localizedPath);
      if (entry) {
        return originalPath;
      }
    } else if (pathConfig === localizedPath) {
      return pathConfig;
    }
  }
  return localizedPath;
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
  // 由于我们使用 localePrefix: 'always'，所有语言都需要前缀
  const fullPath = `/${locale}${localizedPath}`;
  
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
  createLocalizedPathnamesNavigation({ locales, pathnames: PAGE_TRANSLATIONS }); 