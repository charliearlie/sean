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

export default function AccountLoading() {
  return (
    <div style={{ background: '#0A0D12', minHeight: '100vh' }}>
      <style>{pulseKeyframes}</style>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '136px 24px 80px' }}>
        {/* Page header */}
        <div style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: '16px', marginBottom: '32px' }}>
          <Skeleton width="60px" height="9px" style={{ marginBottom: '8px' }} />
          <Skeleton width="180px" height="22px" />
        </div>

        {/* Sidebar + content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Sidebar nav skeleton */}
          <div style={{ border: `1px solid ${BORDER}` }}>
            <div style={{
              padding: '10px 16px',
              background: '#0F1318',
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <Skeleton width="80px" height="9px" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>
                <Skeleton width={`${55 + i * 10}px`} height="11px" />
              </div>
            ))}
            <div style={{ padding: '12px 16px' }}>
              <Skeleton width="60px" height="11px" />
            </div>
          </div>

          {/* Main content skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Welcome card */}
            <div style={{ border: `1px solid ${BORDER}`, padding: '24px' }}>
              <Skeleton width="100px" height="9px" style={{ marginBottom: '10px' }} />
              <Skeleton width="200px" height="16px" />
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[1, 2].map((i) => (
                <div key={i} style={{ border: `1px solid ${BORDER}`, padding: '20px' }}>
                  <Skeleton width="80px" height="9px" style={{ marginBottom: '10px' }} />
                  <Skeleton width="60px" height="24px" />
                </div>
              ))}
            </div>

            {/* Quick links row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[1, 2].map((i) => (
                <div key={i} style={{ border: `1px solid ${BORDER}`, padding: '20px' }}>
                  <Skeleton width="80px" height="11px" style={{ marginBottom: '6px' }} />
                  <Skeleton width="140px" height="10px" />
                </div>
              ))}
            </div>

            {/* Recent orders table */}
            <div style={{ border: `1px solid ${BORDER}` }}>
              <div style={{
                padding: '10px 16px',
                background: '#0F1318',
                borderBottom: `1px solid ${BORDER}`,
              }}>
                <Skeleton width="120px" height="9px" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Skeleton width="120px" height="12px" />
                  <Skeleton width="80px" height="12px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
