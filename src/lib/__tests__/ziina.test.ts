import { createHmac } from 'crypto'
import { describe, it, expect, vi } from 'vitest'
import { withRetry, verifyWebhookSignature } from '../ziina'

describe('withRetry', () => {
  it('retries on network error (TypeError) up to max attempts', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue('success')

    const result = await withRetry(fn, 3, [0, 0, 0])
    expect(fn).toHaveBeenCalledTimes(3)
    expect(result).toBe('success')
  })

  it('retries on 500 server error', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Ziina API server error (500)'))
      .mockResolvedValue('ok')

    const result = await withRetry(fn, 3, [0, 0, 0])
    expect(fn).toHaveBeenCalledTimes(2)
    expect(result).toBe('ok')
  })

  it('retries on fetch-related error messages', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fetch failed'))
      .mockResolvedValue('recovered')

    const result = await withRetry(fn, 3, [0, 0, 0])
    expect(fn).toHaveBeenCalledTimes(2)
    expect(result).toBe('recovered')
  })

  it('does NOT retry on non-retryable error (400)', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Bad request (400)'))

    await expect(withRetry(fn, 3, [0, 0, 0])).rejects.toThrow('Bad request (400)')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('throws after exhausting all retry attempts', async () => {
    let callCount = 0
    const fn = vi.fn().mockImplementation(async () => {
      callCount++
      throw new TypeError('Failed to fetch')
    })

    await expect(withRetry(fn, 3, [0, 0, 0])).rejects.toThrow('Failed to fetch')
    expect(callCount).toBe(3)
  })

  it('succeeds immediately without retry when first call works', async () => {
    const fn = vi.fn().mockResolvedValue({ id: 'pi_1' })

    const result = await withRetry(fn, 3, [0, 0, 0])
    expect(fn).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ id: 'pi_1' })
  })
})

describe('verifyWebhookSignature', () => {
  const secret = 'test-webhook-secret'
  const body = '{"type":"payment_intent.status.updated","data":{"id":"pi_123","status":"completed"}}'

  function sign(payload: string, key: string): string {
    return createHmac('sha256', key).update(payload).digest('hex')
  }

  it('returns true for a valid signature', () => {
    const signature = sign(body, secret)
    expect(verifyWebhookSignature(body, signature, secret)).toBe(true)
  })

  it('returns false for a wrong signature', () => {
    expect(verifyWebhookSignature(body, 'deadbeef'.repeat(8), secret)).toBe(false)
  })

  it('returns false when body has been tampered with', () => {
    const signature = sign(body, secret)
    const tampered = body.replace('completed', 'failed')
    expect(verifyWebhookSignature(tampered, signature, secret)).toBe(false)
  })
})
