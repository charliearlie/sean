-- ============================================================
-- 002_rls_policies.sql
-- Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- CATEGORIES
-- ============================================================

-- Public read access
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  USING (true);

-- Admin insert
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (is_admin());

-- Admin update
CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (is_admin());

-- Admin delete
CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (is_admin());

-- ============================================================
-- PRODUCTS
-- ============================================================

-- Public read for active products
CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  USING (active = true);

-- Admins can read all products (including inactive)
CREATE POLICY "Admins can read all products"
  ON products FOR SELECT
  USING (is_admin());

-- Admin insert
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (is_admin());

-- Admin update
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (is_admin());

-- Admin delete
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (is_admin());

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================

-- Public read for active variants
CREATE POLICY "Anyone can read active variants"
  ON product_variants FOR SELECT
  USING (active = true);

-- Admins can read all variants
CREATE POLICY "Admins can read all variants"
  ON product_variants FOR SELECT
  USING (is_admin());

-- Admin insert
CREATE POLICY "Admins can insert variants"
  ON product_variants FOR INSERT
  WITH CHECK (is_admin());

-- Admin update
CREATE POLICY "Admins can update variants"
  ON product_variants FOR UPDATE
  USING (is_admin());

-- Admin delete
CREATE POLICY "Admins can delete variants"
  ON product_variants FOR DELETE
  USING (is_admin());

-- ============================================================
-- ORDERS
-- ============================================================

-- Customers can read their own orders
CREATE POLICY "Customers can read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = customer_id);

-- Admins can read all orders
CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  USING (is_admin());

-- Authenticated users can insert orders
CREATE POLICY "Authenticated users can insert orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can update orders
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (is_admin());

-- Admins can delete orders
CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  USING (is_admin());

-- ============================================================
-- ORDER ITEMS
-- ============================================================

-- Customers can read their own order items (via order ownership)
CREATE POLICY "Customers can read own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Admins can read all order items
CREATE POLICY "Admins can read all order items"
  ON order_items FOR SELECT
  USING (is_admin());

-- Admin full access on order items
CREATE POLICY "Admins can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (is_admin() OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update order items"
  ON order_items FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete order items"
  ON order_items FOR DELETE
  USING (is_admin());

-- ============================================================
-- STOCK MOVEMENTS
-- ============================================================

-- Admin only read
CREATE POLICY "Admins can read stock movements"
  ON stock_movements FOR SELECT
  USING (is_admin());

-- Admin only insert
CREATE POLICY "Admins can insert stock movements"
  ON stock_movements FOR INSERT
  WITH CHECK (is_admin());

-- Admin only update
CREATE POLICY "Admins can update stock movements"
  ON stock_movements FOR UPDATE
  USING (is_admin());

-- Admin only delete
CREATE POLICY "Admins can delete stock movements"
  ON stock_movements FOR DELETE
  USING (is_admin());
