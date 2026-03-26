import { getDashboardStats } from '@/lib/data/admin'
import { cipherTokens } from '@/concepts/cipher/tokens'
import StatsCard from '@/concepts/cipher/components/admin/StatsCard'

const { colors, typography, adminTypography, adminColors } = cipherTokens

const labelStyle: React.CSSProperties = {
  fontFamily: adminTypography.bodyFont,
  fontSize: adminTypography.labelSize,
  letterSpacing: adminTypography.labelLetterSpacing,
  color: adminColors.mutedForeground,
  textTransform: 'uppercase',
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div>
      <style>{`
        @media (max-width: 768px) {
          .admin-stats-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 481px) and (max-width: 768px) {
          .admin-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
      {/* Page header */}
      <div style={{
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '16px',
        marginBottom: '24px',
      }}>
        <p style={{ ...labelStyle, marginBottom: '6px' }}>System Overview</p>
        <h1 style={{
          fontFamily: typography.monoFont,
          fontSize: adminTypography.headingSize,
          fontWeight: 700,
          color: colors.foreground,
          letterSpacing: '0.05em',
          margin: 0,
        }}>
          DASHBOARD
        </h1>
      </div>

      {/* Stats Cards */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ ...labelStyle, marginBottom: '12px' }}>Overview</p>
        <div className="admin-stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}>
          <StatsCard label="Products" value={String(stats.productCount)} accent />
          <StatsCard label="Customers" value={String(stats.customerCount)} />
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div style={{ border: `1px solid ${colors.border}` }}>
        <div style={{
          padding: '10px 16px',
          background: colors.muted,
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <p style={{ ...labelStyle, color: '#f59e0b' }}>Low Stock Alerts</p>
        </div>
        {stats.lowStockAlerts.length === 0 ? (
          <div style={{
            padding: '24px 16px',
            textAlign: 'center',
            fontFamily: adminTypography.bodyFont,
            fontSize: adminTypography.dataSize,
            color: adminColors.mutedForeground,
          }}>
            All stock levels OK
          </div>
        ) : (
          stats.lowStockAlerts.map((v: Record<string, unknown>) => {
            const product = v.products as Record<string, unknown> | null
            return (
              <div key={v.id as string} style={{
                padding: '10px 16px',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <p style={{
                    fontFamily: typography.monoFont,
                    fontSize: adminTypography.labelSize,
                    color: colors.accent,
                    letterSpacing: '0.1em',
                    margin: '0 0 2px',
                  }}>
                    {product?.compound_code as string}
                  </p>
                  <p style={{
                    fontFamily: adminTypography.bodyFont,
                    fontSize: adminTypography.dataSize,
                    color: colors.cardForeground,
                    margin: 0,
                  }}>
                    {product?.name as string} — {v.label as string}
                  </p>
                </div>
                <span style={{
                  fontFamily: typography.monoFont,
                  fontSize: adminTypography.dataSize,
                  fontWeight: 700,
                  color: (v.stock_quantity as number) === 0 ? '#ef4444' : '#f59e0b',
                }}>
                  {v.stock_quantity as number}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
