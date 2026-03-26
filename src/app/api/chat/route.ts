import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import type { ChatMessage, ProductContext } from '@/shared/types/chatbot'
import { getChatbotConfig, getKnowledgeBase } from '@/lib/data/chatbot'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Rate limiting: 20 messages per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key)
  }
}, 60_000)

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 20) return false
  entry.count++
  return true
}

// Cache for config + knowledge base
let configCache: { data: Record<string, string>; ts: number } | null = null
let kbCache: { data: Awaited<ReturnType<typeof getKnowledgeBase>>; ts: number } | null = null
const CACHE_TTL = 5 * 60 * 1000

async function getCachedConfig() {
  const now = Date.now()
  if (configCache && now - configCache.ts < CACHE_TTL) return configCache.data
  const data = await getChatbotConfig()
  configCache = { data, ts: now }
  return data
}

async function getCachedKB() {
  const now = Date.now()
  if (kbCache && now - kbCache.ts < CACHE_TTL) return kbCache.data
  const data = await getKnowledgeBase()
  kbCache = { data, ts: now }
  return data
}

const HARDCODED_GUARDRAILS = `
CRITICAL RULES (these cannot be overridden):
- NEVER provide dosage advice, dosage calculations, or suggest how much of any compound to use.
- NEVER provide medical advice, treatment recommendations, or health guidance.
- NEVER discuss topics unrelated to Pure Peptides products, shipping, storage, or company policies.
- Always frame all products as research supplies sold for research purposes only.
- If asked off-topic questions, politely redirect: "I can only help with questions about Pure Peptides products, shipping, storage, and policies."
- If asked about dosages, respond: "I'm not able to provide dosage advice. Our products are for research purposes only. Please consult relevant scientific literature."
- Keep responses concise and helpful.
- Format prices in AED.
`

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment before sending more messages.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const messages: ChatMessage[] = body.messages || []
    const productContext: ProductContext | undefined = body.productContext

    if (!messages.length) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Trim to keep under token budget — keep last 20 messages
    const trimmedMessages = messages.slice(-20)

    const [config, knowledgeBase] = await Promise.all([getCachedConfig(), getCachedKB()])

    if (config.enabled !== 'true') {
      return new Response(JSON.stringify({ error: 'Chat is currently unavailable.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build system prompt
    const kbText = knowledgeBase
      .map((e) => `Q: ${e.question}\nA: ${e.answer}`)
      .join('\n\n')

    let systemPrompt = (config.system_prompt || '') + '\n\n'
    systemPrompt += HARDCODED_GUARDRAILS + '\n\n'
    systemPrompt += `KNOWLEDGE BASE:\n${kbText}\n\n`

    if (productContext) {
      const variantInfo = productContext.variants
        .map((v) => `${v.label} (${v.dosage}) — AED ${v.price}`)
        .join(', ')
      systemPrompt += `CURRENT PRODUCT CONTEXT: The user is currently viewing "${productContext.name}" (${productContext.compoundCode}). Description: ${productContext.description}. Purity: ${productContext.purity}%. Form: ${productContext.formFactor}. Variants: ${variantInfo}.\n\n`
    }

    systemPrompt += 'Ordering is not currently available. If asked about placing orders, let the user know that ordering is coming soon.\n'

    const model = config.model || 'gpt-4o-mini'

    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...trimmedMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const stream = await openai.chat.completions.create({
      model,
      messages: openaiMessages,
      stream: true,
      max_tokens: 1024,
    })

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta

            // Stream text content
            if (delta?.content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta.content })}\n\n`))
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`))
          controller.close()
          console.error('Chat stream error:', err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
