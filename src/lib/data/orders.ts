async function getClient() {
  const { createClient } = await import('@/lib/supabase/server')
  return createClient()
}

async function getAdminClient() {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  return createAdminClient()
}

export async function getOrderByIdAdmin(orderId: string) {
  const supabase = await getAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items(*)`)
    .eq('id', orderId)
    .single()
  if (error) throw error
  return data
}

export async function getOrdersByCustomer(customerId: string) {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items(*)`)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getOrderById(orderId: string) {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items(*)`)
    .eq('id', orderId)
    .single()
  if (error) throw error
  return data
}

export async function createOrder(orderData: {
  customer_id?: string
  contact_name: string
  contact_email: string
  contact_phone?: string
  shipping_address: string
  shipping_city: string
  shipping_emirate: string
  shipping_postal_code?: string
  subtotal: number
  shipping_cost: number
  total: number
  expires_at?: string
  items: Array<{
    product_id: string
    variant_id: string
    product_name: string
    variant_label: string
    sku: string
    quantity: number
    unit_price: number
    total_price: number
  }>
}) {
  const supabase = await getClient()

  const { items, ...orderFields } = orderData

  const p_order: Record<string, unknown> = {
    customer_id: orderFields.customer_id || null,
    contact_name: orderFields.contact_name,
    contact_email: orderFields.contact_email,
    contact_phone: orderFields.contact_phone || null,
    shipping_address: orderFields.shipping_address,
    shipping_city: orderFields.shipping_city,
    shipping_emirate: orderFields.shipping_emirate,
    shipping_postal_code: orderFields.shipping_postal_code || null,
    subtotal: orderFields.subtotal,
    shipping_cost: orderFields.shipping_cost,
    total: orderFields.total,
  }

  if (orderFields.expires_at) {
    p_order.expires_at = orderFields.expires_at
  }

  const p_items = items.map((item) => ({
    product_id: item.product_id,
    variant_id: item.variant_id,
    product_name: item.product_name,
    variant_label: item.variant_label,
    sku: item.sku,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
  }))

  const { data, error } = await supabase.rpc('create_order_with_items', {
    p_order,
    p_items,
  })

  if (error) throw error
  return data as Record<string, unknown>
}

export async function transitionOrderStatus(
  orderId: string,
  fromStatus: string,
  toStatus: string,
  extra?: Record<string, string>
): Promise<Record<string, unknown> | null> {
  const supabase = await getClient()
  const { data, error } = await supabase.rpc('transition_order_status', {
    p_order_id: orderId,
    p_from_status: fromStatus,
    p_to_status: toStatus,
    p_extra: extra || {},
  })
  if (error) throw error
  return data as Record<string, unknown> | null
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  extra?: {
    tracking_number?: string
    tracking_url?: string
    payment_intent_id?: string
    payment_transaction_ref?: string
    notes?: string
  }
) {
  const supabase = await getClient()

  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
  if (extra) Object.assign(updates, extra)

  if (status === 'paid') updates.paid_at = new Date().toISOString()
  if (status === 'shipped') updates.shipped_at = new Date().toISOString()
  if (status === 'delivered') updates.delivered_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}
