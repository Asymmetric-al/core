-- AL-2681 (WP8a part 2 rest, PR 2a, item zero: issue 2857 items 1, 2, 4,
-- 13, 14 and 15): what the last reading of pull request 2853 left, before
-- any line-based intake can exist. Nothing live writes a line-based intake;
-- the receipt snapshots are written by the staff correction, which is live.
--
-- 1. public.payment_event_cases admits a third kind, 'paid_while_parked'
--    (NOT VALID, then validated).
-- 2. tenant_guard.money_apply_payment_event replaced: as 20261127030300
--    wrote it, and
--    - a success after a staff abandonment opens its paid_after_abandon
--      case (and any other effect after it writes nothing) before anything
--      is read of the create request, also when that request is parked
--      (item 2);
--    - an event naming or matching a parked create request is compared with
--      the request and the intake (amount_mismatch otherwise, 2838); it
--      stays the evidence of the request's open repair case; a success with
--      no open repair case (a disconnect parked the request: its outcome is
--      known, so no repair case exists) opens one 'paid_while_parked' case
--      on the intake, with one task and one link, and stages nothing; a
--      replay opens nothing more (item 1);
--    - the cancel requests it abandons, and audits, are the ones its update
--      returned (item 14).
-- 3. tenant_guard.money_enqueue_payment_request replaced: as 20261126170400
--    wrote it, but it takes the intake's binding FOR SHARE before the intake
--    FOR NO KEY UPDATE, the order docs/security/tenant-guard.md gives (item
--    15), and refuses not_found when the intake's binding moved meanwhile.
-- 4. public.contribution_receipt_snapshots: one snapshot per correction and
--    kind, a partial unique index on (adjustment_id, kind) (item 4). Its
--    preflight refuses (55000) with the count when two snapshots of one
--    correction and kind exist, and changes nothing; it never deletes one.
-- 5. public.field_policies: donor and missionary see donations.is_anonymous
--    and donations.abandoned_by, as the whole-table grant to authenticated
--    already lets them (item 13). They hold no login and no address. The
--    grant stays whole because packages/database's donationsCollection
--    reads select=*; narrowing it is WP8b's contract.
-- 6. public.donor_portal_lifetime(tenant, donor, gift ids) (item 8): a
--    postgres-owned STABLE definer, EXECUTE for service_role only: the sum
--    and count of the person's settled gifts (their donor's, and the gifts
--    their login made that have no donor yet, as the portal's list filters
--    them), legacy in a settled status and line-based once paid, so the
--    portal's lifetime figures do not depend on the newest 250 it shows.
--
-- Locks, all held to COMMIT, taken first: SHARE on
-- contribution_receipt_snapshots (its new index), ACCESS EXCLUSIVE on
-- payment_event_cases (its check). No running command takes both, so no
-- order of theirs is crossed. lock_timeout stops a run rather than queue it
-- behind live traffic.
--
-- Recovery. Nothing here is written to run twice: a run lost between its
-- COMMIT and its ledger row stops on the next run at its CREATE UNIQUE INDEX
-- (42P07, relation "contribution_receipt_snapshots_adjustment_kind_key"
-- already exists). This file has committed when this read-only check is
-- true:
--   SELECT to_regclass('public.contribution_receipt_snapshots_adjustment_kind_key') IS NOT NULL
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127050000.
--
-- Down, an operator's last resort, in one transaction, for a database with
-- no 'paid_while_parked' case:
--   SET LOCAL lock_timeout = '5s';
--   DROP INDEX public.contribution_receipt_snapshots_adjustment_kind_key;
--   re-run, verbatim, the CREATE OR REPLACE of tenant_guard.money_apply_payment_event
--     from 20261127030300 and the CREATE FUNCTION of tenant_guard.money_enqueue_payment_request
--     from 20261126170400 as CREATE OR REPLACE;
--   ALTER TABLE public.payment_event_cases DROP CONSTRAINT payment_event_cases_kind_check,
--     ADD CONSTRAINT payment_event_cases_kind_check CHECK (kind IN ('unmatched_payment', 'paid_after_abandon'));
--   UPDATE public.field_policies SET visible = false WHERE record_type = 'donations'
--     AND field_key IN ('is_anonymous', 'abandoned_by') AND surface IN ('donor', 'missionary');
--   DROP FUNCTION public.donor_portal_lifetime(uuid, uuid, uuid[]);

