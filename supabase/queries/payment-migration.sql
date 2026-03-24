-- Add payment columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cash';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_proof text; -- URL to uploaded screenshot

-- Update status defaults and constraints if needed
-- Status flow: Pending Confirmation -> Preparing -> Ready -> Completed
COMMENT ON COLUMN public.orders.status IS 'Status flow: Pending Confirmation, Preparing, Ready, In Delivery, Completed, Cancelled';
