-- AL-2681 (WP8a part 1; rulings W8-R5, W8-R7, W8-R11, W8-R30, W8-R31, W8-R33,
-- W8-R34; TP2 sections 6 and 9; TP4 sections 9 and 10):
-- 1. tenant_guard SELECT, INSERT behind worker isolation policies on
--    public.mission_control_tasks and public.mission_control_task_links.
-- 2. public.stripe_connect_events: the connected-accounts lane's own event
--    store, de-duplication, statuses, leases and attempt counter. The live
--    build's public.stripe_raw_events and public.donation_saga_outbox are not
--    altered by this part: the deployed webhook, worker, scanner and operator
--    replay never read this table, and this lane never reads theirs.
-- 3. Worker commands on that lane: claim_provider_event (event lease plus a
--    per-account sync lease, so claim, the fetch of the account from Stripe
--    and the apply run one at a time per account), apply_account_event (fence
--    before the winner's idempotent replay), record_provider_event_failure,
--    and confirm_payment_account_onboarding, the only writer of the mapping in
--    public.payment_provider_accounts.
-- 4. public.workflow_dispatch_requests: lease_expires_at, max_attempts and a
--    'processing' status that only the new lease commands write and the
--    deployed recovery never selects; no trigger (a deployed ledger write may
--    carry an older attempt count and must not be refused).

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

CREATE TABLE public.stripe_connect_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE RESTRICT,
  stripe_event_id TEXT NOT NULL
    CHECK (pg_catalog.length(pg_catalog.btrim(stripe_event_id)) > 0),
  event_type TEXT NOT NULL
    CHECK (pg_catalog.length(pg_catalog.btrim(event_type)) > 0),
  livemode BOOLEAN NOT NULL,
  provider_account_id TEXT
    CHECK (provider_account_id IS NULL OR provider_account_id ~ '^acct_[A-Za-z0-9]+$'),
  event_created_at TIMESTAMPTZ NOT NULL,
  payload_sha256 TEXT NOT NULL CHECK (payload_sha256 ~ '^[0-9a-f]{64}$'),
  raw_payload JSONB NOT NULL,
  account_snapshot JSONB,
  processing_status TEXT NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received', 'processing', 'failed', 'processed', 'ignored', 'dead_letter')),
  process_attempts INTEGER NOT NULL DEFAULT 0 CHECK (process_attempts >= 0),
  max_attempts INTEGER NOT NULL DEFAULT 8 CHECK (max_attempts >= 1),
  lease_expires_at TIMESTAMPTZ,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  dead_letter_at TIMESTAMPTZ,
  last_error_code TEXT,
  last_error_message TEXT,
  processing_outcome JSONB NOT NULL DEFAULT '{}'::JSONB,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT stripe_connect_events_stripe_event_id_key UNIQUE (stripe_event_id),
  CONSTRAINT stripe_connect_events_tenant_id_id_key UNIQUE (tenant_id, id),
  CONSTRAINT stripe_connect_events_tenant_requires_account
    CHECK (tenant_id IS NULL OR provider_account_id IS NOT NULL),
  CONSTRAINT stripe_connect_events_tenantless_not_worked
    CHECK (tenant_id IS NOT NULL OR processing_status = 'ignored'),
  CONSTRAINT stripe_connect_events_lease_check
    CHECK ((processing_status = 'processing') = (lease_expires_at IS NOT NULL)),
  CONSTRAINT stripe_connect_events_dead_letter_check
    CHECK ((processing_status = 'dead_letter') = (dead_letter_at IS NOT NULL)),
  CONSTRAINT stripe_connect_events_account_same_tenant_fk
    FOREIGN KEY (tenant_id, provider_account_id, livemode)
    REFERENCES public.payment_provider_accounts(tenant_id, provider_account_id, livemode)
    ON DELETE RESTRICT
);

CREATE INDEX stripe_connect_events_account_idx
  ON public.stripe_connect_events (tenant_id, provider_account_id, livemode);

CREATE FUNCTION private.enforce_stripe_connect_events_monotonic_attempts()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.process_attempts < OLD.process_attempts THEN
    RAISE EXCEPTION 'stripe_connect_events.process_attempts cannot decrease (old=%, new=%)',
      OLD.process_attempts, NEW.process_attempts
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.enforce_stripe_connect_events_monotonic_attempts()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER stripe_connect_events_monotonic_attempts
  BEFORE UPDATE OF process_attempts ON public.stripe_connect_events
  FOR EACH ROW
  EXECUTE FUNCTION private.enforce_stripe_connect_events_monotonic_attempts();

