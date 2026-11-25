-- AL-2676: require the request's organization (`x-asym-tenant`) in
-- `authz.caller_assignment`.
--
-- Replaces:
--   - `authz.caller_assignment(uuid, authz.membership_role)` from
--     `supabase/migrations/20261120130001_tenant_status_membership.sql:75-116`
--     (changes `IF v_tenant IS NOT NULL AND v_tenant <> p_tenant_id THEN` at
--     line 96 to `IF v_tenant IS NULL OR v_tenant <> p_tenant_id THEN`, keeping
--     `RETURNS UUID`, `LANGUAGE plpgsql`, `STABLE`, `SECURITY INVOKER`,
--     `SET search_path = ''`, the `DECLARE` order, owner `postgres`, and
--     `EXECUTE` for `postgres` only).
--   - `COMMENT ON FUNCTION authz.caller_assignment(UUID, authz.membership_role)`
--     from
--     `supabase/migrations/20261117160200_membership_readers_and_member_directory.sql:101-103`.
--
-- Down (run by hand, in one transaction):
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   -- 1. Restore `authz.caller_assignment(uuid, authz.membership_role)` with
--   --    `CREATE OR REPLACE FUNCTION` verbatim from
--   --    `supabase/migrations/20261120130001_tenant_status_membership.sql:75-116`.
--   -- 2. Restore `COMMENT ON FUNCTION authz.caller_assignment(UUID, authz.membership_role)`
--   --    verbatim from
--   --    `supabase/migrations/20261117160200_membership_readers_and_member_directory.sql:101-103`.
--   COMMIT;

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE OR REPLACE FUNCTION authz.caller_assignment(
  p_tenant_id UUID,
  p_role authz.membership_role
)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_tenant UUID := authz.request_tenant_id();
  v_named UUID := tenant_guard.request_assignment_id();
  v_id UUID;
  v_role authz.membership_role;
  v_rows BIGINT;
BEGIN
  IF v_user IS NULL OR p_tenant_id IS NULL OR p_role IS NULL THEN
    RETURN NULL;
  END IF;
  IF v_tenant IS NULL OR v_tenant <> p_tenant_id THEN
    RETURN NULL;
  END IF;

  SELECT m.id, m.role, pg_catalog.count(*) OVER ()
    INTO v_id, v_role, v_rows
    FROM authz.memberships AS m
    JOIN public.tenants AS t ON t.id = m.tenant_id AND t.status = 'active'
   WHERE m.user_id = v_user
     AND m.tenant_id = p_tenant_id
     AND m.is_active
     AND m.revoked_at IS NULL
     AND (v_named IS NULL OR m.id = v_named)
   LIMIT 1;

  IF v_rows IS DISTINCT FROM 1 OR v_role IS DISTINCT FROM p_role THEN
    RETURN NULL;
  END IF;
  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION authz.caller_assignment(UUID, authz.membership_role) IS
  'The caller''s selected live membership row of one class in an active tenant, '
  'only when the request''s x-asym-tenant header names that tenant: the row '
  'x-asym-assignment names, or the caller''s one live row of any class there '
  '(AL-2676).';

REVOKE ALL ON FUNCTION authz.caller_assignment(UUID, authz.membership_role)
  FROM PUBLIC, anon, authenticated, service_role;

COMMIT;
