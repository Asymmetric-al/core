-- AL-2675 (WP2c, part 1; plan 5.1, 5.4, 5.5 and 12 WP2c; record section 9,
-- D-40, D-46): the role-change and revoke commands, and the retirement of
-- `public.atomic_update_user_role_with_audit`, the SQL function behind GraphQL
-- `updateUserRole`, which the same change deletes.
--
-- 1. `tenant_guard.change_membership_role(tenant, membership, role,
--    staff_role, is_tenant_admin, reason)` and
--    `tenant_guard.revoke_membership(tenant, membership, reason)`, human
--    commands of the command lane (docs/security/tenant-guard.md, "Adding a
--    human entry point"), each reached through a `public` invoker wrapper.
--    The preamble requires `people.manage_members` on the caller's selected
--    assignment in the tenant (plan 5.4: "Invite, change role, revoke"), which
--    today only the tenant-administrator flag holds. A reason is required.
--    They write the membership and nothing else of the person: a change of
--    class or sub-role revokes the target row and grants, or revives, the row
--    of the new class and sub-role (the unique key covers revoked rows, plan
--    5.1), with `granted_by` the caller; a change of the flag alone writes the
--    flag on the same row; a revocation revokes the row, and the lifecycle
--    trigger clears its flag (WP2a). `profiles.role` is never written.
--    Each write leaves one row in `audit_logs` in the tenant, by the caller,
--    with the reason, the assignment the caller acted under and the row
--    before and after. A request that changes nothing writes nothing.
--
--    Refusals, each 42501 unless named, and each changing nothing:
--    - a caller without the capability, or with no live assignment in the
--      tenant (the preamble);
--    - no reason (22023);
--    - a class, sub-role or flag outside the tenant's vocabulary: donor,
--      missionary, or staff with one of the five sub-roles; the flag only on
--      a staff row. There is no platform role to grant;
--    - a target that is not a live row of this tenant: "not found" (P0002).
--      A person of another tenant is never a target: the guard sees only the
--      tenant it entered;
--    - any row of the caller's own ("nobody changes their own row");
--    - a row of a login on the platform operator list. Stage 1 and WP2a
--      refused `profiles.role = 'super_admin'`; the list replaces it (record
--      section 9);
--    - for a change of role, a target who holds a live membership in another
--      tenant (record D-40). The retired function wrote the person's global
--      `profiles.role`, which every tenant's restricted-note policies read;
--      these commands write only this tenant's rows, but those policies still
--      read `profiles.role`, with no tenant condition, until WP2b's second
--      release moves them to the flag. Until then a staff row granted here to
--      someone whose profile role is `admin` from another tenant would open
--      this tenant's restricted notes to them; this refusal keeps the
--      exposure where it is today. It goes when those policies move. A
--      revocation only takes access away in this tenant, so it is not refused
--      for this: revoking must stay possible;
--    - removing the tenant's last administrator (plan 5.4);
--    - changing a row into a class and sub-role the person already holds in
--      another live row (23505), which would rewrite that row's flag behind
--      this row's audit entry; that row is changed or revoked itself.
--
--    After the preamble each command locks the tenant's live administrator
--    rows, the caller's assignment and the target row, in one order, and then
--    checks the caller's capability again. So two administrators who demote
--    each other at the same moment take turns, and the second finds that its
--    caller is no longer one: no pair of commands leaves the tenant without an
--    administrator. While only the flag holds the capability, the caller is
--    an administrator who cannot target their own row, so the last-
--    administrator refusal is a second line, for the day a bundle gives
--    `people.manage_members` to a sub-role.
--
-- 2. What the guard may now do, in the tenant it entered only
--    (`tenant_guard_isolation` policies): insert a membership and change its
--    lifecycle columns (`is_active`, `revoked_at`, `is_tenant_admin`,
--    `granted_by`, `updated_at`) by column grants, so no guard command can
--    move a row to another person, tenant, class or sub-role; and insert an
--    audit row. It may also use the `private` schema and execute
--    `private.is_platform_operator(uuid)` and
--    `private.is_member_elsewhere(uuid, uuid)`, two postgres-owned definers
--    that answer for a login without showing the guard the operator list or
--    another tenant's rows. They live in `private`, which signed-in users
--    cannot use, and not in `authz`, whose SECURITY DEFINER functions are a
--    reviewed inventory of three (issue #2270, frozen).
--
-- 3. `public.atomic_update_user_role_with_audit` is dropped. It wrote only
--    `profiles.role`, which grants no access since WP2a, and no person could
--    reach it (record D-46: GraphQL is mounted in the donor app alone, whose
--    proxy fixes the donor class).
--
-- Down (run by hand, in one transaction): DROP FUNCTION
-- public.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT),
-- public.revoke_membership(UUID, UUID, TEXT),
-- tenant_guard.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT),
-- tenant_guard.revoke_membership(UUID, UUID, TEXT),
-- private.is_member_elsewhere(UUID, UUID); REVOKE EXECUTE ON FUNCTION
-- private.is_platform_operator(UUID) FROM tenant_guard; REVOKE USAGE ON
-- SCHEMA private FROM tenant_guard; DROP POLICY
-- tenant_guard_isolation ON authz.memberships; DROP POLICY
-- tenant_guard_isolation ON public.audit_logs; REVOKE INSERT, UPDATE ON
-- authz.memberships FROM tenant_guard (and the column grants); REVOKE INSERT
-- ON public.audit_logs FROM tenant_guard; restore
-- public.atomic_update_user_role_with_audit from
-- 20261117160400_role_change_reads_tenant_admin_membership.sql. The audit rows
-- stay.

