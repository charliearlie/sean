'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cipherTokens } from '@/concepts/cipher/tokens'

const { colors, adminTypography, adminColors } = cipherTokens

const sectionLabels: Record<string, string> = {
  admin: 'Dashboard',
  products: 'Products',
  orders: 'Orders',
  customers: 'Customers',
  stock: 'Stock',
  shipping: 'Shipping',
  chatbot: 'Chatbot',
  settings: 'Settings',
  new: 'New',
  restock: 'Restock',
  invoice: 'Invoice',
  label: 'Shipping Label',
  transform: 'Image Transform',
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  // Don't show breadcrumbs on the dashboard root
  if (segments.length <= 1) return null

  const isUUID = (s: string) => /^[0-9a-f-]{36}$/.test(s)

  const crumbs = segments.map((segment, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/')
    const label = sectionLabels[segment] || (isUUID(segment) ? 'Detail' : segment.toUpperCase())
    const isLast = i === segments.length - 1
    return { href, label, isLast }
  })

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '20px',
      flexWrap: 'wrap',
    }}>
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {i > 0 && (
            <span style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: '10px',
              color: adminColors.mutedForeground,
            }}>
              /
            </span>
          )}
          {crumb.isLast ? (
            <span style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: adminTypography.labelSize,
              letterSpacing: adminTypography.labelLetterSpacing,
              textTransform: 'uppercase',
              color: colors.foreground,
            }}>
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              style={{
                fontFamily: adminTypography.bodyFont,
                fontSize: adminTypography.labelSize,
                letterSpacing: adminTypography.labelLetterSpacing,
                textTransform: 'uppercase',
                color: adminColors.mutedForeground,
                textDecoration: 'none',
                transition: 'color 0.15s ease-in-out',
              }}
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
