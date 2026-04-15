'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ProductForm, { ProductData } from '@/concepts/cipher/components/admin/ProductForm'
import dynamic from 'next/dynamic'
import ImageUpload from '@/concepts/cipher/components/admin/ImageUpload'

const VariantManager = dynamic(() => import('@/concepts/cipher/components/admin/VariantManager'))
const ImageTransform = dynamic(() => import('@/concepts/cipher/components/admin/ImageTransform'))
import { cipherTokens } from '@/concepts/cipher/tokens'

const { colors, typography, adminTypography, adminColors, adminBorders } = cipherTokens

interface EditProductClientProps {
  product: Record<string, unknown>
  categories: { id: string; name: string; slug: string }[]
  variants: {
    id: string
    label: string
    dosage: string
    price: number
    sku: string
    stock_quantity: number
    active: boolean
  }[]
}

export default function EditProductClient({ product, categories, variants }: EditProductClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNewProduct = searchParams.get('new') === '1'

  const handleSubmit = async (formData: ProductData) => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const payload: Record<string, unknown> = { ...formData }
    delete payload.id
    payload.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', product.id)

    if (error) {
      alert('Error updating product: ' + error.message)
      return
    }

    router.refresh()
  }

  const handleImageUpload = async (url: string) => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase
      .from('products')
      .update({ image_url: url, updated_at: new Date().toISOString() })
      .eq('id', product.id)
    router.refresh()
  }

  const handleDarkImageTransform = async (darkUrl: string) => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase
      .from('products')
      .update({ image_url_dark: darkUrl, updated_at: new Date().toISOString() })
      .eq('id', product.id)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Success banner for newly created products */}
      {isNewProduct && (
        <div style={{
          border: `1px solid ${colors.accent}40`,
          borderLeft: `3px solid ${colors.accent}`,
          padding: '14px 18px',
          background: `${colors.accent}08`,
        }}>
          <p style={{
            fontFamily: adminTypography.bodyFont,
            fontSize: adminTypography.dataSize,
            fontWeight: 600,
            color: colors.accent,
            margin: '0 0 4px',
          }}>
            Product created successfully
          </p>
          <p style={{
            fontFamily: adminTypography.bodyFont,
            fontSize: '11px',
            color: adminColors.mutedForeground,
            margin: 0,
          }}>
            Add variants below to set pricing and stock levels.
          </p>
        </div>
      )}

      {/* Duplicate button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Link
          href={`/admin/products/new?clone=${product.id}`}
          style={{
            fontFamily: adminTypography.bodyFont,
            fontSize: adminTypography.buttonSize,
            letterSpacing: adminTypography.buttonLetterSpacing,
            textTransform: 'uppercase',
            padding: '8px 14px',
            color: adminColors.mutedForeground,
            border: `1px solid ${colors.border}`,
            borderRadius: adminBorders.radius,
            textDecoration: 'none',
            transition: 'all 0.15s ease-in-out',
          }}
        >
          Duplicate Product
        </Link>
      </div>

      <ProductForm
        initialData={product as Partial<ProductData>}
        categories={categories}
        onSubmit={handleSubmit}
        submitLabel="Update Product"
      />

      {/* Image Upload */}
      <div style={{ border: `1px solid ${colors.border}` }}>
        <div style={{
          padding: '10px 16px',
          background: colors.muted,
          borderBottom: `1px solid ${colors.border}`,
          fontFamily: typography.monoFont,
          fontSize: '9px',
          letterSpacing: '0.2em',
          color: colors.mutedForeground,
          textTransform: 'uppercase',
        }}>
          Product Image
        </div>
        <div style={{ padding: '16px' }}>
          <ImageUpload
            bucket="product-images"
            path={`products/${product.id}`}
            currentUrl={product.image_url as string | undefined}
            onUpload={handleImageUpload}
          />
        </div>
      </div>

      {/* Dark Image Transform */}
      <ImageTransform
        productId={product.id as string}
        lightImageUrl={product.image_url as string | null}
        darkImageUrl={product.image_url_dark as string | null}
        onTransformComplete={handleDarkImageTransform}
      />

      {/* Variants */}
      <VariantManager
        productId={product.id as string}
        initialVariants={variants}
      />
    </div>
  )
}
