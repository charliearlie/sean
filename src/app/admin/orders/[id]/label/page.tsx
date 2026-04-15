import { notFound } from 'next/navigation'
import { getOrderById } from '@/lib/data/orders'
import PrintButton from './PrintButton'

const SENDER = {
  name: 'Pure Peptides',
  address: 'Business Bay',
  city: 'Dubai',
  country: 'UAE',
  phone: '+971 4 000 0000',
}

export default async function LabelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrderById(id)
  if (!order) notFound()

  return (
    <>
      <style>{`
        .label-page {
          font-family: 'Space Grotesk', 'Helvetica Neue', Arial, sans-serif;
          background: #fff;
          color: #000;
          min-height: 100vh;
          padding: 32px;
        }
        .print-controls {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 24px;
        }
        .label-card {
          max-width: 600px;
          margin: 0 auto;
          border: 2px solid #000;
          padding: 0;
          overflow: hidden;
        }
        .label-header {
          background: #000;
          color: #fff;
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .label-header-company {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .label-header-type {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.7;
        }
        .label-body {
          display: grid;
          grid-template-rows: auto auto auto;
        }
        .label-section {
          padding: 16px 20px;
          border-bottom: 1px solid #ddd;
        }
        .label-section:last-child {
          border-bottom: none;
        }
        .section-label {
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #888;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .address-name {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .address-line {
          font-size: 13px;
          color: #333;
          line-height: 1.5;
        }
        .order-number-section {
          padding: 20px;
          text-align: center;
          background: #f8f8f8;
          border-bottom: 1px solid #ddd;
        }
        .order-number-label {
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #888;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .order-number-value {
          font-family: 'Space Grotesk', monospace;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #000;
        }
        .divider-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          border-bottom: 1px solid #ddd;
          color: #aaa;
          font-size: 18px;
        }
        @media print {
          .print-controls { display: none !important; }
          .label-page { padding: 16px; }
          .label-card { border: 2px solid #000 !important; }
          body { background: #fff !important; }
        }
      `}</style>

      <div className="label-page">
        <div className="print-controls">
          <PrintButton />
        </div>

        <div className="label-card">
          <div className="label-header">
            <div>
              <div className="label-header-company">Pure Peptides</div>
              <div className="label-header-type">Shipping Label</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', opacity: 0.8, fontFamily: 'monospace' }}>
              {order.order_number}
            </div>
          </div>

          <div className="label-body">
            {/* From */}
            <div className="label-section">
              <div className="section-label">From</div>
              <div className="address-name">{SENDER.name}</div>
              <div className="address-line">{SENDER.address}</div>
              <div className="address-line">{SENDER.city}, {SENDER.country}</div>
              <div className="address-line">{SENDER.phone}</div>
            </div>

            {/* Arrow divider */}
            <div className="divider-arrow">&#x2193;</div>

            {/* To */}
            <div className="label-section">
              <div className="section-label">To</div>
              <div className="address-name">{order.contact_name}</div>
              <div className="address-line">{order.shipping_address}</div>
              <div className="address-line">{order.shipping_city}, {order.shipping_emirate}</div>
              {order.shipping_postal_code && (
                <div className="address-line">{order.shipping_postal_code}</div>
              )}
              {order.contact_phone && (
                <div className="address-line" style={{ marginTop: '4px', color: '#555' }}>
                  {order.contact_phone}
                </div>
              )}
            </div>

            {/* Order number bar */}
            <div className="order-number-section">
              <div className="order-number-label">Order Reference</div>
              <div className="order-number-value">{order.order_number}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
