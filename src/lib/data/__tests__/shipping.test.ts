import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Supabase mock ───────────────────────────────────────────────────────────

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

// Mock next/headers so that if the real server.ts createClient is reached
// during concurrent dynamic imports, it doesn't throw a context error.
vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      getAll: () => [],
      set: vi.fn(),
    })
  ),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

// Mock @supabase/ssr so that even if the real createClient runs, the returned
// client dispatches to our mockFrom instead of hitting a real database.
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}))

// ─── Module under test ───────────────────────────────────────────────────────

import {
  getShippingRateForEmirate,
  getFreeShippingThreshold,
  calculateShipping,
} from '../shipping'

// ─── Chain helper ────────────────────────────────────────────────────────────

// Builds a query chain that supports any number of .eq() calls then .single(),
// resolving to `result`.
function makeChain(result: unknown) {
  const single = vi.fn().mockResolvedValue(result)
  const chain: { eq: ReturnType<typeof vi.fn>; single: ReturnType<typeof vi.fn> } = {} as never
  chain.eq = vi.fn(() => chain)
  chain.single = single
  const select = vi.fn(() => chain)
  return { select, single }
}

// ─── getShippingRateForEmirate ────────────────────────────────────────────────

describe('getShippingRateForEmirate', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('returns the rate for the given emirate', async () => {
    const { select } = makeChain({ data: { rate: 25 }, error: null })
    mockFrom.mockReturnValue({ select })

    const rate = await getShippingRateForEmirate('Dubai')

    expect(rate).toBe(25)
    expect(mockFrom).toHaveBeenCalledWith('shipping_rates')
    expect(select).toHaveBeenCalledWith('rate')
  })

  it('throws when Supabase returns an error', async () => {
    const { select } = makeChain({ data: null, error: { message: 'No rate found' } })
    mockFrom.mockReturnValue({ select })

    await expect(getShippingRateForEmirate('Unknown')).rejects.toEqual({ message: 'No rate found' })
  })
})

// ─── getFreeShippingThreshold ─────────────────────────────────────────────────

describe('getFreeShippingThreshold', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('returns the threshold value from site_settings', async () => {
    const { select } = makeChain({ data: { value: '200' }, error: null })
    mockFrom.mockReturnValue({ select })

    const threshold = await getFreeShippingThreshold()

    expect(threshold).toBe(200)
    expect(mockFrom).toHaveBeenCalledWith('site_settings')
    expect(select).toHaveBeenCalledWith('value')
  })

  it('throws when Supabase returns an error', async () => {
    const { select } = makeChain({ data: null, error: { message: 'Setting not found' } })
    mockFrom.mockReturnValue({ select })

    await expect(getFreeShippingThreshold()).rejects.toEqual({ message: 'Setting not found' })
  })
})

// ─── calculateShipping ────────────────────────────────────────────────────────
// calculateShipping runs getShippingRateForEmirate and getFreeShippingThreshold
// concurrently via Promise.all. Both helpers each call `await import('@/lib/supabase/server')`.
//
// Because both helpers run concurrently, the second dynamic import may bypass
// the @/lib/supabase/server mock (a known vitest ESM limitation). We guard
// against this by also mocking @supabase/ssr so that even if the real
// createClient executes, it creates a client backed by mockFrom.
//
// mockFrom is dispatched by table name so call order doesn't matter.

describe('calculateShipping', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  function setupTables(rateResult: unknown, thresholdResult: unknown) {
    const rateChain = makeChain(rateResult)
    const thresholdChain = makeChain(thresholdResult)
    mockFrom.mockImplementation((table: string) => {
      if (table === 'shipping_rates') return { select: rateChain.select }
      if (table === 'site_settings') return { select: thresholdChain.select }
      throw new Error(`Unexpected table: ${table}`)
    })
  }

  it('returns 0 when subtotal meets or exceeds the free shipping threshold', async () => {
    setupTables(
      { data: { rate: 25 }, error: null },
      { data: { value: '200' }, error: null },
    )

    const cost = await calculateShipping('Dubai', 250)

    expect(cost).toBe(0)
  })

  it('returns the emirate rate when subtotal is below the threshold', async () => {
    setupTables(
      { data: { rate: 30 }, error: null },
      { data: { value: '200' }, error: null },
    )

    const cost = await calculateShipping('Sharjah', 99)

    expect(cost).toBe(30)
  })
})
