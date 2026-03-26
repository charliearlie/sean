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

export default function ProductDetailLoading() {
  return (
    <div style={{ background: '#0A0D12', minHeight: '100vh' }}>
      <style>{pulseKeyframes}</style>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '32px' }}>
          <Skeleton width="60px" height="11px" />
          <Skeleton width="8px" height="11px" />
          <Skeleton width="80px" height="11px" />
          <Skeleton width="8px" height="11px" />
          <Skeleton width="120px" height="11px" />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'start',
        }}>
          {/* Left: image */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton height="480px" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height="80px" />
              ))}
            </div>
          </div>

          {/* Right: product info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Skeleton width="80px" height="11px" />
              <Skeleton height="36px" width="90%" />
              <Skeleton height="36px" width="70%" />
            </div>

            <Skeleton width="100px" height="24px" />

            <div style={{ height: '1px', background: BORDER }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Skeleton height="13px" width="100%" />
              <Skeleton height="13px" width="95%" />
              <Skeleton height="13px" width="88%" />
              <Skeleton height="13px" width="75%" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Skeleton height="11px" width="60px" />
              <div style={{ display: 'flex', gap: '8px' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} width="80px" height="36px" />
                ))}
              </div>
            </div>

            <div style={{ height: '1px', background: BORDER }} />

            <Skeleton height="48px" width="100%" />
            <Skeleton height="44px" width="100%" />
          </div>
        </div>
      </div>
    </div>
  )
}
