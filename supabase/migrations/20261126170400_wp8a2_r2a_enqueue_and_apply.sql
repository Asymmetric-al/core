-- AL-2681 (WP8a part 2, R2a, M5; plan line 1137; index sections 3.5, 4 and
-- 5, binding; TP2 sections 5, 6 and 9; TP4 :280 and :357; rulings Q12, Q-A,
-- Q-B and Q-F): the one writer of a provider request, and the command that
-- applies a stored payment event. Nothing calls them yet: 2b's intake calls
-- the enqueue and 2b's route stores the events.
--
-- 1. tenant_guard.money_enqueue_payment_request(uuid) RETURNS uuid: owned by
--    postgres, invoker, EXECUTE for tenant_guard only. On the locked
--    line-based intake of the entered tenant (42501 not_found otherwise): a
--    pending intake with no reference (55000 intake_not_payable), an active
--    binding (55000 binding_inactive), a donor line and lines that sum to the
--    amount (23514 intake_lines_incomplete). The binding is read FOR SHARE,
--    after the intake's lock: a status change in flight (part 1's account
--    apply holds the binding FOR NO KEY UPDATE) is waited for and read once
--    committed, while the claim's unlocked read and the key checks' FOR KEY
--    SHARE do not conflict with it, and the account apply never locks an
--    intake, so the two orders cannot meet in a cycle. It inserts one queued
--    create_payment request with the intake's amount, currency, account and
--    mode, metadata of ids and cents only, the payment-method key of the
--    intake's method, and the parameters' digest; it returns the request id.
--    A second request for one intake is 23505.
-- 2. tenant_guard.money_apply_payment_event(uuid) RETURNS jsonb, the core:
--    owned by postgres, invoker, EXECUTE for tenant_guard only. It applies a
--    stored payment event of the entered tenant from the event alone: the
--    stored v1 Event checked against its row (22023 payment_event_malformed);
--    the intake found by the event's account, mode and PaymentIntent, or by
--    the request its metadata names on that account and mode (the operation
--    match); every amount check before any write; contradictions to one
--    Mission Control task and one payment_contradiction link, with no money
--    row changed; terminal effects by key, the display state by the event's
--    creation time (strictly newer wins); one staged gift and one allocation
--    per line on the first success. Calling it again on one event changes
--    nothing and raises nothing. The event's recorded contradiction is looked
--    up again right after the intake's row lock, on both lookup paths,
--    because every contradiction is written under that lock and a direct
--    call (WP8c's adoption) may have passed the first lookup before another
--    session committed one; the event row is not locked here, since a caller
--    that already holds the request and the intake would then invert the
--    worker's order (event, account, request, intake).
-- 3. tenant_guard.apply_payment_outcome(uuid, uuid, integer) RETURNS jsonb,
--    the worker entry: a SECURITY DEFINER owned by tenant_guard (the
--    three-step transfer), EXECUTE for service_role. It enters the tenant,
--    locks the event and its account, fences the attempt (55000
--    stale_attempt, 55000 lease_lost) against part 1's claim, replays a
--    processed attempt, runs the core, and completes the event and releases
--    the account's sync lease, except when the core answers unmatched.
-- 4. public.apply_payment_outcome(uuid, integer) RETURNS jsonb, the wrapper:
--    owned by postgres, invoker, EXECUTE for service_role, no tenant
--    argument and no write; it reads the event's tenant once and answers
--    unknown_anchor when there is none.
-- Every SELECT and RETURNING names its columns; every relation and built-in
-- is schema-qualified. Locks at run time, in one order for every path: the
-- event and its account (the entry), the request (operation match only), the
-- intake; the staged gift is looked for under the intake's lock. R1a's order,
-- the request before the intake, is kept.
--
-- Locks: none at migration time (functions only).
--
-- A second run of the applied file, as observed: it stops at its first
-- CREATE FUNCTION (42723, tenant_guard.money_enqueue_payment_request already
-- exists), and changes nothing. This file has committed when this read-only
-- check is true; it answers false, never an error, when the function is
-- absent:
--   SELECT to_regprocedure('public.apply_payment_outcome(uuid,integer)') IS NOT NULL
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version.
--
-- Down, an operator's last resort, in one transaction, before the Down of
-- every earlier R2a file; it refuses while a provider request exists:
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   LOCK TABLE public.donation_saga_outbox IN ACCESS EXCLUSIVE MODE;
--   DO $$
--   BEGIN
--     IF EXISTS (SELECT 1 FROM public.donation_saga_outbox WHERE kind = 'provider_request') THEN
--       RAISE EXCEPTION 'Down of the R2a enqueue and apply refused: a provider request exists' USING ERRCODE = '55000';
--     END IF;
--   END
--   $$;
--   DROP FUNCTION public.apply_payment_outcome(uuid, integer),
--     tenant_guard.apply_payment_outcome(uuid, uuid, integer),
--     tenant_guard.money_apply_payment_event(uuid),
--     tenant_guard.money_enqueue_payment_request(uuid);
--   COMMIT;

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE FUNCTION tenant_guard.money_enqueue_payment_request(p_donation_id UUID)
RETURNS UUID
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_intake RECORD;
  v_found BOOLEAN;
  v_binding_status TEXT;
  v_donor_lines BIGINT;
  v_donor_sum NUMERIC;
  v_fee_sum NUMERIC;
  v_id UUID;
  v_metadata JSONB;
  v_params JSONB;
BEGIN
  SELECT d.id, d.tenant_id, d.status, d.amount, d.currency, d.payment_account_binding_id,
         d.provider_account_ref, d.livemode, d.payment_method, d.stripe_payment_intent_id
    INTO v_intake
    FROM public.donations AS d
   WHERE d.id = p_donation_id
     FOR NO KEY UPDATE;
  v_found := FOUND;

  IF NOT v_found THEN
    RAISE EXCEPTION 'not_found'
      USING ERRCODE = '42501',
            DETAIL = 'No line-based intake with this id in the entered tenant.';
  END IF;

  IF (v_intake.status = 'pending' AND v_intake.stripe_payment_intent_id IS NULL) IS NOT TRUE THEN
    RAISE EXCEPTION 'intake_not_payable'
      USING ERRCODE = '55000',
            DETAIL = 'Only a pending intake with no payment reference gets a provider request.';
  END IF;

  SELECT b.status
    INTO v_binding_status
    FROM public.payment_account_bindings AS b
   WHERE b.tenant_id = v_intake.tenant_id
     AND b.id = v_intake.payment_account_binding_id
     FOR SHARE;

  IF (v_binding_status = 'active') IS NOT TRUE THEN
    RAISE EXCEPTION 'binding_inactive'
      USING ERRCODE = '55000',
            DETAIL = 'The intake''s payment account binding is not active.';
  END IF;

  SELECT pg_catalog.count(*) FILTER (WHERE NOT l.is_fee_cover),
         COALESCE(pg_catalog.sum(l.amount) FILTER (WHERE NOT l.is_fee_cover), 0),
         COALESCE(pg_catalog.sum(l.amount) FILTER (WHERE l.is_fee_cover), 0)
    INTO v_donor_lines, v_donor_sum, v_fee_sum
    FROM public.donation_intake_lines AS l
   WHERE l.tenant_id = v_intake.tenant_id
     AND l.donation_id = v_intake.id;

  IF (v_donor_lines > 0 AND v_donor_sum + v_fee_sum = v_intake.amount) IS NOT TRUE THEN
    RAISE EXCEPTION 'intake_lines_incomplete'
      USING ERRCODE = '23514',
            DETAIL = 'An intake needs a donor line, and its lines must sum to its amount.';
  END IF;

  v_id := pg_catalog.gen_random_uuid();

  v_metadata := pg_catalog.jsonb_build_object(
    'asym_operation', v_id::TEXT,
    'asym_intake', v_intake.id::TEXT,
    'gift_amount_cents', v_donor_sum::BIGINT::TEXT,
    'cover_fees', CASE WHEN v_fee_sum > 0 THEN 'true' ELSE 'false' END,
    'cover_amount_cents', v_fee_sum::BIGINT::TEXT
  );
  IF v_intake.payment_method IS NOT NULL THEN
    v_metadata := v_metadata || pg_catalog.jsonb_build_object('payment_method', v_intake.payment_method);
  END IF;

  v_params := pg_catalog.jsonb_build_object(
    'amount', v_intake.amount,
    'currency', v_intake.currency,
    'metadata', v_metadata
  ) || CASE
         WHEN v_intake.payment_method IS NULL THEN
           pg_catalog.jsonb_build_object('automatic_payment_methods', pg_catalog.jsonb_build_object('enabled', true))
         WHEN v_intake.payment_method = 'ach' THEN
           pg_catalog.jsonb_build_object('payment_method_types', pg_catalog.jsonb_build_array('us_bank_account'))
         ELSE
           pg_catalog.jsonb_build_object('payment_method_types', pg_catalog.jsonb_build_array('card'))
       END;

  INSERT INTO public.donation_saga_outbox (
    id,
    tenant_id,
    donation_id,
    amount,
    currency,
    idempotency_key,
    status,
    next_attempt_at,
    request_kind,
    provider_account_ref,
    livemode,
    request_params,
    request_digest
  )
  VALUES (
    v_id,
    v_intake.tenant_id,
    v_intake.id,
    v_intake.amount,
    v_intake.currency,
    'gift:' || v_intake.id::TEXT || ':create_payment',
    'queued',
    pg_catalog.clock_timestamp(),
    'create_payment',
    v_intake.provider_account_ref,
    v_intake.livemode,
    v_params,
    pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_params::TEXT, 'UTF8')), 'hex')
  );

  RETURN v_id;
