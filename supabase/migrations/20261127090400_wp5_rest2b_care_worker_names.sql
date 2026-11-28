-- AL-2678 (WP5 rest, part B; brief stage5/wp5-rest.md, pull request 2,
-- outcome 4 and invariant 12). Care's directory names a worker with no
-- login by the Party's display name.
--
-- public.member_care_directory_rows: its text from 20261124010000 with one
-- join and one column changed. A worker row with no profile (no login, or a
-- login whose profile row is missing) answers display_name from its Party's
-- display_name; first_name, last_name, full_name and avatar_url stay NULL.
-- A worker with a profile answers exactly as before. The care.access gate,
-- the tenant check, the columns, the order, the limit, owner and grants are
-- unchanged; no one gains a column (WP4b).
--
-- Locks at migration time: an object lock on the replaced function only.
-- lock_timeout stops a run rather than queue it.
--
-- What the running build does: Care's directory shows a worker with no login
-- by its name where it showed "Name not set".
--
-- Recovery. Every statement is CREATE OR REPLACE or COMMENT and runs again
-- unchanged. This file has committed when this read-only check returns true
-- (false before it, never an error):
-- Check begins
--   SELECT pg_catalog.strpos(pg_catalog.pg_get_functiondef('public.member_care_directory_rows(uuid,uuid,integer)'::pg_catalog.regprocedure), 'public.parties') > 0 AS committed;
-- Check ends
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127090400.
--
-- Down (one transaction): the reader's text and comment from 20261124010000.
-- Down begins
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   \lines 56-137 of 20261124010000_member_care_rls_and_directory_reader.sql
--   COMMIT;
--   SELECT pg_notify('pgrst', 'reload schema');
-- Down ends

BEGIN;
SET LOCAL lock_timeout = '5s';

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
      CASE WHEN p.id IS NULL THEN pa.display_name ELSE p.display_name END,
      p.avatar_url,
      pg_catalog.count(*) OVER ()::BIGINT AS total_count
    FROM public.missionaries AS m
    LEFT JOIN public.profiles AS p
      ON p.id = m.profile_id
    LEFT JOIN public.parties AS pa
      ON pa.tenant_id = m.tenant_id
     AND pa.id = m.party_id
    WHERE m.tenant_id = p_tenant_id
      AND (p_personnel_id IS NULL OR m.id = p_personnel_id)
    ORDER BY m.created_at DESC, m.id DESC
    LIMIT v_limit;
END;
$$;

COMMENT ON FUNCTION public.member_care_directory_rows(UUID, UUID, INTEGER) IS
  'Member Care directory and detail reader (AL-2677 WP4b part 1; W4b-R4; AL-2678 WP5 rest part B). '
  'Requires active tenant scope matching p_tenant_id and care.access on the '
  'selected assignment; returns 0 rows and no count otherwise. A worker with no '
  'profile row is named by its Party''s display_name.';

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
