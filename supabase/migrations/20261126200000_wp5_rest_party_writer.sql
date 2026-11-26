-- AL-2678 (WP5 rest, pull request 1; brief stage5/wp5-rest.md section 3,
-- invariants 1-4, 8 and 11; rulings WP5 part 2 Q8, WP8a part 2 R2 Q15 and
-- Q-C, WP5 rest Q1 (b)). Every donor writer names the donor's Party before
-- the insert, through one Party writer.
--
-- 1. public.donor_party_for_insert(tenant, profile, name, contact address):
--    the one Party writer. A postgres-owned SECURITY DEFINER with an empty
--    search path, EXECUTE for tenant_guard and service_role only (signed-in
--    users and anon hold none, and nothing here grants them anything on
--    donors or parties). It reads nothing from the auth schema. It refuses
--    a NULL tenant (22004) and, in a transaction that entered a tenant
--    through tenant_guard.enter, any other tenant (42501).
--    With a profile it first takes a transaction advisory lock of its own
--    namespace on (tenant, profile), not the saga's idempotency key, so one
--    person's simultaneous first gifts in one organization serialize; then
--    it returns the person's existing Party there: their account link's,
--    else their sole worker row's (private.assignment_for_profile), else the
--    Party of their donor row there, which a session that waited on the lock
--    meets after the first session committed, so its own insert is discarded
--    by the donor key and no Party is left without a donor. Part 1's
--    temporary trigger (20261125050100:312-379) is the reference outcome for
--    link and worker row. Without a profile (a guest) it takes no lock and
--    makes one new Party, joined to no other row.
--    A new Party's name is the first of: the given name, the profile's
--    display name, its full name, the given contact address, 'Unnamed
--    supporter', each in the form private.normalize_safety_text gives it,
--    and skipped when that form is empty (rule 13: "blank" is what that
--    function returns NULL for, so a name of no-break spaces, ideographic
--    spaces or zero-width characters alone is blank).
--    It never writes an account link or a membership (ADR-0215).
-- 2. public.begin_donation_saga: its text from 20261024141000 with two
--    changes. Both idempotency lookups read only rows of kind 'legacy_saga'
--    (ruling Q-C), so a key held by a provider request is never answered as a
--    replay: the outbox key then refuses the call (23505) and nothing is
--    written. The donor insert names party_id through the writer. Signature,
--    SECURITY INVOKER, search path, owner, grants and answers are unchanged.
-- 3. public.atomic_create_donation_with_audit, only while it exists
--    (WP8a may drop it): its text from 20260223170000 with the donor insert
--    naming party_id through the writer; everything else unchanged.
-- 4. The catch-up (ruling Q1 (b)): part 1's link backfill
--    (20261125050100:255-259) repeated once, for donors and worker rows
--    written since: a login is linked ('profile_backfill') to the one Party
--    its donor and worker rows name in a tenant, only where exactly one
--    non-NULL Party results and the login exists; ON CONFLICT DO NOTHING, so
--    a login already linked there, to that Party or another, is never
--    relinked. After this migration a gift writes no link (ADR-0215).
-- 5. external_identifiers: its two non-blank checks become the safety
--    normalizer's rule (record section 9, #2805's one-argument btrim item),
--    written inline because service_role, the table's writer, may not
--    execute private.normalize_safety_text (a check's function needs the
--    writer's EXECUTE). The patterns are copied from 20261126010000 and a
--    suite compares them. Added NOT VALID, then validated (nothing writes
--    the table today).
--
-- Locks, all held to COMMIT: ACCESS EXCLUSIVE on external_identifiers
-- (empty) for its checks; ROW EXCLUSIVE on account_links for the catch-up;
-- ACCESS SHARE on donors,
-- missionaries, profiles and auth.users, which the catch-up reads; object
-- locks on the replaced functions. lock_timeout stops a run rather than
-- queue it behind live traffic.
--
-- Recovery. A run lost between its COMMIT and its ledger row stops on the
-- next run at its first CREATE (public.donor_party_for_insert, 42723),
-- rolling back. This file has committed when this read-only check is true:
-- SELECT to_regprocedure('public.donor_party_for_insert(uuid,uuid,text,text)')
-- IS NOT NULL. Then follow docs/ops/release-job.md, "If the migration
-- committed but its ledger row is missing", with this check and this file's
-- version, 20261126200000.
--
-- Down (only after the build that relies on the writer is rolled back; run by
-- hand in one transaction): re-run, verbatim, the CREATE OR REPLACE of
-- begin_donation_saga, its REVOKE and GRANT from 20261024141000, and the
-- CREATE OR REPLACE of atomic_create_donation_with_audit from 20260223170000
-- (while it exists); DROP FUNCTION
-- public.donor_party_for_insert(uuid,uuid,text,text); on external_identifiers
-- drop the two checks and add them back as 20261125050200 wrote them. Links
-- and Parties written stay, as part 1's do.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. The Party writer.
CREATE FUNCTION public.donor_party_for_insert(
  p_tenant_id UUID,
  p_profile_id UUID,
  p_name TEXT,
  p_email TEXT
)
RETURNS UUID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_entered UUID;
  v_party_id UUID;
  v_name TEXT;
BEGIN
  IF p_tenant_id IS NULL THEN
    RAISE EXCEPTION 'donor_party_for_insert: a donor''s Party needs its organization'
      USING ERRCODE = '22004';
  END IF;

  v_entered := NULLIF(pg_catalog.current_setting('app.current_tenant_id', true), '')::UUID;
  IF v_entered IS NOT NULL AND v_entered <> p_tenant_id THEN
    RAISE EXCEPTION 'donor_party_for_insert: this transaction entered another organization'
      USING ERRCODE = '42501';
  END IF;

  IF p_profile_id IS NOT NULL THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtext('donor_party_writer'),
      pg_catalog.hashtext(p_tenant_id::TEXT || ':' || p_profile_id::TEXT)
    );

    SELECT al.party_id
      INTO v_party_id
      FROM public.account_links AS al
     WHERE al.tenant_id = p_tenant_id
       AND al.user_id = p_profile_id;

    IF v_party_id IS NULL THEN
      SELECT m.party_id
        INTO v_party_id
        FROM public.missionaries AS m
       WHERE m.id = private.assignment_for_profile(p_tenant_id, p_profile_id)
         AND m.tenant_id = p_tenant_id;
    END IF;

    IF v_party_id IS NULL THEN
      SELECT d.party_id
        INTO v_party_id
        FROM public.donors AS d
       WHERE d.tenant_id = p_tenant_id
         AND d.profile_id = p_profile_id
         AND d.party_id IS NOT NULL;
    END IF;

    IF v_party_id IS NOT NULL THEN
      RETURN v_party_id;
    END IF;
  END IF;

  SELECT COALESCE(
           private.normalize_safety_text(p_name),
           private.normalize_safety_text(p.display_name),
           private.normalize_safety_text(p.full_name),
           private.normalize_safety_text(p_email),
           'Unnamed supporter'
         )
    INTO v_name
    FROM (SELECT 1) AS one
    LEFT JOIN public.profiles AS p ON p.id = p_profile_id;

  INSERT INTO public.parties (tenant_id, display_name)
  VALUES (p_tenant_id, v_name)
  RETURNING id INTO v_party_id;

  RETURN v_party_id;
