'use client'

import { useState, useRef, useEffect, useCallback, Fragment } from 'react'
import type { ReactNode } from 'react'
import { useChatProduct } from '@/shared/context/ChatProductContext'
import type { ChatMessage, ProductContext } from '@/shared/types/chatbot'

const MAX_MESSAGES = 50

const SUGGESTED_QUESTIONS = [
  'What peptides do you offer?',
  'How should I store peptides?',
  'What payment methods do you accept?',
]

function renderMarkdownToReact(text: string): ReactNode {
  // Split on bold (**...**) and markdown links ([label](href)) to tokenise the text.
  // The outer capturing groups keep the delimiters in the resulting array so we
  // can reconstruct the full content without losing any characters.
  const TOKEN_RE = /(\*\*(.*?)\*\*|\[(.*?)\]\((.*?)\))/g

  const nodes: ReactNode[] = []
  let lastIndex = 0
  let keyCounter = 0

  const pushText = (raw: string) => {
    if (!raw) return
    // Convert newlines to <br/> elements inline
    const lines = raw.split('\n')
    lines.forEach((line, li) => {
      if (li > 0) nodes.push(<br key={`br-${keyCounter++}`} />)
      if (line) nodes.push(<Fragment key={`t-${keyCounter++}`}>{line}</Fragment>)
    })
  }

  let match: RegExpExecArray | null
  while ((match = TOKEN_RE.exec(text)) !== null) {
    // Push any plain text before this token
    pushText(text.slice(lastIndex, match.index))
    lastIndex = TOKEN_RE.lastIndex

    const full = match[1]

    if (full.startsWith('**')) {
      // Bold: **content**
      const content = match[2]
      nodes.push(<strong key={`s-${keyCounter++}`}>{content}</strong>)
    } else {
      // Link: [label](href)
      const label = match[3]
      const href = match[4]
      const isSafe = href.startsWith('https://') || href.startsWith('/')
      if (isSafe) {
        nodes.push(
          <a
            key={`a-${keyCounter++}`}
            href={href}
            style={{ color: 'var(--accent,#00FFB2)', textDecoration: 'underline' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>
        )
      } else {
        // Unsafe href — render as plain text to block javascript: URIs
        nodes.push(<Fragment key={`t-${keyCounter++}`}>{label}</Fragment>)
      }
    }
  }

  // Remaining plain text after the last token
  pushText(text.slice(lastIndex))

  return <>{nodes}</>
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`)
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}

export default function AiChatWidget() {
  const productContext = useChatProduct()
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Fetch config on first open
  useEffect(() => {
    if (!isOpen || configLoaded) return
    fetch('/api/chat/config')
      .then((r) => r.json())
      .then((data) => {
        setEnabled(data.enabled)
        if (productContext) {
          setGreeting(`Have a question about **${productContext.name}**, or something more general?`)
        } else {
          setGreeting(data.greeting_message || 'How can I help you?')
        }
        setConfigLoaded(true)
      })
      .catch(() => {
        setGreeting('How can I help you?')
        setConfigLoaded(true)
      })
  }, [isOpen, configLoaded, productContext])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on open
  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return

    setError(null)
    const userMessage: ChatMessage = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)

    const assistantMessage: ChatMessage = { role: 'assistant', content: '' }
    setMessages([...newMessages, assistantMessage])

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const body: { messages: ChatMessage[]; productContext?: ProductContext } = {
        messages: newMessages,
      }
      if (productContext) body.productContext = productContext

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(err.error || `Error ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              accumulated += parsed.content
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: accumulated }
                return updated
              })
            }
            if (parsed.error) {
              throw new Error(parsed.error)
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue
            throw e
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setError((err as Error).message)
      // Remove empty assistant message on error
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === 'assistant' && !prev[prev.length - 1].content) {
          return prev.slice(0, -1)
        }
        return prev
      })
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [messages, isStreaming, productContext])

  const handleNewConversation = () => {
    setMessages([])
    setError(null)
  }

  const atLimit = messages.length >= MAX_MESSAGES

  return (
    <>
      {/* Floating button */}
      {!(isMobile && isOpen) && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AI research assistant"
          style={{
            position: 'fixed',
            bottom: '92px',
            right: '24px',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--accent, #00FFB2)',
            color: 'var(--accent-foreground, #000)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            fontSize: '20px',
            fontWeight: 700,
            transition: 'transform 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {isOpen ? '×' : 'AI'}
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          style={isMobile ? {
            position: 'fixed',
            inset: 0,
            background: 'var(--card, #111)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'chatDrawerSlideUp 0.3s ease-out',
          } : {
            position: 'fixed',
            bottom: '152px',
            right: '24px',
            width: '360px',
            maxWidth: 'calc(100vw - 48px)',
            height: '500px',
            maxHeight: 'calc(100vh - 200px)',
            background: 'var(--card, #111)',
            border: '1px solid var(--border, #333)',
            borderRadius: '8px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--border, #333)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            {isMobile && (
              <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '8px' }}>
                <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'var(--muted-foreground, #888)' }} />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground, #fff)' }}>
                Research Assistant
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {isMobile && (
                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Minimise chat"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--muted-foreground, #888)',
                      cursor: 'pointer',
                      fontSize: '18px',
                      lineHeight: 1,
                      padding: '0 4px',
                    }}
                  >
                    ▾
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--muted-foreground, #888)',
                    cursor: 'pointer',
                    fontSize: '18px',
                    lineHeight: 1,
                    padding: '0 4px',
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Greeting */}
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    background: 'var(--muted, #1a1a1a)',
                    borderRadius: '8px 8px 8px 2px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    color: 'var(--foreground, #fff)',
                    maxWidth: '85%',
                  }}
                >
                  {renderMarkdownToReact(greeting || 'How can I help you?')}
                </div>

                {/* Suggested questions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border, #333)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: 'var(--accent, #00FFB2)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
                    background: msg.role === 'user' ? 'var(--accent, #00FFB2)' : 'var(--muted, #1a1a1a)',
                    color: msg.role === 'user' ? 'var(--accent-foreground, #000)' : 'var(--foreground, #fff)',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.role === 'assistant' ? (
                    <span>{renderMarkdownToReact(msg.content || '')}</span>
                  ) : (
                    msg.content
                  )}
                  {/* Streaming cursor */}
                  {msg.role === 'assistant' && i === messages.length - 1 && isStreaming && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '6px',
                        height: '14px',
                        background: 'var(--accent, #00FFB2)',
                        marginLeft: '2px',
                        verticalAlign: 'text-bottom',
                        animation: 'blink 1s step-end infinite',
                      }}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#FF4444' }}>{error}</span>
                <button
                  onClick={() => {
                    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
                    if (lastUser) sendMessage(lastUser.content)
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid #FF4444',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    color: '#FF4444',
                    cursor: 'pointer',
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Conversation limit */}
            {atLimit && (
              <div style={{ textAlign: 'center', padding: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted-foreground, #888)' }}>
                  Conversation limit reached.{' '}
                </span>
                <button
                  onClick={handleNewConversation}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent, #00FFB2)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textDecoration: 'underline',
                  }}
                >
                  Start new conversation
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div
            style={{
              padding: '12px',
              paddingBottom: isMobile ? 'calc(12px + env(safe-area-inset-bottom))' : '12px',
              borderTop: '1px solid var(--border, #333)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder={!enabled ? 'Chat is offline' : atLimit ? 'Start a new conversation' : 'Ask about our products...'}
              disabled={!enabled || isStreaming || atLimit}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(input)
                }
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid var(--border, #333)',
                borderRadius: '6px',
                background: 'transparent',
                color: 'var(--foreground, #fff)',
                fontSize: isMobile ? '16px' : '13px',
                outline: 'none',
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!enabled || isStreaming || !input.trim() || atLimit}
              style={{
                padding: '8px 14px',
                background: !input.trim() || isStreaming ? 'var(--muted, #1a1a1a)' : 'var(--accent, #00FFB2)',
                color: !input.trim() || isStreaming ? 'var(--muted-foreground, #888)' : 'var(--accent-foreground, #000)',
                border: 'none',
                borderRadius: '6px',
                cursor: !input.trim() || isStreaming ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
        @keyframes chatDrawerSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
