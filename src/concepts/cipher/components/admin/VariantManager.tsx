'use client'

import { useState } from 'react'
import { cipherTokens } from '@/concepts/cipher/tokens'

const { colors, typography } = cipherTokens

const labelStyle: React.CSSProperties = {
  fontFamily: typography.monoFont,
  fontSize: '9px',
  letterSpacing: '0.2em',
  color: colors.mutedForeground,
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  fontFamily: typography.monoFont,
  fontSize: '12px',
  color: colors.foreground,
  background: colors.muted,
  border: `1px solid ${colors.border}`,
  padding: '10px 12px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
  borderRadius: '0px',
}

interface Variant {
  id: string
  label: string
  dosage: string
  price: number
  sku: string
  stock_quantity: number
  active: boolean
}

interface VariantManagerProps {
  productId: string
  initialVariants: Variant[]
}

const emptyVariant = {
  label: '',
  dosage: '',
  price: 0,
  sku: '',
  stock_quantity: 0,
  active: true,
}

export default function VariantManager({ productId, initialVariants }: VariantManagerProps) {
  const [variants, setVariants] = useState<Variant[]>(initialVariants)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyVariant)
  const [saving, setSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }))
    } else if (name === 'price' || name === 'stock_quantity') {
      setForm((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleAdd = async () => {
    setSaving(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('product_variants')
        .insert({ ...form, product_id: productId })
        .select()
        .single()
      if (error) throw error
      setVariants((prev) => [...prev, data as Variant])
      setForm(emptyVariant)
      setShowForm(false)
    } catch (err) {
      alert('Error adding variant: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingId) return
    setSaving(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('product_variants')
        .update(form)
        .eq('id', editingId)
        .select()
        .single()
      if (error) throw error
      setVariants((prev) => prev.map((v) => (v.id === editingId ? (data as Variant) : v)))
      setForm(emptyVariant)
      setEditingId(null)
    } catch (err) {
      alert('Error updating variant: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this variant?')) return
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id)
      if (error) throw error
      setVariants((prev) => prev.filter((v) => v.id !== id))
    } catch (err) {
      alert('Error deleting variant: ' + (err as Error).message)
    }
  }

  const startEdit = (v: Variant) => {
    setEditingId(v.id)
    setShowForm(false)
    setForm({
      label: v.label,
      dosage: v.dosage,
      price: v.price,
      sku: v.sku,
      stock_quantity: v.stock_quantity,
      active: v.active,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setShowForm(false)
    setForm(emptyVariant)
  }

  const isEditing = editingId !== null

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .admin-variant-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    <div style={{ border: `1px solid ${colors.border}` }}>
      <div style={{
        padding: '10px 16px',
        background: colors.muted,
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: typography.monoFont,
          fontSize: '9px',
          letterSpacing: '0.2em',
          color: colors.mutedForeground,
          textTransform: 'uppercase',
        }}>
          Variants ({variants.length})
        </span>
        {!showForm && !isEditing && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              fontFamily: typography.monoFont,
              fontSize: '9px',
              letterSpacing: '0.1em',
              color: colors.accentForeground,
              background: colors.accent,
              border: 'none',
              padding: '4px 12px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            + Add Variant
          </button>
        )}
      </div>

      {/* Variant Table */}
      {variants.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Label', 'Dosage', 'Price (AED)', 'SKU', 'Stock', 'Active', 'Actions'].map((h) => (
                  <th key={h} style={{
                    fontFamily: typography.monoFont,
                    fontSize: '9px',
                    letterSpacing: '0.15em',
                    color: colors.mutedForeground,
                    textTransform: 'uppercase',
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderBottom: `1px solid ${colors.border}`,
                    fontWeight: 600,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '10px 12px', fontFamily: typography.monoFont, fontSize: '11px', color: colors.foreground }}>
                    {v.label}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: typography.monoFont, fontSize: '11px', color: colors.cardForeground }}>
                    {v.dosage}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: typography.monoFont, fontSize: '11px', color: colors.foreground, fontWeight: 600 }}>
                    {v.price}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: typography.monoFont, fontSize: '10px', color: colors.mutedForeground }}>
                    {v.sku}
                  </td>
                  <td style={{
                    padding: '10px 12px',
                    fontFamily: typography.monoFont,
                    fontSize: '11px',
                    fontWeight: 600,
                    color: v.stock_quantity === 0 ? '#ef4444' : v.stock_quantity < 6 ? '#f59e0b' : '#22c55e',
                  }}>
                    {v.stock_quantity}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: typography.monoFont, fontSize: '11px', color: v.active ? '#22c55e' : '#ef4444' }}>
                    {v.active ? 'Yes' : 'No'}
                  </td>
                  <td style={{ padding: '10px 12px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => startEdit(v)}
                      style={{
                        fontFamily: typography.monoFont,
                        fontSize: '9px',
                        color: colors.accent,
                        background: 'transparent',
                        border: `1px solid ${colors.border}`,
                        padding: '3px 8px',
                        cursor: 'pointer',
                        letterSpacing: '0.1em',
                      }}
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      style={{
                        fontFamily: typography.monoFont,
                        fontSize: '9px',
                        color: '#ef4444',
                        background: 'transparent',
                        border: `1px solid ${colors.border}`,
                        padding: '3px 8px',
                        cursor: 'pointer',
                        letterSpacing: '0.1em',
                      }}
                    >
                      DEL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Form */}
      {(showForm || isEditing) && (
        <div style={{
          padding: '16px',
          borderTop: variants.length > 0 ? `1px solid ${colors.border}` : 'none',
          background: colors.card,
        }}>
          <p style={{
            fontFamily: typography.monoFont,
            fontSize: '9px',
            letterSpacing: '0.15em',
            color: colors.accent,
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            {isEditing ? 'Edit Variant' : 'New Variant'}
          </p>
          <div className="admin-variant-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px',
          }}>
            <div>
              <label style={labelStyle}>Label</label>
              <input style={inputStyle} name="label" value={form.label} onChange={handleChange} placeholder="5mg Vial" />
            </div>
            <div>
              <label style={labelStyle}>Dosage</label>
              <input style={inputStyle} name="dosage" value={form.dosage} onChange={handleChange} placeholder="5mg" />
            </div>
            <div>
              <label style={labelStyle}>Price (AED)</label>
              <input style={inputStyle} name="price" type="number" value={form.price} onChange={handleChange} />
            </div>
            <div>
              <label style={labelStyle}>SKU</label>
              <input style={inputStyle} name="sku" value={form.sku} onChange={handleChange} placeholder="PP-BPC157-5MG" />
            </div>
            <div>
              <label style={labelStyle}>Stock Quantity</label>
              <input style={inputStyle} name="stock_quantity" type="number" value={form.stock_quantity} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', alignItems: 'end', paddingBottom: '10px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontFamily: typography.monoFont,
                fontSize: '11px',
                color: colors.cardForeground,
              }}>
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  style={{ accentColor: colors.accent }}
                />
                Active
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button
              onClick={isEditing ? handleUpdate : handleAdd}
              disabled={saving}
              style={{
                fontFamily: typography.monoFont,
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                padding: '8px 20px',
                background: colors.accent,
                color: colors.accentForeground,
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {saving ? 'Saving...' : isEditing ? 'Update' : 'Add'}
            </button>
            <button
              onClick={cancelEdit}
              style={{
                fontFamily: typography.monoFont,
                fontSize: '9px',
                letterSpacing: '0.1em',
                padding: '8px 20px',
                background: 'transparent',
                color: colors.mutedForeground,
                border: `1px solid ${colors.border}`,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
