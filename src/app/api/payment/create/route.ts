import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createHmac } from 'crypto'
import { createZiinaPaymentIntent } from '@/lib/ziina'
import { createOrder, transitionOrderStatus } from '@/lib/data/orders'
import { adjustStock } from '@/lib/data/stock'
import { calculateShipping } from '@/lib/data/shipping'

function generateVerifyToken(orderId: string): string {
  const secret = process.env.VERIFY_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback-dev-secret'
  return createHmac('sha256', secret).update(orderId).digest('hex').slice(0, 16)
}

// ---------------------------------------------------------------------------
// 1e. In-memory rate limiter — 10 requests per minute per IP
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (rateLimitMap.get(ip) ?? []).filter(t => now - t < RATE_LIMIT_WINDOW_MS)
  timestamps.push(now)
  rateLimitMap.set(ip, timestamps)
  return timestamps.length > RATE_LIMIT_MAX
}

// ---------------------------------------------------------------------------
// 1b. Zod schema
// ---------------------------------------------------------------------------
const paymentItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
  productName: z.string(),
  variantLabel: z.string(),
  sku: z.string(),
  quantity: z.number().int().min(1).max(100),
  unitPrice: z.number().positive(),
})

const paymentBodySchema = z.object({
  items: z.array(paymentItemSchema).min(1).max(20),
  contact: z.object({
    email: z.string().email(),
    name: z.string().min(1).max(200),
    phone: z.string(),
  }),
  shipping: z.object({
    address: z.string().min(1),
    city: z.string().min(1),
    emirate: z.string().min(1),
    postalCode: z.string(),
  }),
})

type PaymentBody = z.infer<typeof paymentBodySchema>

export async function POST(request: NextRequest) {
  // 1e. Rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  try {
    const raw = await request.json()

    // 1b. Zod validation
    const parsed = paymentBodySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const body: PaymentBody = parsed.data

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Validate stock availability and fetch DB prices for all items
    // 1c. Batch query — single round-trip instead of N individual queries
    const variantIds = body.items.map(item => item.variantId)

    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, stock_quantity, price')
      .in('id', variantIds)

    if (variantsError) {
      return NextResponse.json({ error: 'Failed to fetch product variants' }, { status: 500 })
    }

    const variantMap = new Map(
      (variants ?? []).map(v => [v.id as string, v as { id: string; stock_quantity: number; price: number }]),
    )

    const dbPrices = new Map<string, number>()

    for (const item of body.items) {
      const variant = variantMap.get(item.variantId)

      if (!variant) {
        return NextResponse.json({ error: `Product variant not found: ${item.variantLabel}` }, { status: 400 })
      }

      if (variant.stock_quantity < item.quantity) {
        return NextResponse.json({
          error: `Insufficient stock for ${item.productName} (${item.variantLabel}). Available: ${variant.stock_quantity}`,
        }, { status: 400 })
      }

      dbPrices.set(item.variantId, variant.price)
    }

    // 2. Calculate totals using server-side DB prices
    const subtotal = body.items.reduce((sum, item) => sum + dbPrices.get(item.variantId)! * item.quantity, 0)
    const shippingCost = await calculateShipping(body.shipping.emirate, subtotal)
    const total = subtotal + shippingCost

    // 3. Create order in DB (status: 'pending')
    const order = await createOrder({
      customer_id: user?.id,
      contact_name: body.contact.name,
      contact_email: body.contact.email,
      contact_phone: body.contact.phone,
      shipping_address: body.shipping.address,
      shipping_city: body.shipping.city,
      shipping_emirate: body.shipping.emirate,
      shipping_postal_code: body.shipping.postalCode,
      subtotal,
      shipping_cost: shippingCost,
      total,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      items: body.items.map(item => ({
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: item.productName,
        variant_label: item.variantLabel,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: dbPrices.get(item.variantId)!,
        total_price: dbPrices.get(item.variantId)! * item.quantity,
      })),
    })

    // 4. Decrement stock for each item
    for (const item of body.items) {
      await adjustStock(item.variantId, -item.quantity, 'sale', user?.id ?? null, order.id as string)
    }

    // 5. Create Ziina payment intent
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const verifyToken = generateVerifyToken(order.id as string)
    const ziinaParams = {
      amount: Math.round(total * 100),
      currency_code: 'AED',
      message: `Pure Peptides Order ${order.order_number}`,
      success_url: `${origin}/payment/success?order=${order.id}&token=${verifyToken}`,
      cancel_url: `${origin}/payment/cancel?order=${order.id}&token=${verifyToken}`,
      failure_url: `${origin}/payment/failed?order=${order.id}&token=${verifyToken}`,
      test: process.env.ZIINA_TEST_MODE === 'true',
    }
    console.log('[Payment] Creating Ziina intent:', { ...ziinaParams, orderId: order.id, orderNumber: order.order_number })

    const result = await createZiinaPaymentIntent(ziinaParams)
    console.log('[Payment] Ziina response:', JSON.stringify(result))

    if (result.error) {
      // Restore stock on failure
      for (const item of body.items) {
        await adjustStock(item.variantId, item.quantity, 'adjustment', user?.id ?? null, order.id as string, 'Payment creation failed - stock restored')
      }
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // 6. Update order with Ziina payment intent ID
    await transitionOrderStatus(order.id as string, 'pending', 'payment_processing', {
      payment_intent_id: result.id!,
    })

    return NextResponse.json({ orderUrl: result.redirect_url, orderId: order.id })
  } catch (err) {
    console.error('Payment creation error:', err)
    const message = err instanceof Error ? err.message : 'Failed to create payment'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
