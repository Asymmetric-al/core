-- AL-2678 (WP5 rest, pull request 1; brief stage5/wp5-rest.md section 3,
-- invariants 5 and 6, rule 13; rulings WP5 part 2 Q8 and the D-16 ruling
-- reviews/decision-wp5-add-partner-entry.md, ruling 1). Add Partner becomes a
-- human command of the command lane: a missionary records a new partner of
-- their own ministry, as one Party and one donor, on the caller's token.
--
-- 1. authz.assignment_capabilities(uuid), replaced whole: its text from
--    20261117160100 with the member:missionary subject holding the new
--    bundle missionary_partners, whose one capability is partners.add
--    (packages/auth/capabilities/bundles.ts and registry.ts; the parity suite
--    issue-2675/capability-parity compares the two). No staff subject and no
--    tenant_admin bundle holds partners.add; member:donor holds no bundle.
--    Owner, EXECUTE (tenant_guard) and comment re-asserted.
-- 2. tenant_guard.add_partner(tenant, key, name, email, phone, type,
--    frequency, location, request id): a guard-owned definer whose first
--    statement is the preamble with partners.add. Then, in this order:
--    (a) the caller's assignment must be the missionary class (42501), as
--    the identity-and-access contract requires the role class as well as the
--    capability; (b) the caller's worker row is found only through their
--    account link in the tenant, its Party and that Party's worker row there,
--    and the command refuses (42501, writing nothing) with no link, no
--    worker row, more than one, or one with no login; (c) the tenant is the
--    preamble's only, and the command takes no owner, assignment, Party or
--    profile argument; (d) the key rule: the same key from the same caller
--    in the same tenant is the same intent, serialized on an advisory lock
--    of its own namespace over (tenant, key), the namespace of the key's
--    unique index in crm_command_logs; the same payload returns the stored
--    pair with duplicate true and writes nothing; any other payload, another
--    caller's key or another command's key answers 23505 and writes nothing.
--    The payload is compared after the form's normalization (rule 13): name,
--    email, phone and location in private.normalize_safety_text's form (a
--    blank phone, of any whitespace or invisible characters, is no phone),
--    the email compared without case; (e) the Party through the Party writer
--    with no profile (a new person, joined to no other); (f) the donor with
--    party_id, tenant_id and missionary_id = the worker row's login (r3's
--    trigger derives the assignment key from it); (g) one crm_command_logs
--    row (action missionary.partner.create, resource the donor). Refusals
--    (22023, nothing written): a missing key, a name or location of fewer
--    than 2 characters or more than 200 after normalization, an email that
--    is not one address of at most 320, a phone of more than 50, an unknown
--    type or frequency.
-- 3. public.add_partner(...): its SECURITY INVOKER wrapper. EXECUTE on both
--    for authenticated only; nothing for anon or service_role.
-- 4. What the guard may now do, in the tenant it entered only: read the
--    worker row's party_id and profile_id; insert a donor by column and read
--    back the columns the key rule compares, behind a new
--    tenant_guard_isolation policy on donors; read crm_command_logs'
--    actor_user_id. Nothing is granted on donors or parties to
--    authenticated, anon or service_role (Q8).
--
-- Locks, all held to COMMIT: SHARE ROW EXCLUSIVE on donors for its new
-- policy (writes wait; reads do not); object locks on the functions.
-- lock_timeout stops a run rather than queue it behind live traffic.
--
-- Recovery. A run lost between its COMMIT and its ledger row stops on the
-- next run at its first CREATE (tenant_guard.add_partner, 42723), rolling
-- back. This file has committed when this read-only check is true: SELECT
-- to_regprocedure('public.add_partner(uuid,uuid,text,text,text,text,text,text,uuid)')
-- IS NOT NULL. Then follow docs/ops/release-job.md, "If the migration
-- committed but its ledger row is missing", with this check and this file's
-- version, 20261126200200.
--
-- Down (only after the build that calls it is rolled back; one transaction):
-- DROP FUNCTION public.add_partner(uuid,uuid,text,text,text,text,text,text,uuid),
-- tenant_guard.add_partner(uuid,uuid,text,text,text,text,text,text,uuid); DROP
-- POLICY tenant_guard_isolation ON public.donors; REVOKE the column grants
-- of section 4 from tenant_guard; restore authz.assignment_capabilities(uuid)
-- from 20261117160100 lines 41-166. Partners added stay.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. The capability mirror.
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
  -- ROLE_DEFAULT_BUNDLES. member:donor holds no bundle; member:missionary holds missionary_partners.
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
      ('tenant_admin', 'tenant_administration'),
      ('member:missionary', 'missionary_partners')
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
      ('tenant_administration', 'imports.commit'),

      ('missionary_partners', 'partners.add')
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
  'packages/auth/capabilities/bundles.ts (AL-2675; AL-2678 adds the missionary''s partners.add).';

