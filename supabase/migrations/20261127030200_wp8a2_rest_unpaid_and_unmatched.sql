-- AL-2681 (WP8a part 2 rest, PR 1, M3; plan lines 275, 1125, 1160, 1167
-- and 1174; rulings W8-R24, rebase Q3; the brief's invariant "keep R1a's
-- contracts except the cancel_payment kind and disconnect parking of queued
-- and known retry_wait requests"; "part 1's commands except disconnect and
-- unmatched parking"): an unpaid intake closed and its PaymentIntent
-- cancelled through the worker, a disconnected account's waiting requests
-- parked, and the event-anchored case. Unmatched parking itself is the
-- apply entry's (M4). Nothing live calls any of it.
--
-- 1. public.payment_event_cases: a case anchored on a stored payment event
--    ('unmatched_payment': no intake known when its attempts ran out;
--    'paid_after_abandon': a success for an intake staff abandoned), with
--    the PaymentIntent, the intake when known, a resolution all set or all
--    NULL with a reason of 3 to 500 characters after the JavaScript trim
--    set; one case per event and kind; inserted open by tenant_guard only,
--    never deleted or truncated, anchors fixed, a resolved case fixed
--    (23514; 42501 for any other role that inserts or updates one, its
--    owner included, F13). Row security forced, tenant_guard
--    SELECT and INSERT of named columns behind tenant_guard_isolation,
--    nothing for PUBLIC, anon, authenticated or service_role.
-- 2. public.donation_saga_outbox:
--    - park_reason ('outcome_unknown' or 'binding_disconnected'), set and
--      cleared by the rules trigger with parked_at, NULL on legacy rows;
--    - the request kind 'cancel_payment' (one per intake, like
--      create_payment): its parameters are exactly {"payment_intent":
--      "pi_...", "cancellation_reason": "abandoned"}, and its PaymentIntent
--      is its intake's (checked on insert, 23514);
--    - a request parked before this file (R1a parks only an unknown
--      outcome) is given park_reason 'outcome_unknown' before the checks
--      are validated (F8), with the rules trigger off for that one update;
--    - checks replaced, each NOT VALID then validated:
--      donation_saga_outbox_request_check (the two kinds),
--      donation_saga_outbox_request_params_check (create_payment's
--      predicate unchanged, cancel_payment's above), _unsent_check and
--      _unknown_check (a request parked because its binding was
--      disconnected may be unsent and known), _parked_at_check (it keeps
--      parked_at when abandoned), and the new _park_reason_check;
--    - private.donation_saga_outbox_provider_rules() replaced: R1a's rules
--      D, I and U1 to U9 unchanged, and a queued or known retry_wait request
--      may move to parked only while its intake's binding is disconnected
--      (23514 provider_request_bad_move otherwise); the trigger alone writes
--      park_reason beside parked_at.
-- 3. tenant_guard.apply_account_event replaced: as 20261123030300 wrote it,
--    and on a move into disconnected it locks every queued and known
--    retry_wait provider request of an intake on that binding in one
--    statement that tests their state, parks exactly those (an update that
--    tests it again) and links each to the one disconnect task
--    ('provider_request_parked_disconnected'); a request a worker claimed
--    first is left to its claim (F3).
-- 4. The sweep: tenant_guard.abandon_unpaid_intake(tenant, intake), a
--    guard-owned definer for service_role that enters the tenant first. It
--    takes its rows in the order docs/security/tenant-guard.md gives (F3):
--    the intake's binding FOR SHARE (so a disconnect either commits first
--    and is seen, or waits until the sweep commits and then parks the
--    cancel it wrote), then every provider request of the intake, then the
--    line-based intake. A status other than pending or failed is 'closed';
--    younger than seven days (D-08) is 'not_due'; a request of the intake
--    it did not lock, or a create_payment request sending, waiting to retry
--    or parked, is 'in_flight' and nothing changes (F4); an intake holding
--    a PaymentIntent whose binding is disconnected is
--    'binding_disconnected' and nothing changes; otherwise the intake moves
--    to abandoned by the sweep, its queued create_payment request moves to
--    abandoned (machine row 16, an update that tests the state), and when
--    the intake holds a PaymentIntent one queued cancel_payment request is
--    written; one audit row. public.abandon_unpaid_intake(intake), its
--    invoker wrapper for service_role, reads the tenant from the stored
--    intake and answers unknown_anchor, writing nothing, when there is
--    none.
--
-- Locks, all held to COMMIT, taken first and in the order the running
-- commands take theirs (F8): SHARE ROW EXCLUSIVE on tenants and
-- stripe_connect_events (the new keys' targets), ACCESS EXCLUSIVE on
-- donation_saga_outbox (its column, checks and trigger), SHARE ROW
-- EXCLUSIVE on donations (a new key's target). lock_timeout stops a run
-- rather than queue it behind live traffic.
--
-- Recovery. Nothing here is written to run twice: a run lost between its
-- COMMIT and its ledger row stops on the next run at its first CREATE TABLE
-- (42P07, relation "payment_event_cases" already exists). This file has committed
-- when this read-only check is true:
--   SELECT to_regclass('public.payment_event_cases') IS NOT NULL
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127030200. It has no preflight or post-assert of its own.
--
-- Down, an operator's last resort, after the Down of 20261127030300 and
-- 20261127030400, for a database where no provider request is parked for a
-- disconnect or asks for a cancel and no event case exists; in one
-- transaction:
--   SET LOCAL lock_timeout = '5s';
--   LOCK TABLE public.donation_saga_outbox IN ACCESS EXCLUSIVE MODE;
--   DO $$ BEGIN IF EXISTS (SELECT 1 FROM public.donation_saga_outbox
--       WHERE park_reason = 'binding_disconnected' OR request_kind = 'cancel_payment')
--     OR EXISTS (SELECT 1 FROM public.payment_event_cases) THEN
--     RAISE EXCEPTION 'Down refused' USING ERRCODE = '55000'; END IF; END $$;
--   DROP FUNCTION public.abandon_unpaid_intake(uuid);
--   GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
--   SET LOCAL ROLE tenant_guard;
--   DROP FUNCTION tenant_guard.abandon_unpaid_intake(uuid, uuid);
--   re-run, verbatim, the CREATE OR REPLACE of tenant_guard.apply_account_event from 20261123030300;
--   RESET ROLE;
--   REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;
--   re-run, verbatim, the CREATE OR REPLACE of private.donation_saga_outbox_provider_rules() from 20261126020100;
--   ALTER TABLE public.donation_saga_outbox DROP CONSTRAINT donation_saga_outbox_park_reason_check,
--     DROP CONSTRAINT donation_saga_outbox_park_reason_legacy_check,
--     then drop and re-add, as 20261126020100 wrote them, _request_check, _request_params_check,
--     _unsent_check, _unknown_check and _parked_at_check; DROP COLUMN park_reason;
--   DROP TABLE public.payment_event_cases; DROP FUNCTION private.payment_event_cases_rules();

BEGIN;
SET LOCAL lock_timeout = '5s';

LOCK TABLE public.tenants IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.stripe_connect_events IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.donation_saga_outbox IN ACCESS EXCLUSIVE MODE;
LOCK TABLE public.donations IN SHARE ROW EXCLUSIVE MODE;

CREATE TABLE public.payment_event_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  kind TEXT NOT NULL
    CONSTRAINT payment_event_cases_kind_check
      CHECK (kind IN ('unmatched_payment', 'paid_after_abandon')),
  event_id UUID NOT NULL,
  payment_object_id TEXT NOT NULL
    CONSTRAINT payment_event_cases_object_check CHECK (payment_object_id ~ '^pi_[A-Za-z0-9]+$'),
  donation_id UUID,
  legal_entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolution TEXT
    CONSTRAINT payment_event_cases_resolution_value_check
      CHECK (resolution IN ('adopted', 'refunded', 'dismissed')),
  resolution_reason TEXT,
  resolved_by UUID,
  resolved_assignment_id UUID,
  resolved_at TIMESTAMPTZ,
  resolution_details JSONB,
  CONSTRAINT payment_event_cases_event_fk
    FOREIGN KEY (tenant_id, event_id)
    REFERENCES public.stripe_connect_events (tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT payment_event_cases_intake_fk
    FOREIGN KEY (tenant_id, donation_id, legal_entity_id)
    REFERENCES public.donations (tenant_id, id, legal_entity_id)
    ON DELETE RESTRICT,
  CONSTRAINT payment_event_cases_one_per_event UNIQUE (tenant_id, event_id, kind),
  CONSTRAINT payment_event_cases_intake_check
    CHECK (
      (donation_id IS NULL) = (legal_entity_id IS NULL)
      AND (kind <> 'paid_after_abandon' OR donation_id IS NOT NULL)
    ),
  CONSTRAINT payment_event_cases_resolution_complete_check
    CHECK (
      (resolution IS NULL
        AND resolution_reason IS NULL
        AND resolved_by IS NULL
        AND resolved_assignment_id IS NULL
        AND resolved_at IS NULL
        AND resolution_details IS NULL)
      OR (resolution IS NOT NULL
        AND resolution_reason IS NOT NULL
        AND resolved_by IS NOT NULL
        AND resolved_assignment_id IS NOT NULL
        AND resolved_at IS NOT NULL
        AND resolution_details IS NOT NULL)
    ),
  CONSTRAINT payment_event_cases_reason_check
    CHECK (
      resolution_reason IS NULL
      OR (
        pg_catalog.char_length(pg_catalog.btrim(resolution_reason,
          E' \t\n\r\u000B\f                 　﻿'))
          BETWEEN 3 AND 500
      ) IS TRUE
    )
);

CREATE FUNCTION private.payment_event_cases_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP IN ('DELETE', 'TRUNCATE') THEN
    RAISE EXCEPTION 'payment_event_case_sealed'
      USING ERRCODE = '23514',
            DETAIL = 'A payment event case is evidence and is never deleted.';
  END IF;

  IF (current_user = 'tenant_guard') IS NOT TRUE THEN
    RAISE EXCEPTION 'payment_event_case_guard_only'
      USING ERRCODE = '42501',
            DETAIL = 'Only the guard role opens or changes a payment event case.';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF (NEW.resolved_at IS NULL) IS NOT TRUE THEN
      RAISE EXCEPTION 'payment_event_case_created_open'
        USING ERRCODE = '23514',
              DETAIL = 'A payment event case is created open.';
    END IF;
    RETURN NEW;
  END IF;

  IF (NEW.id IS NOT DISTINCT FROM OLD.id
      AND NEW.tenant_id IS NOT DISTINCT FROM OLD.tenant_id
      AND NEW.kind IS NOT DISTINCT FROM OLD.kind
      AND NEW.event_id IS NOT DISTINCT FROM OLD.event_id
      AND NEW.payment_object_id IS NOT DISTINCT FROM OLD.payment_object_id
      AND NEW.donation_id IS NOT DISTINCT FROM OLD.donation_id
      AND NEW.legal_entity_id IS NOT DISTINCT FROM OLD.legal_entity_id
      AND NEW.created_at IS NOT DISTINCT FROM OLD.created_at) IS NOT TRUE THEN
    RAISE EXCEPTION 'payment_event_case_anchor_fixed'
      USING ERRCODE = '23514',
            DETAIL = 'A payment event case keeps its tenant, kind, event, payment object, intake and creation time.';
  END IF;

  IF OLD.resolved_at IS NOT NULL AND (NEW IS NOT DISTINCT FROM OLD) IS NOT TRUE THEN
    RAISE EXCEPTION 'payment_event_case_resolved'
      USING ERRCODE = '23514',
            DETAIL = 'A resolved payment event case never changes.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.payment_event_cases_rules()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER payment_event_cases_rules
  BEFORE INSERT OR UPDATE OR DELETE ON public.payment_event_cases
  FOR EACH ROW
  EXECUTE FUNCTION private.payment_event_cases_rules();

CREATE TRIGGER payment_event_cases_no_truncate
  BEFORE TRUNCATE ON public.payment_event_cases
  FOR EACH STATEMENT
  EXECUTE FUNCTION private.payment_event_cases_rules();

ALTER TABLE public.payment_event_cases
  ENABLE ROW LEVEL SECURITY,
  FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.payment_event_cases
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.payment_event_cases TO tenant_guard;
GRANT INSERT (tenant_id, kind, event_id, payment_object_id, donation_id, legal_entity_id)
  ON TABLE public.payment_event_cases TO tenant_guard;

CREATE POLICY tenant_guard_isolation
  ON public.payment_event_cases
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

ALTER TABLE public.donation_saga_outbox
  ADD COLUMN park_reason TEXT;

ALTER TABLE public.donation_saga_outbox
  DROP CONSTRAINT donation_saga_outbox_request_check,
  DROP CONSTRAINT donation_saga_outbox_request_params_check,
  DROP CONSTRAINT donation_saga_outbox_unsent_check,
  DROP CONSTRAINT donation_saga_outbox_unknown_check,
  DROP CONSTRAINT donation_saga_outbox_parked_at_check;

ALTER TABLE public.donation_saga_outbox
  ADD CONSTRAINT donation_saga_outbox_park_reason_check
    CHECK (
      kind <> 'provider_request'
      OR (
        (park_reason IS NULL) = (parked_at IS NULL)
        AND (park_reason IS NULL OR park_reason IN ('outcome_unknown', 'binding_disconnected'))
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_park_reason_legacy_check
    CHECK (
      kind <> 'legacy_saga'
      OR (park_reason IS NULL) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_unsent_check
    CHECK (
      kind <> 'provider_request'
      OR (
        (status IN ('queued', 'abandoned')
          OR first_sent_at IS NOT NULL
          OR (status = 'parked' AND park_reason = 'binding_disconnected'))
        AND (status <> 'queued' OR first_sent_at IS NULL)
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_parked_at_check
    CHECK (
      kind <> 'provider_request'
      OR (
        (parked_at IS NOT NULL) = (
          status IN ('parked', 'adopted')
          OR (status = 'abandoned' AND (first_sent_at IS NOT NULL OR park_reason IS NOT NULL))
        )
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_unknown_check
    CHECK (
      kind <> 'provider_request'
      OR (
        (status <> 'parked' OR outcome_unknown OR park_reason = 'binding_disconnected')
        AND (NOT outcome_unknown OR status IN ('sending', 'retry_wait', 'parked'))
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_request_check
    CHECK (
      kind <> 'provider_request'
      OR (
        request_kind IN ('create_payment', 'cancel_payment')
        AND provider_account_ref ~ '^acct_[A-Za-z0-9]+$'
        AND livemode IS NOT NULL
        AND amount > 0
        AND currency ~ '^[a-z]{3}$'
        AND request_params IS NOT NULL
        AND request_digest IS NOT NULL
        AND request_digest = encode(sha256(convert_to(request_params::text, 'UTF8')), 'hex')
        AND idempotency_key = 'gift:' || donation_id::text || ':' || request_kind
        AND processor_lock_id IS NULL
        AND processor_locked_at IS NULL
        AND fund_id IS NULL
        AND missionary_id IS NULL
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_request_params_check
    CHECK (
      kind <> 'provider_request'
      OR (CASE request_kind
        WHEN 'cancel_payment' THEN (
          jsonb_typeof(request_params) = 'object'
          AND (request_params - ARRAY['payment_intent', 'cancellation_reason']) = '{}'::jsonb
          AND jsonb_typeof(request_params -> 'payment_intent') = 'string'
          AND (request_params ->> 'payment_intent') ~ '^pi_[A-Za-z0-9]+$'
          AND jsonb_typeof(request_params -> 'cancellation_reason') = 'string'
          AND (request_params ->> 'cancellation_reason') = 'abandoned'
        )
        WHEN 'create_payment' THEN (
          jsonb_typeof(request_params) = 'object'
          AND (request_params - ARRAY['amount', 'currency', 'metadata', 'payment_method_types', 'automatic_payment_methods']) = '{}'::jsonb
          AND jsonb_typeof(request_params -> 'amount') = 'number'
          AND (request_params -> 'amount')::text = amount::text
          AND jsonb_typeof(request_params -> 'currency') = 'string'
          AND (request_params ->> 'currency') = currency
          AND jsonb_typeof(request_params -> 'metadata') = 'object'
          AND ((request_params -> 'metadata') - ARRAY['asym_operation', 'asym_intake', 'gift_amount_cents', 'cover_fees', 'payment_method', 'cover_amount_cents', 'estimated_fee_cents']) = '{}'::jsonb
          AND jsonb_typeof(request_params -> 'metadata' -> 'asym_operation') = 'string'
          AND (request_params -> 'metadata' ->> 'asym_operation') = id::text
          AND jsonb_typeof(request_params -> 'metadata' -> 'asym_intake') = 'string'
          AND (request_params -> 'metadata' ->> 'asym_intake') = donation_id::text
          AND COALESCE(jsonb_typeof(request_params -> 'metadata' -> 'gift_amount_cents'), 'string') = 'string'
          AND COALESCE(jsonb_typeof(request_params -> 'metadata' -> 'cover_fees'), 'string') = 'string'
          AND COALESCE(jsonb_typeof(request_params -> 'metadata' -> 'payment_method'), 'string') = 'string'
          AND COALESCE(jsonb_typeof(request_params -> 'metadata' -> 'cover_amount_cents'), 'string') = 'string'
          AND COALESCE(jsonb_typeof(request_params -> 'metadata' -> 'estimated_fee_cents'), 'string') = 'string'
          AND (
            NOT ((request_params -> 'metadata') ? 'gift_amount_cents')
            OR ((request_params -> 'metadata' ->> 'gift_amount_cents') ~ '^(0|[1-9][0-9]*)$'
                AND (request_params -> 'metadata' ->> 'gift_amount_cents') <> '0')
          )
          AND (
            NOT ((request_params -> 'metadata') ? 'cover_amount_cents')
            OR (request_params -> 'metadata' ->> 'cover_amount_cents') ~ '^(0|[1-9][0-9]*)$'
          )
          AND (
            NOT ((request_params -> 'metadata') ? 'estimated_fee_cents')
            OR (request_params -> 'metadata' ->> 'estimated_fee_cents') ~ '^(0|[1-9][0-9]*)$'
          )
          AND (
            NOT ((request_params -> 'metadata') ? 'cover_fees')
            OR (request_params -> 'metadata' ->> 'cover_fees') IN ('true', 'false')
          )
          AND (
            NOT ((request_params -> 'metadata') ? 'payment_method')
            OR (request_params -> 'metadata' ->> 'payment_method') IN ('card', 'ach', 'wallet')
          )
          AND (request_params ? 'payment_method_types') <> (request_params ? 'automatic_payment_methods')
          AND (request_params ? 'payment_method_types') = ((request_params -> 'metadata') ? 'payment_method')
          AND (
            NOT (request_params ? 'payment_method_types')
            OR (request_params -> 'payment_method_types') = CASE (request_params -> 'metadata' ->> 'payment_method')
              WHEN 'ach' THEN '["us_bank_account"]'::jsonb
              ELSE '["card"]'::jsonb
            END
          )
          AND (
            NOT (request_params ? 'automatic_payment_methods')
            OR (request_params -> 'automatic_payment_methods') = '{"enabled": true}'::jsonb
          )
        )
        ELSE false
      END) IS TRUE
    ) NOT VALID;

ALTER TABLE public.donation_saga_outbox DISABLE TRIGGER donation_saga_outbox_provider_rules;
UPDATE public.donation_saga_outbox
   SET park_reason = 'outcome_unknown'
 WHERE kind = 'provider_request'
   AND parked_at IS NOT NULL
   AND park_reason IS NULL;
ALTER TABLE public.donation_saga_outbox ENABLE TRIGGER donation_saga_outbox_provider_rules;

ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_park_reason_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_park_reason_legacy_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_unsent_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_parked_at_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_unknown_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_request_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_request_params_check;

CREATE OR REPLACE FUNCTION private.donation_saga_outbox_provider_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_edge BOOLEAN;
  v_binding_status TEXT;
  v_intake_reference TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF (OLD.kind <> 'provider_request') IS NOT TRUE THEN
      RAISE EXCEPTION 'provider_request_sealed'
        USING ERRCODE = '23514',
              DETAIL = 'A provider request is evidence and is never deleted.';
    END IF;
    RETURN OLD;
  END IF;

  IF (NEW.kind = 'provider_request') IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF (NEW.status = 'queued'
        AND NEW.attempt_count = 0
        AND NOT NEW.outcome_unknown
        AND NEW.first_sent_at IS NULL
        AND NEW.send_deadline IS NULL
        AND NEW.lease_expires_at IS NULL
        AND NEW.provider_object_id IS NULL
        AND NEW.parked_at IS NULL
        AND NEW.park_reason IS NULL) IS NOT TRUE THEN
      RAISE EXCEPTION 'provider_request_created_unsent'
        USING ERRCODE = '23514',
              DETAIL = 'A provider request is created queued, unsent, unleased, unlinked and known.';
    END IF;
    IF NEW.request_kind = 'cancel_payment' THEN
      SELECT d.stripe_payment_intent_id
        INTO v_intake_reference
        FROM public.donations AS d
       WHERE d.tenant_id = NEW.tenant_id
         AND d.id = NEW.donation_id;
      IF (v_intake_reference IS NOT NULL
          AND (NEW.request_params ->> 'payment_intent') = v_intake_reference) IS NOT TRUE THEN
        RAISE EXCEPTION 'provider_request_cancel_foreign_object'
          USING ERRCODE = '23514',
                DETAIL = 'A cancel names the PaymentIntent its intake recorded.';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF (current_user = 'tenant_guard') IS NOT TRUE THEN
    RAISE EXCEPTION 'provider_request_guard_only'
      USING ERRCODE = '42501',
            DETAIL = 'Only the guard role changes a provider request.';
  END IF;

  IF (NEW.tenant_id IS NOT DISTINCT FROM OLD.tenant_id
      AND NEW.donation_id IS NOT DISTINCT FROM OLD.donation_id
      AND NEW.donor_id IS NOT DISTINCT FROM OLD.donor_id
      AND NEW.fund_id IS NOT DISTINCT FROM OLD.fund_id
      AND NEW.missionary_id IS NOT DISTINCT FROM OLD.missionary_id
      AND NEW.kind IS NOT DISTINCT FROM OLD.kind
      AND NEW.request_kind IS NOT DISTINCT FROM OLD.request_kind
      AND NEW.provider_account_ref IS NOT DISTINCT FROM OLD.provider_account_ref
      AND NEW.livemode IS NOT DISTINCT FROM OLD.livemode
      AND NEW.idempotency_key IS NOT DISTINCT FROM OLD.idempotency_key
      AND NEW.request_params::text IS NOT DISTINCT FROM OLD.request_params::text
      AND NEW.request_digest IS NOT DISTINCT FROM OLD.request_digest
      AND NEW.amount IS NOT DISTINCT FROM OLD.amount
      AND NEW.currency IS NOT DISTINCT FROM OLD.currency
      AND NEW.fee_extras::text IS NOT DISTINCT FROM OLD.fee_extras::text
      AND NEW.created_at IS NOT DISTINCT FROM OLD.created_at
      AND (OLD.first_sent_at IS NULL OR NEW.first_sent_at IS NOT DISTINCT FROM OLD.first_sent_at)
      AND (OLD.send_deadline IS NULL OR NEW.send_deadline IS NOT DISTINCT FROM OLD.send_deadline)
      AND (OLD.provider_object_id IS NULL OR NEW.provider_object_id IS NOT DISTINCT FROM OLD.provider_object_id)
      AND NEW.max_attempts >= OLD.max_attempts) IS NOT TRUE THEN
    RAISE EXCEPTION 'provider_request_frozen'
      USING ERRCODE = '23514',
            DETAIL = 'A provider request keeps what it was created with, its send times and its object.';
  END IF;

  IF (NEW.attempt_count = OLD.attempt_count
      OR NEW.attempt_count = OLD.attempt_count + 1) IS NOT TRUE THEN
    RAISE EXCEPTION 'provider_request_attempt_step'
      USING ERRCODE = '23514',
            DETAIL = 'A provider request counts its attempts up one claim at a time.';
  END IF;

  IF NEW.attempt_count = OLD.attempt_count + 1 THEN
    IF (NEW.status = 'sending') IS NOT TRUE THEN
      RAISE EXCEPTION 'provider_request_bad_move'
        USING ERRCODE = '23514',
              DETAIL = 'A claim moves a provider request to sending.';
    END IF;
    IF (OLD.status IN ('queued', 'retry_wait')
        OR (OLD.status = 'sending' AND OLD.lease_expires_at <= pg_catalog.clock_timestamp())) IS NOT TRUE THEN
      RAISE EXCEPTION 'provider_request_not_claimable'
        USING ERRCODE = '55000',
              DETAIL = 'Only a queued request, a request waiting to retry or an expired lease can be claimed.';
    END IF;
    IF OLD.first_sent_at IS NULL THEN
      NEW.first_sent_at := pg_catalog.clock_timestamp();
      NEW.send_deadline := NEW.first_sent_at + interval '23 hours';
    END IF;
    IF OLD.status = 'sending' THEN
      NEW.outcome_unknown := true;
    END IF;
    IF (pg_catalog.clock_timestamp() < NEW.lease_expires_at
        AND NEW.lease_expires_at <= NEW.send_deadline) IS NOT TRUE THEN
      RAISE EXCEPTION 'provider_request_window_passed'
        USING ERRCODE = '55000',
              DETAIL = 'A claim needs a live lease that ends inside the send window.';
    END IF;
  ELSE
    v_edge := (OLD.status = 'sending' AND NEW.status IN ('linked', 'refused', 'retry_wait', 'parked', 'dead_letter'))
      OR (OLD.status = 'retry_wait' AND NEW.status IN ('parked', 'dead_letter'))
      OR (OLD.status = 'queued' AND NEW.status IN ('abandoned', 'parked'))
      OR (OLD.status = 'parked' AND NEW.status IN ('adopted', 'abandoned', 'retry_wait'));
    IF v_edge IS NOT TRUE THEN
      RAISE EXCEPTION 'provider_request_bad_move'
        USING ERRCODE = '23514',
              DETAIL = pg_catalog.format('No move from %s to %s.', OLD.status, NEW.status);
    END IF;
    IF NEW.status = 'parked' AND OLD.status <> 'parked' AND NOT NEW.outcome_unknown THEN
      SELECT b.status
        INTO v_binding_status
        FROM public.donations AS d
        JOIN public.payment_account_bindings AS b
          ON b.tenant_id = d.tenant_id
         AND b.id = d.payment_account_binding_id
       WHERE d.tenant_id = NEW.tenant_id
         AND d.id = NEW.donation_id;
      IF (OLD.status IN ('queued', 'retry_wait')
          AND NOT OLD.outcome_unknown
          AND v_binding_status = 'disconnected') IS NOT TRUE THEN
        RAISE EXCEPTION 'provider_request_bad_move'
          USING ERRCODE = '23514',
                DETAIL = 'A known request parks only while its binding is disconnected.';
      END IF;
    ELSIF OLD.status = 'queued' AND NEW.status = 'parked' THEN
      RAISE EXCEPTION 'provider_request_bad_move'
        USING ERRCODE = '23514',
              DETAIL = 'An unsent request parks only as known, for a disconnected binding.';
    END IF;
  END IF;

  IF OLD.status = 'sending' AND NEW.status IN ('retry_wait', 'refused', 'dead_letter') THEN
    IF (OLD.lease_expires_at > pg_catalog.clock_timestamp()) IS NOT TRUE THEN
      RAISE EXCEPTION 'provider_request_lease_expired'
        USING ERRCODE = '55000',
              DETAIL = 'Only a live lease moves a request out of sending to retry, refused or dead letter.';
    END IF;
  END IF;

  IF NEW.status = 'retry_wait' AND OLD.status <> 'retry_wait' THEN
    IF (GREATEST(NEW.next_attempt_at, pg_catalog.clock_timestamp()) + interval '900 seconds'
        <= NEW.send_deadline) IS NOT TRUE THEN
      RAISE EXCEPTION 'provider_request_retry_outside_window'
        USING ERRCODE = '23514',
              DETAIL = 'A retry must fall due at least 900 seconds before the send deadline.';
    END IF;
  END IF;

  IF (NOT (OLD.outcome_unknown AND NOT NEW.outcome_unknown)
      OR NEW.status IN ('linked', 'refused', 'adopted', 'abandoned')) IS NOT TRUE THEN
    RAISE EXCEPTION 'provider_request_unknown_cleared'
      USING ERRCODE = '23514',
            DETAIL = 'An unknown outcome is cleared only by an answer or a resolution.';
  END IF;

  IF NEW.status = 'parked' AND OLD.status <> 'parked' THEN
    NEW.parked_at := pg_catalog.clock_timestamp();
    NEW.park_reason := CASE WHEN NEW.outcome_unknown THEN 'outcome_unknown' ELSE 'binding_disconnected' END;
  ELSIF OLD.status = 'parked' AND NEW.status = 'retry_wait' THEN
    NEW.parked_at := NULL;
    NEW.park_reason := NULL;
  ELSIF (NEW.parked_at IS NOT DISTINCT FROM OLD.parked_at
         AND NEW.park_reason IS NOT DISTINCT FROM OLD.park_reason) IS NOT TRUE THEN
    RAISE EXCEPTION 'provider_request_frozen'
      USING ERRCODE = '23514',
            DETAIL = 'The database alone sets and clears the parking time and reason.';
  END IF;

  RETURN NEW;
END;
$$;

GRANT SELECT (park_reason) ON TABLE public.donation_saga_outbox TO tenant_guard;

-- Replaced as its owner, which holds CREATE on its schema only for this
-- (on Supabase's image postgres is not a superuser and owns none of it).
GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
SET LOCAL ROLE tenant_guard;
CREATE OR REPLACE FUNCTION tenant_guard.apply_account_event(
  p_tenant_id UUID,
  p_event_id UUID,
  p_attempt INTEGER,
  p_snapshot JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event RECORD;
  v_event_found BOOLEAN;
  v_account RECORD;
  v_account_found BOOLEAN;
  v_binding RECORD;
  v_binding_found BOOLEAN;
  v_now TIMESTAMPTZ;
  v_closed BOOLEAN;
  v_card_status TEXT;
  v_target_status TEXT;
  v_task_id UUID;
  v_outcome JSONB;
  v_parked UUID[];
  v_moved BIGINT;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  SELECT e.*
    INTO v_event
    FROM public.stripe_connect_events AS e
   WHERE e.id = p_event_id
     FOR NO KEY UPDATE;
  v_event_found := FOUND;

  IF NOT v_event_found THEN
    RAISE EXCEPTION 'tenant_guard: provider event not found in entered tenant'
      USING ERRCODE = '42501';
  END IF;

  SELECT a.*
    INTO v_account
    FROM public.payment_provider_accounts AS a
   WHERE a.tenant_id = p_tenant_id
     AND a.provider_account_id = v_event.provider_account_id
     AND a.livemode = v_event.livemode
     FOR NO KEY UPDATE;
  v_account_found := FOUND;

  IF NOT v_account_found THEN
    RAISE EXCEPTION 'tenant_guard: payment provider account anchor not found in entered tenant'
      USING ERRCODE = '42501';
  END IF;

  v_now := pg_catalog.clock_timestamp();

  IF v_event.process_attempts IS DISTINCT FROM p_attempt THEN
    RAISE EXCEPTION 'Stale provider event attempt % (current status=%, attempt=%)',
      p_attempt, v_event.processing_status, v_event.process_attempts
      USING ERRCODE = '55000';
  END IF;

  IF v_event.processing_status = 'processed'
     AND (v_event.processing_outcome ->> 'attempt') = p_attempt::TEXT THEN
    RETURN v_event.processing_outcome
      || pg_catalog.jsonb_build_object('replayed', true, 'event_id', p_event_id, 'tenant_id', tenant_guard.current_tenant_id());
  END IF;

  IF v_event.processing_status <> 'processing'
     OR v_event.lease_expires_at <= v_now
     OR v_account.sync_lease_event_id IS DISTINCT FROM p_event_id THEN
    RAISE EXCEPTION 'Stale provider event attempt % (current status=%, attempt=%)',
      p_attempt, v_event.processing_status, v_event.process_attempts
      USING ERRCODE = '55000';
  END IF;

  IF v_event.event_type <> 'v2.core.account.closed'
     AND (
       p_snapshot IS NULL
       OR pg_catalog.jsonb_typeof(p_snapshot) <> 'object'
     ) THEN
    RAISE EXCEPTION 'An account snapshot fetched from the provider is required' USING ERRCODE = '22023';
  END IF;

  IF p_snapshot IS NOT NULL
     AND (
       (p_snapshot ->> 'id') IS DISTINCT FROM v_event.provider_account_id
       OR (p_snapshot ->> 'livemode') IS DISTINCT FROM v_event.livemode::TEXT
     ) THEN
    RAISE EXCEPTION 'The account snapshot does not name this event''s account and mode' USING ERRCODE = '22023';
  END IF;

  v_closed := v_event.event_type = 'v2.core.account.closed'
    OR COALESCE(p_snapshot ->> 'closed', 'false') = 'true';
  v_card_status := p_snapshot ->> 'card_payments_status';

  SELECT b.*
    INTO v_binding
    FROM public.payment_account_bindings AS b
   WHERE b.tenant_id = p_tenant_id
     AND b.legal_entity_id = v_account.legal_entity_id
     AND b.provider_account_ref = v_account.provider_account_id
     AND b.livemode = v_account.livemode
     FOR NO KEY UPDATE;
  v_binding_found := FOUND;

  IF NOT v_binding_found THEN
    RAISE EXCEPTION 'tenant_guard: payment account binding not found for the event''s account'
      USING ERRCODE = '42501';
  END IF;

  IF v_binding.status = 'disconnected' THEN
    v_target_status := 'disconnected';
  ELSIF v_closed THEN
    v_target_status := 'disconnected';
  ELSIF v_card_status = 'active' THEN
    v_target_status := 'active';
  ELSIF v_binding.status IN ('active', 'restricted') THEN
    v_target_status := 'restricted';
  ELSE
    v_target_status := 'pending';
  END IF;

  v_task_id := NULL;
  v_parked := ARRAY[]::UUID[];

  IF v_target_status IS DISTINCT FROM v_binding.status THEN
    UPDATE public.payment_account_bindings
       SET status = v_target_status,
           activated_at = CASE WHEN v_target_status = 'active' AND activated_at IS NULL THEN v_now ELSE activated_at END,
           restricted_at = CASE WHEN v_target_status = 'restricted' THEN v_now ELSE restricted_at END,
           disconnected_at = CASE WHEN v_target_status = 'disconnected' THEN v_now ELSE disconnected_at END,
           updated_at = v_now
     WHERE id = v_binding.id;

    IF v_target_status IN ('restricted', 'disconnected') THEN
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
        p_tenant_id,
        CASE WHEN v_target_status = 'disconnected'
             THEN 'Payment account disconnected'
             ELSE 'Payment account restricted' END,
        'Connected payment account ' || v_account.provider_account_id || ' (binding version '
          || v_binding.version::TEXT || ') is now ' || v_target_status
          || ' according to the provider. Gift intake on this binding is not enabled.',
        'open',
        CASE WHEN v_target_status = 'disconnected' THEN 'critical' ELSE 'high' END,
        'payments',
        CASE WHEN v_target_status = 'disconnected'
             THEN 'payment_account_disconnected'
             ELSE 'payment_account_restricted' END,
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
        p_tenant_id,
        v_task_id,
        'payment_account_binding',
        v_binding.id::TEXT,
        CASE WHEN v_target_status = 'disconnected' THEN 'disconnected_binding' ELSE 'restricted_binding' END,
        pg_catalog.jsonb_build_object(
          'provider_account_id', v_account.provider_account_id,
          'version', v_binding.version,
          'previous_status', v_binding.status,
          'stripe_event_id', v_event.stripe_event_id
        )
      );
    END IF;

    IF v_target_status = 'disconnected' THEN
      v_parked := ARRAY(
        SELECT o.id
          FROM public.donation_saga_outbox AS o
         WHERE o.tenant_id = p_tenant_id
           AND o.kind = 'provider_request'
           AND o.status IN ('queued', 'retry_wait')
           AND NOT o.outcome_unknown
           AND o.donation_id IN (
             SELECT d.id
               FROM public.donations AS d
              WHERE d.tenant_id = p_tenant_id
                AND d.payment_account_binding_id = v_binding.id
           )
         ORDER BY o.id
           FOR NO KEY UPDATE
      );

      UPDATE public.donation_saga_outbox AS o
         SET status = 'parked',
             last_error_code = 'binding_disconnected',
             updated_at = v_now
       WHERE o.tenant_id = p_tenant_id
         AND o.id = ANY (v_parked)
         AND o.status IN ('queued', 'retry_wait')
         AND NOT o.outcome_unknown;
      GET DIAGNOSTICS v_moved = ROW_COUNT;
      IF v_moved <> COALESCE(pg_catalog.cardinality(v_parked), 0) THEN
        RAISE EXCEPTION 'provider_request_park_lost'
          USING ERRCODE = '40001',
                DETAIL = 'A request locked for parking was not parked.';
      END IF;

      INSERT INTO public.mission_control_task_links (
        tenant_id,
        task_id,
        record_type,
        record_id,
        relationship,
        metadata
      )
      SELECT p_tenant_id,
             v_task_id,
             'donation_saga_outbox',
             r.id::TEXT,
             'provider_request_parked_disconnected',
             pg_catalog.jsonb_build_object('binding_id', v_binding.id, 'stripe_event_id', v_event.stripe_event_id)
        FROM pg_catalog.unnest(v_parked) AS r(id);
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
      p_tenant_id,
      NULL,
      'payment_account_status_changed',
      'payment_account_binding',
      v_binding.id::TEXT,
      pg_catalog.jsonb_build_object(
        'previous_status', v_binding.status,
        'status', v_target_status,
        'provider_account_id', v_account.provider_account_id,
        'livemode', v_account.livemode,
        'version', v_binding.version,
        'stripe_event_id', v_event.stripe_event_id,
        'task_id', v_task_id,
        'parked_requests', pg_catalog.to_jsonb(v_parked)
      )
    );
  END IF;

  v_outcome := pg_catalog.jsonb_build_object(
    'outcome', CASE WHEN v_target_status IS DISTINCT FROM v_binding.status THEN 'applied' ELSE 'unchanged' END,
    'attempt', p_attempt,
    'binding_id', v_binding.id,
    'previous_status', v_binding.status,
    'status', v_target_status,
    'task_id', v_task_id
  );

  UPDATE public.stripe_connect_events
     SET processing_status = 'processed',
         processed_at = v_now,
         lease_expires_at = NULL,
         account_snapshot = p_snapshot,
         processing_outcome = v_outcome,
         updated_at = v_now
   WHERE id = p_event_id;

  UPDATE public.payment_provider_accounts
     SET sync_lease_event_id = NULL,
         sync_lease_expires_at = NULL,
         state_synced_at = v_now,
         updated_at = v_now
   WHERE id = v_account.id;

  RETURN v_outcome
    || pg_catalog.jsonb_build_object('replayed', false, 'event_id', p_event_id, 'tenant_id', tenant_guard.current_tenant_id());
END;
$$;

RESET ROLE;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE FUNCTION tenant_guard.abandon_unpaid_intake(
  p_tenant_id UUID,
  p_donation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_binding_id UUID;
  v_binding_status TEXT;
  v_locked UUID[];
  v_in_flight UUID[];
  v_intake RECORD;
  v_found BOOLEAN;
  v_now TIMESTAMPTZ;
  v_abandoned UUID[];
  v_moved BIGINT;
  v_cancel_id UUID;
  v_params JSONB;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  SELECT d.payment_account_binding_id
    INTO v_binding_id
    FROM public.donations AS d
   WHERE d.id = p_donation_id
     AND d.intake_format = 'line_based';
  v_found := FOUND;

  IF NOT v_found THEN
    RAISE EXCEPTION 'not_found'
      USING ERRCODE = '42501',
            DETAIL = 'No line-based intake with this id in the entered tenant.';
  END IF;

  SELECT b.status
    INTO v_binding_status
    FROM public.payment_account_bindings AS b
   WHERE b.tenant_id = p_tenant_id
     AND b.id = v_binding_id
     FOR SHARE;

  v_locked := ARRAY(
    SELECT o.id
      FROM public.donation_saga_outbox AS o
     WHERE o.tenant_id = p_tenant_id
       AND o.donation_id = p_donation_id
       AND o.kind = 'provider_request'
     ORDER BY o.id
       FOR NO KEY UPDATE
  );

  SELECT d.id, d.tenant_id, d.status, d.amount, d.currency, d.provider_account_ref, d.livemode,
         d.stripe_payment_intent_id, d.created_at
    INTO v_intake
    FROM public.donations AS d
   WHERE d.id = p_donation_id
     FOR NO KEY UPDATE;

  v_now := pg_catalog.clock_timestamp();

  IF (v_intake.status IN ('pending', 'failed')) IS NOT TRUE THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'closed',
      'donation_id', v_intake.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'status', v_intake.status
    );
  END IF;

  IF (v_intake.created_at <= v_now - interval '7 days') IS NOT TRUE THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'not_due',
      'donation_id', v_intake.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'due_at', v_intake.created_at + interval '7 days'
    );
  END IF;

  v_in_flight := ARRAY(
    SELECT o.id
      FROM public.donation_saga_outbox AS o
     WHERE o.tenant_id = v_intake.tenant_id
       AND o.donation_id = v_intake.id
       AND o.kind = 'provider_request'
       AND (NOT (o.id = ANY (v_locked))
            OR (o.request_kind = 'create_payment'
                AND o.status IN ('sending', 'retry_wait', 'parked')))
     ORDER BY o.id
  );

  IF pg_catalog.cardinality(v_in_flight) > 0 THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'in_flight',
      'donation_id', v_intake.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'requests', pg_catalog.to_jsonb(v_in_flight)
    );
  END IF;

  IF v_intake.stripe_payment_intent_id IS NOT NULL AND v_binding_status = 'disconnected' THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'binding_disconnected',
      'donation_id', v_intake.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'binding_status', v_binding_status
    );
  END IF;

  UPDATE public.donations
     SET status = 'abandoned',
         abandoned_by = 'sweep',
         updated_at = v_now
   WHERE id = v_intake.id;

  v_abandoned := ARRAY(
    SELECT o.id
      FROM public.donation_saga_outbox AS o
     WHERE o.tenant_id = v_intake.tenant_id
       AND o.id = ANY (v_locked)
       AND o.request_kind = 'create_payment'
       AND o.status = 'queued'
     ORDER BY o.id
  );

  UPDATE public.donation_saga_outbox AS o
     SET status = 'abandoned',
         updated_at = v_now
   WHERE o.tenant_id = v_intake.tenant_id
     AND o.id = ANY (v_abandoned)
     AND o.status = 'queued';
  GET DIAGNOSTICS v_moved = ROW_COUNT;
  IF v_moved <> COALESCE(pg_catalog.cardinality(v_abandoned), 0) THEN
    RAISE EXCEPTION 'provider_request_abandon_lost'
      USING ERRCODE = '40001',
            DETAIL = 'A request locked for abandoning was not abandoned.';
  END IF;

  IF v_intake.stripe_payment_intent_id IS NOT NULL THEN
    v_cancel_id := pg_catalog.gen_random_uuid();
    v_params := pg_catalog.jsonb_build_object(
      'payment_intent', v_intake.stripe_payment_intent_id,
      'cancellation_reason', 'abandoned'
    );
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
      v_cancel_id,
      v_intake.tenant_id,
      v_intake.id,
      v_intake.amount,
      v_intake.currency,
      'gift:' || v_intake.id::TEXT || ':cancel_payment',
      'queued',
      v_now,
      'cancel_payment',
      v_intake.provider_account_ref,
      v_intake.livemode,
      v_params,
      pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_params::TEXT, 'UTF8')), 'hex')
    );
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
    'donation_abandoned',
    'donation',
    v_intake.id::TEXT,
    pg_catalog.jsonb_build_object(
      'abandoned_by', 'sweep',
      'status_before', v_intake.status,
      'abandoned_requests', pg_catalog.to_jsonb(v_abandoned),
      'cancel_operation_id', v_cancel_id
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'outcome', 'abandoned',
    'donation_id', v_intake.id,
    'tenant_id', tenant_guard.current_tenant_id(),
    'abandoned_requests', pg_catalog.to_jsonb(v_abandoned),
    'cancel_operation_id', v_cancel_id
  );
END;
$$;

REVOKE ALL ON FUNCTION tenant_guard.abandon_unpaid_intake(UUID, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.abandon_unpaid_intake(UUID, UUID) TO service_role;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.abandon_unpaid_intake(UUID, UUID) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE FUNCTION public.abandon_unpaid_intake(p_donation_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_tenant UUID;
BEGIN
  SELECT d.tenant_id INTO v_tenant FROM public.donations AS d WHERE d.id = p_donation_id;

  IF v_tenant IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'unknown_anchor', 'donation_id', p_donation_id);
  END IF;

  RETURN tenant_guard.abandon_unpaid_intake(v_tenant, p_donation_id);
END;
$$;

REVOKE ALL ON FUNCTION public.abandon_unpaid_intake(UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.abandon_unpaid_intake(UUID) TO service_role;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
