-- AL-2681 (WP8a part 1; rulings W8-R5, W8-R7, W8-R11, W8-R12; TP2 §6/§9; TP4 §9/§10):
-- 1. Grant tenant_guard SELECT, INSERT behind worker isolation policies on
--    public.mission_control_tasks and public.mission_control_task_links.
-- 2. Add additive connect-account constraints and lease/attempt fencing on
--    public.stripe_raw_events (preserving legacy RPCs and 'dead_letter' literal).
-- 3. Add additive nullable lease_expires_at, payment_account_binding_id, and
--    'parked' status on public.donation_saga_outbox, plus tenant_guard isolation.
-- 4. Add additive lease_expires_at, max_attempts, 'processing' status, monotonic
--    trigger, and worker-lane lease commands on public.workflow_dispatch_requests.
-- 5. Add worker-lane commands for connected-account events (claim_provider_event,
--    record_provider_event_failure, apply_account_event) with atomic Mission
--    Control task creation on dead-letter and disconnect.

BEGIN;

SET LOCAL lock_timeout = '5s';

GRANT SELECT, INSERT ON TABLE public.mission_control_tasks TO tenant_guard;
GRANT SELECT, INSERT ON TABLE public.mission_control_task_links TO tenant_guard;

DROP POLICY IF EXISTS tenant_guard_isolation ON public.mission_control_tasks;
CREATE POLICY tenant_guard_isolation
  ON public.mission_control_tasks
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

DROP POLICY IF EXISTS tenant_guard_isolation ON public.mission_control_task_links;
CREATE POLICY tenant_guard_isolation
  ON public.mission_control_task_links
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

ALTER TABLE public.stripe_raw_events
  ADD COLUMN endpoint_kind TEXT NOT NULL DEFAULT 'legacy'
    CHECK (endpoint_kind IN ('legacy', 'connect')),
  ADD COLUMN lease_expires_at TIMESTAMPTZ,
  ADD COLUMN max_attempts INTEGER NOT NULL DEFAULT 8 CHECK (max_attempts >= 1),
  ADD CONSTRAINT stripe_raw_events_tenant_requires_account
    CHECK (endpoint_kind <> 'connect' OR tenant_id IS NULL OR stripe_account IS NOT NULL),
  ADD CONSTRAINT stripe_raw_events_account_same_tenant_fk
    FOREIGN KEY (tenant_id, stripe_account, livemode)
    REFERENCES public.payment_provider_accounts(tenant_id, provider_account_id, livemode)
    ON DELETE RESTRICT;

CREATE FUNCTION private.enforce_stripe_raw_events_monotonic_attempts()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.process_attempts < OLD.process_attempts THEN
    RAISE EXCEPTION 'stripe_raw_events.process_attempts cannot decrease (old=%, new=%)',
      OLD.process_attempts, NEW.process_attempts
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.enforce_stripe_raw_events_monotonic_attempts()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER stripe_raw_events_monotonic_attempts
  BEFORE UPDATE OF process_attempts ON public.stripe_raw_events
  FOR EACH ROW
  EXECUTE FUNCTION private.enforce_stripe_raw_events_monotonic_attempts();

GRANT SELECT, UPDATE ON TABLE public.stripe_raw_events TO tenant_guard;

DROP POLICY IF EXISTS tenant_guard_isolation ON public.stripe_raw_events;
CREATE POLICY tenant_guard_isolation
  ON public.stripe_raw_events
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

ALTER TABLE public.donation_saga_outbox
  ADD COLUMN lease_expires_at TIMESTAMPTZ,
  ADD COLUMN payment_account_binding_id UUID,
  ADD CONSTRAINT donation_saga_outbox_binding_same_tenant_fk
    FOREIGN KEY (tenant_id, payment_account_binding_id)
    REFERENCES public.payment_account_bindings(tenant_id, id)
    ON DELETE RESTRICT;

ALTER TABLE public.donation_saga_outbox
  DROP CONSTRAINT donation_saga_outbox_status_check,
  ADD CONSTRAINT donation_saga_outbox_status_check
    CHECK (status IN ('pending', 'processing', 'failed', 'completed', 'dead_letter', 'parked'));

GRANT SELECT, UPDATE ON TABLE public.donation_saga_outbox TO tenant_guard;

DROP POLICY IF EXISTS tenant_guard_isolation ON public.donation_saga_outbox;
CREATE POLICY tenant_guard_isolation
  ON public.donation_saga_outbox
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

ALTER TABLE public.workflow_dispatch_requests
  DROP CONSTRAINT workflow_dispatch_requests_status_check,
  ADD CONSTRAINT workflow_dispatch_requests_status_check
    CHECK (status IN ('pending', 'processing', 'dispatched', 'failed', 'dead_letter')),
  ADD COLUMN lease_expires_at TIMESTAMPTZ,
  ADD COLUMN max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts >= 1);

