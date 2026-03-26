import { cipherTokens } from '@/concepts/cipher/tokens'

const { colors, typography, adminTypography, adminColors } = cipherTokens

interface StatsCardProps {
  label: string
  value: string
  subValue?: string
  accent?: boolean
}

export default function StatsCard({ label, value, subValue, accent = false }: StatsCardProps) {
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      padding: '20px',
    }}>
      <p style={{
        fontFamily: adminTypography.bodyFont,
        fontSize: adminTypography.labelSize,
        letterSpacing: adminTypography.labelLetterSpacing,
        color: adminColors.mutedForeground,
        textTransform: 'uppercase',
        margin: '0 0 12px',
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: typography.monoFont,
        fontSize: '24px',
        fontWeight: 700,
        color: accent ? colors.accent : colors.foreground,
        margin: 0,
        letterSpacing: '0.02em',
      }}>
        {value}
      </p>
      {subValue && (
        <p style={{
          fontFamily: adminTypography.bodyFont,
          fontSize: adminTypography.labelSize,
          color: adminColors.mutedForeground,
          margin: '6px 0 0',
          letterSpacing: '0.1em',
        }}>
          {subValue}
        </p>
      )}
    </div>
  )
}
