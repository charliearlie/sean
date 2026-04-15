import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Supabase mock
//
// The cancel route queries in this order:
//   1. supabase.auth.getUser()
//   2. supabase.from('profiles').select('role').eq('id', uid).single()
//   3. supabase.from('orders').select('*, order_items(*)').eq('id', id).single()
//   4. supabase.from('orders').update(updates).eq('id', id)
//
// We use separate builders per table, routing via mockFrom.
// ---------------------------------------------------------------------------

const mockProfileSingle = vi.fn()
const profilesBuilder = {
  select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockProfileSingle })) })),
}

const mockOrderSingle = vi.fn()
const mockUpdateEq = vi.fn()
const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }))
const ordersSelectBuilder = {
  eq: vi.fn(() => ({ single: mockOrderSingle })),
}
const ordersBuilder = {
  select: vi.fn(() => ordersSelectBuilder),
  update: mockUpdate,
}

const mockGetUser = vi.fn()
const mockFrom = vi.fn((table: string) => {
  if (table === 'profiles') return profilesBuilder
  return ordersBuilder
})

const mockSupabase = {
  auth: { getUser: mockGetUser },
  from: mockFrom,
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

// ---------------------------------------------------------------------------
// Domain layer mocks
// ---------------------------------------------------------------------------

const mockAdjustStock = vi.fn()
vi.mock('@/lib/data/stock', () => ({
  adjustStock: (...args: unknown[]) => mockAdjustStock(...args),
}))

// ---------------------------------------------------------------------------
// Import route under test (after mocks are registered)
// ---------------------------------------------------------------------------

import { POST } from '../[id]/cancel/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ORDER_ID = 'order-abc-123'
const ADMIN_USER = { id: 'admin-uid' }
const ADMIN_PROFILE = { role: 'admin' }

const baseOrder = {
  id: ORDER_ID,
  order_number: 'ORD-001',
  status: 'paid',
  order_items: [
    { variant_id: 'variant-1', quantity: 3 },
    { variant_id: 'variant-2', quantity: 1 },
  ],
}

function createRequest(body: Record<string, unknown> = {}, id = ORDER_ID) {
  const req = new Request(`http://localhost/api/orders/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return req as import('next/server').NextRequest
}

function createParams(id = ORDER_ID) {
  return { params: Promise.resolve({ id }) }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/orders/[id]/cancel', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: authenticated admin
    mockGetUser.mockResolvedValue({ data: { user: ADMIN_USER }, error: null })
    mockProfileSingle.mockResolvedValue({ data: ADMIN_PROFILE, error: null })

    // Default: order exists, is cancellable
    mockOrderSingle.mockResolvedValue({ data: baseOrder, error: null })

    // Default: update succeeds
    mockUpdateEq.mockResolvedValue({ error: null })

    mockAdjustStock.mockResolvedValue(undefined)
  })

  // -------------------------------------------------------------------------
  // 1. Authentication
  // -------------------------------------------------------------------------

  describe('when there is no authenticated user', () => {
    it('returns 401 Unauthorized', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      const res = await POST(createRequest({ status: 'cancelled' }), createParams())
      const json = await res.json()

      expect(res.status).toBe(401)
      expect(json.error).toBe('Unauthorized')
    })
  })

  // -------------------------------------------------------------------------
  // 2. Authorisation
  // -------------------------------------------------------------------------

  describe('when the authenticated user is not an admin', () => {
    it('returns 403 Forbidden for a non-admin role', async () => {
      mockProfileSingle.mockResolvedValue({ data: { role: 'customer' }, error: null })

      const res = await POST(createRequest({ status: 'cancelled' }), createParams())
      const json = await res.json()

      expect(res.status).toBe(403)
      expect(json.error).toBe('Forbidden')
    })

    it('returns 403 when profile is null', async () => {
      mockProfileSingle.mockResolvedValue({ data: null, error: null })

      const res = await POST(createRequest({ status: 'cancelled' }), createParams())
      const json = await res.json()

      expect(res.status).toBe(403)
      expect(json.error).toBe('Forbidden')
    })
  })

  // -------------------------------------------------------------------------
  // 3. Invalid status value
  // -------------------------------------------------------------------------

  describe('when the request body contains an invalid status', () => {
    it('returns 400 for an unrecognised status string', async () => {
      const res = await POST(createRequest({ status: 'deleted' }), createParams())
      const json = await res.json()

      expect(res.status).toBe(400)
      expect(json.error).toBe('Invalid status')
    })

    it('returns 400 for status "pending"', async () => {
      const res = await POST(createRequest({ status: 'pending' }), createParams())
      const json = await res.json()

      expect(res.status).toBe(400)
      expect(json.error).toBe('Invalid status')
    })
  })

  // -------------------------------------------------------------------------
  // 4. Order not found
  // -------------------------------------------------------------------------

  describe('when the order does not exist', () => {
    it('returns 404 when supabase returns null data', async () => {
      mockOrderSingle.mockResolvedValue({ data: null, error: null })

      const res = await POST(createRequest({ status: 'cancelled' }), createParams())
      const json = await res.json()

      expect(res.status).toBe(404)
      expect(json.error).toBe('Order not found')
    })

    it('returns 404 when supabase returns an error', async () => {
      mockOrderSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })

      const res = await POST(createRequest({ status: 'cancelled' }), createParams())
      const json = await res.json()

      expect(res.status).toBe(404)
      expect(json.error).toBe('Order not found')
    })
  })

  // -------------------------------------------------------------------------
  // 5. Order already cancelled or refunded
  // -------------------------------------------------------------------------

  describe('when the order is already in a terminal state', () => {
    it('returns 400 for an already cancelled order', async () => {
      mockOrderSingle.mockResolvedValue({ data: { ...baseOrder, status: 'cancelled' }, error: null })

      const res = await POST(createRequest({ status: 'cancelled' }), createParams())
      const json = await res.json()

      expect(res.status).toBe(400)
      expect(json.error).toBe('Order already cancelled/refunded')
    })

    it('returns 400 for an already refunded order', async () => {
      mockOrderSingle.mockResolvedValue({ data: { ...baseOrder, status: 'refunded' }, error: null })

      const res = await POST(createRequest({ status: 'refunded' }), createParams())
      const json = await res.json()

      expect(res.status).toBe(400)
      expect(json.error).toBe('Order already cancelled/refunded')
    })
  })

  // -------------------------------------------------------------------------
  // 6. Successful cancellation
  // -------------------------------------------------------------------------

  describe('when cancelling an order', () => {
    it('restores stock for each line item', async () => {
      await POST(createRequest({ status: 'cancelled' }), createParams())

      expect(mockAdjustStock).toHaveBeenCalledTimes(baseOrder.order_items.length)
      expect(mockAdjustStock).toHaveBeenCalledWith(
        'variant-1', 3, 'return', 'admin', ORDER_ID,
        'Order cancelled - stock restored',
      )
      expect(mockAdjustStock).toHaveBeenCalledWith(
        'variant-2', 1, 'return', 'admin', ORDER_ID,
        'Order cancelled - stock restored',
      )
    })

    it('updates the order status to cancelled', async () => {
      await POST(createRequest({ status: 'cancelled' }), createParams())

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'cancelled', cancelled_at: expect.any(String) }),
      )
    })

    it('does not set refunded_at when cancelling', async () => {
      await POST(createRequest({ status: 'cancelled' }), createParams())

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates = (mockUpdate.mock.calls as any)[0][0] as Record<string, unknown>
      expect(updates).not.toHaveProperty('refunded_at')
    })

    it('returns 200 with success and the resolved status', async () => {
      const res = await POST(createRequest({ status: 'cancelled' }), createParams())
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json).toEqual({ success: true, status: 'cancelled' })
    })
  })

  // -------------------------------------------------------------------------
  // 7. Successful refund
  // -------------------------------------------------------------------------

  describe('when refunding an order', () => {
    it('restores stock for each line item with the refunded label', async () => {
      await POST(createRequest({ status: 'refunded' }), createParams())

      expect(mockAdjustStock).toHaveBeenCalledTimes(baseOrder.order_items.length)
      expect(mockAdjustStock).toHaveBeenCalledWith(
        'variant-1', 3, 'return', 'admin', ORDER_ID,
        'Order refunded - stock restored',
      )
    })

    it('updates the order status to refunded', async () => {
      await POST(createRequest({ status: 'refunded' }), createParams())

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'refunded', refunded_at: expect.any(String) }),
      )
    })

    it('does not set cancelled_at when refunding', async () => {
      await POST(createRequest({ status: 'refunded' }), createParams())

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates = (mockUpdate.mock.calls as any)[0][0] as Record<string, unknown>
      expect(updates).not.toHaveProperty('cancelled_at')
    })

    it('returns 200 with success and the resolved status', async () => {
      const res = await POST(createRequest({ status: 'refunded' }), createParams())
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json).toEqual({ success: true, status: 'refunded' })
    })
  })

  // -------------------------------------------------------------------------
  // 8. Default status when body omits status field
  // -------------------------------------------------------------------------

  describe('when no status is provided in the request body', () => {
    it('defaults to cancelled', async () => {
      const res = await POST(createRequest({}), createParams())
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json).toEqual({ success: true, status: 'cancelled' })
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'cancelled' }),
      )
    })
  })

  // -------------------------------------------------------------------------
  // 9. Database update failure returns 500
  // -------------------------------------------------------------------------

  describe('when the database update fails', () => {
    it('returns 500 with the error message', async () => {
      mockUpdateEq.mockResolvedValue({ error: new Error('constraint violation') })

      const res = await POST(createRequest({ status: 'cancelled' }), createParams())
      const json = await res.json()

      expect(res.status).toBe(500)
      expect(json.error).toBe('constraint violation')
    })
  })
})
