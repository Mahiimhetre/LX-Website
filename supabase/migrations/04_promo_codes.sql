-- ==========================================
-- 4. PROMO CODES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'flat')),
  discount_value numeric not null,
  valid_from timestamptz,
  valid_until timestamptz,
  max_uses int,
  current_uses int default 0,
  is_active boolean default true,
  specific_user_id uuid references auth.users(id),
  allowed_plans text[], 
  created_at timestamptz default now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.promo_codes;
CREATE POLICY "Enable read access for all users" ON public.promo_codes FOR SELECT USING (true);

-- Functions
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_code text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.promo_codes SET current_uses = current_uses + 1 WHERE code = promo_code;
END;
$$;

CREATE OR REPLACE FUNCTION generate_user_promo_after_trial()
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  current_user_id uuid;
  user_created_at timestamptz;
  trial_end_date timestamptz;
  existing_code text;
  new_code text;
  new_code_id uuid;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN RETURN json_build_object('success', false, 'message', 'Not logged in'); END IF;

  SELECT created_at INTO user_created_at FROM auth.users WHERE id = current_user_id;
  trial_end_date := user_created_at + interval '7 days';

  IF now() < trial_end_date THEN
     RETURN json_build_object('success', false, 'message', 'Trial still active');
  END IF;

  SELECT code INTO existing_code FROM public.promo_codes 
  WHERE specific_user_id = current_user_id AND created_at > trial_end_date;

  IF existing_code IS NOT NULL THEN
     RETURN json_build_object('success', true, 'code', existing_code, 'message', 'Code already exists');
  END IF;

  new_code := 'OFFER-' || substring(md5(random()::text) from 1 for 6);
  
  INSERT INTO public.promo_codes (code, discount_type, discount_value, valid_until, max_uses, specific_user_id, is_active, allowed_plans)
  VALUES (upper(new_code), 'percent', 20, now() + interval '24 hours', 1, current_user_id, true, ARRAY['Pro', 'Team']) 
  RETURNING id INTO new_code_id;

  RETURN json_build_object('success', true, 'code', upper(new_code));
END;
$$;

-- Seed Data
INSERT INTO public.promo_codes (code, discount_type, discount_value, max_uses, allowed_plans)
VALUES ('FLASH50', 'percent', 50, 100, ARRAY['Pro', 'Team'])
ON CONFLICT (code) DO NOTHING;
