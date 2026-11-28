-- AL-2678 (WP5 rest, part B; issue 2835, the four items of 28 November from
-- the review bots' later reading of pull request 2859). Part A's functions
-- change here, never in part A's files.
--
-- 1. tenant_guard.redeem_account_claim refuses any isolation level but READ
--    COMMITTED (25001, read_committed_required), as the money kernel does
--    (20261127030300), as its first statement, before any read. It takes
--    the writer's lock and only then reads the login's Party: under READ
--    COMMITTED that read sees a gift committed during the wait; under
--    REPEATABLE READ or SERIALIZABLE the snapshot is older than the lock and
--    a login could end linked to the claimed Party while holding a donor on
--    another. Its text is otherwise 20261127060000's; owner tenant_guard,
--    grants and answers unchanged. Its reviewed digest in
--    scripts/verify/command-entry-boundaries.mjs moves with it (D-18).
-- 2. The assignment keys' true lock order, in the comments of
--    private.derive_ministry_assignment_id() and
--    private.rederive_ministry_assignment_children() and in
--    docs/security/tenant-guard.md. A worker's write (an INSERT with a
--    login, a re-link, a DELETE) holds the worker row, then takes the keys
--    of its old and new login in ascending order, then locks the children it
--    re-derives. A child's INSERT takes the key and holds no row first. A
--    child's UPDATE that moves it to another login already holds the child's
--    row when its trigger asks for the key. So a move and a worker write of
--    one login can meet in a cycle, which PostgreSQL ends with 40P01: one of
--    the two fails, nothing is written wrongly, and a retry succeeds.
--    20261127060200's sentence that the two never wait in a cycle was wrong.
--    The rule: a writer that moves an existing child takes the key's lock
--    for the child's old and new login, in ascending order of the key,
--    before its UPDATE. Nothing at runtime moves a child today.
-- 3. (docs/security/tenant-guard.md only) a refused claim offers a pair to
--    staff only when the other Party holds exactly one donor and no open
--    candidate pairs the two in either direction.
-- 4. The claim's catalog comment gives its true order: the organization's
--    row share-locked first, then the writer's lock, then every other row
--    lock.
--
-- Locks at migration time: object locks on the replaced function and the
-- two commented ones only. lock_timeout stops a run rather than queue it.
--
-- What the running build does: nothing calls the claim's redemption; the
-- triggers' behaviour does not change.
--
-- Recovery. Every statement is CREATE OR REPLACE or COMMENT and runs again
-- unchanged. This file has committed when this read-only check returns true
-- (false before it, never an error):
-- Check begins
--   SELECT pg_catalog.strpos(pg_catalog.pg_get_functiondef('tenant_guard.redeem_account_claim(uuid,text)'::pg_catalog.regprocedure), 'read_committed_required') > 0 AS committed;
-- Check ends
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127090200.
--
-- Down (one transaction): the claim's text and comment from
-- 20261127060000, replaced as its owner, and the two triggers' comments from
-- 20261127060200; then restore the claim's reviewed digest in
-- scripts/verify/command-entry-boundaries.mjs.
-- Down begins
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
--   SET LOCAL ROLE tenant_guard;
--   \lines 646-808 of 20261127060000_wp5_rest2_party_lock.sql
--   RESET ROLE;
--   REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;
--   \lines 116-117 of 20261127060200_wp5_rest2_assignment_key_race.sql
--   \lines 393-394 of 20261127060200_wp5_rest2_assignment_key_race.sql
--   COMMIT;
--   SELECT pg_notify('pgrst', 'reload schema');
-- Down ends

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1 and 4. The claim at READ COMMITTED only, with its true order.
-- Replaced as its owner, which holds CREATE on its schema only for this.
GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
SET LOCAL ROLE tenant_guard;
CREATE OR REPLACE FUNCTION tenant_guard.redeem_account_claim(p_tenant_id UUID, p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user UUID;
  v_request_tenant_id UUID;
  v_found RECORD;
  v_known BOOLEAN;
  v_claim RECORD;
  v_donor RECORD;
  v_reason TEXT;
  v_link UUID;
  v_other_party UUID;
BEGIN
  IF (pg_catalog.current_setting('transaction_isolation') = 'read committed') IS NOT TRUE THEN
    RAISE EXCEPTION 'read_committed_required'
      USING ERRCODE = '25001',
            DETAIL = 'The claim''s redemption runs only at READ COMMITTED.';
  END IF;

  v_user := tenant_guard.caller_id();
  IF v_user IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('status', 'refused');
  END IF;

  BEGIN
    v_request_tenant_id := authz.request_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_request_tenant_id := NULL;
  END;
  IF v_request_tenant_id IS NULL OR v_request_tenant_id IS DISTINCT FROM p_tenant_id THEN
    RAISE EXCEPTION 'tenant_guard: request tenant scope is required and must match command tenant'
      USING ERRCODE = '42501';
  END IF;

  IF p_token IS NULL OR (private.share_lock_tenant(p_tenant_id) = 'active') IS NOT TRUE THEN
    RETURN pg_catalog.jsonb_build_object('status', 'refused');
  END IF;
  PERFORM tenant_guard.enter(p_tenant_id);

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('donor_party_writer'),
    pg_catalog.hashtext(p_tenant_id::TEXT || ':' || v_user::TEXT)
  );

  PERFORM 1
     FROM authz.memberships AS m
    WHERE m.tenant_id = p_tenant_id
      AND m.user_id = v_user
    ORDER BY m.id
      FOR UPDATE;

  SELECT c.id, c.donor_id
    INTO v_found
    FROM public.account_claim_requests AS c
   WHERE c.tenant_id = p_tenant_id
     AND c.token_sha256 = pg_catalog.sha256(pg_catalog.convert_to(p_token, 'UTF8'));
  v_known := FOUND;

  IF v_known THEN
    PERFORM 1
       FROM public.parties AS p
      WHERE p.tenant_id = p_tenant_id
        AND p.id = (
          SELECT d.party_id FROM private.account_claim_donor_by_id(p_tenant_id, v_found.donor_id) AS d
        )
        FOR UPDATE;
    SELECT c.id, c.donor_id, c.requested_by, c.status, c.token_expires_at,
           c.token_redeemed_at, c.donor_email_at_issue
      INTO v_claim
      FROM public.account_claim_requests AS c
     WHERE c.tenant_id = p_tenant_id
       AND c.id = v_found.id
     FOR UPDATE;
  END IF;

  IF NOT v_known THEN
    v_reason := 'unknown_token';
  ELSIF v_claim.token_redeemed_at IS NOT NULL THEN
    v_reason := 'already_redeemed';
  ELSIF v_claim.token_expires_at <= pg_catalog.now() THEN
    v_reason := 'expired';
  ELSIF v_claim.requested_by IS DISTINCT FROM v_user THEN
    v_reason := 'wrong_user';
  ELSIF v_claim.status <> 'pending' THEN
    v_reason := 'not_pending';
  ELSIF private.is_platform_operator(v_user) THEN
    v_reason := 'platform_operator';
  ELSIF private.login_confirmed_email(v_user) IS NULL THEN
    v_reason := 'login_not_confirmed';
  ELSE
    SELECT * INTO v_donor FROM private.account_claim_donor_by_id(p_tenant_id, v_claim.donor_id);
    IF NOT FOUND
       OR v_claim.donor_email_at_issue IS NULL
       OR v_donor.email_normalized IS DISTINCT FROM v_claim.donor_email_at_issue THEN
      v_reason := 'contact_changed';
    ELSIF v_donor.linked THEN
      v_reason := 'donor_already_linked';
    ELSE
      v_other_party := private.login_party(p_tenant_id, v_user);
      IF v_other_party IS NOT NULL AND v_other_party IS DISTINCT FROM v_donor.party_id THEN
        PERFORM private.record_claim_merge_candidate(p_tenant_id, v_donor.donor_id, v_other_party);
      END IF;
      IF EXISTS (
        SELECT 1 FROM public.account_links AS al
         WHERE al.tenant_id = p_tenant_id AND al.user_id = v_user
      ) THEN
        v_reason := 'caller_already_linked';
      ELSIF v_other_party IS NOT NULL AND v_other_party IS DISTINCT FROM v_donor.party_id THEN
        v_reason := 'caller_has_other_party';
      END IF;
    END IF;
  END IF;

  IF v_reason IS NULL THEN
    INSERT INTO public.account_links (tenant_id, user_id, party_id, linked_via)
    VALUES (p_tenant_id, v_user, v_donor.party_id, 'account_claim')
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_link;
    IF v_link IS NULL THEN
      v_reason := 'caller_already_linked';
    END IF;
  END IF;

  IF v_reason IS NOT NULL THEN
    INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
    VALUES (
      p_tenant_id, v_user, 'account_claim_refused', 'account_claim', v_found.id::TEXT,
      pg_catalog.jsonb_build_object('reason', v_reason)
    );
    RETURN pg_catalog.jsonb_build_object('status', 'refused');
  END IF;

  UPDATE public.account_claim_requests AS c
     SET status = 'verified',
         token_redeemed_at = pg_catalog.now(),
         resolved_at = pg_catalog.now(),
         updated_at = pg_catalog.now()
   WHERE c.tenant_id = p_tenant_id
     AND c.id = v_claim.id;

  UPDATE authz.memberships AS m
     SET is_active = true,
         granted_by = v_user,
         updated_at = pg_catalog.now()
   WHERE m.user_id = v_user
     AND m.tenant_id = p_tenant_id
     AND m.role = 'donor'
     AND m.staff_role IS NULL;
  IF NOT FOUND THEN
    INSERT INTO authz.memberships (user_id, tenant_id, role, is_active, granted_by)
    VALUES (v_user, p_tenant_id, 'donor', true, v_user);
  END IF;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    p_tenant_id, v_user, 'account_claim_redeemed', 'account_claim', v_claim.id::TEXT,
    pg_catalog.jsonb_build_object('donor_id', v_claim.donor_id, 'party_id', v_donor.party_id)
  );

  RETURN pg_catalog.jsonb_build_object('status', 'linked');
