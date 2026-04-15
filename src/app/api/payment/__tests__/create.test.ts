import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockIn = vi.fn()
const mockSelect = vi.fn(() => ({ in: mockIn }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))
const mockAuth = { getUser: vi.fn() }

const mockSupabase = { from: mockFrom, auth: mockAuth }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

const mockCreateOrder = vi.fn()
const mockTransitionOrderStatus = vi.fn()
vi.mock('@/lib/data/orders', () => ({
  createOrder: (...args: unknown[]) => mockCreateOrder(...args),
  transitionOrderStatus: (...args: unknown[]) => mockTransitionOrderStatus(...args),
}))

const mockAdjustStock = vi.fn()
vi.mock('@/lib/data/stock', () => ({
  adjustStock: (...args: unknown[]) => mockAdjustStock(...args),
}))

const mockCreateZiina = vi.fn()
vi.mock('@/lib/ziina', () => ({
  createZiinaPaymentIntent: (...args: unknown[]) => mockCreateZiina(...args),
}))

vi.mock('@/lib/data/shipping', () => ({
  calculateShipping: vi.fn(() => Promise.resolve(15)),
}))

import { POST } from '../create/route'

function createRequest(body: object) {
  const req = new Request('http://localhost/api/payment/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', origin: 'http://localhost:3000' },
    body: JSON.stringify(body),
  })
  return Object.assign(req, {
    nextUrl: new URL('http://localhost/api/payment/create'),
  }) as unknown as import('next/server').NextRequest
}

const PRODUCT_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const VARIANT_ID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'

const validBody = {
  items: [{
    productId: PRODUCT_ID, variantId: VARIANT_ID, productName: 'BPC-157',
    variantLabel: '5mg', sku: 'BPC5', quantity: 1, unitPrice: 999,
  }],
  contact: { name: 'John', email: 'john@test.com', phone: '123' },
  shipping: { address: '123 St', city: 'Dubai', emirate: 'Dubai', postalCode: '00000' },
}

describe('Payment Create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // Batch query returns array of variants with DB prices
    mockIn.mockResolvedValue({ data: [{ id: VARIANT_ID, stock_quantity: 10, price: 150 }], error: null })
    mockCreateOrder.mockResolvedValue({ id: 'order-1', order_number: 'ORD-123' })
    mockAdjustStock.mockResolvedValue(9)
    mockCreateZiina.mockResolvedValue({ id: 'pi_1', redirect_url: 'https://pay.ziina.com/pi_1' })
    mockTransitionOrderStatus.mockResolvedValue({ id: 'order-1', status: 'payment_processing' })
  })

  it('uses DB prices not client prices for total calculation', async () => {
    const res = await POST(createRequest(validBody))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toEqual({ orderUrl: 'https://pay.ziina.com/pi_1', orderId: 'order-1' })
    // The order should be created with DB price (150), not client price (999)
    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        subtotal: 150, // DB price * quantity, not 999
        total: 165, // 150 + 15 shipping
        items: expect.arrayContaining([
          expect.objectContaining({
            unit_price: 150, // DB price
            total_price: 150, // DB price * quantity
          }),
        ]),
      })
    )
  })

  it('returns 400 when items array is empty', async () => {
    const res = await POST(createRequest({
      ...validBody,
      items: [],
    }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBeDefined()
  })

  it('returns 400 when contact info missing', async () => {
    const res = await POST(createRequest({
      ...validBody,
      contact: { name: '', email: '', phone: '' },
    }))

    expect(res.status).toBe(400)
  })

  it('returns 400 when stock is insufficient', async () => {
    mockIn.mockResolvedValue({ data: [{ id: VARIANT_ID, stock_quantity: 0, price: 150 }], error: null })

    const res = await POST(createRequest(validBody))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('Insufficient stock')
  })

  it('restores stock if Ziina API fails', async () => {
    mockCreateZiina.mockResolvedValue({ error: 'Ziina unavailable' })

    const res = await POST(createRequest(validBody))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Ziina unavailable')
    // Stock was decremented then should be restored
    expect(mockAdjustStock).toHaveBeenCalledTimes(2) // decrement + restore
    // Restore call: adjustStock(variantId, quantity, 'adjustment', user?.id ?? null, orderId, message)
    expect(mockAdjustStock).toHaveBeenLastCalledWith(
      VARIANT_ID, 1, 'adjustment', 'user-1', 'order-1',
      'Payment creation failed - stock restored'
    )
  })

  it('decrements stock for each item after order creation', async () => {
    await POST(createRequest(validBody))

    // adjustStock(variantId, -quantity, 'sale', user?.id ?? null, orderId)
    expect(mockAdjustStock).toHaveBeenCalledWith(
      VARIANT_ID, -1, 'sale', 'user-1', 'order-1'
    )
  })

  it('transitions order from pending to payment_processing with payment_intent_id', async () => {
    await POST(createRequest(validBody))

    expect(mockTransitionOrderStatus).toHaveBeenCalledWith(
      'order-1', 'pending', 'payment_processing', { payment_intent_id: 'pi_1' }
    )
  })

  it('sets expires_at on order', async () => {
    await POST(createRequest(validBody))

    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        expires_at: expect.any(String),
      })
    )
  })

  it('passes null as createdBy when no user', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null } })

    await POST(createRequest(validBody))

    // user?.id ?? null -> null when user is null
    expect(mockAdjustStock).toHaveBeenCalledWith(
      VARIANT_ID, -1, 'sale', null, 'order-1'
    )
  })
})
