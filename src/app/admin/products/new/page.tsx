import NewProductClient from './NewProductClient'

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ clone?: string }>
}) {
  const { clone } = await searchParams
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const { data: cats } = await supabase.from('categories').select('*').order('sort_order')
  const categories = cats || []

  let cloneFrom = undefined
  if (clone) {
    const { data: source } = await supabase
      .from('products')
      .select('*')
      .eq('id', clone)
      .single()
    if (source) {
      cloneFrom = {
        name: `${source.name} (Copy)`,
        slug: '',
        compound_code: source.compound_code,
        category_id: source.category_id,
        description: source.description || '',
        long_description: source.long_description || '',
        purity: source.purity,
        molecular_weight: source.molecular_weight || '',
        form_factor: source.form_factor || '',
        sequence: source.sequence || '',
        coa_batch_number: source.coa_batch_number || '',
        image_url: '',
        featured: false,
        active: false,
      }
    }
  }

  return <NewProductClient categories={categories} cloneFrom={cloneFrom} />
}
