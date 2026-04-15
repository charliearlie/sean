async function getClient() {
  const { createClient } = await import('@/lib/supabase/server')
  return createClient()
}

export async function getShippingRates() {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from('shipping_rates')
    .select('*')
    .eq('active', true)
    .order('emirate')
  if (error) throw error
  return data
}

export async function getShippingRateForEmirate(emirate: string) {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from('shipping_rates')
    .select('rate')
    .eq('emirate', emirate)
    .eq('active', true)
    .single()
  if (error) throw error
  return data.rate as number
}

export async function updateShippingRate(emirate: string, rate: number) {
  const supabase = await getClient()
  const { error } = await supabase
    .from('shipping_rates')
    .update({ rate, updated_at: new Date().toISOString() })
    .eq('emirate', emirate)
  if (error) throw error
}

export async function getFreeShippingThreshold(): Promise<number> {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'free_shipping_threshold')
    .single()
  if (error) throw error
  return Number(data.value)
}

export async function updateFreeShippingThreshold(amount: number) {
  const supabase = await getClient()
  const { error } = await supabase
    .from('site_settings')
    .update({ value: amount, updated_at: new Date().toISOString() })
    .eq('key', 'free_shipping_threshold')
  if (error) throw error
}

export async function calculateShipping(emirate: string, subtotal: number): Promise<number> {
  const [rate, threshold] = await Promise.all([
    getShippingRateForEmirate(emirate),
    getFreeShippingThreshold(),
  ])
  return subtotal >= threshold ? 0 : rate
}
