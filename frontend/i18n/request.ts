import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale, type Locale} from './settings';

export default getRequestConfig(async ({locale}) => {
  // Handle undefined locale by using default
  const validLocale = locale || defaultLocale;
  
  console.log(`[i18n] Loading translations for locale: ${validLocale}`);
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(validLocale as Locale)) {
    console.warn(`Invalid locale: ${locale}, falling back to ${defaultLocale}`);
    return {
      locale: defaultLocale,
      messages: (await import(`../messages/${defaultLocale}.json`)).default
    };
  }

  try {
    const messages = (await import(`../messages/${validLocale}.json`)).default;
    console.log(`[i18n] Successfully loaded ${Object.keys(messages).length} message groups for ${validLocale}`);
    
    // Log HomePage messages for debugging
    if (messages.HomePage) {
      console.log(`[i18n] HomePage.hero.title for ${validLocale}:`, messages.HomePage.hero?.title);
    }
    
    return {
      locale: validLocale as Locale,
      messages
    };
  } catch (error) {
    console.error(`[i18n] Failed to load messages for ${validLocale}:`, error);
    return {
      locale: defaultLocale,
      messages: (await import(`../messages/${defaultLocale}.json`)).default
    };
  }
});
