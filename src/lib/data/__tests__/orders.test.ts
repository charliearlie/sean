import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRpc = vi.fn()
const mockSupabase = { rpc: mockRpc }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

import { createOrder, transitionOrderStatus } from '../orders'

describe('createOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls create_order_with_items RPC with correct JSONB', async () => {
    const mockOrder = { id: 'order-1', order_number: 'ORD-abc123', status: 'pending' }
    mockRpc.mockResolvedValue({ data: mockOrder, error: null })

    const result = await createOrder({
      contact_name: 'John',
      contact_email: 'john@test.com',
      shipping_address: '123 St',
      shipping_city: 'Dubai',
      shipping_emirate: 'Dubai',
      subtotal: 100,
      shipping_cost: 10,
      total: 110,
      items: [{
        product_id: 'p1',
        variant_id: 'v1',
        product_name: 'BPC-157',
        variant_label: '5mg',
        sku: 'BPC-5',
        quantity: 1,
        unit_price: 100,
        total_price: 100,
      }],
    })

    expect(mockRpc).toHaveBeenCalledWith('create_order_with_items', {
      p_order: expect.objectContaining({
        contact_name: 'John',
        contact_email: 'john@test.com',
        subtotal: 100,
        shipping_cost: 10,
        total: 110,
        customer_id: null,
        contact_phone: null,
        shipping_postal_code: null,
      }),
      p_items: [
        expect.objectContaining({ product_id: 'p1', variant_id: 'v1', quantity: 1 }),
      ],
    })
    expect(result).toEqual(mockOrder)
  })

  it('includes expires_at in p_order when provided', async () => {
    mockRpc.mockResolvedValue({ data: { id: 'order-1' }, error: null })

    await createOrder({
      contact_name: 'John',
      contact_email: 'john@test.com',
      shipping_address: '123 St',
      shipping_city: 'Dubai',
      shipping_emirate: 'Dubai',
      subtotal: 100,
      shipping_cost: 10,
      total: 110,
      expires_at: '2026-01-01T00:00:00Z',
      items: [{
        product_id: 'p1', variant_id: 'v1', product_name: 'Test',
        variant_label: '5mg', sku: 'T1', quantity: 1, unit_price: 100, total_price: 100,
      }],
    })

    expect(mockRpc).toHaveBeenCalledWith('create_order_with_items', {
      p_order: expect.objectContaining({ expires_at: '2026-01-01T00:00:00Z' }),
      p_items: expect.any(Array),
    })
  })

  it('does not include expires_at in p_order when not provided', async () => {
    mockRpc.mockResolvedValue({ data: { id: 'order-1' }, error: null })

    await createOrder({
      contact_name: 'John',
      contact_email: 'john@test.com',
      shipping_address: '123 St',
      shipping_city: 'Dubai',
      shipping_emirate: 'Dubai',
      subtotal: 100,
      shipping_cost: 10,
      total: 110,
      items: [{
        product_id: 'p1', variant_id: 'v1', product_name: 'Test',
        variant_label: '5mg', sku: 'T1', quantity: 1, unit_price: 100, total_price: 100,
      }],
    })

    const calledWith = mockRpc.mock.calls[0][1].p_order
    expect(calledWith).not.toHaveProperty('expires_at')
  })

  it('throws on RPC error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'DB error' } })

    await expect(createOrder({
      contact_name: 'John',
      contact_email: 'john@test.com',
      shipping_address: '123 St',
      shipping_city: 'Dubai',
      shipping_emirate: 'Dubai',
      subtotal: 100,
      shipping_cost: 10,
      total: 110,
      items: [{
        product_id: 'p1', variant_id: 'v1', product_name: 'Test',
        variant_label: '5mg', sku: 'T1', quantity: 1, unit_price: 100, total_price: 100,
      }],
    })).rejects.toThrow()
  })
})

describe('transitionOrderStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when RPC returns null (already transitioned)', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })

    const result = await transitionOrderStatus('order-1', 'payment_processing', 'paid')
    expect(result).toBeNull()
  })

  it('returns order when transition succeeds', async () => {
    const mockOrder = { id: 'order-1', status: 'paid' }
    mockRpc.mockResolvedValue({ data: mockOrder, error: null })

    const result = await transitionOrderStatus('order-1', 'payment_processing', 'paid', {
      payment_transaction_ref: 'pi_123',
      payment_method: 'ziina',
    })

    expect(mockRpc).toHaveBeenCalledWith('transition_order_status', {
      p_order_id: 'order-1',
      p_from_status: 'payment_processing',
      p_to_status: 'paid',
      p_extra: { payment_transaction_ref: 'pi_123', payment_method: 'ziina' },
    })
    expect(result).toEqual(mockOrder)
  })

  it('passes empty object for p_extra when extra is omitted', async () => {
    mockRpc.mockResolvedValue({ data: { id: 'order-1', status: 'paid' }, error: null })

    await transitionOrderStatus('order-1', 'payment_processing', 'paid')

    expect(mockRpc).toHaveBeenCalledWith('transition_order_status', {
      p_order_id: 'order-1',
      p_from_status: 'payment_processing',
      p_to_status: 'paid',
      p_extra: {},
    })
  })
})
