/*
# Admin Dashboard Tables — CMS, Settings, Media, Pages, SEO, Analytics

## Purpose
Creates the backend tables required by the LIBAS COUTURE admin dashboard (Parts 6.1–6.4).
All tables are single-tenant (the admin app uses Supabase email/password auth).
RLS policies allow authenticated admin users full CRUD access.

## New Tables

### `admin_activity_log`
Tracks every admin action for the recent-activity timeline.
- `id` (uuid PK)
- `action_type` (text) — e.g. 'product_added', 'appointment_received'
- `entity_type` (text) — e.g. 'product', 'appointment', 'collection'
- `entity_id` (text, nullable)
- `description` (text)
- `admin_email` (text, nullable)
- `created_at` (timestamptz default now())

### `admin_notifications`
Stores notifications for the notification center.
- `id` (uuid PK)
- `type` (text) — e.g. 'new_appointment', 'low_stock', 'draft_pending'
- `priority` (text) — 'high' | 'medium' | 'low'
- `title` (text)
- `message` (text)
- `entity_type` (text, nullable)
- `entity_id` (text, nullable)
- `is_read` (boolean default false)
- `created_at` (timestamptz default now())

### `admin_settings`
Key-value store for global website settings (brand, contact, social, hours, etc.).
- `id` (uuid PK)
- `key` (text unique not null)
- `value` (jsonb not null default '{}')
- `updated_at` (timestamptz default now())

### `admin_enquiries`
Centralized customer enquiries / lead management.
- `id` (uuid PK)
- `name` (text not null)
- `mobile` (text not null)
- `email` (text, nullable)
- `enquiry_type` (text) — 'whatsapp' | 'appointment' | 'custom_design' | 'product' | 'general'
- `product_code` (text, nullable)
- `category` (text, nullable)
- `occasion` (text, nullable)
- `budget` (text, nullable)
- `event_date` (date, nullable)
- `customisation` (text, nullable)
- `measurement_status` (text, nullable)
- `lead_priority` (text) — 'high' | 'medium' | 'low'
- `notes` (text, nullable)
- `follow_up_date` (date, nullable)
- `follow_up_notes` (text, nullable)
- `follow_up_status` (text, nullable)
- `status` (text) — 'new' | 'contacted' | 'closed' | 'archived'
- `created_at` (timestamptz default now())
- `updated_at` (timestamptz default now())

### `homepage_sections`
Controls homepage section visibility, order, and content.
- `id` (uuid PK)
- `section_key` (text unique not null) — e.g. 'hero', 'signature_collections', 'featured_banner'
- `title` (text not null)
- `is_visible` (boolean default true)
- `sort_order` (integer default 0)
- `content` (jsonb default '{}') — flexible content storage
- `updated_at` (timestamptz default now())

### `media_library`
Centralized media assets registry.
- `id` (uuid PK)
- `name` (text not null)
- `url` (text not null)
- `type` (text) — 'image' | 'video'
- `folder` (text) — e.g. 'product_images', 'homepage_banners', 'brand_assets'
- `size_bytes` (integer, nullable)
- `width` (integer, nullable)
- `height` (integer, nullable)
- `alt_text` (text, nullable)
- `usage_type` (text, nullable) — e.g. 'hero', 'product', 'gallery'
- `created_at` (timestamptz default now())

### `website_pages`
Static page manager for CMS-controlled pages.
- `id` (uuid PK)
- `page_key` (text unique not null) — e.g. 'about', 'faq', 'terms'
- `title` (text not null)
- `content` (jsonb default '[]') — array of content blocks
- `hero_image` (text, nullable)
- `is_visible` (boolean default true)
- `is_published` (boolean default false)
- `updated_at` (timestamptz default now())

### `seo_settings`
SEO metadata for pages, categories, collections, products.
- `id` (uuid PK)
- `entity_type` (text not null) — 'homepage' | 'category' | 'collection' | 'product' | 'page'
- `entity_id` (text, nullable) — slug or id
- `meta_title` (text, nullable)
- `meta_description` (text, nullable)
- `url_slug` (text, nullable)
- `canonical_url` (text, nullable)
- `og_title` (text, nullable)
- `og_description` (text, nullable)
- `og_image` (text, nullable)
- `twitter_card_image` (text, nullable)
- `is_indexed` (boolean default true)
- `created_at` (timestamptz default now())
- `updated_at` (timestamptz default now())

### `analytics_events`
Tracks visitor events for the analytics dashboard.
- `id` (uuid PK)
- `event_type` (text not null) — 'page_view', 'product_view', 'whatsapp_click', 'appointment_request', 'search'
- `entity_id` (text, nullable)
- `source` (text, nullable) — 'direct', 'instagram', 'youtube', 'facebook', 'google', 'whatsapp', 'referral'
- `search_term` (text, nullable)
- `metadata` (jsonb default '{}')
- `created_at` (timestamptz default now())

## Security
All tables use `TO authenticated` RLS policies (admin-only access).
The public-facing website reads settings/pages/sections via a separate anon-readable SELECT policy
on `admin_settings`, `homepage_sections`, `website_pages`, and `seo_settings`.

## Important Notes
1. All CREATE TABLE statements use `IF NOT EXISTS` for idempotency.
2. Policies use `DROP POLICY IF EXISTS` before `CREATE POLICY`.
3. No existing data is modified or deleted.
4. `admin_settings` is seeded with default brand/contact values.
*/

