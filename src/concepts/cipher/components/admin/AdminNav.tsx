'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cipherTokens } from '@/concepts/cipher/tokens'

const { colors, adminTypography, adminColors, adminBorders } = cipherTokens

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '\u25A0' },
  { href: '/admin/products', label: 'Products', icon: '\u2666' },
  { href: '/admin/customers', label: 'Customers', icon: '\u25CB' },
  { href: '/admin/stock', label: 'Stock', icon: '\u25A3' },
  { href: '/admin/chatbot', label: 'Chatbot', icon: '\u25C8' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div
        className="admin-nav-topbar"
        style={{
          display: 'none',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          background: colors.card,
          borderBottom: `1px solid ${colors.border}`,
          padding: '12px 16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            style={{
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              color: colors.foreground,
              fontSize: '18px',
              lineHeight: 1,
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            ☰
          </button>
          <span style={{
            fontFamily: adminTypography.bodyFont,
            fontSize: adminTypography.labelSize,
            fontWeight: 700,
            letterSpacing: adminTypography.labelLetterSpacing,
            color: colors.accent,
          }}>
            PURE PEPTIDES
          </span>
        </div>
        <span style={{
          fontFamily: adminTypography.bodyFont,
          fontSize: adminTypography.labelSize,
          letterSpacing: adminTypography.labelLetterSpacing,
          color: adminColors.mutedForeground,
          textTransform: 'uppercase',
        }}>
          Admin
        </span>
      </div>

      {/* Overlay */}
      <div
        className={`admin-nav-overlay${open ? '' : ' hidden'}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar / Drawer */}
      <div
        className={`admin-nav-sidebar${open ? ' open' : ''}`}
        style={{
          background: colors.card,
          borderRight: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          width: '240px',
          minWidth: '240px',
        }}
      >
        {/* Brand + close */}
        <div style={{
          padding: '24px 20px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <p style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: adminTypography.labelSize,
              fontWeight: 700,
              letterSpacing: adminTypography.labelLetterSpacing,
              color: colors.accent,
              margin: 0,
            }}>
              PURE PEPTIDES
            </p>
            <p style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: adminTypography.sectionHeaderSize,
              letterSpacing: adminTypography.labelLetterSpacing,
              color: adminColors.mutedForeground,
              margin: '4px 0 0',
              textTransform: 'uppercase',
            }}>
              Admin Panel
            </p>
          </Link>
          <button
            className="admin-nav-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            style={{
              display: 'none',
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              color: colors.foreground,
              fontSize: '18px',
              lineHeight: 1,
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Nav items */}
        <div style={{
          flex: 1,
          padding: '16px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          overflowY: 'auto',
        }}>
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 20px',
                  fontFamily: adminTypography.bodyFont,
                  fontSize: adminTypography.labelSize,
                  letterSpacing: adminTypography.labelLetterSpacing,
                  color: active ? colors.accent : adminColors.mutedForeground,
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  background: active ? colors.muted : 'transparent',
                  borderLeft: active ? `2px solid ${colors.accent}` : '2px solid transparent',
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                <span style={{ fontSize: '12px', width: '16px', textAlign: 'center' }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Bottom actions */}
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <Link
            href="/"
            style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: adminTypography.labelSize,
              letterSpacing: adminTypography.labelLetterSpacing,
              color: adminColors.mutedForeground,
              textDecoration: 'none',
              textTransform: 'uppercase',
              padding: '8px 0',
              transition: 'color 0.15s ease-in-out',
            }}
          >
            ← Back to Store
          </Link>
          <button
            onClick={handleLogout}
            style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: adminTypography.buttonSize,
              letterSpacing: adminTypography.buttonLetterSpacing,
              color: adminColors.mutedForeground,
              textTransform: 'uppercase',
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              borderRadius: adminBorders.radius,
              padding: '8px 12px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease-in-out',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  )
}
