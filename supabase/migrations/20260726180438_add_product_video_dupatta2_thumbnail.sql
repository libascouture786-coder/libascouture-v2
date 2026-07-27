/*
# Add video, dupatta 2, and thumbnail support to products

1. Modified Tables
- `products`
  - `video_url` (text, nullable) — optional product showcase video URL
  - `color_dupatta1` (text, nullable) — colour of the first dupatta
  - `fabric_dupatta1` (text, nullable) — fabric of the first dupatta
  - `color_dupatta2` (text, nullable) — colour of the second dupatta (optional)
  - `fabric_dupatta2` (text, nullable) — fabric of the second dupatta (optional)
  - `color_main` (text, nullable) — colour of the main outfit
  - `thumbnail_index` (integer, default 0) — which gallery image is the thumbnail
2. Notes
- All new columns are nullable (or have safe defaults) so existing rows and
  existing insert/update calls continue to work without changes.
- `fabric_dupatta` (existing) is preserved; the new `fabric_dupatta1`/`fabric_dupatta2`
  columns are additive for the redesigned multi-step form. The form writes to
  the new columns.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS color_main text,
  ADD COLUMN IF NOT EXISTS color_dupatta1 text,
  ADD COLUMN IF NOT EXISTS fabric_dupatta1 text,
  ADD COLUMN IF NOT EXISTS color_dupatta2 text,
  ADD COLUMN IF NOT EXISTS fabric_dupatta2 text,
  ADD COLUMN IF NOT EXISTS thumbnail_index integer NOT NULL DEFAULT 0;
