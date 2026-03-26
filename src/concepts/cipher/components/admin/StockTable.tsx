import Link from 'next/link'
import { cipherTokens } from '@/concepts/cipher/tokens'

const { colors, typography, adminTypography, adminColors, adminBorders } = cipherTokens

interface StockVariant {
  id: string
  label: string
  dosage: string
  sku: string
  stock_quantity: number
  active: boolean
  products: {
    name: string
    slug: string
    compound_code: string
  } | null
}

interface StockTableProps {
  variants: StockVariant[]
}

function getStockColor(qty: number): string {
  if (qty === 0) return '#ef4444'
  if (qty < 6) return '#f59e0b'
  return '#22c55e'
}

export default function StockTable({ variants }: StockTableProps) {
  return (
    <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: colors.muted }}>
            {['Product', 'Variant', 'SKU', 'Stock Qty', 'Status', 'Action'].map((h) => (
              <th key={h} style={{
                fontFamily: adminTypography.bodyFont,
                fontSize: adminTypography.labelSize,
                letterSpacing: adminTypography.labelLetterSpacing,
                color: adminColors.mutedForeground,
                textTransform: 'uppercase',
                textAlign: 'left',
                padding: '10px 14px',
                borderBottom: `1px solid ${colors.border}`,
                fontWeight: 600,
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => {
            const stockColor = getStockColor(v.stock_quantity)
            const statusLabel = v.stock_quantity === 0
              ? 'OUT OF STOCK'
              : v.stock_quantity < 6
                ? 'LOW STOCK'
                : 'IN STOCK'

            return (
              <tr key={v.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                <td style={{ padding: '12px 14px' }}>
                  <p style={{
                    fontFamily: typography.monoFont,
                    fontSize: adminTypography.labelSize,
                    color: colors.accent,
                    letterSpacing: '0.1em',
                    margin: '0 0 2px',
                  }}>
                    {v.products?.compound_code}
                  </p>
                  <p style={{
                    fontFamily: adminTypography.bodyFont,
                    fontSize: adminTypography.dataSize,
                    color: colors.foreground,
                    margin: 0,
                  }}>
                    {v.products?.name}
                  </p>
                </td>
                <td style={{
                  padding: '12px 14px',
                  fontFamily: adminTypography.bodyFont,
                  fontSize: adminTypography.dataSize,
                  color: colors.cardForeground,
                }}>
                  {v.label} ({v.dosage})
                </td>
                <td style={{
                  padding: '12px 14px',
                  fontFamily: typography.monoFont,
                  fontSize: '10px',
                  color: adminColors.mutedForeground,
                  letterSpacing: '0.05em',
                }}>
                  {v.sku}
                </td>
                <td style={{
                  padding: '12px 14px',
                  fontFamily: typography.monoFont,
                  fontSize: '14px',
                  fontWeight: 700,
                  color: stockColor,
                }}>
                  {v.stock_quantity}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    fontFamily: adminTypography.bodyFont,
                    fontSize: adminTypography.labelSize,
                    fontWeight: 600,
                    letterSpacing: adminTypography.labelLetterSpacing,
                    color: stockColor,
                    background: `${stockColor}18`,
                    border: `1px solid ${stockColor}40`,
                    borderRadius: adminBorders.radius,
                    padding: '3px 8px',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>
                    {statusLabel}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <Link
                    href={`/admin/stock/restock?variant=${v.id}`}
                    style={{
                      fontFamily: adminTypography.bodyFont,
                      fontSize: adminTypography.buttonSize,
                      letterSpacing: adminTypography.buttonLetterSpacing,
                      color: colors.accent,
                      textDecoration: 'none',
                      border: `1px solid ${colors.border}`,
                      borderRadius: adminBorders.radius,
                      padding: '4px 10px',
                      textTransform: 'uppercase',
                      transition: 'border-color 0.15s ease-in-out',
                    }}
                  >
                    Restock
                  </Link>
                </td>
              </tr>
            )
          })}
          {variants.length === 0 && (
            <tr>
              <td colSpan={6} style={{
                padding: '32px 14px',
                textAlign: 'center',
                fontFamily: adminTypography.bodyFont,
                fontSize: adminTypography.dataSize,
                color: adminColors.mutedForeground,
              }}>
                No variants found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