ALTER TABLE public.stripe_connect_events
  ENABLE ROW LEVEL SECURITY,
  FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.stripe_connect_events
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT ON TABLE public.stripe_connect_events TO service_role;
GRANT SELECT ON TABLE public.stripe_connect_events TO tenant_guard;
GRANT UPDATE (
  account_snapshot,
  processing_status,
  process_attempts,
  lease_expires_at,
  next_attempt_at,
  processed_at,
  failed_at,
  dead_letter_at,
  last_error_code,
  last_error_message,
  processing_outcome,
  updated_at
) ON TABLE public.stripe_connect_events TO tenant_guard;

CREATE POLICY tenant_guard_isolation
  ON public.stripe_connect_events
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
  v_event_found BOOLEAN;
  v_account RECORD;
  v_account_found BOOLEAN;
  v_now TIMESTAMPTZ;
  v_next_attempt INTEGER;
  v_lease_expires TIMESTAMPTZ;
  v_task_id UUID;
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

  IF p_lease_seconds IS NULL OR p_lease_seconds <= 0 OR p_lease_seconds > 900 THEN
    RAISE EXCEPTION 'Lease seconds must be between 1 and 900' USING ERRCODE = '22023';
  END IF;

  v_now := pg_catalog.clock_timestamp();

  IF v_event.processing_status IN ('processed', 'ignored', 'dead_letter') THEN
    RETURN pg_catalog.jsonb_build_object(
      'claimed', false,
      'terminal', true,
      'outcome', v_event.processing_status,
      'event_id', p_event_id,
      'attempt', v_event.process_attempts,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF v_event.processing_status = 'processing'
     AND v_event.lease_expires_at > v_now THEN
    RETURN pg_catalog.jsonb_build_object(
      'claimed', false,
      'terminal', false,
      'outcome', 'lease_active',
      'event_id', p_event_id,
      'attempt', v_event.process_attempts,
      'lease_expires_at', v_event.lease_expires_at,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF v_event.processing_status = 'failed'
     AND v_event.next_attempt_at > v_now THEN
    RETURN pg_catalog.jsonb_build_object(
      'claimed', false,
      'terminal', false,
      'outcome', 'not_due',
      'event_id', p_event_id,
      'attempt', v_event.process_attempts,
      'next_attempt_at', v_event.next_attempt_at,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF v_account.sync_lease_event_id IS NOT NULL
     AND v_account.sync_lease_event_id <> p_event_id
     AND v_account.sync_lease_expires_at > v_now THEN
    RETURN pg_catalog.jsonb_build_object(
      'claimed', false,
      'terminal', false,
      'outcome', 'account_busy',
      'event_id', p_event_id,
      'attempt', v_event.process_attempts,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF v_event.process_attempts >= v_event.max_attempts THEN
    UPDATE public.stripe_connect_events
       SET processing_status = 'dead_letter',
           dead_letter_at = v_now,
           lease_expires_at = NULL,
           processing_outcome = pg_catalog.jsonb_build_object(
             'outcome', 'dead_letter',
             'attempt', v_event.process_attempts,
             'reason', 'attempts_exhausted'
           ),
           updated_at = v_now
     WHERE id = p_event_id;

    IF v_account.sync_lease_event_id = p_event_id THEN
      UPDATE public.payment_provider_accounts
         SET sync_lease_event_id = NULL,
             sync_lease_expires_at = NULL,
             updated_at = v_now
       WHERE id = v_account.id;
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
      p_tenant_id,
      'Stripe connected-account event dead-lettered',
      'Connected-account event ' || v_event.stripe_event_id || ' (' || v_event.event_type || ') exhausted its attempt budget.',
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
      'stripe_connect_event',
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
      'terminal', true,
      'outcome', 'dead_letter',
      'event_id', p_event_id,
      'attempt', v_event.process_attempts,
      'task_id', v_task_id,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  v_next_attempt := v_event.process_attempts + 1;
  v_lease_expires := v_now + pg_catalog.make_interval(secs => p_lease_seconds);

  UPDATE public.stripe_connect_events
     SET processing_status = 'processing',
         process_attempts = v_next_attempt,
         lease_expires_at = v_lease_expires,
         updated_at = v_now
   WHERE id = p_event_id;

  UPDATE public.payment_provider_accounts
     SET sync_lease_event_id = p_event_id,
         sync_lease_expires_at = v_lease_expires,
         updated_at = v_now
   WHERE id = v_account.id;

  RETURN pg_catalog.jsonb_build_object(
    'claimed', true,
    'terminal', false,
    'outcome', 'claimed',
    'event_id', p_event_id,
    'attempt', v_next_attempt,
    'lease_expires_at', v_lease_expires,
    'event_type', v_event.event_type,
    'provider_account_id', v_event.provider_account_id,
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
  SELECT e.tenant_id
    INTO v_tenant
    FROM public.stripe_connect_events AS e
   WHERE e.id = p_event_id;

  IF v_tenant IS NULL THEN
    RETURN pg_catalog.jsonb_build_object(
      'claimed', false,
      'terminal', true,
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
  v_event_found BOOLEAN;
  v_account RECORD;
  v_account_found BOOLEAN;
  v_now TIMESTAMPTZ;
  v_task_id UUID;
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

  IF v_event.process_attempts IS DISTINCT FROM p_attempt
     OR v_event.processing_status <> 'processing'
     OR v_event.lease_expires_at <= v_now
     OR v_account.sync_lease_event_id IS DISTINCT FROM p_event_id THEN
    RAISE EXCEPTION 'Stale provider event attempt % (current status=%, attempt=%)',
      p_attempt, v_event.processing_status, v_event.process_attempts
      USING ERRCODE = '55000';
  END IF;

  UPDATE public.payment_provider_accounts
     SET sync_lease_event_id = NULL,
         sync_lease_expires_at = NULL,
         updated_at = v_now
   WHERE id = v_account.id;

  IF NOT COALESCE(p_retryable, true) OR v_event.process_attempts >= v_event.max_attempts THEN
    UPDATE public.stripe_connect_events
       SET processing_status = 'dead_letter',
           dead_letter_at = v_now,
           failed_at = v_now,
           lease_expires_at = NULL,
           last_error_code = p_error_code,
           last_error_message = p_error_message,
           processing_outcome = pg_catalog.jsonb_build_object(
             'outcome', 'dead_letter',
             'attempt', p_attempt,
             'reason', CASE WHEN COALESCE(p_retryable, true) THEN 'attempts_exhausted' ELSE 'not_retryable' END
           ),
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
      'Stripe connected-account event dead-lettered',
      'Connected-account event ' || v_event.stripe_event_id || ' (' || v_event.event_type || ') failed permanently: ' || COALESCE(p_error_message, 'unknown error'),
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
      'stripe_connect_event',
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
      'attempt', p_attempt,
      'task_id', v_task_id,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  UPDATE public.stripe_connect_events
     SET processing_status = 'failed',
         failed_at = v_now,
         lease_expires_at = NULL,
         next_attempt_at = v_now + pg_catalog.make_interval(secs => GREATEST(COALESCE(p_retry_delay_seconds, 60), 0)),
         last_error_code = p_error_code,
         last_error_message = p_error_message,
         updated_at = v_now
   WHERE id = p_event_id;

  RETURN pg_catalog.jsonb_build_object(
    'outcome', 'failed',
    'event_id', p_event_id,
    'attempt', p_attempt,
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
  SELECT e.tenant_id
    INTO v_tenant
    FROM public.stripe_connect_events AS e
   WHERE e.id = p_event_id;

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
        'task_id', v_task_id
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

CREATE OR REPLACE FUNCTION public.apply_account_event(
  p_event_id UUID,
  p_attempt INTEGER,
  p_snapshot JSONB
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
  SELECT e.tenant_id
    INTO v_tenant
    FROM public.stripe_connect_events AS e
   WHERE e.id = p_event_id;

  IF v_tenant IS NULL THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'unknown_anchor',
      'event_id', p_event_id
    );
  END IF;

  RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, p_attempt, p_snapshot);
END;
$$;

CREATE OR REPLACE FUNCTION tenant_guard.confirm_payment_account_onboarding(
  p_tenant_id UUID,
  p_intent_id UUID,
  p_stripe_event_id TEXT,
  p_livemode BOOLEAN,
  p_snapshot JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_intent RECORD;
  v_intent_found BOOLEAN;
  v_account_id TEXT;
  v_status TEXT;
  v_now TIMESTAMPTZ;
  v_binding_id UUID;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  SELECT i.*
    INTO v_intent
    FROM public.payment_onboarding_intents AS i
   WHERE i.id = p_intent_id
     FOR UPDATE;
  v_intent_found := FOUND;

  IF NOT v_intent_found THEN
    RAISE EXCEPTION 'tenant_guard: onboarding intent not found in entered tenant'
      USING ERRCODE = '42501';
  END IF;

  v_account_id := p_snapshot ->> 'id';

  IF p_snapshot IS NULL
     OR pg_catalog.jsonb_typeof(p_snapshot) <> 'object'
     OR v_account_id IS NULL
     OR v_account_id !~ '^acct_[A-Za-z0-9]+$'
     OR p_livemode IS NULL
     OR (p_snapshot ->> 'livemode') IS DISTINCT FROM p_livemode::TEXT
     OR (p_snapshot -> 'metadata' ->> 'asym_onboarding_intent') IS DISTINCT FROM p_intent_id::TEXT
     OR p_stripe_event_id IS NULL
     OR pg_catalog.btrim(p_stripe_event_id) = '' THEN
    RAISE EXCEPTION 'The account snapshot does not belong to this onboarding intent' USING ERRCODE = '22023';
  END IF;

  IF v_intent.livemode IS DISTINCT FROM p_livemode THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'mode_mismatch', 'intent_id', p_intent_id);
  END IF;

  IF v_intent.status = 'confirmed' THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', CASE WHEN v_intent.provider_account_id = v_account_id
                      THEN 'already_confirmed'
                      ELSE 'intent_confirmed_for_another_account' END,
      'intent_id', p_intent_id,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF COALESCE(p_snapshot ->> 'closed', 'false') = 'true' THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'account_closed', 'intent_id', p_intent_id);
  END IF;

  v_status := CASE WHEN (p_snapshot ->> 'card_payments_status') = 'active' THEN 'active' ELSE 'pending' END;
  v_now := pg_catalog.clock_timestamp();

  BEGIN
    INSERT INTO public.payment_provider_accounts (
      tenant_id,
      legal_entity_id,
      provider_account_id,
      livemode,
      onboarding_intent_id,
      confirmed_at,
      state_synced_at,
      created_at,
      updated_at
    )
    VALUES (
      v_intent.tenant_id,
      v_intent.legal_entity_id,
      v_account_id,
      p_livemode,
      v_intent.id,
      v_now,
      v_now,
      v_now,
      v_now
    );
  EXCEPTION WHEN unique_violation THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'account_already_mapped', 'intent_id', p_intent_id);
  END;

  INSERT INTO public.payment_account_bindings (
    tenant_id,
    legal_entity_id,
    version,
    status,
    provider_account_ref,
    livemode,
    onboarding_intent_id,
    created_by,
    activated_at,
    created_at,
    updated_at
  )
  VALUES (
    v_intent.tenant_id,
    v_intent.legal_entity_id,
    v_intent.version,
    v_status,
    v_account_id,
    p_livemode,
    v_intent.id,
    v_intent.created_by,
    CASE WHEN v_status = 'active' THEN v_now END,
    v_now,
    v_now
  )
  RETURNING id INTO v_binding_id;

  UPDATE public.payment_onboarding_intents
     SET status = 'confirmed',
         provider_account_id = v_account_id,
         confirmed_at = v_now,
         confirmed_by_event = p_stripe_event_id,
         updated_at = v_now
   WHERE id = v_intent.id;

  INSERT INTO public.audit_logs (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    details
  )
  VALUES (
    v_intent.tenant_id,
    NULL,
    'payment_account_onboarding_confirmed',
    'payment_account_binding',
    v_binding_id::TEXT,
    pg_catalog.jsonb_build_object(
      'intent_id', v_intent.id,
      'provider_account_id', v_account_id,
      'livemode', p_livemode,
      'version', v_intent.version,
      'status', v_status,
      'stripe_event_id', p_stripe_event_id
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'outcome', 'confirmed',
    'intent_id', v_intent.id,
    'binding_id', v_binding_id,
    'status', v_status,
    'version', v_intent.version,
    'tenant_id', tenant_guard.current_tenant_id()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_payment_account_onboarding(
  p_stripe_event_id TEXT,
  p_livemode BOOLEAN,
  p_snapshot JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_reference TEXT;
  v_tenant UUID;
BEGIN
  v_reference := p_snapshot -> 'metadata' ->> 'asym_onboarding_intent';

  IF v_reference IS NULL
     OR v_reference !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'no_intent_reference');
  END IF;

  SELECT i.tenant_id
    INTO v_tenant
    FROM public.payment_onboarding_intents AS i
   WHERE i.id = v_reference::UUID;

  IF v_tenant IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'unknown_intent');
  END IF;

  RETURN tenant_guard.confirm_payment_account_onboarding(
    v_tenant,
    v_reference::UUID,
    p_stripe_event_id,
    p_livemode,
    p_snapshot
  );
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

  v_now := pg_catalog.clock_timestamp();

  IF v_req.dispatch_attempts IS DISTINCT FROM p_attempt
     OR v_req.status <> 'processing'
     OR v_req.lease_expires_at IS NULL
     OR v_req.lease_expires_at <= v_now THEN
    RAISE EXCEPTION 'Stale workflow dispatch attempt % (current status=%, attempt=%)',
      p_attempt, v_req.status, v_req.dispatch_attempts
      USING ERRCODE = '55000';
  END IF;

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

  v_now := pg_catalog.clock_timestamp();

  IF v_req.dispatch_attempts IS DISTINCT FROM p_attempt
     OR v_req.status <> 'processing'
     OR v_req.lease_expires_at IS NULL
     OR v_req.lease_expires_at <= v_now THEN
    RAISE EXCEPTION 'Stale workflow dispatch attempt % (current status=%, attempt=%)',
      p_attempt, v_req.status, v_req.dispatch_attempts
      USING ERRCODE = '55000';
  END IF;

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
  tenant_guard.apply_account_event(UUID, UUID, INTEGER, JSONB),
  tenant_guard.confirm_payment_account_onboarding(UUID, UUID, TEXT, BOOLEAN, JSONB),
  tenant_guard.claim_workflow_dispatch_request(UUID, UUID, INTEGER),
  tenant_guard.complete_workflow_dispatch_request(UUID, UUID, INTEGER, TEXT[]),
  tenant_guard.record_workflow_dispatch_failure(UUID, UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER),
  public.claim_provider_event(UUID, INTEGER),
  public.record_provider_event_failure(UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER),
  public.apply_account_event(UUID, INTEGER, JSONB),
  public.confirm_payment_account_onboarding(TEXT, BOOLEAN, JSONB),
  public.claim_workflow_dispatch_request(UUID, INTEGER),
  public.complete_workflow_dispatch_request(UUID, INTEGER, TEXT[]),
  public.record_workflow_dispatch_failure(UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
  tenant_guard.claim_provider_event(UUID, UUID, INTEGER),
  tenant_guard.record_provider_event_failure(UUID, UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER),
  tenant_guard.apply_account_event(UUID, UUID, INTEGER, JSONB),
  tenant_guard.confirm_payment_account_onboarding(UUID, UUID, TEXT, BOOLEAN, JSONB),
  tenant_guard.claim_workflow_dispatch_request(UUID, UUID, INTEGER),
  tenant_guard.complete_workflow_dispatch_request(UUID, UUID, INTEGER, TEXT[]),
  tenant_guard.record_workflow_dispatch_failure(UUID, UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER),
  public.claim_provider_event(UUID, INTEGER),
  public.record_provider_event_failure(UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER),
  public.apply_account_event(UUID, INTEGER, JSONB),
  public.confirm_payment_account_onboarding(TEXT, BOOLEAN, JSONB),
  public.claim_workflow_dispatch_request(UUID, INTEGER),
  public.complete_workflow_dispatch_request(UUID, INTEGER, TEXT[]),
  public.record_workflow_dispatch_failure(UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER)
  TO service_role;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.claim_provider_event(UUID, UUID, INTEGER) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.record_provider_event_failure(UUID, UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.apply_account_event(UUID, UUID, INTEGER, JSONB) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.confirm_payment_account_onboarding(UUID, UUID, TEXT, BOOLEAN, JSONB) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.claim_workflow_dispatch_request(UUID, UUID, INTEGER) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.complete_workflow_dispatch_request(UUID, UUID, INTEGER, TEXT[]) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.record_workflow_dispatch_failure(UUID, UUID, INTEGER, TEXT, TEXT, BOOLEAN, INTEGER) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

NOTIFY pgrst, 'reload schema';
COMMIT;
