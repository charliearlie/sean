'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cipherTokens } from '@/concepts/cipher/tokens'
import DataTable, { Column } from '@/concepts/cipher/components/admin/DataTable'

const { colors, typography, adminTypography, adminColors, adminBorders } = cipherTokens

interface Product {
  id: string
  name: string
  compound_code: string
  active: boolean
  featured: boolean
  product_variants: { id: string; stock_quantity: number; active: boolean }[]
  categories: { name: string } | null
}

interface ProductsTableProps {
  products: Product[]
}

export default function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.compound_code.toLowerCase().includes(search.toLowerCase())
  )

  const columns: Column<Product>[] = [
    {
      key: 'compound_code',
      label: 'Code',
      render: (row) => (
        <span style={{
          fontFamily: typography.monoFont,
          fontSize: adminTypography.labelSize,
          color: colors.accent,
          letterSpacing: '0.1em',
        }}>
          {row.compound_code}
        </span>
      ),
    },
    { key: 'name', label: 'Name' },
    {
      key: 'categories',
      label: 'Category',
      render: (row) => row.categories?.name || '—',
    },
    {
      key: 'product_variants',
      label: 'Variants',
      render: (row) => String(row.product_variants?.length || 0),
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: false,
      render: (row) => {
        const total = row.product_variants?.reduce((s, v) => s + v.stock_quantity, 0) || 0
        const color = total === 0 ? '#ef4444' : total < 10 ? '#f59e0b' : '#22c55e'
        return (
          <span style={{ color, fontWeight: 600, fontFamily: typography.monoFont, fontSize: adminTypography.dataSize }}>
            {total}
          </span>
        )
      },
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (row) => (
        <span style={{ fontFamily: adminTypography.bodyFont, color: row.featured ? colors.accent : adminColors.mutedForeground, fontSize: adminTypography.labelSize }}>
          {row.featured ? 'YES' : '—'}
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Active',
      render: (row) => (
        <span style={{ fontFamily: adminTypography.bodyFont, color: row.active ? '#22c55e' : '#ef4444', fontSize: adminTypography.labelSize }}>
          {row.active ? 'YES' : 'NO'}
        </span>
      ),
    },
  ]

  return (
    <div>
      {/* Actions row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          style={{
            fontFamily: adminTypography.bodyFont,
            fontSize: adminTypography.inputSize,
            color: colors.foreground,
            background: colors.muted,
            border: `1px solid ${colors.border}`,
            padding: '10px 12px',
            width: '100%',
            maxWidth: '320px',
            outline: 'none',
            boxSizing: 'border-box',
            borderRadius: adminBorders.radius,
          }}
        />
        <button
          onClick={() => router.push('/admin/products/transform')}
          style={{
            fontFamily: adminTypography.bodyFont,
            fontSize: adminTypography.buttonSize,
            letterSpacing: adminTypography.buttonLetterSpacing,
            padding: '10px 16px',
            background: 'transparent',
            color: colors.cardForeground,
            border: `1px solid ${colors.border}`,
            borderRadius: adminBorders.radius,
            cursor: 'pointer',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          Dark Image Transform
        </button>
      </div>

      <DataTable<Product>
        columns={columns}
        data={filtered}
        onRowClick={(row) => router.push(`/admin/products/${row.id}`)}
      />
    </div>
  )
}
