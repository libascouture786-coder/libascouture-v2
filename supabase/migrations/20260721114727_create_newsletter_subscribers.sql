/*
# Create newsletter_subscribers table (single-tenant storefront)

1. New Tables
- `newsletter_subscribers`
  - `id` (uuid, primary key)
  - `email` (text, unique, not null)
  - `subscribed_at` (timestamp, default now())
  - `is_active` (boolean, default true) — soft unsubscribe toggle
2. Security
- Enable RLS on `newsletter_subscribers`.
- Public INSERT: any visitor may subscribe (the frontend newsletter form).
- No public SELECT/UPDATE/DELETE (admin reads via service role).
*/

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_newsletter" ON newsletter_subscribers;
CREATE POLICY "public_insert_newsletter"
ON newsletter_subscribers FOR INSERT
TO anon, authenticated
WITH CHECK (true);
