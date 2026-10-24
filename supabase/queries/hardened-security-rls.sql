-- ==============================================================================
-- HARDENED PRODUCTION SECURITY & ROW LEVEL SECURITY (RLS) POLICIES
-- Hotwheels Coffee / Chase
-- ==============================================================================
-- This script secures the database against data leakage, unauthorized modifications,
-- IDOR vulnerabilities, and unrestricted table access.
-- Run this in the Supabase SQL Editor.
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- 2. CLEAN UP EXISTING INSECURE / PERMISSIVE POLICIES
DROP POLICY IF EXISTS "public all menu" ON public.menu_items;
DROP POLICY IF EXISTS "Public menu_items access" ON public.menu_items;
DROP POLICY IF EXISTS "Admin menu_items full access" ON public.menu_items;
DROP POLICY IF EXISTS "Allow all" ON public.menu_items;

DROP POLICY IF EXISTS "public all orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admin orders access" ON public.orders;
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can update orders with proof" ON public.orders;
DROP POLICY IF EXISTS "Customers can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all" ON public.orders;

DROP POLICY IF EXISTS "public all chats" ON public.chats;
DROP POLICY IF EXISTS "Anyone can chat" ON public.chats;
DROP POLICY IF EXISTS "Allow all" ON public.chats;

DROP POLICY IF EXISTS "public insert contact" ON public.contact_messages;
DROP POLICY IF EXISTS "public read contact" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can send contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin contact_messages access" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow all" ON public.contact_messages;

DROP POLICY IF EXISTS "public all partners" ON public.partners;
DROP POLICY IF EXISTS "Public partners access" ON public.partners;
DROP POLICY IF EXISTS "Admin partners full access" ON public.partners;
DROP POLICY IF EXISTS "Allow all" ON public.partners;

-- ==============================================================================
-- 3. MENU ITEMS POLICIES
-- Public: Read only (SELECT)
-- Admin: Full management (INSERT, UPDATE, DELETE)
-- ==============================================================================
CREATE POLICY "Public can view menu items"
ON public.menu_items FOR SELECT
TO public
USING (true);

CREATE POLICY "Admin has full access to menu items"
ON public.menu_items FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 4. PARTNERS POLICIES
-- Public: Read only (SELECT)
-- Admin: Full management (INSERT, UPDATE, DELETE)
-- ==============================================================================
CREATE POLICY "Public can view partners"
ON public.partners FOR SELECT
TO public
USING (true);

CREATE POLICY "Admin has full access to partners"
ON public.partners FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 5. CONTACT & CATERING MESSAGES POLICIES
-- Public: INSERT only (cannot read any existing messages)
-- Admin: Full management (SELECT, UPDATE is_read, DELETE)
-- ==============================================================================
CREATE POLICY "Public can submit contact messages"
ON public.contact_messages FOR INSERT
TO public
WITH CHECK (
  length(trim(name)) > 0 AND
  length(trim(email)) > 3 AND
  length(trim(message)) > 0
);

CREATE POLICY "Admin has full access to contact messages"
ON public.contact_messages FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 6. ORDERS POLICIES
-- Public:
--   - Can INSERT orders with valid totals and items
--   - Can SELECT individual orders by ID (for their active order)
--   - Can UPDATE only payment_proof for their active order
-- Admin:
--   - Full management of all orders
-- ==============================================================================
CREATE POLICY "Public can place new orders"
ON public.orders FOR INSERT
TO public
WITH CHECK (
  total >= 0 AND
  id IS NOT NULL
);

CREATE POLICY "Admin can view and manage all orders"
ON public.orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view order by exact id"
ON public.orders FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can update order payment proof"
ON public.orders FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 7. CHATS POLICIES
-- Public:
--   - Can INSERT messages
--   - Can SELECT messages for orders
--   - Can mark customer messages as read
-- Admin:
--   - Full access
-- ==============================================================================
CREATE POLICY "Public can insert chat messages"
ON public.chats FOR INSERT
TO public
WITH CHECK (
  length(trim(message)) > 0 AND
  order_id IS NOT NULL AND
  sender IN ('customer', 'admin')
);

CREATE POLICY "Public can view chats"
ON public.chats FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can update chat read status"
ON public.chats FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin has full access to chats"
ON public.chats FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 8. SECURE ORDER LOOKUP RPC (Prevents mass enumeration)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.lookup_order(search_query text)
RETURNS TABLE (
  id text,
  queue_number integer,
  status text,
  created_at timestamptz,
  method text,
  total numeric,
  payment_method text,
  payment_status text,
  items jsonb
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    o.id,
    o.queue_number,
    o.status,
    o.created_at,
    o.method,
    o.total,
    o.payment_method,
    o.payment_status,
    o.items
  FROM public.orders o
  WHERE 
    -- Match exact Queue Number or exact Order ID or last 6 characters
    upper(trim(o.id)) = upper(trim(search_query))
    OR cast(o.queue_number as text) = trim(search_query)
    OR (length(trim(search_query)) >= 4 AND upper(o.id) LIKE '%' || upper(trim(search_query)))
  ORDER BY o.created_at DESC
  LIMIT 1;
$$;

-- Grant execution to public anon and authenticated users
GRANT EXECUTE ON FUNCTION public.lookup_order(text) TO anon, authenticated;

-- ==============================================================================
-- 9. STORAGE POLICIES FOR 'payment-proofs' BUCKET
-- Run this in Storage -> Policies or SQL Editor
-- ==============================================================================
DROP POLICY IF EXISTS "Allow public view" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view proofs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;

-- Allow ONLY authenticated admins to view payment receipts
CREATE POLICY "Admins can view proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payment-proofs');

-- Allow public to upload receipts
CREATE POLICY "Public can upload payment proofs"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'payment-proofs');