ALTER FUNCTION authz.assignment_capabilities(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION authz.assignment_capabilities(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.assignment_capabilities(UUID) TO tenant_guard;

-- 4. What the guard may do for the command.
GRANT SELECT (party_id, profile_id) ON TABLE public.missionaries TO tenant_guard;
GRANT SELECT (actor_user_id) ON TABLE public.crm_command_logs TO tenant_guard;
GRANT INSERT (tenant_id, party_id, missionary_id, name, email, phone, type, frequency, location, status, total_given, last_gift_amount, score)
  ON TABLE public.donors TO tenant_guard;
GRANT SELECT (id, tenant_id, party_id, missionary_id, name, email, phone, type, frequency, location)
  ON TABLE public.donors TO tenant_guard;

CREATE POLICY tenant_guard_isolation
  ON public.donors
  FOR ALL
  TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id())
  WITH CHECK (tenant_id = tenant_guard.current_tenant_id());

-- 2. The command.
CREATE FUNCTION tenant_guard.add_partner(
  p_tenant_id UUID,
  p_idempotency_key UUID,
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_type TEXT,
  p_frequency TEXT,
  p_location TEXT,
  p_request_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_link_party UUID;
  v_workers INTEGER;
  v_worker_login UUID;
  v_key TEXT;
  v_name TEXT;
  v_email TEXT;
  v_phone TEXT;
  v_location TEXT;
  v_log_action TEXT;
  v_log_actor UUID;
  v_log_resource TEXT;
  v_log_id UUID;
  v_party_id UUID;
  v_donor_id UUID;
  v_same BOOLEAN;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'partners.add');

  IF v_ctx.role IS DISTINCT FROM 'missionary' THEN
    RAISE EXCEPTION 'tenant_guard: only a missionary assignment adds a partner'
      USING ERRCODE = '42501';
  END IF;

  SELECT al.party_id
    INTO v_link_party
    FROM public.account_links AS al
   WHERE al.tenant_id = v_ctx.tenant_id
     AND al.user_id = v_ctx.actor_id;

  SELECT pg_catalog.count(*)::INTEGER
    INTO v_workers
    FROM public.missionaries AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.party_id = v_link_party;

  IF v_link_party IS NULL OR v_workers <> 1 THEN
    RAISE EXCEPTION 'tenant_guard: the caller has no single worker row in this tenant through their account link'
      USING ERRCODE = '42501';
  END IF;

  SELECT m.profile_id
    INTO v_worker_login
    FROM public.missionaries AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.party_id = v_link_party;

  IF v_worker_login IS NULL THEN
    RAISE EXCEPTION 'tenant_guard: the caller''s worker row has no login'
      USING ERRCODE = '42501';
  END IF;

  v_key := p_idempotency_key::TEXT;
  v_name := private.normalize_safety_text(p_name);
  v_email := private.normalize_safety_text(p_email);
  v_phone := private.normalize_safety_text(p_phone);
  v_location := private.normalize_safety_text(p_location);

  IF v_key IS NULL
     OR COALESCE(pg_catalog.char_length(v_name), 0) NOT BETWEEN 2 AND 200
     OR COALESCE(pg_catalog.char_length(v_location), 0) NOT BETWEEN 2 AND 200
     OR v_email IS NULL
     OR pg_catalog.char_length(v_email) > 320
     OR v_email !~ '^[^@ ]+@[^@ ]+\.[^@ ]+$'
     OR COALESCE(pg_catalog.char_length(v_phone), 0) > 50
     OR p_type IS NULL
     OR p_type NOT IN ('Individual', 'Organization', 'Church')
     OR p_frequency IS NULL
     OR p_frequency NOT IN ('Monthly', 'One-Time', 'Annually', 'Irregular') THEN
    RAISE EXCEPTION 'tenant_guard: the partner is not valid'
      USING ERRCODE = '22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('add_partner'),
    pg_catalog.hashtext(v_ctx.tenant_id::TEXT || ':' || v_key)
  );

  SELECT l.id, l.action, l.actor_user_id, l.resource_id
    INTO v_log_id, v_log_action, v_log_actor, v_log_resource
    FROM public.crm_command_logs AS l
   WHERE l.tenant_id = v_ctx.tenant_id
     AND l.idempotency_key = v_key;

  IF v_log_id IS NOT NULL THEN
    SELECT d.id, d.party_id
      INTO v_donor_id, v_party_id
      FROM public.donors AS d
     WHERE d.tenant_id = v_ctx.tenant_id
       AND d.id::TEXT = v_log_resource
       AND d.missionary_id = v_worker_login
       AND d.name = v_name
       AND pg_catalog.lower(d.email) = pg_catalog.lower(v_email)
       AND d.phone IS NOT DISTINCT FROM v_phone
       AND d.type = p_type
       AND d.frequency = p_frequency
       AND d.location = v_location;
    v_same := FOUND
      AND v_log_action = 'missionary.partner.create'
      AND v_log_actor = v_ctx.actor_id;

    IF v_same IS NOT TRUE THEN
      RAISE EXCEPTION 'tenant_guard: this submission key was used for another partner'
        USING ERRCODE = '23505';
    END IF;

    RETURN pg_catalog.jsonb_build_object(
      'donorId', v_donor_id,
      'partyId', v_party_id,
      'commandLogId', v_log_id,
      'duplicate', true
    );
  END IF;

  v_party_id := public.donor_party_for_insert(v_ctx.tenant_id, NULL, v_name, v_email);

  INSERT INTO public.donors (
    tenant_id,
    party_id,
    missionary_id,
    name,
    email,
    phone,
    type,
    frequency,
    location,
    status,
    total_given,
    last_gift_amount,
    score
  )
  VALUES (
    v_ctx.tenant_id,
    v_party_id,
    v_worker_login,
    v_name,
    v_email,
    v_phone,
    p_type,
    p_frequency,
    v_location,
    'Active',
    0,
    0,
    70
  )
  RETURNING id INTO v_donor_id;

  INSERT INTO public.crm_command_logs (
    tenant_id,
    actor_user_id,
    actor_profile_id,
    request_id,
    action,
    resource_type,
    resource_id,
    idempotency_key,
    status
  )
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    private.caller_profile_id(),
    p_request_id::TEXT,
    'missionary.partner.create',
    'donor',
    v_donor_id::TEXT,
    v_key,
    'succeeded'
  )
  RETURNING id INTO v_log_id;

  RETURN pg_catalog.jsonb_build_object(
    'donorId', v_donor_id,
    'partyId', v_party_id,
    'commandLogId', v_log_id,
    'duplicate', false
  );
END;
$$;

COMMENT ON FUNCTION tenant_guard.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) IS
  'Human command (AL-2678, WP5 rest; D-16 ruling on Add Partner): a missionary records a new partner of their own ministry, '
  'one Party and one donor owned by their worker row, and one command-log row. Needs partners.add and the missionary class; '
  'idempotent on the client''s submission key.';

REVOKE ALL ON FUNCTION tenant_guard.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  TO authenticated;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

-- 3. The wrapper.
CREATE FUNCTION public.add_partner(
  p_tenant_id UUID,
  p_idempotency_key UUID,
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_type TEXT,
  p_frequency TEXT,
  p_location TEXT,
  p_request_id UUID
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.add_partner(
    p_tenant_id,
    p_idempotency_key,
    p_name,
    p_email,
    p_phone,
    p_type,
    p_frequency,
    p_location,
    p_request_id
  );
$$;

COMMENT ON FUNCTION public.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) IS
  'Wrapper of tenant_guard.add_partner for the Data API (AL-2678, WP5 rest). Runs as the caller; EXECUTE for authenticated only.';

ALTER FUNCTION public.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  TO authenticated;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
