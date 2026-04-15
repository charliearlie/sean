import { getOrderById } from '@/lib/data/orders'
import { sendEmail } from './resend'
import ShippingNotificationEmail from './templates/ShippingNotificationEmail'

export async function sendShippingNotification(
  orderId: string,
  trackingNumber?: string,
  trackingUrl?: string,
) {
  try {
    const order = await getOrderById(orderId)

    await sendEmail({
      to: order.contact_email,
      subject: `Your Order Has Shipped — ${order.order_number}`,
      react: ShippingNotificationEmail({
        orderNumber: order.order_number,
        contactName: order.contact_name,
        items: order.order_items,
        trackingNumber,
        trackingUrl,
      }),
    })
  } catch (err) {
    console.error('Failed to send shipping notification email:', err)
  }
}
