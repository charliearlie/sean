# Pure Peptides — Project Context

## What This Is

An e-commerce storefront for **Pure Peptides**, a UAE-based research peptide supplier. The site sells lyophilized research compounds (BPC-157, TB-500, GHK-Cu, etc.) priced in AED. It is positioned as a premium, lab-grade supplier with HPLC verification and Certificate of Analysis documentation.

Contact method is WhatsApp (floating button, bottom-right). The WhatsApp number is currently a placeholder: `971501234567`.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5 (App Router, Turbopack) |
| React | 19.1 |
| Language | TypeScript 5, strict mode |
| Styling | Inline styles via a design token object (`cipherTokens`), no Tailwind classes used in components (Tailwind is installed but only used for `globals.css` base resets) |
| Animations | Framer Motion 12 (`framer-motion`) |
| Database | Supabase (PostgreSQL) — optional, app runs fully in demo mode without it |
| Auth | Supabase Auth with `@supabase/ssr` |
| Payments | Telr (UAE payment gateway) |
| Fonts | Geist Sans + Geist Mono (via `next/font/google`) |
| Package manager | npm |

### Key Commands

```bash
npm run dev      # Dev server with Turbopack
npm run build    # Production build (also uses Turbopack)
npm run lint     # ESLint
```

## Demo Mode

The entire app works without Supabase. The flag `supabaseConfigured` (in `src/lib/supabase/config.ts`) checks for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars. When false:

- All data layer functions (`src/lib/data/*.ts`) fall through to mock adapters (`src/lib/data/mock-adapters.ts`)
- The Admin nav link appears (no auth gating)
- A yellow "Demo Mode" banner shows in the admin layout
- Order creation, stock adjustments, and product mutations throw errors (read-only)
- Middleware skips auth checks entirely

## Environment Variables

Defined in `.env.local` (not committed):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `TELR_STORE_ID` | Telr payment gateway store ID |
| `TELR_AUTH_KEY` | Telr payment gateway auth key |
| `TELR_TEST_MODE` | `1` for test mode (default), `0` for live |

