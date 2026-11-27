-- AL-2681 (WP8a part 2 rest, PR 2a; ruling 2 of 26 November; record line
-- 1012 and issue 2776): connected refunds and disputes are kept for WP8c,
-- and the schedule's reconciliation reads each mapped account. Nothing live
-- calls either yet.
--
-- 1. public.stripe_connect_events admits a seventh status, 'deferred': an
--    event stored, claimed and kept for a later work package, never
--    ignored, dead-lettered or applied (NOT VALID, then validated).
-- 2. tenant_guard.claim_provider_event replaced: as it stood, and a
--    deferred event answers terminal like a processed one.
-- 3. tenant_guard.defer_payment_event(tenant, event, attempt) and its
--    wrapper public.defer_payment_event(event, attempt): for the attempt
--    that claimed a connected refund or dispute event (charge.refund*,
--    refund.*, charge.dispute.*), locking as the apply does (the event,
--    then the account, then the gift) and refusing 55000 lease_lost unless
--    the event's lease is live and the account's sync lease names this
--    event, it finds the line-based intake of the
--    event's PaymentIntent on the event's account and mode, locks it, opens
--    one Mission Control task per gift ('payment_event_deferred', linked to
--    the intake) or one per event when no intake is known, links the event
--    to that task, marks the event deferred and releases the account's sync
--    lease. It changes no money row. An unclaimed attempt is 55000
--    event_not_claimed; another event type is 22023 not_a_deferred_event.
-- 4. tenant_guard.reconcile_payment_account(tenant, account, snapshot) and
--    its wrapper public.reconcile_payment_account(account, snapshot): the
--    schedule hands it the provider's reading of a mapped account; it maps
--    the reading as tenant_guard.apply_account_event does (closed:
--    disconnected; card payments active: active; else restricted for a
--    binding that was active or restricted) and, when that differs from the
--    binding, opens one open 'payment_account_drift' task linked to the
--    binding. It never changes the binding: only the account's own events
--    move it. A reading of another account or mode is 22023
--    snapshot_mismatch. It locks the account row and stamps its
--    reconciled_at as its first write, whatever its outcome, so two
--    reconciliations of one account run one after the other (one drift
--    task) and the due work reads every account in turn; a reading that
--    says the provider read failed (read_failed: true) is stamped and
--    answered read_failed, and opens nothing.
-- Each guard function is owned by tenant_guard, enters the tenant first,
-- refuses any isolation level but READ COMMITTED (25001) and grants EXECUTE
-- to service_role only; each wrapper is a postgres-owned invoker that reads
-- the tenant from its anchor row, EXECUTE for service_role only.
--
-- Locks, taken first and held to COMMIT: ACCESS EXCLUSIVE on
-- stripe_connect_events for its check. lock_timeout stops a run rather than
-- queue it behind live traffic.
--
-- Recovery. A run lost between its COMMIT and its ledger row stops on the
-- next run at CREATE FUNCTION tenant_guard.defer_payment_event (42723). This
-- file has committed when this read-only check is true:
--   SELECT to_regprocedure('public.defer_payment_event(uuid,integer)') IS NOT NULL
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127050300.
--
-- Down, in one transaction, for a database with no deferred event:
--   SET LOCAL lock_timeout = '5s';
--   DROP FUNCTION public.reconcile_payment_account(uuid, jsonb);
--   DROP FUNCTION tenant_guard.reconcile_payment_account(uuid, uuid, jsonb);
--   DROP FUNCTION public.defer_payment_event(uuid, integer);
--   DROP FUNCTION tenant_guard.defer_payment_event(uuid, uuid, integer);
--   REVOKE UPDATE (reconciled_at) ON TABLE public.payment_provider_accounts FROM tenant_guard;
--   re-run, as tenant_guard, the CREATE OR REPLACE of tenant_guard.claim_provider_event this file replaced;
--   ALTER TABLE public.stripe_connect_events DROP CONSTRAINT stripe_connect_events_processing_status_check,
--     ADD CONSTRAINT stripe_connect_events_processing_status_check CHECK (processing_status IN
--     ('received', 'processing', 'failed', 'processed', 'ignored', 'dead_letter'));

BEGIN;
SET LOCAL lock_timeout = '5s';

LOCK TABLE public.stripe_connect_events IN ACCESS EXCLUSIVE MODE;

