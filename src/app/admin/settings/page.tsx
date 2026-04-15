import Link from 'next/link'
import { cipherTokens } from '@/concepts/cipher/tokens'

const { colors, typography, adminTypography, adminColors } = cipherTokens

export default function SettingsPage() {
  return (
    <div>
      <div style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: '16px', marginBottom: '24px' }}>
        <p style={{
          fontFamily: adminTypography.bodyFont,
          fontSize: adminTypography.labelSize,
          letterSpacing: adminTypography.labelLetterSpacing,
          color: adminColors.mutedForeground,
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}>
          Configuration
        </p>
        <h1 style={{
          fontFamily: typography.monoFont,
          fontSize: adminTypography.headingSize,
          fontWeight: 700,
          color: colors.foreground,
          letterSpacing: '0.05em',
          margin: 0,
        }}>
          Settings
        </h1>
      </div>

      <Link
        href="/admin/shipping"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          border: `1px solid ${colors.border}`,
          textDecoration: 'none',
          transition: 'background 0.15s ease-in-out',
          marginBottom: '12px',
        }}
      >
        <div>
          <p style={{
            fontFamily: typography.monoFont,
            fontSize: adminTypography.dataSize,
            fontWeight: 700,
            color: colors.foreground,
            margin: '0 0 4px',
          }}>
            Shipping Rates
          </p>
          <p style={{
            fontFamily: adminTypography.bodyFont,
            fontSize: adminTypography.labelSize,
            color: adminColors.mutedForeground,
            margin: 0,
          }}>
            Manage per-emirate rates and free shipping threshold
          </p>
        </div>
        <span style={{ color: adminColors.mutedForeground, fontSize: '14px' }}>&rarr;</span>
      </Link>
    </div>
  )
}
