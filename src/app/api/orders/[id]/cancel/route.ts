import { NextRequest, NextResponse } from 'next/server'
import { adjustStock } from '@/lib/data/stock'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const targetStatus = body.status || 'cancelled'

    if (!['cancelled', 'refunded'].includes(targetStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

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

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'cancelled' || order.status === 'refunded') {
      return NextResponse.json({ error: 'Order already cancelled/refunded' }, { status: 400 })
    }

    // Restore stock for each item
    for (const item of order.order_items) {
      await adjustStock(
        item.variant_id,
        item.quantity,
        'return',
        'admin',
        id,
        `Order ${targetStatus} - stock restored`
      )
    }

    // Update order status
    const updates: Record<string, unknown> = {
      status: targetStatus,
      updated_at: new Date().toISOString(),
    }
    if (targetStatus === 'cancelled') updates.cancelled_at = new Date().toISOString()
    if (targetStatus === 'refunded') updates.refunded_at = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, status: targetStatus })
  } catch (err) {
    console.error('Cancel/refund error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
