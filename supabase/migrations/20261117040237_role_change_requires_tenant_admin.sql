BEGIN;

-- WP0 (#2672), audit finding A01: the role-change command.
--
-- The donor app's GraphQL mutation `updateUserRole` calls this function with
-- the service role key. Until now the function checked only that the target
-- profile was in the tenant, so any staff member could promote anyone,
-- themselves included, to the platform role `super_admin`.
--
-- The command now requires, in the database:
--   * the caller to be an administrator of the target tenant. Until WP2 moves
--     tenant administration to a flag on the staff membership, that is the
--     caller's own profile in this tenant with `profiles.role = 'admin'`. A
--     platform operator (`super_admin`) is not a tenant administrator;
--   * the new role to be a tenant role: donor, missionary, staff or admin.
--     A platform role, or any other value, is never granted;
--   * the target to be someone other than the caller;
--   * the target not to hold the platform role, which is not a tenant's to
--     change.
-- Every refusal raises SQLSTATE 42501 and changes nothing. The signature, the
-- not-found error (P0002), the audit row and the return value are unchanged.

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
       FROM public.profiles AS actor
       WHERE actor.user_id = p_actor_user_id
         AND actor.tenant_id = p_tenant_id
         AND actor.role = 'admin'
     ) THEN
    RAISE EXCEPTION 'Only an administrator of this organization can change roles'
      USING ERRCODE = '42501';
  END IF;

  IF p_new_role IS NULL
     OR p_new_role NOT IN ('donor', 'missionary', 'staff', 'admin') THEN
    RAISE EXCEPTION 'This role cannot be granted by an organization administrator'
      USING ERRCODE = '42501';
  END IF;

  SELECT id, user_id, role
  INTO v_profile_id, v_target_user_id, v_old_role
  FROM public.profiles
  WHERE id = p_profile_id
    AND tenant_id = p_tenant_id
  FOR UPDATE;

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

  UPDATE public.profiles
  SET role = p_new_role,
      updated_at = NOW()
  WHERE id = p_profile_id
    AND tenant_id = p_tenant_id;

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

REVOKE EXECUTE ON FUNCTION public.atomic_update_user_role_with_audit(UUID, UUID, UUID, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.atomic_update_user_role_with_audit(UUID, UUID, UUID, TEXT, TEXT, TEXT)
  TO service_role;

COMMIT;
