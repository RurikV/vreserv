import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

// Environment variables used in components/routes during tests
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'

// Reset DOM and storage between tests
afterEach(() => {
  cleanup()
  try { localStorage.clear() } catch {}
  try { sessionStorage.clear() } catch {}
})

// Basic mock for next/link to behave like a regular anchor tag during tests
vi.mock('next/link', () => {
  return {
    default: (
      params: React.PropsWithChildren<
        { href: string | URL | { toString?: () => string } } &
          Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>
      >
    ) => {
      const { href, children, ...props } = params
      const url = typeof href === 'string' ? href : (href?.toString?.() ?? '')
      return React.createElement('a', { href: url, ...props }, children)
    }
  }
})

// Mock next/navigation to support next-intl in test environment
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}))

// Basic mock for @payload-config so imports don't fail in tests
vi.mock('@payload-config', () => ({ default: {} }))

// Mock next/font/google to prevent font loading issues in tests
vi.mock('next/font/google', () => {
  const mockFont = () => ({
    className: 'mocked-font'
  })
  
  return {
    default: mockFont,
    Poppins: mockFont,
    Inter: mockFont,
    Roboto: mockFont,
    // Add more font names as needed
    ...Object.fromEntries(
      ['Poppins', 'Inter', 'Roboto', 'Open_Sans', 'Montserrat'].map(font => [font, mockFont])
    )
  }
})

// Mock NextResponse from next/server for API route unit tests
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: (data: unknown, init?: ResponseInit) =>
        new Response(JSON.stringify(data), {
          status: init?.status ?? 200,
          headers: { 'content-type': 'application/json', ...(init?.headers || {}) },
        }),
    },
  }
})


// Mock next-intl hooks and provider for unit tests only
// Integration tests should be able to import real next-intl functionality
// This mock is applied conditionally - integration tests can override it

if (!process.env.VITEST_INTEGRATION_TEST) {
  vi.mock('next-intl', () => {
    const messages: Record<string, string> = {
      'cart.viewInLibrary': 'View in Library',
      'cart.addToCart': 'Add to Cart',
      'cart.removeFromCart': 'Remove from Cart',
    }
    return {
      useTranslations: () => (key: string) => messages[key] ?? key,
      useLocale: () => 'en',
      NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    }
  })
}
