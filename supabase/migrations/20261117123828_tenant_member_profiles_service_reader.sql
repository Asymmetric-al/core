-- AL-2675 (WP2a sweep; plan 12 WP2, the WP2a paragraph; audit NR-68): the
-- server code that runs with the service key and needs the people of one
-- tenant (its members, approvers, notification recipients, the authors and
-- assignees it shows) reads them from membership, never from
-- `profiles.tenant_id` or `profiles.role`. A profile holds one tenant at most
-- and a person may now hold memberships in two, so a profile filter would
-- miss the second tenant's members.
--
-- `public.tenant_member_profiles(tenant, profile_ids, user_ids, include_revoked)`
-- returns one row per membership of the tenant, joined to the member's
-- profile by login: live memberships only unless `include_revoked` asks for
-- the rows a tenant keeps as history (an author or requester shown on a
-- record). Either id list narrows the result. Definer rights with an empty
-- search path; executable by the service role only, which is the only caller
-- (the member directory serves signed-in staff).

BEGIN;

CREATE FUNCTION public.tenant_member_profiles(
  p_tenant_id UUID,
  p_profile_ids UUID[] DEFAULT NULL,
  p_user_ids UUID[] DEFAULT NULL,
  p_include_revoked BOOLEAN DEFAULT false
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
SECURITY DEFINER
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
  ORDER BY p.id, m.role, m.staff_role, m.id;
$$;

COMMENT ON FUNCTION public.tenant_member_profiles(UUID, UUID[], UUID[], BOOLEAN) IS
  'The memberships of one tenant joined to their profiles, for service-key '
  'server code (AL-2675, NR-68): never a filter on profiles.tenant_id or role.';

ALTER FUNCTION public.tenant_member_profiles(UUID, UUID[], UUID[], BOOLEAN) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.tenant_member_profiles(UUID, UUID[], UUID[], BOOLEAN)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.tenant_member_profiles(UUID, UUID[], UUID[], BOOLEAN)
  TO service_role;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