## Architecture

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (store)/                  # Storefront route group
│   │   ├── page.tsx              # Homepage (Hero + Categories + Featured + Credibility)
│   │   ├── shop/                 # Product catalogue with category tabs & sort
│   │   ├── product/[slug]/       # Product detail page
│   │   ├── cart/                 # Cart view
│   │   ├── checkout/             # Checkout form
│   │   ├── payment/success/      # Post-payment success
│   │   ├── payment/failed/       # Post-payment failure
│   │   ├── login/                # Auth login
│   │   ├── register/             # Auth registration
│   │   └── account/              # Customer account
│   │       ├── profile/
│   │       └── orders/[id]/
│   ├── admin/                    # Admin panel (sidebar layout)
│   │   ├── page.tsx              # Dashboard (stats, recent orders, low stock)
│   │   ├── products/             # Product CRUD + [id] edit
│   │   │   └── new/
│   │   ├── orders/               # Order management + [id] detail
│   │   ├── customers/            # Customer list
│   │   └── stock/                # Stock levels + restock
│   ├── api/payment/              # Payment API routes
│   │   ├── create/               # Create Telr payment session
│   │   ├── verify/               # Verify payment after redirect
│   │   └── webhook/              # Telr webhook handler
│   ├── layout.tsx                # Root layout (CartProvider wraps everything)
│   └── globals.css
│
├── concepts/cipher/              # "Cipher" design concept (the current theme)
│   ├── tokens.ts                 # Design tokens: colors, typography, spacing, motion, borders
│   └── components/               # All UI components
│       ├── Nav.tsx               # Fixed header nav
│       ├── Hero.tsx              # Homepage hero
│       ├── Footer.tsx            # Site footer
│       ├── ProductCard.tsx       # Product card (used in grids)
│       ├── ProductGrid.tsx       # Animated product grid
│       ├── ProductView.tsx       # Product detail view
│       ├── CategoryNav.tsx       # Category tab bar (shop page)
│       ├── CartView.tsx          # Cart page content
│       ├── CheckoutView.tsx      # Checkout form
│       ├── AuthForm.tsx          # Login/register form
│       ├── AccountNav.tsx        # Account sidebar nav
│       ├── OrderHistory.tsx      # Customer order list
│       ├── OrderDetail.tsx       # Order detail view
│       ├── OrderConfirmation.tsx # Post-purchase confirmation
│       ├── MotionWrapper.tsx     # Reusable fade-in-up wrapper
│       └── admin/                # Admin-specific components
│           ├── AdminNav.tsx      # Admin sidebar navigation
│           ├── DataTable.tsx     # Generic data table
│           ├── StatsCard.tsx     # Dashboard stat cards
│           ├── StatusBadge.tsx   # Order status badges
│           ├── ProductForm.tsx   # Product create/edit form
│           ├── VariantManager.tsx # Manage product variants
│           ├── ImageUpload.tsx   # Image upload component
│           ├── StockTable.tsx    # Stock inventory table
│           └── OrderStatusUpdater.tsx
│
├── lib/
│   ├── data/                     # Data access layer (Supabase or mock)
│   │   ├── products.ts           # getProducts, getProductBySlug, getProductsByCategory, getFeaturedProducts
│   │   ├── categories.ts         # getCategories
│   │   ├── orders.ts             # getOrdersByCustomer, getOrderById, createOrder, updateOrderStatus
│   │   ├── admin.ts              # getDashboardStats, getCustomers, createProduct, updateProduct, getAllOrders
│   │   ├── stock.ts              # getStockLevels, getLowStockAlerts, adjustStock, getStockMovements
│   │   └── mock-adapters.ts      # Mock implementations for all of the above (demo mode)
│   ├── supabase/
│   │   ├── config.ts             # supabaseConfigured flag
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   ├── admin.ts              # Service-role Supabase client
│   │   └── middleware.ts         # Session refresh middleware
│   ├── motion.ts                 # Framer Motion variant factories (fadeInUp, fadeIn, staggerContainer, etc.)
│   └── telr.ts                   # Telr payment gateway API (create + check)
│
├── shared/
│   ├── types/
│   │   ├── product.ts            # Product, ProductVariant, Category interfaces
│   │   ├── order.ts              # Order, OrderItem, OrderStatus types
│   │   └── cart.ts               # CartItem, CartState, CartAction types
│   ├── data/
│   │   ├── products.ts           # Hardcoded mock product array (14 peptides)
│   │   └── categories.ts         # Hardcoded mock category array (4 categories)
│   ├── context/
│   │   └── CartContext.tsx        # Cart state via useReducer + Context (client-side only)
│   ├── components/
│   │   ├── AgeVerificationBanner.tsx  # Sticky 21+ confirmation banner
│   │   ├── ResearchDisclaimer.tsx     # "For research purposes only" disclaimer
│   │   ├── WhatsAppButton.tsx         # Floating WhatsApp contact button
│   │   └── AiChatWidget.tsx           # AI chat widget (placeholder?)
│   └── utils/
│       ├── currency.ts           # formatAED() — Intl.NumberFormat for AED
│       └── images.ts             # getPicsumUrl() — picsum.photos placeholder images
│
├── supabase/migrations/
│   ├── 001_create_tables.sql     # Full schema: profiles, categories, products, product_variants, orders, order_items, stock_movements
│   ├── 002_rls_policies.sql      # Row-level security policies
│   └── 003_seed_data.sql         # Seed data
│
└── middleware.ts                  # Next.js middleware — skips if no Supabase, otherwise protects /account and /admin
```

### Concepts System

The UI is organized under `src/concepts/cipher/`. "Cipher" is the name of the current design theme — a dark, monospaced, terminal-inspired aesthetic. The design tokens in `tokens.ts` define:

- **Colors**: Dark background (`#0A0D12`), light foreground (`#E0E6ED`), green accent (`#00FFB2`)
- **Typography**: Geist Sans for body, Geist Mono for labels/nav
- **Borders**: Sharp corners (`radius: 0px`), thin borders
- **Motion**: 0.45s duration, easeInOut, 0.06s stagger
- **Spacing**: 80px section padding, 20px card padding

All styling is done via inline `style` props consuming these tokens — no CSS modules, no Tailwind utility classes in components.

