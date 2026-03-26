import NewProductClient from './NewProductClient'

export default async function NewProductPage() {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const { data: cats } = await supabase.from('categories').select('*').order('sort_order')
  const categories = cats || []

  return <NewProductClient categories={categories} />
}
