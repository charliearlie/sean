'use client'

import { useState, useEffect } from 'react'
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
  transition: 'border-color 0.2s ease-in-out',
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

interface Category {
  id: string
  name: string
  slug: string
}

export interface ProductData {
  id?: string
  name: string
  slug: string
  compound_code: string
  category_id: string
  description: string
  long_description: string
  purity: number | null
  molecular_weight: string
  form_factor: string
  sequence: string
  coa_batch_number: string
  image_url: string
  featured: boolean
  active: boolean
}

interface ProductFormProps {
  initialData?: Partial<ProductData>
  categories: Category[]
  onSubmit: (data: ProductData) => Promise<void>
  submitLabel?: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function ProductForm({
  initialData,
  categories,
  onSubmit,
  submitLabel = 'Save Product',
}: ProductFormProps) {
  const [form, setForm] = useState<ProductData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    compound_code: initialData?.compound_code || '',
    category_id: initialData?.category_id || '',
    description: initialData?.description || '',
    long_description: initialData?.long_description || '',
    purity: initialData?.purity ?? null,
    molecular_weight: initialData?.molecular_weight || '',
    form_factor: initialData?.form_factor || '',
    sequence: initialData?.sequence || '',
    coa_batch_number: initialData?.coa_batch_number || '',
    image_url: initialData?.image_url || '',
    featured: initialData?.featured ?? false,
    active: initialData?.active ?? true,
  })

  const [saving, setSaving] = useState(false)
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug)

  useEffect(() => {
    if (autoSlug) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.name) }))
    }
  }, [form.name, autoSlug])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (name === 'slug') setAutoSlug(false)
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm((prev) => ({ ...prev, [name]: checked }))
    } else if (name === 'purity') {
      setForm((prev) => ({ ...prev, purity: value ? parseFloat(value) : null }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <style jsx global>{`
        .admin-input:focus {
          border-color: ${colors.accent} !important;
        }
        @media (max-width: 768px) {
          .admin-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Basic Info */}
        <div style={{ border: `1px solid ${colors.border}` }}>
          <div style={sectionHeaderStyle}>01 // Basic Information</div>
          <div className="admin-form-grid" style={{
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}>
            <div>
              <label style={labelStyle}>Product Name</label>
              <input
                className="admin-input"
                style={inputStyle}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="BPC-157"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Slug</label>
              <input
                className="admin-input"
                style={inputStyle}
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="bpc-157"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Compound Code</label>
              <input
                className="admin-input"
                style={inputStyle}
                name="compound_code"
                value={form.compound_code}
                onChange={handleChange}
                placeholder="PP-BPC157"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                className="admin-input"
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
              >
                <option value="" style={{ background: colors.muted, color: colors.foreground }}>
                  Select category...
                </option>
                {categories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    style={{ background: colors.muted, color: colors.foreground }}
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Short Description</label>
              <textarea
                className="admin-input"
                style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief description for product cards"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Long Description</label>
              <textarea
                className="admin-input"
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                name="long_description"
                value={form.long_description}
                onChange={handleChange}
                placeholder="Detailed product description..."
              />
            </div>
          </div>
        </div>

        {/* Scientific Details */}
        <div style={{ border: `1px solid ${colors.border}` }}>
          <div style={sectionHeaderStyle}>02 // Scientific Details</div>
          <div className="admin-form-grid" style={{
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '16px',
          }}>
            <div>
              <label style={labelStyle}>Purity (%)</label>
              <input
                className="admin-input"
                style={inputStyle}
                name="purity"
                type="number"
                step="0.1"
                value={form.purity ?? ''}
                onChange={handleChange}
                placeholder="99.5"
              />
            </div>
            <div>
              <label style={labelStyle}>Molecular Weight</label>
              <input
                className="admin-input"
                style={inputStyle}
                name="molecular_weight"
                value={form.molecular_weight}
                onChange={handleChange}
                placeholder="1419.53 g/mol"
              />
            </div>
            <div>
              <label style={labelStyle}>Form Factor</label>
              <input
                className="admin-input"
                style={inputStyle}
                name="form_factor"
                value={form.form_factor}
                onChange={handleChange}
                placeholder="Lyophilized Powder"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Sequence</label>
              <input
                className="admin-input"
                style={inputStyle}
                name="sequence"
                value={form.sequence}
                onChange={handleChange}
                placeholder="Gly-Glu-Pro-Pro-Pro..."
              />
            </div>
            <div>
              <label style={labelStyle}>COA Batch Number</label>
              <input
                className="admin-input"
                style={inputStyle}
                name="coa_batch_number"
                value={form.coa_batch_number}
                onChange={handleChange}
                placeholder="COA-2024-001"
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div style={{ border: `1px solid ${colors.border}` }}>
          <div style={sectionHeaderStyle}>03 // Settings</div>
          <div style={{
            padding: '20px',
            display: 'flex',
            gap: '32px',
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontFamily: adminTypography.bodyFont,
              fontSize: adminTypography.dataSize,
              color: colors.cardForeground,
            }}>
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
                style={{ accentColor: colors.accent }}
              />
              Featured Product
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontFamily: adminTypography.bodyFont,
              fontSize: adminTypography.dataSize,
              color: colors.cardForeground,
            }}>
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                style={{ accentColor: colors.accent }}
              />
              Active (visible in store)
            </label>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              fontFamily: typography.monoFont,
              fontSize: adminTypography.buttonSize,
              fontWeight: 700,
              letterSpacing: adminTypography.buttonLetterSpacing,
              padding: '12px 32px',
              background: saving ? colors.muted : colors.accent,
              color: saving ? colors.mutedForeground : colors.accentForeground,
              border: 'none',
              borderRadius: adminBorders.radius,
              cursor: saving ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {saving ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}
