import Link from 'next/link'
import { cipherTokens } from '@/concepts/cipher/tokens'
import ProductsTable from './ProductsTable'

const { colors, typography, adminTypography, adminColors, adminBorders } = cipherTokens

const labelStyle: React.CSSProperties = {
  fontFamily: adminTypography.bodyFont,
  fontSize: adminTypography.labelSize,
  letterSpacing: adminTypography.labelLetterSpacing,
  color: adminColors.mutedForeground,
  textTransform: 'uppercase',
}

export default async function AdminProductsPage() {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, product_variants(id, stock_quantity, active), categories(name)')
    .order('name')

  return (
    <div>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '16px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}>
        <div>
          <p style={{ ...labelStyle, marginBottom: '6px' }}>Catalogue</p>
          <h1 style={{
            fontFamily: typography.monoFont,
            fontSize: adminTypography.headingSize,
            fontWeight: 700,
            color: colors.foreground,
            letterSpacing: '0.05em',
            margin: 0,
          }}>
            PRODUCTS
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          style={{
            fontFamily: adminTypography.bodyFont,
            fontSize: adminTypography.buttonSize,
            fontWeight: 700,
            letterSpacing: adminTypography.buttonLetterSpacing,
            padding: '10px 20px',
            background: colors.accent,
            color: colors.accentForeground,
            textDecoration: 'none',
            textTransform: 'uppercase',
            borderRadius: adminBorders.radius,
          }}
        >
          + New Product
        </Link>
      </div>

      <ProductsTable products={products || []} />
    </div>
  )
}
