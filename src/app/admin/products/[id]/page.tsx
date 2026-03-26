import { notFound } from 'next/navigation'
import { cipherTokens } from '@/concepts/cipher/tokens'
import EditProductClient from './EditProductClient'

const { colors, typography } = cipherTokens

const labelStyle: React.CSSProperties = {
  fontFamily: typography.monoFont,
  fontSize: '9px',
  letterSpacing: '0.2em',
  color: colors.mutedForeground,
  textTransform: 'uppercase',
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const [{ data: product }, { data: cats }] = await Promise.all([
    supabase.from('products').select('*, product_variants(*)').eq('id', id).single(),
    supabase.from('categories').select('*').order('sort_order'),
  ])
  const categories = cats || []

  if (!product) notFound()

  return (
    <div>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '16px',
        marginBottom: '24px',
      }}>
        <p style={{ ...labelStyle, marginBottom: '6px' }}>Products / Edit</p>
        <h1 style={{
          fontFamily: typography.monoFont,
          fontSize: '22px',
          fontWeight: 700,
          color: colors.foreground,
          letterSpacing: '0.05em',
          margin: 0,
        }}>
          {product.name as string}
        </h1>
      </div>

      <EditProductClient
        product={product}
        categories={categories}
        variants={(product.product_variants as { id: string; label: string; dosage: string; price: number; sku: string; stock_quantity: number; active: boolean }[]) || []}
      />
    </div>
  )
}
