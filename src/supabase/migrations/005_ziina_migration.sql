-- Rename Telr-specific columns to generic payment columns
ALTER TABLE orders RENAME COLUMN telr_order_ref TO payment_intent_id;
ALTER TABLE orders RENAME COLUMN telr_transaction_ref TO payment_transaction_ref;
