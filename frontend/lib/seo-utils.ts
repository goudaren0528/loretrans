/**
 * SEO 工具函数
 * 用于生成正确的 hreflang 和 canonical URLs
 */

import { locales } from '@/lib/navigation';

export const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'zh', 'ar', 'hi', 'ht', 'lo', 'pt', 'sw'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

/**
 * 生成页面的 hreflang alternates
 * @param pagePath - 页面路径，如 'sindhi-to-english'
 * @param currentLocale - 当前语言
 * @returns alternates 对象
 */
export function generateHreflangAlternates(pagePath: string, currentLocale: string) {
  const baseUrl = 'https://loretrans.com';
  
  // 生成所有语言版本的 URLs
  const languages: Record<string, string> = {};
  SUPPORTED_LOCALES.forEach(locale => {
    languages[locale] = `${baseUrl}/${locale}/${pagePath}`;
  });

  return {
    canonical: `${baseUrl}/${currentLocale}/${pagePath}`,
    languages
  };
}

/**
 * 生成 OpenGraph locale 格式
 * @param locale - 语言代码
 * @returns OpenGraph 格式的 locale
 */
export function getOpenGraphLocale(locale: string): string {
  const localeMap: Record<string, string> = {
    'en': 'en_US',
    'fr': 'fr_FR', 
    'es': 'es_ES',
    'zh': 'zh_CN',
    'ar': 'ar_SA',
    'hi': 'hi_IN',
    'ht': 'ht_HT',
    'lo': 'lo_LA',
    'pt': 'pt_BR',
    'sw': 'sw_KE'
  };
  
  return localeMap[locale] || 'en_US';
}

/**
 * 验证语言代码是否支持
 * @param locale - 语言代码
 * @returns 是否支持该语言
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}
