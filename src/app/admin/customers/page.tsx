import { getCustomers } from '@/lib/data/admin'
import { cipherTokens } from '@/concepts/cipher/tokens'
import CustomersClient from './CustomersClient'

const { colors, typography } = cipherTokens

const labelStyle: React.CSSProperties = {
  fontFamily: typography.monoFont,
  fontSize: '9px',
  letterSpacing: '0.2em',
  color: colors.mutedForeground,
  textTransform: 'uppercase',
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers()

  return (
    <div>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '16px',
        marginBottom: '24px',
      }}>
        <p style={{ ...labelStyle, marginBottom: '6px' }}>Management</p>
        <h1 style={{
          fontFamily: typography.monoFont,
          fontSize: '22px',
          fontWeight: 700,
          color: colors.foreground,
          letterSpacing: '0.05em',
          margin: 0,
        }}>
          CUSTOMERS
        </h1>
      </div>

      <p style={{
        fontFamily: typography.monoFont,
        fontSize: '11px',
        color: colors.mutedForeground,
        marginBottom: '16px',
        letterSpacing: '0.05em',
      }}>
        {customers.length} registered customer{customers.length !== 1 ? 's' : ''}
      </p>

      <CustomersClient customers={customers as { id: string; full_name: string | null; email: string; role: string; created_at: string }[]} />
    </div>
  )
}
