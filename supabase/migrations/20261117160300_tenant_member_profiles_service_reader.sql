-- AL-2675 (WP2a sweep; plan 12 WP2, the WP2a paragraph; audit NR-68): the
-- server code that runs with the service key and needs the people of one
-- tenant (its members, approvers, notification recipients, the authors and
-- assignees it shows) reads them from membership, never from
-- `profiles.tenant_id` or `profiles.role`. A profile holds one tenant at most
-- and a person may now hold memberships in two, so a profile filter would
-- miss the second tenant's members.
--
-- `public.tenant_member_profiles(tenant, profile_ids, user_ids, include_revoked,
-- role, tenant_admin, after_membership_id, limit)`
-- returns one row per membership of the tenant, joined to the member's
-- profile by login: live memberships only unless `include_revoked` asks for
-- the rows a tenant keeps as history (an author or requester shown on a
-- record). Either id list narrows the result, and so do a membership class
-- and the administrator flag, in SQL, so a caller asks only for the rows it
-- needs (council round 1 on WP2a, F7). Rows come in pages ordered by
-- membership id: at most `p_limit` (1,000 at most, the Data API's `max_rows`)
-- after `p_after_membership_id`, so a caller reads to the end page by page
-- and no result is cut silently. Invoker rights with an empty
-- search path (council round 1 on WP2a, F12): its only caller, the service
-- role, holds USAGE on `authz` and every right on `authz.memberships`
-- (20260226113000_authz_memberships_foundation.sql), SELECT on
-- `public.profiles` (hosted Supabase's default privileges), and bypasses row
-- security, so definer rights would add nothing. Executable by the service
-- role only (the member directory serves signed-in staff).

BEGIN;

CREATE FUNCTION public.tenant_member_profiles(
  p_tenant_id UUID,
  p_profile_ids UUID[] DEFAULT NULL,
  p_user_ids UUID[] DEFAULT NULL,
  p_include_revoked BOOLEAN DEFAULT false,
  p_role TEXT DEFAULT NULL,
  p_tenant_admin BOOLEAN DEFAULT NULL,
  p_after_membership_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 1000
)
RETURNS TABLE (
  membership_id UUID,
  user_id UUID,
  profile_id UUID,
  role TEXT,
  staff_role TEXT,
  is_tenant_admin BOOLEAN,
  is_live BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    m.id,
    m.user_id,
    p.id,
    m.role::TEXT,
    m.staff_role::TEXT,
    m.is_tenant_admin,
    m.is_active AND m.revoked_at IS NULL
  FROM authz.memberships AS m
  JOIN public.profiles AS p ON p.user_id = m.user_id
  WHERE m.tenant_id = p_tenant_id
    AND (p_include_revoked OR (m.is_active AND m.revoked_at IS NULL))
    AND (p_profile_ids IS NULL OR p.id = ANY (p_profile_ids))
    AND (p_user_ids IS NULL OR m.user_id = ANY (p_user_ids))
    AND (p_role IS NULL OR m.role::TEXT = p_role)
    AND (p_tenant_admin IS NULL OR m.is_tenant_admin = p_tenant_admin)
    AND (p_after_membership_id IS NULL OR m.id > p_after_membership_id)
  ORDER BY m.id
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 1000), 1), 1000);
$$;

COMMENT ON FUNCTION public.tenant_member_profiles(UUID, UUID[], UUID[], BOOLEAN, TEXT, BOOLEAN, UUID, INTEGER) IS
  'The memberships of one tenant joined to their profiles, for service-key '
  'server code (AL-2675, NR-68): never a filter on profiles.tenant_id or role. '
  'Paged by membership id, 1,000 rows at most per call.';

ALTER FUNCTION public.tenant_member_profiles(UUID, UUID[], UUID[], BOOLEAN, TEXT, BOOLEAN, UUID, INTEGER) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.tenant_member_profiles(UUID, UUID[], UUID[], BOOLEAN, TEXT, BOOLEAN, UUID, INTEGER)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.tenant_member_profiles(UUID, UUID[], UUID[], BOOLEAN, TEXT, BOOLEAN, UUID, INTEGER)
  TO service_role;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
