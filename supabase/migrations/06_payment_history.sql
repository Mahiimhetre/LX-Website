-- Add billing_expiry_date to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS billing_expiry_date TIMESTAMP WITH TIME ZONE;

-- Create payment_history table
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL UNIQUE,
  payment_id TEXT,
  amount BIGINT NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, captured, failed
  plan_name TEXT NOT NULL,
  expiry_extension_days INTEGER DEFAULT 30,
  notes JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for payment_history
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payment history
DROP POLICY IF EXISTS "Users can view their own payment history" ON public.payment_history;
CREATE POLICY "Users can view their own payment history" ON public.payment_history 
FOR SELECT USING (auth.uid() = user_id);

-- Add updated_at trigger for payment_history
CREATE TRIGGER update_payment_history_updated_at
  BEFORE UPDATE ON public.payment_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
