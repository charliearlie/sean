import { cipherTokens } from '@/concepts/cipher/tokens'
import Link from 'next/link'

const { colors, typography } = cipherTokens

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: typography.monoFont,
      }}
    >
      <div
        style={{
          border: `1px solid ${colors.border}`,
          background: colors.card,
          padding: '48px',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: typography.monoFont,
            fontSize: '96px',
            fontWeight: 700,
            color: colors.accent,
            lineHeight: 1,
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}
        >
          404
        </div>

        <div
          style={{
            width: '40px',
            height: '1px',
            background: colors.border,
            margin: '0 auto 24px',
          }}
        />

        <p
          style={{
            fontFamily: typography.monoFont,
            fontSize: '13px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: colors.mutedForeground,
            marginBottom: '8px',
          }}
        >
          Page Not Found
        </p>

        <p
          style={{
            fontFamily: typography.bodyFont,
            fontSize: '14px',
            color: colors.cardForeground,
            marginBottom: '32px',
            lineHeight: 1.6,
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          style={{
            display: 'inline-block',
            fontFamily: typography.monoFont,
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: colors.accent,
            color: colors.accentForeground,
            padding: '12px 28px',
            textDecoration: 'none',
            fontWeight: 700,
            transition: 'opacity 0.15s ease-in-out',
          }}
        >
          Back to Shop
        </Link>
      </div>
    </div>
  )
}
