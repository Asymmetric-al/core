-- Local, seeded-database proof for donation fee replay. All writes roll back.
\set ON_ERROR_STOP on

BEGIN;
SET LOCAL request.jwt.claim.role = 'service_role';

DO $proof$
DECLARE
  v_tenant_id UUID;
  v_profile_id UUID;
  v_actor_id UUID;
  v_intake JSONB;
  v_outbox_id UUID;
  v_lock_id UUID;
  v_result JSONB;
  v_before JSONB;
  v_after JSONB;
  v_case TEXT;
  v_rejected BOOLEAN;
  v_quote CONSTANT JSONB := '{"gift_amount_cents":"10000","cover_fees":"false","payment_method":"card","cover_amount_cents":"0","estimated_fee_cents":"320"}';
  v_other_quote CONSTANT JSONB := '{"gift_amount_cents":"10000","cover_fees":"false","payment_method":"ach","cover_amount_cents":"0","estimated_fee_cents":"80"}';
BEGIN
  IF has_function_privilege('anon',
       'public.claim_donation_saga_event_with_fee_quote(uuid,uuid,jsonb)', 'EXECUTE')
     OR has_function_privilege('authenticated',
       'public.claim_donation_saga_event_with_fee_quote(uuid,uuid,jsonb)', 'EXECUTE')
     OR NOT has_function_privilege('service_role',
       'public.claim_donation_saga_event_with_fee_quote(uuid,uuid,jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Fee-aware claim grants must be service-role-only';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc
             WHERE oid = 'public.claim_donation_saga_event_with_fee_quote(uuid,uuid,jsonb)'::regprocedure
               AND prosecdef) THEN
    RAISE EXCEPTION 'Fee-aware claim must preserve invoker privileges';
  END IF;

  SELECT tenant_id, id, user_id
  INTO v_tenant_id, v_profile_id, v_actor_id
  FROM public.profiles WHERE tenant_id IS NOT NULL ORDER BY id LIMIT 1;
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Run the repository seed before this proof';
  END IF;

  FOREACH v_case IN ARRAY ARRAY['quoted', 'legacy', 'hydrated'] LOOP
    v_lock_id := gen_random_uuid();
    v_intake := public.begin_donation_saga(
      p_tenant_id => v_tenant_id, p_profile_id => v_profile_id,
      p_actor_user_id => v_actor_id, p_amount => 10000,
      p_idempotency_key => 'fee-replay-proof-' || v_case,
      p_fee_extras => CASE WHEN v_case = 'quoted'
        THEN v_quote || '{"unrelated_key":"ignored by fee comparison"}'::jsonb
        ELSE '{}'::jsonb END
    );
    v_outbox_id := (v_intake->>'outbox_id')::uuid;

    IF v_case = 'hydrated' THEN
      -- An older request may still do its first write before any claim.
      UPDATE public.donation_saga_outbox SET fee_extras = v_quote
      WHERE id = v_outbox_id;
    END IF;

    IF v_case <> 'legacy' THEN
      SELECT to_jsonb(o) INTO v_before FROM public.donation_saga_outbox o
      WHERE id = v_outbox_id;
      FOR i IN 1..6 LOOP
        v_result := public.claim_donation_saga_event_with_fee_quote(
          v_outbox_id, v_lock_id, v_other_quote);
        IF v_result IS DISTINCT FROM '{"claimed":false,"fee_quote_conflict":true}'::jsonb THEN
          RAISE EXCEPTION 'Different fee quote must reject before claim: %', v_result;
        END IF;
      END LOOP;
      SELECT to_jsonb(o) INTO v_after FROM public.donation_saga_outbox o
      WHERE id = v_outbox_id;
      IF v_after IS DISTINCT FROM v_before THEN
        RAISE EXCEPTION 'Conflicts must not consume attempts, change locks or record failures';
      END IF;

      v_rejected := FALSE;
      BEGIN
        UPDATE public.donation_saga_outbox SET fee_extras = v_other_quote
        WHERE id = v_outbox_id;
      EXCEPTION WHEN check_violation THEN v_rejected := TRUE;
      END;
      IF NOT v_rejected THEN RAISE EXCEPTION 'An existing quote must be immutable before claim'; END IF;
    END IF;

    -- Equal quotes ignore unrelated keys. Empty legacy extras stay absent.
    v_result := public.claim_donation_saga_event_with_fee_quote(
      v_outbox_id, v_lock_id, v_quote);
    IF (v_result->>'claimed')::boolean IS DISTINCT FROM TRUE
       OR (v_result->>'attempt_count')::integer <> 1 THEN
      RAISE EXCEPTION 'Matching quote or legacy absence must claim normally: %', v_result;
    END IF;

    UPDATE public.donation_saga_outbox SET fee_extras = fee_extras WHERE id = v_outbox_id;
    v_rejected := FALSE;
    BEGIN
      -- Simulates the stale ID-only write after the atomic replay claim.
      UPDATE public.donation_saga_outbox SET fee_extras = v_other_quote
      WHERE id = v_outbox_id;
    EXCEPTION WHEN check_violation THEN v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'A claimed row must reject changed fee extras'; END IF;

    IF v_case = 'legacy' THEN
      v_rejected := FALSE;
      BEGIN
        PERFORM public.complete_donation_saga_event(
          v_outbox_id, gen_random_uuid(), 'pi_fee_replay_proof', NULL, '{}'::jsonb);
      EXCEPTION WHEN no_data_found THEN v_rejected := TRUE;
      END;
      IF NOT v_rejected THEN RAISE EXCEPTION 'Fixture completion must fail for the wrong lock'; END IF;
      PERFORM public.record_donation_saga_failure(
        v_outbox_id, v_lock_id, 'completion_failed', 'proof completion failed', 60, 5, v_actor_id);
      UPDATE public.donation_saga_outbox SET next_attempt_at = NOW() WHERE id = v_outbox_id;
      v_rejected := FALSE;
      BEGIN
        UPDATE public.donation_saga_outbox SET fee_extras = v_quote WHERE id = v_outbox_id;
      EXCEPTION WHEN check_violation THEN v_rejected := TRUE;
      END;
      IF NOT v_rejected THEN RAISE EXCEPTION 'Legacy absence must remain immutable after failed completion'; END IF;
      v_lock_id := gen_random_uuid();
      -- Existing non-HTTP callers remain compatible with the original RPC.
      v_result := public.claim_donation_saga_event(v_outbox_id, v_lock_id);
      IF (v_result->>'claimed')::boolean IS DISTINCT FROM TRUE THEN
        RAISE EXCEPTION 'Existing claim RPC must still recover legacy events';
      END IF;
    END IF;

    PERFORM public.complete_donation_saga_event(
      v_outbox_id, v_lock_id, 'pi_fee_replay_proof_' || v_case, NULL, '{}'::jsonb);
    UPDATE public.donation_saga_outbox SET fee_extras = fee_extras WHERE id = v_outbox_id;
    IF v_case = 'legacy' AND EXISTS (
      SELECT 1 FROM public.donation_saga_outbox
      WHERE id = v_outbox_id AND fee_extras <> '{}'::jsonb
    ) THEN RAISE EXCEPTION 'Legacy completion must preserve absent fee extras'; END IF;
    v_rejected := FALSE;
    BEGIN
      UPDATE public.donation_saga_outbox SET fee_extras = v_other_quote WHERE id = v_outbox_id;
    EXCEPTION WHEN check_violation THEN v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Completed events must preserve provider fee parameters'; END IF;
  END LOOP;
END;
$proof$;

ROLLBACK;