BEGIN;
SET LOCAL lock_timeout = '5s';

LOCK TABLE public.contribution_receipt_snapshots IN SHARE MODE;
LOCK TABLE public.payment_event_cases IN ACCESS EXCLUSIVE MODE;

DO $$
DECLARE
  v_duplicates BIGINT;
BEGIN
  SELECT pg_catalog.count(*)
    INTO v_duplicates
    FROM (
      SELECT s.adjustment_id, s.kind
        FROM public.contribution_receipt_snapshots AS s
       WHERE s.adjustment_id IS NOT NULL
       GROUP BY s.adjustment_id, s.kind
      HAVING pg_catalog.count(*) > 1
    ) AS d;
  IF v_duplicates > 0 THEN
    RAISE EXCEPTION 'receipt_snapshot_duplicates'
      USING ERRCODE = '55000',
            DETAIL = pg_catalog.format('%s corrections have two or more receipt snapshots of one kind; nothing was changed.', v_duplicates);
  END IF;
END
$$;

ALTER TABLE public.payment_event_cases
  DROP CONSTRAINT payment_event_cases_kind_check,
  ADD CONSTRAINT payment_event_cases_kind_check
    CHECK (kind IN ('unmatched_payment', 'paid_after_abandon', 'paid_while_parked')) NOT VALID;
ALTER TABLE public.payment_event_cases VALIDATE CONSTRAINT payment_event_cases_kind_check;

CREATE UNIQUE INDEX contribution_receipt_snapshots_adjustment_kind_key
  ON public.contribution_receipt_snapshots (adjustment_id, kind)
  WHERE adjustment_id IS NOT NULL;

UPDATE public.field_policies
   SET visible = true
 WHERE record_type = 'donations'
   AND field_key IN ('is_anonymous', 'abandoned_by')
   AND surface IN ('donor', 'missionary');

CREATE OR REPLACE FUNCTION tenant_guard.money_apply_payment_event(p_event_id UUID)
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
  v_candidate UUID;
  v_create RECORD;
  v_cancel_id UUID;
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
  v_contact RECORD;
  v_party UUID;
  v_via TEXT;
  v_donor_count BIGINT;
  v_donor_id UUID;
  v_donor_name TEXT;
  v_membership BOOLEAN;
  v_match_email TEXT;
  v_norm_email TEXT;
  v_given_name TEXT;
  v_candidates UUID[];
  v_holds JSONB;
  v_restricted UUID[];
  v_threshold BIGINT;
  v_large TEXT;
  v_attribution_held BOOLEAN;
  v_cancels UUID[];
