-- AL-2678 (WP5 rest, part B; issue 2835, the stale confirm). A confirm of a
-- worker's security level carries the level and its source as the staff
-- member read them, and writes nothing when another command changed either
-- since.
--
-- 1. tenant_guard.confirm_worker_security_level(tenant, Party, expected
--    level, expected source, reason): a human command owned by
--    tenant_guard, opening with begin_human_command(...,
--    'safety.restrict_publication'). It takes the organization's row FOR
--    SHARE, the caller's membership row FOR SHARE and the Party row FOR
--    UPDATE, in restrict_worker_publication's order. If the Party's level or
--    its source differs from the expected pair it raises 22023 "The level
--    changed since it was read" and writes nothing; otherwise it answers
--    tenant_guard.restrict_worker_publication(tenant, Party, the expected
--    level, no alias, no do-not-publish, reason), unchanged, which marks the
--    level reviewed and writes its one audit row. A Party that is not in the
--    organization is restrict's own refusal (P0002).
-- 2. public.confirm_worker_security_level, its invoker wrapper for the Data
--    API, owned by postgres. EXECUTE on both for authenticated only.
--
-- restrict_worker_publication keeps its signature and answers (invariant 3);
-- the route's confirm calls the new entry.
--
-- Locks at migration time: none on a table; the two functions are new.
--
-- What the running build does: nothing calls the new entry until the build
-- of this part ships.
--
-- Recovery. A run lost between its COMMIT and its ledger row stops on the
-- next run at its first CREATE (42723), rolling back. This file has
-- committed when this read-only check returns true (false before it):
-- Check begins
--   SELECT pg_catalog.to_regprocedure('tenant_guard.confirm_worker_security_level(uuid,uuid,text,text,text)') IS NOT NULL AS committed;
-- Check ends
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127090000.
--
-- Down (after the build that calls it is rolled back; one transaction):
-- Down begins
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   DROP FUNCTION public.confirm_worker_security_level(UUID, UUID, TEXT, TEXT, TEXT);
--   DROP FUNCTION tenant_guard.confirm_worker_security_level(UUID, UUID, TEXT, TEXT, TEXT);
--   COMMIT;
--   SELECT pg_notify('pgrst', 'reload schema');
-- Down ends

BEGIN;
SET LOCAL lock_timeout = '5s';

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
SET LOCAL ROLE tenant_guard;
CREATE FUNCTION tenant_guard.confirm_worker_security_level(
  p_tenant_id UUID,
  p_party_id UUID,
  p_expected_level TEXT,
  p_expected_source TEXT,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_level TEXT;
  v_source TEXT;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'safety.restrict_publication');

  PERFORM private.share_lock_tenant(v_ctx.tenant_id);
  PERFORM 1
     FROM authz.memberships AS m
    WHERE m.tenant_id = v_ctx.tenant_id
      AND m.id = v_ctx.assignment_id
      FOR SHARE;

  SELECT p.security_level, p.security_level_source
    INTO v_level, v_source
    FROM public.parties AS p
   WHERE p.tenant_id = v_ctx.tenant_id
     AND p.id = p_party_id
     FOR UPDATE;
  IF FOUND
     AND (v_level IS DISTINCT FROM p_expected_level
       OR v_source IS DISTINCT FROM p_expected_source) THEN
    RAISE EXCEPTION 'The level changed since it was read' USING ERRCODE = '22023';
  END IF;

  RETURN tenant_guard.restrict_worker_publication(
    v_ctx.tenant_id, p_party_id, p_expected_level, NULL, NULL, p_reason
  );
END;
$$;
COMMENT ON FUNCTION tenant_guard.confirm_worker_security_level(UUID, UUID, TEXT, TEXT, TEXT) IS
  'Human command (AL-2678, WP5 rest part B; issue 2835): confirms a worker''s security level only while the Party still holds the level and source the staff member read, checked under restrict_worker_publication''s locks; otherwise 22023 and nothing written. Needs safety.restrict_publication.';
-- Granted as its owner: on Supabase postgres is no superuser and cannot
-- change the grants of a function tenant_guard owns.
REVOKE ALL ON FUNCTION tenant_guard.confirm_worker_security_level(UUID, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.confirm_worker_security_level(UUID, UUID, TEXT, TEXT, TEXT) TO authenticated;
RESET ROLE;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE FUNCTION public.confirm_worker_security_level(
  p_tenant_id UUID,
  p_party_id UUID,
  p_expected_level TEXT,
  p_expected_source TEXT,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.confirm_worker_security_level(
    p_tenant_id, p_party_id, p_expected_level, p_expected_source, p_reason
  );
$$;
COMMENT ON FUNCTION public.confirm_worker_security_level(UUID, UUID, TEXT, TEXT, TEXT) IS
  'Wrapper of tenant_guard.confirm_worker_security_level for the Data API (AL-2678). Runs as the caller; EXECUTE for authenticated only.';
ALTER FUNCTION public.confirm_worker_security_level(UUID, UUID, TEXT, TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.confirm_worker_security_level(UUID, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.confirm_worker_security_level(UUID, UUID, TEXT, TEXT, TEXT) TO authenticated;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
