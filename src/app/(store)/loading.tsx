'use client'

const MUTED = '#151922'
const ACCENT = '#00FFB2'

const pulseKeyframes = `
  @keyframes skeletonPulse {
    0% { background-color: ${MUTED}; }
    50% { background-color: #1A2030; box-shadow: 0 0 8px 0 ${ACCENT}18; }
    100% { background-color: ${MUTED}; }
  }
`

export default function StoreLoading() {
  return (
    <div style={{
      background: '#0A0D12',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <style>{pulseKeyframes}</style>
      <div
        style={{
          width: '48px',
          height: '3px',
          background: MUTED,
          animation: 'skeletonPulse 1.6s ease-in-out infinite',
        }}
      />
    </div>
  )
}
