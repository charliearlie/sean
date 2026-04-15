'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cipherTokens } from '@/concepts/cipher/tokens'
import { formatAED } from '@/shared/utils/currency'
import DataTable, { Column } from '@/concepts/cipher/components/admin/DataTable'
import StatusBadge, { STATUS_LABELS } from '@/concepts/cipher/components/admin/StatusBadge'

const { colors, typography, adminTypography, adminColors, adminBorders } = cipherTokens

const STATUSES = [
  'all',
  'pending',
  'payment_processing',
  'paid',
  'confirmed',
  'preparing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'refunded',
  'cancelled',
]

interface Order {
  id: string
  order_number: string
  contact_name: string
  total: number
  status: string
  created_at: string
  order_items: unknown[]
  profiles: { full_name: string; email: string } | null
}

interface OrdersTableProps {
  orders: Order[]
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [reconciling, setReconciling] = useState(false)
  const [reconcileMsg, setReconcileMsg] = useState('')

  const handleExportCsv = useCallback(() => {
    const a = document.createElement('a')
    a.href = '/api/admin/orders/export'
    a.download = ''
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [])

  const handleReconcile = useCallback(async () => {
    setReconciling(true)
    setReconcileMsg('')
    try {
      const res = await fetch('/api/payment/reconcile', { method: 'POST' })
      const data = await res.json()
      if (data.error) {
        setReconcileMsg(`Error: ${data.error}`)
      } else {
        setReconcileMsg(data.message)
        router.refresh()
      }
    } catch {
      setReconcileMsg('Failed to reconcile')
    } finally {
      setReconciling(false)
    }
  }, [router])

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchesOrder = o.order_number?.toLowerCase().includes(q)
      const matchesName = o.contact_name?.toLowerCase().includes(q)
      const matchesProfileName = o.profiles?.full_name?.toLowerCase().includes(q)
      const matchesEmail = o.profiles?.email?.toLowerCase().includes(q)
      if (!matchesOrder && !matchesName && !matchesProfileName && !matchesEmail) return false
    }
    return true
  })

  // Count orders per status for badges
  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  const columns: Column<Order>[] = [
    {
      key: 'order_number',
      label: 'Order #',
      render: (row) => (
        <span style={{
          fontFamily: typography.monoFont,
          fontSize: adminTypography.dataSize,
          color: colors.accent,
          fontWeight: 600,
        }}>
          {row.order_number}
        </span>
      ),
    },
    {
      key: 'contact_name',
      label: 'Customer',
      render: (row) => row.contact_name || row.profiles?.full_name,
    },
    {
      key: 'order_items',
      label: 'Items',
      sortable: false,
      render: (row) => String(row.order_items?.length || 0),
    },
    {
      key: 'total',
      label: 'Total',
      render: (row) => (
        <span style={{ fontWeight: 600 }}>
          {formatAED(Number(row.total))}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (row) => (
        <span style={{ fontFamily: adminTypography.bodyFont, fontSize: adminTypography.dataSize, color: adminColors.mutedForeground }}>
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ]

  return (
    <div>
      {/* Search + Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 240px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search orders or customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                fontFamily: adminTypography.bodyFont,
                fontSize: adminTypography.dataSize,
                padding: '10px 12px 10px 32px',
                background: 'transparent',
                color: colors.foreground,
                border: `1px solid ${colors.border}`,
                borderRadius: adminBorders.radius,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease-in-out',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.accent }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border }}
            />
            <span style={{
              position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '13px', color: adminColors.mutedForeground, pointerEvents: 'none',
            }}>
              &#x2315;
            </span>
          </div>
          <p style={{
            fontFamily: adminTypography.bodyFont,
            fontSize: '10px',
            color: adminColors.mutedForeground,
            margin: '4px 0 0',
          }}>
            Search by order number, customer name, or email
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCsv}
            style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: adminTypography.buttonSize,
              letterSpacing: adminTypography.buttonLetterSpacing,
              textTransform: 'uppercase',
              padding: '6px 14px',
              background: 'transparent',
              color: colors.foreground,
              border: `1px solid ${colors.border}`,
              borderRadius: adminBorders.radius,
              cursor: 'pointer',
              transition: 'all 0.15s ease-in-out',
            }}
          >
            Export CSV
          </button>
          <button
            onClick={handleReconcile}
            disabled={reconciling}
            style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: '9px',
              letterSpacing: adminTypography.buttonLetterSpacing,
              textTransform: 'uppercase',
              padding: '6px 12px',
              background: 'transparent',
              color: adminColors.mutedForeground,
              border: `1px solid ${colors.border}`,
              borderRadius: adminBorders.radius,
              cursor: reconciling ? 'default' : 'pointer',
              opacity: reconciling ? 0.5 : 0.7,
              transition: 'all 0.15s ease-in-out',
            }}
          >
            {reconciling ? 'Checking...' : 'Check Payments'}
          </button>
          {reconcileMsg && (
            <span style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: adminTypography.buttonSize,
              color: reconcileMsg.startsWith('Error') ? '#FF4444' : adminColors.mutedForeground,
              letterSpacing: '0.05em',
            }}>
              {reconcileMsg}
            </span>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        {STATUSES.map((s) => {
          const count = s === 'all' ? orders.length : (statusCounts[s] || 0)
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                fontFamily: adminTypography.bodyFont,
                fontSize: adminTypography.buttonSize,
                letterSpacing: adminTypography.buttonLetterSpacing,
                textTransform: 'uppercase',
                padding: '6px 12px',
                background: statusFilter === s ? colors.accent : 'transparent',
                color: statusFilter === s ? colors.accentForeground : adminColors.mutedForeground,
                border: `1px solid ${statusFilter === s ? colors.accent : colors.border}`,
                borderRadius: adminBorders.radius,
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              {s === 'all' ? 'All' : (STATUS_LABELS[s] || s.replace(/_/g, ' '))} ({count})
            </button>
          )
        })}
      </div>

      <DataTable<Order>
        columns={columns}
        data={filtered}
        onRowClick={(row) => router.push(`/admin/orders/${row.id}`)}
        entityName="orders"
        emptyMessage="No orders match your search or filters"
      />
    </div>
  )
}
