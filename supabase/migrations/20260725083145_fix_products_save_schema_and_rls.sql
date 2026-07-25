-- Add columns that the product form saves but the schema is missing
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS styling_notes text,
  ADD COLUMN IF NOT EXISTS event_suitability text,
  ADD COLUMN IF NOT EXISTS fabric_lining text,
  ADD COLUMN IF NOT EXISTS customisation_options text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS delivery_time text,
  ADD COLUMN IF NOT EXISTS measurement_notes text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS image_alt_text text;

-- RLS policies for products (admin write)
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- RLS policies for product_images (admin write)
CREATE POLICY "admin_insert_product_images" ON product_images FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "admin_update_product_images" ON product_images FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_product_images" ON product_images FOR DELETE
  TO authenticated USING (true);
CREATE POLICY "admin_select_product_images" ON product_images FOR SELECT
  TO authenticated USING (true);

-- RLS policies for admin_activity_log (admin write)
CREATE POLICY "admin_insert_activity_log" ON admin_activity_log FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "admin_select_activity_log" ON admin_activity_log FOR SELECT
  TO authenticated USING (true);
