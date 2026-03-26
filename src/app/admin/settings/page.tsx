'use client'

import { useState, useEffect } from 'react'
import { cipherTokens } from '@/concepts/cipher/tokens'

const { colors, typography, adminTypography, adminColors, adminBorders } = cipherTokens

const inputStyle: React.CSSProperties = {
  fontFamily: adminTypography.bodyFont,
  fontSize: adminTypography.inputSize,
  color: colors.foreground,
  background: colors.muted,
  border: `1px solid ${colors.border}`,
  padding: '10px 12px',
  outline: 'none',
  boxSizing: 'border-box' as const,
  borderRadius: adminBorders.radius,
  width: '100%',
}

interface ShippingRate {
  id: string
  emirate: string
  rate: number
}

export default function SettingsPage() {
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [threshold, setThreshold] = useState<number>(500)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const [ratesRes, settingsRes] = await Promise.all([
        supabase.from('shipping_rates').select('*').eq('active', true).order('emirate'),
        supabase.from('site_settings').select('*').eq('key', 'free_shipping_threshold').single(),
      ])
      if (ratesRes.data) setRates(ratesRes.data)
      if (settingsRes.data) setThreshold(Number(settingsRes.data.value))
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      for (const rate of rates) {
        const { error } = await supabase
          .from('shipping_rates')
          .update({ rate: rate.rate, updated_at: new Date().toISOString() })
          .eq('id', rate.id)
        if (error) throw error
      }
      const { error } = await supabase
        .from('site_settings')
        .update({ value: threshold, updated_at: new Date().toISOString() })
        .eq('key', 'free_shipping_threshold')
      if (error) throw error
      setMessage({ type: 'success', text: 'Settings saved successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save: ' + (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const updateRate = (id: string, newRate: number) => {
    setRates((prev) => prev.map((r) => (r.id === id ? { ...r, rate: newRate } : r)))
  }

  if (loading) {
    return (
      <div style={{ padding: '40px 32px' }}>
        <p style={{ fontFamily: adminTypography.bodyFont, fontSize: adminTypography.dataSize, color: adminColors.mutedForeground, letterSpacing: '0.05em' }}>
          Loading settings...
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 32px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '16px' }}>
        <p style={{ fontFamily: adminTypography.bodyFont, fontSize: adminTypography.labelSize, letterSpacing: adminTypography.labelLetterSpacing, color: adminColors.mutedForeground, textTransform: 'uppercase', marginBottom: '6px' }}>
          Configuration
        </p>
        <h1 style={{ fontFamily: typography.monoFont, fontSize: adminTypography.headingSize, fontWeight: 700, color: colors.foreground, letterSpacing: '0.05em' }}>
          Settings
        </h1>
      </div>

      {message && (
        <div style={{
          fontFamily: adminTypography.bodyFont,
          fontSize: adminTypography.dataSize,
          color: message.type === 'success' ? colors.accent : '#FF4444',
          letterSpacing: '0.05em',
          padding: '12px 16px',
          border: `1px solid ${message.type === 'success' ? colors.accent : '#FF4444'}`,
          borderRadius: adminBorders.radius,
          background: message.type === 'success' ? 'rgba(0, 255, 178, 0.05)' : 'rgba(255, 68, 68, 0.05)',
          marginBottom: '24px',
        }}>
          {message.type === 'success' ? '// SUCCESS: ' : '// ERROR: '}{message.text}
        </div>
      )}

      {/* Shipping Rates */}
      <div style={{ border: `1px solid ${colors.border}`, marginBottom: '24px' }}>
        <div style={{
          padding: '10px 16px',
          background: colors.muted,
          borderBottom: `1px solid ${colors.border}`,
          fontFamily: adminTypography.bodyFont,
          fontSize: adminTypography.sectionHeaderSize,
          letterSpacing: adminTypography.labelLetterSpacing,
          color: adminColors.mutedForeground,
          textTransform: 'uppercase',
        }}>
          Shipping Rates (AED)
        </div>
        <div style={{ padding: '16px' }}>
          {rates.map((rate) => (
            <div
              key={rate.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <span style={{ fontFamily: adminTypography.bodyFont, fontSize: adminTypography.inputSize, color: colors.foreground, letterSpacing: '0.05em' }}>
                {rate.emirate}
              </span>
              <div style={{ width: '100px' }}>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={rate.rate}
                  onChange={(e) => updateRate(rate.id, Number(e.target.value))}
                  style={{ ...inputStyle, textAlign: 'right' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Free Shipping Threshold */}
      <div style={{ border: `1px solid ${colors.border}`, marginBottom: '32px' }}>
        <div style={{
          padding: '10px 16px',
          background: colors.muted,
          borderBottom: `1px solid ${colors.border}`,
          fontFamily: adminTypography.bodyFont,
          fontSize: adminTypography.sectionHeaderSize,
          letterSpacing: adminTypography.labelLetterSpacing,
          color: adminColors.mutedForeground,
          textTransform: 'uppercase',
        }}>
          Free Shipping Threshold
        </div>
        <div style={{ padding: '16px' }}>
          <p style={{ fontFamily: adminTypography.bodyFont, fontSize: adminTypography.labelSize, color: adminColors.mutedForeground, letterSpacing: '0.05em', marginBottom: '12px' }}>
            Orders above this amount (AED) qualify for free shipping
          </p>
          <div style={{ maxWidth: '200px' }}>
            <input
              type="number"
              min="0"
              step="10"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          fontFamily: adminTypography.bodyFont,
          fontSize: adminTypography.buttonSize,
          fontWeight: 700,
          letterSpacing: adminTypography.buttonLetterSpacing,
          padding: '12px 32px',
          background: saving ? colors.muted : colors.accent,
          color: saving ? adminColors.mutedForeground : colors.accentForeground,
          border: 'none',
          borderRadius: adminBorders.radius,
          cursor: saving ? 'not-allowed' : 'pointer',
          textTransform: 'uppercase',
        }}
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}
