import { createHmac, timingSafeEqual } from 'crypto'

const ZIINA_API_URL = 'https://api-v2.ziina.com/api/payment_intent'

export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delays = [200, 1000, 3000]
): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      // Only retry on network errors, not business logic errors
      if (err instanceof TypeError || (err instanceof Error && (err.message.includes('fetch') || err.message.includes('server error')))) {
        await new Promise((r) => setTimeout(r, delays[i] || delays[delays.length - 1]));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Retry exhausted'); // unreachable
}

export interface ZiinaCreatePaymentIntentParams {
  amount: number
  currency_code: string
  message: string
  success_url: string
  cancel_url: string
  failure_url: string
  test: boolean
}

export interface ZiinaPaymentIntent {
  id: string
  redirect_url: string
  status: string
  amount: number
  currency_code: string
  message: string
  created_at: string
}

export interface ZiinaCreateResponse {
  id?: string
  redirect_url?: string
  error?: string
}

export interface ZiinaGetResponse {
  id: string
  status: string
  amount: number
  currency_code: string
  message: string
  redirect_url: string
  created_at: string
  error?: string
}

export async function createZiinaPaymentIntent(
  params: ZiinaCreatePaymentIntentParams
): Promise<ZiinaCreateResponse> {
  const makeRequest = async () => {
    const response = await fetch(ZIINA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ZIINA_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        amount: params.amount,
        currency_code: params.currency_code,
        message: params.message,
        success_url: params.success_url,
        cancel_url: params.cancel_url,
        failure_url: params.failure_url,
        test: params.test,
      }),
    })

    if (response.status >= 500) {
      throw new Error(`Ziina API server error (${response.status})`)
    }

    if (!response.ok) {
      const text = await response.text()
      return { error: `Ziina API error (${response.status}): ${text}` }
    }

    return response.json()
  }

  return withRetry(makeRequest)
}

export async function getZiinaPaymentIntent(id: string): Promise<ZiinaGetResponse> {
  return withRetry(async () => {
    const response = await fetch(`${ZIINA_API_URL}/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.ZIINA_ACCESS_TOKEN}`,
      },
    })

    if (response.status >= 500) {
      throw new Error(`Ziina API server error (${response.status})`)
    }

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Ziina API error (${response.status}): ${text}`)
    }

    return response.json()
  })
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac('sha256', secret).update(body).digest('hex')
  if (expected.length !== signature.length) return false
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}
