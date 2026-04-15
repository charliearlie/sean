async function getClient() {
  const { createClient } = await import('@/lib/supabase/server')
  return createClient()
}

export async function getDashboardStats() {
  const supabase = await getClient()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [todayOrders, weekOrders, monthOrders, recentOrders, lowStock, actionRequired] = await Promise.all([
    supabase.from('orders').select('total').gte('created_at', todayStart).neq('status', 'cancelled'),
    supabase.from('orders').select('total').gte('created_at', weekStart).neq('status', 'cancelled'),
    supabase.from('orders').select('total').gte('created_at', monthStart).neq('status', 'cancelled'),
    supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(10),
    supabase.from('product_variants').select('*, products(name, compound_code)').lt('stock_quantity', 6).eq('active', true),
    supabase.from('orders').select('id, order_number, contact_name, total, status, created_at').in('status', ['pending', 'paid']).order('created_at', { ascending: false }).limit(5),
  ])

  return {
    revenue: {
      today: todayOrders.data?.reduce((sum, o) => sum + Number(o.total), 0) || 0,
      week: weekOrders.data?.reduce((sum, o) => sum + Number(o.total), 0) || 0,
      month: monthOrders.data?.reduce((sum, o) => sum + Number(o.total), 0) || 0,
    },
    recentOrders: recentOrders.data || [],
    lowStockAlerts: lowStock.data || [],
    orderCounts: {
      today: todayOrders.data?.length || 0,
      week: weekOrders.data?.length || 0,
      month: monthOrders.data?.length || 0,
    },
    actionRequired: actionRequired.data || [],
  }
}

export async function getCustomers() {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createProduct(productData: {
  slug: string
  name: string
  compound_code: string
  category_id: string
  description?: string
  long_description?: string
  purity?: number
  molecular_weight?: string
  form_factor?: string
  sequence?: string
  coa_batch_number?: string
  image_url?: string
  featured?: boolean
}) {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProduct(
  productId: string,
  updates: Record<string, unknown>
) {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getAllOrders(status?: string) {
  const supabase = await getClient()
  let query = supabase
    .from('orders')
    .select(`*, order_items(*), profiles(full_name, email)`)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}