END;
$$;
COMMENT ON FUNCTION tenant_guard.redeem_account_claim(UUID, TEXT) IS
  'Pre-membership human command (AL-2678, W5-R5; WP5 rest 2 item zero (b); issue 2835, 28 November, items 1 and 4): redeems a claim token once, in the organization the request names, linking the caller to the donor''s Party with a donor membership. It runs only at READ COMMITTED (25001 otherwise, before any read). It share-locks the organization''s row first, then takes the donor writer''s lock (donor_party_writer, organization:caller) before any other row lock, and refuses a caller whose login already resolves to another Party there (link, sole worker row, own donor), offering that pair to staff only when that Party holds exactly one donor and no open candidate pairs the two in either direction. Answers {"status":"refused"} for every failure.';
RESET ROLE;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

-- 2. The assignment keys' true lock order.
COMMENT ON FUNCTION private.derive_ministry_assignment_id() IS
  'BEFORE ROW trigger of the five activity tables: takes the advisory lock (ministry_assignment_key, tenant_id:missionary_id), which a write of a worker row of that login also takes, then sets ministry_assignment_id to private.assignment_for_profile(tenant_id, missionary_id), NULL when either is NULL or the lookup is missing or not permitted; never raises for a supplied value (AL-2678, Q-r3-4; issue 2834 item 1; fix round F3 of pull request 2859). Lock order (issue 2835, 28 November): an INSERT takes the key and holds no row first; an UPDATE that moves a row to another login already holds that row when this trigger asks for the key, while a worker''s write holds the worker row, then the keys, then the children''s rows, so a move and a worker write of one login can meet in a cycle that PostgreSQL ends with 40P01 (one fails, nothing is written wrongly, a retry succeeds). A writer that moves an existing child takes the key''s lock for the child''s old and new login, in ascending order of the key, before its UPDATE.';

COMMENT ON FUNCTION private.rederive_ministry_assignment_children() IS
  'AFTER ROW trigger of public.missionaries: takes the advisory lock (ministry_assignment_key, tenant:profile) for the row''s old and new tenant and profile, in ascending order of the key, which a write of their children also takes, then re-derives ministry_assignment_id on the children of the row''s old and new (tenant, profile) and of its old and new id in that tenant, where it differs (AL-2678; fix round F3 of pull request 2859). Lock order (issue 2835, 28 November): the worker row, then the keys, then the rows of the children it re-derives; a child''s INSERT takes only the key, but a child''s UPDATE that moves it to another login holds the child''s row before its trigger asks for the key, so the two can meet in a cycle that PostgreSQL ends with 40P01 (one fails, nothing is written wrongly, a retry succeeds). A writer that moves an existing child takes the key''s lock for the child''s old and new login, in ascending order of the key, before its UPDATE.';

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
