import { NextResponse } from 'next/server'
import { getChatbotConfig } from '@/lib/data/chatbot'

let cachedConfig: { data: Record<string, string>; ts: number } | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function GET() {
  try {
    const now = Date.now()
    if (cachedConfig && now - cachedConfig.ts < CACHE_TTL) {
      return NextResponse.json({
        enabled: cachedConfig.data.enabled === 'true',
        greeting_message: cachedConfig.data.greeting_message || '',
      })
    }

    const config = await getChatbotConfig()
    cachedConfig = { data: config, ts: now }

    return NextResponse.json({
      enabled: config.enabled === 'true',
      greeting_message: config.greeting_message || '',
    })
  } catch {
    return NextResponse.json({ enabled: false, greeting_message: '' }, { status: 500 })
  }
}
