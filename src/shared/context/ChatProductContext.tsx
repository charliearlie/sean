'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { ProductContext } from '@/shared/types/chatbot'

const ChatProductCtx = createContext<ProductContext | null>(null)

export function ChatProductProvider({
  product,
  children,
}: {
  product: ProductContext | null
  children: ReactNode
}) {
  return (
    <ChatProductCtx.Provider value={product}>
      {children}
    </ChatProductCtx.Provider>
  )
}

export function useChatProduct(): ProductContext | null {
  return useContext(ChatProductCtx)
}