BEGIN;

-- 1. What the guard may read and write.
GRANT INSERT (user_id, tenant_id, role, staff_role, is_tenant_admin, is_active, granted_by)
  ON TABLE authz.memberships TO tenant_guard;
GRANT UPDATE (is_active, revoked_at, is_tenant_admin, granted_by, updated_at)
  ON TABLE authz.memberships TO tenant_guard;

DROP POLICY IF EXISTS tenant_guard_isolation ON authz.memberships;
CREATE POLICY tenant_guard_isolation
  ON authz.memberships
  FOR ALL
  TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id())
  WITH CHECK (tenant_id = tenant_guard.current_tenant_id());

GRANT INSERT ON TABLE public.audit_logs TO tenant_guard;

DROP POLICY IF EXISTS tenant_guard_isolation ON public.audit_logs;
CREATE POLICY tenant_guard_isolation
  ON public.audit_logs
  FOR INSERT
  TO tenant_guard
  WITH CHECK (tenant_id = tenant_guard.current_tenant_id());

-- Whether a login holds a live membership in a tenant other than the one given.
CREATE OR REPLACE FUNCTION private.is_member_elsewhere(p_user_id UUID, p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM authz.memberships AS m
     WHERE m.user_id = p_user_id
       AND m.tenant_id <> p_tenant_id
       AND m.is_active
       AND m.revoked_at IS NULL
  );
$$;

COMMENT ON FUNCTION private.is_member_elsewhere(UUID, UUID) IS
  'Whether a login holds a live membership in any tenant but the one given '
  '(AL-2675 WP2c): the role-change command''s cross-organization refusal '
  '(record D-40), until WP2b''s second release moves the restricted-note '
  'policies off profiles.role. EXECUTE for tenant_guard only.';

