import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import { useCart } from '@/modules/checkout/hooks/use-cart'
import { useCartStore } from '@/modules/checkout/store/use-cart-store'

function TestComp({ tenant }: { tenant: string }) {
  const cart = useCart(tenant)
  return (
    <div>
      <span data-testid="total">{cart.totalItems}</span>
      <div data-testid="ids">{cart.productIds.join(',')}</div>
      <button data-testid="toggle" onClick={() => cart.toggleProduct('p1')}>toggle p1</button>
      <button data-testid="add-p2" onClick={() => cart.addProduct('p2')}>add p2</button>
      <button data-testid="remove-p1" onClick={() => cart.removeProduct('p1')}>remove p1</button>
      <button data-testid="clear" onClick={() => cart.clearCart()}>clear</button>
    </div>
  )
}

describe('useCart hook', () => {
  beforeEach(() => {
    try { localStorage.clear() } catch {}
    useCartStore.setState({ tenantCarts: {} })
  })

  it('toggles and tracks total items for a tenant', () => {
    render(<TestComp tenant="t1" />)

    expect(screen.getByTestId('total').textContent).toBe('0')

    fireEvent.click(screen.getByTestId('toggle')) // add p1
    expect(screen.getByTestId('total').textContent).toBe('1')
    expect(screen.getByTestId('ids').textContent).toBe('p1')

    fireEvent.click(screen.getByTestId('add-p2')) // add p2
    expect(screen.getByTestId('total').textContent).toBe('2')
    expect(screen.getByTestId('ids').textContent).toBe('p1,p2')

    fireEvent.click(screen.getByTestId('toggle')) // remove p1
    expect(screen.getByTestId('total').textContent).toBe('1')
    expect(screen.getByTestId('ids').textContent).toBe('p2')
  })

  it('clears only the current tenant cart', () => {
    // Prepare two tenants
    const { rerender } = render(<TestComp tenant="t1" />)
    fireEvent.click(screen.getByTestId('toggle')) // t1 -> p1

    rerender(<TestComp tenant="t2" />)
    fireEvent.click(screen.getByTestId('toggle')) // t2 -> p1
    fireEvent.click(screen.getByTestId('add-p2')) // t2 -> p2
    expect(screen.getByTestId('ids').textContent).toBe('p1,p2')

    // Clear t2 only
    fireEvent.click(screen.getByTestId('clear'))
    expect(screen.getByTestId('ids').textContent).toBe('')

    // Rerender t1 to verify intact
    rerender(<TestComp tenant="t1" />)
    expect(screen.getByTestId('ids').textContent).toBe('p1')
  })
})
