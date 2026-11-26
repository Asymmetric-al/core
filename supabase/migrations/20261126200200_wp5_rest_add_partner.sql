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
-- 2. tenant_guard.add_partner(tenant, key, name, phone, type, frequency,
--    location, request id): a guard-owned definer whose first statement is
--    the preamble with partners.add. It takes no e-mail (D-16 ruling of 26
--    November, decision-wp5-add-partner-existing-email): nothing a
--    missionary sends meets a unique key, so the answer is the same whether
--    or not the person is already a donor of the organization, and no branch
--    reads another donor. Then, in this order:
--    (a) the caller's assignment must be the missionary class (42501), as
--    the identity-and-access contract requires the role class as well as the
--    capability; (b) the payload in its stored form (rule 13: name, phone and
--    location in private.normalize_safety_text's form, a blank phone of any
--    whitespace or invisible characters no phone), refused (22023, nothing
--    written) for a missing key, a name or location of fewer than 2
--    characters or more than 200, a phone of more than 50, an unknown type or
--    frequency; (c) the key's own advisory lock over (tenant, key), which
--    serializes one intent; (d) what the preamble checked, held to COMMIT in
--    the neighbouring commands' order: the tenant FOR SHARE
--    (private.share_lock_tenant) and active, then the selected assignment
--    FOR SHARE, still live, the missionary class and holding partners.add,
--    so a revocation or suspension committed while the command waited on
--    its key refuses it (42501, nothing written) and one committed later
--    waits for it; (e) the caller's worker row only through their account
--    link in the tenant, its Party and that Party's worker row there,
--    refused (42501) with no link, no worker row or one with no login (two
--    worker rows on one Party cannot exist); (f) the tenant is the
--    preamble's only, and the command takes no owner, assignment, Party or
--    profile argument; (g) the key rule: the same key from the same caller in
--    the same tenant is the same intent; the stored submission
--    (crm_command_logs.command_payload) decides, never the donor as it is
--    now: the same submitted details return the stored pair with duplicate
--    true and write nothing; other details, another caller's key or another
--    command's key are a key conflict (23505, HINT add_partner_key), and a
--    unique violation of anything but the key is raised as it is; (h) the
--    Party through the Party writer with no profile (a new person, joined to
--    no other); (i) the donor with party_id, tenant_id, missionary_id = the
--    worker row's login (r3's trigger derives the assignment key from it)
--    and giving_preferences exactly {"defaultAnonymousToRecipient": false},
--    a constant no request sets (D-16 ruling decision-wp5-added-partner-
--    visibility: the missionary typed the identity; a restricted Party still
--    reads as anonymous, and defaultAnonymousToPublic stays absent); (j) one
--    crm_command_logs row (action missionary.partner.create, resource the
--    donor, the submission in command_payload and the pair in
--    result_summary).
-- 3. public.add_partner(...): its SECURITY INVOKER wrapper. EXECUTE on both
--    for authenticated only; nothing for anon or service_role.
-- 4. What the guard may now do, in the tenant it entered only: read the
--    worker row's party_id and profile_id; insert a donor by column (no
--    email; giving_preferences) and read back its id, behind a new
--    tenant_guard_isolation policy on donors; insert a log row's
--    command_payload and result_summary and read them and actor_user_id.
--    Nothing is granted on donors or parties to authenticated, anon or
--    service_role (Q8).
--
-- Locks, all held to COMMIT: SHARE ROW EXCLUSIVE on donors for its new
-- policy (writes wait; reads do not); object locks on the functions.
-- lock_timeout stops a run rather than queue it behind live traffic.
--
-- If the lock limit stops this file (a long write holding donors), the file
-- rolls back whole and leaves nothing of itself; the release stops here,
-- with the release's earlier files committed (20261126200000 and
-- 20261126200100 among them). The running build keeps working on that
-- state: it calls no function of this file, and its Add Partner dialog is
-- refused as before. Run the release again once the write has finished;
-- this file then applies from its start.
--
-- Recovery. A run lost between its COMMIT and its ledger row stops on the
-- next run at CREATE POLICY tenant_guard_isolation ON public.donors (42710,
-- the policy exists), rolling back. This file has committed when this
-- read-only check is true: SELECT
-- to_regprocedure('public.add_partner(uuid,uuid,text,text,text,text,text,uuid)')
-- IS NOT NULL. Then follow docs/ops/release-job.md, "If the migration
-- committed but its ledger row is missing", with this check and this file's
-- version, 20261126200200.
--
-- Down (only after the build that calls it is rolled back; one transaction):
-- DROP FUNCTION public.add_partner(uuid,uuid,text,text,text,text,text,uuid),
-- tenant_guard.add_partner(uuid,uuid,text,text,text,text,text,uuid); DROP
-- POLICY tenant_guard_isolation ON public.donors; REVOKE the column grants
-- of section 4 from tenant_guard (giving_preferences among the INSERT
-- grants on donors); restore authz.assignment_capabilities(uuid) from
-- 20261117160100 lines 41-166. Partners added stay.

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
GRANT SELECT (actor_user_id, command_payload, result_summary) ON TABLE public.crm_command_logs TO tenant_guard;
GRANT INSERT (command_payload, result_summary) ON TABLE public.crm_command_logs TO tenant_guard;
GRANT INSERT (tenant_id, party_id, missionary_id, name, phone, type, frequency, location, status, total_given, last_gift_amount, score, giving_preferences)
  ON TABLE public.donors TO tenant_guard;
