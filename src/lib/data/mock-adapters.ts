import { products as mockProductData } from '@/shared/data/products'
import { categories as mockCategoryData } from '@/shared/data/categories'

// Transform mock Product → Supabase shape (snake_case, product_variants[], categories: {})
function toSupabaseProduct(p: typeof mockProductData[number]) {
  const category = mockCategoryData.find((c) => c.slug === p.category)
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    compound_code: p.compoundCode,
    description: p.description,
    long_description: p.longDescription,
    purity: p.purity,
    molecular_weight: p.molecularWeight,
    form_factor: p.formFactor,
    sequence: p.sequence,
    coa_batch_number: p.coaBatchNumber,
    featured: p.featured,
    active: true,
    image_url: null,
    category_id: category?.id || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: category ? { id: category.id, slug: category.slug, name: category.name } : null,
    product_variants: p.variants.map((v) => ({
      id: v.id,
      product_id: p.id,
      label: v.label,
      dosage: v.dosage,
      price: v.price,
      sku: v.sku,
      stock_quantity: v.inStock ? 50 : 0,
      active: true,
    })),
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const DAY = 86_400_000
const HOUR = 3_600_000

function daysAgo(n: number) {
  return new Date(Date.now() - n * DAY).toISOString()
}
function hoursAgo(n: number) {
  return new Date(Date.now() - n * HOUR).toISOString()
}

// ── Mock Customers ───────────────────────────────────────────────────────────
const mockCustomerData = [
  { id: 'cust-001', full_name: 'Ahmed Al Maktoum',  email: 'ahmed.maktoum@gmail.com',   role: 'customer' as const, created_at: daysAgo(45) },
  { id: 'cust-002', full_name: 'Fatima Al Nahyan',  email: 'fatima.nahyan@outlook.com',  role: 'customer' as const, created_at: daysAgo(30) },
  { id: 'cust-003', full_name: 'Omar Khalid',       email: 'omar.khalid@proton.me',      role: 'customer' as const, created_at: daysAgo(21) },
  { id: 'cust-004', full_name: 'Sara Al Suwaidi',   email: 'sara.suwaidi@gmail.com',     role: 'customer' as const, created_at: daysAgo(14) },
  { id: 'cust-005', full_name: 'Rashid Bin Tariq',  email: 'rashid.tariq@icloud.com',    role: 'customer' as const, created_at: daysAgo(7) },
]

// ── Mock Orders ──────────────────────────────────────────────────────────────
const mockOrderData = [
  {
    id: 'ord-001',
    order_number: 'ORD-10421',
    customer_id: 'cust-001',
    status: 'delivered',
    subtotal: 715,
    shipping_cost: 25,
    total: 740,
    currency: 'AED',
    contact_name: 'Ahmed Al Maktoum',
    contact_email: 'ahmed.maktoum@gmail.com',
    contact_phone: '+971501234567',
    shipping_address: '12 Al Wasl Road, Apartment 4B',
    shipping_city: 'Dubai',
    shipping_emirate: 'Dubai',
    payment_intent_id: 'TELR-9281',
    payment_transaction_ref: 'TXN-AE-9281',
    payment_method: 'credit_card',
    paid_at: daysAgo(18),
    shipped_at: daysAgo(16),
    delivered_at: daysAgo(14),
    tracking_number: 'AE928100014',
    tracking_url: 'https://track.example.com/AE928100014',
    notes: null,
    created_at: daysAgo(18),
    updated_at: daysAgo(14),
    order_items: [
      { product_name: 'BPC-157', variant_label: '5mg', sku: 'BPC-5MG', quantity: 2, unit_price: 195, total_price: 390 },
      { product_name: 'CJC-1295 (No DAC)', variant_label: '2mg', sku: 'CJC-2MG', quantity: 2, unit_price: 165, total_price: 330 },
    ],
    // Needed by OrdersTable join
    profiles: { full_name: 'Ahmed Al Maktoum', email: 'ahmed.maktoum@gmail.com' },
  },
  {
    id: 'ord-002',
    order_number: 'ORD-10435',
    customer_id: 'cust-002',
    status: 'delivered',
    subtotal: 620,
    shipping_cost: 25,
    total: 645,
    currency: 'AED',
    contact_name: 'Fatima Al Nahyan',
    contact_email: 'fatima.nahyan@outlook.com',
    contact_phone: '+971559876543',
    shipping_address: '8 Corniche Road, Villa 22',
    shipping_city: 'Abu Dhabi',
    shipping_emirate: 'Abu Dhabi',
    payment_intent_id: 'TELR-9315',
    payment_transaction_ref: 'TXN-AE-9315',
    payment_method: 'credit_card',
    paid_at: daysAgo(12),
    shipped_at: daysAgo(10),
    delivered_at: daysAgo(8),
    tracking_number: 'AE931500022',
    tracking_url: 'https://track.example.com/AE931500022',
    notes: 'Leave with reception',
    created_at: daysAgo(12),
    updated_at: daysAgo(8),
    order_items: [
      { product_name: 'TB-500', variant_label: '10mg', sku: 'TB5-10MG', quantity: 1, unit_price: 620, total_price: 620 },
    ],
    profiles: { full_name: 'Fatima Al Nahyan', email: 'fatima.nahyan@outlook.com' },
  },
  {
    id: 'ord-003',
    order_number: 'ORD-10448',
    customer_id: 'cust-003',
    status: 'shipped',
    subtotal: 1075,
    shipping_cost: 25,
    total: 1100,
    currency: 'AED',
    contact_name: 'Omar Khalid',
    contact_email: 'omar.khalid@proton.me',
    contact_phone: '+971504567890',
    shipping_address: '34 Sheikh Zayed Road, Office Tower 3',
    shipping_city: 'Dubai',
    shipping_emirate: 'Dubai',
    payment_intent_id: 'TELR-9402',
    payment_transaction_ref: 'TXN-AE-9402',
    payment_method: 'credit_card',
    paid_at: daysAgo(5),
    shipped_at: daysAgo(3),
    delivered_at: null,
    tracking_number: 'AE940200034',
    tracking_url: 'https://track.example.com/AE940200034',
    notes: null,
    created_at: daysAgo(5),
    updated_at: daysAgo(3),
    order_items: [
      { product_name: 'GHK-Cu', variant_label: '200mg', sku: 'GHK-200MG', quantity: 1, unit_price: 680, total_price: 680 },
      { product_name: 'MOTS-c', variant_label: '5mg', sku: 'MOT-5MG', quantity: 1, unit_price: 395, total_price: 395 },
    ],
    profiles: { full_name: 'Omar Khalid', email: 'omar.khalid@proton.me' },
  },
  {
    id: 'ord-004',
    order_number: 'ORD-10456',
    customer_id: 'cust-004',
    status: 'shipped',
    subtotal: 855,
    shipping_cost: 25,
    total: 880,
    currency: 'AED',
    contact_name: 'Sara Al Suwaidi',
    contact_email: 'sara.suwaidi@gmail.com',
    contact_phone: '+971567890123',
    shipping_address: '5 Al Majaz Waterfront, Apt 17',
    shipping_city: 'Sharjah',
    shipping_emirate: 'Sharjah',
    payment_intent_id: 'TELR-9445',
    payment_transaction_ref: 'TXN-AE-9445',
    payment_method: 'apple_pay',
    paid_at: daysAgo(3),
    shipped_at: daysAgo(1),
    delivered_at: null,
    tracking_number: 'AE944500005',
    tracking_url: 'https://track.example.com/AE944500005',
    notes: null,
    created_at: daysAgo(3),
    updated_at: daysAgo(1),
    order_items: [
      { product_name: 'SS-31 (Elamipretide)', variant_label: '10mg', sku: 'SS3-10MG', quantity: 1, unit_price: 815, total_price: 815 },
    ],
    profiles: { full_name: 'Sara Al Suwaidi', email: 'sara.suwaidi@gmail.com' },
  },
  {
    id: 'ord-005',
    order_number: 'ORD-10462',
    customer_id: 'cust-005',
    status: 'preparing',
    subtotal: 530,
    shipping_cost: 25,
    total: 555,
    currency: 'AED',
    contact_name: 'Rashid Bin Tariq',
    contact_email: 'rashid.tariq@icloud.com',
    contact_phone: '+971521234567',
    shipping_address: '19 Yas Island Drive',
    shipping_city: 'Abu Dhabi',
    shipping_emirate: 'Abu Dhabi',
    payment_intent_id: 'TELR-9478',
    payment_transaction_ref: 'TXN-AE-9478',
    payment_method: 'credit_card',
    paid_at: daysAgo(1),
    shipped_at: null,
    delivered_at: null,
    tracking_number: null,
    tracking_url: null,
    notes: 'Gift wrapping requested',
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    order_items: [
      { product_name: 'Selank', variant_label: '5mg', sku: 'SEL-5MG', quantity: 1, unit_price: 265, total_price: 265 },
      { product_name: 'Selank', variant_label: '10mg', sku: 'SEL-10MG', quantity: 1, unit_price: 460, total_price: 460 },
    ],
    profiles: { full_name: 'Rashid Bin Tariq', email: 'rashid.tariq@icloud.com' },
  },
  {
    id: 'ord-006',
    order_number: 'ORD-10470',
    customer_id: 'cust-001',
    status: 'paid',
    subtotal: 1160,
    shipping_cost: 25,
    total: 1185,
    currency: 'AED',
    contact_name: 'Ahmed Al Maktoum',
    contact_email: 'ahmed.maktoum@gmail.com',
    contact_phone: '+971501234567',
    shipping_address: '12 Al Wasl Road, Apartment 4B',
    shipping_city: 'Dubai',
    shipping_emirate: 'Dubai',
    payment_intent_id: 'TELR-9501',
    payment_transaction_ref: 'TXN-AE-9501',
    payment_method: 'credit_card',
    paid_at: hoursAgo(8),
    shipped_at: null,
    delivered_at: null,
    tracking_number: null,
    tracking_url: null,
    notes: null,
    created_at: hoursAgo(8),
    updated_at: hoursAgo(8),
    order_items: [
      { product_name: 'Epithalon (Epitalon)', variant_label: '50mg', sku: 'EPI-50MG', quantity: 1, unit_price: 790, total_price: 790 },
      { product_name: 'Epithalon (Epitalon)', variant_label: '10mg', sku: 'EPI-10MG', quantity: 1, unit_price: 210, total_price: 210 },
      { product_name: 'Ipamorelin', variant_label: '2mg', sku: 'IPA-2MG', quantity: 1, unit_price: 150, total_price: 150 },
    ],
    profiles: { full_name: 'Ahmed Al Maktoum', email: 'ahmed.maktoum@gmail.com' },
  },
  {
    id: 'ord-007',
    order_number: 'ORD-10475',
    customer_id: 'cust-003',
    status: 'pending',
    subtotal: 345,
    shipping_cost: 25,
    total: 370,
    currency: 'AED',
    contact_name: 'Omar Khalid',
    contact_email: 'omar.khalid@proton.me',
    contact_phone: '+971504567890',
    shipping_address: '34 Sheikh Zayed Road, Office Tower 3',
    shipping_city: 'Dubai',
    shipping_emirate: 'Dubai',
    payment_intent_id: null,
    payment_transaction_ref: null,
    payment_method: null,
    paid_at: null,
    shipped_at: null,
    delivered_at: null,
    tracking_number: null,
    tracking_url: null,
    notes: null,
    created_at: hoursAgo(3),
    updated_at: hoursAgo(3),
    order_items: [
      { product_name: 'BPC-157', variant_label: '10mg', sku: 'BPC-10MG', quantity: 1, unit_price: 345, total_price: 345 },
    ],
    profiles: { full_name: 'Omar Khalid', email: 'omar.khalid@proton.me' },
  },
  {
    id: 'ord-008',
    order_number: 'ORD-10479',
    customer_id: 'cust-002',
    status: 'paid',
    subtotal: 730,
    shipping_cost: 25,
    total: 755,
    currency: 'AED',
    contact_name: 'Fatima Al Nahyan',
    contact_email: 'fatima.nahyan@outlook.com',
    contact_phone: '+971559876543',
    shipping_address: '8 Corniche Road, Villa 22',
    shipping_city: 'Abu Dhabi',
    shipping_emirate: 'Abu Dhabi',
    payment_intent_id: 'TELR-9534',
    payment_transaction_ref: 'TXN-AE-9534',
    payment_method: 'credit_card',
    paid_at: hoursAgo(2),
    shipped_at: null,
    delivered_at: null,
    tracking_number: null,
    tracking_url: null,
    notes: 'Repeat customer — expedite if possible',
    created_at: hoursAgo(2),
    updated_at: hoursAgo(2),
    order_items: [
      { product_name: 'Sermorelin', variant_label: '5mg', sku: 'SER-5MG', quantity: 1, unit_price: 340, total_price: 340 },
      { product_name: 'AOD-9604', variant_label: '5mg', sku: 'AOD-5MG', quantity: 1, unit_price: 365, total_price: 365 },
    ],
    profiles: { full_name: 'Fatima Al Nahyan', email: 'fatima.nahyan@outlook.com' },
  },
]

// ── Low Stock Alerts ─────────────────────────────────────────────────────────
const mockLowStockData = [
  { id: 'v-001c', product_id: 'pep-001', label: '30mg', dosage: '30mg', price: 890, sku: 'BPC-30MG', stock_quantity: 2, active: true, products: { name: 'BPC-157', slug: 'bpc-157', compound_code: 'BPC-157-5' } },
  { id: 'v-009b', product_id: 'pep-009', label: '10mg', dosage: '10mg', price: 495, sku: 'SEM-10MG', stock_quantity: 3, active: true, products: { name: 'Semax', slug: 'semax', compound_code: 'SEM-ACTH' } },
  { id: 'v-013b', product_id: 'pep-013', label: '10mg', dosage: '10mg', price: 695, sku: 'MOT-10MG', stock_quantity: 4, active: true, products: { name: 'MOTS-c', slug: 'mots-c', compound_code: 'MOTS-MT' } },
  { id: 'v-014c', product_id: 'pep-014', label: '20mg', dosage: '20mg', price: 950, sku: 'SS3-20MG', stock_quantity: 5, active: true, products: { name: 'SS-31 (Elamipretide)', slug: 'ss-31', compound_code: 'SS31-EL' } },
]

// ── Revenue / count helpers ──────────────────────────────────────────────────
function ordersInWindow(ms: number) {
  const cutoff = Date.now() - ms
  return mockOrderData.filter((o) => new Date(o.created_at).getTime() >= cutoff)
}

function sumTotals(orders: typeof mockOrderData) {
  return orders.reduce((s, o) => s + o.total, 0)
}

// Products
export const mockProducts = {
  getProducts() {
    return mockProductData.map(toSupabaseProduct)
  },
  getProductBySlug(slug: string) {
    const p = mockProductData.find((p) => p.slug === slug)
    return p ? toSupabaseProduct(p) : null
  },
  getFeaturedProducts() {
    return mockProductData.filter((p) => p.featured).map(toSupabaseProduct)
  },
  getProductsByCategory(categorySlug: string) {
    return mockProductData.filter((p) => p.category === categorySlug).map(toSupabaseProduct)
  },
}

// Categories
export const mockCategories = {
  getCategories() {
    return mockCategoryData.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      product_count: c.productCount,
      sort_order: 0,
    }))
  },
}

