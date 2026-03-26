'use client'

import { ChatProductProvider } from '@/shared/context/ChatProductContext'
import type { Product } from '@/shared/types/product'
import type { ProductContext } from '@/shared/types/chatbot'

export default function ProductChatProvider({
  product,
  children,
}: {
  product: Product
  children: React.ReactNode
}) {
  const context: ProductContext = {
    name: product.name,
    slug: product.slug,
    compoundCode: product.compoundCode,
    description: product.description,
    purity: product.purity,
    formFactor: product.formFactor,
    variants: product.variants.map((v) => ({
      label: v.label,
      dosage: v.dosage,
      price: v.price,
    })),
  }

  return (
    <ChatProductProvider product={context}>
      {children}
    </ChatProductProvider>
  )
}
