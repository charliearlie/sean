import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRpc = vi.fn()
const mockSupabase = { rpc: mockRpc }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

import { adjustStock } from '../stock'

describe('adjustStock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls adjust_stock_atomic RPC with correct params', async () => {
    mockRpc.mockResolvedValue({ data: 8, error: null })

    const result = await adjustStock('variant-1', -2, 'sale', 'user-1', 'order-1', 'test note')

    expect(mockRpc).toHaveBeenCalledWith('adjust_stock_atomic', {
      p_variant_id: 'variant-1',
      p_quantity_change: -2,
      p_reason: 'sale',
      p_created_by: 'user-1',
      p_reference_id: 'order-1',
      p_notes: 'test note',
    })
    expect(result).toBe(8)
  })

  it('returns new quantity on success', async () => {
    mockRpc.mockResolvedValue({ data: 5, error: null })
    const result = await adjustStock('v1', -1, 'sale', null)
    expect(result).toBe(5)
  })

  it('throws on insufficient stock (RPC error)', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'Insufficient stock for variant v1' } })
    await expect(adjustStock('v1', -100, 'sale', null)).rejects.toThrow()
  })

  it('passes null as createdBy when no user', async () => {
    mockRpc.mockResolvedValue({ data: 10, error: null })
    await adjustStock('v1', 1, 'restock', null)
    expect(mockRpc).toHaveBeenCalledWith('adjust_stock_atomic', expect.objectContaining({
      p_created_by: null,
    }))
  })

  it('passes null for optional referenceId and notes when omitted', async () => {
    mockRpc.mockResolvedValue({ data: 10, error: null })
    await adjustStock('v1', 1, 'restock', null)
    expect(mockRpc).toHaveBeenCalledWith('adjust_stock_atomic', expect.objectContaining({
      p_reference_id: null,
      p_notes: null,
    }))
  })
})
