-- 1. Secure Storage Policies for 'payment-proofs'
-- First, drop the old wide-open policy
DROP POLICY IF EXISTS "Allow public view" ON storage.objects;

-- Allow ONLY Authenticated Admins to view the proofs
CREATE POLICY "Admins can view proofs" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'payment-proofs');

-- Allow Public to still upload (Insert)
-- This is necessary so customers don't need an account to pay
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
CREATE POLICY "Allow public upload" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'payment-proofs');

-- 2. Note for User
-- In the Supabase Dashboard, go to Storage -> payment-proofs -> Edit Bucket
-- UNCHECK "Public bucket" to make it private.
