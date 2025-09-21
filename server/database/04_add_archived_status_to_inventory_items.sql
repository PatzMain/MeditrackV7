ALTER TABLE public.inventory_items
  DROP CONSTRAINT IF EXISTS inventory_items_status_check,
  ADD CONSTRAINT inventory_items_status_check
  CHECK (status IN ('available', 'low_stock', 'expired', 'out_of_stock', 'archived'));