-- ── admin_activity_log ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  entity_type text,
  entity_id text,
  description text NOT NULL,
  admin_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_crud_admin_activity_log" ON admin_activity_log;
CREATE POLICY "auth_crud_admin_activity_log" ON admin_activity_log
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── admin_notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  title text NOT NULL,
  message text NOT NULL,
  entity_type text,
  entity_id text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_crud_admin_notifications" ON admin_notifications;
CREATE POLICY "auth_crud_admin_notifications" ON admin_notifications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── admin_settings ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
-- Admin full access
DROP POLICY IF EXISTS "auth_crud_admin_settings" ON admin_settings;
CREATE POLICY "auth_crud_admin_settings" ON admin_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Public read-only (for frontend to load settings)
DROP POLICY IF EXISTS "anon_read_admin_settings" ON admin_settings;
CREATE POLICY "anon_read_admin_settings" ON admin_settings
  FOR SELECT TO anon, authenticated USING (true);

-- ── admin_enquiries ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mobile text NOT NULL,
  email text,
  enquiry_type text NOT NULL DEFAULT 'general',
  product_code text,
  category text,
  occasion text,
  budget text,
  event_date date,
  customisation text,
  measurement_status text,
  lead_priority text NOT NULL DEFAULT 'medium',
  notes text,
  follow_up_date date,
  follow_up_notes text,
  follow_up_status text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE admin_enquiries ENABLE ROW LEVEL SECURITY;
-- Admin full access
DROP POLICY IF EXISTS "auth_crud_admin_enquiries" ON admin_enquiries;
CREATE POLICY "auth_crud_admin_enquiries" ON admin_enquiries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Public insert (visitors can submit enquiries)
DROP POLICY IF EXISTS "anon_insert_admin_enquiries" ON admin_enquiries;
CREATE POLICY "anon_insert_admin_enquiries" ON admin_enquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ── homepage_sections ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  title text NOT NULL,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  content jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_crud_homepage_sections" ON homepage_sections;
CREATE POLICY "auth_crud_homepage_sections" ON homepage_sections
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_read_homepage_sections" ON homepage_sections;
CREATE POLICY "anon_read_homepage_sections" ON homepage_sections
  FOR SELECT TO anon, authenticated USING (true);

-- ── media_library ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  type text NOT NULL DEFAULT 'image',
  folder text NOT NULL DEFAULT 'uncategorized',
  size_bytes integer,
  width integer,
  height integer,
  alt_text text,
  usage_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_crud_media_library" ON media_library;
