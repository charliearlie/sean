-- Shipping rates per emirate
CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emirate TEXT UNIQUE NOT NULL,
  rate NUMERIC(10, 2) NOT NULL DEFAULT 25,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Site-wide settings (key-value store)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed shipping rates for 7 UAE emirates
INSERT INTO shipping_rates (emirate, rate) VALUES
  ('Dubai', 15),
  ('Sharjah', 20),
  ('Abu Dhabi', 25),
  ('Ajman', 25),
  ('Umm Al Quwain', 30),
  ('Ras Al Khaimah', 30),
  ('Fujairah', 30)
ON CONFLICT (emirate) DO NOTHING;

-- Free shipping threshold
INSERT INTO site_settings (key, value) VALUES
  ('free_shipping_threshold', '500')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "shipping_rates_read" ON shipping_rates FOR SELECT USING (true);
CREATE POLICY "site_settings_read" ON site_settings FOR SELECT USING (true);

-- Only admins can write
CREATE POLICY "shipping_rates_admin_write" ON shipping_rates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "site_settings_admin_write" ON site_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
