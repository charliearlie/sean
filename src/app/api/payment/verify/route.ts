import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { getZiinaPaymentIntent } from '@/lib/ziina'
import { adjustStock } from '@/lib/data/stock'
import { transitionOrderStatus } from '@/lib/data/orders'
import { sendOrderConfirmation } from '@/lib/email/send-order-confirmation'
import { createAdminClient } from '@/lib/supabase/admin'

function generateVerifyToken(orderId: string): string {
  const secret = process.env.VERIFY_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback-dev-secret'
  return createHmac('sha256', secret).update(orderId).digest('hex').slice(0, 16)
}

export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get('order')
    const token = request.nextUrl.searchParams.get('token')
    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 })
    }

    // Verify token — only the buyer (redirected from payment gateway) has this
    const expectedToken = generateVerifyToken(orderId)
    if (!token || token !== expectedToken) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = createAdminClient()

    // Get order with payment intent ID
    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()

    if (!order || !order.payment_intent_id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Already processed
    if (order.status === 'paid') {
      return NextResponse.json({ status: 'paid', orderNumber: order.order_number })
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({ status: 'failed', orderNumber: order.order_number })
    }

    // Check payment status with Ziina
    const result = await getZiinaPaymentIntent(order.payment_intent_id)
    console.log('[Verify] Ziina status for order', order.order_number, ':', JSON.stringify({ intentId: order.payment_intent_id, status: result.status, amount: result.amount }))

    if (result.status === 'completed') {
      const transitioned = await transitionOrderStatus(orderId, 'payment_processing', 'paid', {
        payment_transaction_ref: result.id,
        payment_method: 'ziina',
      })

      if (transitioned) {
        await sendOrderConfirmation(orderId)
      }

      return NextResponse.json({ status: 'paid', orderNumber: order.order_number })
    } else if (result.status === 'failed' || result.status === 'canceled') {
      const transitioned = await transitionOrderStatus(orderId, 'payment_processing', 'cancelled')

      if (transitioned) {
        // Payment failed — restore stock
        for (const item of order.order_items) {
          await adjustStock(item.variant_id, item.quantity, 'return', null, order.id, 'Payment failed - stock restored')
        }
      }

      return NextResponse.json({ status: 'failed', orderNumber: order.order_number })
    } else {
      // pending, requires_payment_instrument, requires_user_action — still processing
      return NextResponse.json({ status: 'pending', orderNumber: order.order_number })
    }
  } catch (err) {
    console.error('Payment verification error:', err)
    const message = err instanceof Error ? err.message : 'Verification failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