BEGIN
  IF (pg_catalog.current_setting('transaction_isolation') = 'read committed') IS NOT TRUE THEN
    RAISE EXCEPTION 'read_committed_required'
      USING ERRCODE = '25001',
            DETAIL = 'The money core runs only at READ COMMITTED.';
  END IF;

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
    SELECT d.id
      INTO v_candidate
      FROM public.donations AS d
     WHERE d.tenant_id = v_event.tenant_id
       AND d.provider_account_ref = v_event.provider_account_id
       AND d.livemode = v_event.livemode
       AND d.stripe_payment_intent_id = v_pi;
    v_found := FOUND;

    IF v_found THEN
      PERFORM 1
         FROM public.donation_saga_outbox AS o
        WHERE o.tenant_id = v_event.tenant_id
          AND o.donation_id = v_candidate
          AND o.kind = 'provider_request'
        ORDER BY o.id
          FOR NO KEY UPDATE;

      SELECT d.id, d.tenant_id, d.legal_entity_id, d.status, d.amount, d.currency,
             d.stripe_payment_intent_id, d.abandoned_by
        INTO v_intake
        FROM public.donations AS d
       WHERE d.id = v_candidate
         AND d.stripe_payment_intent_id = v_pi
         FOR NO KEY UPDATE;
      v_found := FOUND;
    END IF;

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

      SELECT o.donation_id
        INTO v_candidate
        FROM public.donation_saga_outbox AS o
       WHERE o.id = v_operation::UUID
         AND o.kind = 'provider_request'
         AND o.tenant_id = v_event.tenant_id
         AND o.provider_account_ref = v_event.provider_account_id
         AND o.livemode = v_event.livemode;
      v_found := FOUND;

      IF NOT v_found THEN
        RETURN pg_catalog.jsonb_build_object(
          'outcome', 'unmatched',
          'effect', v_effect,
          'payment_object_id', v_pi,
          'reason', 'unknown_operation'
        );
      END IF;
      PERFORM 1
         FROM public.donation_saga_outbox AS o
        WHERE o.tenant_id = v_event.tenant_id
          AND o.donation_id = v_candidate
          AND o.kind = 'provider_request'
        ORDER BY o.id
          FOR NO KEY UPDATE;

      SELECT o.id, o.donation_id, o.status, o.first_sent_at, o.amount, o.currency
        INTO v_request
        FROM public.donation_saga_outbox AS o
       WHERE o.id = v_operation::UUID;
      v_operation_id := v_request.id;

      SELECT d.id, d.tenant_id, d.legal_entity_id, d.status, d.amount, d.currency,
             d.stripe_payment_intent_id, d.abandoned_by
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
        NULL;
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

    IF v_intake.status = 'abandoned' AND v_effect = 'succeeded' AND v_intake.abandoned_by = 'staff' THEN
      SELECT c.id
        INTO v_case_id
        FROM public.payment_event_cases AS c
       WHERE c.tenant_id = v_event.tenant_id
         AND c.event_id = p_event_id
         AND c.kind = 'paid_after_abandon';
      IF NOT FOUND THEN
        INSERT INTO public.payment_event_cases (
          tenant_id,
          kind,
          event_id,
          payment_object_id,
          donation_id,
          legal_entity_id
        )
        VALUES (
          v_event.tenant_id,
          'paid_after_abandon',
          p_event_id,
          v_pi,
          v_intake.id,
          v_intake.legal_entity_id
        )
        RETURNING id INTO v_case_id;

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
          'Payment received for an abandoned gift',
          pg_catalog.format(
            'Payment event %s (Stripe event %s, account %s, livemode %s) reports PaymentIntent %s paid for intake %s, which staff abandoned. No gift was created; case %s needs a decision.',
            p_event_id, v_event.stripe_event_id, v_event.provider_account_id, v_event.livemode,
            v_pi, v_intake.id, v_case_id
          ),
          'open',
          'high',
          'payments',
          'payment_after_abandon',
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
          'payment_event_case',
          v_case_id::TEXT,
          'payment_event_case_opened',
          pg_catalog.jsonb_build_object(
            'kind', 'paid_after_abandon',
            'event_id', p_event_id,
            'donation_id', v_intake.id,
            'payment_object_id', v_pi
          )
        );
      END IF;

      RETURN pg_catalog.jsonb_build_object(
        'outcome', 'case_opened',
        'kind', 'paid_after_abandon',
        'effect', v_effect,
        'payment_object_id', v_pi,
        'donation_id', v_intake.id,
        'case_id', v_case_id
      );
    END IF;

    IF v_intake.status = 'abandoned' AND v_intake.abandoned_by = 'staff' THEN
      RETURN pg_catalog.jsonb_build_object(
        'outcome', CASE WHEN v_effect = 'canceled' THEN 'applied' ELSE 'stale' END,
        'effect', v_effect,
        'payment_object_id', v_pi,
        'donation_id', v_intake.id,
        'status', v_intake.status
      );
    END IF;

    SELECT o.id, o.status, o.amount, o.currency
      INTO v_create
      FROM public.donation_saga_outbox AS o
     WHERE o.tenant_id = v_intake.tenant_id
       AND o.donation_id = v_intake.id
       AND o.kind = 'provider_request'
       AND o.request_kind = 'create_payment';
    IF FOUND AND v_create.status = 'parked' THEN
      IF (v_amount = v_create.amount
          AND v_currency = v_create.currency
          AND (v_effect <> 'succeeded' OR v_received = v_create.amount)
          AND v_amount = v_intake.amount
          AND v_currency = v_intake.currency) IS NOT TRUE THEN
        v_reason := 'amount_mismatch';
        EXIT decide;
      END IF;
      SELECT c.id
        INTO v_case_id
        FROM public.payment_repair_cases AS c
       WHERE c.tenant_id = v_event.tenant_id
         AND c.operation_id = v_create.id
         AND c.resolved_at IS NULL;
      IF v_case_id IS NOT NULL OR v_effect <> 'succeeded' THEN
        RETURN pg_catalog.jsonb_build_object(
          'outcome', 'case_evidence',
          'effect', v_effect,
          'payment_object_id', v_pi,
          'donation_id', v_intake.id,
          'case_id', v_case_id
        );
      END IF;

      SELECT c.id
        INTO v_case_id
        FROM public.payment_event_cases AS c
       WHERE c.tenant_id = v_event.tenant_id
         AND c.event_id = p_event_id
         AND c.kind = 'paid_while_parked';
      IF NOT FOUND THEN
        INSERT INTO public.payment_event_cases (
          tenant_id,
          kind,
          event_id,
          payment_object_id,
          donation_id,
          legal_entity_id
        )
        VALUES (
          v_event.tenant_id,
          'paid_while_parked',
          p_event_id,
          v_pi,
          v_intake.id,
          v_intake.legal_entity_id
        )
        RETURNING id INTO v_case_id;

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
          'Payment received while its request was parked',
          pg_catalog.format(
            'Payment event %s (Stripe event %s, account %s, livemode %s) reports PaymentIntent %s paid for intake %s, whose payment request %s is parked with no open repair case. No gift was created; case %s needs a decision.',
            p_event_id, v_event.stripe_event_id, v_event.provider_account_id, v_event.livemode,
            v_pi, v_intake.id, v_create.id, v_case_id
          ),
          'open',
          'high',
          'payments',
          'payment_while_parked',
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
          'payment_event_case',
          v_case_id::TEXT,
          'payment_event_case_opened',
          pg_catalog.jsonb_build_object(
            'kind', 'paid_while_parked',
            'event_id', p_event_id,
            'donation_id', v_intake.id,
            'payment_object_id', v_pi,
            'operation_id', v_create.id
          )
        );
      END IF;

      RETURN pg_catalog.jsonb_build_object(
        'outcome', 'case_opened',
        'kind', 'paid_while_parked',
        'effect', v_effect,
        'payment_object_id', v_pi,
        'donation_id', v_intake.id,
        'case_id', v_case_id
      );
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
      IF v_earlier IS NOT NULL OR NOT v_newer OR v_intake.status = 'abandoned' THEN
        v_outcome := 'stale';
        v_status_after := v_intake.status;
      ELSE
        v_outcome := 'applied';
        v_status_after := CASE v_effect WHEN 'processing' THEN 'processing' ELSE 'failed' END;
      END IF;
    ELSE
      v_outcome := 'applied';
      v_status_after := CASE
        WHEN v_effect = 'succeeded' THEN 'completed'
        WHEN v_intake.status = 'abandoned' THEN 'abandoned'
        ELSE 'failed'
      END;
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

    v_holds := '[]'::JSONB;
    v_cancels := ARRAY[]::UUID[];

    IF v_effect = 'succeeded' THEN
      SELECT g.id
        INTO v_gift_id
        FROM public.staged_gifts AS g
       WHERE g.tenant_id = v_intake.tenant_id
         AND g.donation_id = v_intake.id;
      IF FOUND THEN
        v_gift_id := NULL;
      ELSE
        SELECT c.email, c.first_name, c.last_name, c.address,
               c.actor_user_id, c.actor_email, c.actor_email_confirmed
          INTO v_contact
          FROM public.donation_intake_contacts AS c
         WHERE c.tenant_id = v_intake.tenant_id
           AND c.donation_id = v_intake.id;

        v_given_name := NULLIF(pg_catalog.btrim(
          pg_catalog.btrim(COALESCE(v_contact.first_name, ''),
            E' \t\n\r\u000B\f                 　﻿')
          || ' ' ||
          pg_catalog.btrim(COALESCE(v_contact.last_name, ''),
            E' \t\n\r\u000B\f                 　﻿'),
          ' '), '');

        v_party := NULL;
        v_via := NULL;
        v_membership := false;

        IF v_contact.actor_user_id IS NOT NULL THEN
          PERFORM pg_catalog.pg_advisory_xact_lock(
            pg_catalog.hashtext('donor_party_writer'),
            pg_catalog.hashtext(v_intake.tenant_id::TEXT || ':' || v_contact.actor_user_id::TEXT)
          );

          SELECT al.party_id
            INTO v_party
            FROM public.account_links AS al
           WHERE al.tenant_id = v_intake.tenant_id
             AND al.user_id = v_contact.actor_user_id;
          IF v_party IS NOT NULL THEN
            v_via := 'account_link';
          ELSE
            SELECT CASE WHEN pg_catalog.count(*) = 1 THEN (pg_catalog.array_agg(m.party_id))[1] END
              INTO v_party
              FROM public.missionaries AS m
             WHERE m.tenant_id = v_intake.tenant_id
               AND m.profile_id = v_contact.actor_user_id;
            IF v_party IS NOT NULL THEN
              v_via := 'worker_row';
            ELSE
              SELECT d.party_id
                INTO v_party
                FROM public.donors AS d
               WHERE d.tenant_id = v_intake.tenant_id
                 AND d.profile_id = v_contact.actor_user_id
                 AND d.party_id IS NOT NULL;
              IF v_party IS NOT NULL THEN
                v_via := 'login_donor';
              END IF;
            END IF;
          END IF;

          IF v_party IS NOT NULL THEN
            SELECT p.display_name
              INTO v_donor_name
              FROM public.parties AS p
             WHERE p.tenant_id = v_intake.tenant_id
               AND p.id = v_party
               FOR UPDATE;

            SELECT pg_catalog.count(*), (pg_catalog.array_agg(d.id ORDER BY d.id))[1]
              INTO v_donor_count, v_donor_id
              FROM public.donors AS d
             WHERE d.tenant_id = v_intake.tenant_id
               AND d.party_id = v_party;

            IF v_donor_count > 1 THEN
              RAISE EXCEPTION 'more_than_one_donor'
                USING ERRCODE = '21000',
                      DETAIL = 'The giver''s Party has more than one donor in this organization.';
            END IF;

            IF v_donor_count = 0 THEN
              IF public.donor_party_for_insert(v_intake.tenant_id, v_contact.actor_user_id, NULL, NULL)
                   IS DISTINCT FROM v_party THEN
                RAISE EXCEPTION 'giver_party_moved'
                  USING ERRCODE = '40001',
                        DETAIL = 'The Party writer named another Party under the same lock.';
              END IF;
              INSERT INTO public.donors (tenant_id, party_id, name, giving_preferences, total_given)
              VALUES (v_intake.tenant_id, v_party, v_donor_name, '{}'::JSONB, 0)
              RETURNING id INTO v_donor_id;
              IF v_via = 'account_link' THEN
                v_membership := private.grant_linked_donor_membership(
                  v_intake.tenant_id, v_contact.actor_user_id, v_party);
              END IF;
              v_via := v_via || ':new_donor';
            END IF;
          END IF;
        END IF;

        IF v_party IS NULL THEN
          v_match_email := CASE
            WHEN v_contact.actor_user_id IS NOT NULL AND v_contact.actor_email_confirmed THEN v_contact.actor_email
            ELSE v_contact.email
          END;
          v_norm_email := NULLIF(public.normalize_email(v_match_email), '');

          IF v_norm_email IS NULL THEN
            RAISE EXCEPTION 'giver_email_missing'
              USING ERRCODE = '22023',
                    DETAIL = 'A paid intake with no account to resolve needs the giver''s email.';
          END IF;

          PERFORM pg_catalog.pg_advisory_xact_lock(
            pg_catalog.hashtext('donor_email_writer'),
            pg_catalog.hashtext(v_intake.tenant_id::TEXT || ':' || v_norm_email)
          );

          SELECT d.id, d.name
            INTO v_donor_id, v_donor_name
            FROM public.donors AS d
           WHERE d.tenant_id = v_intake.tenant_id
             AND d.email_normalized = v_norm_email;

          IF v_donor_id IS NOT NULL THEN
            v_via := 'email_match';
            IF private.money_entered_name(v_contact.first_name, v_contact.last_name)
                 IS DISTINCT FROM private.money_norm(v_donor_name) THEN
              v_holds := v_holds || pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object(
                'reason', 'name_mismatch',
                'details', pg_catalog.jsonb_build_object('donor_id', v_donor_id)));
            END IF;
          ELSE
            v_candidates := private.money_duplicate_donors(
              v_intake.tenant_id, v_contact.first_name, v_contact.last_name, v_contact.address, NULL);

            v_party := public.donor_party_for_insert(v_intake.tenant_id, NULL, v_given_name, v_match_email);
            v_donor_id := private.insert_giver_donor(
              v_intake.tenant_id, v_party, v_given_name, v_match_email, v_contact.address);
            v_via := 'new_party';

            IF pg_catalog.cardinality(v_candidates) > 0 THEN
              v_holds := v_holds || pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object(
                'reason', 'possible_duplicate',
                'details', pg_catalog.jsonb_build_object(
                  'donor_id', v_donor_id,
                  'candidates', pg_catalog.to_jsonb(v_candidates))));
            END IF;
          END IF;
        END IF;

        SELECT COALESCE(pg_catalog.array_agg(DISTINCT l.missionary_id), ARRAY[]::UUID[])
          INTO v_restricted
          FROM public.donation_intake_lines AS l
          LEFT JOIN public.missionaries AS m
            ON m.tenant_id = l.tenant_id
           AND m.id = l.missionary_id
          LEFT JOIN public.parties AS p
            ON p.tenant_id = m.tenant_id
           AND p.id = m.party_id
         WHERE l.tenant_id = v_intake.tenant_id
           AND l.donation_id = v_intake.id
           AND l.missionary_id IS NOT NULL
           AND (p.security_level IN ('standard', 'sensitive')) IS NOT TRUE;
        IF pg_catalog.cardinality(v_restricted) > 0 THEN
          v_holds := v_holds || pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object(
            'reason', 'restricted_worker',
            'details', pg_catalog.jsonb_build_object('missionary_ids', pg_catalog.to_jsonb(v_restricted))));
        END IF;

        SELECT cp.large_gift_threshold_cents
          INTO v_threshold
          FROM public.contribution_approval_policies AS cp
         WHERE cp.tenant_id = v_intake.tenant_id;
        v_large := private.money_large_gift_hold(v_intake.amount, v_intake.currency, v_threshold);
        IF v_large IS NOT NULL THEN
          v_holds := v_holds || pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object(
            'reason', v_large,
            'details', pg_catalog.jsonb_build_object(
              'amount', v_intake.amount,
              'currency', v_intake.currency,
              'threshold_cents', v_threshold)));
        END IF;

        v_attribution_held := pg_catalog.jsonb_path_exists(
          v_holds, '$[*] ? (@.reason == "name_mismatch" || @.reason == "possible_duplicate")');

        SELECT pg_catalog.count(*)
          INTO v_line_count
          FROM public.donation_intake_lines AS l
         WHERE l.tenant_id = v_intake.tenant_id
           AND l.donation_id = v_intake.id;

        INSERT INTO public.staged_gifts (
          tenant_id,
          donation_id,
          legal_entity_id,
          donor_id,
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
          v_donor_id,
          v_intake.amount,
          v_intake.currency,
          'needs_review',
          CASE WHEN v_attribution_held THEN 'needs_review' ELSE 'matched' END,
          CASE WHEN v_line_count > 1 THEN 'split' ELSE 'single_allocation' END,
          CASE WHEN pg_catalog.jsonb_array_length(v_holds) > 0 THEN 'held' ELSE 'awaiting_review' END,
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

        INSERT INTO public.staged_gift_holds (
          tenant_id,
          staged_gift_id,
          donation_id,
          legal_entity_id,
          reason,
          details
        )
        SELECT v_intake.tenant_id,
               v_gift_id,
               v_intake.id,
               v_intake.legal_entity_id,
               h.value ->> 'reason',
               h.value -> 'details'
          FROM pg_catalog.jsonb_array_elements(v_holds) AS h;

        UPDATE public.donations
           SET donor_id = v_donor_id,
               updated_at = pg_catalog.clock_timestamp()
         WHERE id = v_intake.id;

        IF v_intake.status = 'abandoned' THEN
          FOR v_cancel_id IN
            UPDATE public.donation_saga_outbox AS o
               SET status = 'abandoned',
                   updated_at = pg_catalog.clock_timestamp()
             WHERE o.tenant_id = v_intake.tenant_id
               AND o.donation_id = v_intake.id
               AND o.kind = 'provider_request'
               AND o.request_kind = 'cancel_payment'
               AND o.status = 'queued'
            RETURNING o.id
          LOOP
            v_cancels := v_cancels || v_cancel_id;
          END LOOP;
        END IF;
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
        'staged_gift_id', v_gift_id,
        'donor_id', CASE WHEN v_gift_id IS NOT NULL THEN v_donor_id END,
        'giver_resolved_by', CASE WHEN v_gift_id IS NOT NULL THEN v_via END,
        'donor_membership_granted', CASE WHEN v_gift_id IS NOT NULL THEN v_membership END,
        'holds', CASE WHEN v_gift_id IS NOT NULL THEN v_holds END,
        'cancel_requests_abandoned', pg_catalog.to_jsonb(v_cancels)
      )
    );

    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'applied',
      'effect', v_effect,
      'payment_object_id', v_pi,
      'donation_id', v_intake.id,
      'status', v_status_after,
      'staged_gift_id', v_gift_id,
      'donor_id', CASE WHEN v_gift_id IS NOT NULL THEN v_donor_id END,
      'holds', CASE WHEN v_gift_id IS NOT NULL
                    THEN (SELECT COALESCE(pg_catalog.jsonb_agg(h.value ->> 'reason' ORDER BY h.value ->> 'reason'), '[]'::JSONB)
                            FROM pg_catalog.jsonb_array_elements(v_holds) AS h)
                    END
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

