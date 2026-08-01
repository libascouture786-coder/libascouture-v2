-- Add missing columns to products table that the admin form sends
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS accessories text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS hand_work_details text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS customisation_level text;

-- Fix product_images view_type CHECK constraint to include 'gallery'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'product_images_view_type_check'
      AND conrelid = 'product_images'::regclass
  ) THEN
    ALTER TABLE product_images DROP CONSTRAINT product_images_view_type_check;
  END IF;
END $$;
ALTER TABLE product_images ADD CONSTRAINT product_images_view_type_check
  CHECK (view_type IN ('hero', 'front', 'back', 'side', 'detail', 'dupatta', 'trail', 'full', 'gallery'));

-- Make appointments.email nullable (form allows null email)
ALTER TABLE appointments ALTER COLUMN email DROP NOT NULL;

-- Add message column to admin_enquiries (public form sends 'message')
ALTER TABLE admin_enquiries ADD COLUMN IF NOT EXISTS message text;
