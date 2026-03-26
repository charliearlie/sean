import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { url } = await request.json()
    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    // Resolve relative paths to absolute URLs using the request origin
    const absoluteUrl = url.startsWith('http') ? url : new URL(url, request.nextUrl.origin).toString()
    const response = await fetch(absoluteUrl)
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch image: ${response.status}` }, { status: 502 })
    }

    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const dataUri = `data:${contentType};base64,${base64}`

    return NextResponse.json({ dataUri })
  } catch (error) {
    console.error('Image to data URI error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