GRANT SELECT (id, tenant_id) ON TABLE public.donors TO tenant_guard;

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
  v_status TEXT;
  v_live BOOLEAN;
  v_capable BOOLEAN;
  v_link_party UUID;
  v_workers INTEGER;
  v_worker_login UUID;
  v_key TEXT;
  v_name TEXT;
  v_phone TEXT;
  v_location TEXT;
  v_payload JSONB;
  v_log_id UUID;
  v_log_action TEXT;
  v_log_actor UUID;
  v_log_payload JSONB;
  v_log_result JSONB;
  v_party_id UUID;
  v_donor_id UUID;
  v_constraint TEXT;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'partners.add');

  IF v_ctx.role IS DISTINCT FROM 'missionary' THEN
    RAISE EXCEPTION 'tenant_guard: only a missionary assignment adds a partner'
      USING ERRCODE = '42501';
  END IF;

  v_key := p_idempotency_key::TEXT;
  v_name := private.normalize_safety_text(p_name);
  v_phone := private.normalize_safety_text(p_phone);
  v_location := private.normalize_safety_text(p_location);

  IF v_key IS NULL
     OR COALESCE(pg_catalog.char_length(v_name), 0) NOT BETWEEN 2 AND 200
     OR COALESCE(pg_catalog.char_length(v_location), 0) NOT BETWEEN 2 AND 200
     OR COALESCE(pg_catalog.char_length(v_phone), 0) > 50
     OR p_type IS NULL
     OR p_type NOT IN ('Individual', 'Organization', 'Church')
     OR p_frequency IS NULL
     OR p_frequency NOT IN ('Monthly', 'One-Time', 'Annually', 'Irregular') THEN
    RAISE EXCEPTION 'tenant_guard: the partner is not valid'
      USING ERRCODE = '22023';
  END IF;

  v_payload := pg_catalog.jsonb_build_object(
    'name', v_name,
    'phone', v_phone,
    'type', p_type,
    'frequency', p_frequency,
    'location', v_location
  );

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('add_partner'),
    pg_catalog.hashtext(v_ctx.tenant_id::TEXT || ':' || v_key)
  );

  v_status := private.share_lock_tenant(v_ctx.tenant_id);

  IF v_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'tenant_guard: the organization is not active'
      USING ERRCODE = '42501';
  END IF;

  SELECT true
    INTO v_live
    FROM authz.memberships AS m
   WHERE m.id = v_ctx.assignment_id
     AND m.user_id = v_ctx.actor_id
     AND m.tenant_id = v_ctx.tenant_id
     AND m.role = 'missionary'
     AND m.is_active
     AND m.revoked_at IS NULL
     FOR SHARE;

  IF v_live IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: the selected assignment is no longer a live missionary assignment of the caller in this tenant'
      USING ERRCODE = '42501';
  END IF;

  v_capable := 'partners.add' = ANY (authz.assignment_capabilities(v_ctx.assignment_id));

  IF v_capable IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: the selected assignment no longer holds partners.add'
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

  SELECT l.id, l.action, l.actor_user_id, l.command_payload, l.result_summary
    INTO v_log_id, v_log_action, v_log_actor, v_log_payload, v_log_result
    FROM public.crm_command_logs AS l
   WHERE l.tenant_id = v_ctx.tenant_id
     AND l.idempotency_key = v_key;

  IF v_log_id IS NOT NULL THEN
    IF v_log_action IS DISTINCT FROM 'missionary.partner.create'
       OR v_log_actor IS DISTINCT FROM v_ctx.actor_id
       OR v_log_payload IS DISTINCT FROM v_payload THEN
      RAISE EXCEPTION 'tenant_guard: this submission key was used for another partner'
        USING ERRCODE = '23505', HINT = 'add_partner_key';
    END IF;

    RETURN pg_catalog.jsonb_build_object(
      'donorId', v_log_result ->> 'donorId',
      'partyId', v_log_result ->> 'partyId',
      'commandLogId', v_log_id,
      'duplicate', true
    );
  END IF;

  v_party_id := public.donor_party_for_insert(v_ctx.tenant_id, NULL, v_name, NULL);

  BEGIN
    INSERT INTO public.donors (
      tenant_id,
      party_id,
      missionary_id,
      name,
      phone,
      type,
      frequency,
      location,
      status,
      total_given,
      last_gift_amount,
      score,
      giving_preferences
    )
    VALUES (
      v_ctx.tenant_id,
      v_party_id,
      v_worker_login,
      v_name,
      v_phone,
      p_type,
      p_frequency,
      v_location,
      'Active',
      0,
      0,
      70,
      '{"defaultAnonymousToRecipient": false}'::jsonb
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
      status,
      command_payload,
      result_summary
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
      'succeeded',
      v_payload,
      pg_catalog.jsonb_build_object('donorId', v_donor_id, 'partyId', v_party_id)
    )
    RETURNING id INTO v_log_id;
  EXCEPTION
    WHEN unique_violation THEN
      GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
      IF v_constraint = 'idx_crm_command_logs_tenant_idempotency' THEN
        RAISE EXCEPTION 'tenant_guard: this submission key was used for another partner'
          USING ERRCODE = '23505', HINT = 'add_partner_key';
      END IF;
      RAISE;
  END;

  RETURN pg_catalog.jsonb_build_object(
    'donorId', v_donor_id,
    'partyId', v_party_id,
    'commandLogId', v_log_id,
    'duplicate', false
  );
END;
$$;

COMMENT ON FUNCTION tenant_guard.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) IS
  'Human command (AL-2678, WP5 rest; D-16 rulings on Add Partner): a missionary records a new partner of their own ministry, '
  'one Party and one donor owned by their worker row, named to them, and one command-log row holding the submission. '
  'Needs partners.add and the missionary class, held to commit; takes no e-mail; idempotent on the client''s submission key.';

REVOKE ALL ON FUNCTION tenant_guard.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  TO authenticated;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

-- 3. The wrapper.
CREATE FUNCTION public.add_partner(
  p_tenant_id UUID,
  p_idempotency_key UUID,
  p_name TEXT,
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
    p_phone,
    p_type,
    p_frequency,
    p_location,
    p_request_id
  );
$$;

COMMENT ON FUNCTION public.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) IS
  'Wrapper of tenant_guard.add_partner for the Data API (AL-2678, WP5 rest). Runs as the caller; EXECUTE for authenticated only.';

ALTER FUNCTION public.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  TO authenticated;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
