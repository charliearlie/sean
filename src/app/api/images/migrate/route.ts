import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

export async function POST() {
  const { createClient } = await import('@/lib/supabase/server')
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

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminSupabase = createAdminClient()

    // Get products with relative image paths
    const { data: products, error: fetchError } = await adminSupabase
      .from('products')
      .select('id, slug, image_url')
      .like('image_url', '/%')

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ migrated: 0, failed: [] })
    }

    const migrated: string[] = []
    const failed: string[] = []

    for (const product of products) {
      try {
        // Read file from public directory
        const relativePath = product.image_url.replace(/^\//, '')
        if (relativePath.includes('..')) {
          failed.push(`${product.slug}: Invalid path`)
          continue
        }
        const filePath = path.join(process.cwd(), 'public', relativePath)
        const fileBuffer = await fs.readFile(filePath)

        const ext = path.extname(relativePath).replace('.', '') || 'jpg'
        const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
        const storagePath = `products/${product.id}.${ext}`

        // Upload to Supabase Storage
        const { error: uploadError } = await adminSupabase.storage
          .from('product-images')
          .upload(storagePath, fileBuffer, {
            upsert: true,
            contentType,
          })

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`)
        }

        // Get public URL
        const { data: urlData } = adminSupabase.storage
          .from('product-images')
          .getPublicUrl(storagePath)

        // Update DB
        const { error: dbError } = await adminSupabase
          .from('products')
          .update({ image_url: urlData.publicUrl, updated_at: new Date().toISOString() })
          .eq('id', product.id)

        if (dbError) {
          throw new Error(`DB update failed: ${dbError.message}`)
        }

        migrated.push(product.slug)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        failed.push(`${product.slug}: ${msg}`)
      }
    }

    return NextResponse.json({ migrated: migrated.length, failed })
  } catch (error) {
    console.error('Image migration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
