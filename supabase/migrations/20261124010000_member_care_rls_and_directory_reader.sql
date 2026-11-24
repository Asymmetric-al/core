-- AL-2677 (WP4b part 1; rulings W4b-R1, W4b-R4, W4b-R13, W4b-R17):
-- 1. Narrow SELECT policies on all four member_care_* tables to the active
--    member_care staff sub-role and drop the legacy (SELECT authz.is_super_admin())
--    branch (narrow transfer from WP2c part 3 authorized by W4b-R1).
--    member_care_private_notes keeps author_user_id = (SELECT authz.current_user_id()).
-- 2. Add tenant-first indexes for the member care directory and dashboard reads.
--    Note: SET LOCAL lock_timeout = '5s' bounds waiting to acquire locks, not
--    index-build duration after lock acquisition (W4b-R13).
-- 3. Add public.member_care_directory_rows, the single postgres-owned SECURITY
--    DEFINER directory reader gated on active tenant scope and care.access,
--    using LEFT JOIN public.profiles so workers without a profile row remain
--    visible in the directory and total_count (W4b-R4).
--
-- Down (run by hand, in one transaction):
--   DROP FUNCTION IF EXISTS public.member_care_directory_rows(UUID, UUID, INTEGER);
--   DROP INDEX IF EXISTS public.idx_member_care_activities_tenant_occurred_at;
--   DROP INDEX IF EXISTS public.idx_missionaries_tenant_created_at_id;
--   Restore the four member_care_* SELECT policies from
--   20261119135300_request_tenant_policies.sql.

BEGIN;

SET LOCAL lock_timeout = '5s';

ALTER POLICY "member care activities select" ON public.member_care_activities
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'::authz.membership_role, ARRAY['member_care']::authz.staff_role[]))
  );

ALTER POLICY "member care goals select" ON public.member_care_goals
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'::authz.membership_role, ARRAY['member_care']::authz.staff_role[]))
  );

ALTER POLICY "member care requirements select" ON public.member_care_requirements
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'::authz.membership_role, ARRAY['member_care']::authz.staff_role[]))
  );

ALTER POLICY "member care private notes select" ON public.member_care_private_notes
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'::authz.membership_role, ARRAY['member_care']::authz.staff_role[]))
    AND author_user_id = (SELECT authz.current_user_id())
  );

CREATE INDEX IF NOT EXISTS idx_missionaries_tenant_created_at_id
  ON public.missionaries (tenant_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_member_care_activities_tenant_occurred_at
  ON public.member_care_activities (tenant_id, occurred_at DESC);

CREATE OR REPLACE FUNCTION public.member_care_directory_rows(
  p_tenant_id UUID,
  p_personnel_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 250
)
RETURNS TABLE (
  id UUID,
  location TEXT,
  timezone TEXT,
  health_status TEXT,
  last_check_in TIMESTAMPTZ,
  manual_attention BOOLEAN,
  region TEXT,
  mission_field TEXT,
  health_signals JSONB,
  birth_date DATE,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_tenant UUID;
  v_has_care BOOLEAN;
  v_limit INTEGER;
BEGIN
  IF p_tenant_id IS NULL THEN
    RETURN;
  END IF;

  BEGIN
    v_current_tenant := authz.current_tenant_id();
    v_has_care := authz.assignment_holds('care.access');
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN;
  END;

  IF v_current_tenant IS DISTINCT FROM p_tenant_id OR v_has_care IS NOT TRUE THEN
    RETURN;
  END IF;

  v_limit := LEAST(GREATEST(COALESCE(p_limit, 250), 1), 250);

  RETURN QUERY
    SELECT
      m.id,
      m.location,
      m.timezone,
      m.health_status,
      m.last_check_in,
      m.manual_attention,
      m.region,
      m.mission_field,
      m.health_signals,
      m.birth_date,
      p.first_name,
      p.last_name,
      p.full_name,
      p.display_name,
      p.avatar_url,
      pg_catalog.count(*) OVER ()::BIGINT AS total_count
    FROM public.missionaries AS m
    LEFT JOIN public.profiles AS p
      ON p.id = m.profile_id
    WHERE m.tenant_id = p_tenant_id
      AND (p_personnel_id IS NULL OR m.id = p_personnel_id)
    ORDER BY m.created_at DESC, m.id DESC
    LIMIT v_limit;
END;
$$;

COMMENT ON FUNCTION public.member_care_directory_rows(UUID, UUID, INTEGER) IS
  'Member Care directory and detail reader (AL-2677 WP4b part 1; W4b-R4). '
  'Requires active tenant scope matching p_tenant_id and care.access on the '
  'selected assignment; returns 0 rows and no count otherwise.';

ALTER FUNCTION public.member_care_directory_rows(UUID, UUID, INTEGER) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.member_care_directory_rows(UUID, UUID, INTEGER)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.member_care_directory_rows(UUID, UUID, INTEGER) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
