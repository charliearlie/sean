'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

const STATUS_LABELS: Record<string, string> = {
  pending: 'New',
  payment_processing: 'Processing',
  paid: 'Paid',
  confirmed: 'Confirmed',
  preparing: 'Packing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

// Allowed transitions — can jump forward but never backwards past payment
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['payment_processing', 'cancelled'],
  payment_processing: ['paid', 'cancelled'],
  paid: ['confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'],
  confirmed: ['preparing', 'shipped', 'delivered', 'cancelled', 'refunded'],
  preparing: ['shipped', 'delivered', 'cancelled', 'refunded'],
  shipped: ['delivered', 'cancelled', 'refunded'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
}

interface OrderStatusUpdaterProps {
  orderId: string
  currentStatus: string
}

export default function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || []

  const handleUpdate = async () => {
    setSaving(true)
    try {
      // Handle cancellation/refund via API to restore stock
      if ((status === 'cancelled' || status === 'refunded') && currentStatus !== 'cancelled' && currentStatus !== 'refunded') {
        const res = await fetch(`/api/orders/${orderId}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, notes }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to cancel order')
        router.refresh()
        return
      }

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const updates: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (trackingNumber) updates.tracking_number = trackingNumber
      if (trackingUrl) updates.tracking_url = trackingUrl
      if (notes) updates.notes = notes

      if (status === 'paid') updates.paid_at = new Date().toISOString()
      if (status === 'shipped') updates.shipped_at = new Date().toISOString()
      if (status === 'delivered') updates.delivered_at = new Date().toISOString()

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)

      if (error) throw error
      router.refresh()

      // Send shipping notification email
      if (status === 'shipped') {
        try {
          await fetch(`/api/orders/${orderId}/notify-shipped`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trackingNumber, trackingUrl }),
          })
        } catch {
          // Don't block on email failure
        }
      }
    } catch (err) {
      alert('Error updating status: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ border: `1px solid ${colors.border}` }}>
      <div style={{
        padding: '10px 16px',
        background: colors.muted,
        borderBottom: `1px solid ${colors.border}`,
        fontFamily: adminTypography.bodyFont,
        fontSize: adminTypography.sectionHeaderSize,
        letterSpacing: adminTypography.labelLetterSpacing,
        color: adminColors.mutedForeground,
        textTransform: 'uppercase',
      }}>
        Update Status
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Status</label>
          <select
            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={allowedNext.length === 0}
          >
            <option value={currentStatus} style={{ background: colors.muted, color: colors.foreground }}>
              {STATUS_LABELS[currentStatus] || currentStatus} (current)
            </option>
            {allowedNext.map((s) => (
              <option key={s} value={s} style={{ background: colors.muted, color: colors.foreground }}>
                {STATUS_LABELS[s] || s}
              </option>
            ))}
          </select>
          {allowedNext.length === 0 && (
            <p style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: '10px',
              color: adminColors.mutedForeground,
              margin: '4px 0 0',
              fontStyle: 'italic',
            }}>
              No further status changes available
            </p>
          )}
        </div>

        {(status === 'shipped' || status === 'out_for_delivery') && (
          <>
            <div>
              <label style={labelStyle}>Tracking Number</label>
              <input
                style={inputStyle}
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="TRACK-XXXXX"
              />
            </div>
            <div>
              <label style={labelStyle}>Tracking URL</label>
              <input
                style={inputStyle}
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://tracking.example.com/..."
              />
            </div>
          </>
        )}

        <div>
          <label style={labelStyle}>Notes</label>
          <textarea
            style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes..."
          />
        </div>

        <button
          onClick={handleUpdate}
          disabled={saving || status === currentStatus}
          style={{
            fontFamily: typography.monoFont,
            fontSize: adminTypography.buttonSize,
            fontWeight: 700,
            letterSpacing: adminTypography.buttonLetterSpacing,
            padding: '10px 24px',
            background: (saving || status === currentStatus) ? colors.muted : colors.accent,
            color: (saving || status === currentStatus) ? colors.mutedForeground : colors.accentForeground,
            border: 'none',
            borderRadius: adminBorders.radius,
            cursor: (saving || status === currentStatus) ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
            alignSelf: 'flex-start',
          }}
        >
          {saving ? 'Updating...' : 'Update Status'}
        </button>
      </div>
    </div>
  )
}
