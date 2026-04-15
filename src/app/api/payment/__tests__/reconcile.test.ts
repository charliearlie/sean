import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Supabase mock
//
// The reconcile route issues these Supabase calls:
//
//   supabase.auth.getUser()
//   supabase.from('profiles').select('role').eq('id', uid).single()
//   supabase.from('orders').select('*, order_items(*)').eq('status', …).not(…)   ← pending
//   supabase.from('orders').select('*, order_items(*)').eq('status', …).lt(…)    ← expired
//
// The two `from('orders')` calls must return independent results.  We achieve
// this by making `from` a factory: the first orders call gets a builder whose
// terminal method (`not`) is `mockPendingNot`, the second gets one whose
// terminal method (`lt`) is `mockExpiredLt`.
// ---------------------------------------------------------------------------

const mockSingle = vi.fn()
const mockPendingNot = vi.fn()   // ends the pending-orders chain
const mockExpiredLt  = vi.fn()   // ends the expired-orders chain

let ordersCallCount = 0

function makeOrdersBuilder() {
  ordersCallCount++
  const callIndex = ordersCallCount

  return {
    select: () => ({
      eq: () => ({
        not: (...args: unknown[]) => callIndex === 1 ? mockPendingNot(...args) : mockExpiredLt(...args),
        lt:  (...args: unknown[]) => mockExpiredLt(...args),
      }),
    }),
  }
}

const mockGetUser = vi.fn()

const mockFrom = vi.fn((table: string) => {
  if (table === 'profiles') {
    return {
      select: () => ({
        eq: () => ({ single: mockSingle }),
      }),
    }
  }
  return makeOrdersBuilder()
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

const mockTransitionOrderStatus = vi.fn()
vi.mock('@/lib/data/orders', () => ({
  transitionOrderStatus: (...args: unknown[]) => mockTransitionOrderStatus(...args),
}))

const mockAdjustStock = vi.fn()
vi.mock('@/lib/data/stock', () => ({
  adjustStock: (...args: unknown[]) => mockAdjustStock(...args),
}))

const mockGetZiinaPaymentIntent = vi.fn()
vi.mock('@/lib/ziina', () => ({
  getZiinaPaymentIntent: (...args: unknown[]) => mockGetZiinaPaymentIntent(...args),
}))

const mockSendOrderConfirmation = vi.fn()
vi.mock('@/lib/email/send-order-confirmation', () => ({
  sendOrderConfirmation: (...args: unknown[]) => mockSendOrderConfirmation(...args),
}))

// ---------------------------------------------------------------------------
// Import route under test (after mocks are registered)
// ---------------------------------------------------------------------------

import { POST } from '../reconcile/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ADMIN_USER = { id: 'admin-uid' }
const ADMIN_PROFILE = { role: 'admin' }

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-1',
    order_number: 'ORD-001',
    payment_intent_id: 'pi_abc',
    status: 'payment_processing',
    order_items: [
      { variant_id: 'variant-1', quantity: 2 },
      { variant_id: 'variant-2', quantity: 1 },
    ],
    ...overrides,
  }
}

/**
 * Configure the two `from('orders')` calls.
 * - pendingResult  → resolved by the `.not()` terminal (pending payment orders)
 * - expiredResult  → resolved by the `.lt()` terminal (expired orders)
 */