// Dashboard / Admin
export const mockDashboard = {
  getDashboardStats() {
    const todayOrders = ordersInWindow(DAY)
    const weekOrders = ordersInWindow(7 * DAY)
    const monthOrders = ordersInWindow(30 * DAY)

    return {
      revenue: {
        today: sumTotals(todayOrders),
        week: sumTotals(weekOrders),
        month: sumTotals(monthOrders),
      },
      orderCounts: {
        today: todayOrders.length,
        week: weekOrders.length,
        month: monthOrders.length,
      },
      recentOrders: [...mockOrderData].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
      lowStockAlerts: mockLowStockData,
    }
  },
  getCustomers() {
    return mockCustomerData
  },
  getAllOrders() {
    return [...mockOrderData].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  },
}

// Stock
export const mockStock = {
  getStockLevels() {
    return mockProductData.flatMap((p) =>
      p.variants.map((v) => ({
        id: v.id,
        product_id: p.id,
        label: v.label,
        dosage: v.dosage,
        price: v.price,
        sku: v.sku,
        stock_quantity: v.inStock ? 50 : 0,
        active: true,
        products: { name: p.name, slug: p.slug, compound_code: p.compoundCode },
      }))
    )
  },
  getLowStockAlerts() {
    return mockLowStockData
  },
  getStockMovements() {
    return []
  },
}

// Orders
export const mockOrders = {
  getOrdersByCustomer(customerId: string) {
    return mockOrderData.filter((o) => o.customer_id === customerId)
  },
  getOrderById(id: string) {
    return mockOrderData.find((o) => o.id === id) ?? null
  },
}