ALTER TABLE public.stripe_connect_events
  DROP CONSTRAINT stripe_connect_events_processing_status_check,
  ADD CONSTRAINT stripe_connect_events_processing_status_check
    CHECK (processing_status IN ('received', 'processing', 'failed', 'processed', 'ignored', 'dead_letter', 'deferred'))
    NOT VALID;

ALTER TABLE public.stripe_connect_events VALIDATE CONSTRAINT stripe_connect_events_processing_status_check;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
SET LOCAL ROLE tenant_guard;

CREATE OR REPLACE FUNCTION tenant_guard.claim_provider_event(p_tenant_id uuid, p_event_id uuid, p_lease_seconds integer DEFAULT 300)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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

  IF v_event.processing_status IN ('processed', 'ignored', 'dead_letter', 'deferred') THEN
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
$function$;

RESET ROLE;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE FUNCTION tenant_guard.defer_payment_event(
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
  v_pi TEXT;
  v_intake UUID;
  v_task UUID;
  v_now TIMESTAMPTZ;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  IF pg_catalog.current_setting('transaction_isolation') <> 'read committed' THEN
    RAISE EXCEPTION 'read_committed_required'
      USING ERRCODE = '25001',
            DETAIL = 'Deferring an event runs only at READ COMMITTED.';
  END IF;

  SELECT e.id, e.event_type, e.livemode, e.provider_account_id, e.stripe_event_id,
         e.processing_status, e.process_attempts, e.lease_expires_at, e.raw_payload
    INTO v_event
    FROM public.stripe_connect_events AS e
   WHERE e.id = p_event_id
     FOR NO KEY UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant_guard: provider event not found in entered tenant'
      USING ERRCODE = '42501';
  END IF;

  SELECT a.id, a.sync_lease_event_id
    INTO v_account
    FROM public.payment_provider_accounts AS a
   WHERE a.tenant_id = p_tenant_id
     AND a.provider_account_id = v_event.provider_account_id
     AND a.livemode = v_event.livemode
     FOR NO KEY UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant_guard: payment provider account anchor not found in entered tenant'
      USING ERRCODE = '42501';
  END IF;

  IF (v_event.processing_status = 'processing' AND v_event.process_attempts = p_attempt) IS NOT TRUE THEN
    RAISE EXCEPTION 'event_not_claimed'
      USING ERRCODE = '55000',
            DETAIL = 'Only the attempt that claimed the event may defer it.';
  END IF;

  IF (v_event.lease_expires_at > pg_catalog.clock_timestamp()
      AND v_account.sync_lease_event_id = p_event_id) IS NOT TRUE THEN
    RAISE EXCEPTION 'lease_lost'
      USING ERRCODE = '55000',
            DETAIL = 'The attempt''s event lease ran out or the account''s sync lease names another event.';
  END IF;

  IF (v_event.event_type LIKE 'charge.refund%'
      OR v_event.event_type LIKE 'refund.%'
      OR v_event.event_type LIKE 'charge.dispute.%') IS NOT TRUE THEN
    RAISE EXCEPTION 'not_a_deferred_event'
      USING ERRCODE = '22023',
            DETAIL = 'Only a connected refund or dispute is deferred to WP8c.';
  END IF;

  v_pi := v_event.raw_payload -> 'data' -> 'object' ->> 'payment_intent';
  IF (v_pi ~ '^pi_[A-Za-z0-9]+$') IS NOT TRUE THEN
    v_pi := NULL;
  END IF;

  IF v_pi IS NOT NULL THEN
    SELECT d.id
      INTO v_intake
      FROM public.donations AS d
     WHERE d.tenant_id = p_tenant_id
       AND d.provider_account_ref = v_event.provider_account_id
       AND d.livemode = v_event.livemode
       AND d.stripe_payment_intent_id = v_pi
       FOR NO KEY UPDATE;
  END IF;

  v_now := pg_catalog.clock_timestamp();

  IF v_intake IS NOT NULL THEN
    SELECT l.task_id
      INTO v_task
      FROM public.mission_control_task_links AS l
      JOIN public.mission_control_tasks AS t
        ON t.id = l.task_id
     WHERE l.tenant_id = p_tenant_id
       AND l.record_type = 'donation'
       AND l.record_id = v_intake::TEXT
       AND t.issue_type = 'payment_event_deferred'
     ORDER BY t.created_at, t.id
     LIMIT 1;
  END IF;

  IF v_task IS NULL THEN
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
      'Refund or dispute waiting for a decision',
      pg_catalog.format(
        'Stripe event %s (%s, account %s, livemode %s) names PaymentIntent %s, intake %s. It changed no money row: connected refunds and disputes are applied from WP8c.',
        v_event.stripe_event_id, v_event.event_type, v_event.provider_account_id, v_event.livemode,
        COALESCE(v_pi, 'none'), COALESCE(v_intake::TEXT, 'unknown')
      ),
      'open',
      'high',
      'payments',
      'payment_event_deferred',
      'system'
    )
    RETURNING id INTO v_task;

    IF v_intake IS NOT NULL THEN
      INSERT INTO public.mission_control_task_links (
        tenant_id, task_id, record_type, record_id, relationship, metadata
      )
      VALUES (
        p_tenant_id, v_task, 'donation', v_intake::TEXT, 'payment_event_deferred',
        pg_catalog.jsonb_build_object('payment_object_id', v_pi)
      );
    END IF;
  END IF;

  INSERT INTO public.mission_control_task_links (
    tenant_id, task_id, record_type, record_id, relationship, metadata
  )
  VALUES (
    p_tenant_id, v_task, 'stripe_connect_event', p_event_id::TEXT, 'payment_event_deferred',
    pg_catalog.jsonb_build_object(
      'event_type', v_event.event_type,
      'stripe_event_id', v_event.stripe_event_id,
      'payment_object_id', v_pi
    )
  );

  UPDATE public.stripe_connect_events
     SET processing_status = 'deferred',
         processed_at = v_now,
         lease_expires_at = NULL,
         processing_outcome = pg_catalog.jsonb_build_object(
           'outcome', 'deferred_to_wp8c',
           'attempt', p_attempt,
           'donation_id', v_intake,
           'task_id', v_task,
           'payment_object_id', v_pi
         ),
         updated_at = v_now
   WHERE id = p_event_id;

  UPDATE public.payment_provider_accounts
     SET sync_lease_event_id = NULL,
         sync_lease_expires_at = NULL,
         updated_at = v_now
   WHERE id = v_account.id;

  RETURN pg_catalog.jsonb_build_object(
    'outcome', 'deferred',
    'event_id', p_event_id,
    'donation_id', v_intake,
    'task_id', v_task,
    'tenant_id', tenant_guard.current_tenant_id()
  );
