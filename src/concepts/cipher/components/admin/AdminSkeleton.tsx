const background = '#0A0D12'
const border = '#1E2530'
const muted = '#151922'
const mutedForeground = '#5A6577'
const monoFont = 'var(--font-space-grotesk)'

export default function AdminSkeleton() {
  return (
    <>
      <style>{`
        @keyframes adminSkeletonPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .admin-skeleton-pulse {
          animation: adminSkeletonPulse 1.6s ease-in-out infinite;
        }
      `}</style>

      <div
        style={{
          background,
          minHeight: '100vh',
          fontFamily: monoFont,
          padding: '0',
        }}
      >
        {/* Header area */}
        <div
          style={{
            borderBottom: `1px solid ${border}`,
            paddingBottom: '16px',
            marginBottom: '24px',
          }}
        >
          {/* Breadcrumb bar */}
          <div
            className="admin-skeleton-pulse"
            style={{
              height: '10px',
              width: '120px',
              background: mutedForeground,
              borderRadius: '2px',
              marginBottom: '10px',
              opacity: 0.4,
            }}
          />
          {/* Title bar */}
          <div
            className="admin-skeleton-pulse"
            style={{
              height: '22px',
              width: '260px',
              background: mutedForeground,
              borderRadius: '2px',
              opacity: 0.4,
            }}
          />
        </div>

        {/* Content area — table-like rows */}
        <div
          style={{
            border: `1px solid ${border}`,
            background: muted,
            overflow: 'hidden',
          }}
        >
          {/* Table header row */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              padding: '10px 16px',
              borderBottom: `1px solid ${border}`,
              background,
            }}
          >
            {[80, 160, 100, 80].map((w, i) => (
              <div
                key={i}
                className="admin-skeleton-pulse"
                style={{
                  height: '9px',
                  width: `${w}px`,
                  background: mutedForeground,
                  borderRadius: '2px',
                  opacity: 0.3,
                }}
              />
            ))}
          </div>

          {/* Data rows */}
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div
              key={row}
              style={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                padding: '14px 16px',
                borderBottom: `1px solid ${border}`,
              }}
            >
              {/* Thumbnail placeholder */}
              <div
                className="admin-skeleton-pulse"
                style={{
                  width: '36px',
                  height: '36px',
                  background: mutedForeground,
                  borderRadius: '2px',
                  flexShrink: 0,
                  opacity: 0.25,
                }}
              />
              {/* Name + subtitle */}
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div
                  className="admin-skeleton-pulse"
                  style={{
                    height: '11px',
                    width: `${120 + (row % 3) * 40}px`,
                    background: mutedForeground,
                    borderRadius: '2px',
                    opacity: 0.35,
                  }}
                />
                <div
                  className="admin-skeleton-pulse"
                  style={{
                    height: '9px',
                    width: `${60 + (row % 2) * 30}px`,
                    background: mutedForeground,
                    borderRadius: '2px',
                    opacity: 0.2,
                  }}
                />
              </div>
              {/* Status badge placeholder */}
              <div
                className="admin-skeleton-pulse"
                style={{
                  height: '18px',
                  width: '56px',
                  background: mutedForeground,
                  borderRadius: '2px',
                  opacity: 0.2,
                }}
              />
              {/* Price placeholder */}
              <div
                className="admin-skeleton-pulse"
                style={{
                  height: '11px',
                  width: '48px',
                  background: mutedForeground,
                  borderRadius: '2px',
                  opacity: 0.25,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
