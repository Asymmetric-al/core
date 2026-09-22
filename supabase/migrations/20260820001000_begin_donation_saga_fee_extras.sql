-- Write quoted Gift fee extras in the same INSERT that creates the outbox
-- row and sets next_attempt_at. A follow-up UPDATE after begin can lose a
-- race to claim_due_donation_saga_events, which would recover with '{}' and
-- bind an ACH-priced donation to automatic_payment_methods (card).
-- Callers that omit p_fee_extras keep '{}'::jsonb.
--
-- Rollback:
--   DROP FUNCTION IF EXISTS public.begin_donation_saga(UUID, UUID, UUID, BIGINT, TEXT, UUID, UUID, TEXT, TEXT, TEXT, JSONB);
--   then restore the 10-arg signature from
--   20260226100000_atomic_mutation_rpcs_and_donation_saga.sql.

DROP FUNCTION IF EXISTS public.begin_donation_saga(UUID, UUID, UUID, BIGINT, TEXT, UUID, UUID, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.begin_donation_saga(
  p_tenant_id UUID,
  p_profile_id UUID,
  p_actor_user_id UUID,
  p_amount BIGINT,
  p_currency TEXT DEFAULT 'usd',
  p_missionary_id UUID DEFAULT NULL,
  p_fund_id UUID DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_fee_extras JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path TO public
AS $function$
DECLARE
  v_outbox_id UUID;
  v_donation_id UUID;
  v_donor_id UUID;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero'
      USING ERRCODE = '22023';
  END IF;

  IF btrim(COALESCE(p_idempotency_key, '')) = '' THEN
    RAISE EXCEPTION 'Idempotency key is required'
      USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended(p_tenant_id::text || ':' || p_idempotency_key, 0)
  );

  SELECT id, donation_id
  INTO v_outbox_id, v_donation_id
  FROM public.donation_saga_outbox
  WHERE tenant_id = p_tenant_id
    AND idempotency_key = p_idempotency_key
  LIMIT 1;

  IF v_outbox_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'replayed', true,
      'outbox_id', v_outbox_id,
      'donation_id', v_donation_id
    );
  END IF;

  IF p_missionary_id IS NOT NULL THEN
    PERFORM 1
    FROM public.missionaries
    WHERE id = p_missionary_id
      AND tenant_id = p_tenant_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Missionary not found'
        USING ERRCODE = 'P0002';
    END IF;
  END IF;

  IF p_fund_id IS NOT NULL THEN
    PERFORM 1
    FROM public.funds
    WHERE id = p_fund_id
      AND tenant_id = p_tenant_id
      AND is_active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Fund not found or inactive'
        USING ERRCODE = 'P0002';
    END IF;
  END IF;

  SELECT id
  INTO v_donor_id
  FROM public.donors
  WHERE tenant_id = p_tenant_id
    AND profile_id = p_profile_id
  LIMIT 1;

  IF v_donor_id IS NULL THEN
    INSERT INTO public.donors (
      tenant_id,
      profile_id,
      giving_preferences,
      total_given
    )
    VALUES (
      p_tenant_id,
      p_profile_id,
      '{}'::jsonb,
      0
    )
    RETURNING id INTO v_donor_id;
  END IF;

  INSERT INTO public.donations (
    tenant_id,
    donor_id,
    missionary_id,
    fund_id,
    amount,
    currency,
    status
  )
  VALUES (
    p_tenant_id,
    v_donor_id,
    p_missionary_id,
    p_fund_id,
    p_amount,
    lower(COALESCE(p_currency, 'usd')),
    'processing'
  )
  RETURNING id INTO v_donation_id;

  INSERT INTO public.audit_logs (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  )
  VALUES (
    p_tenant_id,
    p_actor_user_id,
    'donation_initiated',
    'donation',
    v_donation_id::TEXT,
    jsonb_build_object(
      'amount', p_amount,
      'currency', lower(COALESCE(p_currency, 'usd')),
      'missionaryId', p_missionary_id,
      'fundId', p_fund_id,
      'idempotencyKey', p_idempotency_key
    ),
    p_ip_address,
    p_user_agent
  );

  INSERT INTO public.donation_saga_outbox (
    tenant_id,
    donation_id,
    donor_id,
    missionary_id,
    fund_id,
    amount,
    currency,
    idempotency_key,
    status,
    next_attempt_at,
    fee_extras
  )
  VALUES (
    p_tenant_id,
    v_donation_id,
    v_donor_id,
    p_missionary_id,
    p_fund_id,
    p_amount,
    lower(COALESCE(p_currency, 'usd')),
    p_idempotency_key,
    'pending',
    NOW(),
    COALESCE(p_fee_extras, '{}'::jsonb)
  )
  RETURNING id INTO v_outbox_id;

  RETURN jsonb_build_object(
    'replayed', false,
    'outbox_id', v_outbox_id,
    'donation_id', v_donation_id,
    'donor_id', v_donor_id
  );
EXCEPTION
  WHEN unique_violation THEN
    SELECT id, donation_id
    INTO v_outbox_id, v_donation_id
    FROM public.donation_saga_outbox
    WHERE tenant_id = p_tenant_id
      AND idempotency_key = p_idempotency_key
    LIMIT 1;

    IF v_outbox_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'replayed', true,
        'outbox_id', v_outbox_id,
        'donation_id', v_donation_id
      );
    END IF;

    RAISE;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.begin_donation_saga(UUID, UUID, UUID, BIGINT, TEXT, UUID, UUID, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.begin_donation_saga(UUID, UUID, UUID, BIGINT, TEXT, UUID, UUID, TEXT, TEXT, TEXT, JSONB) TO service_role;
