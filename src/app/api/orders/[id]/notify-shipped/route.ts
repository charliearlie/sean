import { NextRequest, NextResponse } from 'next/server'
import { sendShippingNotification } from '@/lib/email/send-shipping-notification'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params

    // Verify admin
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

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const trackingNumber = typeof body.trackingNumber === 'string' ? body.trackingNumber.slice(0, 100) : ''
    const trackingUrl = typeof body.trackingUrl === 'string' && /^https?:\/\//.test(body.trackingUrl) ? body.trackingUrl.slice(0, 500) : ''
    await sendShippingNotification(orderId, trackingNumber, trackingUrl)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Notify shipped error:', err)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
