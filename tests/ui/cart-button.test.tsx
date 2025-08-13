import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import { CartButton } from '@/modules/products/ui/components/cart-button'
import { useCartStore } from '@/modules/checkout/store/use-cart-store'

const TENANT = 't1'
const PRODUCT = 'p1'

describe('CartButton', () => {
  beforeEach(() => {
    try { localStorage.clear() } catch {}
    useCartStore.setState({ tenantCarts: {} })
  })

  it('renders View in Library link when isPurchased is true', () => {
    render(<CartButton tenantSlug={TENANT} productId={PRODUCT} isPurchased />)

    const link = screen.getByRole('link', { name: /view in library/i }) as HTMLAnchorElement
    expect(link).toBeInTheDocument()
    expect(link.href).toBe(`${process.env.NEXT_PUBLIC_APP_URL}/library/${PRODUCT}`)
  })

  it('toggles add/remove states when clicked', () => {
    render(<CartButton tenantSlug={TENANT} productId={PRODUCT} />)

    const button = screen.getByRole('button', { name: /add to cart/i })
    expect(button).toBeInTheDocument()
    // Initially not in cart -> pink background
    expect(button.className).toContain('bg-pink-400')
    expect(button.className).not.toContain('bg-white')

    fireEvent.click(button)

    // After adding, it should say remove and have white background (tailwind-merge wins)
    const removeBtn = screen.getByRole('button', { name: /remove from cart/i })
    expect(removeBtn).toBeInTheDocument()
    expect(removeBtn.className).toContain('bg-white')
    expect(removeBtn.className).not.toContain('bg-pink-400')

    // Second click should return to add state with pink background
    fireEvent.click(removeBtn)
    const addBtn = screen.getByRole('button', { name: /add to cart/i })
    expect(addBtn).toBeInTheDocument()
    expect(addBtn.className).toContain('bg-pink-400')
    expect(addBtn.className).not.toContain('bg-white')
  })
})
