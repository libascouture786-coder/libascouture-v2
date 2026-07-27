-- Add 'Hand Work' and 'Mix Work' to the allowed work_type values.
-- Both the Quick Collection form and the existing Product Form send these
-- labels; the constraint previously only allowed 'Handwork' / 'Mixed Work'
-- (no space), which caused every product save to fail with a CHECK violation.
-- This is purely additive — no existing data is affected.

ALTER TABLE products DROP CONSTRAINT products_work_type_check;
ALTER TABLE products ADD CONSTRAINT products_work_type_check
  CHECK (work_type = ANY (ARRAY[
    'Handwork'::text, 'Machine Work'::text, 'Mixed Work'::text,
    'Custom Couture'::text, 'Ready Piece'::text,
    'handwork'::text, 'machine_work'::text, 'mixed'::text,
    'Hand Work'::text, 'Mix Work'::text
  ]));
