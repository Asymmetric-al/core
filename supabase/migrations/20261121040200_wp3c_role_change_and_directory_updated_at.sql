-- AL-2676 (WP3c, part 1; plan 5.1, 5.4, 7.4, 12 WP3 line 936; rulings R4, F1,
-- F5; record D-113, lines 632, 640):
-- replaces change_membership_role with a single 7-argument function carrying
-- p_expected_updated_at TIMESTAMPTZ DEFAULT NULL (no overload), shared
-- public.tenants FOR UPDATE serialization lock, self-demotion narrowing
-- (D-113), clock_timestamp() on every write, and revocation of any live
-- operator_admin_invite when setting is_tenant_admin = true.
-- Also recreates public.tenant_member_directory(uuid) adding updated_at.
--
-- Release-window compatibility (plan 7.4, R4, F5): p_expected_updated_at
-- defaults to NULL so the old build calling 6 arguments continues to resolve
-- while migrations deploy ahead of app builds. Dropping the DEFAULT NULL is
-- owed to the release after this one.
--
-- Down (run by hand, in one transaction):
--   DROP FUNCTION public.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT, TIMESTAMPTZ);
--   DROP FUNCTION tenant_guard.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT, TIMESTAMPTZ);
--   DROP FUNCTION public.tenant_member_directory(UUID);
--   Restore the 6-arg change_membership_role functions from
--   20261119135500_wp2c_membership_role_commands.sql and
--   public.tenant_member_directory(UUID) from
--   20261117160200_membership_readers_and_member_directory.sql.

BEGIN;
SET LOCAL lock_timeout = '5s';

DROP FUNCTION public.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT);
DROP FUNCTION tenant_guard.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT);

