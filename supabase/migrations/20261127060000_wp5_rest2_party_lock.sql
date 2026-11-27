-- AL-2678 (WP5 rest, pull request 2a, item zero (a) and (b); issue 2835's
-- comments of 26 and 27 November; ruling decision-wp5-rest-1-confirm-findings
-- section 2 and the coordinator's word of 27 November on (b)): one donor per
-- Party under a race, and a login tied to at most one Party in an
-- organization.
--
-- The rule, word for word: "Every writer of a donor or an account link for
-- (organization, login) first takes the advisory lock ('donor_party_writer',
-- organization:login), then resolves the Party (account link, else sole
-- worker row, else that login's donor), locks that Party row FOR UPDATE and
-- reads its donors: none, insert one with that party_id; one, use it; more,
-- refuse 21000 and write nothing." The money kernel's two writers
-- (tenant_guard.money_apply_payment_event and private.insert_giver_donor,
-- 20261127030300) already follow it and are not touched.
--
-- 1. private.login_party(tenant, login): the Party a login resolves to in an
--    organization, in the writer's order (its account link's, else its sole
--    worker row's, else its donor's), or NULL. A postgres-owned definer with
--    an empty search path, EXECUTE for tenant_guard only, in the tenant the
--    transaction entered (42501 otherwise). It reads nothing from auth.
-- 2. private.record_claim_merge_candidate(tenant, claimed donor, other
--    Party): in the tenant entered (42501 otherwise), when the other Party
--    holds exactly one donor and no open candidate pairs the two, one open
--    donor_merge_candidates row (existing: that donor; incoming: the claimed
--    donor; confidence 'possible'; signals ["account_claim_other_party"]), so
--    staff can merge them; it answers whether it wrote one. It reads under
--    the advisory lock ('donor_merge_candidate', organization:pair, the two
--    donor ids in ascending order), so two refusals of one pair at the same
--    moment, in either direction, record one. A postgres-owned definer,
--    EXECUTE for tenant_guard only. It never merges.
-- 3. public.begin_donation_saga: its text from 20261126200000 with the rule
--    for a signed-in giver: the lock, the Party from public.donor_party_for_
--    insert (which resolves it in the writer's order under the same lock, or
--    makes one new Party when nothing names one), that Party FOR UPDATE, its
--    donors: none, one donor inserted with that party_id and the login as
--    profile_id; one, used, whoever's login it carries; more, 21000. A login
--    that already holds a donor on another Party of the organization while
--    its Party has none is refused the same way (21000): a login is tied to
--    at most one Party there, and its donor key (tenant_id, profile_id) would
--    otherwise be met. A guest (no login) still gets one new Party and donor,
--    without the lock. Signature, SECURITY INVOKER, search path, owner,
--    grants and answers unchanged.
-- 4. public.atomic_create_donation_with_audit, only while it exists: the same
--    change to its text from 20261126200000.
-- 5. tenant_guard.redeem_account_claim: its text from 20261125050500 with
--    two changes. After it enters the tenant and before any row lock it takes
--    ('donor_party_writer', tenant:caller), so a claim and a gift of the same
--    login serialize. Before it links, it resolves the caller's Party in the
--    writer's order; a Party other than the claimed donor's, whether reached
--    by an account link, a worker row or the login's own donor, is offered
--    to staff through item 2, and the claim is refused with its one answer
--    ({"status":"refused"}) and the audited reason caller_already_linked
--    when the login has an account link, caller_has_other_party otherwise.
--    Nothing is linked or granted and the claimed donor is left as it was.
--    Owner tenant_guard, grants and answers unchanged; its reviewed digest in
--    scripts/verify/command-entry-boundaries.mjs moves with it.
--
-- One lock order for every writer of a donor or a link for (organization,
-- login): the organization FOR SHARE where the entry takes it, then
-- ('donor_party_writer', organization:login), then the caller's membership
-- rows FOR UPDATE in id order, then the claim or invitation row, then the
-- Party FOR UPDATE, then its donors. The saga takes its idempotency lock
-- first, as before.
--
-- Locks at migration time: object locks on the replaced functions only.
-- lock_timeout stops a run rather than queue it behind live traffic.
--
-- What the running build does: it calls begin_donation_saga with the same
-- arguments and gets the same answers; a login whose Party has no donor while
-- it holds one on another Party now answers 21000 (the intake's existing 409,
-- "Multiple donor records for this account") where it was given the other
-- Party's donor. No running code calls redeem_account_claim or the atomic
-- writer.
--
-- Recovery. A run lost between its COMMIT and its ledger row stops on the
-- next run at its first CREATE (private.login_party, 42723), rolling back.
-- This file has committed when this read-only check is true; it answers
-- false, never an error, when the function is absent:
--   SELECT to_regprocedure('private.login_party(uuid,uuid)') IS NOT NULL
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127060000.
--
-- Down (after the build that relies on it is rolled back; one transaction):
-- re-run, verbatim, the CREATE OR REPLACE of begin_donation_saga and of
-- atomic_create_donation_with_audit (while it exists) from 20261126200000;
-- GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard; SET LOCAL ROLE
-- tenant_guard; re-run the CREATE FUNCTION text of
-- tenant_guard.redeem_account_claim from 20261125050500 as CREATE OR
-- REPLACE; RESET ROLE; REVOKE CREATE ON SCHEMA tenant_guard FROM
-- tenant_guard; restore its reviewed digest; DROP FUNCTION
-- private.login_party(uuid, uuid),
-- private.record_claim_merge_candidate(uuid, uuid, uuid). Donors, links and
-- merge candidates written stay.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. The Party a login resolves to.
CREATE FUNCTION private.login_party(p_tenant_id UUID, p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_entered UUID;
  v_party_id UUID;
BEGIN
  v_entered := NULLIF(pg_catalog.current_setting('app.current_tenant_id', true), '')::UUID;
  IF (v_entered = p_tenant_id) IS NOT TRUE THEN
    RAISE EXCEPTION 'login_party: the transaction did not enter this organization'
      USING ERRCODE = '42501';
  END IF;

  SELECT al.party_id
    INTO v_party_id
    FROM public.account_links AS al
   WHERE al.tenant_id = p_tenant_id
     AND al.user_id = p_user_id;

  IF v_party_id IS NULL THEN
    SELECT m.party_id
      INTO v_party_id
      FROM public.missionaries AS m
     WHERE m.id = private.assignment_for_profile(p_tenant_id, p_user_id)
       AND m.tenant_id = p_tenant_id;
  END IF;

  IF v_party_id IS NULL THEN
    SELECT d.party_id
      INTO v_party_id
      FROM public.donors AS d
     WHERE d.tenant_id = p_tenant_id
       AND d.profile_id = p_user_id
       AND d.party_id IS NOT NULL;
  END IF;

  RETURN v_party_id;
END;
$$;
COMMENT ON FUNCTION private.login_party(UUID, UUID) IS
  'The Party a login resolves to in the organization the transaction entered, in the donor writer''s order: its account link''s, else its sole worker row''s, else its donor''s; NULL for none (AL-2678, WP5 rest 2). EXECUTE: tenant_guard.';
ALTER FUNCTION private.login_party(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.login_party(UUID, UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.login_party(UUID, UUID) TO tenant_guard;

-- 2. The pair a refused claim leaves for staff.
CREATE FUNCTION private.record_claim_merge_candidate(
  p_tenant_id UUID,
  p_claimed_donor_id UUID,
  p_other_party_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_entered UUID;
  v_count INTEGER;
  v_other UUID;
BEGIN
  v_entered := NULLIF(pg_catalog.current_setting('app.current_tenant_id', true), '')::UUID;
  IF (v_entered = p_tenant_id) IS NOT TRUE THEN
    RAISE EXCEPTION 'record_claim_merge_candidate: the transaction did not enter this organization'
      USING ERRCODE = '42501';
  END IF;

  SELECT pg_catalog.count(*)::INTEGER, (pg_catalog.array_agg(d.id))[1]
    INTO v_count, v_other
    FROM public.donors AS d
   WHERE d.tenant_id = p_tenant_id
     AND d.party_id = p_other_party_id;

  IF v_count <> 1 OR v_other = p_claimed_donor_id THEN
    RETURN false;
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('donor_merge_candidate'),
    pg_catalog.hashtext(
      p_tenant_id::TEXT || ':' || LEAST(v_other, p_claimed_donor_id)::TEXT
        || ':' || GREATEST(v_other, p_claimed_donor_id)::TEXT
    )
  );

  IF EXISTS (
    SELECT 1
      FROM public.donor_merge_candidates AS c
     WHERE c.tenant_id = p_tenant_id
       AND c.status = 'open'
       AND ((c.existing_donor_id = v_other AND c.incoming_donor_id = p_claimed_donor_id)
         OR (c.existing_donor_id = p_claimed_donor_id AND c.incoming_donor_id = v_other))
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO public.donor_merge_candidates (tenant_id, existing_donor_id, incoming_donor_id, confidence, signals)
  VALUES (p_tenant_id, v_other, p_claimed_donor_id, 'possible', '["account_claim_other_party"]'::JSONB);

  RETURN true;
END;
$$;
COMMENT ON FUNCTION private.record_claim_merge_candidate(UUID, UUID, UUID) IS
  'For a claim refused because the login is tied to another Party (AL-2678, WP5 rest 2): one open donor_merge_candidates row pairing that Party''s sole donor with the claimed donor, for staff to merge; nothing when the Party holds none or several, or the pair is already open in either direction. It reads under the advisory lock (donor_merge_candidate, tenant:pair), so two refusals of one pair at once record one. Never merges. EXECUTE: tenant_guard.';
ALTER FUNCTION private.record_claim_merge_candidate(UUID, UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.record_claim_merge_candidate(UUID, UUID, UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.record_claim_merge_candidate(UUID, UUID, UUID) TO tenant_guard;

-- 3. The legacy saga under the rule.
CREATE OR REPLACE FUNCTION public.begin_donation_saga(
  p_tenant_id UUID,
  p_profile_id UUID,
  p_actor_user_id UUID,
  p_amount BIGINT,
  p_currency TEXT DEFAULT 'usd',
  p_missionary_id UUID DEFAULT NULL,
  p_fund_id UUID DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_fee_extras JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path TO public
AS $function$
DECLARE
  v_outbox_id UUID;
  v_donation_id UUID;
  v_donor_id UUID;
  v_party_id UUID;
  v_donors INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero'
      USING ERRCODE = '22023';
  END IF;

  IF btrim(COALESCE(p_idempotency_key, '')) = '' THEN
    RAISE EXCEPTION 'Idempotency key is required'
      USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended(p_tenant_id::text || ':' || p_idempotency_key, 0)
  );

  SELECT id, donation_id
  INTO v_outbox_id, v_donation_id
  FROM public.donation_saga_outbox
  WHERE tenant_id = p_tenant_id
    AND idempotency_key = p_idempotency_key
    AND kind = 'legacy_saga'
  LIMIT 1;

  IF v_outbox_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'replayed', true,
      'outbox_id', v_outbox_id,
      'donation_id', v_donation_id
    );
  END IF;

  IF p_missionary_id IS NOT NULL THEN
    PERFORM 1
    FROM public.missionaries
    WHERE id = p_missionary_id
      AND tenant_id = p_tenant_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Missionary not found'
        USING ERRCODE = 'P0002';
    END IF;
  END IF;

  IF p_fund_id IS NOT NULL THEN
    PERFORM 1
    FROM public.funds
    WHERE id = p_fund_id
      AND tenant_id = p_tenant_id
      AND is_active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Fund not found or inactive'
        USING ERRCODE = 'P0002';
    END IF;
  END IF;

  IF p_profile_id IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(
      hashtext('donor_party_writer'),
      hashtext(p_tenant_id::text || ':' || p_profile_id::text)
    );

    v_party_id := public.donor_party_for_insert(p_tenant_id, p_profile_id, NULL, NULL);

    PERFORM 1
    FROM public.parties AS p
    WHERE p.tenant_id = p_tenant_id
      AND p.id = v_party_id
    FOR UPDATE;

    SELECT count(*)::integer, (array_agg(d.id ORDER BY d.id))[1]
    INTO v_donors, v_donor_id
    FROM public.donors AS d
    WHERE d.tenant_id = p_tenant_id
      AND d.party_id = v_party_id;

    IF v_donors > 1 THEN
      RAISE EXCEPTION 'More than one donor for this person in the organization'
        USING ERRCODE = '21000';
    END IF;

    IF v_donors = 0 THEN
      PERFORM 1
      FROM public.donors AS d
      WHERE d.tenant_id = p_tenant_id
        AND d.profile_id = p_profile_id;

      IF FOUND THEN
        RAISE EXCEPTION 'More than one donor for this person in the organization'
          USING ERRCODE = '21000';
      END IF;

      INSERT INTO public.donors (
        tenant_id,
        party_id,
        profile_id,
        giving_preferences,
        total_given
      )
      VALUES (
        p_tenant_id,
        v_party_id,
        p_profile_id,
        '{}'::jsonb,
        0
      )
      RETURNING id INTO v_donor_id;
    END IF;
  ELSE
    INSERT INTO public.donors (
      tenant_id,
      party_id,
      profile_id,
      giving_preferences,
      total_given
    )
    VALUES (
      p_tenant_id,
      public.donor_party_for_insert(p_tenant_id, NULL, NULL, NULL),
      NULL,
      '{}'::jsonb,
      0
    )
    RETURNING id INTO v_donor_id;
  END IF;

  INSERT INTO public.donations (
    tenant_id,
    donor_id,
    missionary_id,
    fund_id,
    amount,
    currency,
    status
  )
  VALUES (
    p_tenant_id,
    v_donor_id,
    p_missionary_id,
    p_fund_id,
    p_amount,
    lower(COALESCE(p_currency, 'usd')),
    'processing'
  )
  RETURNING id INTO v_donation_id;

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
    'donation_initiated',
    'donation',
    v_donation_id::TEXT,
    jsonb_build_object(
      'amount', p_amount,
      'currency', lower(COALESCE(p_currency, 'usd')),
      'missionaryId', p_missionary_id,
      'fundId', p_fund_id,
      'idempotencyKey', p_idempotency_key
    ),
    p_ip_address,
    p_user_agent
  );

  INSERT INTO public.donation_saga_outbox (
    tenant_id,
    donation_id,
    donor_id,
    missionary_id,
    fund_id,
    amount,
    currency,
    idempotency_key,
    status,
    next_attempt_at,
    fee_extras
  )
  VALUES (
    p_tenant_id,
    v_donation_id,
    v_donor_id,
    p_missionary_id,
    p_fund_id,
    p_amount,
    lower(COALESCE(p_currency, 'usd')),
    p_idempotency_key,
    'pending',
    NOW(),
    COALESCE(p_fee_extras, '{}'::jsonb)
  )
  RETURNING id INTO v_outbox_id;

  RETURN jsonb_build_object(
    'replayed', false,
    'outbox_id', v_outbox_id,
    'donation_id', v_donation_id,
    'donor_id', v_donor_id
  );
EXCEPTION
  WHEN unique_violation THEN
    SELECT id, donation_id
    INTO v_outbox_id, v_donation_id
    FROM public.donation_saga_outbox
    WHERE tenant_id = p_tenant_id
      AND idempotency_key = p_idempotency_key
      AND kind = 'legacy_saga'
    LIMIT 1;

    IF v_outbox_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'replayed', true,
        'outbox_id', v_outbox_id,
        'donation_id', v_donation_id
      );
    END IF;

    RAISE;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.begin_donation_saga(UUID, UUID, UUID, BIGINT, TEXT, UUID, UUID, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.begin_donation_saga(UUID, UUID, UUID, BIGINT, TEXT, UUID, UUID, TEXT, TEXT, TEXT, JSONB) TO service_role;

-- 4. The atomic donation writer, while it exists, under the same rule.
DO $guard$
BEGIN
  IF pg_catalog.to_regprocedure('public.atomic_create_donation_with_audit(uuid,uuid,uuid,uuid,bigint,text,uuid,text,text,jsonb,text,text)') IS NOT NULL THEN
    EXECUTE $definition$
CREATE OR REPLACE FUNCTION public.atomic_create_donation_with_audit(
  p_tenant_id UUID,
  p_donor_profile_id UUID,
  p_actor_user_id UUID,
  p_missionary_id UUID,
  p_amount BIGINT,
  p_currency TEXT DEFAULT 'usd',
  p_fund_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT 'pending',
  p_audit_action TEXT DEFAULT 'donation_created',
  p_details JSONB DEFAULT '{}'::jsonb,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_donor_id UUID;
  v_donation_id UUID;
  v_party_id UUID;
  v_donors INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero'
      USING ERRCODE = '22023';
  END IF;

  IF p_donor_profile_id IS NOT NULL THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtext('donor_party_writer'),
      pg_catalog.hashtext(p_tenant_id::text || ':' || p_donor_profile_id::text)
    );

    v_party_id := public.donor_party_for_insert(p_tenant_id, p_donor_profile_id, NULL, NULL);

    PERFORM 1
    FROM public.parties AS p
    WHERE p.tenant_id = p_tenant_id
      AND p.id = v_party_id
    FOR UPDATE;

    SELECT pg_catalog.count(*)::integer, (pg_catalog.array_agg(d.id ORDER BY d.id))[1]
    INTO v_donors, v_donor_id
    FROM public.donors AS d
    WHERE d.tenant_id = p_tenant_id
      AND d.party_id = v_party_id;

    IF v_donors > 1 THEN
      RAISE EXCEPTION 'More than one donor for this person in the organization'
        USING ERRCODE = '21000';
    END IF;

    IF v_donors = 0 THEN
      PERFORM 1
      FROM public.donors AS d
      WHERE d.tenant_id = p_tenant_id
        AND d.profile_id = p_donor_profile_id;

      IF FOUND THEN
        RAISE EXCEPTION 'More than one donor for this person in the organization'
          USING ERRCODE = '21000';
      END IF;

      INSERT INTO public.donors (
        tenant_id,
        party_id,
        profile_id,
        giving_preferences,
        total_given
      )
      VALUES (
        p_tenant_id,
        v_party_id,
        p_donor_profile_id,
        '{}'::jsonb,
        0
      )
      RETURNING id INTO v_donor_id;
    END IF;
  ELSE
    INSERT INTO public.donors (
      tenant_id,
      party_id,
      profile_id,
      giving_preferences,
      total_given
    )
    VALUES (
      p_tenant_id,
      public.donor_party_for_insert(p_tenant_id, NULL, NULL, NULL),
      NULL,
      '{}'::jsonb,
      0
    )
    RETURNING id INTO v_donor_id;
  END IF;

  INSERT INTO public.donations (
    tenant_id,
    donor_id,
    missionary_id,
    fund_id,
    amount,
    currency,
    status
  )
  VALUES (
    p_tenant_id,
    v_donor_id,
    p_missionary_id,
    p_fund_id,
    p_amount,
    lower(COALESCE(p_currency, 'usd')),
    p_status
  )
  RETURNING id INTO v_donation_id;

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
    p_audit_action,
    'donation',
    v_donation_id::TEXT,
    COALESCE(p_details, '{}'::jsonb),
    p_ip_address,
    p_user_agent
  );

  RETURN jsonb_build_object(
    'donation_id', v_donation_id,
    'donor_id', v_donor_id
  );
END;
$function$
$definition$;
  END IF;
END
$guard$;

-- 5. The claim under the writer's lock, refusing a login tied to another Party.
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
  'Pre-membership human command (AL-2678, W5-R5; WP5 rest 2 item zero (b)): redeems a claim token once, in the organization the request names, linking the caller to the donor''s Party with a donor membership. It takes the donor writer''s lock (''donor_party_writer'', organization:caller) before any row lock, and refuses a caller whose login already resolves to another Party there (link, sole worker row, own donor), offering that pair to staff. Answers {"status":"refused"} for every failure.';
RESET ROLE;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
