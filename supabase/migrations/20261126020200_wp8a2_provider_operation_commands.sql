-- AL-2681 (WP8a part 2, R1a; plan lines 1154 and 1173; index section 10,
-- binding: transitions 10.3 part 3.3 and wire contracts 3.5, with the
-- coordinator's note 1 on the order of the first statements; TP4 sections 9,
-- 10 and 12; docs/security/tenant-guard.md, "Worker entry points", steps 1 to
-- 6): the worker commands of a provider request. Nothing calls them yet.
--
-- 1. tenant_guard.claim_provider_operation(uuid, uuid, integer): enters the
--    tenant, checks the lease (5 to 900 seconds, 22023 lease_out_of_range),
--    locks the request FOR NO KEY UPDATE (none: 42501 not_found), then in
--    order: closed, parked (its open case), held, not_due; past the window
--    or out of attempts it parks a request whose outcome may be unknown and
--    dead-letters a known one with a task; a binding that is not active
--    leases nothing; otherwise it claims the next attempt.
-- 2. tenant_guard.record_provider_operation_result(uuid, uuid, integer, jsonb):
--    enters the tenant, checks the result's shape (22023 bad_result), locks
--    the request (42501 not_found), refuses a stale attempt (55000
--    stale_attempt), replays a linked winner (already_linked), refuses a
--    report without a live lease (55000 lease_lost), then links, refuses,
--    schedules a retry that fits the window and the budget, parks an unknown
--    outcome or dead-letters a known one with a task.
-- 3. tenant_guard.money_park_operation(uuid, text, text): the park helper
--    both commands call on a locked sending or retry_wait request (else 55000
--    not_parkable): the request parked, one outcome_unknown case, one task
--    and its link to the case, one audit row. Owned by postgres, invoker,
--    EXECUTE for tenant_guard only.
-- 4. public.claim_provider_operation(uuid, integer) and
--    public.record_provider_operation_result(uuid, integer, jsonb): invoker
--    wrappers for service_role only, with no tenant argument; each reads the
--    request's tenant once from the stored row and returns unknown_anchor,
--    writing nothing, when there is no provider request with that id.
-- Every SELECT and RETURNING names its columns. Every result carries
-- outcome, operation_id and tenant_id; times are JSON strings.
--
-- Locks: none at migration time (functions only). At run time each command
-- locks one request row, as its steps say.
--
-- Recovery. Nothing here is written to run twice: a run lost between its
-- COMMIT and its ledger row stops on the next run at its first CREATE
-- FUNCTION (42723). This file has committed when this read-only check is
-- true: SELECT to_regprocedure('public.record_provider_operation_result(uuid,integer,jsonb)')
-- IS NOT NULL. Then follow docs/ops/release-job.md, "If the migration
-- committed but its ledger row is missing", with this check and this file's
-- version, 20261126020200. It has no preflight or post-assert of its own.
--
-- Down (in one transaction):
--   DROP FUNCTION public.record_provider_operation_result(uuid, integer, jsonb),
--     public.claim_provider_operation(uuid, integer),
--     tenant_guard.record_provider_operation_result(uuid, uuid, integer, jsonb),
--     tenant_guard.claim_provider_operation(uuid, uuid, integer),
--     tenant_guard.money_park_operation(uuid, text, text);

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE FUNCTION tenant_guard.money_park_operation(
  p_operation_id UUID,
  p_reason TEXT,
  p_error_code TEXT
)
RETURNS UUID
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_op RECORD;
  v_found BOOLEAN;
  v_now TIMESTAMPTZ;
  v_case_id UUID;
  v_task_id UUID;
