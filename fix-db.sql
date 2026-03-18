-- 1. Enable RLS to allow policies to exist
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.chats enable row level security;

-- 2. Create ALLOW ALL Policies to permit Anonymous Read/Write from Next.js
drop policy if exists "public all menu" on public.menu_items;
create policy "public all menu" on public.menu_items for all to public using (true) with check (true);

drop policy if exists "public all orders" on public.orders;
create policy "public all orders" on public.orders for all to public using (true) with check (true);

drop policy if exists "public all chats" on public.chats;
create policy "public all chats" on public.chats for all to public using (true) with check (true);

-- 3. Ensure the Menu Items exist!
insert into public.menu_items (name, description, price, icon_name, status, stock_level)
values 
  ('Mocha', 'Rich espresso with chocolate & steamed milk', 5.00, 'Coffee', 'In Stock', 100),
  ('Caramel Macchiato', 'Espresso with vanilla & caramel drizzle', 5.50, 'CupSoda', 'Low Stock', 12),
  ('Espresso', 'Pure, high-octane dark roast', 3.00, 'Zap', 'In Stock', 85),
  ('Latte', 'Smooth espresso & steamed milk', 4.50, 'Coffee', 'In Stock', 40),
  ('Nitro Cold Brew', 'Cold-steeped & nitrogen-infused', 6.00, 'Droplet', 'Sold Out', 0)
on conflict do nothing;
