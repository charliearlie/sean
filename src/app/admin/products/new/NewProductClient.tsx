'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cipherTokens } from '@/concepts/cipher/tokens'
import ProductForm, { ProductData } from '@/concepts/cipher/components/admin/ProductForm'
import ImageUpload from '@/concepts/cipher/components/admin/ImageUpload'

const { colors, typography, adminTypography, adminColors } = cipherTokens

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
  cloneFrom?: Partial<ProductData>
}

const STEPS = ['Product Details', 'Upload Image', 'Add Variants']

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '24px',
    }}>
      {STEPS.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {i > 0 && (
            <span style={{
              width: '24px',
              height: '1px',
              background: i <= currentStep ? colors.accent : colors.border,
            }} />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              fontSize: '10px',
              fontFamily: typography.monoFont,
              fontWeight: 700,
              border: `1px solid ${i <= currentStep ? colors.accent : colors.border}`,
              background: i < currentStep ? colors.accent : 'transparent',
              color: i < currentStep ? colors.accentForeground : i === currentStep ? colors.accent : adminColors.mutedForeground,
            }}>
              {i < currentStep ? '\u2713' : i + 1}
            </span>
            <span style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: '10px',
              letterSpacing: '0.05em',
              color: i === currentStep ? colors.foreground : adminColors.mutedForeground,
              textTransform: 'uppercase',
            }}>
              {step}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function NewProductClient({ categories, cloneFrom }: NewProductClientProps) {
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

    router.push(`/admin/products/${createdProductId}?new=1`)
  }

  if (createdProductId) {
    return (
      <div>
        <StepIndicator currentStep={1} />
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
          onClick={() => router.push(`/admin/products/${createdProductId}?new=1`)}
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
      <StepIndicator currentStep={0} />
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
          {cloneFrom ? 'DUPLICATE PRODUCT' : 'NEW PRODUCT'}
        </h1>
      </div>

      <ProductForm
        initialData={cloneFrom}
        categories={categories}
        onSubmit={handleSubmit}
        submitLabel="Create Product"
      />
    </div>
  )
}