CREATE OR REPLACE FUNCTION tenant_guard.money_enqueue_payment_request(p_donation_id UUID)
RETURNS UUID
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_intake RECORD;
  v_found BOOLEAN;
  v_binding_id UUID;
  v_binding_status TEXT;
  v_donor_lines BIGINT;
  v_donor_sum NUMERIC;
  v_fee_sum NUMERIC;
  v_id UUID;
  v_metadata JSONB;
  v_params JSONB;
BEGIN
  SELECT d.payment_account_binding_id
    INTO v_binding_id
    FROM public.donations AS d
   WHERE d.id = p_donation_id;
  v_found := FOUND;

  IF v_found THEN
    SELECT b.status
      INTO v_binding_status
      FROM public.payment_account_bindings AS b
     WHERE b.tenant_id = (SELECT tenant_guard.current_tenant_id())
       AND b.id = v_binding_id
       FOR SHARE;

    SELECT d.id, d.tenant_id, d.status, d.amount, d.currency, d.payment_account_binding_id,
           d.provider_account_ref, d.livemode, d.payment_method, d.stripe_payment_intent_id
      INTO v_intake
      FROM public.donations AS d
     WHERE d.id = p_donation_id
       AND d.payment_account_binding_id IS NOT DISTINCT FROM v_binding_id
       FOR NO KEY UPDATE;
    v_found := FOUND;
  END IF;

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

CREATE OR REPLACE FUNCTION public.donor_portal_lifetime(
  p_tenant_id UUID,
  p_donor_id UUID,
  p_gift_ids UUID[]
)
RETURNS TABLE (
  given_cents BIGINT,
  gift_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
  SELECT COALESCE(pg_catalog.sum(d.amount), 0)::BIGINT,
         pg_catalog.count(*)::BIGINT
    FROM public.donations AS d
   WHERE d.tenant_id = p_tenant_id
     AND (d.donor_id = p_donor_id
          OR (d.donor_id IS NULL
              AND d.id = ANY (COALESCE(p_gift_ids, ARRAY[]::UUID[]))))
     AND pg_catalog.lower(d.status) IN ('completed', 'succeeded', 'success')
     AND (d.intake_format <> 'line_based' OR d.status = 'completed');
$fn$;

ALTER FUNCTION public.donor_portal_lifetime(UUID, UUID, UUID[]) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.donor_portal_lifetime(UUID, UUID, UUID[])
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.donor_portal_lifetime(UUID, UUID, UUID[]) TO service_role;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