END;
$$;
COMMENT ON FUNCTION public.donor_party_for_insert(UUID, UUID, TEXT, TEXT) IS
  'The one Party writer of every donor insert (AL-2678, WP5 rest; WP8a''s entry): the person''s Party in the tenant (account link, else sole worker row, else their donor row), serialized per (tenant, profile) on its own advisory lock, else one new Party; a guest always gets a new one. Never links an account or grants a membership. EXECUTE: tenant_guard and service_role.';
ALTER FUNCTION public.donor_party_for_insert(UUID, UUID, TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.donor_party_for_insert(UUID, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.donor_party_for_insert(UUID, UUID, TEXT, TEXT) TO tenant_guard, service_role;

-- 2. The legacy saga: legacy-only lookups, the Party named at insert.
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

  SELECT id
  INTO v_donor_id
  FROM public.donors
  WHERE tenant_id = p_tenant_id
    AND profile_id = p_profile_id
  LIMIT 1;

  IF v_donor_id IS NULL THEN
    INSERT INTO public.donors (
      tenant_id,
      party_id,
      profile_id,
      giving_preferences,
      total_given
    )
    VALUES (
      p_tenant_id,
      public.donor_party_for_insert(p_tenant_id, p_profile_id, NULL, NULL),
      p_profile_id,
      '{}'::jsonb,
      0
    )
    ON CONFLICT (tenant_id, profile_id) DO NOTHING
    RETURNING id INTO v_donor_id;

    IF v_donor_id IS NULL THEN
      SELECT id
      INTO v_donor_id
      FROM public.donors
      WHERE tenant_id = p_tenant_id
        AND profile_id = p_profile_id
      LIMIT 1;
    END IF;
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

-- 3. The atomic donation writer, while it exists.
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
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero'
      USING ERRCODE = '22023';
  END IF;

  SELECT id
  INTO v_donor_id
  FROM public.donors
  WHERE tenant_id = p_tenant_id
    AND profile_id = p_donor_profile_id
  LIMIT 1;

  IF v_donor_id IS NULL THEN
    INSERT INTO public.donors (
      tenant_id,
      party_id,
      profile_id,
      giving_preferences,
      total_given
    )
    VALUES (
      p_tenant_id,
      public.donor_party_for_insert(p_tenant_id, p_donor_profile_id, NULL, NULL),
      p_donor_profile_id,
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

-- 4. The catch-up of account links (ruling Q1 (b)), once.
-- catch-up: begin
INSERT INTO public.account_links (tenant_id, user_id, party_id, linked_via)
SELECT c.tenant_id, c.user_id, (pg_catalog.array_agg(DISTINCT c.party_id))[1], 'profile_backfill'
  FROM (
    SELECT d.tenant_id, p.user_id, d.party_id
      FROM public.donors AS d
      JOIN public.profiles AS p ON p.id = d.profile_id
     WHERE d.tenant_id IS NOT NULL
       AND d.party_id IS NOT NULL
    UNION ALL
    SELECT m.tenant_id, p.user_id, m.party_id
      FROM public.missionaries AS m
      JOIN public.profiles AS p ON p.id = m.profile_id
  ) AS c
 WHERE EXISTS (SELECT 1 FROM auth.users AS u WHERE u.id = c.user_id)
 GROUP BY c.tenant_id, c.user_id
HAVING pg_catalog.count(DISTINCT c.party_id) = 1
ON CONFLICT DO NOTHING;
-- catch-up: end

-- 5. external_identifiers: blank is what the safety normalizer leaves empty.
ALTER TABLE public.external_identifiers
  DROP CONSTRAINT external_identifiers_source_check,
  DROP CONSTRAINT external_identifiers_external_id_check,
  ADD CONSTRAINT external_identifiers_source_check CHECK (
    NULLIF(pg_catalog.btrim(pg_catalog.regexp_replace(pg_catalog.normalize(pg_catalog.regexp_replace(source, $re$[\u0001-\u0008\u000E-\u001F\u007F-\u0084\u0086-\u009F\u00AD\u034F\u061C\u070F\u115F\u1160\u17B4\u17B5\u180B-\u180F\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2800\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFFB\U00013430-\U0001343F\U00013441-\U00013442\U0001BCA0-\U0001BCA3\U0001D159\U0001D173-\U0001D17A\U000E0000-\U000E0FFF]$re$, '', 'g'), 'NFC'), $ws$[\u0009-\u000D\u0020\u0085\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+$ws$, ' ', 'g')), '') IS NOT NULL
  ) NOT VALID,
  ADD CONSTRAINT external_identifiers_external_id_check CHECK (
    NULLIF(pg_catalog.btrim(pg_catalog.regexp_replace(pg_catalog.normalize(pg_catalog.regexp_replace(external_id, $re$[\u0001-\u0008\u000E-\u001F\u007F-\u0084\u0086-\u009F\u00AD\u034F\u061C\u070F\u115F\u1160\u17B4\u17B5\u180B-\u180F\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2800\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFFB\U00013430-\U0001343F\U00013441-\U00013442\U0001BCA0-\U0001BCA3\U0001D159\U0001D173-\U0001D17A\U000E0000-\U000E0FFF]$re$, '', 'g'), 'NFC'), $ws$[\u0009-\u000D\u0020\u0085\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+$ws$, ' ', 'g')), '') IS NOT NULL
  ) NOT VALID;
ALTER TABLE public.external_identifiers VALIDATE CONSTRAINT external_identifiers_source_check;
ALTER TABLE public.external_identifiers VALIDATE CONSTRAINT external_identifiers_external_id_check;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