CREATE FUNCTION tenant_guard.change_membership_role(
  p_tenant_id UUID,
  p_membership_id UUID,
  p_role TEXT,
  p_staff_role TEXT,
  p_is_tenant_admin BOOLEAN,
  p_reason TEXT,
  p_expected_updated_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_reason TEXT;
  v_admin BOOLEAN;
  v_role authz.membership_role;
  v_staff authz.staff_role;
  v_tenant_status TEXT;
  v_target RECORD;
  v_existing RECORD;
  v_other_op RECORD;
  v_result UUID;
  v_admins UUID[];
  v_now TIMESTAMPTZ;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'people.manage_members');

  v_reason := pg_catalog.regexp_replace(
    COALESCE(p_reason, ''),
    '^[[:space:]]+|[[:space:]]+$',
    '',
    'g'
  );
  IF v_reason = '' THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;

  v_admin := COALESCE(p_is_tenant_admin, false);
  IF p_role IS NULL
     OR p_role NOT IN ('donor', 'missionary', 'staff')
     OR (p_role = 'staff' AND (
          p_staff_role IS NULL
          OR p_staff_role NOT IN ('finance', 'mobilizer', 'development', 'hr', 'member_care')
        ))
     OR (p_role <> 'staff' AND (p_staff_role IS NOT NULL OR v_admin)) THEN
    RAISE EXCEPTION 'This role cannot be granted by an organization administrator'
      USING ERRCODE = '42501';
  END IF;
  v_role := p_role::authz.membership_role;
  v_staff := p_staff_role::authz.staff_role;

  v_tenant_status := private.lock_tenant(v_ctx.tenant_id);
  IF v_tenant_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'tenant_guard: tenant is not active' USING ERRCODE = '42501';
  END IF;

  PERFORM 1
     FROM authz.memberships AS m
    WHERE m.tenant_id = v_ctx.tenant_id
      AND ((m.is_tenant_admin AND m.is_active)
           OR m.id = v_ctx.assignment_id
           OR m.id = p_membership_id)
    ORDER BY m.id
      FOR UPDATE;

  IF NOT ('people.manage_members' = ANY (authz.assignment_capabilities(v_ctx.assignment_id))) THEN
    RAISE EXCEPTION 'tenant_guard: the selected assignment does not hold the capability this command requires'
      USING ERRCODE = '42501';
  END IF;

  SELECT
    m.id,
    m.user_id,
    m.role,
    m.staff_role,
    m.is_tenant_admin,
    m.is_active,
    m.revoked_at,
    m.updated_at
  INTO v_target
  FROM authz.memberships AS m
  WHERE m.id = p_membership_id
    AND m.tenant_id = v_ctx.tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No live membership with that id in this organization'
      USING ERRCODE = 'P0002';
  END IF;

  IF NOT v_target.is_active OR v_target.revoked_at IS NOT NULL THEN
    IF p_expected_updated_at IS NOT NULL
       AND v_target.updated_at IS DISTINCT FROM p_expected_updated_at THEN
      RAISE EXCEPTION 'This membership was changed by someone else; reload and try again'
        USING ERRCODE = '40001';
    END IF;
    RAISE EXCEPTION 'No live membership with that id in this organization'
      USING ERRCODE = 'P0002';
  END IF;

  IF p_expected_updated_at IS NOT NULL
     AND v_target.updated_at IS DISTINCT FROM p_expected_updated_at THEN
    RAISE EXCEPTION 'This membership was changed by someone else; reload and try again'
      USING ERRCODE = '40001';
  END IF;

  IF v_target.user_id = v_ctx.actor_id
     AND NOT (
       v_target.role = 'staff'
       AND v_role = 'staff'
       AND v_target.staff_role IS NOT DISTINCT FROM v_staff
       AND v_target.is_tenant_admin
       AND NOT v_admin
     ) THEN
    RAISE EXCEPTION 'Administrators cannot change their own role'
      USING ERRCODE = '42501';
  END IF;

  IF v_target.role <> 'staff' OR v_role <> 'staff' THEN
    RAISE EXCEPTION 'A role change keeps the row''s class: change the sub-role or the administrator flag of a staff row. Give a row of another class by invitation, and end one with revoke_membership'
      USING ERRCODE = '42501';
  END IF;

  IF v_target.staff_role IS NOT DISTINCT FROM v_staff
     AND v_target.is_tenant_admin = v_admin THEN
    RETURN pg_catalog.jsonb_build_object(
      'changed', false,
      'tenant_id', tenant_guard.current_tenant_id(),
      'user_id', v_target.user_id,
      'membership_id', v_target.id,
      'previous_membership_id', v_target.id,
      'role', v_role,
      'staff_role', v_staff,
      'is_tenant_admin', v_admin,
      'updated_at', v_target.updated_at
    );
  END IF;

  IF private.is_platform_operator(v_target.user_id) THEN
    RAISE EXCEPTION 'This person''s role cannot be changed here'
      USING ERRCODE = '42501';
  END IF;

  IF v_target.staff_role IS DISTINCT FROM v_staff
     AND EXISTS (
       SELECT 1
         FROM authz.memberships AS m
        WHERE m.user_id = v_target.user_id
          AND m.tenant_id = v_ctx.tenant_id
          AND m.role = v_role
          AND m.staff_role IS NOT DISTINCT FROM v_staff
          AND m.is_active
     ) THEN
    RAISE EXCEPTION 'This person already holds that role in this organization; change or revoke that row instead'
      USING ERRCODE = '23505';
  END IF;

  IF v_target.is_tenant_admin AND NOT v_admin THEN
    SELECT pg_catalog.array_agg(m.id)
      INTO v_admins
      FROM authz.memberships AS m
     WHERE m.tenant_id = v_ctx.tenant_id
       AND m.is_tenant_admin
       AND m.is_active
       AND m.id <> v_target.id;
    IF v_admins IS NULL THEN
      RAISE EXCEPTION 'This is the organization''s last administrator; make someone else an administrator first'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  v_now := GREATEST(
    pg_catalog.clock_timestamp(),
    v_target.updated_at + INTERVAL '1 microsecond'
  );

  IF v_target.staff_role IS NOT DISTINCT FROM v_staff THEN
    UPDATE authz.memberships AS m
       SET is_tenant_admin = v_admin,
           updated_at = v_now
     WHERE m.id = v_target.id
       AND m.tenant_id = v_ctx.tenant_id;
    v_result := v_target.id;
  ELSE
    UPDATE authz.memberships AS m
       SET is_active = false,
           updated_at = v_now
     WHERE m.id = v_target.id
       AND m.tenant_id = v_ctx.tenant_id;

    SELECT m.id
      INTO v_existing
      FROM authz.memberships AS m
     WHERE m.user_id = v_target.user_id
       AND m.tenant_id = v_ctx.tenant_id
       AND m.role = v_role
       AND m.staff_role IS NOT DISTINCT FROM v_staff
       FOR UPDATE;

    IF FOUND THEN
      UPDATE authz.memberships AS m
         SET is_active = true,
             is_tenant_admin = v_admin,
             granted_by = v_ctx.actor_id,
             updated_at = v_now
       WHERE m.id = v_existing.id
         AND m.tenant_id = v_ctx.tenant_id;
      v_result := v_existing.id;
    ELSE
      INSERT INTO authz.memberships (
        user_id,
        tenant_id,
        role,
        staff_role,
        is_tenant_admin,
        is_active,
        granted_by,
        updated_at
      )
      VALUES (
        v_target.user_id,
        v_ctx.tenant_id,
        v_role,
        v_staff,
        v_admin,
        true,
        v_ctx.actor_id,
        v_now
      )
      RETURNING id INTO v_result;
    END IF;
  END IF;

  IF v_admin THEN
    FOR v_other_op IN
      SELECT i.id, i.email_normalized, i.staff_role
        FROM public.membership_invitations AS i
       WHERE i.tenant_id = v_ctx.tenant_id
         AND i.purpose = 'operator_admin_invite'
         AND i.status = 'issued'
       ORDER BY i.id
         FOR UPDATE OF i
    LOOP
      UPDATE public.membership_invitations AS i
         SET status = 'revoked',
             revoked_at = v_now,
             revoked_by = v_ctx.actor_id,
             updated_at = v_now
       WHERE i.tenant_id = v_ctx.tenant_id
         AND i.id = v_other_op.id;

      INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
      VALUES (
        v_ctx.tenant_id,
        v_ctx.actor_id,
        'membership_invitation_revoked',
        'membership_invitation',
        v_other_op.id::TEXT,
        pg_catalog.jsonb_build_object(
          'reason', 'Superseded when tenant administrator flag was granted',
          'assignment_id', v_ctx.assignment_id,
          'invitation_id', v_other_op.id,
          'email', v_other_op.email_normalized,
          'role', 'staff',
          'staff_role', v_other_op.staff_role::TEXT,
          'is_tenant_admin', true,
          'purpose', 'operator_admin_invite',
          'revoked_at', v_now
        )
      );
    END LOOP;
  END IF;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'membership_role_changed',
    'membership',
    v_result::TEXT,
    pg_catalog.jsonb_build_object(
      'reason', v_reason,
      'assignment_id', v_ctx.assignment_id,
      'target_user_id', v_target.user_id,
      'from', pg_catalog.jsonb_build_object(
        'membership_id', v_target.id,
        'role', v_target.role,
        'staff_role', v_target.staff_role,
        'is_tenant_admin', v_target.is_tenant_admin
      ),
      'to', pg_catalog.jsonb_build_object(
        'membership_id', v_result,
        'role', v_role,
        'staff_role', v_staff,
        'is_tenant_admin', v_admin
      )
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'changed', true,
    'tenant_id', tenant_guard.current_tenant_id(),
    'user_id', v_target.user_id,
    'membership_id', v_result,
    'previous_membership_id', v_target.id,
    'role', v_role,
    'staff_role', v_staff,
    'is_tenant_admin', v_admin,
    'updated_at', v_now
  );
