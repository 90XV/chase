-- Add sort_order column to menu_items
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS sort_order integer;

-- Initialize sort_order with current ID to preserve existing order
UPDATE public.menu_items SET sort_order = id WHERE sort_order IS NULL;
