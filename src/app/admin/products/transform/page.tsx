import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BulkTransformClient from './BulkTransformClient'

export default async function BulkTransformPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== 'admin') redirect('/')

  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, compound_code, image_url, image_url_dark')
    .eq('active', true)
    .order('name')

  return <BulkTransformClient products={products || []} />
}
