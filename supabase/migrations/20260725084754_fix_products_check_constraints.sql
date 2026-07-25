-- Align CHECK constraints with the values the product form actually sends
ALTER TABLE products DROP CONSTRAINT products_work_type_check;
ALTER TABLE products ADD CONSTRAINT products_work_type_check
  CHECK (work_type = ANY (ARRAY[
    'Handwork'::text, 'Machine Work'::text, 'Mixed Work'::text,
    'Custom Couture'::text, 'Ready Piece'::text,
    'handwork'::text, 'machine_work'::text, 'mixed'::text
  ]));

ALTER TABLE products DROP CONSTRAINT products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check
  CHECK (status = ANY (ARRAY[
    'ready_to_ship'::text, 'made_on_order'::text, 'signature'::text,
    'limited_availability'::text, 'hidden'::text, 'archived'::text,
    'limited'::text
  ]));
