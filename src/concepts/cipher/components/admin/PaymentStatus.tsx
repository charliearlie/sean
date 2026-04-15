'use client'

import { useState, useEffect } from 'react'
import { cipherTokens } from '@/concepts/cipher/tokens'
import { formatAED } from '@/shared/utils/currency'

const { colors, typography, adminTypography, adminColors, adminBorders } = cipherTokens

const sectionHeaderStyle: React.CSSProperties = {
  fontFamily: adminTypography.bodyFont,
  fontSize: adminTypography.sectionHeaderSize,
  letterSpacing: adminTypography.labelLetterSpacing,
  color: adminColors.mutedForeground,
  textTransform: 'uppercase',
  padding: '10px 16px',
  background: colors.muted,
  borderBottom: `1px solid ${colors.border}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const infoRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 16px',
  borderBottom: `1px solid ${colors.border}`,
}

const infoLabelStyle: React.CSSProperties = {
  fontFamily: adminTypography.bodyFont,
  fontSize: adminTypography.labelSize,
  color: adminColors.mutedForeground,
  letterSpacing: adminTypography.labelLetterSpacing,
  textTransform: 'uppercase',
}

const infoValueStyle: React.CSSProperties = {
  fontFamily: adminTypography.bodyFont,
  fontSize: adminTypography.dataSize,
  color: colors.foreground,
}

const STATUS_COLORS: Record<string, string> = {
  completed: '#22c55e',
  pending: '#f59e0b',
  requires_payment_instrument: '#f59e0b',
  requires_user_action: '#f59e0b',
  failed: '#ef4444',
  canceled: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completed',
  pending: 'Pending',
  requires_payment_instrument: 'Awaiting Payment',
  requires_user_action: 'Awaiting User',
  failed: 'Failed',
  canceled: 'Cancelled',
}

interface PaymentStatusProps {
  orderId: string
  paymentIntentId: string | null
  paymentMethod: string | null
  paidAt: string | null
}

export default function PaymentStatus({ orderId, paymentIntentId, paymentMethod, paidAt }: PaymentStatusProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [data, setData] = useState<{
    intentId: string
    status: string
    amount: number
    currencyCode: string
    createdAt: string
  } | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payment-status`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to fetch')
      }
      setData(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (paymentIntentId) {
      fetchStatus()
    } else {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, paymentIntentId])

  const statusColor = data ? (STATUS_COLORS[data.status] || adminColors.mutedForeground) : adminColors.mutedForeground
  const statusLabel = data ? (STATUS_LABELS[data.status] || data.status) : ''

  return (
    <div style={{ border: `1px solid ${colors.border}` }}>
      <div style={sectionHeaderStyle}>
        <span>Payment Status</span>
        {paymentIntentId && (
          <button
            onClick={fetchStatus}
            disabled={loading}
            style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: '9px',
              letterSpacing: adminTypography.labelLetterSpacing,
              textTransform: 'uppercase',
              color: loading ? adminColors.mutedForeground : colors.accent,
              background: 'transparent',
              border: `1px solid ${loading ? colors.border : colors.accent}`,
              borderRadius: adminBorders.radius,
              padding: '3px 8px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Checking...' : 'Refresh'}
          </button>
        )}
      </div>

      {!paymentIntentId ? (
        <div style={{
          padding: '16px',
          fontFamily: adminTypography.bodyFont,
          fontSize: adminTypography.dataSize,
          color: adminColors.mutedForeground,
          textAlign: 'center',
        }}>
          No payment recorded
        </div>
      ) : loading && !data ? (
        <div style={{
          padding: '16px',
          fontFamily: adminTypography.bodyFont,
          fontSize: adminTypography.dataSize,
          color: adminColors.mutedForeground,
          textAlign: 'center',
        }}>
          Checking with Ziina...
        </div>
      ) : error ? (
        <div style={{
          padding: '16px',
          fontFamily: adminTypography.bodyFont,
          fontSize: adminTypography.dataSize,
          color: '#ef4444',
        }}>
          {error}
        </div>
      ) : data ? (
        <>
          <div style={infoRowStyle}>
            <span style={infoLabelStyle}>Gateway</span>
            <span style={infoValueStyle}>{paymentMethod === 'ziina' ? 'Ziina' : paymentMethod || 'Unknown'}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={infoLabelStyle}>Ziina Status</span>
            <span style={{
              fontFamily: typography.monoFont,
              fontSize: adminTypography.dataSize,
              fontWeight: 700,
              color: statusColor,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: statusColor,
                display: 'inline-block',
              }} />
              {statusLabel}
            </span>
          </div>
          <div style={infoRowStyle}>
            <span style={infoLabelStyle}>Amount</span>
            <span style={{ ...infoValueStyle, fontFamily: typography.monoFont }}>
              {formatAED(data.amount / 100)}
            </span>
          </div>
          {paidAt && (
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Paid At</span>
              <span style={infoValueStyle}>{new Date(paidAt).toLocaleString()}</span>
            </div>
          )}
          <div style={infoRowStyle}>
            <span style={infoLabelStyle}>Intent ID</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(data.intentId)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              title="Click to copy"
              style={{
                fontFamily: typography.monoFont,
                fontSize: '10px',
                color: copied ? colors.accent : adminColors.mutedForeground,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                maxWidth: '220px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'right',
              }}
            >
              {copied ? 'Copied!' : data.intentId}
            </button>
          </div>
          <div style={{
            padding: '8px 16px',
            fontFamily: adminTypography.bodyFont,
            fontSize: '9px',
            color: adminColors.mutedForeground,
            letterSpacing: '0.05em',
            fontStyle: 'italic',
          }}>
            Live data from Ziina
          </div>
        </>
      ) : null}
    </div>
  )
}
