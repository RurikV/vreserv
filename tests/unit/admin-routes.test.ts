import { describe, it, expect } from 'vitest'

describe('Admin Routes Logic', () => {
  // Test the admin route pattern matching logic directly
  const adminRouteRegex = /^\/(?:en|fr|it|et|ru)\/admin(?:\/.*)?$/
  const locales = ['en', 'fr', 'it', 'et', 'ru']

  const testUrls = [
    { url: '/admin', shouldMatch: false, description: 'Direct admin access' },
    { url: '/en/admin', shouldMatch: true, description: 'English admin route' },
    { url: '/fr/admin', shouldMatch: true, description: 'French admin route' },
    { url: '/it/admin', shouldMatch: true, description: 'Italian admin route' },
    { url: '/et/admin', shouldMatch: true, description: 'Estonian admin route' },
    { url: '/ru/admin', shouldMatch: true, description: 'Russian admin route' },
    { url: '/en/admin/collections/users', shouldMatch: true, description: 'English admin with path' },
    { url: '/fr/admin/dashboard', shouldMatch: true, description: 'French admin with path' },
    { url: '/admin-panel', shouldMatch: false, description: 'Similar but different route' },
    { url: '/en/admin-panel', shouldMatch: false, description: 'Similar but different localized route' },
    { url: '/de/admin', shouldMatch: false, description: 'Unsupported locale' },
  ]

  it('should correctly identify admin routes that need redirection', () => {
    testUrls.forEach(({ url, shouldMatch, description }) => {
      const matches = adminRouteRegex.test(url)
      if (shouldMatch) {
        expect(matches, `${description}: ${url} should match admin pattern`).toBe(true)
      } else {
        expect(matches, `${description}: ${url} should not match admin pattern`).toBe(false)
      }
    })
  })

  it('should correctly extract redirect targets from localized admin routes', () => {
    const localizedAdminRoutes = [
      { input: '/en/admin', expected: '/admin' },
      { input: '/fr/admin', expected: '/admin' },
      { input: '/it/admin', expected: '/admin' },
      { input: '/et/admin', expected: '/admin' },
      { input: '/ru/admin', expected: '/admin' },
      { input: '/en/admin/collections/users', expected: '/admin/collections/users' },
      { input: '/fr/admin/dashboard', expected: '/admin/dashboard' },
      { input: '/ru/admin/collections/products/edit/123', expected: '/admin/collections/products/edit/123' },
    ]

    localizedAdminRoutes.forEach(({ input, expected }) => {
      const redirectTarget = input.replace(/^\/(?:en|fr|it|et|ru)/, '')
      expect(redirectTarget, `${input} should redirect to ${expected}`).toBe(expected)
    })
  })

  it('should verify all supported locales are included in the pattern', () => {
    const patternLocales = adminRouteRegex.source.match(/\(\?\:([^)]+)\)/)?.[1]?.split('|') || []
    expect(patternLocales.sort()).toEqual(locales.sort())
  })

  it('should handle direct admin access correctly', () => {
    const directAdminRoutes = ['/admin', '/admin/', '/admin/collections', '/admin/dashboard']
    
    directAdminRoutes.forEach(route => {
      const shouldPassThrough = route.startsWith('/admin')
      expect(shouldPassThrough, `${route} should pass through directly`).toBe(true)
      
      const shouldNotRedirect = !adminRouteRegex.test(route)
      expect(shouldNotRedirect, `${route} should not be redirected`).toBe(true)
    })
  })

  it('should validate the complete admin routing logic flow', () => {
    const testCases = [
      {
        pathname: '/admin',
        expectRedirect: false,
        expectPassThrough: true,
        description: 'Direct admin access passes through'
      },
      {
        pathname: '/admin/collections/users',
        expectRedirect: false,
        expectPassThrough: true,
        description: 'Direct admin sub-route passes through'
      },
      {
        pathname: '/en/admin',
        expectRedirect: true,
        redirectTarget: '/admin',
        description: 'Localized admin route redirects'
      },
      {
        pathname: '/fr/admin/dashboard',
        expectRedirect: true,
        redirectTarget: '/admin/dashboard',
        description: 'Localized admin sub-route redirects'
      },
      {
        pathname: '/en/about',
        expectRedirect: false,
        expectPassThrough: false,
        description: 'Non-admin localized route goes to intl middleware'
      }
    ]

    testCases.forEach(({ pathname, expectRedirect, expectPassThrough, redirectTarget, description }) => {
      const adminMatch = pathname.match(adminRouteRegex)
      const isDirectAdmin = pathname.startsWith('/admin')

      if (expectRedirect) {
        expect(adminMatch, `${description}: Should match admin pattern`).not.toBeNull()
        const actualTarget = pathname.replace(/^\/(?:en|fr|it|et|ru)/, '')
        expect(actualTarget, `${description}: Should redirect to correct target`).toBe(redirectTarget)
      } else if (expectPassThrough) {
        expect(isDirectAdmin, `${description}: Should be direct admin route`).toBe(true)
        expect(adminMatch, `${description}: Should not match localized admin pattern`).toBeNull()
      } else {
        expect(adminMatch, `${description}: Should not match admin pattern`).toBeNull()
        expect(isDirectAdmin, `${description}: Should not be direct admin route`).toBe(false)
      }
    })
  })
})