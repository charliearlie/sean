'use client'

import { useState } from 'react'
import { cipherTokens } from '@/concepts/cipher/tokens'

const { colors, typography } = cipherTokens

const DARK_BG_PROMPT =
  'Transform this product photo so the background is a very dark navy color (#0A0D12). Keep the product exactly as-is with all details, labels, and branding preserved. Only change the background to the dark navy color with subtle realistic lighting.'

interface ImageTransformProps {
  productId: string
  lightImageUrl: string | null
  darkImageUrl: string | null
  onTransformComplete: (darkUrl: string) => void
}

export default function ImageTransform({
  productId,
  lightImageUrl,
  darkImageUrl,
  onTransformComplete,
}: ImageTransformProps) {
  const [transforming, setTransforming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewDark, setPreviewDark] = useState<string | null>(darkImageUrl)

  const handleTransform = async () => {
    if (!lightImageUrl) return
    setTransforming(true)
    setError(null)

    try {
      // Fetch light image and convert to data URI
      const imgRes = await fetch('/api/images/to-data-uri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: lightImageUrl }),
      })
      if (!imgRes.ok) throw new Error('Failed to convert image to data URI')
      const { dataUri } = await imgRes.json()

      // Call transform API
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

      // Upload to Supabase Storage
      const base64Data = resultDataUri.split(',')[1]
      const binaryStr = atob(base64Data)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'image/png' })

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const filePath = `products/${productId}-dark.png`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, blob, { upsert: true, contentType: 'image/png' })
      if (uploadError) throw new Error('Upload failed: ' + uploadError.message)

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl
      setPreviewDark(publicUrl)
      onTransformComplete(publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transform failed')
    } finally {
      setTransforming(false)
    }
  }

  return (
    <div style={{ border: `1px solid ${colors.border}` }}>
      <div
        style={{
          padding: '10px 16px',
          background: colors.muted,
          borderBottom: `1px solid ${colors.border}`,
          fontFamily: typography.monoFont,
          fontSize: '9px',
          letterSpacing: '0.2em',
          color: colors.mutedForeground,
          textTransform: 'uppercase',
        }}
      >
        Dark Background Transform
      </div>
      <div style={{ padding: '16px' }}>
        {/* Side-by-side preview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: '9px',
                letterSpacing: '0.1em',
                color: colors.mutedForeground,
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Light (Original)
            </p>
            <div
              style={{
                background: '#d4d4d4',
                border: `1px solid ${colors.border}`,
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {lightImageUrl ? (
                <img
                  src={lightImageUrl}
                  alt="Light"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: colors.mutedForeground, fontSize: '11px' }}>No image</span>
              )}
            </div>
          </div>
          <div>
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: '9px',
                letterSpacing: '0.1em',
                color: colors.mutedForeground,
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Dark (Transformed)
            </p>
            <div
              style={{
                background: colors.muted,
                border: `1px solid ${colors.border}`,
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {previewDark ? (
                <img
                  src={previewDark}
                  alt="Dark"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: colors.mutedForeground, fontSize: '11px' }}>Not generated</span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px' }}>{error}</p>
        )}

        <button
          onClick={handleTransform}
          disabled={transforming || !lightImageUrl}
          style={{
            fontFamily: typography.monoFont,
            fontSize: '11px',
            letterSpacing: '0.1em',
            padding: '10px 20px',
            background: transforming ? colors.muted : colors.accent,
            color: transforming ? colors.mutedForeground : colors.accentForeground,
            border: 'none',
            cursor: transforming || !lightImageUrl ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
          }}
        >
          {transforming ? 'Transforming...' : previewDark ? 'Re-generate Dark Image' : 'Generate Dark Image'}
        </button>
      </div>
    </div>
  )
}
