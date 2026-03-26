export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatbotConfig {
  id: string
  key: string
  value: string
  updated_at: string
}

export interface KnowledgeBaseEntry {
  id: string
  question: string
  answer: string
  category: string | null
  sort_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface ProductContext {
  name: string
  slug: string
  compoundCode: string
  description: string
  purity: number
  formFactor: string
  variants: { label: string; dosage: string; price: number }[]
}
