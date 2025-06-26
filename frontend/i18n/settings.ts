export const locales = ['en', 'es', 'fr'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// Use this to detect the user's preferred language
export function getPreferredLocale(): Locale {
  if (typeof navigator === 'undefined') return defaultLocale;
  
  const browserLocales = navigator.languages.map(l => l.split('-')[0]);
  const preferred = browserLocales.find(l => locales.includes(l as Locale));
  
  return (preferred as Locale) || defaultLocale;
} 