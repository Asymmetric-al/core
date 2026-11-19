-- AL-2675 (WP2b, first release, slice A; plan 5.2; decision D-26 as the
-- coordinator's ruling amends it): the organization chooser names each of the
-- signed-in person's organizations, on their own token.
--
-- Signed-in users cannot read `public.tenants`, so the chooser showed a short
-- form of each tenant id, or a name a Mission Control server reader fetched
-- with the service key. `public.current_user_organizations()` returns the id
-- and name of each tenant in which the session caller holds a live (not
-- revoked) membership row, once, and nothing for any other tenant or for a
-- request with no session caller. It is a function of its own, not a column
-- of `public.current_user_assignments()`: the resolver reads that one on
-- every request, and only the chooser needs a name.
--
-- Definer rights, because the caller has no privilege on `public.tenants`;
-- owned by postgres, with an empty search path, and executable by
-- `authenticated` only. Every other role is revoked by name, since hosted
-- default privileges grant EXECUTE on new `public` functions to `anon`,
-- `authenticated` and `service_role` (docs/security/function-execute-grants.md).
--
-- Down (run by hand): DROP FUNCTION public.current_user_organizations();

BEGIN;

CREATE OR REPLACE FUNCTION public.current_user_organizations()
RETURNS TABLE (
  tenant_id UUID,
  name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT t.id, t.name
  FROM public.tenants t
  WHERE EXISTS (
    SELECT 1
    FROM authz.memberships m
    WHERE m.tenant_id = t.id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.revoked_at IS NULL
  )
  ORDER BY t.id;
$$;

COMMENT ON FUNCTION public.current_user_organizations() IS
  'The id and name of each tenant in which the calling user holds a live '
  'membership row, for the organization chooser (AL-2675). Definer rights; '
  'the caller sees only its own organizations.';

ALTER FUNCTION public.current_user_organizations() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.current_user_organizations() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_organizations() TO authenticated;

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;
