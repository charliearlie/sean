import { getOrderByIdAdmin } from '@/lib/data/orders'
import { sendEmail } from './resend'
import OrderConfirmationEmail from './templates/OrderConfirmationEmail'

export async function sendOrderConfirmation(orderId: string) {
  try {
    console.log(`[EMAIL] Attempting order confirmation for orderId=${orderId}`)
    const order = await getOrderByIdAdmin(orderId)
    console.log(`[EMAIL] Order ${order.order_number}, recipient=${order.contact_email}`)

    const result = await sendEmail({
      to: order.contact_email,
      subject: `Order Confirmed — ${order.order_number}`,
      react: OrderConfirmationEmail({
        orderNumber: order.order_number,
        contactName: order.contact_name,
        items: order.order_items,
        subtotal: order.subtotal,
        shippingCost: order.shipping_cost,
        total: order.total,
        shippingAddress: order.shipping_address,
        shippingCity: order.shipping_city,
        shippingEmirate: order.shipping_emirate,
      }),
    })

    if (!result.success) {
      console.error('Order confirmation email failed:', result.error)
    } else {
      console.log(`Order confirmation sent for ${order.order_number} (${result.id})`)
    }
  } catch (err) {
    // Never throw — email failure must not break payment flow
    console.error('Failed to send order confirmation email:', err)
  }
}
