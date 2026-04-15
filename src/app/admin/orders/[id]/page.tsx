import { notFound } from 'next/navigation'
import { getOrderById } from '@/lib/data/orders'
import { cipherTokens } from '@/concepts/cipher/tokens'
import { formatAED } from '@/shared/utils/currency'
import StatusBadge from '@/concepts/cipher/components/admin/StatusBadge'
import OrderStatusUpdater from '@/concepts/cipher/components/admin/OrderStatusUpdater'
import PaymentStatus from '@/concepts/cipher/components/admin/PaymentStatus'
import Link from 'next/link'

const { colors, typography, adminTypography, adminColors, adminBorders } = cipherTokens

const labelStyle: React.CSSProperties = {
  fontFamily: adminTypography.bodyFont,
  fontSize: adminTypography.labelSize,
  letterSpacing: adminTypography.labelLetterSpacing,
  color: adminColors.mutedForeground,
  textTransform: 'uppercase',
}

const sectionHeaderStyle: React.CSSProperties = {
  fontFamily: adminTypography.bodyFont,
  fontSize: adminTypography.sectionHeaderSize,
  letterSpacing: adminTypography.labelLetterSpacing,
  color: adminColors.mutedForeground,
  textTransform: 'uppercase',
  padding: '10px 16px',
  background: colors.muted,
  borderBottom: `1px solid ${colors.border}`,
}

const infoRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 16px',
  borderBottom: `1px solid ${colors.border}`,
}

const infoLabelStyle: React.CSSProperties = {
  fontFamily: adminTypography.bodyFont,
  fontSize: adminTypography.labelSize,
  color: adminColors.mutedForeground,
  letterSpacing: adminTypography.labelLetterSpacing,
  textTransform: 'uppercase',
}