ALTER FUNCTION private.is_member_elsewhere(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.is_member_elsewhere(UUID, UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_member_elsewhere(UUID, UUID) TO tenant_guard;

GRANT USAGE ON SCHEMA private TO tenant_guard;
GRANT EXECUTE ON FUNCTION private.is_platform_operator(UUID) TO tenant_guard;

-- 2. The role-change command.
CREATE OR REPLACE FUNCTION tenant_guard.change_membership_role(
  p_tenant_id UUID,
  p_membership_id UUID,
  p_role TEXT,
  p_staff_role TEXT,
  p_is_tenant_admin BOOLEAN,
  p_reason TEXT
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
  v_target RECORD;
  v_existing RECORD;
  v_result UUID;
  v_admins UUID[];
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'people.manage_members');

  v_reason := pg_catalog.btrim(COALESCE(p_reason, ''));
  IF v_reason = '' THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;

  v_admin := COALESCE(p_is_tenant_admin, false);
  IF p_role IS NULL
     OR p_role NOT IN ('donor', 'missionary', 'staff')
     OR (p_role = 'staff' AND (p_staff_role IS NULL
           OR p_staff_role NOT IN ('finance', 'mobilizer', 'development', 'hr', 'member_care')))
     OR (p_role <> 'staff' AND (p_staff_role IS NOT NULL OR v_admin)) THEN
    RAISE EXCEPTION 'This role cannot be granted by an organization administrator'
      USING ERRCODE = '42501';
  END IF;
  v_role := p_role::authz.membership_role;
  v_staff := p_staff_role::authz.staff_role;

  -- Take turns with any other command on this tenant's administrators, the
  -- caller's assignment or the target, then judge the caller again: a
  -- command that waited may find its caller's capability gone.
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

  SELECT m.id, m.user_id, m.role, m.staff_role, m.is_tenant_admin
    INTO v_target
    FROM authz.memberships AS m
   WHERE m.id = p_membership_id
     AND m.tenant_id = v_ctx.tenant_id
     AND m.is_active
     AND m.revoked_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No live membership with that id in this organization'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_target.user_id = v_ctx.actor_id THEN
    RAISE EXCEPTION 'Administrators cannot change their own role'
      USING ERRCODE = '42501';
  END IF;

  IF private.is_platform_operator(v_target.user_id) THEN
    RAISE EXCEPTION 'A platform operator''s membership cannot be changed by an organization administrator'
      USING ERRCODE = '42501';
  END IF;

  -- Record D-40, until WP2b's second release moves the restricted-note
  -- policies off profiles.role (see the header).
  IF private.is_member_elsewhere(v_target.user_id, v_ctx.tenant_id) THEN
    RAISE EXCEPTION 'This person also belongs to another organization; their role cannot be changed here'
      USING ERRCODE = '42501';
  END IF;

  IF v_target.role = v_role AND v_target.staff_role IS NOT DISTINCT FROM v_staff
     AND v_target.is_tenant_admin = v_admin THEN
    RETURN pg_catalog.jsonb_build_object(
      'changed', false,
      'tenant_id', tenant_guard.current_tenant_id(),
      'user_id', v_target.user_id,
      'membership_id', v_target.id,
      'previous_membership_id', v_target.id,
      'role', v_role,
      'staff_role', v_staff,
      'is_tenant_admin', v_admin
    );
  END IF;

  -- A change into a role the person already holds live in another row would
  -- rewrite that row's flag behind this row's audit entry: refused.
  IF (v_target.role <> v_role OR v_target.staff_role IS DISTINCT FROM v_staff)
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

  IF v_target.role = v_role AND v_target.staff_role IS NOT DISTINCT FROM v_staff THEN
    -- The flag alone.
    UPDATE authz.memberships AS m
       SET is_tenant_admin = v_admin,
           updated_at = pg_catalog.now()
     WHERE m.id = v_target.id;
    v_result := v_target.id;
  ELSE
    -- Another class or sub-role: revoke this row, then grant or revive the
    -- row of the new one.
    UPDATE authz.memberships AS m
       SET is_active = false,
           updated_at = pg_catalog.now()
     WHERE m.id = v_target.id;

    -- The row of the new class and sub-role, if the person held it before;
    -- a live one was refused above.
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
             updated_at = pg_catalog.now()
       WHERE m.id = v_existing.id;
      v_result := v_existing.id;
    ELSE
      INSERT INTO authz.memberships (user_id, tenant_id, role, staff_role, is_tenant_admin, is_active, granted_by)
      VALUES (v_target.user_id, v_ctx.tenant_id, v_role, v_staff, v_admin, true, v_ctx.actor_id)
      RETURNING id INTO v_result;
    END IF;
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
    'is_tenant_admin', v_admin
  );
END;
$$;

COMMENT ON FUNCTION tenant_guard.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT) IS
  'Human command (plan 5.4, AL-2675 WP2c): changes a member''s class, sub-role '
  'or tenant-administrator flag in the caller''s tenant. Needs '
  'people.manage_members and a reason; writes the membership and one audit row, '
  'never profiles.role.';

