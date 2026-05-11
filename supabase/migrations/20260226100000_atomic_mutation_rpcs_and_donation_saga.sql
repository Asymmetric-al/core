-- Incremental hardening on top of the existing atomic RPC + outbox migration.
-- Keeps function names stable for already-updated API/GraphQL callers.

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS fires_count INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'posts_fires_count_nonnegative'
      AND conrelid = 'public.posts'::regclass
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_fires_count_nonnegative CHECK (fires_count >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'donation_saga_outbox_idempotency_unique'
      AND conrelid = 'public.donation_saga_outbox'::regclass
  ) THEN
    ALTER TABLE public.donation_saga_outbox
      DROP CONSTRAINT donation_saga_outbox_idempotency_unique;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'donation_saga_outbox_tenant_idempotency_unique'
      AND conrelid = 'public.donation_saga_outbox'::regclass
  ) THEN
    ALTER TABLE public.donation_saga_outbox
      ADD CONSTRAINT donation_saga_outbox_tenant_idempotency_unique
      UNIQUE (tenant_id, idempotency_key);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.decrement_post_comment_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SET search_path TO public
AS $function$
BEGIN
  UPDATE public.posts
  SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.atomic_delete_comment_thread(
  p_comment_id UUID,
  p_tenant_id UUID,
  p_actor_user_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path TO public
AS $function$
DECLARE
  v_post_id UUID;
  v_deleted_count INTEGER := 0;
  v_comment_count INTEGER := 0;
BEGIN
  SELECT c.post_id
  INTO v_post_id
  FROM public.post_comments c
  JOIN public.posts p ON p.id = c.post_id
  WHERE c.id = p_comment_id
    AND p.tenant_id = p_tenant_id
  FOR UPDATE OF p;

  IF v_post_id IS NULL THEN
    RAISE EXCEPTION 'Comment not found'
      USING ERRCODE = 'P0002';
  END IF;

  WITH deleted AS (
    DELETE FROM public.post_comments
    WHERE id = p_comment_id
       OR parent_id = p_comment_id
    RETURNING 1
  )
  SELECT COUNT(*)::INTEGER
  INTO v_deleted_count
  FROM deleted;

  UPDATE public.posts
  SET comment_count = GREATEST(COALESCE(comment_count, 0) - v_deleted_count, 0),
      updated_at = NOW()
  WHERE id = v_post_id
  RETURNING comment_count INTO v_comment_count;

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
    'comment_deleted_by_admin',
    'comment',
    p_comment_id::TEXT,
    jsonb_build_object(
      'postId', v_post_id,
      'deletedCount', v_deleted_count
    ),
    p_ip_address,
    p_user_agent
  );

  RETURN jsonb_build_object(
    'deleted_count', v_deleted_count,
    'post_id', v_post_id,
    'comment_count', v_comment_count
  );
END;
$function$;

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
  p_user_agent TEXT DEFAULT NULL
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
    next_attempt_at
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
    NOW()
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

-- Server-only RPC privilege hardening for mutation and outbox functions.
-- These functions are intended to be called only from trusted server code
-- using the service-role client, not directly from browser-accessible roles.
REVOKE EXECUTE ON FUNCTION public.decrement_post_comment_count(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_post_comment_count(UUID) TO service_role;

REVOKE EXECUTE ON FUNCTION public.atomic_delete_comment_thread(UUID, UUID, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.atomic_delete_comment_thread(UUID, UUID, UUID, TEXT, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.begin_donation_saga(UUID, UUID, UUID, BIGINT, TEXT, UUID, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.begin_donation_saga(UUID, UUID, UUID, BIGINT, TEXT, UUID, UUID, TEXT, TEXT, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.record_donation_saga_failure(
  p_outbox_id UUID,
  p_lock_id UUID,
  p_error_code TEXT,
  p_error_message TEXT,
  p_retry_delay_seconds INTEGER DEFAULT 60,
  p_dead_letter_after INTEGER DEFAULT 5,
  p_actor_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path TO public
AS $function$
DECLARE
  v_row public.donation_saga_outbox%ROWTYPE;
  v_dead_letter BOOLEAN;
  v_next_status TEXT;
BEGIN
  SELECT *
  INTO v_row
  FROM public.donation_saga_outbox
  WHERE id = p_outbox_id
    AND status = 'processing'
    AND processor_lock_id = p_lock_id
  FOR UPDATE;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'Outbox event is not locked for failure'
      USING ERRCODE = 'P0002';
  END IF;

  v_dead_letter := v_row.attempt_count >= GREATEST(COALESCE(p_dead_letter_after, 5), 1);
  v_next_status := CASE WHEN v_dead_letter THEN 'dead_letter' ELSE 'failed' END;

  UPDATE public.donation_saga_outbox
  SET status = v_next_status,
      next_attempt_at = CASE
        WHEN v_dead_letter THEN NOW()
        ELSE NOW() + make_interval(secs => GREATEST(COALESCE(p_retry_delay_seconds, 60), 5))
      END,
      last_error_code = p_error_code,
      last_error_message = p_error_message,
      processor_lock_id = NULL,
      processor_locked_at = NULL,
      updated_at = NOW()
  WHERE id = p_outbox_id;

  IF v_dead_letter THEN
    UPDATE public.donations
    SET status = 'failed',
        failed_at = NOW(),
        error_code = p_error_code,
        error_message = p_error_message,
        updated_at = NOW()
    WHERE id = v_row.donation_id;

    INSERT INTO public.audit_logs (
      tenant_id,
      user_id,
      action,
      resource_type,
      resource_id,
      details
    )
    VALUES (
      v_row.tenant_id,
      p_actor_user_id,
      'donation_failed',
      'donation',
      v_row.donation_id::TEXT,
      jsonb_build_object(
        'errorCode', p_error_code,
        'errorMessage', p_error_message,
        'attemptCount', v_row.attempt_count
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'outbox_id', p_outbox_id,
    'status', v_next_status,
    'dead_letter', v_dead_letter
  );
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.record_donation_saga_failure(UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_donation_saga_failure(UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, UUID) TO service_role;
