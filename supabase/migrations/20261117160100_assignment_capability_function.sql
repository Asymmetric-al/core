-- AL-2675 (WP2a, the membership core; plan 5.1 "Capabilities", 5.4 "How a
-- command runs"; audit B05, A06): the one SQL capability function, and the
-- capability and revocation checks inside the human-command preamble that the
-- implementation record (section 9) says WP2a owes WP1.1a.
--
-- 1. `authz.assignment_capabilities(assignment_id)` holds the
--    bundle-to-capability mapping of the code registry
--    (packages/auth/capabilities/bundles.ts) and judges one membership row
--    alone: the row's sub-role bundle (or member bundle) and, when the row
--    carries the flag, the tenant-administrator grant. It returns the
--    capabilities sorted in C collation, or an empty array for a row that is
--    missing, revoked or inactive. No other row of the person counts (the
--    accepted contract, "Capability Aggregation Uses One Validated Context").
--    It runs with the caller's rights, so the guard role sees only the session
--    caller's own rows (policy tenant_guard_own_assignments). A test compares
--    it with the registry for every grant subject and the flag
--    (tests/unit/acceptance/issue-2675/capability-parity.realstack.acceptance.test.ts);
--    change both together.
-- 2. `tenant_guard.command_context` gains the flag.
-- 3. `tenant_guard.begin_human_command(tenant, capability DEFAULT NULL)`: the
--    preamble gains the capability a command requires. After it resolves the
--    assignment (the row the assignment header names, or the caller's one live
--    row), it refuses (42501) unless that row holds the capability, and only
--    then enters the tenant. It now tests `revoked_at` beside `is_active`.
--    With no capability it checks membership only, for commands a person runs
--    on their own record; existing one-argument calls keep that meaning. It
--    replaces the one-argument function rather than overloading it, so the
--    command schema keeps one function per name. WP3 adds the tenant-status
--    check here.
--
-- Down (run by hand, in one transaction): DROP FUNCTION
-- tenant_guard.begin_human_command(UUID, TEXT); restore
-- begin_human_command(UUID) from
-- 20261117034638_command_lane_human_entry_points.sql; ALTER TYPE
-- tenant_guard.command_context DROP ATTRIBUTE is_tenant_admin; DROP FUNCTION
-- authz.assignment_capabilities(UUID).

BEGIN;

-- 1. The capability function.
CREATE OR REPLACE FUNCTION authz.assignment_capabilities(p_assignment_id UUID)
RETURNS TEXT[]
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH assignment AS (
    SELECT m.role, m.staff_role, m.is_tenant_admin
      FROM authz.memberships AS m
     WHERE m.id = p_assignment_id
       AND m.is_active
       AND m.revoked_at IS NULL
  ),
  subject (key) AS (
    SELECT CASE a.role
             WHEN 'staff' THEN 'staff:' || a.staff_role::TEXT
             ELSE 'member:' || a.role::TEXT
           END
      FROM assignment AS a
    UNION ALL
    SELECT 'tenant_admin'
      FROM assignment AS a
     WHERE a.is_tenant_admin
  ),
  -- ROLE_DEFAULT_BUNDLES. member:donor and member:missionary hold no bundle.
  subject_bundle (subject, bundle) AS (
    VALUES
      ('staff:finance', 'staff_base'),
      ('staff:finance', 'staff_finance'),
      ('staff:mobilizer', 'staff_base'),
      ('staff:mobilizer', 'staff_mobilizer'),
      ('staff:development', 'staff_base'),
      ('staff:development', 'staff_development'),
      ('staff:hr', 'staff_base'),
      ('staff:hr', 'staff_hr'),
      ('staff:member_care', 'staff_base'),
      ('staff:member_care', 'staff_member_care'),
      ('tenant_admin', 'staff_base'),
      ('tenant_admin', 'contribution_admin'),
      ('tenant_admin', 'permissions_proposer'),
      ('tenant_admin', 'tenant_administration')
  ),
  -- CAPABILITY_BUNDLES, for the bundles a subject holds.
  bundle_capability (bundle, capability) AS (
    VALUES
      ('staff_base', 'admin.dashboard.access'),
      ('staff_base', 'admin.crm.manage'),
      ('staff_base', 'admin.gifts.manage'),
      ('staff_base', 'admin.reports.view'),

      ('staff_finance', 'web_studio.edit'),
      ('staff_finance', 'updates.review'),
      ('staff_finance', 'contributions.view_detail'),
      ('staff_finance', 'contributions.request_corrections'),
      ('staff_finance', 'contributions.manage_table_preferences'),
      ('staff_finance', 'contributions.apply_corrections'),
      ('staff_finance', 'contributions.manage_receipts'),
      ('staff_finance', 'contributions.retry_crm_post'),

      ('staff_mobilizer', 'web_studio.edit'),
      ('staff_mobilizer', 'updates.review'),
      ('staff_mobilizer', 'contributions.view_detail'),
      ('staff_mobilizer', 'contributions.request_corrections'),
      ('staff_mobilizer', 'contributions.manage_table_preferences'),

      ('staff_development', 'web_studio.edit'),
      ('staff_development', 'updates.review'),
      ('staff_development', 'contributions.view_detail'),
      ('staff_development', 'contributions.request_corrections'),
      ('staff_development', 'contributions.manage_table_preferences'),
      ('staff_development', 'web_studio.publish'),

      ('staff_hr', 'web_studio.edit'),
      ('staff_hr', 'updates.review'),
      ('staff_hr', 'contributions.view_detail'),
      ('staff_hr', 'contributions.request_corrections'),
      ('staff_hr', 'contributions.manage_table_preferences'),

      ('staff_member_care', 'web_studio.edit'),
      ('staff_member_care', 'updates.review'),
      ('staff_member_care', 'contributions.view_detail'),
      ('staff_member_care', 'contributions.request_corrections'),
      ('staff_member_care', 'contributions.manage_table_preferences'),
      ('staff_member_care', 'care.access'),

      ('contribution_admin', 'contributions.view_detail'),
      ('contribution_admin', 'contributions.request_corrections'),
      ('contribution_admin', 'contributions.manage_table_preferences'),
      ('contribution_admin', 'contributions.apply_corrections'),
      ('contribution_admin', 'contributions.manage_receipts'),
      ('contribution_admin', 'contributions.retry_crm_post'),
      ('contribution_admin', 'contributions.approve_corrections'),
      ('contribution_admin', 'contributions.run_refunds'),
      ('contribution_admin', 'contributions.use_provider_actions'),
      ('contribution_admin', 'contributions.manage_settings'),
      ('contribution_admin', 'crm.gift_history.manage_view_defaults'),

      ('permissions_proposer', 'permissions.view'),
      ('permissions_proposer', 'permissions.propose_widening'),

      ('tenant_administration', 'people.manage_members'),
      ('tenant_administration', 'people.erase'),
      ('tenant_administration', 'sites.manage'),
      ('tenant_administration', 'payments.manage_account'),
      ('tenant_administration', 'web_studio.publish'),
      ('tenant_administration', 'safety.restrict_publication'),
      ('tenant_administration', 'imports.commit')
  )
  SELECT COALESCE(
           pg_catalog.array_agg(DISTINCT bc.capability COLLATE "C" ORDER BY bc.capability COLLATE "C"),
           ARRAY[]::TEXT[]
         )
    FROM subject AS s
    JOIN subject_bundle AS sb ON sb.subject = s.key
    JOIN bundle_capability AS bc ON bc.bundle = sb.bundle;
$$;

COMMENT ON FUNCTION authz.assignment_capabilities(UUID) IS
  'The capabilities one live membership row holds: its sub-role or member bundle '
  'and, with the flag, the tenant-administrator grant. Mirrors '
  'packages/auth/capabilities/bundles.ts (AL-2675).';

ALTER FUNCTION authz.assignment_capabilities(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION authz.assignment_capabilities(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.assignment_capabilities(UUID) TO tenant_guard;

-- 2. The command context carries the flag.
ALTER TYPE tenant_guard.command_context ADD ATTRIBUTE is_tenant_admin BOOLEAN;

-- 3. The preamble with a capability, and the revocation test. The
-- one-argument function goes first: a call with one argument then resolves to
-- this one through the default. resolve_command_assignment calls it by name,
-- which PL/pgSQL resolves at run time.
DROP FUNCTION tenant_guard.begin_human_command(UUID);
CREATE FUNCTION tenant_guard.begin_human_command(
  p_tenant_id UUID,
  p_capability TEXT DEFAULT NULL
)
RETURNS tenant_guard.command_context
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_actor UUID := tenant_guard.caller_id();
  v_named UUID := tenant_guard.request_assignment_id();
  v_ctx tenant_guard.command_context;
  v_live INTEGER;
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'tenant_guard: a human command needs a signed-in caller'
      USING ERRCODE = '42501';
  END IF;

  IF p_tenant_id IS NULL THEN
    RAISE EXCEPTION 'tenant_guard: tenant id is required'
      USING ERRCODE = '22004';
  END IF;

  IF p_capability IS NOT NULL AND pg_catalog.btrim(p_capability) = '' THEN
    RAISE EXCEPTION 'tenant_guard: a capability name is required'
      USING ERRCODE = '22023';
  END IF;

  IF v_named IS NOT NULL THEN
    SELECT v_actor, m.tenant_id, m.id, m.role::TEXT, m.staff_role::TEXT, m.is_tenant_admin
      INTO v_ctx
      FROM authz.memberships AS m
     WHERE m.id = v_named
       AND m.user_id = v_actor
       AND m.tenant_id = p_tenant_id
       AND m.is_active
       AND m.revoked_at IS NULL;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'tenant_guard: the selected assignment is not a live assignment of the caller in this tenant'
        USING ERRCODE = '42501';
    END IF;
  ELSE
    SELECT pg_catalog.count(*)::INTEGER
      INTO v_live
      FROM authz.memberships AS m
     WHERE m.user_id = v_actor
       AND m.tenant_id = p_tenant_id
       AND m.is_active
       AND m.revoked_at IS NULL;

    IF v_live = 0 THEN
      RAISE EXCEPTION 'tenant_guard: the caller has no live assignment in this tenant'
        USING ERRCODE = '42501';
    END IF;

    IF v_live > 1 THEN
      RAISE EXCEPTION 'tenant_guard: the caller has several live assignments in this tenant and the request names none'
        USING ERRCODE = '42501';
    END IF;

    SELECT v_actor, m.tenant_id, m.id, m.role::TEXT, m.staff_role::TEXT, m.is_tenant_admin
      INTO v_ctx
      FROM authz.memberships AS m
     WHERE m.user_id = v_actor
       AND m.tenant_id = p_tenant_id
       AND m.is_active
       AND m.revoked_at IS NULL;
  END IF;

  IF p_capability IS NOT NULL
     AND NOT (p_capability = ANY (authz.assignment_capabilities(v_ctx.assignment_id))) THEN
    RAISE EXCEPTION 'tenant_guard: the selected assignment does not hold the capability this command requires'
      USING ERRCODE = '42501';
  END IF;

  PERFORM tenant_guard.enter(v_ctx.tenant_id);
  RETURN v_ctx;
END;
$$;

ALTER FUNCTION tenant_guard.begin_human_command(UUID, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION tenant_guard.begin_human_command(UUID, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.begin_human_command(UUID, TEXT) TO tenant_guard;

COMMIT;