END;
$$;

COMMENT ON FUNCTION tenant_guard.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT, TIMESTAMPTZ) IS
  'Human command (plan 5.4, WP3 line 936, AL-2676 WP3c, R4, F1, F5, D-113): '
  'changes a staff row''s sub-role or tenant-administrator flag, lets an admin '
  'clear their own flag when another admin exists, enforces optimistic concurrency '
  'via p_expected_updated_at (40001 on conflict), and revokes live operator admin '
  'invitations when granting the flag.';

REVOKE ALL ON FUNCTION tenant_guard.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT, TIMESTAMPTZ)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT, TIMESTAMPTZ)
  TO authenticated;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT, TIMESTAMPTZ)
  OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE FUNCTION public.change_membership_role(
  p_tenant_id UUID,
  p_membership_id UUID,
  p_role TEXT,
  p_staff_role TEXT,
  p_is_tenant_admin BOOLEAN,
  p_reason TEXT,
  p_expected_updated_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.change_membership_role(
    p_tenant_id,
    p_membership_id,
    p_role,
    p_staff_role,
    p_is_tenant_admin,
    p_reason,
    p_expected_updated_at
  );
$$;

COMMENT ON FUNCTION public.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT, TIMESTAMPTZ) IS
  'Wrapper of tenant_guard.change_membership_role for the Data API (AL-2676 WP3c, R4, F5). '
  'Runs as the caller; EXECUTE for authenticated only.';

ALTER FUNCTION public.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT, TIMESTAMPTZ) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT, TIMESTAMPTZ)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT, TIMESTAMPTZ)
  TO authenticated;

DROP FUNCTION public.tenant_member_directory(UUID);

CREATE FUNCTION public.tenant_member_directory(p_tenant_id UUID)
RETURNS TABLE (
  membership_id UUID,
  user_id UUID,
  profile_id UUID,
  display_name TEXT,
  email TEXT,
  role TEXT,
  staff_role TEXT,
  is_tenant_admin BOOLEAN,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF authz.caller_assignment(p_tenant_id, 'staff') IS NULL THEN
    RAISE EXCEPTION 'Forbidden: the member directory requires a live staff membership in this tenant.'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT
      m.id,
      m.user_id,
      p.id,
      COALESCE(
        NULLIF(pg_catalog.btrim(p.display_name), ''),
        NULLIF(pg_catalog.btrim(p.full_name), ''),
        NULLIF(pg_catalog.btrim(pg_catalog.concat_ws(' ', p.first_name, p.last_name)), '')
      ),
      p.email,
      m.role::TEXT,
      m.staff_role::TEXT,
      m.is_tenant_admin,
      m.updated_at
    FROM authz.memberships AS m
    LEFT JOIN public.profiles AS p ON p.user_id = m.user_id
    WHERE m.tenant_id = p_tenant_id
      AND m.is_active
      AND m.revoked_at IS NULL
    ORDER BY 4 NULLS LAST, m.id;
END;
$$;

COMMENT ON FUNCTION public.tenant_member_directory(UUID) IS
  'Display name, email, role and updated_at of every live member of a tenant, for a '
  'caller whose selected live staff row is in that tenant (plan 5.1, AL-2676 WP3c, R4).';

ALTER FUNCTION public.tenant_member_directory(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.tenant_member_directory(UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.tenant_member_directory(UUID) TO authenticated;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
