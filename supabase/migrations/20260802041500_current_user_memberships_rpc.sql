-- Exposes the caller's own active memberships through the Data API.
--
-- The edge middleware resolves a signed-in user's role snapshot before it can
-- allow a protected route. `authz.memberships` holds that truth, but `authz` is
-- deliberately not in the PostgREST `db-schemas` list (`supabase/config.toml`
-- exposes only `public` and `graphql_public`), so a request-scoped client asking
-- for it gets PGRST106 back and the resolver fails closed -- which locks every
-- signed-in user out of every role-gated surface.
--
-- Widening `db-schemas` would fix it by publishing the whole authorization
-- schema, including its policy helpers. This narrow wrapper is the alternative:
-- one function, one tenant, rows for `auth.uid()` only.
--
-- SECURITY DEFINER is required because it reads across the RLS boundary, so the
-- `user_id = auth.uid()` predicate below is load-bearing -- it is the only thing
-- scoping the result to the caller. There is deliberately no user_id argument:
-- the edge cannot ask for anyone else's roles even if the caller is confused
-- about whose session it holds.

BEGIN;

CREATE OR REPLACE FUNCTION public.current_user_memberships(target_tenant UUID)
RETURNS TABLE (
  tenant_id UUID,
  role TEXT,
  staff_role TEXT,
  is_active BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    m.tenant_id,
    m.role::TEXT,
    m.staff_role::TEXT,
    m.is_active
  FROM authz.memberships m
  WHERE m.user_id = auth.uid()
    AND m.tenant_id = target_tenant
    AND m.is_active = true;
$$;

COMMENT ON FUNCTION public.current_user_memberships(UUID) IS
  'Active authz.memberships rows for the calling user in one tenant. The only '
  'Data API window onto the authz schema; see packages/auth/resolve-user-role.ts.';

REVOKE ALL ON FUNCTION public.current_user_memberships(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_memberships(UUID) TO authenticated;

COMMIT;

-- New function, so PostgREST will not route to it until its schema cache turns
-- over. Same pattern as 20260513173841_reload_postgrest_schema_for_phase_03.sql.
SELECT pg_notify('pgrst', 'reload schema');
