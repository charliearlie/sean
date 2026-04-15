import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockCalculateShipping, mockGetFreeShippingThreshold } = vi.hoisted(() => ({
  mockCalculateShipping: vi.fn(),
  mockGetFreeShippingThreshold: vi.fn(),
}))

vi.mock('@/lib/data/shipping', () => ({
  calculateShipping: mockCalculateShipping,
  getFreeShippingThreshold: mockGetFreeShippingThreshold,
}))

import { GET } from '@/app/api/shipping/rate/route'

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/shipping/rate')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return new NextRequest(url)
}

describe('GET /api/shipping/rate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when emirate parameter is missing', async () => {
    const response = await GET(makeRequest({ subtotal: '100' }))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ error: 'emirate parameter required' })
  })

  it('returns shipping cost with freeShippingApplied false when subtotal is below threshold', async () => {
    mockCalculateShipping.mockResolvedValue(25)
    mockGetFreeShippingThreshold.mockResolvedValue(200)

    const response = await GET(makeRequest({ emirate: 'Dubai', subtotal: '100' }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      shippingCost: 25,
      freeShippingApplied: false,
      freeShippingThreshold: 200,
    })
    expect(mockCalculateShipping).toHaveBeenCalledWith('Dubai', 100)
  })

  it('returns 0 cost and freeShippingApplied true when subtotal meets threshold', async () => {
    mockCalculateShipping.mockResolvedValue(0)
    mockGetFreeShippingThreshold.mockResolvedValue(200)

    const response = await GET(makeRequest({ emirate: 'Abu Dhabi', subtotal: '250' }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      shippingCost: 0,
      freeShippingApplied: true,
      freeShippingThreshold: 200,
    })
  })

  it('defaults subtotal to 0 when not provided in query string', async () => {
    mockCalculateShipping.mockResolvedValue(30)
    mockGetFreeShippingThreshold.mockResolvedValue(200)

    const response = await GET(makeRequest({ emirate: 'Sharjah' }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(mockCalculateShipping).toHaveBeenCalledWith('Sharjah', 0)
    expect(body.freeShippingApplied).toBe(false)
  })

  it('returns 500 when shipping calculation throws', async () => {
    mockCalculateShipping.mockRejectedValue(new Error('DB connection failed'))
    mockGetFreeShippingThreshold.mockResolvedValue(200)

    const response = await GET(makeRequest({ emirate: 'Dubai', subtotal: '100' }))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'Failed to calculate shipping' })
  })
})
