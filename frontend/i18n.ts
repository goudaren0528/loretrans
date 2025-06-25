import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  // (this is a good idea in general)

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});