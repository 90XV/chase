-- 1. Storage Policies for 'payment-proofs' bucket
-- Note: Replace 'payment-proofs' with your actual bucket name if different.

-- Allow anyone to upload a proof
CREATE POLICY "Allow public upload" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'payment-proofs');

-- Allow anyone to view proofs (so admins can see them)
CREATE POLICY "Allow public view" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'payment-proofs');

-- 2. Fix Orders Update Policy
-- Customers need to be able to UPDATE their order to add the payment_proof link.
-- We'll allow any update for now, or specifically for the payment_proof column.
DROP POLICY IF EXISTS "Customers can update their own orders" ON orders;
CREATE POLICY "Anyone can update orders with proof" 
ON orders FOR UPDATE 
TO public 
USING (true) 
WITH CHECK (true);

-- 3. Ensure the bucket exists (cannot be done via SQL easily, but useful note)
-- Ensure 'payment-proofs' bucket is created in the Supabase Dashboard.
