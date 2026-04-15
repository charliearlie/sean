import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import type { ChatMessage, ProductContext } from '@/shared/types/chatbot'
import { getChatbotConfig, getKnowledgeBase } from '@/lib/data/chatbot'
import { getOrdersByCustomer } from '@/lib/data/orders'

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

    // Check auth (optional)
    let userId: string | null = null
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
    } catch {
      // Not authenticated — that's fine
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

    systemPrompt += userId
      ? 'The user is logged in. You can look up their orders if they ask.\n'
      : 'The user is not logged in. If they ask about orders, tell them to log in at /login.\n'

    // OpenAI tools for authenticated users
    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = userId
      ? [{
          type: 'function' as const,
          function: {
            name: 'get_user_orders',
            description: 'Get the logged-in user\'s recent orders including status, items, and tracking',
            parameters: { type: 'object' as const, properties: {}, required: [] },
          },
        }]
      : []

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
      tools: tools.length > 0 ? tools : undefined,
      stream: true,
      max_tokens: 1024,
    })

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          let toolCallId = ''
          let toolCallName = ''
          let toolCallArgs = ''

          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta

            // Handle tool calls
            if (delta?.tool_calls?.[0]) {
              const tc = delta.tool_calls[0]
              if (tc.id) toolCallId = tc.id
              if (tc.function?.name) toolCallName = tc.function.name
              if (tc.function?.arguments) toolCallArgs += tc.function.arguments
              continue
            }

            // Stream text content
            if (delta?.content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta.content })}\n\n`))
            }

            // Check for finish
            if (chunk.choices[0]?.finish_reason === 'tool_calls' && toolCallName === 'get_user_orders' && userId) {
              // Execute tool call
              let toolResult = ''
              try {
                const orders = await getOrdersByCustomer(userId)
                if (!orders || orders.length === 0) {
                  toolResult = 'The user has no orders yet.'
                } else {
                  toolResult = orders.slice(0, 10).map((o: Record<string, unknown>) => {
                    const items = (o.order_items as Array<Record<string, unknown>> || [])
                      .map((i) => `${i.product_name} (${i.variant_label}) x${i.quantity}`)
                      .join(', ')
                    return `Order #${o.order_number}: Status: ${o.status}, Total: AED ${o.total}, Items: ${items}${o.tracking_number ? `, Tracking: ${o.tracking_number}` : ''}`
                  }).join('\n')
                }
              } catch {
                toolResult = 'Unable to fetch orders at this time.'
              }

              // Send tool result back to OpenAI
              const followUp = await openai.chat.completions.create({
                model,
                messages: [
                  ...openaiMessages,
                  {
                    role: 'assistant',
                    content: null,
                    tool_calls: [{
                      id: toolCallId,
                      type: 'function',
                      function: { name: toolCallName, arguments: toolCallArgs || '{}' },
                    }],
                  },
                  {
                    role: 'tool',
                    tool_call_id: toolCallId,
                    content: toolResult,
                  },
                ],
                stream: true,
                max_tokens: 1024,
              })

              for await (const followChunk of followUp) {
                const followDelta = followChunk.choices[0]?.delta
                if (followDelta?.content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: followDelta.content })}\n\n`))
                }
              }
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
