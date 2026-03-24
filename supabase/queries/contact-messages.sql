-- Add contact_messages table
create table if not exists public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  message text not null,
  source text default 'general', -- 'general' or 'catering'
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable realtime
alter publication supabase_realtime add table public.contact_messages;

-- Allow public to insert (submit form) and admin to read
create policy "public insert contact" on public.contact_messages for insert to public with check (true);
create policy "public read contact" on public.contact_messages for all to public using (true) with check (true);
