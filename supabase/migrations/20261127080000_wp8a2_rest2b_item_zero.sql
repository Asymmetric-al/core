-- AL-2681 (WP8a part 2 rest, PR 2b, item zero: issue 2857 items 18, 19,
-- 35 and 36): what the readings of pull requests 2853 and 2860 left, before
-- the checkout opens. GUEST_GIVING_ENABLED is never turned on in a
-- deployment whose build is older than this pull request.
--
-- 1. tenant_guard.claim_provider_operation replaced: as 20261126020200 wrote
--    it, and it share-locks the organization (private.share_lock_tenant) and
--    takes the gift's binding FOR SHARE before it locks the request, in the
--    order a disconnect takes the binding and then the request. A
--    create_payment of an organization that is not active answers
--    organization_inactive and is not claimed (item 18).
-- 2. tenant_guard.apply_account_event replaced: as 20261127030200 wrote it,
--    and a disconnect links each request of the binding whose outcome is
--    unknown (queued, retry_wait or sending) to its one disconnect task as
--    provider_request_outcome_unknown_disconnected; such a request keeps its
--    status, and the claim answers binding_inactive for it (item 19).
-- 3. tenant_guard.begin_line_gift replaced: as 20261127050100 wrote it, and
--    two requests with one key of one organization serialize on a
--    transaction advisory lock before the key is read, so the second answers
--    the first's stored outcome (item 35).
-- 4. public.donor_portal_login_lifetime(tenant, donor, login): the donor
--    portal's settled lifetime figures, counting a login's donorless
--    line-based gifts by its own intake contacts rather than by a capped list
--    (item 36). public.donor_portal_lifetime(uuid, uuid, uuid[]) stays: the
--    running build's portal calls it; WP8b's contract drops it.
--
-- Recovery. A run lost between its COMMIT and its ledger row reruns
-- cleanly (every statement replaces or creates OR REPLACE). This file has
-- committed when this read-only check is true:
--   SELECT to_regprocedure('public.donor_portal_login_lifetime(uuid, uuid, uuid)') IS NOT NULL
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127080000.
--
-- Down, an operator's last resort, in one transaction:
--   SET LOCAL lock_timeout = '5s';
--   DROP FUNCTION public.donor_portal_login_lifetime(uuid, uuid, uuid);
--   GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard; SET LOCAL ROLE tenant_guard;
--   re-run, verbatim, the CREATE FUNCTION of tenant_guard.claim_provider_operation
--     from 20261126020200, of tenant_guard.begin_line_gift from 20261127050100,
--     and the CREATE OR REPLACE of tenant_guard.apply_account_event from
--     20261127030200, each as CREATE OR REPLACE;
--   RESET ROLE; REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

BEGIN;
SET LOCAL lock_timeout = '5s';

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
SET LOCAL ROLE tenant_guard;

