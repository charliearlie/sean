import { redirect } from 'next/navigation'
import { cipherTokens } from '@/concepts/cipher/tokens'
import AdminNav from '@/concepts/cipher/components/admin/AdminNav'
import Breadcrumbs from '@/concepts/cipher/components/admin/Breadcrumbs'

const { colors, adminBorders } = cipherTokens

export const metadata = {
  title: 'Admin | Pure Peptides',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/')

  return (
    <>
      <style>{`
        .admin-layout {
          display: grid;
          grid-template-columns: auto 1fr;
          min-height: 100vh;
        }
        .admin-nav-topbar { display: none; }
        .admin-nav-close { display: none !important; }
        .admin-nav-overlay { display: none; }

        @media (max-width: 768px) {
          .admin-layout {
            display: flex;
            flex-direction: column;
          }
          .admin-nav-topbar { display: flex !important; }
          .admin-nav-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 1001;
            height: 100dvh !important;
            transform: translateX(-100%);
            transition: transform 0.25s ease-in-out;
            box-shadow: none;
          }
          .admin-nav-sidebar.open {
            transform: translateX(0);
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
          }
          .admin-nav-close { display: block !important; }
          .admin-nav-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(2px);
            opacity: 1;
            transition: opacity 0.25s ease-in-out;
          }
          .admin-nav-overlay.hidden {
            opacity: 0;
            pointer-events: none;
          }
        }
      `}</style>
      <div
        className="admin-layout"
        style={{
          ['--background' as string]: colors.background,
          ['--foreground' as string]: colors.foreground,
          ['--accent' as string]: colors.accent,
          ['--accent-foreground' as string]: colors.accentForeground,
          ['--muted' as string]: colors.muted,
          ['--muted-foreground' as string]: colors.mutedForeground,
          ['--border' as string]: colors.border,
          ['--card' as string]: colors.card,
          ['--card-foreground' as string]: colors.cardForeground,
          background: colors.background,
          color: colors.foreground,
          minHeight: '100vh',
        }}
      >
        <AdminNav />
        <main style={{ padding: '24px 16px', overflowX: 'hidden', minHeight: '100vh', borderRadius: adminBorders.radius }}>
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </>
  )
}
