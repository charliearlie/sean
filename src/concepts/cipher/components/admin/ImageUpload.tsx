'use client'

import { useState, useRef } from 'react'
import { cipherTokens } from '@/concepts/cipher/tokens'

const { colors, typography } = cipherTokens

interface ImageUploadProps {
  bucket: string
  path: string
  currentUrl?: string
  onUpload: (url: string) => void
}

export default function ImageUpload({ bucket, path, currentUrl, onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const fileName = `${path}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      setPreview(publicUrl)
      onUpload(publicUrl)
    } catch (err) {
      alert('Upload error: ' + (err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {preview && (
        <div style={{
          marginBottom: '12px',
          border: `1px solid ${colors.border}`,
          background: colors.muted,
          width: '200px',
          aspectRatio: '1',
          overflow: 'hidden',
        }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          fontFamily: typography.monoFont,
          fontSize: '10px',
          letterSpacing: '0.12em',
          color: uploading ? colors.mutedForeground : colors.foreground,
          background: 'transparent',
          border: `1px dashed ${colors.border}`,
          padding: '20px 24px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          textTransform: 'uppercase',
          width: '100%',
          textAlign: 'center',
          transition: 'border-color 0.15s ease-in-out',
        }}
      >
        {uploading ? 'Uploading...' : preview ? 'Replace Image' : 'Upload Image'}
      </button>
    </div>
  )
}
