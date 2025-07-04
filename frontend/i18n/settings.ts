// 支持的界面语言 - 与navigation.ts保持一致
export const locales = [
  'en',    // English (默认)
  'zh',    // Chinese (中文)
  'es',    // Spanish (西班牙语)
  'fr',    // French (法语)
  'ar',    // Arabic (阿拉伯语)
  'hi',    // Hindi (印地语)
  'ht',    // Haitian Creole (海地克里奥尔语)
  'lo',    // Lao (老挝语)
  'my',    // Burmese (缅甸语)
  'pt',    // Portuguese (葡萄牙语)
  'sw',    // Swahili (斯瓦希里语)
  'te',    // Telugu (泰卢固语)
] as const;

export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// 语言显示名称映射
export const localeNames: Record<Locale, { native: string; english: string }> = {
  'en': { native: 'English', english: 'English' },
  'es': { native: 'Español', english: 'Spanish' },
  'fr': { native: 'Français', english: 'French' },
  'ht': { native: 'Kreyòl Ayisyen', english: 'Haitian Creole' },
  'lo': { native: 'ລາວ', english: 'Lao' },
  'sw': { native: 'Kiswahili', english: 'Swahili' },
  'my': { native: 'မြန်မာ', english: 'Burmese' },
  'te': { native: 'తెలుగు', english: 'Telugu' },
  'zh': { native: '中文', english: 'Chinese' },
  'ar': { native: 'العربية', english: 'Arabic' },
  'hi': { native: 'हिन्दी', english: 'Hindi' },
  'pt': { native: 'Português', english: 'Portuguese' },
};

// RTL语言列表
export const rtlLocales: Locale[] = ['ar'];

// 检查是否为RTL语言
export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

// 获取用户首选语言
export function getPreferredLocale(): Locale {
  if (typeof navigator === 'undefined') return defaultLocale;
  
  const browserLocales = navigator.languages.map(l => l.split('-')[0]);
  const preferred = browserLocales.find(l => locales.includes(l as Locale));
  
  return (preferred as Locale) || defaultLocale;
}

// 获取语言的显示名称
export function getLocaleName(locale: Locale, displayIn: 'native' | 'english' = 'native'): string {
  return localeNames[locale]?.[displayIn] || locale;
}

// 支持的翻译语言对（用于翻译功能）
export const supportedTranslationLanguages = [
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
] as const;

// 获取翻译语言信息
export function getTranslationLanguage(code: string) {
  return supportedTranslationLanguages.find(lang => lang.code === code);
} 