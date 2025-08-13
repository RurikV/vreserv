import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocks must be declared before importing the route - use vi.hoisted to avoid hoist issues
const { constructEventMock, retrieveMock, findByIDMock, createMock, updateMock } = vi.hoisted(() => ({
  constructEventMock: vi.fn(),
  retrieveMock: vi.fn(),
  findByIDMock: vi.fn(),
  createMock: vi.fn(),
  updateMock: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: constructEventMock },
    checkout: { sessions: { retrieve: retrieveMock } },
  }
}))

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({
    findByID: findByIDMock,
    create: createMock,
    update: updateMock,
  }))
}))

import { POST } from '@/app/(app)/api/stripe/webhooks/route'

function makeReq(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/stripe/webhooks', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

beforeEach(() => {
  constructEventMock.mockReset()
  retrieveMock.mockReset()
  findByIDMock.mockReset()
  createMock.mockReset()
  updateMock.mockReset()
})

describe('Stripe webhook route', () => {
  it('returns 400 for invalid signature', async () => {
    constructEventMock.mockImplementation(() => { throw new Error('Invalid signature') })
    const req = makeReq({}),
          reqWithHeaders = new Request(req, { headers: { 'stripe-signature': 'bad' } })

    const res = await POST(reqWithHeaders)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toMatch(/Webhook Error/i)
  })

  it('returns 200 for non-permitted event types', async () => {
    constructEventMock.mockReturnValue({ id: 'evt_1', type: 'payment_intent.created' })
    const req = makeReq({}, { 'stripe-signature': 'sig' })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.message).toBe('Received')
  })

  it('handles checkout.session.completed and creates orders from line items', async () => {
    constructEventMock.mockReturnValue({
      id: 'evt_ok',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_123', metadata: { userId: 'u1' } } },
      account: 'acct_1',
    })

    findByIDMock.mockResolvedValue({ id: 'u1' })

    retrieveMock.mockResolvedValue({
      line_items: {
        data: [
          { price: { product: { metadata: { id: 'prod_1' }, name: 'Prod 1' } } },
          { price: { product: { metadata: { id: 'prod_2' }, name: 'Prod 2' } } },
        ]
      }
    })

    const req = makeReq({}, { 'stripe-signature': 'sig' })
    const res = await POST(req)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.message).toBe('Received')

    // Two orders created
    expect(createMock).toHaveBeenCalledTimes(2)
    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'orders',
      data: expect.objectContaining({ user: 'u1', stripeCheckoutSessionId: 'cs_123', stripeAccountId: 'acct_1' })
    }))
  })

  it('returns 500 when handler processing fails', async () => {
    constructEventMock.mockReturnValue({
      id: 'evt_fail',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_123', metadata: { userId: 'missing' } } },
      account: 'acct_1',
    })

    // Simulate missing user
    findByIDMock.mockResolvedValue(undefined)

    const req = makeReq({}, { 'stripe-signature': 'sig' })
    const res = await POST(req)

    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.message).toBe('Webhook handler failed')
  })
})


// Additional test: account.updated updates tenant and returns 200
it('handles account.updated and updates tenant flags', async () => {
  constructEventMock.mockReturnValue({
    id: 'evt_acct',
    type: 'account.updated',
    data: { object: { id: 'acct_1', details_submitted: true } },
    account: 'acct_1',
  })

  const req = new Request('http://localhost/api/stripe/webhooks', {
    method: 'POST',
    headers: { 'stripe-signature': 'sig' },
    body: JSON.stringify({}),
  })

  const res = await POST(req)
  expect(res.status).toBe(200)
  const json = await res.json()
  expect(json.message).toBe('Received')

  expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
    collection: 'tenants',
    where: { stripeAccountId: { equals: 'acct_1' } },
    data: { stripeDetailsSubmitted: true },
  }))
})
