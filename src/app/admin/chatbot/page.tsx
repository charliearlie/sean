'use client'

import { useState, useEffect } from 'react'
import { cipherTokens } from '@/concepts/cipher/tokens'
import type { KnowledgeBaseEntry } from '@/shared/types/chatbot'

const { colors, typography, adminTypography, adminColors, adminBorders } = cipherTokens

const labelStyle: React.CSSProperties = {
  fontFamily: adminTypography.bodyFont,
  fontSize: adminTypography.labelSize,
  letterSpacing: adminTypography.labelLetterSpacing,
  color: adminColors.mutedForeground,
  textTransform: 'uppercase',
}

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

const sectionHeaderStyle: React.CSSProperties = {
  padding: '10px 16px',
  background: colors.muted,
  borderBottom: `1px solid ${colors.border}`,
  fontFamily: adminTypography.bodyFont,
  fontSize: adminTypography.sectionHeaderSize,
  letterSpacing: adminTypography.labelLetterSpacing,
  color: adminColors.mutedForeground,
  textTransform: 'uppercase',
}

export default function ChatbotPage() {
  const [enabled, setEnabled] = useState(true)
  const [model, setModel] = useState('gpt-4o-mini')
  const [greetingMessage, setGreetingMessage] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Add/edit form state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formQuestion, setFormQuestion] = useState('')
  const [formAnswer, setFormAnswer] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const [configRes, kbRes] = await Promise.all([
        supabase.from('chatbot_config').select('*'),
        supabase.from('chatbot_knowledge_base').select('*').order('sort_order'),
      ])

      if (configRes.data) {
        for (const row of configRes.data) {
          switch (row.key) {
            case 'enabled': setEnabled(row.value === 'true'); break
            case 'model': setModel(row.value); break
            case 'greeting_message': setGreetingMessage(row.value); break
            case 'system_prompt': setSystemPrompt(row.value); break
          }
        }
      }
      if (kbRes.data) setEntries(kbRes.data as KnowledgeBaseEntry[])
    } catch (err) {
      console.error('Failed to load chatbot config:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const updates = [
        { key: 'enabled', value: enabled ? 'true' : 'false' },
        { key: 'model', value: model },
        { key: 'greeting_message', value: greetingMessage },
        { key: 'system_prompt', value: systemPrompt },
      ]
      for (const u of updates) {
        const { error } = await supabase
          .from('chatbot_config')
          .update({ value: u.value, updated_at: new Date().toISOString() })
          .eq('key', u.key)
        if (error) throw error
      }
      setMessage({ type: 'success', text: 'Chatbot settings saved' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save: ' + (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEntry = async () => {
    if (!formQuestion.trim() || !formAnswer.trim()) return
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      if (editingId) {
        const { error } = await supabase
          .from('chatbot_knowledge_base')
          .update({
            question: formQuestion,
            answer: formAnswer,
            category: formCategory || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('chatbot_knowledge_base')
          .insert({
            question: formQuestion,
            answer: formAnswer,
            category: formCategory || null,
            sort_order: entries.length,
          })
        if (error) throw error
      }

      resetForm()
      await loadData()
      setMessage({ type: 'success', text: editingId ? 'Entry updated' : 'Entry added' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save entry: ' + (err as Error).message })
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.from('chatbot_knowledge_base').delete().eq('id', id)
      if (error) throw error
      setEntries((prev) => prev.filter((e) => e.id !== id))
      setMessage({ type: 'success', text: 'Entry deleted' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete: ' + (err as Error).message })
    }
  }

  const handleToggleActive = async (entry: KnowledgeBaseEntry) => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('chatbot_knowledge_base')
        .update({ active: !entry.active, updated_at: new Date().toISOString() })
        .eq('id', entry.id)
      if (error) throw error
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, active: !e.active } : e))
      )
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to toggle: ' + (err as Error).message })
    }
  }

  const startEdit = (entry: KnowledgeBaseEntry) => {
    setEditingId(entry.id)
    setFormQuestion(entry.question)
    setFormAnswer(entry.answer)
    setFormCategory(entry.category || '')
    setShowForm(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormQuestion('')
    setFormAnswer('')
    setFormCategory('')
    setShowForm(false)
  }

  if (loading) {
    return (
      <div style={{ padding: '40px 32px' }}>
        <p style={{ fontFamily: adminTypography.bodyFont, fontSize: adminTypography.dataSize, color: adminColors.mutedForeground, letterSpacing: '0.05em' }}>
          Loading chatbot settings...
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 32px', maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '16px' }}>
        <p style={{ ...labelStyle, marginBottom: '6px' }}>Configuration</p>
        <h1 style={{ fontFamily: typography.monoFont, fontSize: adminTypography.headingSize, fontWeight: 700, color: colors.foreground, letterSpacing: '0.05em' }}>
          Chatbot
        </h1>
      </div>

      {/* Status banner */}
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

      {/* Enable/Disable */}
      <div style={{ border: `1px solid ${colors.border}`, marginBottom: '24px' }}>
        <div style={sectionHeaderStyle}>Enable / Disable</div>
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setEnabled(!enabled)}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              border: 'none',
              background: enabled ? colors.accent : colors.muted,
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: enabled ? '#000' : '#666',
              position: 'absolute',
              top: '3px',
              left: enabled ? '22px' : '4px',
              transition: 'left 0.2s',
            }} />
          </button>
          <span style={{ fontFamily: adminTypography.bodyFont, fontSize: adminTypography.inputSize, color: colors.foreground, letterSpacing: '0.05em' }}>
            {enabled ? 'Chatbot is active' : 'Chatbot is disabled'}
          </span>
        </div>
      </div>

      {/* Model */}
      <div style={{ border: `1px solid ${colors.border}`, marginBottom: '24px' }}>
        <div style={sectionHeaderStyle}>Model</div>
        <div style={{ padding: '16px' }}>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ ...inputStyle, maxWidth: '300px', cursor: 'pointer' }}
          >
            <option value="gpt-4o-mini">gpt-4o-mini (faster, cheaper)</option>
            <option value="gpt-4o">gpt-4o (more capable)</option>
          </select>
        </div>
      </div>

      {/* Greeting Message */}
      <div style={{ border: `1px solid ${colors.border}`, marginBottom: '24px' }}>
        <div style={sectionHeaderStyle}>Greeting Message</div>
        <div style={{ padding: '16px' }}>
          <input
            type="text"
            value={greetingMessage}
            onChange={(e) => setGreetingMessage(e.target.value)}
            style={inputStyle}
            placeholder="Enter greeting message..."
          />
        </div>
      </div>

      {/* System Prompt */}
      <div style={{ border: `1px solid ${colors.border}`, marginBottom: '24px' }}>
        <div style={sectionHeaderStyle}>System Prompt</div>
        <div style={{ padding: '16px' }}>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={6}
            style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px', resize: 'vertical' }}
          />
          <p style={{ fontFamily: adminTypography.bodyFont, fontSize: '11px', color: adminColors.mutedForeground, marginTop: '8px', letterSpacing: '0.05em' }}>
            Safety guardrails (no dosage/medical advice, stay on-topic) are hardcoded and cannot be overridden.
          </p>
        </div>
      </div>

      {/* Save Config Button */}
      <button
        onClick={handleSaveConfig}
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
          marginBottom: '40px',
        }}
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>

      {/* Knowledge Base */}
      <div style={{ border: `1px solid ${colors.border}`, marginBottom: '24px' }}>
        <div style={{ ...sectionHeaderStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Knowledge Base</span>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            style={{
              fontFamily: adminTypography.bodyFont,
              fontSize: '11px',
              letterSpacing: '0.05em',
              padding: '4px 12px',
              background: colors.accent,
              color: colors.accentForeground,
              border: 'none',
              borderRadius: adminBorders.radius,
              cursor: 'pointer',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            + Add
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div style={{ padding: '16px', borderBottom: `1px solid ${colors.border}`, background: 'rgba(0,255,178,0.02)' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: '6px', fontSize: '11px' }}>Question</label>
              <textarea
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Enter FAQ question..."
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: '6px', fontSize: '11px' }}>Answer</label>
              <textarea
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Enter answer..."
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: '6px', fontSize: '11px' }}>Category</label>
              <input
                type="text"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                style={{ ...inputStyle, maxWidth: '250px' }}
                placeholder="e.g. Shipping, Storage, General"
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSaveEntry}
                disabled={!formQuestion.trim() || !formAnswer.trim()}
                style={{
                  fontFamily: adminTypography.bodyFont,
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  padding: '8px 20px',
                  background: colors.accent,
                  color: colors.accentForeground,
                  border: 'none',
                  borderRadius: adminBorders.radius,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {editingId ? 'Update' : 'Add Entry'}
              </button>
              <button
                onClick={resetForm}
                style={{
                  fontFamily: adminTypography.bodyFont,
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  padding: '8px 20px',
                  background: 'transparent',
                  color: adminColors.mutedForeground,
                  border: `1px solid ${colors.border}`,
                  borderRadius: adminBorders.radius,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Entries table */}
        <div>
          {entries.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: adminColors.mutedForeground, fontSize: '13px', fontFamily: adminTypography.bodyFont }}>
              No knowledge base entries yet.
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  opacity: entry.active ? 1 : 0.5,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: adminTypography.bodyFont,
                    fontSize: adminTypography.inputSize,
                    color: colors.foreground,
                    letterSpacing: '0.03em',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {entry.question}
                  </p>
                  {entry.category && (
                    <span style={{
                      display: 'inline-block',
                      marginTop: '4px',
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontFamily: adminTypography.bodyFont,
                      letterSpacing: '0.05em',
                      color: colors.accent,
                      border: `1px solid ${colors.accent}`,
                      borderRadius: '2px',
                      textTransform: 'uppercase',
                    }}>
                      {entry.category}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggleActive(entry)}
                    title={entry.active ? 'Disable' : 'Enable'}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${colors.border}`,
                      borderRadius: adminBorders.radius,
                      padding: '4px 8px',
                      fontSize: '11px',
                      color: entry.active ? colors.accent : adminColors.mutedForeground,
                      cursor: 'pointer',
                    }}
                  >
                    {entry.active ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => startEdit(entry)}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${colors.border}`,
                      borderRadius: adminBorders.radius,
                      padding: '4px 8px',
                      fontSize: '11px',
                      color: adminColors.mutedForeground,
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #FF4444',
                      borderRadius: adminBorders.radius,
                      padding: '4px 8px',
                      fontSize: '11px',
                      color: '#FF4444',
                      cursor: 'pointer',
                    }}
                  >
                    Del
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Share Links placeholder */}
      <div style={{ border: `1px solid ${colors.border}`, marginBottom: '24px' }}>
        <div style={sectionHeaderStyle}>Share Links</div>
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <span style={{ fontFamily: adminTypography.bodyFont, fontSize: '13px', color: adminColors.mutedForeground, letterSpacing: '0.05em' }}>
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  )
}
