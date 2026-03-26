'use client'

const MUTED = '#151922'
const BORDER = '#1E2530'
const ACCENT = '#00FFB2'

const pulseKeyframes = `
  @keyframes skeletonPulse {
    0% { background-color: ${MUTED}; }
    50% { background-color: #1A2030; box-shadow: 0 0 8px 0 ${ACCENT}18; }
    100% { background-color: ${MUTED}; }
  }
`

function Skeleton({ width = '100%', height = '16px', style = {} }: {
  width?: string
  height?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        width,
        height,
        background: MUTED,
        animation: 'skeletonPulse 1.6s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

function SkeletonCard() {
  return (
    <div style={{ border: `1px solid ${BORDER}`, background: '#0F1318', overflow: 'hidden' }}>
      <Skeleton height="200px" />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton height="11px" width="55%" />
        <Skeleton height="16px" width="80%" />
        <Skeleton height="13px" width="38%" style={{ marginTop: '4px' }} />
      </div>
    </div>
  )
}

export default function ShopLoading() {
  return (
    <div style={{ background: '#0A0D12', minHeight: '100vh' }}>
      <style>{pulseKeyframes}</style>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Page heading */}
        <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Skeleton width="80px" height="11px" />
          <Skeleton width="240px" height="32px" />
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width={`${60 + i * 10}px`} height="32px" />
          ))}
        </div>

        {/* Product grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px',
          background: BORDER,
        }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ background: '#0A0D12' }}>
              <SkeletonCard />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
