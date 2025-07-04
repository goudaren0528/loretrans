import { LANG_TO_ENGLISH_PAGES } from '../../config/app.config';
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

// 支持的语言代码 - 包含所有支持的语言
export const locales = ['en', 'zh', 'es', 'fr', 'ar', 'hi', 'ht', 'lo', 'my', 'pt', 'sw', 'te'] as const;
export type Locale = typeof locales[number];

// 页面路径配置 - 统一使用英文路径，提升SEO效果
export const PAGE_TRANSLATIONS = {
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
  // 语言特定翻译页面 - 保持英文路径
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
  // 用户相关页面
  '/dashboard': '/dashboard',
  '/payments': '/payments',
  '/payment-success': '/payment-success',
  // 管理页面
  '/admin': '/admin',
  // 测试页面
  '/demo-payment': '/demo-payment',
  '/test-payment': '/test-payment',
  '/mock-payment': '/mock-payment'
} as const;

// 定义路由配置 - 使用统一英文路径
export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always', // 所有语言都使用前缀，包括英文
  pathnames: PAGE_TRANSLATIONS
});


// 获取给定locale的页面路径 - 统一返回英文路径
export function getLocalizedPath(locale: Locale, path: string): string {
  const pathConfig = PAGE_TRANSLATIONS[path as keyof typeof PAGE_TRANSLATIONS];
  if (pathConfig) {
    return pathConfig;
  }
  return path;
}

// 获取英文原始路径 - 由于统一使用英文路径，直接返回
export function getOriginalPath(locale: Locale, localizedPath: string): string {
  // 检查是否是已知的页面路径
  for (const [originalPath, pathConfig] of Object.entries(PAGE_TRANSLATIONS)) {
    if (pathConfig === localizedPath) {
      return originalPath;
    }
  }
  return localizedPath;
}

// 为给定路径生成所有语言版本的URL - SEO优化
export function generateAlternateUrls(basePath: string, currentLocale: Locale): Record<Locale, string> {
  const alternates: Record<string, string> = {};
  
  for (const locale of locales) {
    const localizedPath = getLocalizedPath(locale, basePath);
    // 所有语言都使用 /{locale}{path} 格式，包括英文
    alternates[locale] = `/${locale}${localizedPath}`;
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

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing); 