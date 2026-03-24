-- Bypass RLS completely for our 3 tables by creating an "allow all" policy.
-- This guarantees the frontend can instantly Read, Insert, and Update data.

create policy "public all menu" on public.menu_items for all to public using (true) with check (true);
create policy "public all orders" on public.orders for all to public using (true) with check (true);
create policy "public all chats" on public.chats for all to public using (true) with check (true);
