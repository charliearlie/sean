import { cipherTokens } from '@/concepts/cipher/tokens'

const { adminTypography, adminBorders } = cipherTokens

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  payment_processing: '#3b82f6',
  paid: '#22c55e',
  confirmed: '#22c55e',
  preparing: '#8b5cf6',
  shipped: '#06b6d4',
  out_for_delivery: '#06b6d4',
  delivered: '#22c55e',
  cancelled: '#ef4444',
  refunded: '#f59e0b',
}

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const color = statusColors[status] || '#5A6577'

  return (
    <span style={{
      fontFamily: adminTypography.bodyFont,
      fontSize: adminTypography.labelSize,
      fontWeight: 600,
      letterSpacing: adminTypography.labelLetterSpacing,
      textTransform: 'uppercase',
      color: color,
      background: `${color}18`,
      border: `1px solid ${color}40`,
      borderRadius: adminBorders.radius,
      padding: '3px 8px',
      whiteSpace: 'nowrap',
    }}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
