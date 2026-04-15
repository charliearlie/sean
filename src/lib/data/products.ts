import { cache } from 'react'
import type { Product, Category } from '@/shared/types/product'

async function getClient() {
  const { createClient } = await import('@/lib/supabase/server')
  return createClient()
}

interface SupabaseProductRow {
  id: string
  slug: string
  name: string
  compound_code: string
  description: string | null
  long_description: string | null
  purity: number | null
  molecular_weight: string | null
  form_factor: string | null
  sequence: string | null
  coa_batch_number: string | null
  image_url: string | null
  image_url_dark: string | null
  featured: boolean
  categories: { slug: string } | null
  product_variants: {
    id: string
    label: string
    dosage: string
    price: number
    sku: string
    in_stock: boolean
    stock_quantity: number
  }[]
}

function transformProduct(row: SupabaseProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    compoundCode: row.compound_code,
    category: row.categories?.slug || '',
    description: row.description || '',
    longDescription: row.long_description || '',
    purity: Number(row.purity) || 0,
    molecularWeight: row.molecular_weight || '',
    formFactor: row.form_factor || 'Prefilled Klik-Pen',
    sequence: row.sequence || '',
    coaBatchNumber: row.coa_batch_number || '',
    imageUrl: row.image_url || null,
    imageUrlDark: row.image_url_dark || null,
    featured: row.featured || false,
    relatedSlugs: [],
    variants: (row.product_variants || []).map((v) => ({
      id: v.id,
      label: v.label,
      dosage: v.dosage,
      price: Number(v.price),
      sku: v.sku,
      inStock: v.in_stock ?? v.stock_quantity > 0,
    })),
  }
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from('products')
    .select(`*, product_variants(*), categories(*)`)
    .eq('active', true)
    .order('name')
  if (error) throw error
  return (data || []).map(transformProduct)
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from('products')
    .select(`*, product_variants(*), categories(*)`)
    .eq('slug', slug)
    .eq('active', true)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ? transformProduct(data) : null
})

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from('products')
    .select(`*, product_variants(*), categories!inner(*)`)
    .eq('categories.slug', categorySlug)
    .eq('active', true)
    .order('name')
  if (error) throw error
  return (data || []).map(transformProduct)
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from('products')
    .select(`*, product_variants(*), categories(*)`)
    .eq('featured', true)
    .eq('active', true)
    .order('name')
  if (error) throw error
  return (data || []).map(transformProduct)
}

export async function getMostPopularProduct(): Promise<Product | null> {
  const supabase = await getClient()
  const { data: rpcData } = await supabase.rpc('get_most_popular_product_id')
  if (!rpcData) return null

  const { data, error } = await supabase
    .from('products')
    .select(`*, product_variants(*), categories(*)`)
    .eq('id', rpcData)
    .eq('active', true)
    .single()
  if (error || !data) return null
  return transformProduct(data)
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await getClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*, products(count)')
    .eq('products.active', true)
    .order('sort_order')
  if (error) throw error

  return (data || []).map((c: { id: string; slug: string; name: string; description: string | null; products: { count: number }[] }) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description || '',
    productCount: c.products?.[0]?.count || 0,
  }))
}
