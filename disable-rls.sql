-- ==========================================
-- DISABLE RLS FOR PUBLIC ACCESS
-- ==========================================
-- We are building a mock/portfolio app without user auth enforcement yet.
-- To allow the Next.js frontend to fetch data cleanly using Anon Key:

alter table public.menu_items disable row level security;
alter table public.orders disable row level security;
alter table public.chats disable row level security;
