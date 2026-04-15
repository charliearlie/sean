'use client'

export default function PrintButton() {
  return (
    <button
      style={{
        fontFamily: "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif",
        fontSize: '11px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        fontWeight: 700,
        padding: '10px 24px',
        background: '#000',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
      }}
      onClick={() => window.print()}
    >
      Print Invoice
    </button>
  )
}
