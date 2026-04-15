import { NextResponse } from 'next/server'
import { getZiinaPaymentIntent } from '@/lib/ziina'
import { adjustStock } from '@/lib/data/stock'
import { transitionOrderStatus } from '@/lib/data/orders'
import { sendOrderConfirmation } from '@/lib/email/send-order-confirmation'

export async function POST() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find all orders stuck in payment_processing with a payment_intent_id
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('status', 'payment_processing')
      .not('payment_intent_id', 'is', null)

    if (error) throw error
    if (!orders || orders.length === 0) {
      return NextResponse.json({ message: 'No pending orders to reconcile', results: [] })
    }

    const results: Array<{ orderId: string; orderNumber: string; action: string }> = []

    for (const order of orders) {
      try {
        const result = await getZiinaPaymentIntent(order.payment_intent_id)

        if (result.status === 'completed') {
          const transitioned = await transitionOrderStatus(order.id, 'payment_processing', 'paid', {
            payment_transaction_ref: result.id,
            payment_method: 'ziina',
          })

          if (transitioned) {
            sendOrderConfirmation(order.id).catch((err) => {
              console.error('Failed to send order confirmation:', err)
            })
            results.push({ orderId: order.id, orderNumber: order.order_number, action: 'marked_paid' })
          } else {
            results.push({ orderId: order.id, orderNumber: order.order_number, action: 'already_transitioned' })
          }
        } else if (result.status === 'failed' || result.status === 'canceled') {
          const transitioned = await transitionOrderStatus(order.id, 'payment_processing', 'cancelled')

          if (transitioned) {
            for (const item of order.order_items) {
              await adjustStock(item.variant_id, item.quantity, 'return', null, order.id, 'Reconciliation - payment failed, stock restored')
            }
            results.push({ orderId: order.id, orderNumber: order.order_number, action: 'cancelled' })
          } else {
            results.push({ orderId: order.id, orderNumber: order.order_number, action: 'already_transitioned' })
          }
        } else {
          results.push({ orderId: order.id, orderNumber: order.order_number, action: `still_${result.status}` })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        results.push({ orderId: order.id, orderNumber: order.order_number, action: `error: ${msg}` })
      }
    }

    // Handle expired orders: auto-cancel orders past their expires_at
    const { data: expiredOrders, error: expiredError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('status', 'payment_processing')
      .lt('expires_at', new Date().toISOString())

    if (expiredError) throw expiredError

    if (expiredOrders && expiredOrders.length > 0) {
      for (const order of expiredOrders) {
        try {
          const transitioned = await transitionOrderStatus(order.id, 'payment_processing', 'cancelled')

          if (transitioned) {
            for (const item of order.order_items) {
              await adjustStock(item.variant_id, item.quantity, 'return', null, order.id, 'Order expired - stock restored')
            }
            results.push({ orderId: order.id, orderNumber: order.order_number, action: 'expired_cancelled' })
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error'
          results.push({ orderId: order.id, orderNumber: order.order_number, action: `expire_error: ${msg}` })
        }
      }
    }

    return NextResponse.json({ message: `Reconciled ${orders.length} order(s)`, results })
  } catch (err) {
    console.error('Reconciliation error:', err)
    const message = err instanceof Error ? err.message : 'Reconciliation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
