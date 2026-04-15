interface AdminIconProps {
  name: string
  size?: number
}

const icons: Record<string, (size: number) => React.ReactNode> = {
  dashboard: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="1.5" y="1.5" width="5" height="5" rx="0.5" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="0.5" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="0.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
    </svg>
  ),
  products: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M2 5.5L8 2l6 3.5v5L8 14l-6-3.5z" />
      <path d="M2 5.5L8 9m0 0l6-3.5M8 9v5" />
    </svg>
  ),
  orders: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="1.5" width="10" height="13" rx="0.5" />
      <line x1="5.5" y1="5" x2="10.5" y2="5" />
      <line x1="5.5" y1="8" x2="10.5" y2="8" />
      <line x1="5.5" y1="11" x2="8.5" y2="11" />
    </svg>
  ),
  customers: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="5" r="3" />
      <path d="M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    </svg>
  ),
  stock: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="9" width="12" height="5" rx="0.5" />
      <rect x="3" y="5" width="10" height="4" rx="0.5" />
      <rect x="4" y="1.5" width="8" height="3.5" rx="0.5" />
    </svg>
  ),
  chatbot: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M2 2.5h12v9H9l-3 2.5v-2.5H2z" strokeLinejoin="round" />
      <circle cx="5.5" cy="7" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="8" cy="7" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  ),
  shipping: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="1" y="4" width="9" height="7" rx="0.5" />
      <path d="M10 6.5h3l2 3V11h-5" />
      <circle cx="4" cy="12.5" r="1.5" />
      <circle cx="12.5" cy="12.5" r="1.5" />
    </svg>
  ),
  settings: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
    </svg>
  ),
}

export default function AdminIcon({ name, size = 16 }: AdminIconProps) {
  const renderIcon = icons[name]
  if (!renderIcon) return <span style={{ width: size, height: size, display: 'inline-block' }} />
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>{renderIcon(size)}</span>
}
