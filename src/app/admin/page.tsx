import Link from 'next/link'
import { getDashboardStats } from '@/lib/data/admin'
import { cipherTokens } from '@/concepts/cipher/tokens'
import { formatAED } from '@/shared/utils/currency'
import StatsCard from '@/concepts/cipher/components/admin/StatsCard'
import StatusBadge from '@/concepts/cipher/components/admin/StatusBadge'

const { colors, typography, adminTypography, adminColors, adminBorders } = cipherTokens

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
          .admin-dashboard-bottom { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 481px) and (max-width: 768px) {
          .admin-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        .admin-order-row:hover { background: ${colors.muted}; }
        .admin-quick-action:hover { background: ${colors.muted}; }
        @media (max-width: 768px) {
          .admin-order-row { grid-template-columns: 1fr auto !important; }
          .order-col-status,
          .order-col-date { display: none; }
        }
      `}</style>
      {/* Page header */}
      <div style={{
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '16px',
        marginBottom: '24px',
      }}>
        <p style={{ ...labelStyle, marginBottom: '6px' }}>Overview</p>
        <h1 style={{
          fontFamily: typography.monoFont,
          fontSize: adminTypography.headingSize,
          fontWeight: 700,
          color: colors.foreground,
          letterSpacing: '0.05em',
          margin: 0,
        }}>
          Dashboard
        </h1>
      </div>

      {/* Action Required Banner */}
      {stats.actionRequired.length > 0 && (
        <div style={{
          border: `1px solid #f59e0b40`,
          borderLeft: `3px solid #f59e0b`,
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f59e0b08',
        }}>
          <div>
            <p style={{
              fontFamily: typography.monoFont,
              fontSize: adminTypography.dataSize,
              fontWeight: 700,
              color: '#f59e0b',
              margin: '0 0 4px',
            }}>
              {stats.actionRequired.length} order{stats.actionRequired.length !== 1 ? 's' : ''} need{stats.actionRequired.length === 1 ? 's' : ''} your attention
            </p>
            <p style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: '11px',
              color: adminColors.mutedForeground,
              margin: 0,
            }}>
              New or paid orders waiting to be confirmed
            </p>
          </div>
          <Link
            href="/admin/orders"
            style={{
              fontFamily: typography.monoFont,
              fontSize: adminTypography.buttonSize,
              fontWeight: 700,
              letterSpacing: adminTypography.buttonLetterSpacing,
              textTransform: 'uppercase',
              padding: '8px 16px',
              background: '#f59e0b',
              color: '#0A0D12',
              border: 'none',
              borderRadius: adminBorders.radius,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Review Orders
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="admin-stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <Link href="/admin/products/new" className="admin-quick-action" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 18px',
          border: `1px solid ${colors.border}`,
          borderRadius: adminBorders.radius,
          textDecoration: 'none',
          transition: 'all 0.15s ease-in-out',
          background: 'transparent',
        }}>
          <span style={{ fontSize: '16px', color: colors.foreground }}>+</span>
          <span style={{
            fontFamily: adminTypography.bodyFont,
            fontSize: adminTypography.labelSize,
            letterSpacing: adminTypography.labelLetterSpacing,
            textTransform: 'uppercase',
            color: colors.foreground,
          }}>
            Add Product
          </span>
        </Link>
        <Link href="/admin/orders" className="admin-quick-action" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 18px',
          border: `1px solid ${colors.border}`,
          borderRadius: adminBorders.radius,
          textDecoration: 'none',
          transition: 'all 0.15s ease-in-out',
          background: 'transparent',
        }}>
          <span style={{ fontSize: '14px', color: colors.foreground }}>&#9776;</span>
          <span style={{
            fontFamily: adminTypography.bodyFont,
            fontSize: adminTypography.labelSize,
            letterSpacing: adminTypography.labelLetterSpacing,
            textTransform: 'uppercase',
            color: colors.foreground,
          }}>
            Review Orders
          </span>
        </Link>
        <Link href="/admin/stock" className="admin-quick-action" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 18px',
          border: `1px solid ${colors.border}`,
          borderRadius: adminBorders.radius,
          textDecoration: 'none',
          transition: 'all 0.15s ease-in-out',
          background: 'transparent',
        }}>
          <span style={{ fontSize: '14px', color: colors.foreground }}>&#9638;</span>
          <span style={{
            fontFamily: adminTypography.bodyFont,
            fontSize: adminTypography.labelSize,
            letterSpacing: adminTypography.labelLetterSpacing,
            textTransform: 'uppercase',
            color: colors.foreground,
          }}>
            Check Stock
          </span>
        </Link>
      </div>

      {/* Revenue Cards */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ ...labelStyle, marginBottom: '12px' }}>Revenue (AED)</p>
        <div className="admin-stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}>
          <StatsCard label="Today" value={formatAED(stats.revenue.today)} accent />
          <StatsCard label="This Week" value={formatAED(stats.revenue.week)} />
          <StatsCard label="This Month" value={formatAED(stats.revenue.month)} />
        </div>
      </div>

      {/* Order Count Cards */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ ...labelStyle, marginBottom: '12px' }}>Orders</p>
        <div className="admin-stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}>
          <StatsCard label="Today" value={String(stats.orderCounts.today)} subValue="orders" />
          <StatsCard label="This Week" value={String(stats.orderCounts.week)} subValue="orders" />
          <StatsCard label="This Month" value={String(stats.orderCounts.month)} subValue="orders" />
        </div>
      </div>

      {/* Recent Orders + Low Stock side by side */}
      <div className="admin-dashboard-bottom" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '24px',
        alignItems: 'start',
      }}>
        {/* Recent Orders */}
        <div style={{ border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
          <div style={{
            padding: '10px 16px',
            background: colors.muted,
            borderBottom: `1px solid ${colors.border}`,
          }}>
            <p style={labelStyle}>Recent orders</p>
          </div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr>
                  {['Order #', 'Customer', 'Total'].map((h) => (
                    <th key={h} style={{
                      ...labelStyle,
                      padding: '8px 14px',
                      textAlign: 'left',
                      borderBottom: `1px solid ${colors.border}`,
                      fontWeight: 600,
                    }}>
                      {h}
                    </th>
                  ))}
                  {['Status', 'Date'].map((h) => (
                    <th key={h} className={h === 'Status' ? 'order-col-status' : 'order-col-date'} style={{
                      ...labelStyle,
                      padding: '8px 14px',
                      textAlign: 'left',
                      borderBottom: `1px solid ${colors.border}`,
                      fontWeight: 600,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order: Record<string, unknown>) => (
                  <tr key={order.id as string}>
                    <td colSpan={5} style={{ padding: 0, borderBottom: `1px solid ${colors.border}` }}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="admin-order-row"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(100px, 1fr) minmax(100px, 1.5fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr)',
                          textDecoration: 'none',
                          color: 'inherit',
                          transition: 'background 0.1s ease-in-out',
                        }}
                      >
                        <span style={{
                          padding: '10px 14px',
                          fontFamily: typography.monoFont,
                          fontSize: adminTypography.dataSize,
                          color: colors.accent,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minWidth: 0,
                        }}>
                          {order.order_number as string}
                        </span>
                        <span style={{
                          padding: '10px 14px',
                          fontFamily: adminTypography.bodyFont,
                          fontSize: adminTypography.dataSize,
                          color: colors.cardForeground,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minWidth: 0,
                        }}>
                          {order.contact_name as string}
                        </span>
                        <span style={{
                          padding: '10px 14px',
                          fontFamily: typography.monoFont,
                          fontSize: adminTypography.dataSize,
                          color: colors.foreground,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}>
                          {formatAED(Number(order.total))}
                        </span>
                        <span className="order-col-status" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                          <StatusBadge status={order.status as string} />
                        </span>
                        <span className="order-col-date" style={{
                          padding: '10px 14px',
                          fontFamily: adminTypography.bodyFont,
                          fontSize: adminTypography.dataSize,
                          color: adminColors.mutedForeground,
                          whiteSpace: 'nowrap',
                        }}>
                          {new Date(order.created_at as string).toLocaleDateString()}
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{
                      padding: '24px 14px',
                      textAlign: 'center',
                      fontFamily: adminTypography.bodyFont,
                      fontSize: adminTypography.dataSize,
                      color: adminColors.mutedForeground,
                    }}>
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div style={{ border: `1px solid ${colors.border}` }}>
          <div style={{
            padding: '10px 16px',
            background: colors.muted,
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <p style={{ ...labelStyle, color: '#f59e0b', margin: 0 }}>Low stock alerts</p>
            <Link href="/admin/stock/restock" style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: '9px',
              letterSpacing: adminTypography.buttonLetterSpacing,
              textTransform: 'uppercase',
              color: colors.accent,
              textDecoration: 'none',
            }}>
              Restock
            </Link>
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
    </div>
  )
}
