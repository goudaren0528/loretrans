import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale, type Locale} from './settings';

export default getRequestConfig(async ({locale}) => {
  // Handle undefined locale by using default
  const validLocale = locale || defaultLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(validLocale as Locale)) {
    console.warn(`Invalid locale: ${locale}, falling back to ${defaultLocale}`);
    return {
      locale: defaultLocale,
      messages: (await import(`../messages/${defaultLocale}.json`)).default
    };
  }

  return {
    locale: validLocale as Locale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
}); 