'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cipherTokens } from '@/concepts/cipher/tokens'
import ProductForm, { ProductData } from '@/concepts/cipher/components/admin/ProductForm'
import ImageUpload from '@/concepts/cipher/components/admin/ImageUpload'

const { colors, typography } = cipherTokens

const labelStyle: React.CSSProperties = {
  fontFamily: typography.monoFont,
  fontSize: '9px',
  letterSpacing: '0.2em',
  color: colors.mutedForeground,
  textTransform: 'uppercase',
}

interface Category {
  id: string
  name: string
  slug: string
}

interface NewProductClientProps {
  categories: Category[]
}

export default function NewProductClient({ categories }: NewProductClientProps) {
  const router = useRouter()
  const [createdProductId, setCreatedProductId] = useState<string | null>(null)

  const handleSubmit = async (formData: ProductData) => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const payload: Record<string, unknown> = { ...formData }
    delete payload.id

    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .single()

    if (error) {
      alert('Error creating product: ' + error.message)
      return
    }

    setCreatedProductId(data.id)
  }

  const handleImageUpload = async (url: string) => {
    if (!createdProductId) return
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { error } = await supabase
      .from('products')
      .update({ image_url: url })
      .eq('id', createdProductId)

    if (error) {
      alert('Error updating image: ' + error.message)
      return
    }

    router.push(`/admin/products/${createdProductId}`)
  }

  if (createdProductId) {
    return (
      <div>
        <div style={{
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: '16px',
          marginBottom: '24px',
        }}>
          <p style={{ ...labelStyle, marginBottom: '6px', color: colors.accent }}>Product Created</p>
          <h1 style={{
            fontFamily: typography.monoFont,
            fontSize: '22px',
            fontWeight: 700,
            color: colors.foreground,
            letterSpacing: '0.05em',
            margin: 0,
          }}>
            UPLOAD IMAGE
          </h1>
        </div>

        <div style={{
          border: `1px solid ${colors.border}`,
          padding: '24px',
          marginBottom: '16px',
        }}>
          <p style={{
            fontFamily: typography.monoFont,
            fontSize: '11px',
            color: colors.mutedForeground,
            marginBottom: '20px',
            marginTop: 0,
          }}>
            Upload a product image to Supabase Storage.
          </p>
          <ImageUpload
            bucket="product-images"
            path={`products/${createdProductId}`}
            onUpload={handleImageUpload}
          />
        </div>

        <button
          type="button"
          onClick={() => router.push(`/admin/products/${createdProductId}`)}
          style={{
            fontFamily: typography.monoFont,
            fontSize: '10px',
            letterSpacing: '0.12em',
            color: colors.mutedForeground,
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            padding: '10px 20px',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          Skip — Edit Product
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '16px',
        marginBottom: '24px',
      }}>
        <p style={{ ...labelStyle, marginBottom: '6px' }}>Products</p>
        <h1 style={{
          fontFamily: typography.monoFont,
          fontSize: '22px',
          fontWeight: 700,
          color: colors.foreground,
          letterSpacing: '0.05em',
          margin: 0,
        }}>
          NEW PRODUCT
        </h1>
      </div>

      <ProductForm
        categories={categories}
        onSubmit={handleSubmit}
        submitLabel="Create Product"
      />
    </div>
  )
}
