import type { ChatbotConfig, KnowledgeBaseEntry } from '@/shared/types/chatbot'

async function getClient() {
  const { createClient } = await import('@/lib/supabase/server')
  return createClient()
}

async function getBrowserClient() {
  const { createClient } = await import('@/lib/supabase/client')
  return createClient()
}

export async function getChatbotConfig(): Promise<Record<string, string>> {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from('chatbot_config')
    .select('*')
  if (error) throw error
  const config: Record<string, string> = {}
  for (const row of (data || []) as ChatbotConfig[]) {
    config[row.key] = row.value
  }
  return config
}

export async function getChatbotConfigClient(): Promise<Record<string, string>> {
  const supabase = await getBrowserClient()
  const { data, error } = await supabase
    .from('chatbot_config')
    .select('*')
  if (error) throw error
  const config: Record<string, string> = {}
  for (const row of (data || []) as ChatbotConfig[]) {
    config[row.key] = row.value
  }
  return config
}

export async function getKnowledgeBase(): Promise<KnowledgeBaseEntry[]> {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from('chatbot_knowledge_base')
    .select('*')
    .eq('active', true)
    .order('sort_order')
  if (error) throw error
  return (data || []) as KnowledgeBaseEntry[]
}

export async function updateChatbotConfig(key: string, value: string): Promise<void> {
  const supabase = await getBrowserClient()
  const { error } = await supabase
    .from('chatbot_config')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)
  if (error) throw error
}

export async function upsertKnowledgeEntry(
  entry: Partial<KnowledgeBaseEntry> & { question: string; answer: string }
): Promise<KnowledgeBaseEntry> {
  const supabase = await getBrowserClient()
  if (entry.id) {
    const { data, error } = await supabase
      .from('chatbot_knowledge_base')
      .update({
        question: entry.question,
        answer: entry.answer,
        category: entry.category || null,
        sort_order: entry.sort_order ?? 0,
        active: entry.active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entry.id)
      .select()
      .single()
    if (error) throw error
    return data as KnowledgeBaseEntry
  }
  const { data, error } = await supabase
    .from('chatbot_knowledge_base')
    .insert({
      question: entry.question,
      answer: entry.answer,
      category: entry.category || null,
      sort_order: entry.sort_order ?? 0,
      active: entry.active ?? true,
    })
    .select()
    .single()
  if (error) throw error
  return data as KnowledgeBaseEntry
}

export async function deleteKnowledgeEntry(id: string): Promise<void> {
  const supabase = await getBrowserClient()
  const { error } = await supabase
    .from('chatbot_knowledge_base')
    .delete()
    .eq('id', id)
  if (error) throw error
}
