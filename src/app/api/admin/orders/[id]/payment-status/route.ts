import { NextRequest, NextResponse } from 'next/server'
import { getZiinaPaymentIntent } from '@/lib/ziina'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const admin = createAdminClient()
    const { data: order } = await admin
      .from('orders')
      .select('payment_intent_id')
      .eq('id', id)
      .single()

    if (!order?.payment_intent_id) {
      return NextResponse.json({ error: 'No payment intent for this order' }, { status: 404 })
    }

    const result = await getZiinaPaymentIntent(order.payment_intent_id)

    return NextResponse.json({
      intentId: result.id,
      status: result.status,
      amount: result.amount,
      currencyCode: result.currency_code,
      createdAt: result.created_at,
    })
  } catch (err) {
    console.error('Payment status check error:', err)
    const message = err instanceof Error ? err.message : 'Failed to check payment status'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
