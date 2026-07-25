/*
# Create products table (single-tenant storefront)

1. New Tables
- `products`
  - `id` (uuid, primary key)
  - `slug` (text, unique) — URL-safe identifier
  - `title` (text, not null) — display name
  - `excerpt` (text) — short description
  - `description` (text) — full editorial description
  - `category_id` (uuid, FK -> categories) — primary category
  - `price` (numeric) — display price (nullable for "on request")
  - `price_on_request` (boolean, default true) — whether price is shown or "on request"
  - `occasion` (text) — e.g. "Bridal", "Engagement"
  - `embroidery_style` (text) — e.g. "Zardozi"
  - `fabric` (text) — e.g. "Raw Silk"
  - `color` (text) — primary color
  - `image_keys` (text[]) — ordered list of image-registry keys (multiple angles)
  - `is_featured` (boolean, default false) — show on home/collections
  - `is_active` (boolean, default true) — soft toggle
  - `sort_order` (int, default 0)
  - `created_at` / `updated_at` (timestamps)
2. Security
- Enable RLS on `products`.
- Public read for anon + authenticated (storefront is intentionally public).
- No public writes.
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  price numeric(12, 2),
  price_on_request boolean NOT NULL DEFAULT true,
  occasion text,
  embroidery_style text,
  fabric text,
  color text,
  image_keys text[] NOT NULL DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products"
ON products FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products (is_featured);
CREATE INDEX IF NOT EXISTS idx_products_occasion ON products (occasion);
CREATE INDEX IF NOT EXISTS idx_products_embroidery ON products (embroidery_style);
CREATE INDEX IF NOT EXISTS idx_products_color ON products (color);
CREATE INDEX IF NOT EXISTS idx_products_fabric ON products (fabric);