END;
$$;

CREATE FUNCTION tenant_guard.reconcile_payment_account(
  p_tenant_id UUID,
  p_account_id UUID,
  p_snapshot JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_account RECORD;
  v_binding RECORD;
  v_target TEXT;
  v_task UUID;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  IF pg_catalog.current_setting('transaction_isolation') <> 'read committed' THEN
    RAISE EXCEPTION 'read_committed_required'
      USING ERRCODE = '25001',
            DETAIL = 'Reconciling an account runs only at READ COMMITTED.';
  END IF;

  SELECT a.id, a.legal_entity_id, a.provider_account_id, a.livemode
    INTO v_account
    FROM public.payment_provider_accounts AS a
   WHERE a.id = p_account_id
     FOR NO KEY UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant_guard: payment provider account not found in entered tenant'
      USING ERRCODE = '42501';
  END IF;

  IF (p_snapshot ->> 'id' = v_account.provider_account_id
      AND pg_catalog.jsonb_typeof(p_snapshot -> 'livemode') = 'boolean'
      AND (p_snapshot ->> 'livemode')::BOOLEAN = v_account.livemode) IS NOT TRUE THEN
    RAISE EXCEPTION 'snapshot_mismatch'
      USING ERRCODE = '22023',
            DETAIL = 'The reading does not name this account and mode.';
  END IF;

  UPDATE public.payment_provider_accounts
     SET reconciled_at = pg_catalog.clock_timestamp()
   WHERE id = v_account.id;

  SELECT b.id, b.status
    INTO v_binding
    FROM public.payment_account_bindings AS b
   WHERE b.tenant_id = p_tenant_id
     AND b.legal_entity_id = v_account.legal_entity_id
     AND b.provider_account_ref = v_account.provider_account_id
     AND b.livemode = v_account.livemode
     AND b.status IN ('pending', 'active', 'restricted')
     FOR SHARE;

  IF NOT FOUND THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'no_binding',
      'account_id', p_account_id,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF (p_snapshot -> 'read_failed') = 'true'::JSONB THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'read_failed',
      'binding_status', v_binding.status,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  IF COALESCE(p_snapshot ->> 'closed', 'false') = 'true' THEN
    v_target := 'disconnected';
  ELSIF p_snapshot ->> 'card_payments_status' = 'active' THEN
    v_target := 'active';
  ELSIF v_binding.status IN ('active', 'restricted') THEN
    v_target := 'restricted';
  ELSE
    v_target := 'pending';
  END IF;

  IF v_target = v_binding.status THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'in_line',
      'binding_status', v_binding.status,
      'tenant_id', tenant_guard.current_tenant_id()
    );
  END IF;

  SELECT l.task_id
    INTO v_task
    FROM public.mission_control_task_links AS l
    JOIN public.mission_control_tasks AS t
      ON t.id = l.task_id
   WHERE l.tenant_id = p_tenant_id
     AND l.record_type = 'payment_account_binding'
     AND l.record_id = v_binding.id::TEXT
     AND t.issue_type = 'payment_account_drift'
     AND t.status = 'open'
   ORDER BY t.created_at, t.id
   LIMIT 1;

  IF FOUND THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'already_flagged',
      'task_id', v_task,
      'observed', v_target,
      'binding_status', v_binding.status,
      'tenant_id', tenant_guard.current_tenant_id()
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
    p_tenant_id,
    'Payment account differs from its binding',
    pg_catalog.format(
      'The provider reads account %s (livemode %s) as %s while its binding is %s. Nothing changed: the binding moves only with the account''s own events.',
      v_account.provider_account_id, v_account.livemode, v_target, v_binding.status
    ),
    'open',
    'high',
    'payments',
    'payment_account_drift',
    'system'
  )
  RETURNING id INTO v_task;

  INSERT INTO public.mission_control_task_links (
    tenant_id, task_id, record_type, record_id, relationship, metadata
  )
  VALUES (
    p_tenant_id, v_task, 'payment_account_binding', v_binding.id::TEXT, 'payment_account_drift',
    pg_catalog.jsonb_build_object(
      'observed', v_target,
      'binding_status', v_binding.status,
      'provider_account_id', v_account.provider_account_id
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'outcome', 'drift_flagged',
    'task_id', v_task,
    'observed', v_target,
    'binding_status', v_binding.status,
    'tenant_id', tenant_guard.current_tenant_id()
  );
END;
$$;

CREATE FUNCTION public.defer_payment_event(p_event_id UUID, p_attempt INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_tenant UUID;
BEGIN
  SELECT e.tenant_id INTO v_tenant FROM public.stripe_connect_events AS e WHERE e.id = p_event_id;

  IF v_tenant IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'unknown_anchor', 'event_id', p_event_id);
  END IF;

  RETURN tenant_guard.defer_payment_event(v_tenant, p_event_id, p_attempt);
END;
$$;

CREATE FUNCTION public.reconcile_payment_account(p_account_id UUID, p_snapshot JSONB)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_tenant UUID;
BEGIN
  SELECT a.tenant_id INTO v_tenant FROM public.payment_provider_accounts AS a WHERE a.id = p_account_id;

  IF v_tenant IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'unknown_anchor', 'account_id', p_account_id);
  END IF;

  RETURN tenant_guard.reconcile_payment_account(v_tenant, p_account_id, p_snapshot);
END;
$$;

GRANT UPDATE (reconciled_at) ON TABLE public.payment_provider_accounts TO tenant_guard;

REVOKE ALL ON FUNCTION
  tenant_guard.defer_payment_event(UUID, UUID, INTEGER),
  tenant_guard.reconcile_payment_account(UUID, UUID, JSONB),
  public.defer_payment_event(UUID, INTEGER),
  public.reconcile_payment_account(UUID, JSONB)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
  tenant_guard.defer_payment_event(UUID, UUID, INTEGER),
  tenant_guard.reconcile_payment_account(UUID, UUID, JSONB),
  public.defer_payment_event(UUID, INTEGER),
  public.reconcile_payment_account(UUID, JSONB)
  TO service_role;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.defer_payment_event(UUID, UUID, INTEGER) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.reconcile_payment_account(UUID, UUID, JSONB) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
