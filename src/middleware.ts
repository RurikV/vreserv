import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  // Optional: Configure pathnames for different locales
  pathnames: {
    '/': '/',
    '/about': '/about',
    '/features': '/features', 
    '/pricing': '/pricing',
    '/contact': '/contact'
  }
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(fr|it|et|ru|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)', '/(fr|it|et|ru|en)(.*)']
};
