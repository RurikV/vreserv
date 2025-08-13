import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'fr', 'it', 'et', 'ru'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  const resolved = (locales.includes(locale as Locale) ? locale : defaultLocale) as Locale;

  return {
    locale: resolved as string,
    messages: (await import(`../messages/${resolved}.json`)).default
  };
});