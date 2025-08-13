import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/modules/checkout/store/use-cart-store'

const TENANT = 'tenant-1'

describe('useCartStore (Zustand persisted store)', () => {
  beforeEach(() => {
    // Reset store and storage between tests
    try { localStorage.clear() } catch {}
    useCartStore.setState({ tenantCarts: {} })
  })

  it('starts with empty carts', () => {
    const state = useCartStore.getState()
    expect(state.tenantCarts).toEqual({})
  })

  it('adds products to a tenant cart', () => {
    const { addProduct } = useCartStore.getState()
    addProduct(TENANT, 'p1')
    addProduct(TENANT, 'p2')

    const { tenantCarts } = useCartStore.getState()
    expect(tenantCarts[TENANT].productIds).toEqual(['p1', 'p2'])
  })

  it('removes a product from a tenant cart', () => {
    const { addProduct, removeProduct } = useCartStore.getState()
    addProduct(TENANT, 'p1')
    addProduct(TENANT, 'p2')

    removeProduct(TENANT, 'p1')

    const { tenantCarts } = useCartStore.getState()
    expect(tenantCarts[TENANT].productIds).toEqual(['p2'])
  })

  it('is resilient when removing a non-existent product', () => {
    const { addProduct, removeProduct } = useCartStore.getState()
    addProduct(TENANT, 'p1')

    removeProduct(TENANT, 'not-in-cart')

    const { tenantCarts } = useCartStore.getState()
    expect(tenantCarts[TENANT].productIds).toEqual(['p1'])
  })

  it('clears a specific tenant cart without affecting others', () => {
    const { addProduct, clearCart } = useCartStore.getState()
    addProduct(TENANT, 'p1')
    addProduct('tenant-2', 'x1')

    clearCart(TENANT)

    const { tenantCarts } = useCartStore.getState()
    expect(tenantCarts[TENANT].productIds).toEqual([])
    expect(tenantCarts['tenant-2'].productIds).toEqual(['x1'])
  })

  it('clears all carts', () => {
    const { addProduct, clearAllCarts } = useCartStore.getState()
    addProduct(TENANT, 'p1')
    addProduct('tenant-2', 'x1')

    clearAllCarts()

    const { tenantCarts } = useCartStore.getState()
    expect(tenantCarts).toEqual({})
  })

  it('persists to localStorage under key "reserv-cart"', () => {
    const { addProduct } = useCartStore.getState()
    addProduct(TENANT, 'p1')

    const persisted = localStorage.getItem('reserv-cart')
    expect(persisted).toBeTruthy()
    expect(persisted).toContain('p1')
  })
})
