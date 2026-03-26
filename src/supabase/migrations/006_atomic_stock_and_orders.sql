-- Migration 006: Atomic stock operations and order RPCs
-- Adds RPC functions for atomic stock adjustment, order creation, and order status transitions

-- ============================================================================
-- RPC 1: adjust_stock_atomic
-- Atomically adjusts stock and records movement in a single transaction
-- ============================================================================
CREATE OR REPLACE FUNCTION adjust_stock_atomic(
  p_variant_id UUID,
  p_quantity_change INT,
  p_reason TEXT,
  p_created_by UUID DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS INT AS $$
DECLARE
  v_new_qty INT;
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity + p_quantity_change
  WHERE id = p_variant_id AND stock_quantity + p_quantity_change >= 0
  RETURNING stock_quantity INTO v_new_qty;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for variant %', p_variant_id;
  END IF;

  INSERT INTO stock_movements (variant_id, quantity_change, reason, created_by, reference_id, notes)
  VALUES (p_variant_id, p_quantity_change, p_reason, p_created_by, p_reference_id, p_notes);

  RETURN v_new_qty;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC 2: create_order_with_items
-- Creates an order and its items atomically in a single transaction
-- ============================================================================
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_order JSONB,
  p_items JSONB
) RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_order JSONB;
  v_item JSONB;
BEGIN
  v_order_number := 'ORD-' || to_hex(extract(epoch from now())::int) || '-' || left(replace(gen_random_uuid()::text, '-', ''), 6);

  INSERT INTO orders (
    order_number, customer_id, contact_name, contact_email, contact_phone,
    shipping_address, shipping_city, shipping_emirate, shipping_postal_code,
    subtotal, shipping_cost, total, expires_at
  ) VALUES (
    v_order_number,
    (p_order->>'customer_id')::UUID,
    p_order->>'contact_name',
    p_order->>'contact_email',
    p_order->>'contact_phone',
    p_order->>'shipping_address',
    p_order->>'shipping_city',
    p_order->>'shipping_emirate',
    p_order->>'shipping_postal_code',
    (p_order->>'subtotal')::NUMERIC,
    (p_order->>'shipping_cost')::NUMERIC,
    (p_order->>'total')::NUMERIC,
    CASE WHEN p_order->>'expires_at' IS NOT NULL THEN (p_order->>'expires_at')::TIMESTAMPTZ ELSE NULL END
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_id, variant_id, product_name, variant_label, sku, quantity, unit_price, total_price)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'variant_id')::UUID,
      v_item->>'product_name',
      v_item->>'variant_label',
      v_item->>'sku',
      (v_item->>'quantity')::INT,
      (v_item->>'unit_price')::NUMERIC,
      (v_item->>'total_price')::NUMERIC
    );
  END LOOP;

  SELECT jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'customer_id', o.customer_id,
    'contact_name', o.contact_name,
    'contact_email', o.contact_email,
    'status', o.status,
    'subtotal', o.subtotal,
    'shipping_cost', o.shipping_cost,
    'total', o.total,
    'created_at', o.created_at,
    'expires_at', o.expires_at
  ) INTO v_order FROM orders o WHERE o.id = v_order_id;

  RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC 3: transition_order_status
-- Atomically transitions order status with optimistic locking on from_status
-- ============================================================================
CREATE OR REPLACE FUNCTION transition_order_status(
  p_order_id UUID,
  p_from_status TEXT,
  p_to_status TEXT,
  p_extra JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  v_order JSONB;
  v_updates TEXT[];
  v_key TEXT;
  v_val TEXT;
BEGIN
  -- Build dynamic update with extra fields
  UPDATE orders
  SET
    status = p_to_status,
    updated_at = now(),
    paid_at = CASE WHEN p_to_status = 'paid' THEN now() ELSE paid_at END,
    shipped_at = CASE WHEN p_to_status = 'shipped' THEN now() ELSE shipped_at END,
    delivered_at = CASE WHEN p_to_status = 'delivered' THEN now() ELSE delivered_at END,
    payment_transaction_ref = COALESCE(p_extra->>'payment_transaction_ref', payment_transaction_ref),
    payment_method = COALESCE(p_extra->>'payment_method', payment_method),
    payment_intent_id = COALESCE(p_extra->>'payment_intent_id', payment_intent_id),
    tracking_number = COALESCE(p_extra->>'tracking_number', tracking_number),
    tracking_url = COALESCE(p_extra->>'tracking_url', tracking_url),
    notes = COALESCE(p_extra->>'notes', notes)
  WHERE id = p_order_id AND status = p_from_status
  RETURNING jsonb_build_object(
    'id', id,
    'order_number', order_number,
    'status', status,
    'paid_at', paid_at,
    'shipped_at', shipped_at,
    'delivered_at', delivered_at,
    'total', total,
    'created_at', created_at
  ) INTO v_order;

  RETURN v_order; -- NULL if no row matched
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Indexes and schema additions
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON orders(payment_intent_id) WHERE payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