CREATE FUNCTION private.enforce_workflow_dispatch_monotonic_attempts()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.dispatch_attempts < OLD.dispatch_attempts THEN
    RAISE EXCEPTION 'workflow_dispatch_requests.dispatch_attempts cannot decrease (old=%, new=%)',
      OLD.dispatch_attempts, NEW.dispatch_attempts
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.enforce_workflow_dispatch_monotonic_attempts()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER workflow_dispatch_requests_monotonic_attempts
  BEFORE UPDATE OF dispatch_attempts ON public.workflow_dispatch_requests
  FOR EACH ROW
  EXECUTE FUNCTION private.enforce_workflow_dispatch_monotonic_attempts();

GRANT SELECT, UPDATE ON TABLE public.workflow_dispatch_requests TO tenant_guard;

DROP POLICY IF EXISTS tenant_guard_isolation ON public.workflow_dispatch_requests;
CREATE POLICY tenant_guard_isolation
  ON public.workflow_dispatch_requests
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

CREATE OR REPLACE FUNCTION tenant_guard.claim_provider_event(
  p_tenant_id UUID,
  p_event_id UUID,
  p_lease_seconds INTEGER DEFAULT 300
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event RECORD;
  v_account RECORD;
  v_now TIMESTAMPTZ;
  v_next_attempt INTEGER;
  v_lease_expires TIMESTAMPTZ;
  v_task_id UUID;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  IF p_lease_seconds IS NULL OR p_lease_seconds <= 0 THEN
    RAISE EXCEPTION 'Lease seconds must be positive' USING ERRCODE = '22023';
  END IF;

  SELECT e.*
    INTO v_event
    FROM public.stripe_raw_events AS e
   WHERE e.id = p_event_id
     FOR NO KEY UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant_guard: provider event not found in entered tenant'
      USING ERRCODE = '42501';
  END IF;

  SELECT a.*
    INTO v_account
    FROM public.payment_provider_accounts AS a
   WHERE a.provider_account_id = v_event.stripe_account
     AND a.livemode = v_event.livemode;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant_guard: payment provider account anchor not found in entered tenant'
      USING ERRCODE = '42501';
  END IF;

  v_now := pg_catalog.clock_timestamp();

  IF v_event.processing_status IN ('processed', 'ignored', 'dead_letter') THEN
    RETURN pg_catalog.jsonb_build_object(
      'claimed', false,
      'outcome', v_event.processing_status,
      'event_id', p_event_id,
      'attempt', v_event.process_attempts,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF v_event.processing_status = 'processing'
     AND v_event.lease_expires_at IS NOT NULL
     AND v_event.lease_expires_at > v_now THEN
    RETURN pg_catalog.jsonb_build_object(
      'claimed', false,
      'outcome', 'lease_active',
      'event_id', p_event_id,
      'attempt', v_event.process_attempts,
      'lease_expires_at', v_event.lease_expires_at,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF v_event.processing_status IN ('received', 'failed')
     AND v_event.next_attempt_at > v_now THEN
    RETURN pg_catalog.jsonb_build_object(
      'claimed', false,
      'outcome', 'not_due',
      'event_id', p_event_id,
      'attempt', v_event.process_attempts,
      'next_attempt_at', v_event.next_attempt_at,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF v_event.process_attempts >= v_event.max_attempts THEN
    UPDATE public.stripe_raw_events
       SET processing_status = 'dead_letter',
           dead_letter_at = v_now,
           lease_expires_at = NULL,
           lock_id = NULL,
           locked_at = NULL,
           updated_at = v_now
     WHERE id = p_event_id;

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
      'Stripe provider event dead-lettered',
      'Provider event ' || v_event.stripe_event_id || ' (' || v_event.event_type || ') exhausted its attempt budget.',
      'open',
      'high',
      'payments',
      'provider_event_dead_letter',
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
      'stripe_raw_event',
      p_event_id::TEXT,
      'dead_lettered_event',
      pg_catalog.jsonb_build_object(
        'stripe_event_id', v_event.stripe_event_id,
        'event_type', v_event.event_type,
        'attempts', v_event.process_attempts
      )
    );

    RETURN pg_catalog.jsonb_build_object(
      'claimed', false,
      'outcome', 'dead_letter',
      'event_id', p_event_id,
      'attempt', v_event.process_attempts,
      'task_id', v_task_id,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  v_next_attempt := v_event.process_attempts + 1;
  v_lease_expires := v_now + pg_catalog.make_interval(secs => p_lease_seconds);

  UPDATE public.stripe_raw_events
     SET processing_status = 'processing',
         process_attempts = v_next_attempt,
         lease_expires_at = v_lease_expires,
         locked_at = v_now,
         updated_at = v_now
   WHERE id = p_event_id;

  RETURN pg_catalog.jsonb_build_object(
    'claimed', true,
    'outcome', 'claimed',
    'event_id', p_event_id,
    'attempt', v_next_attempt,
    'lease_expires_at', v_lease_expires,
    'event_type', v_event.event_type,
    'stripe_account', v_event.stripe_account,
    'livemode', v_event.livemode,
    'tenant_id', tenant_guard.current_tenant_id()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_provider_event(
  p_event_id UUID,
  p_lease_seconds INTEGER DEFAULT 300
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
  SELECT a.tenant_id
    INTO v_tenant
    FROM public.stripe_raw_events AS e
    JOIN public.payment_provider_accounts AS a
      ON a.provider_account_id = e.stripe_account
     AND a.livemode = e.livemode
   WHERE e.id = p_event_id
     AND e.tenant_id = a.tenant_id;

  IF v_tenant IS NULL THEN
    RETURN pg_catalog.jsonb_build_object(
      'claimed', false,
      'outcome', 'unknown_anchor',
      'event_id', p_event_id
    );
  END IF;

  RETURN tenant_guard.claim_provider_event(v_tenant, p_event_id, p_lease_seconds);
END;
$$;

CREATE OR REPLACE FUNCTION tenant_guard.record_provider_event_failure(
  p_tenant_id UUID,
  p_event_id UUID,
  p_attempt INTEGER,
  p_error_code TEXT,
  p_error_message TEXT,
  p_retryable BOOLEAN DEFAULT true,
  p_retry_delay_seconds INTEGER DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event RECORD;
  v_account RECORD;
  v_now TIMESTAMPTZ;
  v_task_id UUID;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  SELECT e.*
    INTO v_event
    FROM public.stripe_raw_events AS e
   WHERE e.id = p_event_id
     FOR NO KEY UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant_guard: provider event not found in entered tenant'
      USING ERRCODE = '42501';
  END IF;

  SELECT a.*
    INTO v_account
    FROM public.payment_provider_accounts AS a
   WHERE a.provider_account_id = v_event.stripe_account
     AND a.livemode = v_event.livemode;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant_guard: payment provider account anchor not found in entered tenant'
      USING ERRCODE = '42501';
  END IF;

  IF v_event.processing_status <> 'processing'
     OR v_event.process_attempts IS DISTINCT FROM p_attempt THEN
    RAISE EXCEPTION 'Stale provider event attempt % (current status=%, attempt=%)',
      p_attempt, v_event.processing_status, v_event.process_attempts
      USING ERRCODE = '55000';
  END IF;

  v_now := pg_catalog.clock_timestamp();

  IF NOT COALESCE(p_retryable, true) OR v_event.process_attempts >= v_event.max_attempts THEN
    UPDATE public.stripe_raw_events
       SET processing_status = 'dead_letter',
           dead_letter_at = v_now,
           failed_at = v_now,
           lease_expires_at = NULL,
           lock_id = NULL,
           locked_at = NULL,
           last_error_code = p_error_code,
           last_error_message = p_error_message,
           retryable = false,
           updated_at = v_now
     WHERE id = p_event_id
       AND process_attempts = p_attempt;

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
      'Stripe provider event dead-lettered',
      'Provider event ' || v_event.stripe_event_id || ' (' || v_event.event_type || ') failed permanently: ' || COALESCE(p_error_message, 'unknown error'),
      'open',
      'high',
      'payments',
      'provider_event_dead_letter',
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
      'stripe_raw_event',
      p_event_id::TEXT,
      'dead_lettered_event',
      pg_catalog.jsonb_build_object(
        'stripe_event_id', v_event.stripe_event_id,
        'event_type', v_event.event_type,
        'attempts', v_event.process_attempts,
        'error_code', p_error_code
      )
    );

    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'dead_letter',
      'event_id', p_event_id,
      'attempt', v_event.process_attempts,
      'task_id', v_task_id,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  UPDATE public.stripe_raw_events
     SET processing_status = 'failed',
         failed_at = v_now,
         lease_expires_at = NULL,
         lock_id = NULL,
         locked_at = NULL,
         next_attempt_at = v_now + pg_catalog.make_interval(secs => GREATEST(COALESCE(p_retry_delay_seconds, 60), 0)),
         last_error_code = p_error_code,
         last_error_message = p_error_message,
         retryable = true,
         updated_at = v_now
   WHERE id = p_event_id
     AND process_attempts = p_attempt;

  RETURN pg_catalog.jsonb_build_object(
    'outcome', 'failed',
    'event_id', p_event_id,
    'attempt', v_event.process_attempts,
    'tenant_id', tenant_guard.current_tenant_id()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.record_provider_event_failure(
  p_event_id UUID,
  p_attempt INTEGER,
  p_error_code TEXT,
  p_error_message TEXT,
  p_retryable BOOLEAN DEFAULT true,
  p_retry_delay_seconds INTEGER DEFAULT 60
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
  SELECT a.tenant_id
    INTO v_tenant
    FROM public.stripe_raw_events AS e
    JOIN public.payment_provider_accounts AS a
      ON a.provider_account_id = e.stripe_account
     AND a.livemode = e.livemode
   WHERE e.id = p_event_id
     AND e.tenant_id = a.tenant_id;

  IF v_tenant IS NULL THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'unknown_anchor',
      'event_id', p_event_id
    );
  END IF;

  RETURN tenant_guard.record_provider_event_failure(
    v_tenant,
    p_event_id,
    p_attempt,
    p_error_code,
    p_error_message,
    p_retryable,
    p_retry_delay_seconds
  );
END;
$$;

CREATE OR REPLACE FUNCTION tenant_guard.apply_account_event(
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
  v_account RECORD;
  v_binding RECORD;
  v_now TIMESTAMPTZ;
  v_event_ts TIMESTAMPTZ;
  v_charges_enabled BOOLEAN;
  v_details_submitted BOOLEAN;
  v_disabled_reason TEXT;
  v_target_status TEXT;
  v_parked_count INTEGER;
  v_task_id UUID;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  SELECT e.*
    INTO v_event
    FROM public.stripe_raw_events AS e
   WHERE e.id = p_event_id
     FOR NO KEY UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant_guard: provider event not found in entered tenant'
      USING ERRCODE = '42501';
  END IF;

  SELECT a.*
    INTO v_account
    FROM public.payment_provider_accounts AS a
   WHERE a.provider_account_id = v_event.stripe_account
     AND a.livemode = v_event.livemode
     FOR NO KEY UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant_guard: payment provider account anchor not found in entered tenant'
      USING ERRCODE = '42501';
  END IF;

  IF v_event.processing_status = 'processed' THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'already_processed',
      'event_id', p_event_id,
      'attempt', v_event.process_attempts,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF v_event.processing_status <> 'processing'
     OR v_event.process_attempts IS DISTINCT FROM p_attempt THEN
    RAISE EXCEPTION 'Stale provider event attempt % (current status=%, attempt=%)',
      p_attempt, v_event.processing_status, v_event.process_attempts
      USING ERRCODE = '55000';
  END IF;

  IF v_event.endpoint_kind <> 'connect' THEN
    RAISE EXCEPTION 'tenant_guard: apply_account_event accepts connect events only'
      USING ERRCODE = '42501';
  END IF;

  v_now := pg_catalog.clock_timestamp();
  v_parked_count := 0;
  v_task_id := NULL;

  IF (v_event.raw_payload ? 'created')
     AND (v_event.raw_payload->>'created') ~ '^[0-9]+$' THEN
    v_event_ts := pg_catalog.to_timestamp((v_event.raw_payload->>'created')::DOUBLE PRECISION);
  ELSE
    v_event_ts := v_event.created_at;
  END IF;

  SELECT b.*
    INTO v_binding
    FROM public.payment_account_bindings AS b
   WHERE b.tenant_id = p_tenant_id
     AND b.provider_account_ref = v_account.provider_account_id
     AND b.livemode = v_account.livemode
   ORDER BY b.version DESC
   LIMIT 1
     FOR NO KEY UPDATE;

  IF NOT FOUND THEN
    UPDATE public.stripe_raw_events
       SET processing_status = 'ignored',
           processed_at = v_now,
           lease_expires_at = NULL,
           lock_id = NULL,
           locked_at = NULL,
           processing_outcome = pg_catalog.jsonb_build_object('outcome', 'no_binding'),
           updated_at = v_now
     WHERE id = p_event_id
       AND process_attempts = p_attempt;

    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'no_binding',
      'event_id', p_event_id,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF v_event.event_type = 'account.application.deauthorized' THEN
    v_target_status := 'disconnected';
  ELSIF v_event.event_type = 'account.updated' THEN
    v_charges_enabled := COALESCE((v_event.raw_payload->'data'->'object'->>'charges_enabled')::BOOLEAN, false);
    v_details_submitted := COALESCE((v_event.raw_payload->'data'->'object'->>'details_submitted')::BOOLEAN, false);
    v_disabled_reason := NULLIF(pg_catalog.btrim(COALESCE(v_event.raw_payload->'data'->'object'->'requirements'->>'disabled_reason', '')), '');
    IF v_charges_enabled AND v_details_submitted AND v_disabled_reason IS NULL THEN
      v_target_status := 'active';
    ELSIF v_binding.status IN ('active', 'restricted') OR v_disabled_reason IS NOT NULL THEN
      v_target_status := 'restricted';
    ELSE
      v_target_status := 'pending';
    END IF;
  ELSE
    UPDATE public.stripe_raw_events
       SET processing_status = 'ignored',
           processed_at = v_now,
           lease_expires_at = NULL,
           lock_id = NULL,
           locked_at = NULL,
           processing_outcome = pg_catalog.jsonb_build_object('outcome', 'unsupported_event_type'),
           updated_at = v_now
     WHERE id = p_event_id
       AND process_attempts = p_attempt;

    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'unsupported_event_type',
      'event_id', p_event_id,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF v_binding.status = 'disconnected' THEN
    UPDATE public.stripe_raw_events
       SET processing_status = 'processed',
           processed_at = v_now,
           lease_expires_at = NULL,
           lock_id = NULL,
           locked_at = NULL,
           processing_outcome = pg_catalog.jsonb_build_object(
             'outcome', 'already_disconnected',
             'binding_id', v_binding.id,
             'binding_status', v_binding.status
           ),
           updated_at = v_now
     WHERE id = p_event_id
       AND process_attempts = p_attempt;

    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'already_disconnected',
      'event_id', p_event_id,
      'binding_id', v_binding.id,
      'binding_status', v_binding.status,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF v_binding.last_provider_event_at IS NOT NULL
     AND v_event_ts < v_binding.last_provider_event_at
     AND v_target_status <> 'disconnected' THEN
    UPDATE public.stripe_raw_events
       SET processing_status = 'processed',
           processed_at = v_now,
           lease_expires_at = NULL,
           lock_id = NULL,
           locked_at = NULL,
           processing_outcome = pg_catalog.jsonb_build_object(
             'outcome', 'stale_event_ignored',
             'binding_id', v_binding.id,
             'binding_status', v_binding.status
           ),
           updated_at = v_now
     WHERE id = p_event_id
       AND process_attempts = p_attempt;

    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'stale_event_ignored',
      'event_id', p_event_id,
      'binding_id', v_binding.id,
      'binding_status', v_binding.status,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  UPDATE public.payment_account_bindings
     SET status = v_target_status,
         last_provider_event_at = GREATEST(COALESCE(last_provider_event_at, v_event_ts), v_event_ts),
         activated_at = CASE WHEN v_target_status = 'active' AND activated_at IS NULL THEN v_now ELSE activated_at END,
         restricted_at = CASE WHEN v_target_status = 'restricted' THEN v_now ELSE restricted_at END,
         disconnected_at = CASE WHEN v_target_status = 'disconnected' THEN v_now ELSE disconnected_at END,
         updated_at = v_now
   WHERE id = v_binding.id;

  UPDATE public.payment_provider_accounts
     SET status = v_target_status,
         updated_at = v_now
   WHERE id = v_account.id;

  IF v_target_status = 'disconnected' THEN
    UPDATE public.donation_saga_outbox
       SET status = 'parked',
           lease_expires_at = NULL,
           processor_lock_id = NULL,
           processor_locked_at = NULL,
           updated_at = v_now
     WHERE tenant_id = p_tenant_id
       AND payment_account_binding_id = v_binding.id
       AND status IN ('pending', 'failed');

    GET DIAGNOSTICS v_parked_count = ROW_COUNT;

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
      'Payment account disconnected',
      'Connected payment account ' || v_account.provider_account_id || ' (binding version ' || v_binding.version::TEXT || ') was disconnected by the provider. Queued operations were parked.',
      'open',
      'critical',
      'payments',
      'payment_account_disconnected',
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
      'disconnected_binding',
      pg_catalog.jsonb_build_object(
        'provider_account_id', v_account.provider_account_id,
        'version', v_binding.version,
        'parked_outbox_count', v_parked_count,
        'stripe_event_id', v_event.stripe_event_id
      )
    );
  END IF;

  IF v_binding.status IS DISTINCT FROM v_target_status THEN
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
        'parked_outbox_count', v_parked_count,
        'task_id', v_task_id
      )
    );
  END IF;

  UPDATE public.stripe_raw_events
     SET processing_status = 'processed',
         processed_at = v_now,
         lease_expires_at = NULL,
         lock_id = NULL,
         locked_at = NULL,
         processing_outcome = pg_catalog.jsonb_build_object(
           'outcome', 'applied',
           'binding_id', v_binding.id,
           'previous_status', v_binding.status,
           'status', v_target_status,
           'parked_outbox_count', v_parked_count,
           'task_id', v_task_id
         ),
         updated_at = v_now
   WHERE id = p_event_id
     AND process_attempts = p_attempt;

  RETURN pg_catalog.jsonb_build_object(
    'outcome', 'applied',
    'event_id', p_event_id,
    'binding_id', v_binding.id,
    'previous_status', v_binding.status,
    'status', v_target_status,
    'parked_outbox_count', v_parked_count,
    'task_id', v_task_id,
    'tenant_id', tenant_guard.current_tenant_id()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_account_event(
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
  v_tenant UUID;
BEGIN
  SELECT a.tenant_id
    INTO v_tenant
    FROM public.stripe_raw_events AS e
    JOIN public.payment_provider_accounts AS a
      ON a.provider_account_id = e.stripe_account
     AND a.livemode = e.livemode
   WHERE e.id = p_event_id
     AND e.tenant_id = a.tenant_id;

  IF v_tenant IS NULL THEN
    RETURN pg_catalog.jsonb_build_object(
      'event_id', p_event_id,
      'outcome', 'unknown_anchor'
    );
  END IF;

  RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, p_attempt);
END;
$$;

CREATE OR REPLACE FUNCTION tenant_guard.claim_workflow_dispatch_request(
  p_tenant_id UUID,
  p_request_id UUID,
  p_lease_seconds INTEGER DEFAULT 300
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_req RECORD;
  v_now TIMESTAMPTZ;
  v_next_attempt INTEGER;
  v_lease_expires TIMESTAMPTZ;
  v_task_id UUID;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  IF p_lease_seconds IS NULL OR p_lease_seconds <= 0 THEN
    RAISE EXCEPTION 'Lease seconds must be positive' USING ERRCODE = '22023';
  END IF;

  SELECT r.*
    INTO v_req
    FROM public.workflow_dispatch_requests AS r
   WHERE r.id = p_request_id
     FOR NO KEY UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant_guard: workflow dispatch request not found in entered tenant'
      USING ERRCODE = '42501';
  END IF;

  v_now := pg_catalog.clock_timestamp();

  IF v_req.status IN ('dispatched', 'dead_letter') THEN
    RETURN pg_catalog.jsonb_build_object(
      'claimed', false,
      'outcome', v_req.status,
      'request_id', p_request_id,
      'attempt', v_req.dispatch_attempts,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF v_req.status = 'processing'
     AND v_req.lease_expires_at IS NOT NULL
     AND v_req.lease_expires_at > v_now THEN
    RETURN pg_catalog.jsonb_build_object(
      'claimed', false,
      'outcome', 'lease_active',
      'request_id', p_request_id,
      'attempt', v_req.dispatch_attempts,
      'lease_expires_at', v_req.lease_expires_at,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF v_req.status IN ('pending', 'failed')
     AND v_req.next_attempt_at > v_now THEN
    RETURN pg_catalog.jsonb_build_object(
      'claimed', false,
      'outcome', 'not_due',
      'request_id', p_request_id,
      'attempt', v_req.dispatch_attempts,
      'next_attempt_at', v_req.next_attempt_at,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF v_req.dispatch_attempts >= v_req.max_attempts THEN
    UPDATE public.workflow_dispatch_requests
       SET status = 'dead_letter',
           dead_letter_at = v_now,
           lease_expires_at = NULL,
           updated_at = v_now
     WHERE id = p_request_id;

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
      'Workflow dispatch dead-lettered',
      'Workflow dispatch ' || v_req.workflow_name || ' (' || v_req.subject_type || ':' || v_req.subject_id || ') exhausted its attempt budget.',
      'open',
      'high',
      'workflows',
      'workflow_dispatch_dead_letter',
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
      'workflow_dispatch_request',
      p_request_id::TEXT,
      'dead_lettered_dispatch',
      pg_catalog.jsonb_build_object(
        'workflow_name', v_req.workflow_name,
        'subject_type', v_req.subject_type,
        'subject_id', v_req.subject_id,
        'attempts', v_req.dispatch_attempts
      )
    );

    RETURN pg_catalog.jsonb_build_object(
      'claimed', false,
      'outcome', 'dead_letter',
      'request_id', p_request_id,
      'attempt', v_req.dispatch_attempts,
      'task_id', v_task_id,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  v_next_attempt := v_req.dispatch_attempts + 1;
  v_lease_expires := v_now + pg_catalog.make_interval(secs => p_lease_seconds);

  UPDATE public.workflow_dispatch_requests
     SET status = 'processing',
         dispatch_attempts = v_next_attempt,
         lease_expires_at = v_lease_expires,
         updated_at = v_now
   WHERE id = p_request_id;

  RETURN pg_catalog.jsonb_build_object(
    'claimed', true,
    'outcome', 'claimed',
    'request_id', p_request_id,
    'attempt', v_next_attempt,
    'lease_expires_at', v_lease_expires,
    'tenant_id', tenant_guard.current_tenant_id()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_workflow_dispatch_request(
  p_request_id UUID,
  p_lease_seconds INTEGER DEFAULT 300
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
  SELECT r.tenant_id
    INTO v_tenant
    FROM public.workflow_dispatch_requests AS r
   WHERE r.id = p_request_id;

  IF v_tenant IS NULL THEN
    RETURN pg_catalog.jsonb_build_object(
      'claimed', false,
      'outcome', 'unknown_anchor',
      'request_id', p_request_id
    );
  END IF;

  RETURN tenant_guard.claim_workflow_dispatch_request(v_tenant, p_request_id, p_lease_seconds);
END;
$$;

CREATE OR REPLACE FUNCTION tenant_guard.complete_workflow_dispatch_request(
  p_tenant_id UUID,
  p_request_id UUID,
  p_attempt INTEGER,
  p_event_ids TEXT[] DEFAULT '{}'::TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_req RECORD;
  v_now TIMESTAMPTZ;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  SELECT r.*
    INTO v_req
    FROM public.workflow_dispatch_requests AS r
   WHERE r.id = p_request_id
     FOR NO KEY UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant_guard: workflow dispatch request not found in entered tenant'
      USING ERRCODE = '42501';
  END IF;

  IF v_req.status <> 'processing'
     OR v_req.dispatch_attempts IS DISTINCT FROM p_attempt THEN
    RAISE EXCEPTION 'Stale workflow dispatch attempt % (current status=%, attempt=%)',
      p_attempt, v_req.status, v_req.dispatch_attempts
      USING ERRCODE = '55000';
  END IF;

  v_now := pg_catalog.clock_timestamp();

  UPDATE public.workflow_dispatch_requests
     SET status = 'dispatched',
         dispatched_at = v_now,
         lease_expires_at = NULL,
         event_ids = COALESCE(p_event_ids, '{}'::TEXT[]),
         last_error_code = NULL,
         last_error_message = NULL,
         updated_at = v_now
   WHERE id = p_request_id
     AND dispatch_attempts = p_attempt;

  RETURN pg_catalog.jsonb_build_object(
    'outcome', 'dispatched',
    'request_id', p_request_id,
    'attempt', p_attempt,
    'tenant_id', tenant_guard.current_tenant_id()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_workflow_dispatch_request(
  p_request_id UUID,
  p_attempt INTEGER,
  p_event_ids TEXT[] DEFAULT '{}'::TEXT[]
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
  SELECT r.tenant_id
    INTO v_tenant
    FROM public.workflow_dispatch_requests AS r
   WHERE r.id = p_request_id;

  IF v_tenant IS NULL THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'unknown_anchor',
      'request_id', p_request_id
    );
  END IF;

  RETURN tenant_guard.complete_workflow_dispatch_request(v_tenant, p_request_id, p_attempt, p_event_ids);
END;
$$;

CREATE OR REPLACE FUNCTION tenant_guard.record_workflow_dispatch_failure(
  p_tenant_id UUID,
  p_request_id UUID,
  p_attempt INTEGER,
  p_error_code TEXT,
  p_error_message TEXT,
  p_retryable BOOLEAN DEFAULT true,
  p_retry_delay_seconds INTEGER DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_req RECORD;
  v_now TIMESTAMPTZ;
  v_task_id UUID;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  SELECT r.*
    INTO v_req
    FROM public.workflow_dispatch_requests AS r
   WHERE r.id = p_request_id
     FOR NO KEY UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant_guard: workflow dispatch request not found in entered tenant'
      USING ERRCODE = '42501';
  END IF;

  IF v_req.status <> 'processing'
     OR v_req.dispatch_attempts IS DISTINCT FROM p_attempt THEN
    RAISE EXCEPTION 'Stale workflow dispatch attempt % (current status=%, attempt=%)',
      p_attempt, v_req.status, v_req.dispatch_attempts
      USING ERRCODE = '55000';
  END IF;

  v_now := pg_catalog.clock_timestamp();

  IF NOT COALESCE(p_retryable, true) OR v_req.dispatch_attempts >= v_req.max_attempts THEN
    UPDATE public.workflow_dispatch_requests
       SET status = 'dead_letter',
           dead_letter_at = v_now,
           lease_expires_at = NULL,
           last_error_code = p_error_code,
           last_error_message = p_error_message,
           updated_at = v_now
     WHERE id = p_request_id
       AND dispatch_attempts = p_attempt;

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
      'Workflow dispatch dead-lettered',
      'Workflow dispatch ' || v_req.workflow_name || ' (' || v_req.subject_type || ':' || v_req.subject_id || ') failed permanently: ' || COALESCE(p_error_message, 'unknown error'),
      'open',
      'high',
      'workflows',
      'workflow_dispatch_dead_letter',
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
      'workflow_dispatch_request',
      p_request_id::TEXT,
      'dead_lettered_dispatch',
      pg_catalog.jsonb_build_object(
        'workflow_name', v_req.workflow_name,
        'subject_type', v_req.subject_type,
        'subject_id', v_req.subject_id,
        'attempts', v_req.dispatch_attempts,
        'error_code', p_error_code
      )
    );

    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'dead_letter',
      'request_id', p_request_id,
      'attempt', v_req.dispatch_attempts,
      'task_id', v_task_id,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  UPDATE public.workflow_dispatch_requests
     SET status = 'failed',
         lease_expires_at = NULL,
         next_attempt_at = v_now + pg_catalog.make_interval(secs => GREATEST(COALESCE(p_retry_delay_seconds, 60), 0)),
         last_error_code = p_error_code,
         last_error_message = p_error_message,
         updated_at = v_now
   WHERE id = p_request_id
     AND dispatch_attempts = p_attempt;

  RETURN pg_catalog.jsonb_build_object(
    'outcome', 'failed',
    'request_id', p_request_id,
    'attempt', v_req.dispatch_attempts,
    'tenant_id', tenant_guard.current_tenant_id()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.record_workflow_dispatch_failure(
  p_request_id UUID,
  p_attempt INTEGER,
  p_error_code TEXT,
  p_error_message TEXT,
  p_retryable BOOLEAN DEFAULT true,
  p_retry_delay_seconds INTEGER DEFAULT 60
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
  SELECT r.tenant_id
    INTO v_tenant
    FROM public.workflow_dispatch_requests AS r
   WHERE r.id = p_request_id;

  IF v_tenant IS NULL THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'unknown_anchor',
      'request_id', p_request_id
    );
  END IF;

  RETURN tenant_guard.record_workflow_dispatch_failure(
    v_tenant,
    p_request_id,
    p_attempt,
    p_error_code,
    p_error_message,
    p_retryable,
    p_retry_delay_seconds
  );
END;
$$;

REVOKE ALL ON FUNCTION
  tenant_guard.claim_provider_event(UUID, UUID, INTEGER),
  tenant_guard.record_provider_event_failure(UUID, UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER),
  tenant_guard.apply_account_event(UUID, UUID, INTEGER),
  tenant_guard.claim_workflow_dispatch_request(UUID, UUID, INTEGER),
  tenant_guard.complete_workflow_dispatch_request(UUID, UUID, INTEGER, TEXT[]),
  tenant_guard.record_workflow_dispatch_failure(UUID, UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER),
  public.claim_provider_event(UUID, INTEGER),
  public.record_provider_event_failure(UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER),
  public.apply_account_event(UUID, INTEGER),
  public.claim_workflow_dispatch_request(UUID, INTEGER),
  public.complete_workflow_dispatch_request(UUID, INTEGER, TEXT[]),
  public.record_workflow_dispatch_failure(UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
  tenant_guard.claim_provider_event(UUID, UUID, INTEGER),
  tenant_guard.record_provider_event_failure(UUID, UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER),
  tenant_guard.apply_account_event(UUID, UUID, INTEGER),
  tenant_guard.claim_workflow_dispatch_request(UUID, UUID, INTEGER),
  tenant_guard.complete_workflow_dispatch_request(UUID, UUID, INTEGER, TEXT[]),
  tenant_guard.record_workflow_dispatch_failure(UUID, UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER),
  public.claim_provider_event(UUID, INTEGER),
  public.record_provider_event_failure(UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER),
  public.apply_account_event(UUID, INTEGER),
  public.claim_workflow_dispatch_request(UUID, INTEGER),
  public.complete_workflow_dispatch_request(UUID, INTEGER, TEXT[]),
  public.record_workflow_dispatch_failure(UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER)
  TO service_role;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.claim_provider_event(UUID, UUID, INTEGER) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.record_provider_event_failure(UUID, UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.apply_account_event(UUID, UUID, INTEGER) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.claim_workflow_dispatch_request(UUID, UUID, INTEGER) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.complete_workflow_dispatch_request(UUID, UUID, INTEGER, TEXT[]) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.record_workflow_dispatch_failure(UUID, UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

COMMIT;
