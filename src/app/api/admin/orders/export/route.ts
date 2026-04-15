import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

function escapeCsvValue(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value)
  // Wrap in quotes if value contains comma, quote, or newline
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function csvRow(values: unknown[]): string {
  return values.map(escapeCsvValue).join(',')
}

export async function GET() {
  // Auth check via server client
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

  const adminSupabase = createAdminClient()

  const { data: orders, error } = await adminSupabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const filename = `orders-export-${today}.csv`

  const headers = [
    'order_number',
    'date',
    'customer',
    'email',
    'phone',
    'status',
    'subtotal',
    'shipping',
    'total',
    'emirate',
    'items_summary',
  ]

  const rows = (orders || []).map((order) => {
    const items = (order.order_items || []) as Record<string, unknown>[]
    const itemsSummary = items
      .map((item) => `${item.product_name as string} x${item.quantity as number}`)
      .join(', ')

    return csvRow([
      order.order_number,
      new Date(order.created_at).toISOString().slice(0, 10),
      order.contact_name,
      order.contact_email,
      order.contact_phone || '',
      order.status,
      order.subtotal,
      order.shipping_cost,
      order.total,
      order.shipping_emirate,
      itemsSummary,
    ])
  })

  const csv = [csvRow(headers), ...rows].join('\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