CREATE OR REPLACE FUNCTION tenant_guard.claim_provider_operation(
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
  v_tenant_status TEXT;
  v_donation_id UUID;
  v_claimed RECORD;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  IF (p_lease_seconds BETWEEN 5 AND 900) IS NOT TRUE THEN
    RAISE EXCEPTION 'lease_out_of_range'
      USING ERRCODE = '22023',
            DETAIL = 'A lease is 5 to 900 seconds.';
  END IF;

  SELECT o.donation_id
    INTO v_donation_id
    FROM public.donation_saga_outbox AS o
   WHERE o.id = p_operation_id
     AND o.kind = 'provider_request';

  IF FOUND THEN
    v_tenant_status := private.share_lock_tenant(p_tenant_id);
    SELECT b.status
      INTO v_binding_status
      FROM public.donations AS d
      JOIN public.payment_account_bindings AS b
        ON b.tenant_id = d.tenant_id
       AND b.id = d.payment_account_binding_id
     WHERE d.id = v_donation_id
       FOR SHARE OF b;
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

  IF v_op.request_kind = 'create_payment' AND v_tenant_status IS DISTINCT FROM 'active' THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'organization_inactive',
      'operation_id', v_op.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'organization_status', v_tenant_status
    );
  END IF;

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
             o.id::TEXT,
             'provider_request_outcome_unknown_disconnected',
             pg_catalog.jsonb_build_object(
               'binding_id', v_binding.id,
               'stripe_event_id', v_event.stripe_event_id,
               'status', o.status
             )
        FROM public.donation_saga_outbox AS o
       WHERE o.tenant_id = p_tenant_id
         AND o.kind = 'provider_request'
         AND o.outcome_unknown
         AND o.status IN ('queued', 'retry_wait', 'sending')
         AND o.donation_id IN (
           SELECT d.id
             FROM public.donations AS d
            WHERE d.tenant_id = p_tenant_id
              AND d.payment_account_binding_id = v_binding.id
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

CREATE OR REPLACE FUNCTION tenant_guard.begin_line_gift(
  p_tenant_id UUID,
  p_host TEXT,
  p_entry_surface TEXT,
  p_client_key TEXT,
  p_lines JSONB,
  p_fee_cover BIGINT,
  p_payment_method TEXT,
  p_is_anonymous BOOLEAN,
  p_source_code TEXT,
  p_contact JSONB,
  p_actor JSONB,
  p_site_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_status TEXT;
  v_host TEXT;
  v_state TEXT;
  v_site UUID;
  v_surfaces TEXT[];
  v_site_status TEXT;
  v_key_digest TEXT;
  v_code TEXT;
  v_email TEXT;
  v_first TEXT;
  v_last TEXT;
  v_address JSONB;
  v_actor_user UUID;
  v_actor_email TEXT;
  v_actor_confirmed BOOLEAN;
  v_request JSONB;
  v_request_digest TEXT;
  v_existing RECORD;
  v_line RECORD;
  v_target TEXT;
  v_line_entity UUID;
  v_reserved BOOLEAN;
  v_active BOOLEAN;
  v_entity UUID;
  v_sum BIGINT;
  v_binding RECORD;
  v_fee_fund UUID;
  v_currency TEXT;
  v_source UUID;
  v_unlisted TEXT;
  v_id UUID;
  v_number INTEGER;
  v_operation UUID;
  v_operation_status TEXT;
  v_replay RECORD;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  IF pg_catalog.current_setting('transaction_isolation') <> 'read committed' THEN
    RAISE EXCEPTION 'read_committed_required'
      USING ERRCODE = '25001',
            DETAIL = 'The intake command runs only at READ COMMITTED.';
  END IF;

  v_status := private.share_lock_tenant(p_tenant_id);
  v_host := CASE
              WHEN pg_catalog.octet_length(p_host) <= 300
              THEN pg_catalog.lower(pg_catalog.regexp_replace(p_host COLLATE "C", '\.?(:[0-9]+)?$', ''))
            END;
  v_actor_email := NULLIF(pg_catalog.lower(pg_catalog.btrim(p_actor ->> 'email')), '');
  v_actor_confirmed := CASE WHEN pg_catalog.jsonb_typeof(p_actor -> 'email_confirmed') = 'boolean'
                            THEN (p_actor ->> 'email_confirmed')::BOOLEAN END;
  v_actor_user := CASE WHEN (p_actor ->> 'user_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                       THEN (p_actor ->> 'user_id')::UUID END;

  IF p_entry_surface = 'website' THEN
    SELECT l.state, l.surfaces
      INTO v_state, v_surfaces
      FROM private.share_lock_site_domain(p_tenant_id, v_host) AS l;
    IF FOUND THEN
      SELECT d.site_id
        INTO v_site
        FROM public.site_domains AS d
       WHERE d.tenant_id = p_tenant_id
         AND d.host = v_host;
    END IF;
    IF (v_state = 'active'
        AND 'website' = ANY (v_surfaces)
        AND v_site IS NOT NULL) IS NOT TRUE THEN
      RAISE EXCEPTION 'host_not_admitted'
        USING ERRCODE = '42501',
              DETAIL = 'A guest gives only on an active claimed name of a Site.';
    END IF;
    SELECT s.status
      INTO v_site_status
      FROM public.sites AS s
     WHERE s.tenant_id = p_tenant_id
       AND s.id = v_site
       FOR SHARE;
    IF (v_site_status = 'active') IS NOT TRUE THEN
      RAISE EXCEPTION 'host_not_admitted'
        USING ERRCODE = '42501',
              DETAIL = 'A guest gives only on an active Site.';
    END IF;
    IF p_actor IS NOT NULL THEN
      PERFORM 1
         FROM public.donor_portal_hosts AS h
        WHERE h.tenant_id = p_tenant_id
          AND h.primary_domain = v_host
          FOR SHARE;
      IF (FOUND AND 'donor_account' = ANY (v_surfaces)) IS NOT TRUE THEN
        RAISE EXCEPTION 'actor_not_admitted'
          USING ERRCODE = '22023',
                DETAIL = 'A signed-in giver gives in place only where the Site''s name is also the organization''s home domain.';
      END IF;
      IF (v_actor_user IS NOT NULL AND v_actor_confirmed IS NOT NULL) IS NOT TRUE THEN
        RAISE EXCEPTION 'actor_required'
          USING ERRCODE = '22023',
                DETAIL = 'A signed-in gift names the verified signed-in giver.';
      END IF;
    END IF;
    IF p_site_id IS NOT NULL THEN
      RAISE EXCEPTION 'source_site_not_admitted'
        USING ERRCODE = '22023',
              DETAIL = 'A Site''s checkout takes its Site from its name; only a hand-off to the home domain names one.';
    END IF;
  ELSIF p_entry_surface = 'donor_account' THEN
    PERFORM 1
       FROM public.donor_portal_hosts AS h
      WHERE h.tenant_id = p_tenant_id
        AND h.primary_domain = v_host
        FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'host_not_admitted'
        USING ERRCODE = '42501',
              DETAIL = 'A signed-in gift comes only from the organization''s home name.';
    END IF;
    SELECT l.state, l.surfaces
      INTO v_state, v_surfaces
      FROM private.share_lock_site_domain(p_tenant_id, v_host) AS l;
    IF (v_state = 'active' AND 'donor_account' = ANY (v_surfaces)) IS NOT TRUE THEN
      RAISE EXCEPTION 'host_not_admitted'
        USING ERRCODE = '42501',
              DETAIL = 'The home name is not an active claimed name serving the account area.';
    END IF;
    IF (v_actor_user IS NOT NULL AND v_actor_confirmed IS NOT NULL) IS NOT TRUE THEN
      RAISE EXCEPTION 'actor_required'
        USING ERRCODE = '22023',
              DETAIL = 'An account-area gift names the verified signed-in giver.';
    END IF;
    v_site := NULL;
    IF p_site_id IS NOT NULL THEN
      SELECT s.id
        INTO v_site
        FROM public.sites AS s
       WHERE s.tenant_id = p_tenant_id
         AND s.id = p_site_id
         AND s.status = 'active'
         FOR SHARE;
    END IF;
  ELSE
    RAISE EXCEPTION 'host_not_admitted'
      USING ERRCODE = '42501',
            DETAIL = 'The entry surface is website or donor_account.';
  END IF;

  IF (v_status = 'active') IS NOT TRUE THEN
    RAISE EXCEPTION 'organization_inactive'
      USING ERRCODE = '55000',
            DETAIL = 'The organization is not active.';
  END IF;

  IF (p_client_key IS NOT NULL
      AND pg_catalog.char_length(p_client_key) BETWEEN 1 AND 200
      AND p_client_key !~ '[[:cntrl:]]') IS NOT TRUE THEN
    RAISE EXCEPTION 'client_key_invalid'
      USING ERRCODE = '22023',
            DETAIL = 'A client key is 1 to 200 characters with no control character.';
  END IF;

  v_key_digest := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_client_key, 'UTF8')), 'hex');
  v_code := NULLIF(pg_catalog.lower(pg_catalog.btrim(p_source_code)), '');
  v_email := NULLIF(pg_catalog.lower(pg_catalog.btrim(p_contact ->> 'email')), '');
  v_first := NULLIF(pg_catalog.btrim(p_contact ->> 'first_name'), '');
  v_last := NULLIF(pg_catalog.btrim(p_contact ->> 'last_name'), '');
  v_address := CASE WHEN pg_catalog.jsonb_typeof(p_contact -> 'address') = 'object'
                    THEN p_contact -> 'address' END;
  v_request := pg_catalog.jsonb_build_object(
    'host', v_host,
    'entry_surface', p_entry_surface,
    'lines', p_lines,
    'fee_cover', p_fee_cover,
    'payment_method', p_payment_method,
    'is_anonymous', p_is_anonymous,
    'source_code', v_code,
    'contact', pg_catalog.jsonb_build_object(
      'email', v_email, 'first_name', v_first, 'last_name', v_last, 'address', v_address
    ),
    'actor', pg_catalog.jsonb_build_object(
      'user_id', v_actor_user, 'email', v_actor_email, 'email_confirmed', v_actor_confirmed
    ),
    'source_site', p_site_id
  );
  v_request_digest := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_request::TEXT, 'UTF8')), 'hex');

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('begin_line_gift:' || p_tenant_id::TEXT || ':' || v_key_digest, 0)
  );

  SELECT r.request_digest, r.donation_id
    INTO v_existing
    FROM public.donation_intake_requests AS r
   WHERE r.tenant_id = p_tenant_id
     AND r.key_digest = v_key_digest;

  IF NOT FOUND THEN
    IF (p_payment_method = 'card') IS NOT TRUE THEN
      RAISE EXCEPTION 'payment_method_refused'
        USING ERRCODE = '22023',
              DETAIL = 'A gift is paid by card.';
    END IF;

    IF p_is_anonymous IS NULL THEN
      RAISE EXCEPTION 'anonymity_required'
        USING ERRCODE = '22023',
              DETAIL = 'The giver chooses whether the gift is anonymous.';
    END IF;

    IF (pg_catalog.jsonb_typeof(p_contact) = 'object'
        AND v_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
        AND pg_catalog.char_length(v_email) <= 254
        AND pg_catalog.char_length(COALESCE(v_first, '')) <= 200
        AND pg_catalog.char_length(COALESCE(v_last, '')) <= 200) IS NOT TRUE THEN
      RAISE EXCEPTION 'contact_required'
        USING ERRCODE = '22023',
              DETAIL = 'A gift names an address to write to.';
    END IF;

    IF (pg_catalog.jsonb_typeof(p_lines) = 'array'
        AND pg_catalog.jsonb_array_length(p_lines) BETWEEN 1 AND 99
        AND p_fee_cover IS NOT NULL
        AND p_fee_cover >= 0
        AND p_fee_cover <= 1000000000000) IS NOT TRUE THEN
      RAISE EXCEPTION 'lines_invalid'
        USING ERRCODE = '22023',
              DETAIL = 'A gift has 1 to 99 donor lines and a fee cover of zero or more cents.';
    END IF;

    v_sum := 0;
    v_entity := NULL;
    FOR v_line IN
      SELECT l.value, l.ordinality
        FROM pg_catalog.jsonb_array_elements(p_lines) WITH ORDINALITY AS l(value, ordinality)
    LOOP
      IF (pg_catalog.jsonb_typeof(v_line.value) = 'object'
          AND pg_catalog.jsonb_typeof(v_line.value -> 'amount') = 'number'
          AND (v_line.value ->> 'amount') ~ '^[1-9][0-9]{0,11}$'
          AND ((v_line.value ? 'fund_id') <> (v_line.value ? 'missionary_id'))
          AND (SELECT pg_catalog.count(*) FROM pg_catalog.jsonb_object_keys(v_line.value)) = 2
          AND COALESCE(v_line.value ->> 'fund_id', v_line.value ->> 'missionary_id')
                ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') IS NOT TRUE THEN
        RAISE EXCEPTION 'lines_invalid'
          USING ERRCODE = '22023',
                DETAIL = pg_catalog.format('Line %s names one fund or worker and a whole number of cents above zero.', v_line.ordinality);
      END IF;

      v_target := COALESCE(v_line.value ->> 'fund_id', v_line.value ->> 'missionary_id');
      v_line_entity := NULL;
      v_reserved := false;
      v_active := true;
      IF v_line.value ? 'fund_id' THEN
        SELECT f.legal_entity_id, f.is_reserved_fee_cover, f.is_active
          INTO v_line_entity, v_reserved, v_active
          FROM public.funds AS f
         WHERE f.tenant_id = p_tenant_id
           AND f.id = v_target::UUID;
      ELSE
        SELECT m.legal_entity_id
          INTO v_line_entity
          FROM public.missionaries AS m
         WHERE m.tenant_id = p_tenant_id
           AND m.id = v_target::UUID;
      END IF;

      IF v_line_entity IS NULL OR v_active IS NOT TRUE THEN
        RAISE EXCEPTION 'target_not_found'
          USING ERRCODE = '22023',
                DETAIL = pg_catalog.format('Line %s names no active fund or worker of the organization.', v_line.ordinality);
      END IF;
      IF v_reserved THEN
        RAISE EXCEPTION 'reserved_fund_line'
          USING ERRCODE = '22023',
                DETAIL = pg_catalog.format('Line %s names the reserved fee-cover fund.', v_line.ordinality);
      END IF;
      IF v_entity IS NULL THEN
        v_entity := v_line_entity;
      ELSIF v_entity <> v_line_entity THEN
        RAISE EXCEPTION 'lines_span_entities'
          USING ERRCODE = '22023',
                DETAIL = 'A gift''s lines name targets of one legal entity.';
      END IF;
      v_sum := v_sum + (v_line.value ->> 'amount')::BIGINT;
    END LOOP;

    IF p_fee_cover * 100 > v_sum * 5 + 10000 THEN
      RAISE EXCEPTION 'fee_cover_out_of_range'
        USING ERRCODE = '22023',
              DETAIL = 'A fee cover is at most five percent of the donor''s lines plus 100 cents.';
    END IF;

    SELECT b.id, b.provider_account_ref, b.livemode, b.status
      INTO v_binding
      FROM public.payment_account_bindings AS b
     WHERE b.tenant_id = p_tenant_id
       AND b.legal_entity_id = v_entity
       AND b.livemode = false
       AND b.status IN ('pending', 'active', 'restricted')
       FOR SHARE;

    IF NOT FOUND OR (v_binding.status = 'active') IS NOT TRUE THEN
      RAISE EXCEPTION 'binding_unavailable'
        USING ERRCODE = '55000',
              DETAIL = 'The legal entity has no active test-mode payment account binding.';
    END IF;

    IF p_fee_cover > 0 THEN
      SELECT f.id
        INTO v_fee_fund
        FROM public.funds AS f
       WHERE f.tenant_id = p_tenant_id
         AND f.legal_entity_id = v_entity
         AND f.is_reserved_fee_cover;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'fee_fund_missing'
          USING ERRCODE = '55000',
                DETAIL = 'The legal entity has no reserved fee-cover fund.';
      END IF;
    END IF;

    SELECT e.currency
      INTO v_currency
      FROM public.legal_entities AS e
     WHERE e.tenant_id = p_tenant_id
       AND e.id = v_entity;

    IF v_currency = 'usd' AND (v_sum + p_fee_cover NOT BETWEEN 50 AND 99999999) THEN
      RAISE EXCEPTION 'amount_out_of_range'
        USING ERRCODE = '22023',
              DETAIL = 'A gift in US dollars is between 50 and 99,999,999 cents, fee cover included.';
    END IF;

    IF v_code ~ '^[a-z0-9][a-z0-9_-]{0,63}$' THEN
      SELECT c.id
        INTO v_source
        FROM public.giving_source_codes AS c
       WHERE c.tenant_id = p_tenant_id
         AND c.code = v_code
         AND c.is_active;
      IF NOT FOUND THEN
        v_unlisted := v_code;
      END IF;
    END IF;

    v_id := pg_catalog.gen_random_uuid();

    INSERT INTO public.donation_intake_requests (tenant_id, key_digest, request_digest, donation_id)
    VALUES (p_tenant_id, v_key_digest, v_request_digest, v_id)
    ON CONFLICT (tenant_id, key_digest) DO NOTHING;

    IF FOUND THEN
      INSERT INTO public.donations (
        id, tenant_id, legal_entity_id, payment_account_binding_id, provider_account_ref, livemode,
        amount, currency, payment_method, is_anonymous, site_id, entry_surface, source_code_id,
        unlisted_source_code
      )
      VALUES (
        v_id, p_tenant_id, v_entity, v_binding.id, v_binding.provider_account_ref, false,
        v_sum + p_fee_cover, v_currency, p_payment_method, p_is_anonymous, v_site, p_entry_surface,
        v_source, v_unlisted
      );

      v_number := 0;
      FOR v_line IN
        SELECT l.value
          FROM pg_catalog.jsonb_array_elements(p_lines) WITH ORDINALITY AS l(value, ordinality)
         ORDER BY l.ordinality
      LOOP
        v_number := v_number + 1;
        INSERT INTO public.donation_intake_lines (
          tenant_id, donation_id, legal_entity_id, line_number, fund_id, missionary_id, is_fee_cover, amount
        )
        VALUES (
          p_tenant_id, v_id, v_entity, v_number,
          (v_line.value ->> 'fund_id')::UUID, (v_line.value ->> 'missionary_id')::UUID,
          false, (v_line.value ->> 'amount')::BIGINT
        );
      END LOOP;

      IF p_fee_cover > 0 THEN
        INSERT INTO public.donation_intake_lines (
          tenant_id, donation_id, legal_entity_id, line_number, fund_id, missionary_id, is_fee_cover, amount
        )
        VALUES (p_tenant_id, v_id, v_entity, v_number + 1, v_fee_fund, NULL, true, p_fee_cover);
      END IF;

      INSERT INTO public.donation_intake_contacts (
        tenant_id, donation_id, legal_entity_id, email, first_name, last_name, address,
        actor_user_id, actor_email, actor_email_confirmed
      )
      VALUES (
        p_tenant_id, v_id, v_entity, v_email, v_first, v_last, v_address,
        v_actor_user, v_actor_email, v_actor_confirmed
      );

      v_operation := tenant_guard.money_enqueue_payment_request(v_id);

      INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
      VALUES (
        p_tenant_id,
        v_actor_user,
        'gift_intake_begun',
        'donation',
        v_id::TEXT,
        pg_catalog.jsonb_build_object(
          'entry_surface', p_entry_surface,
          'site_id', v_site,
          'lines', pg_catalog.jsonb_array_length(p_lines),
          'fee_cover', p_fee_cover,
          'request_digest', v_request_digest,
          'operation_id', v_operation
        )
      );

      RETURN pg_catalog.jsonb_build_object(
        'outcome', 'created',
        'donation_id', v_id,
        'operation_id', v_operation,
        'tenant_id', tenant_guard.current_tenant_id(),
        'amount', v_sum + p_fee_cover,
        'currency', v_currency,
        'provider_account', v_binding.provider_account_ref,
        'payment_intent', NULL,
        'gift_state', 'open'
      );
    END IF;

    SELECT r.request_digest, r.donation_id
      INTO v_existing
      FROM public.donation_intake_requests AS r
     WHERE r.tenant_id = p_tenant_id
       AND r.key_digest = v_key_digest;
  END IF;

  IF (v_existing.request_digest = v_request_digest) IS NOT TRUE THEN
    RAISE EXCEPTION 'idempotency_key_reused'
      USING ERRCODE = '23505',
            DETAIL = 'This key began another gift; a new gift needs a new key.';
  END IF;

  SELECT d.id, d.amount, d.currency, d.provider_account_ref, d.stripe_payment_intent_id, d.status
    INTO v_replay
    FROM public.donations AS d
   WHERE d.tenant_id = p_tenant_id
     AND d.id = v_existing.donation_id;

  SELECT o.id, o.status
    INTO v_operation, v_operation_status
    FROM public.donation_saga_outbox AS o
   WHERE o.tenant_id = p_tenant_id
     AND o.donation_id = v_existing.donation_id
     AND o.request_kind = 'create_payment';

  RETURN pg_catalog.jsonb_build_object(
    'outcome', 'replayed',
    'donation_id', v_replay.id,
    'operation_id', v_operation,
    'tenant_id', tenant_guard.current_tenant_id(),
    'amount', v_replay.amount,
    'currency', v_replay.currency,
    'provider_account', v_replay.provider_account_ref,
    'payment_intent', v_replay.stripe_payment_intent_id,
    'gift_state', CASE
                    WHEN v_replay.status = 'completed'
                      OR EXISTS (
                           SELECT 1
                             FROM public.payment_observations AS p
                            WHERE p.tenant_id = p_tenant_id
                              AND p.donation_id = v_replay.id
                              AND p.effect_kind = 'succeeded'
                         )
                      OR EXISTS (
                           SELECT 1
                             FROM public.payment_event_cases AS c
                            WHERE c.tenant_id = p_tenant_id
                              AND c.donation_id = v_replay.id
                              AND c.kind IN ('paid_after_abandon', 'paid_while_parked')
                         )
                    THEN 'paid'
                    WHEN v_replay.status = 'abandoned'
                      OR v_operation_status IN ('refused', 'dead_letter', 'abandoned')
                      OR EXISTS (
                           SELECT 1
                             FROM public.payment_observations AS p
                            WHERE p.tenant_id = p_tenant_id
                              AND p.donation_id = v_replay.id
                              AND p.effect_kind = 'canceled'
                         )
                    THEN 'closed'
                    ELSE 'open'
                  END
  );
END;
$$;

RESET ROLE;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE OR REPLACE FUNCTION public.donor_portal_login_lifetime(
  p_tenant_id UUID,
  p_donor_id UUID,
  p_login_id UUID
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
              AND d.intake_format = 'line_based'
              AND EXISTS (
                SELECT 1
                  FROM public.donation_intake_contacts AS c
                 WHERE c.tenant_id = d.tenant_id
                   AND c.donation_id = d.id
                   AND c.actor_user_id = p_login_id
              )))
     AND pg_catalog.lower(d.status) IN ('completed', 'succeeded', 'success')
     AND (d.intake_format <> 'line_based' OR d.status = 'completed');
$fn$;

ALTER FUNCTION public.donor_portal_login_lifetime(UUID, UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.donor_portal_login_lifetime(UUID, UUID, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.donor_portal_login_lifetime(UUID, UUID, UUID) TO service_role;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