function setupOrderQueries(
  pendingResult: { data: unknown[] | null; error: unknown },
  expiredResult: { data: unknown[] | null; error: unknown },
) {
  ordersCallCount = 0
  mockPendingNot.mockResolvedValue(pendingResult)
  mockExpiredLt.mockResolvedValue(expiredResult)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/payment/reconcile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ordersCallCount = 0

    // Default: authenticated admin
    mockGetUser.mockResolvedValue({ data: { user: ADMIN_USER }, error: null })
    mockSingle.mockResolvedValue({ data: ADMIN_PROFILE, error: null })

    // Default: no pending or expired orders
    setupOrderQueries({ data: [], error: null }, { data: [], error: null })

    mockTransitionOrderStatus.mockResolvedValue({ id: 'order-1', status: 'paid' })
    mockGetZiinaPaymentIntent.mockResolvedValue({ id: 'pi_abc', status: 'completed' })
    mockSendOrderConfirmation.mockResolvedValue(undefined)
    mockAdjustStock.mockResolvedValue(undefined)
  })

  // -------------------------------------------------------------------------
  // 1. Authentication
  // -------------------------------------------------------------------------

  describe('when there is no authenticated user', () => {
    it('returns 401 Unauthorized', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      const res = await POST()
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
      mockSingle.mockResolvedValue({ data: { role: 'customer' }, error: null })

      const res = await POST()
      const json = await res.json()

      expect(res.status).toBe(403)
      expect(json.error).toBe('Forbidden')
    })

    it('returns 403 when profile is null', async () => {
      mockSingle.mockResolvedValue({ data: null, error: null })

      const res = await POST()
      const json = await res.json()

      expect(res.status).toBe(403)
      expect(json.error).toBe('Forbidden')
    })
  })

  // -------------------------------------------------------------------------
  // 3. No pending orders
  // -------------------------------------------------------------------------

  describe('when there are no pending orders', () => {
    it('returns 200 with an empty results array and the no-pending message', async () => {
      setupOrderQueries({ data: [], error: null }, { data: [], error: null })

      const res = await POST()
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.message).toBe('No pending orders to reconcile')
      expect(json.results).toEqual([])
    })

    it('does not call Ziina or transition any order', async () => {
      setupOrderQueries({ data: [], error: null }, { data: [], error: null })

      await POST()

      expect(mockGetZiinaPaymentIntent).not.toHaveBeenCalled()
      expect(mockTransitionOrderStatus).not.toHaveBeenCalled()
    })
  })

  // -------------------------------------------------------------------------
  // 4. Completed payment → marked paid + confirmation sent
  // -------------------------------------------------------------------------

  describe('when a payment intent is completed', () => {
    const order = makeOrder()

    beforeEach(() => {
      setupOrderQueries({ data: [order], error: null }, { data: [], error: null })
      mockGetZiinaPaymentIntent.mockResolvedValue({ id: 'pi_abc', status: 'completed' })
      mockTransitionOrderStatus.mockResolvedValue({ id: order.id, status: 'paid' })
      mockSendOrderConfirmation.mockResolvedValue(undefined)
    })

    it('transitions the order to paid with payment details', async () => {
      await POST()

      expect(mockTransitionOrderStatus).toHaveBeenCalledWith(
        order.id,
        'payment_processing',
        'paid',
        { payment_transaction_ref: 'pi_abc', payment_method: 'ziina' },
      )
    })

    it('fires off a confirmation email', async () => {
      await POST()

      expect(mockSendOrderConfirmation).toHaveBeenCalledWith(order.id)
    })

    it('records action as marked_paid in results', async () => {
      const res = await POST()
      const json = await res.json()

      expect(json.results).toContainEqual({
        orderId: order.id,
        orderNumber: order.order_number,
        action: 'marked_paid',
      })
    })

    it('records already_transitioned when transition returns null (race condition)', async () => {
      mockTransitionOrderStatus.mockResolvedValue(null)

      const res = await POST()
      const json = await res.json()

      expect(json.results).toContainEqual(
        expect.objectContaining({ action: 'already_transitioned' }),
      )
      expect(mockSendOrderConfirmation).not.toHaveBeenCalled()
    })
  })

  // -------------------------------------------------------------------------
  // 5. Failed / canceled payment → cancelled + stock restored
  // -------------------------------------------------------------------------

  describe.each([
    ['failed'],
    ['canceled'],
  ])('when Ziina status is "%s"', (ziinaStatus) => {
    const order = makeOrder()

    beforeEach(() => {
      setupOrderQueries({ data: [order], error: null }, { data: [], error: null })
      mockGetZiinaPaymentIntent.mockResolvedValue({ id: 'pi_abc', status: ziinaStatus })
      mockTransitionOrderStatus.mockResolvedValue({ id: order.id, status: 'cancelled' })
    })

    it('transitions the order to cancelled', async () => {
      await POST()

      expect(mockTransitionOrderStatus).toHaveBeenCalledWith(
        order.id,
        'payment_processing',
        'cancelled',
      )
    })

    it('restores stock for each item', async () => {
      await POST()

      expect(mockAdjustStock).toHaveBeenCalledTimes(order.order_items.length)
      expect(mockAdjustStock).toHaveBeenCalledWith(
        'variant-1', 2, 'return', null, order.id,
        'Reconciliation - payment failed, stock restored',
      )
      expect(mockAdjustStock).toHaveBeenCalledWith(
        'variant-2', 1, 'return', null, order.id,
        'Reconciliation - payment failed, stock restored',
      )
    })

    it('records action as cancelled in results', async () => {
      const res = await POST()
      const json = await res.json()

      expect(json.results).toContainEqual({
        orderId: order.id,
        orderNumber: order.order_number,
        action: 'cancelled',
      })
    })

    it('does not restore stock when transition returns null (race condition)', async () => {
      mockTransitionOrderStatus.mockResolvedValue(null)

      await POST()

      expect(mockAdjustStock).not.toHaveBeenCalled()
    })
  })

  // -------------------------------------------------------------------------
  // 6. Still-pending payment
  // -------------------------------------------------------------------------

  describe('when a payment intent is still in progress', () => {
    it.each(['pending', 'requires_payment_instrument', 'processing'])(
      'records action still_%s for Ziina status "%s"',
      async (ziinaStatus) => {
        const order = makeOrder()
        setupOrderQueries({ data: [order], error: null }, { data: [], error: null })
        mockGetZiinaPaymentIntent.mockResolvedValue({ id: 'pi_abc', status: ziinaStatus })

        const res = await POST()
        const json = await res.json()

        expect(json.results).toContainEqual({
          orderId: order.id,
          orderNumber: order.order_number,
          action: `still_${ziinaStatus}`,
        })
        expect(mockTransitionOrderStatus).not.toHaveBeenCalled()
      },
    )
  })

  // -------------------------------------------------------------------------
  // 7. Expired orders
  // -------------------------------------------------------------------------

  describe('when there are expired orders', () => {
    const expiredOrder = makeOrder({
      id: 'order-expired',
      order_number: 'ORD-EXP',
      payment_intent_id: null,
      expires_at: new Date(Date.now() - 60_000).toISOString(),
    })

    // A placeholder pending order so the route does not return early before
    // reaching the expired-orders loop.  It resolves to still_pending via
    // Ziina so it does not interfere with the expired-order assertions.
    const placeholderPendingOrder = makeOrder({ id: 'order-placeholder', order_number: 'ORD-PH' })

    beforeEach(() => {
      setupOrderQueries(
        { data: [placeholderPendingOrder], error: null },
        { data: [expiredOrder], error: null },
      )
      mockGetZiinaPaymentIntent.mockResolvedValue({ id: 'pi_abc', status: 'pending' })
      mockTransitionOrderStatus.mockResolvedValue({ id: expiredOrder.id, status: 'cancelled' })
    })

    it('transitions the expired order to cancelled', async () => {
      await POST()

      expect(mockTransitionOrderStatus).toHaveBeenCalledWith(
        expiredOrder.id,
        'payment_processing',
        'cancelled',
      )
    })

    it('restores stock for each item on the expired order', async () => {
      await POST()

      expect(mockAdjustStock).toHaveBeenCalledWith(
        'variant-1', 2, 'return', null, expiredOrder.id,
        'Order expired - stock restored',
      )
      expect(mockAdjustStock).toHaveBeenCalledWith(
        'variant-2', 1, 'return', null, expiredOrder.id,
        'Order expired - stock restored',
      )
    })

    it('records action as expired_cancelled in results', async () => {
      const res = await POST()
      const json = await res.json()

      expect(json.results).toContainEqual({
        orderId: expiredOrder.id,
        orderNumber: expiredOrder.order_number,
        action: 'expired_cancelled',
      })
    })

    it('does not add an expired_cancelled entry when transition returns null', async () => {
      mockTransitionOrderStatus.mockResolvedValue(null)

      const res = await POST()
      const json = await res.json()

      const expiredEntry = json.results.find(
        (r: { action: string }) => r.action === 'expired_cancelled',
      )
      expect(expiredEntry).toBeUndefined()
    })
  })

  // -------------------------------------------------------------------------
  // 8. Per-order Ziina errors are captured per-order, not thrown globally
  // -------------------------------------------------------------------------

  describe('when Ziina throws for a single order', () => {
    it('records an error action for that order and still returns 200', async () => {
      const order = makeOrder()
      setupOrderQueries({ data: [order], error: null }, { data: [], error: null })
      mockGetZiinaPaymentIntent.mockRejectedValue(new Error('Ziina timeout'))

      const res = await POST()
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.results).toContainEqual(
        expect.objectContaining({ orderId: order.id, action: 'error: Ziina timeout' }),
      )
    })
  })

  // -------------------------------------------------------------------------
  // 9. Top-level database errors bubble up as 500
  // -------------------------------------------------------------------------

  describe('when the pending-orders query throws', () => {
    it('returns 500', async () => {
      mockPendingNot.mockRejectedValue(new Error('DB unavailable'))

      const res = await POST()

      expect(res.status).toBe(500)
    })
  })
})
