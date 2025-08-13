import { describe, it, expect, vi, beforeEach } from 'vitest'

const findMock = vi.fn()
vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({ find: findMock }))
}))

import { GET } from '@/app/my-route/route'

beforeEach(() => {
  findMock.mockReset()
})

describe('/my-route GET', () => {
  it('returns categories JSON from payload.find', async () => {
    const fake = { docs: [{ id: 'c1', title: 'Cat 1' }], totalDocs: 1 }
    findMock.mockResolvedValue(fake)

    const res = await GET()
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json).toEqual(fake)

    expect(findMock).toHaveBeenCalledWith({ collection: 'categories' })
  })
})
