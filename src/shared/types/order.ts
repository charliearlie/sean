export interface Order {
  id: string
  order_number: string
  customer_id: string | null
  status: string
  subtotal: number
  shipping_cost: number
  total: number
  currency: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  shipping_address: string
  shipping_city: string
  shipping_emirate: string
  shipping_postal_code: string | null
  payment_intent_id: string | null
  payment_transaction_ref: string | null
  payment_method: string | null
  paid_at: string | null
  tracking_number: string | null
  tracking_url: string | null
  shipped_at: string | null
  delivered_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string
  product_name: string
  variant_label: string
  sku: string
  quantity: number
  unit_price: number
  total_price: number
}

export type OrderStatus =
  | 'pending'
  | 'payment_processing'
  | 'paid'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