BEGIN
  SELECT o.id, o.tenant_id, o.donation_id, o.status, o.attempt_count, o.max_attempts,
         o.idempotency_key, o.provider_account_ref, o.livemode, o.send_deadline
    INTO v_op
    FROM public.donation_saga_outbox AS o
   WHERE o.id = p_operation_id
     AND o.kind = 'provider_request'
     FOR NO KEY UPDATE;
  v_found := FOUND;

  IF (v_found AND v_op.status IN ('sending', 'retry_wait')) IS NOT TRUE THEN
    RAISE EXCEPTION 'not_parkable'
      USING ERRCODE = '55000',
            DETAIL = 'Only a locked request that is sending or waiting to retry can be parked.';
  END IF;

  v_now := pg_catalog.clock_timestamp();

  UPDATE public.donation_saga_outbox
     SET status = 'parked',
         outcome_unknown = true,
         lease_expires_at = NULL,
         last_error_code = COALESCE(p_error_code, last_error_code),
         updated_at = v_now
   WHERE id = v_op.id;

  INSERT INTO public.payment_repair_cases (tenant_id, kind, operation_id, donation_id)
  VALUES (v_op.tenant_id, 'outcome_unknown', v_op.id, v_op.donation_id)
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
    v_op.tenant_id,
    'Payment request outcome unknown',
    pg_catalog.format(
      'Provider request %s (key %s, account %s, livemode %s) was parked after attempt %s of %s (%s); repair case %s needs a decision before the send deadline %s.',
      v_op.id, v_op.idempotency_key, v_op.provider_account_ref, v_op.livemode,
      v_op.attempt_count, v_op.max_attempts, p_reason, v_case_id, v_op.send_deadline
    ),
    'open',
    'high',
    'payments',
    'provider_request_parked',
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
    v_op.tenant_id,
    v_task_id,
    'payment_repair_case',
    v_case_id::TEXT,
    'provider_request_parked',
    pg_catalog.jsonb_build_object(
      'operation_id', v_op.id,
      'donation_id', v_op.donation_id,
      'attempt', v_op.attempt_count,
      'reason', p_reason,
      'error_code', p_error_code
    )
  );

  INSERT INTO public.audit_logs (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    details
  )
  VALUES (
    v_op.tenant_id,
    NULL,
    'provider_request_parked',
    'donation_saga_outbox',
    v_op.id::TEXT,
    pg_catalog.jsonb_build_object(
      'case_id', v_case_id,
      'task_id', v_task_id,
      'donation_id', v_op.donation_id,
      'attempt', v_op.attempt_count,
      'max_attempts', v_op.max_attempts,
      'reason', p_reason,
      'error_code', p_error_code
    )
  );

  RETURN v_case_id;
END;
$$;

