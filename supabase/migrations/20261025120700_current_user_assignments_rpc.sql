-- #2258 (Phase 12 T4 slice (a)): the caller's own active memberships, every
-- tenant, as the membership reader port behind `resolveActiveAssignment`
-- (packages/api/src/principal). Preparation only: nothing calls it yet.
--
-- `authz` is not exposed through the Data API, so the principal layer reads
-- the hat candidates through this one function. It runs with invoker rights:
-- the existing `authz` USAGE grant, the SELECT grant on `authz.memberships`
-- and its "select own" RLS policy already let `authenticated` read these rows,
-- so the function widens nothing. The `user_id = auth.uid()` predicate keeps
-- the result to the caller even so. There is deliberately no user id argument
-- and no tenant input: the resolver, not the database, picks the hat, and no
-- login-token tenant claim is consulted.
--
-- `user_id` is returned so the resolver can reject rows for any other subject
-- (a confused session). `updated_at` is the opaque assignment revision until
-- #670 supplies an epoch. No table, column or setting stores an active hat.
--
-- Grants are revoked by name (docs/security/function-execute-grants.md) so a
-- hosted default grant to anon or service_role cannot survive the COMMIT.
-- `public.current_user_memberships(uuid)` is unchanged.
-- Rollback: rollback_20261025120700_current_user_assignments_rpc.sql.

BEGIN;

CREATE OR REPLACE FUNCTION public.current_user_assignments()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  tenant_id UUID,
  role TEXT,
  staff_role TEXT,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    m.id,
    m.user_id,
    m.tenant_id,
    m.role::TEXT,
    m.staff_role::TEXT,
    m.updated_at
  FROM authz.memberships m
  WHERE m.user_id = auth.uid()
    AND m.is_active = true
  ORDER BY m.tenant_id, m.id;
$$;

COMMENT ON FUNCTION public.current_user_assignments() IS
  'Active authz.memberships rows of the calling user across all tenants, for '
  'the principal layer''s active-assignment resolver (#2258). Invoker rights; '
  'see packages/api/src/principal/reader.ts.';

REVOKE ALL ON FUNCTION public.current_user_assignments() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_assignments() TO authenticated;

COMMIT;

-- New function, so PostgREST will not route to it until its schema cache turns
-- over. Same pattern as 20260802041500_current_user_memberships_rpc.sql.
SELECT pg_notify('pgrst', 'reload schema');
