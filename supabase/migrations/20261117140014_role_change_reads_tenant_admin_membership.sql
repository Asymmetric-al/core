-- AL-2675 (WP2a, joined to stage 1; plan 12 WP0, first behaviour, and WP2a):
-- the role-change command reads the tenant-administrator membership.
--
-- WP0 (#2672, 20261117040237_role_change_requires_tenant_admin.sql) made
-- `public.atomic_update_user_role_with_audit` require that the caller is an
-- administrator of the target tenant, and said: "Until WP2 that check reads
-- `profiles.role`; WP2 moves it to the tenant-administrator membership."
-- This is that move. The command now requires, in the database:
--   * the caller to hold a live staff membership in the target tenant whose
--     capabilities include `people.manage_members` (plan 5.4: invite, change
--     role, revoke), judged by `authz.assignment_capabilities`, the database's
--     copy of the code registry, which gives it the tenant-administrator flag.
--     The caller's `profiles.role` is no longer read;
--   * the target to be a member of the tenant: a live membership there of its
--     login, not `profiles.tenant_id`, which a person in two organizations has
--     for one at most (NR-68). A target outside the tenant is still "not
--     found" (P0002);
--   * as before, the new role to be a tenant role (donor, missionary, staff or
--     admin), the target not to be the caller, and the target not to hold the
--     platform role. The platform role is still the target's `profiles.role =
--     'super_admin'` until WP2c's operator list replaces it.
--   * the target to be a live member of no tenant but this one (council round
--     1 on WP2a, F2). What the command writes is the person's one global
--     `profiles.role`, and the restricted-note policies on `crm_notes` still
--     admit `profiles.role IN ('admin', 'super_admin')` with no tenant
--     condition. Without this refusal an administrator of one tenant could
--     promote a person who also works in another tenant, who would then read
--     that tenant's restricted notes, or strip another tenant's administrator
--     of them. This refusal goes with the package that moves the note
--     policies off `profiles.role` (WP2b's second release) or the one that
--     deletes the mutation (WP2c), whichever comes first.
-- Every refusal raises 42501 and changes nothing. The signature, the audit row
-- and the return value are unchanged. What the command writes is unchanged
-- too: the target's `profiles.role`, which grants nothing since WP2a but the
-- note policies' read; setting or clearing the flag on a membership is plan
-- 5.4's role-change command.
--
-- The function becomes SECURITY DEFINER (owner postgres, empty search path) so
-- that it can read `authz.memberships` and call the capability function,
-- which only `tenant_guard` and the owner may execute; EXECUTE stays with
-- `service_role` alone, the GraphQL resolver's client.

BEGIN;

CREATE OR REPLACE FUNCTION public.atomic_update_user_role_with_audit(
  p_profile_id UUID,
  p_tenant_id UUID,
  p_actor_user_id UUID,
  p_new_role TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_profile_id UUID;
  v_target_user_id UUID;
  v_old_role TEXT;
BEGIN
  IF p_actor_user_id IS NULL
     OR p_tenant_id IS NULL
     OR NOT EXISTS (
       SELECT 1
       FROM authz.memberships AS actor
       WHERE actor.user_id = p_actor_user_id
         AND actor.tenant_id = p_tenant_id
         AND actor.role = 'staff'
         AND actor.is_active
         AND actor.revoked_at IS NULL
         AND 'people.manage_members' = ANY (authz.assignment_capabilities(actor.id))
     ) THEN
    RAISE EXCEPTION 'Only an administrator of this organization can change roles'
      USING ERRCODE = '42501';
  END IF;

  IF p_new_role IS NULL
     OR p_new_role NOT IN ('donor', 'missionary', 'staff', 'admin') THEN
    RAISE EXCEPTION 'This role cannot be granted by an organization administrator'
      USING ERRCODE = '42501';
  END IF;

  SELECT profile.id, profile.user_id, profile.role
  INTO v_profile_id, v_target_user_id, v_old_role
  FROM public.profiles AS profile
  WHERE profile.id = p_profile_id
    AND EXISTS (
      SELECT 1
      FROM authz.memberships AS member
      WHERE member.user_id = profile.user_id
        AND member.tenant_id = p_tenant_id
        AND member.is_active
        AND member.revoked_at IS NULL
    )
  FOR UPDATE OF profile;

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'User not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_target_user_id = p_actor_user_id THEN
    RAISE EXCEPTION 'Administrators cannot change their own role'
      USING ERRCODE = '42501';
  END IF;

  IF v_old_role = 'super_admin' THEN
    RAISE EXCEPTION 'A platform role cannot be changed by an organization administrator'
      USING ERRCODE = '42501';
  END IF;

  -- The role written is global: refuse a target who is a live member of any
  -- other tenant (F2).
  IF EXISTS (
    SELECT 1
    FROM authz.memberships AS elsewhere
    WHERE elsewhere.user_id = v_target_user_id
      AND elsewhere.tenant_id <> p_tenant_id
      AND elsewhere.is_active
      AND elsewhere.revoked_at IS NULL
  ) THEN
    RAISE EXCEPTION 'This person also belongs to another organization; their role cannot be changed here'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.profiles
  SET role = p_new_role,
      updated_at = NOW()
  WHERE id = p_profile_id;

  INSERT INTO public.audit_logs (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  )
  VALUES (
    p_tenant_id,
    p_actor_user_id,
    'role_change',
    'profile',
    p_profile_id::TEXT,
    jsonb_build_object('oldRole', v_old_role, 'newRole', p_new_role),
    p_ip_address,
    p_user_agent
  );

  RETURN jsonb_build_object('profile_id', p_profile_id, 'role', p_new_role);
END;
$function$;

COMMENT ON FUNCTION public.atomic_update_user_role_with_audit(UUID, UUID, UUID, TEXT, TEXT, TEXT) IS
  'Role change by a tenant administrator: the caller''s live staff membership '
  'in the tenant must hold people.manage_members, and the target must be a '
  'member there and of no other tenant, because the role written is global '
  '(WP0 A01; moved to membership by AL-2675).';

ALTER FUNCTION public.atomic_update_user_role_with_audit(UUID, UUID, UUID, TEXT, TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.atomic_update_user_role_with_audit(UUID, UUID, UUID, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.atomic_update_user_role_with_audit(UUID, UUID, UUID, TEXT, TEXT, TEXT)
  TO service_role;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
