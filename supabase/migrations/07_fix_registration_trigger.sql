-- Migration: Fix Registration Trigger and Sync Existing
-- Created: 2026-02-15

-- 1. RE-CREATE THE FUNCTION (Ensures latest logic)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, avatar_url, plan)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url',
    COALESCE(NEW.raw_user_meta_data ->> 'plan', 'free')
  ) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. RE-CREATE THE TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. FIX MISSING PROFILES (Retroactive Sync)
INSERT INTO public.profiles (user_id, name, email, avatar_url, plan)
SELECT 
    id, 
    COALESCE(raw_user_meta_data ->> 'name', raw_user_meta_data ->> 'full_name', ''),
    email,
    raw_user_meta_data ->> 'avatar_url',
    COALESCE(raw_user_meta_data ->> 'plan', 'free')
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
