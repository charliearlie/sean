'use client'

import { useState } from 'react'
import { cipherTokens } from '@/concepts/cipher/tokens'
import Link from 'next/link'

const { colors, typography } = cipherTokens

const DARK_BG_PROMPT =
  'Transform this product photo so the background is a very dark navy color (#0A0D12). Keep the product exactly as-is with all details, labels, and branding preserved. Only change the background to the dark navy color with subtle realistic lighting.'

interface Product {
  id: string
  name: string
  slug: string
  compound_code: string
  image_url: string | null
  image_url_dark: string | null
}

interface BulkTransformClientProps {
  products: Product[]
}

type TransformStatus = 'pending' | 'transforming' | 'done' | 'error'

export default function BulkTransformClient({ products: initialProducts }: BulkTransformClientProps) {
  const [products, setProducts] = useState(initialProducts)
  const [statuses, setStatuses] = useState<Record<string, TransformStatus>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [bulkRunning, setBulkRunning] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<string | null>(null)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [migrateRunning, setMigrateRunning] = useState(false)
  const [migrateResult, setMigrateResult] = useState<{ migrated: number; failed: string[] } | null>(null)

  const relativeCount = products.filter((p) => p.image_url && p.image_url.startsWith('/')).length

  const handleMigrateImages = async () => {
    setMigrateRunning(true)
    setMigrateResult(null)
    try {
      const res = await fetch('/api/images/migrate', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Migration failed')
      setMigrateResult(data)
      // Refresh products to reflect new URLs
      if (data.migrated > 0) {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.image_url && p.image_url.startsWith('/')) {
              // Mark as migrated — the actual URL comes from DB on next page load
              return { ...p, image_url: `migrated-${p.id}` }
            }
            return p
          })
        )
        // Reload to get fresh data from DB
        window.location.reload()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setMigrateResult({ migrated: 0, failed: [msg] })
    } finally {
      setMigrateRunning(false)
    }
  }

  const transformProduct = async (product: Product): Promise<boolean> => {
    if (!product.image_url) return false

    setStatuses((prev) => ({ ...prev, [product.id]: 'transforming' }))
    setCurrentProduct(product.name)

    try {
      // Convert to data URI via server
      const imgRes = await fetch('/api/images/to-data-uri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: product.image_url }),
      })
      if (!imgRes.ok) throw new Error('Failed to convert image')
      const { dataUri } = await imgRes.json()

      // Transform
      const transformRes = await fetch('/api/images/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUri: dataUri, prompt: DARK_BG_PROMPT }),
      })
      if (!transformRes.ok) {
        const err = await transformRes.json()
        throw new Error(err.error || 'Transform failed')
      }
      const { imageDataUri: resultDataUri } = await transformRes.json()

      // Upload
      const base64Data = resultDataUri.split(',')[1]
      const binaryStr = atob(base64Data)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'image/png' })

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const filePath = `products/${product.id}-dark.png`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, blob, { upsert: true, contentType: 'image/png' })
      if (uploadError) throw new Error('Upload failed: ' + uploadError.message)

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      // Save to DB
      const { error: dbError } = await supabase
        .from('products')
        .update({ image_url_dark: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', product.id)
      if (dbError) throw new Error('DB update failed: ' + dbError.message)

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, image_url_dark: publicUrl } : p))
      )
      setStatuses((prev) => ({ ...prev, [product.id]: 'done' }))
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setErrors((prev) => ({ ...prev, [product.id]: msg }))
      setStatuses((prev) => ({ ...prev, [product.id]: 'error' }))
      return false
    }
  }

  const handleBulkTransform = async () => {
    const missing = products.filter((p) => !p.image_url_dark && p.image_url)
    if (missing.length === 0) return

    setBulkRunning(true)
    setProgress({ done: 0, total: missing.length })

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < missing.length; i++) {
      if (i > 0) await new Promise((r) => setTimeout(r, 3000))
      const ok = await transformProduct(missing[i])
      if (ok) successCount++
      else failCount++
      setProgress({ done: i + 1, total: missing.length })
    }

    setCurrentProduct(null)
    setBulkRunning(false)
    alert(`Complete: ${successCount} succeeded, ${failCount} failed`)
  }

  const missingCount = products.filter((p) => !p.image_url_dark && p.image_url).length

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Migrate Images to Cloud */}
      <div
        style={{
          marginBottom: '24px',
          padding: '20px',
          border: `1px solid ${colors.border}`,
          background: colors.card,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: colors.foreground,
                marginBottom: '4px',
              }}
            >
              Migrate Images to Cloud
            </h2>
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: '11px',
                color: colors.mutedForeground,
              }}
            >
              {relativeCount > 0
                ? `${relativeCount} product${relativeCount === 1 ? '' : 's'} still using local image paths`
                : 'All product images are on Supabase Storage'}
            </p>
          </div>
          <button
            onClick={handleMigrateImages}
            disabled={migrateRunning || relativeCount === 0}
            style={{
              fontFamily: typography.monoFont,
              fontSize: '11px',
              letterSpacing: '0.1em',
              padding: '10px 20px',
              background: migrateRunning || relativeCount === 0 ? colors.muted : '#2563eb',
              color: migrateRunning || relativeCount === 0 ? colors.mutedForeground : '#fff',
              border: 'none',
              cursor: migrateRunning || relativeCount === 0 ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {migrateRunning
              ? 'Migrating...'
              : relativeCount === 0
                ? 'All Migrated'
                : `Migrate ${relativeCount} Images`}
          </button>
        </div>
        {migrateResult && (
          <div style={{ marginTop: '12px', fontFamily: typography.monoFont, fontSize: '11px' }}>
            <p style={{ color: '#22c55e' }}>{migrateResult.migrated} images migrated successfully</p>
            {migrateResult.failed.length > 0 && (
              <div style={{ color: '#ef4444', marginTop: '4px' }}>
                {migrateResult.failed.map((f, i) => (
                  <p key={i}>{f}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Link
            href="/admin/products"
            style={{
              fontFamily: typography.monoFont,
              fontSize: '10px',
              color: colors.mutedForeground,
              textDecoration: 'none',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            &larr; Back to Products
          </Link>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: colors.foreground,
              marginTop: '8px',
            }}
          >
            Bulk Dark Image Transform
          </h1>
          <p style={{ fontFamily: typography.monoFont, fontSize: '11px', color: colors.mutedForeground, marginTop: '4px' }}>
            {missingCount} of {products.length} products need dark images
          </p>
        </div>
        <button
          onClick={handleBulkTransform}
          disabled={bulkRunning || missingCount === 0}
          style={{
            fontFamily: typography.monoFont,
            fontSize: '11px',
            letterSpacing: '0.1em',
            padding: '12px 24px',
            background: bulkRunning || missingCount === 0 ? colors.muted : colors.accent,
            color: bulkRunning || missingCount === 0 ? colors.mutedForeground : colors.accentForeground,
            border: 'none',
            cursor: bulkRunning || missingCount === 0 ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
          }}
        >
          {bulkRunning
            ? `Transforming ${progress.done}/${progress.total}...`
            : missingCount === 0
              ? 'All Done'
              : `Transform All Missing (${missingCount})`}
        </button>
      </div>

      {/* Progress bar */}
      {bulkRunning && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ background: colors.muted, height: '4px', width: '100%' }}>
            <div
              style={{
                background: colors.accent,
                height: '4px',
                width: `${(progress.done / progress.total) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          {currentProduct && (
            <p style={{ fontFamily: typography.monoFont, fontSize: '11px', color: colors.mutedForeground, marginTop: '6px' }}>
              Processing: {currentProduct}
            </p>
          )}
        </div>
      )}

      {/* Product grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1px',
          background: colors.border,
          border: `1px solid ${colors.border}`,
        }}
      >
        {products.map((product) => {
          const status = statuses[product.id]
          const err = errors[product.id]

          return (
            <div key={product.id} style={{ background: colors.card, padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: '10px',
                    color: colors.accent,
                    letterSpacing: '0.1em',
                  }}
                >
                  {product.compound_code}
                </span>
                <span
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: '9px',
                    color:
                      product.image_url_dark || status === 'done'
                        ? '#22c55e'
                        : status === 'error'
                          ? '#ef4444'
                          : status === 'transforming'
                            ? colors.accent
                            : colors.mutedForeground,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {status === 'transforming'
                    ? 'Processing...'
                    : status === 'error'
                      ? 'Error'
                      : product.image_url_dark || status === 'done'
                        ? 'Has Dark'
                        : 'Missing'}
                </span>
              </div>

              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.foreground,
                  marginBottom: '8px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {product.name}
              </p>

              {/* Thumbnails */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div
                  style={{
                    aspectRatio: '1',
                    background: '#d4d4d4',
                    border: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt="Light"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '9px', color: '#999' }}>No img</span>
                  )}
                </div>
                <div
                  style={{
                    aspectRatio: '1',
                    background: colors.muted,
                    border: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {product.image_url_dark ? (
                    <img
                      src={product.image_url_dark}
                      alt="Dark"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '9px', color: colors.mutedForeground }}>—</span>
                  )}
                </div>
              </div>

              {err && <p style={{ fontSize: '10px', color: '#ef4444', marginBottom: '8px' }}>{err}</p>}

              {!product.image_url_dark && status !== 'done' && product.image_url && (
                <button
                  onClick={() => transformProduct(product)}
                  disabled={status === 'transforming' || bulkRunning}
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: '9px',
                    letterSpacing: '0.1em',
                    padding: '6px 12px',
                    background: 'transparent',
                    color: colors.cardForeground,
                    border: `1px solid ${colors.border}`,
                    cursor: status === 'transforming' || bulkRunning ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase',
                    width: '100%',
                  }}
                >
                  {status === 'transforming' ? 'Processing...' : 'Transform'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
