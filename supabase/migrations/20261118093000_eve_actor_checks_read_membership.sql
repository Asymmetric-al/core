-- AL-2675 (WP2a; council round 2 on WP2a, R1; plan 5.1, 5.5 and 7.4): the SQL
-- that re-checks an actor the application hands it reads membership, as the
-- application does since WP2a.
--
-- Since WP2a the application resolves a person's authority from a live
-- membership row: the tenant is that row's tenant, and the actor role it sends
-- is `admin` for a staff row with the tenant-administrator flag and the class
-- (`staff`, `donor`, `missionary`) otherwise; it never sends `super_admin`
-- until WP2c's operator list. Five functions still judged that actor by the
-- profile (`profiles.role`, `profiles.tenant_id`), so they refused people the
-- application admits: everyone whose profile role is `super_admin` (the people
-- who run Eve today), an administrator whose profile role is not `admin`, and
-- anyone whose profile's tenant column names another tenant or none.
-- Emergency off, the first step of the Eve incident guide, raised
-- `eve_launch_profile_tenant_mismatch` for them.
--
-- Each function keeps its signature, security mode, search path, owner,
-- grants and error names; only the test changes. "A live row" is an
-- `authz.memberships` row that is active and not revoked, of the profile's
-- login, in the tenant given.
--
-- 1. `public.assert_eve_launch_profile(tenant, profile, required_role)`, from
--    `set_eve_release_safety_control` and `create_eve_launch_manifest` (the
--    application's actor role): `admin` needs a live staff row with the
--    flag; `staff`, `donor` or `missionary` a live row of that class; no role
--    any live row. It checked the profile's tenant and role.
-- 2. `public.assert_eve_retention_actor(tenant, actor, actor_role)`, from
--    setting and clearing a retention hold and storing a replay artifact:
--    `admin` needs a live staff row with the flag. It checked the role name
--    and the profile's tenant. A call with any other role, or none, is
--    refused (the old test let a missing role through when the profile named
--    the tenant; no caller sends one).
-- 3. `public.assert_eve_policy_actor_tenant(tenant, actor)`, from requesting
--    and deciding an Eve policy approval and the budget emergency override:
--    a live row in the tenant. It checked the profile's tenant.
-- 4. `public.assert_eve_admin_memory_owner(tenant, owner)`, from the four
--    assistant-memory commands: a live row in the tenant, as the route
--    already tests in the application. It checked the profile's tenant.
-- 5. `public.atomic_update_profile_with_audit(profile, tenant, ...)`, from
--    GraphQL `updateMyProfile`: the profile is updated when its login holds a
--    live row in the tenant. It matched the profile's tenant column, so a
--    person whose profile names another tenant could not edit their own name.
--
-- The `super_admin` actor case of 1, 2 and 3 stays exactly as it was (the
-- profile's role and tenant): no application path sends that actor until
-- WP2c, which replaces it with the operator list.
--
-- Not changed here, and why (the decision table, section 7, lists every
-- function of the sweep):
-- - `public.validate_eve_notification_recipient` (trigger) admits only a
--   `super_admin` profile of the tenant; its only writer, the notification
--   recipient PATCH, is closed until WP2c.
-- - `public.enforce_eve_ai_settings_grant_tenant` and
--   `public.enforce_eve_policy_permission_tenant` (triggers): no application
--   code writes either grant table.
-- - `authz.is_super_admin()` serves row-level policies only, which keep
--   today's helpers until WP2b's second release.
--
-- Down (run by hand, in one transaction): restore the five functions from
-- 20260718102000_eve_final_launch_verification.sql (1),
-- 20260718022535_eve_retention_replay_tracer.sql (2),
-- 20260718015747_eve_approval_budget_policy.sql (3), the latest migration that
-- defines `assert_eve_admin_memory_owner` (4) and
-- `atomic_update_profile_with_audit` (5), with CREATE OR REPLACE.

BEGIN;

-- 1. The launch and release-safety actor.
CREATE OR REPLACE FUNCTION public.assert_eve_launch_profile(
  p_tenant_id UUID,
  p_profile_id UUID,
  p_required_role TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_required_role = 'super_admin' THEN
    -- Unchanged until WP2c's operator list: the profile's role and tenant.
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = p_profile_id AND tenant_id = p_tenant_id
        AND role = p_required_role
    ) THEN
      RAISE EXCEPTION 'eve_launch_profile_tenant_mismatch';
    END IF;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM public.profiles AS p
      JOIN authz.memberships AS m ON m.user_id = p.user_id
     WHERE p.id = p_profile_id
       AND m.tenant_id = p_tenant_id
       AND m.is_active
       AND m.revoked_at IS NULL
       AND (
         p_required_role IS NULL
         OR (p_required_role = 'admin'
             AND m.role = 'staff'::authz.membership_role
             AND m.is_tenant_admin)
         OR (p_required_role IN ('staff', 'donor', 'missionary')
             AND m.role::TEXT = p_required_role)
       )
  ) THEN
    RAISE EXCEPTION 'eve_launch_profile_tenant_mismatch';
  END IF;
END;
$$;

-- 2. The retention actor.
CREATE OR REPLACE FUNCTION public.assert_eve_retention_actor(
  p_tenant_id UUID,
  p_actor_profile_id UUID,
  p_actor_role TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_actor_role = 'super_admin' THEN
    -- Unchanged until WP2c's operator list: the profile's tenant.
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = p_actor_profile_id AND tenant_id = p_tenant_id
    ) THEN
      RAISE EXCEPTION 'eve_retention_actor_tenant_mismatch';
    END IF;
    RETURN;
  END IF;

  IF p_actor_role IS DISTINCT FROM 'admin' OR NOT EXISTS (
    SELECT 1
      FROM public.profiles AS p
      JOIN authz.memberships AS m ON m.user_id = p.user_id
     WHERE p.id = p_actor_profile_id
       AND m.tenant_id = p_tenant_id
       AND m.role = 'staff'::authz.membership_role
       AND m.is_tenant_admin
       AND m.is_active
       AND m.revoked_at IS NULL
  ) THEN
    RAISE EXCEPTION 'eve_retention_actor_tenant_mismatch';
  END IF;
END;
$$;

-- 3. The Eve policy actor's tenant.
CREATE OR REPLACE FUNCTION public.assert_eve_policy_actor_tenant(
  p_tenant_id UUID,
  p_actor_profile_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM public.profiles AS p
      JOIN authz.memberships AS m ON m.user_id = p.user_id
     WHERE p.id = p_actor_profile_id
       AND m.tenant_id = p_tenant_id
       AND m.is_active
       AND m.revoked_at IS NULL
  ) AND NOT EXISTS (
    -- Unchanged until WP2c's operator list: a platform super_admin profile
    -- with no tenant.
    SELECT 1 FROM public.profiles
    WHERE id = p_actor_profile_id
      AND tenant_id IS NULL AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'eve_policy_actor_tenant_mismatch';
  END IF;
END;
$$;

-- 4. The assistant-memory owner.
CREATE OR REPLACE FUNCTION public.assert_eve_admin_memory_owner(
  p_tenant_id UUID,
  p_owner_profile_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM public.profiles AS p
      JOIN authz.memberships AS m ON m.user_id = p.user_id
     WHERE p.id = p_owner_profile_id
       AND m.tenant_id = p_tenant_id
       AND m.is_active
       AND m.revoked_at IS NULL
  ) THEN
    RAISE EXCEPTION 'eve_admin_memory_owner_tenant_mismatch';
  END IF;
END;
$$;

-- 5. A person's own profile edit (GraphQL updateMyProfile).
CREATE OR REPLACE FUNCTION public.atomic_update_profile_with_audit(
  p_profile_id UUID,
  p_tenant_id UUID,
  p_actor_user_id UUID,
  p_updates JSONB,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  UPDATE public.profiles AS p
  SET first_name = CASE WHEN p_updates ? 'first_name' THEN p_updates->>'first_name' ELSE p.first_name END,
      last_name = CASE WHEN p_updates ? 'last_name' THEN p_updates->>'last_name' ELSE p.last_name END,
      avatar_url = CASE WHEN p_updates ? 'avatar_url' THEN p_updates->>'avatar_url' ELSE p.avatar_url END,
      updated_at = NOW()
  WHERE p.id = p_profile_id
    AND EXISTS (
      SELECT 1 FROM authz.memberships AS m
       WHERE m.user_id = p.user_id
         AND m.tenant_id = p_tenant_id
         AND m.is_active
         AND m.revoked_at IS NULL
    )
  RETURNING p.id INTO v_profile_id;

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found'
      USING ERRCODE = 'P0002';
  END IF;

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
    'profile_updated',
    'profile',
    v_profile_id::TEXT,
    COALESCE(p_updates, '{}'::jsonb),
    p_ip_address,
    p_user_agent
  );

  RETURN jsonb_build_object('profile_id', v_profile_id);
END;
$$;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
