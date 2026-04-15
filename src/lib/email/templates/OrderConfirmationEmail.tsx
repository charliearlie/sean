import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
} from '@react-email/components'

interface OrderItem {
  product_name: string
  variant_label: string
  quantity: number
  unit_price: number
  total_price: number
}

interface OrderConfirmationEmailProps {
  orderNumber: string
  contactName: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  total: number
  shippingAddress: string
  shippingCity: string
  shippingEmirate: string
}

export default function OrderConfirmationEmail({
  orderNumber,
  contactName,
  items,
  subtotal,
  shippingCost,
  total,
  shippingAddress,
  shippingCity,
  shippingEmirate,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A0D12', fontFamily: 'monospace', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          {/* Header */}
          <Section style={{ marginBottom: '32px' }}>
            <Text style={{ color: '#00FFB2', fontSize: '16px', fontWeight: 700, letterSpacing: '0.2em', margin: 0 }}>
              PURE PEPTIDES
            </Text>
            <Text style={{ color: '#5A6577', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, margin: '4px 0 0' }}>
              Order Confirmation
            </Text>
          </Section>

          {/* Greeting */}
          <Section style={{ marginBottom: '24px' }}>
            <Text style={{ color: '#E0E6ED', fontSize: '14px', margin: 0 }}>
              Thank you for your order, {contactName}.
            </Text>
            <Text style={{ color: '#5A6577', fontSize: '12px', margin: '8px 0 0' }}>
              Order #{orderNumber}
            </Text>
          </Section>

          <Hr style={{ borderColor: '#1E2530', margin: '24px 0' }} />

          {/* Items */}
          <Section>
            <Text style={{ color: '#5A6577', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, marginBottom: '12px' }}>
              Order Items
            </Text>
            {items.map((item, i) => (
              <Section key={i} style={{ marginBottom: '12px', padding: '12px', border: '1px solid #1E2530' }}>
                <Text style={{ color: '#E0E6ED', fontSize: '13px', fontWeight: 600, margin: 0 }}>
                  {item.product_name}
                </Text>
                <Text style={{ color: '#5A6577', fontSize: '11px', margin: '4px 0' }}>
                  {item.variant_label} × {item.quantity}
                </Text>
                <Text style={{ color: '#00FFB2', fontSize: '12px', fontWeight: 600, margin: 0 }}>
                  AED {item.total_price}
                </Text>
              </Section>
            ))}
          </Section>

          <Hr style={{ borderColor: '#1E2530', margin: '24px 0' }} />

          {/* Totals */}
          <Section>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ color: '#5A6577', fontSize: '11px', padding: '4px 0' }}>Subtotal</td>
                  <td style={{ color: '#E0E6ED', fontSize: '12px', textAlign: 'right' as const, padding: '4px 0' }}>AED {subtotal}</td>
                </tr>
                <tr>
                  <td style={{ color: '#5A6577', fontSize: '11px', padding: '4px 0' }}>Shipping</td>
                  <td style={{ color: '#E0E6ED', fontSize: '12px', textAlign: 'right' as const, padding: '4px 0' }}>
                    {shippingCost === 0 ? 'FREE' : `AED ${shippingCost}`}
                  </td>
                </tr>
                <tr>
                  <td style={{ color: '#E0E6ED', fontSize: '13px', fontWeight: 700, padding: '12px 0 4px' }}>Total</td>
                  <td style={{ color: '#00FFB2', fontSize: '16px', fontWeight: 700, textAlign: 'right' as const, padding: '12px 0 4px' }}>AED {total}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={{ borderColor: '#1E2530', margin: '24px 0' }} />

          {/* Shipping Address */}
          <Section>
            <Text style={{ color: '#5A6577', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>
              Shipping To
            </Text>
            <Text style={{ color: '#E0E6ED', fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
              {shippingAddress}<br />
              {shippingCity}, {shippingEmirate}
            </Text>
          </Section>

          <Hr style={{ borderColor: '#1E2530', margin: '24px 0' }} />

          {/* Support */}
          <Section>
            <Text style={{ color: '#5A6577', fontSize: '10px', letterSpacing: '0.1em', margin: 0 }}>
              Questions? Contact us on{' '}
              <Link href="https://wa.me/971501234567" style={{ color: '#00FFB2' }}>
                WhatsApp
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
