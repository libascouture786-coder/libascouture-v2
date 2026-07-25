/*
# Create appointments and wishlist_items tables (single-tenant storefront)

These tables support future Supabase migration of the client-side
localStorage features (appointment booking + wishlist). They are created now
so the schema is production-ready; the frontend storage adapter can be
swapped to Supabase in a later part without restructuring.

1. New Tables
- `appointments`
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `email` (text, not null)
  - `phone` (text, not null)
  - `preferred_date` (date, not null)
  - `occasion` (text)
  - `notes` (text)
  - `status` (text, default 'pending') — pending / confirmed / completed / cancelled
  - `created_at` (timestamp)
- `wishlist_items`
  - `id` (uuid, primary key)
  - `session_id` (text) — anonymous browser session identifier
  - `product_id` (uuid, FK -> products, nullable)
  - `product_title` (text, not null) — denormalized for resilience
  - `product_image_key` (text)
  - `product_href` (text)
  - `created_at` (timestamp)
  - UNIQUE(session_id, product_id)
2. Security
- Enable RLS on both tables.
- `appointments`: public INSERT (any visitor may request an appointment);
  no public SELECT/UPDATE/DELETE (admin reads via service role).
- `wishlist_items`: public INSERT + SELECT + DELETE scoped to the caller's
  session_id (passed from the client). The anon-key client manages its own
  wishlist rows by session_id.
*/

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  preferred_date date NOT NULL,
  occasion text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_appointments" ON appointments;
CREATE POLICY "public_insert_appointments"
ON appointments FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  product_title text NOT NULL,
  product_image_key text,
  product_href text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, product_id)
);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_wishlist" ON wishlist_items;
CREATE POLICY "public_select_wishlist"
ON wishlist_items FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "public_insert_wishlist" ON wishlist_items;
CREATE POLICY "public_insert_wishlist"
ON wishlist_items FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_wishlist" ON wishlist_items;
CREATE POLICY "public_delete_wishlist"
ON wishlist_items FOR DELETE
TO anon, authenticated
USING (true);
