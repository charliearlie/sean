import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Supabase mock — supports the full chain:
//   supabase.from('orders').select('*, order_items(*)').eq('id', orderId).single()
// ---------------------------------------------------------------------------

const mockSingle = vi.fn()
const mockEq = vi.fn(() => ({ single: mockSingle }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

const mockSupabase = { from: mockFrom }

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

import { GET } from '../verify/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createRequest(orderId?: string) {
  const url = orderId
    ? `http://localhost/api/payment/verify?order=${orderId}`
    : 'http://localhost/api/payment/verify'
  const req = new Request(url, { method: 'GET' })
  return Object.assign(req, {
    nextUrl: new URL(url),
  }) as unknown as import('next/server').NextRequest
}

const ORDER_ID = 'order-abc-123'
const ORDER_NUMBER = 'ORD-001'
const PAYMENT_INTENT_ID = 'pi_ziina_abc'

const baseOrder = {
  id: ORDER_ID,
  order_number: ORDER_NUMBER,
  payment_intent_id: PAYMENT_INTENT_ID,
  status: 'payment_processing',
  order_items: [
    { variant_id: 'variant-1', quantity: 2 },
    { variant_id: 'variant-2', quantity: 1 },
  ],
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/payment/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSingle.mockResolvedValue({ data: baseOrder })
    mockGetZiinaPaymentIntent.mockResolvedValue({ id: PAYMENT_INTENT_ID, status: 'completed' })
    mockTransitionOrderStatus.mockResolvedValue({ id: ORDER_ID, status: 'paid' })
    mockSendOrderConfirmation.mockResolvedValue(undefined)
    mockAdjustStock.mockResolvedValue(undefined)
  })

  // -------------------------------------------------------------------------
  // 1. Missing order ID
  // -------------------------------------------------------------------------

  describe('when order ID is missing', () => {
    it('returns 400 with an error message', async () => {
      const res = await GET(createRequest())
      const json = await res.json()

      expect(res.status).toBe(400)
      expect(json.error).toBe('Missing order ID')
    })
  })

  // -------------------------------------------------------------------------
  // 2. Order not found / missing payment_intent_id
  // -------------------------------------------------------------------------

  describe('when order is not found', () => {
    it('returns 404 when supabase returns null', async () => {
      mockSingle.mockResolvedValue({ data: null })

      const res = await GET(createRequest(ORDER_ID))
      const json = await res.json()

      expect(res.status).toBe(404)
      expect(json.error).toBe('Order not found')
    })

    it('returns 404 when order has no payment_intent_id', async () => {
      mockSingle.mockResolvedValue({ data: { ...baseOrder, payment_intent_id: null } })

      const res = await GET(createRequest(ORDER_ID))
      const json = await res.json()

      expect(res.status).toBe(404)
      expect(json.error).toBe('Order not found')
    })
  })

  // -------------------------------------------------------------------------
  // 3. Already paid — idempotent
  // -------------------------------------------------------------------------

  describe('when order is already paid', () => {
    it('returns status paid without calling Ziina', async () => {
      mockSingle.mockResolvedValue({ data: { ...baseOrder, status: 'paid' } })

      const res = await GET(createRequest(ORDER_ID))
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json).toEqual({ status: 'paid', orderNumber: ORDER_NUMBER })
      expect(mockGetZiinaPaymentIntent).not.toHaveBeenCalled()
    })
  })

  // -------------------------------------------------------------------------
  // 4. Already cancelled — idempotent
  // -------------------------------------------------------------------------

  describe('when order is already cancelled', () => {
    it('returns status failed without calling Ziina', async () => {
      mockSingle.mockResolvedValue({ data: { ...baseOrder, status: 'cancelled' } })

      const res = await GET(createRequest(ORDER_ID))
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json).toEqual({ status: 'failed', orderNumber: ORDER_NUMBER })
      expect(mockGetZiinaPaymentIntent).not.toHaveBeenCalled()
    })
  })

  // -------------------------------------------------------------------------
  // 5. Ziina completed — transitions to paid and sends confirmation email
  // -------------------------------------------------------------------------

  describe('when Ziina status is completed', () => {
    it('transitions order to paid with transaction details', async () => {
      await GET(createRequest(ORDER_ID))

      expect(mockTransitionOrderStatus).toHaveBeenCalledWith(
        ORDER_ID,
        'payment_processing',
        'paid',
        { payment_transaction_ref: PAYMENT_INTENT_ID, payment_method: 'ziina' }
      )
    })

    it('sends the confirmation email after successful transition', async () => {
      await GET(createRequest(ORDER_ID))

      expect(mockSendOrderConfirmation).toHaveBeenCalledWith(ORDER_ID)
    })

    it('returns status paid with order number', async () => {
      const res = await GET(createRequest(ORDER_ID))
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json).toEqual({ status: 'paid', orderNumber: ORDER_NUMBER })
    })
  })

  // -------------------------------------------------------------------------
  // 6. Ziina completed but transition returns null (race — already processed)
  // -------------------------------------------------------------------------

  describe('when Ziina is completed but transition returns null', () => {
    it('does NOT send confirmation email', async () => {
      mockTransitionOrderStatus.mockResolvedValue(null)

      await GET(createRequest(ORDER_ID))

      expect(mockSendOrderConfirmation).not.toHaveBeenCalled()
    })

    it('still returns status paid', async () => {
      mockTransitionOrderStatus.mockResolvedValue(null)

      const res = await GET(createRequest(ORDER_ID))
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json).toEqual({ status: 'paid', orderNumber: ORDER_NUMBER })
    })
  })

  // -------------------------------------------------------------------------
  // 7. Ziina failed — transitions to cancelled and restores stock
  // -------------------------------------------------------------------------

  describe('when Ziina status is failed', () => {
    beforeEach(() => {
      mockGetZiinaPaymentIntent.mockResolvedValue({ id: PAYMENT_INTENT_ID, status: 'failed' })
      mockTransitionOrderStatus.mockResolvedValue({ id: ORDER_ID, status: 'cancelled' })
    })

    it('transitions order to cancelled', async () => {
      await GET(createRequest(ORDER_ID))

      expect(mockTransitionOrderStatus).toHaveBeenCalledWith(
        ORDER_ID,
        'payment_processing',
        'cancelled'
      )
    })

    it('restores stock for every order item', async () => {
      await GET(createRequest(ORDER_ID))

      expect(mockAdjustStock).toHaveBeenCalledTimes(baseOrder.order_items.length)
      expect(mockAdjustStock).toHaveBeenCalledWith(
        'variant-1', 2, 'return', null, ORDER_ID, 'Payment failed - stock restored'
      )
      expect(mockAdjustStock).toHaveBeenCalledWith(
        'variant-2', 1, 'return', null, ORDER_ID, 'Payment failed - stock restored'
      )
    })

    it('returns status failed with order number', async () => {
      const res = await GET(createRequest(ORDER_ID))
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json).toEqual({ status: 'failed', orderNumber: ORDER_NUMBER })
    })

    it('also treats canceled (Ziina spelling) as a failure', async () => {
      mockGetZiinaPaymentIntent.mockResolvedValue({ id: PAYMENT_INTENT_ID, status: 'canceled' })

      const res = await GET(createRequest(ORDER_ID))
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.status).toBe('failed')
      expect(mockTransitionOrderStatus).toHaveBeenCalledWith(
        ORDER_ID,
        'payment_processing',
        'cancelled'
      )
    })
  })

  // -------------------------------------------------------------------------
  // 8. Ziina failed but transition returns null (race — already processed)
  // -------------------------------------------------------------------------

  describe('when Ziina is failed but transition returns null', () => {
    it('does NOT restore stock', async () => {
      mockGetZiinaPaymentIntent.mockResolvedValue({ id: PAYMENT_INTENT_ID, status: 'failed' })
      mockTransitionOrderStatus.mockResolvedValue(null)

      await GET(createRequest(ORDER_ID))

      expect(mockAdjustStock).not.toHaveBeenCalled()
    })

    it('still returns status failed', async () => {
      mockGetZiinaPaymentIntent.mockResolvedValue({ id: PAYMENT_INTENT_ID, status: 'failed' })
      mockTransitionOrderStatus.mockResolvedValue(null)

      const res = await GET(createRequest(ORDER_ID))
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.status).toBe('failed')
    })
  })

  // -------------------------------------------------------------------------
  // 9. Ziina still pending / processing
  // -------------------------------------------------------------------------

  describe('when Ziina status is still pending', () => {
    it.each(['pending', 'requires_payment_instrument', 'requires_user_action'])(
      'returns status pending for Ziina status "%s"',
      async (ziinaStatus) => {
        mockGetZiinaPaymentIntent.mockResolvedValue({ id: PAYMENT_INTENT_ID, status: ziinaStatus })

        const res = await GET(createRequest(ORDER_ID))
        const json = await res.json()

        expect(res.status).toBe(200)
        expect(json).toEqual({ status: 'pending', orderNumber: ORDER_NUMBER })
        expect(mockTransitionOrderStatus).not.toHaveBeenCalled()
        expect(mockAdjustStock).not.toHaveBeenCalled()
      }
    )
  })

  // -------------------------------------------------------------------------
  // 10. Unexpected errors
  // -------------------------------------------------------------------------

  describe('when an unexpected error occurs', () => {
    it('returns 500 with the error message', async () => {
      mockSingle.mockRejectedValue(new Error('DB connection lost'))

      const res = await GET(createRequest(ORDER_ID))
      const json = await res.json()

      expect(res.status).toBe(500)
      expect(json.error).toBe('DB connection lost')
    })

    it('returns 500 with a generic message for non-Error throws', async () => {
      mockSingle.mockRejectedValue('unexpected string throw')

      const res = await GET(createRequest(ORDER_ID))
      const json = await res.json()

      expect(res.status).toBe(500)
      expect(json.error).toBe('Verification failed')
    })

    it('returns 500 when Ziina throws', async () => {
      mockGetZiinaPaymentIntent.mockRejectedValue(new Error('Ziina API server error (503)'))

      const res = await GET(createRequest(ORDER_ID))
      const json = await res.json()

      expect(res.status).toBe(500)
      expect(json.error).toContain('503')
    })
  })
})