CREATE FUNCTION tenant_guard.claim_provider_operation(
  p_tenant_id UUID,
  p_operation_id UUID,
  p_lease_seconds INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_op RECORD;
  v_found BOOLEAN;
  v_now TIMESTAMPTZ;
  v_lease TIMESTAMPTZ;
  v_case_id UUID;
  v_task_id UUID;
  v_binding_status TEXT;
  v_claimed RECORD;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  IF (p_lease_seconds BETWEEN 5 AND 900) IS NOT TRUE THEN
    RAISE EXCEPTION 'lease_out_of_range'
      USING ERRCODE = '22023',
            DETAIL = 'A lease is 5 to 900 seconds.';
  END IF;

  SELECT o.id, o.tenant_id, o.donation_id, o.status, o.attempt_count, o.max_attempts,
         o.next_attempt_at, o.lease_expires_at, o.first_sent_at, o.send_deadline,
         o.outcome_unknown, o.request_kind, o.provider_account_ref, o.livemode,
         o.idempotency_key, o.request_params, o.request_digest
    INTO v_op
    FROM public.donation_saga_outbox AS o
   WHERE o.id = p_operation_id
     AND o.kind = 'provider_request'
     FOR NO KEY UPDATE;
  v_found := FOUND;

  IF NOT v_found THEN
    RAISE EXCEPTION 'not_found'
      USING ERRCODE = '42501',
            DETAIL = 'No provider request with this id in the entered tenant.';
  END IF;

  v_now := pg_catalog.clock_timestamp();

  IF v_op.status IN ('linked', 'refused', 'dead_letter', 'adopted', 'abandoned') THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'closed',
      'operation_id', v_op.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'status', v_op.status
    );
  END IF;

  IF v_op.status = 'parked' THEN
    SELECT c.id
      INTO v_case_id
      FROM public.payment_repair_cases AS c
     WHERE c.tenant_id = v_op.tenant_id
       AND c.operation_id = v_op.id
       AND c.resolved_at IS NULL;
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'parked',
      'operation_id', v_op.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'case_id', v_case_id
    );
  END IF;

  IF v_op.status = 'sending' AND v_op.lease_expires_at > v_now THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'held',
      'operation_id', v_op.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'attempt', v_op.attempt_count,
      'lease_expires_at', v_op.lease_expires_at
    );
  END IF;

  IF v_op.status IN ('queued', 'retry_wait') AND v_op.next_attempt_at > v_now THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'not_due',
      'operation_id', v_op.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'next_attempt_at', v_op.next_attempt_at
    );
  END IF;

  v_lease := v_now + pg_catalog.make_interval(secs => p_lease_seconds);

  IF (v_op.first_sent_at IS NOT NULL AND v_lease > v_op.send_deadline)
     OR v_op.attempt_count >= v_op.max_attempts THEN
    IF v_op.status = 'sending' OR v_op.outcome_unknown THEN
      v_case_id := tenant_guard.money_park_operation(
        v_op.id,
        CASE WHEN v_op.attempt_count >= v_op.max_attempts THEN 'attempts_exhausted' ELSE 'window_passed' END,
        NULL
      );
      RETURN pg_catalog.jsonb_build_object(
        'outcome', 'parked',
        'operation_id', v_op.id,
        'tenant_id', tenant_guard.current_tenant_id(),
        'case_id', v_case_id
      );
    END IF;

    UPDATE public.donation_saga_outbox
       SET status = 'dead_letter',
           updated_at = v_now
     WHERE id = v_op.id;

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
      v_op.tenant_id,
      'Payment request dead-lettered',
      pg_catalog.format(
        'Provider request %s (key %s, account %s, livemode %s) was never performed and has no retry left after attempt %s of %s (%s).',
        v_op.id, v_op.idempotency_key, v_op.provider_account_ref, v_op.livemode,
        v_op.attempt_count, v_op.max_attempts,
        CASE WHEN v_op.attempt_count >= v_op.max_attempts THEN 'attempts_exhausted' ELSE 'window_passed' END
      ),
      'open',
      'high',
      'payments',
      'provider_request_dead_letter',
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
      v_op.tenant_id,
      v_task_id,
      'donation_saga_outbox',
      v_op.id::TEXT,
      'provider_request_dead_letter',
      pg_catalog.jsonb_build_object(
        'donation_id', v_op.donation_id,
        'attempt', v_op.attempt_count,
        'reason', CASE WHEN v_op.attempt_count >= v_op.max_attempts THEN 'attempts_exhausted' ELSE 'window_passed' END
      )
    );

    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'dead_letter',
      'operation_id', v_op.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'task_id', v_task_id
    );
  END IF;

  SELECT b.status
    INTO v_binding_status
    FROM public.donations AS d
    JOIN public.payment_account_bindings AS b
      ON b.tenant_id = d.tenant_id
     AND b.id = d.payment_account_binding_id
   WHERE d.id = v_op.donation_id;

  IF v_binding_status IS DISTINCT FROM 'active' THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'binding_inactive',
      'operation_id', v_op.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'binding_status', v_binding_status
    );
  END IF;

  UPDATE public.donation_saga_outbox
     SET status = 'sending',
         attempt_count = attempt_count + 1,
         lease_expires_at = v_lease,
         updated_at = v_now
   WHERE id = v_op.id
  RETURNING attempt_count, lease_expires_at, send_deadline
    INTO v_claimed;

  RETURN pg_catalog.jsonb_build_object(
    'outcome', 'claimed',
    'operation_id', v_op.id,
    'tenant_id', tenant_guard.current_tenant_id(),
    'attempt', v_claimed.attempt_count,
    'lease_expires_at', v_claimed.lease_expires_at,
    'send_deadline', v_claimed.send_deadline,
    'request_kind', v_op.request_kind,
    'idempotency_key', v_op.idempotency_key,
    'request', v_op.request_params,
    'request_digest', v_op.request_digest,
    'provider_account', v_op.provider_account_ref,
    'livemode', v_op.livemode
  );