CREATE POLICY "auth_crud_media_library" ON media_library
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_read_media_library" ON media_library;
CREATE POLICY "anon_read_media_library" ON media_library
  FOR SELECT TO anon, authenticated USING (true);

-- ── website_pages ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS website_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text UNIQUE NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '[]',
  hero_image text,
  is_visible boolean NOT NULL DEFAULT true,
  is_published boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE website_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_crud_website_pages" ON website_pages;
CREATE POLICY "auth_crud_website_pages" ON website_pages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_read_website_pages" ON website_pages;
CREATE POLICY "anon_read_website_pages" ON website_pages
  FOR SELECT TO anon, authenticated USING (true);

-- ── seo_settings ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id text,
  meta_title text,
  meta_description text,
  url_slug text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image text,
  twitter_card_image text,
  is_indexed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_crud_seo_settings" ON seo_settings;
CREATE POLICY "auth_crud_seo_settings" ON seo_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_read_seo_settings" ON seo_settings;
CREATE POLICY "anon_read_seo_settings" ON seo_settings
  FOR SELECT TO anon, authenticated USING (true);

-- ── analytics_events ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  entity_id text,
  source text,
  search_term text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
-- Admin full access
DROP POLICY IF EXISTS "auth_crud_analytics_events" ON analytics_events;
CREATE POLICY "auth_crud_analytics_events" ON analytics_events
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Public insert (visitor tracking)
DROP POLICY IF EXISTS "anon_insert_analytics_events" ON analytics_events;
CREATE POLICY "anon_insert_analytics_events" ON analytics_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ── Seed default homepage sections ─────────────────────────────────
INSERT INTO homepage_sections (section_key, title, is_visible, sort_order, content)
VALUES
  ('announcement_bar', 'Announcement Bar', true, 0, '{"items": ["Bespoke Hand Embroidery — Crafted For You", "Fully Customisable Bridal Couture", "Book Your Personal Bridal Consultation"]}'::jsonb),
  ('hero', 'Hero Banner', true, 1, '{"heading": "Luxury Bridal Couture", "subheading": "Handcrafted For Your Forever Moments", "cta_primary": "Book Appointment", "cta_secondary": "Explore Collection", "trust_points": ["Fully Customisable", "Hand Embroidery", "Premium Craftsmanship"]}'::jsonb),
  ('trust_bar', 'Trust Bar', true, 2, '{}'::jsonb),
  ('signature_collections', 'Signature Collections', true, 3, '{}'::jsonb),
  ('shop_by_occasion', 'Shop by Occasion', true, 4, '{}'::jsonb),
  ('featured_banner', 'Featured Banner', true, 5, '{}'::jsonb),
  ('embroidery_section', 'Embroidery Section', true, 6, '{}'::jsonb),
  ('create_your_own', 'Create Your Own', true, 7, '{}'::jsonb),
  ('why_choose_us', 'Why Choose Us', true, 8, '{}'::jsonb),
  ('real_brides', 'Real Brides Gallery', true, 9, '{}'::jsonb),
  ('visit_atelier', 'Visit Atelier', true, 10, '{}'::jsonb),
  ('google_reviews', 'Testimonials', true, 11, '{}'::jsonb),
  ('newsletter', 'Newsletter', true, 12, '{}'::jsonb),
  ('final_cta', 'Final CTA', true, 13, '{}'::jsonb)
ON CONFLICT (section_key) DO NOTHING;

