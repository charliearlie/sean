import { notFound } from 'next/navigation'
import { getOrderById } from '@/lib/data/orders'
import { formatAED } from '@/shared/utils/currency'
import PrintButton from './PrintButton'

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrderById(id)
  if (!order) notFound()

  const items = (order.order_items || []) as Record<string, unknown>[]
  const orderDate = new Date(order.created_at).toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <style>{`
        .invoice-page {
          font-family: 'Space Grotesk', 'Helvetica Neue', Arial, sans-serif;
          background: #fff;
          color: #000;
          min-height: 100vh;
        }
        .invoice-shell {
          max-width: 800px;
          margin: 0 auto;
          padding: 48px 40px;
        }
        .print-controls {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 32px;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 24px;
          border-bottom: 2px solid #000;
          margin-bottom: 32px;
        }
        .company-name {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .company-subtitle {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #555;
          margin-top: 4px;
        }
        .invoice-title {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          text-align: right;
        }
        .invoice-number {
          font-size: 13px;
          color: #555;
          margin-top: 4px;
          font-family: monospace;
          text-align: right;
        }
        .invoice-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 32px;
        }
        .meta-section-title {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .meta-row {
          display: flex;
          gap: 8px;
          margin-bottom: 4px;
          font-size: 13px;
          line-height: 1.5;
        }
        .meta-key {
          color: #888;
          min-width: 80px;
          font-size: 11px;
          letter-spacing: 0.04em;
          padding-top: 1px;
        }
        .meta-val {
          color: #000;
          font-weight: 500;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        .items-table th {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #888;
          font-weight: 600;
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
          border-top: 1px solid #ddd;
        }
        .items-table th.align-right,
        .items-table td.align-right { text-align: right; }
        .items-table th.align-center,
        .items-table td.align-center { text-align: center; }
        .items-table td {
          padding: 10px 12px;
          font-size: 13px;
          border-bottom: 1px solid #eee;
          vertical-align: top;
        }
        .product-name { font-weight: 600; margin-bottom: 2px; }
        .variant-label { font-size: 11px; color: #777; }
        .sku-cell { font-family: monospace; font-size: 11px; color: #888; }
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
        }
        .totals-table { width: 260px; }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 13px;
          border-bottom: 1px solid #eee;
        }
        .totals-row.grand-total {
          border-bottom: 2px solid #000;
          padding-top: 10px;
          font-size: 15px;
          font-weight: 700;
          border-top: 1px solid #000;
        }
        .totals-label { color: #555; }
        .totals-value { font-family: monospace; font-weight: 500; }
        .invoice-footer {
          border-top: 1px solid #ddd;
          padding-top: 16px;
          text-align: center;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #999;
        }
        @media print {
          .print-controls { display: none !important; }
          .invoice-shell { padding: 24px 32px; }
        }
      `}</style>

      <div className="invoice-page">
        <div className="invoice-shell">
          <div className="print-controls">
            <PrintButton />
          </div>

          {/* Company + Invoice header */}
          <div className="invoice-header">
            <div>
              <div className="company-name">Pure Peptides</div>
              <div className="company-subtitle">Research Compounds</div>
            </div>
            <div>
              <div className="invoice-title">Invoice</div>
              <div className="invoice-number">{order.order_number}</div>
            </div>
          </div>

          {/* Order + Customer meta */}
          <div className="invoice-meta">
            <div>
              <div className="meta-section-title">Order Details</div>
              <div className="meta-row">
                <span className="meta-key">Order #</span>
                <span className="meta-val" style={{ fontFamily: 'monospace' }}>{order.order_number}</span>
              </div>
              <div className="meta-row">
                <span className="meta-key">Date</span>
                <span className="meta-val">{orderDate}</span>
              </div>
              <div className="meta-row">
                <span className="meta-key">Status</span>
                <span className="meta-val" style={{ textTransform: 'capitalize' }}>{order.status}</span>
              </div>
            </div>

            <div>
              <div className="meta-section-title">Bill To</div>
              <div className="meta-row">
                <span className="meta-key">Name</span>
                <span className="meta-val">{order.contact_name}</span>
              </div>
              <div className="meta-row">
                <span className="meta-key">Email</span>
                <span className="meta-val">{order.contact_email}</span>
              </div>
              {order.contact_phone && (
                <div className="meta-row">
                  <span className="meta-key">Phone</span>
                  <span className="meta-val">{order.contact_phone}</span>
                </div>
              )}

              <div style={{ marginTop: '16px' }}>
                <div className="meta-section-title">Ship To</div>
                <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#000' }}>
                  <div>{order.shipping_address}</div>
                  <div>{order.shipping_city}, {order.shipping_emirate}</div>
                  {order.shipping_postal_code && <div>{order.shipping_postal_code}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <table className="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th className="align-center">Qty</th>
                <th className="align-right">Unit Price</th>
                <th className="align-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td>
                    <div className="product-name">{item.product_name as string}</div>
                    {item.variant_label ? (
                      <div className="variant-label">{String(item.variant_label)}</div>
                    ) : null}
                  </td>
                  <td className="sku-cell">{item.sku as string}</td>
                  <td className="align-center" style={{ fontWeight: 600 }}>{item.quantity as number}</td>
                  <td className="align-right" style={{ fontFamily: 'monospace' }}>{formatAED(Number(item.unit_price))}</td>
                  <td className="align-right" style={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatAED(Number(item.total_price))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="totals-section">
            <div className="totals-table">
              <div className="totals-row">
                <span className="totals-label">Subtotal</span>
                <span className="totals-value">{formatAED(Number(order.subtotal))}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Shipping</span>
                <span className="totals-value">{formatAED(Number(order.shipping_cost))}</span>
              </div>
              <div className="totals-row grand-total">
                <span>Total</span>
                <span className="totals-value">{formatAED(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="invoice-footer">
            For Research Use Only &mdash; Not for Human Consumption
          </div>
        </div>
      </div>
    </>
  )
}
