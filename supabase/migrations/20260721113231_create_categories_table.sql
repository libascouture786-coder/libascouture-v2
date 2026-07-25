/*
# Create categories table (single-tenant storefront)

1. New Tables
- `categories`
  - `id` (uuid, primary key)
  - `slug` (text, unique) — URL-safe identifier, e.g. "bridal"
  - `title` (text, not null) — display name
  - `excerpt` (text) — short marketing description
  - `image_key` (text) — dotted key into the image registry
  - `sort_order` (int, default 0) — controls display order
  - `is_active` (boolean, default true) — soft toggle for visibility
  - `created_at` / `updated_at` (timestamps)
2. Security
- Enable RLS on `categories`.
- Public read for anon + authenticated (storefront is intentionally public).
- No public writes (writes are admin-only via service role).
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  image_key text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories"
ON categories FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories (sort_order);
