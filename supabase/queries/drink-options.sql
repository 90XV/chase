-- Add new columns for drink customization
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS supports_temp boolean DEFAULT false;

-- Update existing items with categories and icons
UPDATE public.menu_items SET category = 'Coffee', icon_name = 'Coffee', supports_temp = true WHERE name IN ('Mocha', 'Latte', 'Espresso', 'Caramel Macchiato');
UPDATE public.menu_items SET category = 'Cold Brew', icon_name = 'Droplet', supports_temp = false WHERE name = 'Nitro Cold Brew';

-- Example update for new items (Fizzy, Matcha, Chocolate)
-- (The user will add these via the Admin panel, but we set the logic here)

-- Ensure real-time includes the new columns
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
