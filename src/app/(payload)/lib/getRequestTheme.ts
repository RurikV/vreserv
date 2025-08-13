import { defaultTheme } from '@payloadcms/ui'
import { cookies as nextCookies, headers as nextHeaders } from 'next/headers'

const acceptedThemes = ['dark', 'light'] as const

type Theme = (typeof acceptedThemes)[number]

type CookieValue = string | { value?: string } | undefined

interface CookieLike {
  get: (name: string) => CookieValue
}

interface HeadersLike {
  get: (name: string) => string | null
}

interface AdminConfig {
  theme?: 'all' | Theme | string
}

interface ThemeConfig {
  admin?: AdminConfig
  cookiePrefix?: string
}

type Args = {
  config: ThemeConfig
  cookies?: CookieLike | undefined
  headers?: HeadersLike | undefined
}

export const getRequestTheme = async ({ config, cookies, headers }: Args): Promise<Theme> => {
  const adminTheme = config?.admin?.theme
  if (adminTheme !== 'all' && adminTheme && acceptedThemes.includes(adminTheme as Theme)) {
    return adminTheme as Theme
  }

  // In Next.js 15, cookies() and headers() are async
  let cookieSource: CookieLike | undefined = cookies
  if (!cookieSource && typeof nextCookies === 'function') {
    const ck = await nextCookies()
    cookieSource = ck as unknown as CookieLike
  }

  if (cookieSource && typeof cookieSource.get === 'function') {
    const themeCookie = cookieSource.get(`${config?.cookiePrefix || 'payload'}-theme`)
    const themeFromCookie = typeof themeCookie === 'string' ? themeCookie : themeCookie?.value
    if (themeFromCookie && acceptedThemes.includes(themeFromCookie as Theme)) {
      return themeFromCookie as Theme
    }
  }

  let headerSource: HeadersLike | undefined = headers
  if (!headerSource && typeof nextHeaders === 'function') {
    const hd = await nextHeaders()
    headerSource = hd as unknown as HeadersLike
  }

  if (headerSource && typeof headerSource.get === 'function') {
    const themeFromHeader = headerSource.get('Sec-CH-Prefers-Color-Scheme') || undefined
    if (themeFromHeader && acceptedThemes.includes(themeFromHeader as Theme)) {
      return themeFromHeader as Theme
    }
  }

  return defaultTheme as Theme
}