END;
$$;

CREATE FUNCTION tenant_guard.money_apply_payment_event(p_event_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_event RECORD;
  v_found BOOLEAN;
  v_payload JSONB;
  v_object JSONB;
  v_effect TEXT;
  v_pi TEXT;
  v_amount BIGINT;
  v_received BIGINT;
  v_currency TEXT;
  v_operation TEXT;
  v_link RECORD;
  v_intake RECORD;
  v_request RECORD;
  v_case_id UUID;
  v_reason TEXT;
  v_operation_id UUID;
  v_earlier TEXT;
  v_newer BOOLEAN;
  v_status_after TEXT;
  v_gift_id UUID;
  v_line_count BIGINT;
  v_observed UUID;
  v_task_id UUID;
  v_outcome TEXT;
BEGIN
  SELECT e.id, e.tenant_id, e.stripe_event_id, e.event_type, e.livemode,
         e.provider_account_id, e.event_created_at, e.raw_payload
    INTO v_event
    FROM public.stripe_connect_events AS e
   WHERE e.id = p_event_id;
  v_found := FOUND;

  IF NOT v_found THEN
    RAISE EXCEPTION 'not_found'
      USING ERRCODE = '42501',
            DETAIL = 'No payment event with this id in the entered tenant.';
  END IF;

  v_payload := v_event.raw_payload;

  IF (pg_catalog.jsonb_typeof(v_payload) = 'object'
      AND pg_catalog.jsonb_typeof(v_payload -> 'object') = 'string'
      AND (v_payload ->> 'object') = 'event'
      AND pg_catalog.jsonb_typeof(v_payload -> 'id') = 'string'
      AND (v_payload ->> 'id') = v_event.stripe_event_id
      AND pg_catalog.jsonb_typeof(v_payload -> 'type') = 'string'
      AND (v_payload ->> 'type') = v_event.event_type
      AND pg_catalog.jsonb_typeof(v_payload -> 'account') = 'string'
      AND (v_payload ->> 'account') = v_event.provider_account_id
      AND pg_catalog.jsonb_typeof(v_payload -> 'livemode') = 'boolean'
      AND (v_payload -> 'livemode') = pg_catalog.to_jsonb(v_event.livemode)
      AND pg_catalog.jsonb_typeof(v_payload -> 'created') = 'number'
      AND CASE
            WHEN (v_payload ->> 'created') ~ '^(0|[1-9][0-9]{0,10})$' THEN
              pg_catalog.to_timestamp((v_payload ->> 'created')::DOUBLE PRECISION) = v_event.event_created_at
            ELSE false
          END) IS NOT TRUE THEN
    RAISE EXCEPTION 'payment_event_malformed'
      USING ERRCODE = '22023',
            DETAIL = 'The stored event''s object, id, type, account, mode or creation time disagrees with its row.';
  END IF;

  v_effect := CASE v_event.event_type
    WHEN 'payment_intent.succeeded' THEN 'succeeded'
    WHEN 'payment_intent.canceled' THEN 'canceled'
    WHEN 'payment_intent.processing' THEN 'processing'
    WHEN 'payment_intent.payment_failed' THEN 'payment_failed'
  END;

  IF v_effect IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'ignored_type');
  END IF;

  v_object := v_payload -> 'data' -> 'object';

  IF (pg_catalog.jsonb_typeof(v_payload -> 'data') = 'object'
      AND pg_catalog.jsonb_typeof(v_object) = 'object'
      AND pg_catalog.jsonb_typeof(v_object -> 'object') = 'string'
      AND (v_object ->> 'object') = 'payment_intent'
      AND pg_catalog.jsonb_typeof(v_object -> 'id') = 'string'
      AND (v_object ->> 'id') ~ '^pi_[A-Za-z0-9]+$'
      AND pg_catalog.jsonb_typeof(v_object -> 'amount') = 'number'
      AND (v_object ->> 'amount') ~ '^(0|[1-9][0-9]{0,17})$'
      AND (v_effect <> 'succeeded'
           OR (pg_catalog.jsonb_typeof(v_object -> 'amount_received') = 'number'
               AND (v_object ->> 'amount_received') ~ '^(0|[1-9][0-9]{0,17})$'))
      AND pg_catalog.jsonb_typeof(v_object -> 'currency') = 'string'
      AND (v_object ->> 'currency') ~ '^[a-z]{3}$'
      AND pg_catalog.jsonb_typeof(v_object -> 'livemode') = 'boolean'
      AND (v_object -> 'livemode') = pg_catalog.to_jsonb(v_event.livemode)
      AND pg_catalog.jsonb_typeof(v_object -> 'metadata') = 'object') IS NOT TRUE THEN
    RAISE EXCEPTION 'payment_event_malformed'
      USING ERRCODE = '22023',
            DETAIL = 'The stored event''s PaymentIntent is not a PaymentIntent of this mode with integer amounts, a currency and metadata.';
  END IF;

  v_pi := v_object ->> 'id';
  v_amount := (v_object ->> 'amount')::BIGINT;
  v_received := CASE WHEN v_effect = 'succeeded' THEN (v_object ->> 'amount_received')::BIGINT END;
  v_currency := v_object ->> 'currency';

  SELECT l.task_id, l.metadata
    INTO v_link
    FROM public.mission_control_task_links AS l
   WHERE l.tenant_id = v_event.tenant_id
     AND l.record_type = 'stripe_connect_event'
     AND l.record_id = p_event_id::TEXT
     AND l.relationship = 'payment_contradiction';
  IF FOUND THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'contradiction',
      'reason', v_link.metadata ->> 'reason',
      'task_id', v_link.task_id,
      'effect', v_effect,
      'payment_object_id', v_pi,
      'donation_id', v_link.metadata -> 'donation_id'
    );
  END IF;

  <<decide>>
  BEGIN
    SELECT d.id, d.tenant_id, d.legal_entity_id, d.status, d.amount, d.currency,
           d.stripe_payment_intent_id
      INTO v_intake
      FROM public.donations AS d
     WHERE d.tenant_id = v_event.tenant_id
       AND d.provider_account_ref = v_event.provider_account_id
       AND d.livemode = v_event.livemode
       AND d.stripe_payment_intent_id = v_pi
       FOR NO KEY UPDATE;
    v_found := FOUND;

    IF v_found THEN
      SELECT l.task_id, l.metadata
        INTO v_link
        FROM public.mission_control_task_links AS l
       WHERE l.tenant_id = v_event.tenant_id
         AND l.record_type = 'stripe_connect_event'
         AND l.record_id = p_event_id::TEXT
         AND l.relationship = 'payment_contradiction';
      IF FOUND THEN
        RETURN pg_catalog.jsonb_build_object(
          'outcome', 'contradiction',
          'reason', v_link.metadata ->> 'reason',
          'task_id', v_link.task_id,
          'effect', v_effect,
          'payment_object_id', v_pi,
          'donation_id', v_link.metadata -> 'donation_id'
        );
      END IF;
    END IF;

    IF NOT v_found THEN
      IF (pg_catalog.jsonb_typeof(v_object -> 'metadata' -> 'asym_operation') = 'string'
          AND (v_object -> 'metadata' ->> 'asym_operation')
                ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') IS NOT TRUE THEN
        RETURN pg_catalog.jsonb_build_object(
          'outcome', 'unmatched',
          'effect', v_effect,
          'payment_object_id', v_pi,
          'reason', 'no_operation'
        );
      END IF;
      v_operation := v_object -> 'metadata' ->> 'asym_operation';

      SELECT o.id, o.donation_id, o.status, o.first_sent_at, o.amount, o.currency
        INTO v_request
        FROM public.donation_saga_outbox AS o
       WHERE o.id = v_operation::UUID
         AND o.kind = 'provider_request'
         AND o.tenant_id = v_event.tenant_id
         AND o.provider_account_ref = v_event.provider_account_id
         AND o.livemode = v_event.livemode
         FOR NO KEY UPDATE;
      v_found := FOUND;

      IF NOT v_found THEN
        RETURN pg_catalog.jsonb_build_object(
          'outcome', 'unmatched',
          'effect', v_effect,
          'payment_object_id', v_pi,
          'reason', 'unknown_operation'
        );
      END IF;
      v_operation_id := v_request.id;

      SELECT d.id, d.tenant_id, d.legal_entity_id, d.status, d.amount, d.currency,
             d.stripe_payment_intent_id
        INTO v_intake
        FROM public.donations AS d
       WHERE d.id = v_request.donation_id
         FOR NO KEY UPDATE;

      SELECT l.task_id, l.metadata
        INTO v_link
        FROM public.mission_control_task_links AS l
       WHERE l.tenant_id = v_event.tenant_id
         AND l.record_type = 'stripe_connect_event'
         AND l.record_id = p_event_id::TEXT
         AND l.relationship = 'payment_contradiction';
      IF FOUND THEN
        RETURN pg_catalog.jsonb_build_object(
          'outcome', 'contradiction',
          'reason', v_link.metadata ->> 'reason',
          'task_id', v_link.task_id,
          'effect', v_effect,
          'payment_object_id', v_pi,
          'donation_id', v_link.metadata -> 'donation_id'
        );
      END IF;

      IF (v_intake.stripe_payment_intent_id = v_pi) IS TRUE THEN
        NULL;
      ELSIF ((v_object -> 'metadata' -> 'asym_intake') = pg_catalog.to_jsonb(v_request.donation_id::TEXT)) IS NOT TRUE THEN
        v_reason := 'operation_mismatch';
        EXIT decide;
      ELSIF v_intake.stripe_payment_intent_id IS NOT NULL THEN
        v_reason := 'intake_names_another_object';
        EXIT decide;
      ELSIF v_request.status = 'parked' THEN
        SELECT c.id
          INTO v_case_id
          FROM public.payment_repair_cases AS c
         WHERE c.tenant_id = v_event.tenant_id
           AND c.operation_id = v_request.id
           AND c.resolved_at IS NULL;
        RETURN pg_catalog.jsonb_build_object(
          'outcome', 'case_evidence',
          'effect', v_effect,
          'payment_object_id', v_pi,
          'donation_id', v_intake.id,
          'case_id', v_case_id
        );
      ELSIF v_request.status IN ('sending', 'retry_wait') AND v_request.first_sent_at IS NOT NULL THEN
        IF (v_amount = v_request.amount
            AND v_currency = v_request.currency
            AND (v_effect <> 'succeeded' OR v_received = v_request.amount)) IS NOT TRUE THEN
          v_reason := 'amount_mismatch';
          EXIT decide;
        END IF;
        UPDATE public.donations
           SET stripe_payment_intent_id = v_pi,
               updated_at = pg_catalog.clock_timestamp()
         WHERE id = v_intake.id;
        v_intake.stripe_payment_intent_id := v_pi;
      ELSE
        v_reason := 'request_' || v_request.status;
        EXIT decide;
      END IF;
    END IF;

    IF (v_amount = v_intake.amount
        AND v_currency = v_intake.currency
        AND (v_effect <> 'succeeded' OR v_received = v_intake.amount)) IS NOT TRUE THEN
      v_reason := 'amount_mismatch';
      EXIT decide;
    END IF;

    SELECT p.effect_kind
      INTO v_earlier
      FROM public.payment_observations AS p
     WHERE p.event_id = p_event_id;
    IF FOUND THEN
      RETURN pg_catalog.jsonb_build_object(
        'outcome', 'no_change',
        'effect', v_earlier,
        'payment_object_id', v_pi,
        'donation_id', v_intake.id,
        'status', v_intake.status
      );
    END IF;

    SELECT p.effect_kind
      INTO v_earlier
      FROM public.payment_observations AS p
     WHERE p.provider_account_ref = v_event.provider_account_id
       AND p.livemode = v_event.livemode
       AND p.payment_object_id = v_pi
       AND p.effect_kind IN ('succeeded', 'canceled');
    IF NOT FOUND THEN
      v_earlier := NULL;
    END IF;

    IF v_earlier IS NOT NULL AND v_effect = v_earlier THEN
      RETURN pg_catalog.jsonb_build_object(
        'outcome', 'no_change',
        'effect', v_effect,
        'payment_object_id', v_pi,
        'donation_id', v_intake.id,
        'status', v_intake.status
      );
    END IF;

    IF v_earlier = 'succeeded' AND v_effect = 'canceled' THEN
      v_reason := 'cancel_after_success';
      EXIT decide;
    END IF;

    IF v_earlier = 'canceled' AND v_effect = 'succeeded' THEN
      v_reason := 'success_after_cancel';
      EXIT decide;
    END IF;

    IF v_effect IN ('processing', 'payment_failed') THEN
      SELECT NOT EXISTS (
               SELECT 1
                 FROM public.payment_observations AS p
                WHERE p.tenant_id = v_intake.tenant_id
                  AND p.donation_id = v_intake.id
                  AND p.payment_object_id = v_pi
                  AND p.effect_kind IN ('processing', 'payment_failed')
                  AND p.provider_created_at >= v_event.event_created_at
             )
        INTO v_newer;
      IF v_earlier IS NOT NULL OR NOT v_newer THEN
        v_outcome := 'stale';
        v_status_after := v_intake.status;
      ELSE
        v_outcome := 'applied';
        v_status_after := CASE v_effect WHEN 'processing' THEN 'processing' ELSE 'failed' END;
      END IF;
    ELSE
      v_outcome := 'applied';
      v_status_after := CASE v_effect WHEN 'succeeded' THEN 'completed' ELSE 'failed' END;
    END IF;

    INSERT INTO public.payment_observations (
      tenant_id,
      donation_id,
      event_id,
      provider_account_ref,
      livemode,
      payment_object_id,
      effect_kind,
      provider_created_at,
      amount,
      currency
    )
    VALUES (
      v_intake.tenant_id,
      v_intake.id,
      p_event_id,
      v_event.provider_account_id,
      v_event.livemode,
      v_pi,
      v_effect,
      v_event.event_created_at,
      v_amount,
      v_currency
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_observed;

    IF v_observed IS NULL THEN
      SELECT p.effect_kind
        INTO v_earlier
        FROM public.payment_observations AS p
       WHERE p.event_id = p_event_id;
      IF FOUND THEN
        RETURN pg_catalog.jsonb_build_object(
          'outcome', 'no_change',
          'effect', v_earlier,
          'payment_object_id', v_pi,
          'donation_id', v_intake.id,
          'status', v_intake.status
        );
      END IF;
      SELECT p.effect_kind
        INTO v_earlier
        FROM public.payment_observations AS p
       WHERE p.provider_account_ref = v_event.provider_account_id
         AND p.livemode = v_event.livemode
         AND p.payment_object_id = v_pi
         AND p.effect_kind IN ('succeeded', 'canceled');
      IF v_earlier = v_effect THEN
        RETURN pg_catalog.jsonb_build_object(
          'outcome', 'no_change',
          'effect', v_effect,
          'payment_object_id', v_pi,
          'donation_id', v_intake.id,
          'status', v_intake.status
        );
      END IF;
      v_reason := CASE v_effect WHEN 'canceled' THEN 'cancel_after_success' ELSE 'success_after_cancel' END;
      EXIT decide;
    END IF;

    IF v_outcome = 'stale' THEN
      RETURN pg_catalog.jsonb_build_object(
        'outcome', 'stale',
        'effect', v_effect,
        'payment_object_id', v_pi,
        'donation_id', v_intake.id,
        'status', v_intake.status
      );
    END IF;

    IF v_status_after IS DISTINCT FROM v_intake.status THEN
      UPDATE public.donations
         SET status = v_status_after,
             updated_at = pg_catalog.clock_timestamp()
       WHERE id = v_intake.id;
    END IF;

    IF v_effect = 'succeeded' THEN
      SELECT g.id
        INTO v_gift_id
        FROM public.staged_gifts AS g
       WHERE g.tenant_id = v_intake.tenant_id
         AND g.donation_id = v_intake.id;
      IF FOUND THEN
        v_gift_id := NULL;
      ELSE
        SELECT pg_catalog.count(*)
          INTO v_line_count
          FROM public.donation_intake_lines AS l
         WHERE l.tenant_id = v_intake.tenant_id
           AND l.donation_id = v_intake.id;

        INSERT INTO public.staged_gifts (
          tenant_id,
          donation_id,
          legal_entity_id,
          amount,
          currency,
          status,
          donor_match_status,
          allocation_status,
          review_reason,
          stripe_payment_intent_id,
          stripe_event_id
        )
        VALUES (
          v_intake.tenant_id,
          v_intake.id,
          v_intake.legal_entity_id,
          v_intake.amount,
          v_intake.currency,
          'needs_review',
          'needs_review',
          CASE WHEN v_line_count > 1 THEN 'split' ELSE 'single_allocation' END,
          'identity_pending',
          v_pi,
          v_event.stripe_event_id
        )
        RETURNING id INTO v_gift_id;

        INSERT INTO public.staged_gift_allocations (
          tenant_id,
          staged_gift_id,
          legal_entity_id,
          line_number,
          fund_id,
          missionary_id,
          is_fee_cover,
          amount
        )
        SELECT l.tenant_id,
               v_gift_id,
               l.legal_entity_id,
               l.line_number,
               l.fund_id,
               l.missionary_id,
               l.is_fee_cover,
               l.amount
          FROM public.donation_intake_lines AS l
         WHERE l.tenant_id = v_intake.tenant_id
           AND l.donation_id = v_intake.id
         ORDER BY l.line_number;
      END IF;
    END IF;

    INSERT INTO public.audit_logs (
      tenant_id,
      user_id,
      action,
      resource_type,
      resource_id,
      details
    )
    VALUES (
      v_intake.tenant_id,
      NULL,
      'payment_applied',
      'donation',
      v_intake.id::TEXT,
      pg_catalog.jsonb_build_object(
        'event_id', p_event_id,
        'stripe_event_id', v_event.stripe_event_id,
        'effect', v_effect,
        'status_before', v_intake.status,
        'status_after', v_status_after,
        'staged_gift_id', v_gift_id
      )
    );

    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'applied',
      'effect', v_effect,
      'payment_object_id', v_pi,
      'donation_id', v_intake.id,
      'status', v_status_after,
      'staged_gift_id', v_gift_id
    );
  END decide;

  SELECT l.task_id, l.metadata
    INTO v_link
    FROM public.mission_control_task_links AS l
   WHERE l.tenant_id = v_event.tenant_id
     AND l.record_type = 'stripe_connect_event'
     AND l.record_id = p_event_id::TEXT
     AND l.relationship = 'payment_contradiction';
  IF FOUND THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'contradiction',
      'reason', v_link.metadata ->> 'reason',
      'task_id', v_link.task_id,
      'effect', v_effect,
      'payment_object_id', v_pi,
      'donation_id', v_link.metadata -> 'donation_id'
    );
  END IF;

  INSERT INTO public.mission_control_tasks (
    tenant_id,
    title,
    description,
    status,
    urgency,
    source_module,
    issue_type,
    created_by_kind
  )
  VALUES (
    v_event.tenant_id,
    'Payment event contradicts its intake',
    pg_catalog.format(
      'Payment event %s (Stripe event %s, %s, account %s, livemode %s) on PaymentIntent %s contradicts intake %s (request %s): %s. No money row was changed.',
      p_event_id, v_event.stripe_event_id, v_event.event_type, v_event.provider_account_id,
      v_event.livemode, v_pi, COALESCE(v_intake.id::TEXT, 'none'),
      COALESCE(v_operation_id::TEXT, 'none'), v_reason
    ),
    'open',
    'high',
    'payments',
    'payment_contradiction',
    'system'
  )
  RETURNING id INTO v_task_id;

  INSERT INTO public.mission_control_task_links (
    tenant_id,
    task_id,
    record_type,
    record_id,
    relationship,
    metadata
  )
  VALUES (
    v_event.tenant_id,
    v_task_id,
    'stripe_connect_event',
    p_event_id::TEXT,
    'payment_contradiction',
    pg_catalog.jsonb_build_object(
      'reason', v_reason,
      'donation_id', v_intake.id,
      'operation_id', v_operation_id,
      'payment_object_id', v_pi
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'outcome', 'contradiction',
    'reason', v_reason,
    'task_id', v_task_id,
    'effect', v_effect,
    'payment_object_id', v_pi,
    'donation_id', pg_catalog.to_jsonb(v_intake.id)
  );
END;
$$;

CREATE FUNCTION tenant_guard.apply_payment_outcome(
  p_tenant_id UUID,
  p_event_id UUID,
  p_attempt INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event RECORD;
  v_found BOOLEAN;
  v_account RECORD;
  v_now TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  SELECT e.id, e.tenant_id, e.stripe_event_id, e.event_type, e.livemode, e.provider_account_id,
         e.event_created_at, e.raw_payload, e.processing_status, e.process_attempts,
         e.lease_expires_at, e.processing_outcome
    INTO v_event
    FROM public.stripe_connect_events AS e
   WHERE e.id = p_event_id
     FOR NO KEY UPDATE;
  v_found := FOUND;

  IF NOT v_found THEN
    RAISE EXCEPTION 'not_found'
      USING ERRCODE = '42501',
            DETAIL = 'No payment event with this id in the entered tenant.';
  END IF;

  SELECT a.id, a.sync_lease_event_id
    INTO v_account
    FROM public.payment_provider_accounts AS a
   WHERE a.tenant_id = p_tenant_id
     AND a.provider_account_id = v_event.provider_account_id
     AND a.livemode = v_event.livemode
     FOR NO KEY UPDATE;
  v_found := FOUND;

  IF NOT v_found THEN
    RAISE EXCEPTION 'not_found'
      USING ERRCODE = '42501',
            DETAIL = 'No payment provider account for this event in the entered tenant.';
  END IF;

  IF p_attempt IS DISTINCT FROM v_event.process_attempts THEN
    RAISE EXCEPTION 'stale_attempt'
      USING ERRCODE = '55000',
            DETAIL = pg_catalog.format('Attempt %s is not the current attempt %s.', p_attempt, v_event.process_attempts);
  END IF;

  IF v_event.processing_status = 'processed'
     AND (v_event.processing_outcome ->> 'attempt') = p_attempt::TEXT THEN
    RETURN v_event.processing_outcome
      || pg_catalog.jsonb_build_object(
           'replayed', true,
           'event_id', p_event_id,
           'tenant_id', tenant_guard.current_tenant_id()
         );
  END IF;

  v_now := pg_catalog.clock_timestamp();

  IF (v_event.processing_status = 'processing'
      AND v_event.lease_expires_at > v_now
      AND v_account.sync_lease_event_id = p_event_id) IS NOT TRUE THEN
    RAISE EXCEPTION 'lease_lost'
      USING ERRCODE = '55000',
            DETAIL = 'The attempt no longer holds a live event lease and its account''s sync lease.';
  END IF;

  v_result := tenant_guard.money_apply_payment_event(p_event_id);

  IF (v_result ->> 'outcome') = 'unmatched' THEN
    RETURN v_result
      || pg_catalog.jsonb_build_object(
           'attempt', p_attempt,
           'replayed', false,
           'event_id', p_event_id,
           'tenant_id', tenant_guard.current_tenant_id()
         );
  END IF;

  v_now := pg_catalog.clock_timestamp();

  UPDATE public.stripe_connect_events
     SET processing_status = 'processed',
         processed_at = v_now,
         lease_expires_at = NULL,
         processing_outcome = v_result || pg_catalog.jsonb_build_object('attempt', p_attempt),
         updated_at = v_now
   WHERE id = p_event_id;

  UPDATE public.payment_provider_accounts
     SET sync_lease_event_id = NULL,
         sync_lease_expires_at = NULL,
         updated_at = v_now
   WHERE id = v_account.id;

  RETURN v_result
    || pg_catalog.jsonb_build_object(
         'attempt', p_attempt,
         'replayed', false,
         'event_id', p_event_id,
         'tenant_id', tenant_guard.current_tenant_id()
       );
END;
$$;

CREATE FUNCTION public.apply_payment_outcome(
  p_event_id UUID,
  p_attempt INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_tenant uuid;
BEGIN
  SELECT e.tenant_id INTO v_tenant FROM public.stripe_connect_events AS e WHERE e.id = p_event_id;

  IF v_tenant IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'unknown_anchor', 'event_id', p_event_id);
  END IF;

  RETURN tenant_guard.apply_payment_outcome(v_tenant, p_event_id, p_attempt);
END;
$$;

REVOKE ALL ON FUNCTION
  tenant_guard.money_enqueue_payment_request(UUID),
  tenant_guard.money_apply_payment_event(UUID),
  tenant_guard.apply_payment_outcome(UUID, UUID, INTEGER),
  public.apply_payment_outcome(UUID, INTEGER)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
  tenant_guard.money_enqueue_payment_request(UUID),
  tenant_guard.money_apply_payment_event(UUID)
  TO tenant_guard;

GRANT EXECUTE ON FUNCTION
  tenant_guard.apply_payment_outcome(UUID, UUID, INTEGER),
  public.apply_payment_outcome(UUID, INTEGER)
  TO service_role;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.apply_payment_outcome(UUID, UUID, INTEGER) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
