/*
# Seed categories (single-tenant storefront)

1. Data
- Insert the six top-level categories used across the storefront:
  Bridal Collection, Occasion Wear, Sarees, Suits, Create Your Own.
  These mirror the navigation config and image registry so the mega menu,
  collections landing page, and mobile nav can render from the database.
- Uses ON CONFLICT (slug) DO UPDATE so re-running is idempotent.
2. Security
- No policy changes (data only).
*/

INSERT INTO categories (slug, title, excerpt, image_key, sort_order, is_active)
VALUES
  ('bridal', 'Bridal Collection', 'Heirloom bridal couture, hand-embroidered for your once-in-a-lifetime day.', 'category.bridal', 1, true),
  ('occasion', 'Occasion Wear', 'Refined ensembles for engagements, receptions, and milestone celebrations.', 'category.occasion', 2, true),
  ('sarees', 'Sarees', 'Handwoven and hand-embroidered sarees in the finest silks and organzas.', 'category.sarees', 3, true),
  ('suits', 'Suits', 'Tailored couture suits with exquisite detailing and perfect fit.', 'category.suits', 4, true),
  ('create-your-own', 'Create Your Own', 'A bespoke atelier experience — co-create a one-of-a-kind silhouette.', 'category.create', 5, true)
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  image_key = EXCLUDED.image_key,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();