const infoValueStyle: React.CSSProperties = {
  fontFamily: adminTypography.bodyFont,
  fontSize: adminTypography.dataSize,
  color: colors.foreground,
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrderById(id)
  if (!order) notFound()

  const items = (order.order_items || []) as Record<string, unknown>[]

  return (
    <div>
      <style>{`
        @media (max-width: 768px) {
          .admin-order-layout { grid-template-columns: 1fr !important; }
          .admin-order-header { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>
      {/* Header */}
      <div className="admin-order-header" style={{
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '16px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}>
        <div>
          <p style={{ ...labelStyle, marginBottom: '6px' }}>Orders</p>
          <h1 style={{
            fontFamily: typography.monoFont,
            fontSize: adminTypography.headingSize,
            fontWeight: 700,
            color: colors.foreground,
            letterSpacing: '0.05em',
            margin: 0,
          }}>
            {order.order_number}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StatusBadge status={order.status} />
          <Link
            href={`/admin/orders/${id}/invoice`}
            style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: adminTypography.labelSize,
              letterSpacing: adminTypography.labelLetterSpacing,
              textTransform: 'uppercase',
              color: adminColors.mutedForeground,
              textDecoration: 'none',
              padding: '4px 10px',
              border: `1px solid ${colors.border}`,
              transition: 'color 0.15s',
            }}
          >
            Print Invoice
          </Link>
          {(['preparing', 'shipped', 'out_for_delivery'] as string[]).includes(order.status) && (
            <Link
              href={`/admin/orders/${id}/label`}
              style={{
                fontFamily: adminTypography.bodyFont,
                fontSize: adminTypography.labelSize,
                letterSpacing: adminTypography.labelLetterSpacing,
                textTransform: 'uppercase',
                color: adminColors.mutedForeground,
                textDecoration: 'none',
                padding: '4px 10px',
                border: `1px solid ${colors.border}`,
                transition: 'color 0.15s',
              }}
            >
              Generate Label
            </Link>
          )}
        </div>
      </div>

      <div className="admin-order-layout" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '24px',
        alignItems: 'start',
      }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Order Info */}
          <div style={{ border: `1px solid ${colors.border}` }}>
            <div style={sectionHeaderStyle}>Order Information</div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Order Number</span>
              <span style={{ ...infoValueStyle, fontFamily: typography.monoFont, color: colors.accent, fontWeight: 600 }}>{order.order_number}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Date</span>
              <span style={infoValueStyle}>{new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Status</span>
              <StatusBadge status={order.status} />
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Subtotal</span>
              <span style={{ ...infoValueStyle, fontFamily: typography.monoFont }}>{formatAED(Number(order.subtotal))}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Shipping</span>
              <span style={{ ...infoValueStyle, fontFamily: typography.monoFont }}>{formatAED(Number(order.shipping_cost))}</span>
            </div>
            <div style={{ ...infoRowStyle, borderBottom: 'none' }}>
              <span style={{ ...infoLabelStyle, fontWeight: 700 }}>Total</span>
              <span style={{ ...infoValueStyle, fontFamily: typography.monoFont, color: colors.accent, fontWeight: 700, fontSize: '14px' }}>
                {formatAED(Number(order.total))}
              </span>
            </div>
          </div>

          {/* Payment Status — live from Ziina */}
          <PaymentStatus
            orderId={order.id}
            paymentIntentId={order.payment_intent_id}
            paymentMethod={order.payment_method}
            paidAt={order.paid_at}
          />

          {/* Customer Info */}
          <div style={{ border: `1px solid ${colors.border}` }}>
            <div style={sectionHeaderStyle}>Customer Information</div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Name</span>
              <span style={infoValueStyle}>{order.contact_name}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Email</span>
              <span style={infoValueStyle}>{order.contact_email}</span>
            </div>
            {order.contact_phone && (
              <div style={infoRowStyle}>
                <span style={infoLabelStyle}>Phone</span>
                <span style={infoValueStyle}>{order.contact_phone}</span>
              </div>
            )}
          </div>

          {/* Shipping Info */}
          <div style={{ border: `1px solid ${colors.border}` }}>
            <div style={sectionHeaderStyle}>Shipping Address</div>
            <div style={{
              padding: '12px 16px',
              fontFamily: adminTypography.bodyFont,
              fontSize: adminTypography.dataSize,
              color: colors.cardForeground,
              lineHeight: 1.6,
            }}>
              <div>{order.shipping_address}</div>
              <div>{order.shipping_city}, {order.shipping_emirate}</div>
              {order.shipping_postal_code && <div>{order.shipping_postal_code}</div>}
            </div>
          </div>

          {/* Tracking */}
          {(order.tracking_number || order.tracking_url) && (
            <div style={{ border: `1px solid ${colors.border}` }}>
              <div style={sectionHeaderStyle}>Tracking</div>
              {order.tracking_number && (
                <div style={infoRowStyle}>
                  <span style={infoLabelStyle}>Tracking #</span>
                  <span style={{ ...infoValueStyle, fontFamily: typography.monoFont }}>{order.tracking_number}</span>
                </div>
              )}
              {order.tracking_url && (
                <div style={infoRowStyle}>
                  <span style={infoLabelStyle}>URL</span>
                  <a
                    href={order.tracking_url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...infoValueStyle, color: colors.accent, textDecoration: 'none' }}
                  >
                    {order.tracking_url as string}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Items Table */}
          <div style={{ border: `1px solid ${colors.border}` }}>
            <div style={sectionHeaderStyle}>Items ({items.length})</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Product', 'SKU', 'Qty', 'Unit Price', 'Total'].map((h) => (
                      <th key={h} style={{
                        ...labelStyle,
                        padding: '8px 14px',
                        textAlign: 'left',
                        borderBottom: `1px solid ${colors.border}`,
                        fontWeight: 600,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ padding: '10px 14px' }}>
                        <p style={{
                          fontFamily: adminTypography.bodyFont,
                          fontSize: adminTypography.dataSize,
                          color: colors.foreground,
                          margin: '0 0 2px',
                        }}>
                          {item.product_name as string}
                        </p>
                        <p style={{
                          fontFamily: adminTypography.bodyFont,
                          fontSize: adminTypography.labelSize,
                          color: adminColors.mutedForeground,
                          margin: 0,
                        }}>
                          {item.variant_label as string}
                        </p>
                      </td>
                      <td style={{
                        padding: '10px 14px',
                        fontFamily: typography.monoFont,
                        fontSize: adminTypography.labelSize,
                        color: adminColors.mutedForeground,
                      }}>
                        {item.sku as string}
                      </td>
                      <td style={{
                        padding: '10px 14px',
                        fontFamily: typography.monoFont,
                        fontSize: adminTypography.dataSize,
                        color: colors.foreground,
                        fontWeight: 600,
                      }}>
                        {item.quantity as number}
                      </td>
                      <td style={{
                        padding: '10px 14px',
                        fontFamily: typography.monoFont,
                        fontSize: adminTypography.dataSize,
                        color: colors.cardForeground,
                      }}>
                        {formatAED(Number(item.unit_price))}
                      </td>
                      <td style={{
                        padding: '10px 14px',
                        fontFamily: typography.monoFont,
                        fontSize: adminTypography.dataSize,
                        color: colors.foreground,
                        fontWeight: 600,
                      }}>
                        {formatAED(Number(item.total_price))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div style={{ border: `1px solid ${colors.border}` }}>
              <div style={sectionHeaderStyle}>Internal Notes</div>
              <div style={{
                padding: '12px 16px',
                fontFamily: adminTypography.bodyFont,
                fontSize: adminTypography.dataSize,
                color: colors.cardForeground,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {order.notes as string}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Status Updater */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
        </div>
      </div>
    </div>
  )
}
