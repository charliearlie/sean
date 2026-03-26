'use client'

import { cipherTokens } from '@/concepts/cipher/tokens'
import DataTable, { Column } from '@/concepts/cipher/components/admin/DataTable'

const { colors, adminTypography, adminColors } = cipherTokens

interface Customer {
  id: string
  full_name: string | null
  email: string
  role: string
  created_at: string
}

const columns: Column<Customer>[] = [
  {
    key: 'full_name',
    label: 'Name',
    render: (row) => (
      <span style={{
        fontFamily: adminTypography.bodyFont,
        fontSize: adminTypography.dataSize,
        color: colors.foreground,
        fontWeight: 600,
      }}>
        {row.full_name || '—'}
      </span>
    ),
  },
  { key: 'email', label: 'Email' },
  {
    key: 'role',
    label: 'Role',
    render: (row) => (
      <span style={{
        fontFamily: adminTypography.bodyFont,
        fontSize: adminTypography.labelSize,
        letterSpacing: adminTypography.labelLetterSpacing,
        textTransform: 'uppercase',
        color: row.role === 'admin' ? colors.accent : adminColors.mutedForeground,
      }}>
        {row.role}
      </span>
    ),
  },
  {
    key: 'created_at',
    label: 'Joined',
    render: (row) => (
      <span style={{ fontFamily: adminTypography.bodyFont, fontSize: adminTypography.dataSize, color: adminColors.mutedForeground }}>
        {new Date(row.created_at).toLocaleDateString()}
      </span>
    ),
  },
]

export default function CustomersClient({ customers }: { customers: Customer[] }) {
  return (
    <DataTable<Customer>
      columns={columns}
      data={customers}
    />
  )
}
