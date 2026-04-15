import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Account routes: require any authenticated user (no admin check needed)
  if (pathname.startsWith('/account') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Public paths that bypass the under-construction gate
  const isPublicPath = pathname === '/under-construction'
    || pathname.startsWith('/login')
    || pathname.startsWith('/api/')
    || pathname.startsWith('/payment')

  // Only query admin role when a route actually needs it:
  // - /admin routes (admin guard)
  // - Non-public, non-account routes (under-construction gate)
  const needsAdminCheck = pathname.startsWith('/admin')
    || (!isPublicPath && !pathname.startsWith('/account'))
  let isAdmin = false
  if (user && needsAdminCheck) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  // Admin routes: require admin role
  if (pathname.startsWith('/admin') && !isAdmin) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Under construction gate: only admins can see the rest of the site
  if (!isPublicPath && !pathname.startsWith('/admin') && !pathname.startsWith('/account') && !isAdmin) {
    const url = request.nextUrl.clone()
    url.pathname = '/under-construction'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
