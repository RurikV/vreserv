import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
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

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle admin routes - redirect /(locale)/admin to /admin
  const adminMatch = pathname.match(/^\/(?:en|fr|it|et|ru)\/admin(?:\/.*)?$/);
  if (adminMatch) {
    const newPathname = pathname.replace(/^\/(?:en|fr|it|et|ru)/, '');
    return NextResponse.redirect(new URL(newPathname, request.url));
  }
  
  // Handle direct /admin access - allow it to pass through
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  // Apply internationalization middleware for other routes
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames and admin routes
  matcher: ['/', '/(fr|it|et|ru|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)', '/(fr|it|et|ru|en)(.*)', '/admin/:path*']
};
