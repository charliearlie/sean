import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
const mockSingle = vi.fn()
const mockEq = vi.fn(() => ({ single: mockSingle }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}))

const mockAdjustStock = vi.fn()
vi.mock('@/lib/data/stock', () => ({
  adjustStock: (...args: unknown[]) => mockAdjustStock(...args),
}))

const mockTransitionOrderStatus = vi.fn()
vi.mock('@/lib/data/orders', () => ({
  transitionOrderStatus: (...args: unknown[]) => mockTransitionOrderStatus(...args),
}))

const mockSendOrderConfirmation = vi.fn()
vi.mock('@/lib/email/send-order-confirmation', () => ({
  sendOrderConfirmation: (...args: unknown[]) => mockSendOrderConfirmation(...args),
}))

vi.mock('@/lib/ziina', () => ({
  verifyWebhookSignature: vi.fn(() => true),
}))

import { POST } from '../route'

function createRequest(body: object, headers: Record<string, string> = {}) {
  const bodyStr = JSON.stringify(body)
  return {
    headers: {
      get: (name: string) => {
        const h: Record<string, string> = {
          'x-forwarded-for': '3.29.184.186',
          'content-type': 'application/json',
          ...headers,
        }
        return h[name.toLowerCase()] || null
      },
    },
    text: () => Promise.resolve(bodyStr),
  } as unknown as import('next/server').NextRequest
}

const sampleOrder = {
  id: 'order-1',
  order_number: 'ORD-123',
  status: 'payment_processing',
  order_items: [
    { variant_id: 'v1', quantity: 2 },
    { variant_id: 'v2', quantity: 1 },
  ],
}

describe('Ziina Webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSingle.mockResolvedValue({ data: sampleOrder, error: null })
    mockSendOrderConfirmation.mockResolvedValue(undefined)
    vi.stubEnv('NODE_ENV', 'test')
  })

  it('rejects when secret missing in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    delete process.env.ZIINA_WEBHOOK_SECRET

    const res = await POST(createRequest({
      type: 'payment_intent.status.updated',
      data: { id: 'pi_1', status: 'completed' },
    }))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toContain('not configured')
  })

  it('silently accepts webhook from unauthorized IP', async () => {
    const res = await POST(createRequest(
      { type: 'payment_intent.status.updated', data: { id: 'pi_1', status: 'completed' } },
      { 'x-forwarded-for': '1.2.3.4' },
    ))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ received: true })
    // Should not process further - no order lookup
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('processes valid completed webhook -> transitions to paid + sends email', async () => {
    mockTransitionOrderStatus.mockResolvedValue({ id: 'order-1', status: 'paid' })

    const res = await POST(createRequest({
      type: 'payment_intent.status.updated',
      data: { id: 'pi_1', status: 'completed' },
    }))

    expect(res.status).toBe(200)
    expect(mockTransitionOrderStatus).toHaveBeenCalledWith(
      'order-1', 'payment_processing', 'paid',
      { payment_transaction_ref: 'pi_1', payment_method: 'ziina' }
    )
    expect(mockSendOrderConfirmation).toHaveBeenCalledWith('order-1')
  })

  it('ignores duplicate webhook (transition returns null) -> no email, no stock change', async () => {
    mockTransitionOrderStatus.mockResolvedValue(null)

    const res = await POST(createRequest({
      type: 'payment_intent.status.updated',
      data: { id: 'pi_1', status: 'completed' },
    }))

    expect(res.status).toBe(200)
    expect(mockSendOrderConfirmation).not.toHaveBeenCalled()
    expect(mockAdjustStock).not.toHaveBeenCalled()
  })

  it('restores stock on failed payment', async () => {
    mockTransitionOrderStatus.mockResolvedValue({ id: 'order-1', status: 'cancelled' })
    mockAdjustStock.mockResolvedValue(10)

    const res = await POST(createRequest({
      type: 'payment_intent.status.updated',
      data: { id: 'pi_1', status: 'failed' },
    }))

    expect(res.status).toBe(200)
    expect(mockAdjustStock).toHaveBeenCalledTimes(2)
    expect(mockAdjustStock).toHaveBeenCalledWith(
      'v1', 2, 'return', null, 'order-1', 'Payment failed via webhook - stock restored'
    )
    expect(mockAdjustStock).toHaveBeenCalledWith(
      'v2', 1, 'return', null, 'order-1', 'Payment failed via webhook - stock restored'
    )
  })

  it('restores stock on canceled payment', async () => {
    mockTransitionOrderStatus.mockResolvedValue({ id: 'order-1', status: 'cancelled' })
    mockAdjustStock.mockResolvedValue(10)

    const res = await POST(createRequest({
      type: 'payment_intent.status.updated',
      data: { id: 'pi_1', status: 'canceled' },
    }))

    expect(res.status).toBe(200)
    expect(mockTransitionOrderStatus).toHaveBeenCalledWith('order-1', 'payment_processing', 'cancelled')
    expect(mockAdjustStock).toHaveBeenCalledTimes(2)
  })

  it('ignores non-payment_intent events', async () => {
    const res = await POST(createRequest({
      type: 'some.other.event',
      data: { id: 'pi_1', status: 'completed' },
    }))

    expect(res.status).toBe(200)
    expect(mockFrom).not.toHaveBeenCalled()
  })
})
