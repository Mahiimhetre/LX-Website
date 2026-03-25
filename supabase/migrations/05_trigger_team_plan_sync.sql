-- ==========================================
-- 5. TEAM PLAN SYNC LOGIC
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
