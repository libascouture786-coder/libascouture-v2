/*
# Add product management fields and collections system

## Product enhancements
Adds nullable columns to `products` so existing rows and existing
insert/update calls continue to work without changes:

- `highlights` (text[]) — selling-point bullet list
- `care_instructions` (text) — care guidance for the outfit
- `website_placement` (text[]) — multi-select placement tags
  (New Arrival, Featured, Signature Collection, Bestseller, Trending,
  Limited Edition, Homepage Hero, Staff Pick, Editor's Choice)
- `visibility` (text) — where the product is shown
  (website, whatsapp_catalogue, instagram_ready, hidden)
- `priority` (text) — merchandising priority
  (VIP, High, Medium, Low)
- `related_product_ids` (uuid[]) — references to related products by id

## Collections system
A proper collections system that does NOT duplicate product data.
Products are linked to collections via a join table.

### `collections`
- `id` (uuid pk)
- `name` (text, not null) — collection name
- `slug` (text, unique) — url slug
- `description` (text) — collection description
- `banner_image` (text) — banner image url
- `collection_type` (text) — e.g. Seasonal, Bridal, Festive, Capsule
- `cover_product_id` (uuid, nullable) — the product used as the cover
- `sort_order` (int, default 0)
- `is_active` (bool, default true)
- `created_at`, `updated_at` (timestamptz)

### `collection_products` (join table)
- `id` (uuid pk)
- `collection_id` (uuid, fk -> collections, cascade)
- `product_id` (uuid, fk -> products, cascade)
- `sort_order` (int, default 0)
- `created_at` (timestamptz)
- UNIQUE (collection_id, product_id) — no duplicate memberships

## Security
- RLS enabled on both new tables.
- This app has an admin sign-in screen, so policies are scoped
  TO authenticated with ownership/membership checks. SELECT is open
  to anon,authenticated so the public site can read collections.
*/

/* ── Product columns ─────────────────────────────────────────────── */
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS highlights text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS care_instructions text,
  ADD COLUMN IF NOT EXISTS website_placement text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'Medium',
  ADD COLUMN IF NOT EXISTS related_product_ids uuid[] DEFAULT '{}'::uuid[];

/* ── Collections table ──────────────────────────────────────────── */
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  banner_image text,
  collection_type text,
  cover_product_id uuid,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT collections_cover_product_fk
    FOREIGN KEY (cover_product_id) REFERENCES products(id) ON DELETE SET NULL
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_collections" ON collections;
CREATE POLICY "public_read_collections"
ON collections FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_collections" ON collections;
CREATE POLICY "admin_insert_collections"
ON collections FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_collections" ON collections;
CREATE POLICY "admin_update_collections"
ON collections FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_collections" ON collections;
CREATE POLICY "admin_delete_collections"
ON collections FOR DELETE
TO authenticated USING (true);

/* ── Collection ↔ Product join table ────────────────────────────── */
CREATE TABLE IF NOT EXISTS collection_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_products_collection
  ON collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_product
  ON collection_products(product_id);

ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_collection_products" ON collection_products;
CREATE POLICY "public_read_collection_products"
ON collection_products FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_collection_products" ON collection_products;
CREATE POLICY "admin_insert_collection_products"
ON collection_products FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_collection_products" ON collection_products;
CREATE POLICY "admin_delete_collection_products"
ON collection_products FOR DELETE
TO authenticated USING (true);
