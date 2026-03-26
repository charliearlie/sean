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

// ── Mock Customers ───────────────────────────────────────────────────────────
const mockCustomerData = [
  { id: 'cust-001', full_name: 'Ahmed Al Maktoum',  email: 'ahmed.maktoum@gmail.com',   role: 'customer' as const, created_at: new Date(Date.now() - 45 * 86_400_000).toISOString() },
  { id: 'cust-002', full_name: 'Fatima Al Nahyan',  email: 'fatima.nahyan@outlook.com',  role: 'customer' as const, created_at: new Date(Date.now() - 30 * 86_400_000).toISOString() },
  { id: 'cust-003', full_name: 'Omar Khalid',       email: 'omar.khalid@proton.me',      role: 'customer' as const, created_at: new Date(Date.now() - 21 * 86_400_000).toISOString() },
  { id: 'cust-004', full_name: 'Sara Al Suwaidi',   email: 'sara.suwaidi@gmail.com',     role: 'customer' as const, created_at: new Date(Date.now() - 14 * 86_400_000).toISOString() },
  { id: 'cust-005', full_name: 'Rashid Bin Tariq',  email: 'rashid.tariq@icloud.com',    role: 'customer' as const, created_at: new Date(Date.now() - 7 * 86_400_000).toISOString() },
]

// ── Low Stock Alerts ─────────────────────────────────────────────────────────
const mockLowStockData = [
  { id: 'v-001c', product_id: 'pep-001', label: '30mg', dosage: '30mg', price: 890, sku: 'BPC-30MG', stock_quantity: 2, active: true, products: { name: 'BPC-157', slug: 'bpc-157', compound_code: 'BPC-157-5' } },
  { id: 'v-009b', product_id: 'pep-009', label: '10mg', dosage: '10mg', price: 495, sku: 'SEM-10MG', stock_quantity: 3, active: true, products: { name: 'Semax', slug: 'semax', compound_code: 'SEM-ACTH' } },
  { id: 'v-013b', product_id: 'pep-013', label: '10mg', dosage: '10mg', price: 695, sku: 'MOT-10MG', stock_quantity: 4, active: true, products: { name: 'MOTS-c', slug: 'mots-c', compound_code: 'MOTS-MT' } },
  { id: 'v-014c', product_id: 'pep-014', label: '20mg', dosage: '20mg', price: 950, sku: 'SS3-20MG', stock_quantity: 5, active: true, products: { name: 'SS-31 (Elamipretide)', slug: 'ss-31', compound_code: 'SS31-EL' } },
]

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
    return {
      lowStockAlerts: mockLowStockData,
      productCount: mockProductData.length,
      customerCount: mockCustomerData.length,
    }
  },
  getCustomers() {
    return mockCustomerData
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