-- 3. The revoke command.
CREATE OR REPLACE FUNCTION tenant_guard.revoke_membership(
  p_tenant_id UUID,
  p_membership_id UUID,
  p_reason TEXT
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
  v_target RECORD;
  v_admins UUID[];
  v_revoked_at TIMESTAMPTZ;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'people.manage_members');

  v_reason := pg_catalog.btrim(COALESCE(p_reason, ''));
  IF v_reason = '' THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
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

  SELECT m.id, m.user_id, m.role, m.staff_role, m.is_tenant_admin
    INTO v_target
    FROM authz.memberships AS m
   WHERE m.id = p_membership_id
     AND m.tenant_id = v_ctx.tenant_id
     AND m.is_active
     AND m.revoked_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No live membership with that id in this organization'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_target.user_id = v_ctx.actor_id THEN
    RAISE EXCEPTION 'Administrators cannot revoke their own membership'
      USING ERRCODE = '42501';
  END IF;

  IF private.is_platform_operator(v_target.user_id) THEN
    RAISE EXCEPTION 'A platform operator''s membership cannot be changed by an organization administrator'
      USING ERRCODE = '42501';
  END IF;

  IF v_target.is_tenant_admin THEN
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

  -- The lifecycle trigger stamps revoked_at and clears the flag (WP2a).
  UPDATE authz.memberships AS m
     SET is_active = false,
         updated_at = pg_catalog.now()
   WHERE m.id = v_target.id
  RETURNING m.revoked_at INTO v_revoked_at;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'membership_revoked',
    'membership',
    v_target.id::TEXT,
    pg_catalog.jsonb_build_object(
      'reason', v_reason,
      'assignment_id', v_ctx.assignment_id,
      'target_user_id', v_target.user_id,
      'membership', pg_catalog.jsonb_build_object(
        'role', v_target.role,
        'staff_role', v_target.staff_role,
        'is_tenant_admin', v_target.is_tenant_admin
      )
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'changed', true,
    'tenant_id', tenant_guard.current_tenant_id(),
    'user_id', v_target.user_id,
    'membership_id', v_target.id,
    'revoked_at', v_revoked_at
  );
END;
$$;

COMMENT ON FUNCTION tenant_guard.revoke_membership(UUID, UUID, TEXT) IS
  'Human command (plan 5.4, 5.5, AL-2675 WP2c): revokes a member''s row in the '
  'caller''s tenant, which takes its access at the next request. Needs '
  'people.manage_members and a reason; writes the membership and one audit row.';

REVOKE ALL ON FUNCTION tenant_guard.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.revoke_membership(UUID, UUID, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION tenant_guard.revoke_membership(UUID, UUID, TEXT) TO authenticated;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.revoke_membership(UUID, UUID, TEXT) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

-- 4. The wrappers.
CREATE OR REPLACE FUNCTION public.change_membership_role(
  p_tenant_id UUID,
  p_membership_id UUID,
  p_role TEXT,
  p_staff_role TEXT,
  p_is_tenant_admin BOOLEAN,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.change_membership_role(
    p_tenant_id, p_membership_id, p_role, p_staff_role, p_is_tenant_admin, p_reason
  );
$$;

CREATE OR REPLACE FUNCTION public.revoke_membership(
  p_tenant_id UUID,
  p_membership_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.revoke_membership(p_tenant_id, p_membership_id, p_reason);
$$;

COMMENT ON FUNCTION public.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT) IS
  'Wrapper of tenant_guard.change_membership_role for the Data API (AL-2675 '
  'WP2c). Runs as the caller; EXECUTE for authenticated only.';
COMMENT ON FUNCTION public.revoke_membership(UUID, UUID, TEXT) IS
  'Wrapper of tenant_guard.revoke_membership for the Data API (AL-2675 WP2c). '
  'Runs as the caller; EXECUTE for authenticated only.';

ALTER FUNCTION public.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT) OWNER TO postgres;
ALTER FUNCTION public.revoke_membership(UUID, UUID, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.revoke_membership(UUID, UUID, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.change_membership_role(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_membership(UUID, UUID, TEXT) TO authenticated;

-- 5. The retired role-change function.
DROP FUNCTION IF EXISTS public.atomic_update_user_role_with_audit(UUID, UUID, UUID, TEXT, TEXT, TEXT);

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
