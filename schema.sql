-- ==========================================
-- HOTWHEELS COFFEE - SUPABASE INITIAL SCHEMA
-- ==========================================

-- 1. Create Menu Items Table
create table if not exists public.menu_items (
  id integer primary key generated always as identity,
  name text not null,
  description text,
  price numeric(10,2) not null,
  icon_name text not null default 'Coffee',
  status text not null default 'In Stock',
  stock_level integer not null default 0
);

-- Insert Default Mock Menu Items
insert into public.menu_items (name, description, price, icon_name, status, stock_level)
values 
  ('Mocha', 'Rich espresso with chocolate & steamed milk', 5.00, 'Coffee', 'In Stock', 100),
  ('Caramel Macchiato', 'Espresso with vanilla & caramel drizzle', 5.50, 'CupSoda', 'Low Stock', 12),
  ('Espresso', 'Pure, high-octane dark roast', 3.00, 'Zap', 'In Stock', 85),
  ('Latte', 'Smooth espresso & steamed milk', 4.50, 'Coffee', 'In Stock', 40),
  ('Nitro Cold Brew', 'Cold-steeped & nitrogen-infused', 6.00, 'Droplet', 'Sold Out', 0)
on conflict do nothing;

-- 2. Create Orders Table
create table if not exists public.orders (
  id text primary key, -- Custom IDs like ORD-1234AB
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null default 'Preparing', -- Preparing, Ready, In Delivery, Completed, Cancelled
  method text not null, -- pickup, delivery
  distance numeric(10,1) default 0,
  total numeric(10,2) not null,
  queue_number integer not null,
  items jsonb not null -- Storing cart array directly in JSON
);

-- 3. Create Chats Table
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  order_id text references public.orders(id) on delete cascade not null,
  sender text not null, -- 'admin' or 'customer'
  message text not null,
  is_read boolean default false
);

-- ==========================================
-- ENABLE REALTIME CAPABILITIES
-- ==========================================
-- Drop existing publications if they exist to prevent errors on re-runs
drop publication if exists supabase_realtime;
create publication supabase_realtime;

alter publication supabase_realtime add table public.menu_items;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.chats;
