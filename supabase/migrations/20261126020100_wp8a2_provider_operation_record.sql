-- AL-2681 (WP8a part 2, R1a; plan lines 428, 1154 and 1173; index section
-- 10, binding: statuses and checks 10.3 part 3.1, rules trigger 3.2, grants
-- 3.4; TP4 sections 5, 6 and 9; ruling W8-R21): the record of one request to
-- the payment provider, on public.donation_saga_outbox, and the case a person
-- decides when its outcome is unknown. Nothing live creates a provider
-- request; the live saga's rows are untouched and invisible to the guard.
--
-- 1. kind text NOT NULL ('legacy_saga' for every existing row and every row a
--    role other than tenant_guard inserts; 'provider_request' for a row the
--    guard inserts), added with the default 'legacy_saga', the default then
--    dropped; trigger donation_saga_outbox_kind stamps it from current_user,
--    refuses a supplied kind that differs (42501) and any change (23514).
--    begin_donation_saga is not redefined: it names no kind and is stamped.
-- 2. donor_id drops NOT NULL (a legacy row still needs it, by check). New
--    columns: request_kind, provider_account_ref, livemode, request_params,
--    request_digest, first_sent_at, send_deadline, lease_expires_at,
--    parked_at, provider_object_id, outcome_unknown (NOT NULL DEFAULT false)
--    and max_attempts (NOT NULL DEFAULT 5).
-- 3. The status check is replaced (legacy rows: their five statuses;
--    provider rows: queued, sending, retry_wait, parked, linked, refused,
--    dead_letter, adopted, abandoned) and checks 2 to 11 of the machine are
--    added, each 'kind <> provider_request OR (...) IS TRUE', with the
--    kind's domain and the legacy rule (every new nullable column NULL,
--    outcome_unknown false, donor_id set). Check 11's span carries no
--    max_attempts clause: check 10 holds max_attempts >= 1, no ceiling
--    (index 10.5). Each check and the new foreign key NOT VALID, then
--    validated.
-- 4. Keys: UNIQUE (tenant_id, id, donation_id); one provider request per
--    intake and request kind; donation_saga_outbox_account_fk (tenant,
--    intake, account, mode) to donations_account_key.
-- 5. Trigger donation_saga_outbox_provider_rules (BEFORE INSERT OR UPDATE OR
--    DELETE; after the fee-extras and kind triggers by name): rules D, I and
--    U1 to U9 of index 10.3 part 3.2. Legacy rows pass at once.
-- 6. tenant_guard: SELECT of the 23 columns of part 3.4 and UPDATE of status,
--    attempt_count, next_attempt_at, lease_expires_at, outcome_unknown,
--    provider_object_id, last_error_code and updated_at only (first_sent_at,
--    send_deadline and parked_at are written by the trigger alone), behind a
--    tenant_guard_isolation policy that admits provider rows of the entered
--    tenant only. No INSERT and no DELETE.
-- 7. public.payment_repair_cases ('outcome_unknown' cases): its key to the
--    request, one open case per request, a resolution all set or all NULL, a
--    reason of 3 to 500 characters after trimming, a rules trigger (anchors
--    fixed, no delete, a resolved case fixed); row security forced, nothing
--    for PUBLIC, anon, authenticated or service_role, tenant_guard SELECT and
--    INSERT behind tenant_guard_isolation.
-- 8. A unique backstop on public.mission_control_task_links: one link per
--    record and relationship for 'provider_request_dead_letter' and
--    'provider_request_parked'.
--
-- Locks, all held to COMMIT, taken first and in this order: SHARE ROW
-- EXCLUSIVE on donations (the new foreign key's target), ACCESS EXCLUSIVE on
-- donation_saga_outbox, SHARE on mission_control_task_links (its new index);
-- the new table's foreign key takes SHARE ROW EXCLUSIVE on tenants.
-- lock_timeout stops a run rather than queue it behind live traffic.
--
-- Recovery. Nothing here is written to run twice: a run lost between its
-- COMMIT and its ledger row stops on the next run at its first ADD COLUMN
-- (42701, column "kind" already exists; observed on a second run of the
-- applied file). This file has committed when this read-only check is true:
-- SELECT to_regclass('public.payment_repair_cases') IS NOT NULL. Then follow
-- docs/ops/release-job.md, "If the migration committed but its ledger row is
-- missing", with this check and this file's version, 20261126020100. It has
-- no preflight or post-assert of its own.
--
-- Down, an operator's last resort, for a database that holds no provider
-- request (SELECT count(*) FROM public.donation_saga_outbox WHERE kind =
-- 'provider_request' reads 0; with one, the restored status check and
-- donor_id's NOT NULL refuse it and nothing is reverted); in one
-- transaction, after 20261126020200 is reverted and before 20261126020000:
--   DROP INDEX public.mission_control_task_links_provider_request_key;
--   DROP TABLE public.payment_repair_cases;
--   DROP FUNCTION private.payment_repair_cases_rules();
--   DROP POLICY tenant_guard_isolation ON public.donation_saga_outbox;
--   REVOKE ALL ON TABLE public.donation_saga_outbox FROM tenant_guard;
--   DROP TRIGGER donation_saga_outbox_provider_rules ON public.donation_saga_outbox;
--   DROP TRIGGER donation_saga_outbox_kind ON public.donation_saga_outbox;
--   DROP FUNCTION private.donation_saga_outbox_provider_rules(),
--     private.donation_saga_outbox_kind();
--   DROP INDEX public.donation_saga_outbox_one_request_per_intake;
--   ALTER TABLE public.donation_saga_outbox
--     DROP CONSTRAINT donation_saga_outbox_account_fk,
--     DROP CONSTRAINT donation_saga_outbox_tenant_operation_key,
--     DROP CONSTRAINT donation_saga_outbox_request_params_check,
--     DROP CONSTRAINT donation_saga_outbox_request_check,
--     DROP CONSTRAINT donation_saga_outbox_attempts_check,
--     DROP CONSTRAINT donation_saga_outbox_retry_window_check,
--     DROP CONSTRAINT donation_saga_outbox_unknown_check,
--     DROP CONSTRAINT donation_saga_outbox_parked_at_check,
--     DROP CONSTRAINT donation_saga_outbox_object_check,
--     DROP CONSTRAINT donation_saga_outbox_lease_check,
--     DROP CONSTRAINT donation_saga_outbox_window_check,
--     DROP CONSTRAINT donation_saga_outbox_unsent_check,
--     DROP CONSTRAINT donation_saga_outbox_sent_check,
--     DROP CONSTRAINT donation_saga_outbox_legacy_check,
--     DROP CONSTRAINT donation_saga_outbox_status_check,
--     DROP CONSTRAINT donation_saga_outbox_kind_check;
--   ALTER TABLE public.donation_saga_outbox
--     DROP COLUMN kind, DROP COLUMN request_kind,
--     DROP COLUMN provider_account_ref, DROP COLUMN livemode,
--     DROP COLUMN request_params, DROP COLUMN request_digest,
--     DROP COLUMN first_sent_at, DROP COLUMN send_deadline,
--     DROP COLUMN lease_expires_at, DROP COLUMN parked_at,
--     DROP COLUMN provider_object_id, DROP COLUMN outcome_unknown,
--     DROP COLUMN max_attempts,
--     ADD CONSTRAINT donation_saga_outbox_status_check
--       CHECK (status IN ('pending', 'processing', 'failed', 'completed', 'dead_letter')),
--     ALTER COLUMN donor_id SET NOT NULL;

BEGIN;
SET LOCAL lock_timeout = '5s';

LOCK TABLE public.donations IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.donation_saga_outbox IN ACCESS EXCLUSIVE MODE;
LOCK TABLE public.mission_control_task_links IN SHARE MODE;

ALTER TABLE public.donation_saga_outbox
  ADD COLUMN kind TEXT NOT NULL DEFAULT 'legacy_saga',
  ADD COLUMN request_kind TEXT,
  ADD COLUMN provider_account_ref TEXT,
  ADD COLUMN livemode BOOLEAN,
  ADD COLUMN request_params JSONB,
  ADD COLUMN request_digest TEXT,
  ADD COLUMN first_sent_at TIMESTAMPTZ,
  ADD COLUMN send_deadline TIMESTAMPTZ,
  ADD COLUMN lease_expires_at TIMESTAMPTZ,
  ADD COLUMN parked_at TIMESTAMPTZ,
  ADD COLUMN provider_object_id TEXT,
  ADD COLUMN outcome_unknown BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN max_attempts INTEGER NOT NULL DEFAULT 5;

ALTER TABLE public.donation_saga_outbox
  ALTER COLUMN kind DROP DEFAULT,
  ALTER COLUMN donor_id DROP NOT NULL;

ALTER TABLE public.donation_saga_outbox
  DROP CONSTRAINT donation_saga_outbox_status_check;

ALTER TABLE public.donation_saga_outbox
  ADD CONSTRAINT donation_saga_outbox_kind_check
    CHECK (kind IN ('legacy_saga', 'provider_request')) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_status_check
    CHECK (
      (kind = 'legacy_saga'
        AND (status IN ('pending', 'processing', 'failed', 'completed', 'dead_letter')) IS TRUE)
      OR (kind = 'provider_request'
        AND (status IN ('queued', 'sending', 'retry_wait', 'parked', 'linked', 'refused',
                        'dead_letter', 'adopted', 'abandoned')) IS TRUE)
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_legacy_check
    CHECK (
      kind <> 'legacy_saga'
      OR (
        request_kind IS NULL
        AND provider_account_ref IS NULL
        AND livemode IS NULL
        AND request_params IS NULL
        AND request_digest IS NULL
        AND first_sent_at IS NULL
        AND send_deadline IS NULL
        AND lease_expires_at IS NULL
        AND parked_at IS NULL
        AND provider_object_id IS NULL
        AND NOT outcome_unknown
        AND donor_id IS NOT NULL
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_sent_check
    CHECK (
      kind <> 'provider_request'
      OR (
        (first_sent_at IS NULL) = (send_deadline IS NULL)
        AND (first_sent_at IS NULL) = (attempt_count = 0)
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_unsent_check
    CHECK (
      kind <> 'provider_request'
      OR (
        (status IN ('queued', 'abandoned') OR first_sent_at IS NOT NULL)
        AND (status <> 'queued' OR first_sent_at IS NULL)
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_window_check
    CHECK (
      kind <> 'provider_request'
      OR (
        send_deadline IS NULL
        OR send_deadline <= first_sent_at + interval '23 hours'
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_lease_check
    CHECK (
      kind <> 'provider_request'
      OR (
        (status = 'sending') = (lease_expires_at IS NOT NULL)
        AND (lease_expires_at IS NULL OR lease_expires_at <= send_deadline)
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_object_check
    CHECK (
      kind <> 'provider_request'
      OR (
        (provider_object_id IS NOT NULL) = (status IN ('linked', 'adopted'))
        AND (provider_object_id IS NULL OR provider_object_id ~ '^pi_[A-Za-z0-9]+$')
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_parked_at_check
    CHECK (
      kind <> 'provider_request'
      OR (
        (parked_at IS NOT NULL) = (
          status IN ('parked', 'adopted')
          OR (status = 'abandoned' AND first_sent_at IS NOT NULL)
        )
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_unknown_check
    CHECK (
      kind <> 'provider_request'
      OR (
        (status <> 'parked' OR outcome_unknown)
        AND (NOT outcome_unknown OR status IN ('sending', 'retry_wait', 'parked'))
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_retry_window_check
    CHECK (
      kind <> 'provider_request'
      OR (
        status <> 'retry_wait'
        OR next_attempt_at + interval '900 seconds' <= send_deadline
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_attempts_check
    CHECK (
      kind <> 'provider_request'
      OR (
        max_attempts >= 1
        AND attempt_count BETWEEN 0 AND max_attempts
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_request_check
    CHECK (
      kind <> 'provider_request'
      OR (
        request_kind = 'create_payment'
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
      OR (
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
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donation_saga_outbox_tenant_operation_key
    UNIQUE (tenant_id, id, donation_id),
  ADD CONSTRAINT donation_saga_outbox_account_fk
    FOREIGN KEY (tenant_id, donation_id, provider_account_ref, livemode)
    REFERENCES public.donations (tenant_id, id, provider_account_ref, livemode)
    NOT VALID;

ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_kind_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_status_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_legacy_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_sent_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_unsent_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_window_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_lease_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_object_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_parked_at_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_unknown_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_retry_window_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_attempts_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_request_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_request_params_check;
ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_account_fk;

CREATE UNIQUE INDEX donation_saga_outbox_one_request_per_intake
  ON public.donation_saga_outbox (tenant_id, donation_id, request_kind)
  WHERE kind = 'provider_request';

CREATE FUNCTION private.donation_saga_outbox_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_kind TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_kind := CASE WHEN current_user = 'tenant_guard' THEN 'provider_request' ELSE 'legacy_saga' END;
    IF NEW.kind IS NULL THEN
      NEW.kind := v_kind;
    END IF;
    IF (NEW.kind = v_kind) IS NOT TRUE THEN
      RAISE EXCEPTION 'donation_saga_outbox_kind_mismatch'
        USING ERRCODE = '42501',
              DETAIL = pg_catalog.format('%s may insert only %s rows', current_user, v_kind);
    END IF;
    RETURN NEW;
  END IF;

  IF (NEW.kind = OLD.kind) IS NOT TRUE THEN
    RAISE EXCEPTION 'donation_saga_outbox_kind_frozen'
      USING ERRCODE = '23514',
            DETAIL = 'An outbox row keeps the kind it was created with.';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.donation_saga_outbox_kind()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER donation_saga_outbox_kind
  BEFORE INSERT OR UPDATE ON public.donation_saga_outbox
  FOR EACH ROW
  EXECUTE FUNCTION private.donation_saga_outbox_kind();

CREATE FUNCTION private.donation_saga_outbox_provider_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_edge BOOLEAN;
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
        AND NEW.parked_at IS NULL) IS NOT TRUE THEN
      RAISE EXCEPTION 'provider_request_created_unsent'
        USING ERRCODE = '23514',
              DETAIL = 'A provider request is created queued, unsent, unleased, unlinked and known.';
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
      OR (OLD.status = 'queued' AND NEW.status = 'abandoned')
      OR (OLD.status = 'parked' AND NEW.status IN ('adopted', 'abandoned', 'retry_wait'));
    IF v_edge IS NOT TRUE THEN
      RAISE EXCEPTION 'provider_request_bad_move'
        USING ERRCODE = '23514',
              DETAIL = pg_catalog.format('No move from %s to %s.', OLD.status, NEW.status);
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
  ELSIF OLD.status = 'parked' AND NEW.status = 'retry_wait' THEN
    NEW.parked_at := NULL;
  ELSIF (NEW.parked_at IS NOT DISTINCT FROM OLD.parked_at) IS NOT TRUE THEN
    RAISE EXCEPTION 'provider_request_frozen'
      USING ERRCODE = '23514',
            DETAIL = 'The database alone sets and clears the parking time.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.donation_saga_outbox_provider_rules()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER donation_saga_outbox_provider_rules
  BEFORE INSERT OR UPDATE OR DELETE ON public.donation_saga_outbox
  FOR EACH ROW
  EXECUTE FUNCTION private.donation_saga_outbox_provider_rules();

GRANT SELECT (
  id,
  tenant_id,
  kind,
  donation_id,
  status,
  attempt_count,
  max_attempts,
  next_attempt_at,
  lease_expires_at,
  first_sent_at,
  send_deadline,
  outcome_unknown,
  provider_object_id,
  parked_at,
  request_kind,
  provider_account_ref,
  livemode,
  idempotency_key,
  request_params,
  request_digest,
  amount,
  currency,
  last_error_code
) ON TABLE public.donation_saga_outbox TO tenant_guard;
GRANT UPDATE (
  status,
  attempt_count,
  next_attempt_at,
  lease_expires_at,
  outcome_unknown,
  provider_object_id,
  last_error_code,
  updated_at
) ON TABLE public.donation_saga_outbox TO tenant_guard;

DROP POLICY IF EXISTS tenant_guard_isolation ON public.donation_saga_outbox;
CREATE POLICY tenant_guard_isolation
  ON public.donation_saga_outbox
  FOR ALL
  TO tenant_guard
  USING (
    tenant_id = (SELECT tenant_guard.current_tenant_id())
    AND kind = 'provider_request'
  )
  WITH CHECK (
    tenant_id = (SELECT tenant_guard.current_tenant_id())
    AND kind = 'provider_request'
  );

CREATE TABLE public.payment_repair_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  kind TEXT NOT NULL CONSTRAINT payment_repair_cases_kind_check CHECK (kind = 'outcome_unknown'),
  operation_id UUID NOT NULL,
  donation_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolution TEXT CONSTRAINT payment_repair_cases_resolution_value_check
    CHECK (resolution IN ('adopted', 'abandoned', 'retried')),
  resolution_reason TEXT,
  resolved_by UUID,
  resolved_assignment_id UUID,
  resolved_at TIMESTAMPTZ,
  resolution_details JSONB,
  CONSTRAINT payment_repair_cases_operation_fk
    FOREIGN KEY (tenant_id, operation_id, donation_id)
    REFERENCES public.donation_saga_outbox (tenant_id, id, donation_id)
    ON DELETE RESTRICT,
  CONSTRAINT payment_repair_cases_resolution_complete_check
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
  CONSTRAINT payment_repair_cases_reason_check
    CHECK (
      resolution_reason IS NULL
      OR (
        char_length(btrim(resolution_reason, E' \t\n\r\v\f' || chr(160) || chr(5760) ||
          chr(8192) || chr(8193) || chr(8194) || chr(8195) || chr(8196) || chr(8197) ||
          chr(8198) || chr(8199) || chr(8200) || chr(8201) || chr(8202) || chr(8232) ||
          chr(8233) || chr(8239) || chr(8287) || chr(12288) || chr(65279))) BETWEEN 3 AND 500
      ) IS TRUE
    )
);

CREATE UNIQUE INDEX payment_repair_cases_one_open_per_operation
  ON public.payment_repair_cases (tenant_id, operation_id)
  WHERE resolved_at IS NULL;

CREATE FUNCTION private.payment_repair_cases_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'payment_repair_case_sealed'
      USING ERRCODE = '23514',
            DETAIL = 'A repair case is evidence and is never deleted.';
  END IF;

  IF (NEW.id IS NOT DISTINCT FROM OLD.id
      AND NEW.tenant_id IS NOT DISTINCT FROM OLD.tenant_id
      AND NEW.kind IS NOT DISTINCT FROM OLD.kind
      AND NEW.operation_id IS NOT DISTINCT FROM OLD.operation_id
      AND NEW.donation_id IS NOT DISTINCT FROM OLD.donation_id
      AND NEW.created_at IS NOT DISTINCT FROM OLD.created_at) IS NOT TRUE THEN
    RAISE EXCEPTION 'payment_repair_case_anchor_fixed'
      USING ERRCODE = '23514',
            DETAIL = 'A repair case keeps its tenant, kind, request, intake and creation time.';
  END IF;

  IF OLD.resolved_at IS NOT NULL AND (NEW IS NOT DISTINCT FROM OLD) IS NOT TRUE THEN
    RAISE EXCEPTION 'payment_repair_case_resolved'
      USING ERRCODE = '23514',
            DETAIL = 'A resolved repair case never changes.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.payment_repair_cases_rules()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER payment_repair_cases_rules
  BEFORE UPDATE OR DELETE ON public.payment_repair_cases
  FOR EACH ROW
  EXECUTE FUNCTION private.payment_repair_cases_rules();

ALTER TABLE public.payment_repair_cases
  ENABLE ROW LEVEL SECURITY,
  FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.payment_repair_cases
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT ON TABLE public.payment_repair_cases TO tenant_guard;

CREATE POLICY tenant_guard_isolation
  ON public.payment_repair_cases
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

CREATE UNIQUE INDEX mission_control_task_links_provider_request_key
  ON public.mission_control_task_links (tenant_id, record_type, record_id, relationship)
  WHERE relationship IN ('provider_request_dead_letter', 'provider_request_parked');

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
