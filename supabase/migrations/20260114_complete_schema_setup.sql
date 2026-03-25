-- ==============================================================================
-- Locator-X Master Migration Script
-- Version: 1.0.0
-- Date: 2026-01-14
-- Description: Sets up the entire database schema for Locator-X.
-- Includes: Profiles, Storage (Avatars), Teams, Team Members, Invitations, Promo Codes.
-- Idempotent: Can be run multiple times safely (IF NOT EXISTS checks).
-- ==============================================================================

-- 1. SETUP EXTENSIONS & TYPES
-- ==========================================

-- Enable pgcrypto for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUMs safely
DO $$ BEGIN
    CREATE TYPE public.team_role AS ENUM ('admin', 'member', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 2. PROFILES & USER MANAGEMENT
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Profile Functions & Triggers
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 3. STORAGE (AVATARS)
-- ==========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Drop first to avoid conflicts on re-run)
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- ==========================================
-- 4. TEAMS & COLLABORATION
-- ==========================================

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 1,
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'INR')),
  total_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role team_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role team_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL,
  status invitation_status NOT NULL DEFAULT 'pending',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE(team_id, email)
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Team Triggers
DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 5. TEAM PLAN SYNC LOGIC (The New Logic)
-- ==========================================

CREATE OR REPLACE FUNCTION public.sync_team_member_plan()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    curr_user_id UUID;
    has_active_team BOOLEAN;
    new_plan TEXT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        curr_user_id := OLD.user_id;
    ELSE
        curr_user_id := NEW.user_id;
    END IF;

    -- Check if user is in any team
    SELECT EXISTS (SELECT 1 FROM public.team_members WHERE user_id = curr_user_id) INTO has_active_team;

    -- Check if user owns any team
    IF NOT has_active_team THEN
        SELECT EXISTS (SELECT 1 FROM public.teams WHERE owner_id = curr_user_id) INTO has_active_team;
    END IF;

    IF has_active_team THEN new_plan := 'team'; ELSE new_plan := 'free'; END IF;

    UPDATE public.profiles SET plan = new_plan, updated_at = now() WHERE user_id = curr_user_id;
    
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('plan', new_plan)
    WHERE id = curr_user_id;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_team_member_change ON public.team_members;
CREATE TRIGGER on_team_member_change
    AFTER INSERT OR DELETE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION public.sync_team_member_plan();


-- ==========================================
-- 6. PROMO CODES
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

-- Insert default promo codes if they don't exist
INSERT INTO public.promo_codes (code, discount_type, discount_value, max_uses, allowed_plans)
VALUES ('FLASH50', 'percent', 50, 100, ARRAY['Pro', 'Team'])
ON CONFLICT (code) DO NOTHING;
