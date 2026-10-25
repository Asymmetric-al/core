-- #2254 criterion 15 (scope amendment, issue comment 6388667290; option A):
-- overlapping first gifts for one profile must resolve to one donor.
--
-- 20261024140000_identity_email_normalizer_and_donor_keys.sql adds
-- UNIQUE (tenant_id, profile_id) on donors. begin_donation_saga looks the
-- donor up by (tenant_id, profile_id) and inserts one when none exists, so two
-- concurrent first gifts can both miss the lookup; the second insert then hit
-- 23505 on donors_tenant_id_profile_id_key, which the idempotency handler
-- re-raises because the two gifts carry different idempotency keys.
--
-- This redefines the function from
-- 20260820001000_begin_donation_saga_fee_extras.sql verbatim with one change:
-- the donor insert is ON CONFLICT (tenant_id, profile_id) DO NOTHING, and when
-- it returns no row the donor is re-read by (tenant_id, profile_id). Signature,
-- SECURITY INVOKER, search_path and grants are unchanged. The saga still writes
-- no donor email, so the normalized-email key is not involved.
--
-- Rollback: re-apply the CREATE OR REPLACE FUNCTION, REVOKE and GRANT
-- statements from 20260820001000_begin_donation_saga_fee_extras.sql.

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
    ON CONFLICT (tenant_id, profile_id) DO NOTHING
    RETURNING id INTO v_donor_id;

    IF v_donor_id IS NULL THEN
      SELECT id
      INTO v_donor_id
      FROM public.donors
      WHERE tenant_id = p_tenant_id
        AND profile_id = p_profile_id
      LIMIT 1;
    END IF;
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
