async function getClient() {
  const { createClient } = await import('@/lib/supabase/server')
  return createClient()
}

export async function getDashboardStats() {
  const supabase = await getClient()

  const [lowStock, productCount, customerCount] = await Promise.all([
    supabase.from('product_variants').select('*, products(name, compound_code)').lt('stock_quantity', 6).eq('active', true),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
  ])

  return {
    lowStockAlerts: lowStock.data || [],
    productCount: productCount.count || 0,
    customerCount: customerCount.count || 0,
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

