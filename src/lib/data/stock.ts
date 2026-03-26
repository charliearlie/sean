async function getClient() {
  const { createClient } = await import('@/lib/supabase/server')
  return createClient()
}

export async function getStockLevels() {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from('product_variants')
    .select(`*, products(name, slug, compound_code)`)
    .order('stock_quantity', { ascending: true })
  if (error) throw error
  return data
}

export async function getLowStockAlerts() {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from('product_variants')
    .select(`*, products(name, slug, compound_code)`)
    .lt('stock_quantity', 6)
    .eq('active', true)
    .order('stock_quantity', { ascending: true })
  if (error) throw error
  return data
}

export async function getStockMovements(variantId?: string) {
  const supabase = await getClient()
  let query = supabase
    .from('stock_movements')
    .select(`*, product_variants(label, sku, products(name))`)
    .order('created_at', { ascending: false })
    .limit(100)

  if (variantId) {
    query = query.eq('variant_id', variantId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}