END;
$$;

CREATE FUNCTION tenant_guard.record_provider_operation_result(
  p_tenant_id UUID,
  p_operation_id UUID,
  p_attempt INTEGER,
  p_result JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_op RECORD;
  v_found BOOLEAN;
  v_now TIMESTAMPTZ;
  v_result TEXT;
  v_object TEXT;
  v_error TEXT;
  v_delay INTEGER;
  v_unknown BOOLEAN;
  v_next TIMESTAMPTZ;
  v_intake_ref TEXT;
  v_case_id UUID;
  v_task_id UUID;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  IF (
    pg_catalog.jsonb_typeof(p_result) = 'object'
    AND (p_result - ARRAY['result', 'provider_object_id', 'retry_delay_seconds', 'error_code']) = '{}'::JSONB
    AND pg_catalog.jsonb_typeof(p_result -> 'result') = 'string'
    AND (p_result ->> 'result') IN ('succeeded', 'refused', 'not_performed', 'unknown')
    AND (p_result ? 'provider_object_id') = ((p_result ->> 'result') = 'succeeded')
    AND (
      NOT (p_result ? 'provider_object_id')
      OR (pg_catalog.jsonb_typeof(p_result -> 'provider_object_id') = 'string'
          AND (p_result ->> 'provider_object_id') ~ '^pi_[A-Za-z0-9]+$')
    )
    AND (p_result ? 'retry_delay_seconds') = ((p_result ->> 'result') IN ('not_performed', 'unknown'))
    AND (
      NOT (p_result ? 'retry_delay_seconds')
      OR (pg_catalog.jsonb_typeof(p_result -> 'retry_delay_seconds') = 'number'
          AND CASE
                WHEN (p_result ->> 'retry_delay_seconds') ~ '^[0-9]{1,4}$'
                  THEN (p_result ->> 'retry_delay_seconds')::INTEGER BETWEEN 30 AND 3600
                ELSE false
              END)
    )
    AND (
      NOT (p_result ? 'error_code')
      OR ((p_result ->> 'result') <> 'succeeded'
          AND pg_catalog.jsonb_typeof(p_result -> 'error_code') = 'string'
          AND (p_result ->> 'error_code') ~ '^[a-z][a-z0-9_]{0,63}$')
    )
  ) IS NOT TRUE THEN
    RAISE EXCEPTION 'bad_result'
      USING ERRCODE = '22023',
            DETAIL = 'A result is an object with result, and provider_object_id, retry_delay_seconds or error_code as its kind allows.';
  END IF;

  SELECT o.id, o.tenant_id, o.donation_id, o.status, o.attempt_count, o.max_attempts,
         o.lease_expires_at, o.send_deadline, o.outcome_unknown, o.provider_object_id,
         o.idempotency_key, o.provider_account_ref, o.livemode
    INTO v_op
    FROM public.donation_saga_outbox AS o
   WHERE o.id = p_operation_id
     AND o.kind = 'provider_request'
     FOR NO KEY UPDATE;
  v_found := FOUND;

  IF NOT v_found THEN
    RAISE EXCEPTION 'not_found'
      USING ERRCODE = '42501',
            DETAIL = 'No provider request with this id in the entered tenant.';
  END IF;

  v_now := pg_catalog.clock_timestamp();
  v_result := p_result ->> 'result';
  v_object := p_result ->> 'provider_object_id';
  v_error := p_result ->> 'error_code';

  IF p_attempt IS DISTINCT FROM v_op.attempt_count THEN
    RAISE EXCEPTION 'stale_attempt'
      USING ERRCODE = '55000',
            DETAIL = pg_catalog.format('Attempt %s is not the current attempt %s.', p_attempt, v_op.attempt_count);
  END IF;

  IF v_op.status = 'linked'
     AND v_result = 'succeeded'
     AND v_op.provider_object_id = v_object THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'already_linked',
      'operation_id', v_op.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'attempt', v_op.attempt_count,
      'provider_object_id', v_op.provider_object_id
    );
  END IF;

  IF (v_op.status = 'sending' AND v_op.lease_expires_at > v_now) IS NOT TRUE THEN
    RAISE EXCEPTION 'lease_lost'
      USING ERRCODE = '55000',
            DETAIL = 'The attempt no longer holds a live lease.';
  END IF;

  IF v_result = 'succeeded' THEN
    SELECT d.stripe_payment_intent_id
      INTO v_intake_ref
      FROM public.donations AS d
     WHERE d.id = v_op.donation_id;

    IF (v_intake_ref IS NULL OR v_intake_ref = v_object) IS NOT TRUE THEN
      RAISE EXCEPTION 'intake_names_another_object'
        USING ERRCODE = '23514',
              DETAIL = 'The intake already names another payment object.';
    END IF;

    UPDATE public.donation_saga_outbox
       SET status = 'linked',
           provider_object_id = v_object,
           outcome_unknown = false,
           lease_expires_at = NULL,
           updated_at = v_now
     WHERE id = v_op.id;

    IF v_intake_ref IS NULL THEN
      UPDATE public.donations
         SET stripe_payment_intent_id = v_object,
             updated_at = v_now
       WHERE id = v_op.donation_id;
    END IF;

    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'linked',
      'operation_id', v_op.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'attempt', v_op.attempt_count,
      'provider_object_id', v_object,
      'donation_id', v_op.donation_id
    );
  END IF;

  IF v_result = 'refused' THEN
    UPDATE public.donation_saga_outbox
       SET status = 'refused',
           outcome_unknown = false,
           last_error_code = COALESCE(v_error, 'refused'),
           lease_expires_at = NULL,
           updated_at = v_now
     WHERE id = v_op.id;

    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'refused',
      'operation_id', v_op.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'attempt', v_op.attempt_count
    );
  END IF;

  v_delay := (p_result ->> 'retry_delay_seconds')::INTEGER;
  v_unknown := v_op.outcome_unknown OR v_result = 'unknown';
  v_next := v_now + pg_catalog.make_interval(secs => v_delay);

  IF v_op.attempt_count < v_op.max_attempts
     AND v_next + interval '900 seconds' <= v_op.send_deadline THEN
    UPDATE public.donation_saga_outbox
       SET status = 'retry_wait',
           next_attempt_at = v_next,
           outcome_unknown = v_unknown,
           last_error_code = COALESCE(v_error, last_error_code),
           lease_expires_at = NULL,
           updated_at = v_now
     WHERE id = v_op.id;

    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'retry_scheduled',
      'operation_id', v_op.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'attempt', v_op.attempt_count,
      'next_attempt_at', v_next
    );
  END IF;

  IF v_unknown THEN
    v_case_id := tenant_guard.money_park_operation(
      v_op.id,
      CASE WHEN v_op.attempt_count >= v_op.max_attempts THEN 'attempts_exhausted' ELSE 'window_passed' END,
      v_error
    );
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'parked',
      'operation_id', v_op.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'attempt', v_op.attempt_count,
      'case_id', v_case_id
    );
  END IF;

  UPDATE public.donation_saga_outbox
     SET status = 'dead_letter',
         last_error_code = COALESCE(v_error, last_error_code),
         lease_expires_at = NULL,
         updated_at = v_now
   WHERE id = v_op.id;

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
    v_op.tenant_id,
    'Payment request dead-lettered',
    pg_catalog.format(
      'Provider request %s (key %s, account %s, livemode %s) was never performed and has no retry left after attempt %s of %s (%s, %s).',
      v_op.id, v_op.idempotency_key, v_op.provider_account_ref, v_op.livemode,
      v_op.attempt_count, v_op.max_attempts,
      CASE WHEN v_op.attempt_count >= v_op.max_attempts THEN 'attempts_exhausted' ELSE 'window_passed' END,
      COALESCE(v_error, 'no_error_code')
    ),
    'open',
    'high',
    'payments',
    'provider_request_dead_letter',
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
    v_op.tenant_id,
    v_task_id,
    'donation_saga_outbox',
    v_op.id::TEXT,
    'provider_request_dead_letter',
    pg_catalog.jsonb_build_object(
      'donation_id', v_op.donation_id,
      'attempt', v_op.attempt_count,
      'reason', CASE WHEN v_op.attempt_count >= v_op.max_attempts THEN 'attempts_exhausted' ELSE 'window_passed' END,
      'error_code', v_error
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'outcome', 'dead_letter',
    'operation_id', v_op.id,
    'tenant_id', tenant_guard.current_tenant_id(),
    'attempt', v_op.attempt_count,
    'task_id', v_task_id
  );
