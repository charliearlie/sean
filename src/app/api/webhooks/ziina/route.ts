import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/ziina'
import { adjustStock } from '@/lib/data/stock'
import { transitionOrderStatus } from '@/lib/data/orders'
import { sendOrderConfirmation } from '@/lib/email/send-order-confirmation'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_IPS = ['3.29.184.186', '3.29.190.95', '20.233.47.127', '13.202.161.181']

export async function POST(request: NextRequest) {
  try {
    // Validate source IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim()
    if (ip && !ALLOWED_IPS.includes(ip)) {
      console.warn(`Webhook rejected from unauthorized IP: ${ip}`)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Read raw body and verify HMAC signature
    const rawBody = await request.text()
    const webhookSecret = process.env.ZIINA_WEBHOOK_SECRET

    if (process.env.NODE_ENV === 'production' && !webhookSecret) {
      console.error('ZIINA_WEBHOOK_SECRET is not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    if (webhookSecret) {
      const signature = request.headers.get('x-hmac-signature')
      if (!signature || !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const event = JSON.parse(rawBody)

    if (event.type !== 'payment_intent.status.updated') {
      return NextResponse.json({ received: true })
    }

    const paymentIntentId = event.data?.id
    const paymentStatus = event.data?.status

    if (!paymentIntentId || !paymentStatus) {
      return NextResponse.json({ received: true })
    }

    const supabase = createAdminClient()

    // Find order by payment_intent_id
    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('payment_intent_id', paymentIntentId)
      .single()

    if (!order) {
      console.error(`No order found for payment intent: ${paymentIntentId}`)
      return NextResponse.json({ received: true })
    }

    if (paymentStatus === 'completed') {
      const transitioned = await transitionOrderStatus(order.id, 'payment_processing', 'paid', {
        payment_transaction_ref: paymentIntentId,
        payment_method: 'ziina',
      })

      if (transitioned) {
        await sendOrderConfirmation(order.id)
      }
    } else if (paymentStatus === 'failed' || paymentStatus === 'canceled') {
      const transitioned = await transitionOrderStatus(order.id, 'payment_processing', 'cancelled')

      if (transitioned) {
        // Restore stock
        for (const item of order.order_items) {
          await adjustStock(item.variant_id, item.quantity, 'return', null, order.id, 'Payment failed via webhook - stock restored')
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ received: true })
  }
}
