import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { updateSession } = await import('@/lib/supabase/middleware')
  const response = await updateSession(request)

  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.ziina.com",
    "frame-ancestors 'none'",
  ]
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '))

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
