-- Partners table for the /partners page
create table if not exists public.partners (
  id uuid default gen_random_uuid() primary key,
  company_name text not null,
  contact_number text,
  website text,
  bio text,
  images jsonb default '[]'::jsonb, -- array of image URLs (max 8)
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

-- Enable realtime
alter publication supabase_realtime add table public.partners;

-- Public access (read for customers, full access for admin via anon key)
create policy "public all partners" on public.partners for all to public using (true) with check (true);

-- Enable RLS
alter table public.partners enable row level security;
