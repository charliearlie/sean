import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockGetUser, mockFrom, mockSendShippingNotification } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockSendShippingNotification: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  ),
}))

vi.mock('@/lib/email/send-shipping-notification', () => ({
  sendShippingNotification: mockSendShippingNotification,
}))

import { POST } from '@/app/api/orders/[id]/notify-shipped/route'

function makeRequest(body: Record<string, unknown> = {}) {
  return new NextRequest('http://localhost/api/orders/order-1/notify-shipped', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function makeParams(id = 'order-1') {
  return { params: Promise.resolve({ id }) }
}

// Wires mockFrom to return a chain that resolves to `role` from profiles.select().eq().single()
// Route query: .from('profiles').select('role').eq('id', user.id).single()
function setupProfileRole(role: string | null) {
  const single = vi.fn().mockResolvedValue({ data: role ? { role } : null, error: null })
  const eq = vi.fn(() => ({ single }))
  const select = vi.fn(() => ({ eq }))
  mockFrom.mockReturnValue({ select })
}

describe('POST /api/orders/[id]/notify-shipped', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no user is authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const response = await POST(makeRequest(), makeParams())
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized' })
  })

  it('returns 403 when authenticated user is not an admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    setupProfileRole('customer')

    const response = await POST(makeRequest(), makeParams())
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body).toEqual({ error: 'Forbidden' })
  })

  it('sends notification with tracking number and URL when admin calls endpoint', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } })
    setupProfileRole('admin')
    mockSendShippingNotification.mockResolvedValue(undefined)

    const request = makeRequest({ trackingNumber: 'TRK-123', trackingUrl: 'https://track.example.com' })
    const response = await POST(request, makeParams('order-42'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ success: true })
    expect(mockSendShippingNotification).toHaveBeenCalledWith(
      'order-42',
      'TRK-123',
      'https://track.example.com',
    )
  })

  it('sends notification without tracking info when not provided in body', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } })
    setupProfileRole('admin')
    mockSendShippingNotification.mockResolvedValue(undefined)

    const response = await POST(makeRequest({}), makeParams('order-7'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ success: true })
    expect(mockSendShippingNotification).toHaveBeenCalledWith(
      'order-7',
      undefined,
      undefined,
    )
  })

  it('returns 500 when sendShippingNotification throws', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } })
    setupProfileRole('admin')
    mockSendShippingNotification.mockRejectedValue(new Error('Email service unavailable'))

    const response = await POST(makeRequest({ trackingNumber: 'TRK-999' }), makeParams())
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'Failed to send notification' })
  })
})
