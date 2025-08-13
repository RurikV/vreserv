import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { cn, generateTenantURL, formatCurrency } from '@/lib/utils'

const OLD_ENV = { ...process.env }

describe('utils: cn', () => {
  it('merges class names and resolves conflicts via tailwind-merge', () => {
    const result = cn('p-2', 'bg-red-500', 'bg-blue-500')
    // last background color wins
    expect(result).toContain('p-2')
    expect(result).toContain('bg-blue-500')
    expect(result).not.toContain('bg-red-500')
  })

  it('supports conditional and object syntax like clsx', () => {
    const truthy = true
    const falsy = false
    const result = cn('p-2', falsy && 'hidden', { 'font-bold': truthy, 'italic': falsy })
    expect(result).toContain('p-2')
    expect(result).toContain('font-bold')
    expect(result).not.toContain('hidden')
    expect(result).not.toContain('italic')
  })
})

describe('utils: generateTenantURL', () => {
  beforeEach(() => {
    process.env = { ...OLD_ENV }
    process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'example.com'
  })
  afterEach(() => {
    process.env = { ...OLD_ENV }
  })

  it('returns app URL with /tenants/:slug in development', () => {
    process.env.NODE_ENV = 'development'
    process.env.NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING = 'true' // even if true, dev overrides

    const url = generateTenantURL('acme')
    expect(url).toBe(`${process.env.NEXT_PUBLIC_APP_URL}/tenants/acme`)
  })

  it('returns app URL with /tenants/:slug when subdomain routing disabled', () => {
    process.env.NODE_ENV = 'production'
    process.env.NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING = 'false'

    const url = generateTenantURL('acme')
    expect(url).toBe(`${process.env.NEXT_PUBLIC_APP_URL}/tenants/acme`)
  })

  it('returns https://<slug>.<root_domain> in production with subdomain routing enabled', () => {
    process.env.NODE_ENV = 'production'
    process.env.NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING = 'true'
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'myshop.com'

    const url = generateTenantURL('acme')
    expect(url).toBe('https://acme.myshop.com')
  })
})

describe('utils: formatCurrency', () => {
  it('formats numbers as USD with 0 fraction digits', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235')
    expect(formatCurrency(1000)).toBe('$1,000')
  })

  it('coerces string values to number', () => {
    expect(formatCurrency('9999')).toBe('$9,999')
  })
})