END;
$$;

CREATE FUNCTION public.claim_provider_operation(
  p_operation_id UUID,
  p_lease_seconds INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_tenant UUID;
BEGIN
  SELECT o.tenant_id
    INTO v_tenant
    FROM public.donation_saga_outbox AS o
   WHERE o.id = p_operation_id
     AND o.kind = 'provider_request';

  IF v_tenant IS NULL THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'unknown_anchor',
      'operation_id', p_operation_id
    );
  END IF;

  RETURN tenant_guard.claim_provider_operation(v_tenant, p_operation_id, p_lease_seconds);
END;
$$;

CREATE FUNCTION public.record_provider_operation_result(
  p_operation_id UUID,
  p_attempt INTEGER,
  p_result JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_tenant UUID;
BEGIN
  SELECT o.tenant_id
    INTO v_tenant
    FROM public.donation_saga_outbox AS o
   WHERE o.id = p_operation_id
     AND o.kind = 'provider_request';

  IF v_tenant IS NULL THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'unknown_anchor',
      'operation_id', p_operation_id
    );
  END IF;

  RETURN tenant_guard.record_provider_operation_result(v_tenant, p_operation_id, p_attempt, p_result);
END;
$$;

REVOKE ALL ON FUNCTION
  tenant_guard.money_park_operation(UUID, TEXT, TEXT),
  tenant_guard.claim_provider_operation(UUID, UUID, INTEGER),
  tenant_guard.record_provider_operation_result(UUID, UUID, INTEGER, JSONB),
  public.claim_provider_operation(UUID, INTEGER),
  public.record_provider_operation_result(UUID, INTEGER, JSONB)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION tenant_guard.money_park_operation(UUID, TEXT, TEXT) TO tenant_guard;

GRANT EXECUTE ON FUNCTION
  tenant_guard.claim_provider_operation(UUID, UUID, INTEGER),
  tenant_guard.record_provider_operation_result(UUID, UUID, INTEGER, JSONB),
  public.claim_provider_operation(UUID, INTEGER),
  public.record_provider_operation_result(UUID, INTEGER, JSONB)
  TO service_role;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.claim_provider_operation(UUID, UUID, INTEGER) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.record_provider_operation_result(UUID, UUID, INTEGER, JSONB) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