### Data Layer Pattern

Every data function in `src/lib/data/` follows the same pattern:

```typescript
export async function getThings() {
  if (!supabaseConfigured) return mockThings.getThings()  // Demo mode
  const supabase = await getClient()
  const { data, error } = await supabase.from('table').select(...)
  if (error) throw error
  return data
}
```

The mock adapters in `mock-adapters.ts` transform the hardcoded data from `shared/data/` into the Supabase response shape (snake_case fields, nested relations).

### Cart

Client-side only via React Context + `useReducer`. Supports ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY, CLEAR_CART. Currency is AED, formatted with `Intl.NumberFormat`. Cart state is not persisted (resets on page refresh).

### Payments

Telr (UAE payment gateway) integration in `src/lib/telr.ts`:
- `createTelrPayment()` — creates a payment session, returns redirect URL
- `checkTelrPayment()` — verifies payment status by order ref
- API routes at `/api/payment/create`, `/api/payment/verify`, `/api/payment/webhook`
- Status code 3 from Telr = paid

### Auth & Authorization

- Supabase Auth with email/password
- `profiles` table extends `auth.users` with `role` field (`customer` | `admin`)
- Auto-profile creation via Postgres trigger on signup
- Middleware protects `/account` (must be logged in) and `/admin` (must be admin role)
- Admin layout does a second server-side role check as defense-in-depth
- In demo mode, all auth is bypassed — admin is freely accessible

## Database Schema

Six tables (see `001_create_tables.sql`):

| Table | Purpose |
|---|---|
| `profiles` | User profiles extending Supabase auth (id, email, full_name, phone, role) |
| `categories` | Product categories (slug, name, description, sort_order) |
| `products` | Products (slug, name, compound_code, purity, molecular_weight, etc.) |
| `product_variants` | Size/dosage variants (label, dosage, price, sku, stock_quantity). `in_stock` is a generated column |
| `orders` | Orders with full shipping/payment fields, Telr refs, status lifecycle |
| `order_items` | Line items denormalized with product_name, variant_label, sku |
| `stock_movements` | Audit trail for stock changes (sale, restock, adjustment, return, damage) |

Order statuses: `pending` → `payment_processing` → `paid` → `confirmed` → `preparing` → `shipped` → `out_for_delivery` → `delivered` (also `cancelled`, `refunded`).

## Product Catalog (Mock Data)

4 categories, 14 products total:

- **Growth Hormone Peptides**: CJC-1295 DAC, Ipamorelin, GHRP-6, Sermorelin
- **Recovery & Repair**: BPC-157, TB-500, GHK-Cu, AOD-9604
- **Cognitive & Neuropeptides**: Selank, Semax, Dihexa
- **Longevity & Cellular Health**: Epithalon, FOXO4-DRI, SS-31

Each product has 2-3 variants (different dosage sizes) priced in AED (roughly 95-1650 AED range). Purity values range from 98.1% to 99.5%.

## Recent Changes (Uncommitted)

1. **Nav.tsx**: Removed "About" and "Contact" nav links — only Research, Catalogue, and Admin (demo mode) remain
2. **ProductGrid.tsx**: Added `key` prop derived from product IDs to fix blank-card bug when switching category tabs (the `once: true` viewport animation wasn't re-triggering)
3. **mock-adapters.ts**: Expanded with more comprehensive mock data (orders, customers, dashboard stats, stock)
4. **orders.ts**: Minor changes to order data functions

## Git History

```
ddf2221 fifth commit      (HEAD → main)
85f2efc improvements
29ee610 first commit
```

Three commits on `main`, no remote branches. No CI/CD configured.

## Known Issues / Future Work

- WhatsApp number is a placeholder (`971501234567`)
- No About page yet — the `/#about` anchor just scrolls to the credibility/verification section on the homepage
- Cart state is not persisted across page refreshes (no localStorage/sessionStorage)
- Placeholder images use picsum.photos — need real product photography
- `AiChatWidget.tsx` exists in shared components (likely a placeholder)
- No tests exist
- No CI/CD pipeline
- The `concepts/` pattern suggests the design theme could be swappable, but only "cipher" exists