-- ── Seed default admin settings ────────────────────────────────────
INSERT INTO admin_settings (key, value)
VALUES
  ('brand', '{"name": "LIBAS COUTURE", "tagline": "Bespoke Hand Embroidery", "description": "A luxury bridal couture house specializing in bespoke hand embroidery and handcrafted heirloom-quality bridal wear."}'::jsonb),
  ('contact', '{"phone_display": "+91 95110 22858", "phone_raw": "+919511022858", "whatsapp_number": "919511022858", "email": "atelier@libascouture.in", "address_line1": "195/2, First Floor", "address_line2": "Katra Nawab, Chandni Chowk", "city": "Delhi", "pincode": "110006", "country": "India"}'::jsonb),
  ('social', '{"instagram": "https://www.instagram.com/libascouture.in", "youtube": "https://www.youtube.com/@Libascoutureofficial", "facebook": "https://www.facebook.com/share/18CN2GgvtZ/", "whatsapp": "https://wa.me/919511022858"}'::jsonb),
  ('hours', '{"days": "Monday — Sunday", "display": "11:00 AM — 8:00 PM"}'::jsonb),
  ('maintenance', '{"enabled": false, "message": "We are currently updating our collection. Please check back shortly."}'::jsonb),
  ('header', '{"sticky": true, "show_cta": true, "cta_text": "Book"}'::jsonb),
  ('footer', '{"show_social": true, "show_contact": true, "show_quick_links": true, "copyright": "Handcrafted with care in Chandni Chowk, Delhi"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ── Seed default website pages ─────────────────────────────────────
INSERT INTO website_pages (page_key, title, is_visible, is_published, content)
VALUES
  ('about', 'About', true, true, '[]'::jsonb),
  ('contact', 'Contact', true, true, '[]'::jsonb),
  ('create_your_own', 'Create Your Own', true, true, '[]'::jsonb),
  ('faq', 'FAQ', true, true, '[]'::jsonb),
  ('terms', 'Terms & Conditions', true, true, '[]'::jsonb),
  ('privacy', 'Privacy Policy', true, true, '[]'::jsonb),
  ('shipping', 'Shipping Policy', true, true, '[]'::jsonb),
  ('customisation_policy', 'Customisation Policy', true, true, '[]'::jsonb),
  ('measurement_guide', 'Measurement Guide', true, true, '[]'::jsonb),
  ('return_exchange', 'Return / Exchange Policy', true, true, '[]'::jsonb),
  ('appointment_policy', 'Appointment Policy', true, true, '[]'::jsonb)
ON CONFLICT (page_key) DO NOTHING;

-- ── Seed default SEO settings ─────────────────────────────────────
INSERT INTO seo_settings (entity_type, entity_id, meta_title, meta_description, is_indexed)
VALUES
  ('homepage', null, 'LIBAS COUTURE | Bespoke Hand Embroidery — Luxury Bridal Couture', 'LIBAS COUTURE is a luxury bridal couture house in Delhi specializing in bespoke hand embroidery and handcrafted heirloom-quality bridal wear.', true),
  ('page', 'about', 'About | LIBAS COUTURE', 'The story, craftsmanship, and philosophy of LIBAS COUTURE — a luxury bridal couture house in Chandni Chowk, Delhi.', true),
  ('page', 'contact', 'Contact | LIBAS COUTURE', 'Visit the LIBAS COUTURE atelier in Chandni Chowk, Delhi, or book a private appointment for bespoke bridal couture.', true),
  ('page', 'create_your_own', 'Create Your Own | LIBAS COUTURE', 'Share your inspiration and let LIBAS COUTURE craft a bespoke silhouette exclusively for you.', true),
  ('page', 'faq', 'FAQ | LIBAS COUTURE', 'Frequently asked questions about LIBAS COUTURE bespoke bridal couture.', true)
ON CONFLICT DO NOTHING;

-- ── Seed sample analytics data ─────────────────────────────────────
INSERT INTO analytics_events (event_type, source, created_at)
SELECT 'page_view', source, created_at FROM (
  VALUES
    ('direct', now() - interval '1 day'),
    ('instagram', now() - interval '2 days'),
    ('google', now() - interval '3 days'),
    ('direct', now() - interval '4 days'),
    ('youtube', now() - interval '5 days'),
    ('facebook', now() - interval '6 days'),
    ('whatsapp', now() - interval '7 days')
) AS t(source, created_at);
