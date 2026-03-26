import { getStockLevels } from '@/lib/data/stock'
import { cipherTokens } from '@/concepts/cipher/tokens'
import StockTable from '@/concepts/cipher/components/admin/StockTable'

const { colors, typography, adminTypography, adminColors } = cipherTokens

const labelStyle: React.CSSProperties = {
  fontFamily: adminTypography.bodyFont,
  fontSize: adminTypography.labelSize,
  letterSpacing: adminTypography.labelLetterSpacing,
  color: adminColors.mutedForeground,
  textTransform: 'uppercase',
}

export default async function AdminStockPage() {
  const variants = await getStockLevels()

  const outOfStock = variants.filter((v: Record<string, unknown>) => (v.stock_quantity as number) === 0).length
  const lowStock = variants.filter((v: Record<string, unknown>) => {
    const qty = v.stock_quantity as number
    return qty > 0 && qty < 6
  }).length

  return (
    <div>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '16px',
        marginBottom: '24px',
      }}>
        <p style={{ ...labelStyle, marginBottom: '6px' }}>Inventory</p>
        <h1 style={{
          fontFamily: typography.monoFont,
          fontSize: adminTypography.headingSize,
          fontWeight: 700,
          color: colors.foreground,
          letterSpacing: '0.05em',
          margin: 0,
        }}>
          STOCK MANAGEMENT
        </h1>
      </div>

      {/* Summary */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{
            fontFamily: adminTypography.bodyFont,
            fontSize: adminTypography.labelSize,
            letterSpacing: adminTypography.labelLetterSpacing,
            color: adminColors.mutedForeground,
            textTransform: 'uppercase',
          }}>
            Total Variants
          </span>
          <span style={{
            fontFamily: typography.monoFont,
            fontSize: '16px',
            fontWeight: 700,
            color: colors.foreground,
          }}>
            {variants.length}
          </span>
        </div>
        {outOfStock > 0 && (
          <div style={{
            background: colors.card,
            border: '1px solid #ef444440',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: adminTypography.labelSize,
              letterSpacing: adminTypography.labelLetterSpacing,
              color: '#ef4444',
              textTransform: 'uppercase',
            }}>
              Out of Stock
            </span>
            <span style={{
              fontFamily: typography.monoFont,
              fontSize: '16px',
              fontWeight: 700,
              color: '#ef4444',
            }}>
              {outOfStock}
            </span>
          </div>
        )}
        {lowStock > 0 && (
          <div style={{
            background: colors.card,
            border: '1px solid #f59e0b40',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: adminTypography.labelSize,
              letterSpacing: adminTypography.labelLetterSpacing,
              color: '#f59e0b',
              textTransform: 'uppercase',
            }}>
              Low Stock
            </span>
            <span style={{
              fontFamily: typography.monoFont,
              fontSize: '16px',
              fontWeight: 700,
              color: '#f59e0b',
            }}>
              {lowStock}
            </span>
          </div>
        )}
      </div>

      <StockTable variants={variants as unknown as {
        id: string
        label: string
        dosage: string
        sku: string
        stock_quantity: number
        active: boolean
        products: { name: string; slug: string; compound_code: string } | null
      }[]} />
    </div>
  )
}
