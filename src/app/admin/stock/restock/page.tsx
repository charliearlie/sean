'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cipherTokens } from '@/concepts/cipher/tokens'

const { colors, typography, adminTypography, adminColors, adminBorders } = cipherTokens

const labelStyle: React.CSSProperties = {
  fontFamily: adminTypography.bodyFont,
  fontSize: adminTypography.labelSize,
  letterSpacing: adminTypography.labelLetterSpacing,
  color: adminColors.mutedForeground,
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  fontFamily: adminTypography.bodyFont,
  fontSize: adminTypography.inputSize,
  color: colors.foreground,
  background: colors.muted,
  border: `1px solid ${colors.border}`,
  padding: '10px 12px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
  borderRadius: adminBorders.radius,
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

interface Variant {
  id: string
  label: string
  dosage: string
  sku: string
  stock_quantity: number
  products: { name: string; compound_code: string } | null
}

const REASONS = [
  { value: 'restock', label: 'Restock' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'return', label: 'Return' },
]

export default function RestockPage() {
  return <Suspense><RestockContent /></Suspense>
}

function RestockContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedVariant = searchParams.get('variant')

  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [selectedVariant, setSelectedVariant] = useState(preselectedVariant || '')
  const [quantity, setQuantity] = useState(0)
  const [reason, setReason] = useState('restock')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const fetchVariants = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = await supabase
        .from('product_variants')
        .select('id, label, dosage, sku, stock_quantity, products(name, compound_code)')
        .order('sku')
      setVariants((data || []) as unknown as Variant[])
      setLoading(false)
    }
    fetchVariants()
  }, [])

  const selected = variants.find((v) => v.id === selectedVariant)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVariant || quantity <= 0) return

    setSaving(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update stock quantity
      const newQty = (selected?.stock_quantity || 0) + quantity
      const { error: updateError } = await supabase
        .from('product_variants')
        .update({ stock_quantity: newQty })
        .eq('id', selectedVariant)

      if (updateError) throw updateError

      // Record stock movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          variant_id: selectedVariant,
          quantity_change: quantity,
          reason,
          notes: notes || null,
          created_by: user.id,
        })

      if (movementError) throw movementError

      router.push('/admin/stock')
      router.refresh()
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        fontFamily: adminTypography.bodyFont,
        fontSize: adminTypography.dataSize,
        color: adminColors.mutedForeground,
      }}>
        Loading...
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
        <p style={{
          fontFamily: adminTypography.bodyFont,
          fontSize: adminTypography.labelSize,
          letterSpacing: adminTypography.labelLetterSpacing,
          color: adminColors.mutedForeground,
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}>
          Stock / Restock
        </p>
        <h1 style={{
          fontFamily: typography.monoFont,
          fontSize: adminTypography.headingSize,
          fontWeight: 700,
          color: colors.foreground,
          letterSpacing: '0.05em',
          margin: 0,
        }}>
          RESTOCK INVENTORY
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div style={{ border: `1px solid ${colors.border}` }}>
          <div style={sectionHeaderStyle}>Restock Details</div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Select Variant</label>
              <select
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                required
              >
                <option value="" style={{ background: colors.muted, color: colors.foreground }}>
                  Choose a variant...
                </option>
                {variants.map((v) => (
                  <option
                    key={v.id}
                    value={v.id}
                    style={{ background: colors.muted, color: colors.foreground }}
                  >
                    {v.products?.name} — {v.label} ({v.sku}) [Stock: {v.stock_quantity}]
                  </option>
                ))}
              </select>
            </div>

            {selected && (
              <div style={{
                padding: '10px 14px',
                background: colors.muted,
                border: `1px solid ${colors.border}`,
                borderRadius: adminBorders.radius,
                fontFamily: adminTypography.bodyFont,
                fontSize: adminTypography.labelSize,
                color: adminColors.mutedForeground,
                letterSpacing: '0.05em',
              }}>
                Current stock: <span style={{ color: colors.foreground, fontWeight: 600 }}>{selected.stock_quantity}</span>
                {quantity > 0 && (
                  <span>
                    {' '} → <span style={{ color: colors.accent, fontWeight: 600 }}>{selected.stock_quantity + quantity}</span>
                  </span>
                )}
              </div>
            )}

            <div>
              <label style={labelStyle}>Quantity to Add</label>
              <input
                style={inputStyle}
                type="number"
                min="1"
                value={quantity || ''}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                placeholder="10"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Reason</label>
              <select
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {REASONS.map((r) => (
                  <option
                    key={r.value}
                    value={r.value}
                    style={{ background: colors.muted, color: colors.foreground }}
                  >
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Notes (Optional)</label>
              <textarea
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
              />
            </div>

            <button
              type="submit"
              disabled={saving || !selectedVariant || quantity <= 0}
              style={{
                fontFamily: adminTypography.bodyFont,
                fontSize: adminTypography.buttonSize,
                fontWeight: 700,
                letterSpacing: adminTypography.buttonLetterSpacing,
                padding: '12px 32px',
                background: (saving || !selectedVariant || quantity <= 0) ? colors.muted : colors.accent,
                color: (saving || !selectedVariant || quantity <= 0) ? adminColors.mutedForeground : colors.accentForeground,
                border: 'none',
                borderRadius: adminBorders.radius,
                cursor: (saving || !selectedVariant || quantity <= 0) ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                alignSelf: 'flex-start',
              }}
            >
              {saving ? 'Processing...' : 'Confirm Restock'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
