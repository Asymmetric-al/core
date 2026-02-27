-- Atomic mutation RPCs + donation saga outbox
-- This migration is additive: legacy counter RPCs remain available.

ALTER TABLE public.posts
    ADD COLUMN IF NOT EXISTS fires_count INTEGER NOT NULL DEFAULT 0;

UPDATE public.posts
SET fires_count = 0
WHERE fires_count IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'posts_like_count_nonnegative'
      AND conrelid = 'public.posts'::regclass
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_like_count_nonnegative CHECK (like_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'posts_prayer_count_nonnegative'
      AND conrelid = 'public.posts'::regclass
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_prayer_count_nonnegative CHECK (prayer_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'posts_comment_count_nonnegative'
      AND conrelid = 'public.posts'::regclass
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_comment_count_nonnegative CHECK (comment_count >= 0);
  END IF;

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

CREATE OR REPLACE FUNCTION public.decrement_post_comment_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.atomic_like_post(
  p_post_id UUID,
  p_user_id UUID,
  p_tenant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_inserted INTEGER := 0;
  v_like_count INTEGER := 0;
BEGIN
  PERFORM 1
  FROM public.posts
  WHERE id = p_post_id
    AND tenant_id = p_tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found'
      USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.post_likes (post_id, user_id)
  VALUES (p_post_id, p_user_id)
  ON CONFLICT (post_id, user_id) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted > 0 THEN
    UPDATE public.posts
    SET like_count = COALESCE(like_count, 0) + 1,
        updated_at = NOW()
    WHERE id = p_post_id
    RETURNING like_count INTO v_like_count;
  ELSE
    SELECT COALESCE(like_count, 0)
    INTO v_like_count
    FROM public.posts
    WHERE id = p_post_id;
  END IF;

  RETURN jsonb_build_object(
    'applied', v_inserted > 0,
    'duplicate', v_inserted = 0,
    'like_count', v_like_count
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.atomic_unlike_post(
  p_post_id UUID,
  p_user_id UUID,
  p_tenant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_deleted INTEGER := 0;
  v_like_count INTEGER := 0;
BEGIN
  PERFORM 1
  FROM public.posts
  WHERE id = p_post_id
    AND tenant_id = p_tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found'
      USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM public.post_likes
  WHERE post_id = p_post_id
    AND user_id = p_user_id;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  IF v_deleted > 0 THEN
    UPDATE public.posts
    SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0),
        updated_at = NOW()
    WHERE id = p_post_id
    RETURNING like_count INTO v_like_count;
  ELSE
    SELECT COALESCE(like_count, 0)
    INTO v_like_count
    FROM public.posts
    WHERE id = p_post_id;
  END IF;

  RETURN jsonb_build_object(
    'applied', v_deleted > 0,
    'like_count', v_like_count
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.atomic_pray_for_post(
  p_post_id UUID,
  p_user_id UUID,
  p_tenant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_inserted INTEGER := 0;
  v_prayer_count INTEGER := 0;
BEGIN
  PERFORM 1
  FROM public.posts
  WHERE id = p_post_id
    AND tenant_id = p_tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found'
      USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.post_prayers (post_id, user_id)
  VALUES (p_post_id, p_user_id)
  ON CONFLICT (post_id, user_id) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted > 0 THEN
    UPDATE public.posts
    SET prayer_count = COALESCE(prayer_count, 0) + 1,
        updated_at = NOW()
    WHERE id = p_post_id
    RETURNING prayer_count INTO v_prayer_count;
  ELSE
    SELECT COALESCE(prayer_count, 0)
    INTO v_prayer_count
    FROM public.posts
    WHERE id = p_post_id;
  END IF;

  RETURN jsonb_build_object(
    'applied', v_inserted > 0,
    'duplicate', v_inserted = 0,
    'prayer_count', v_prayer_count
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.atomic_unpray_for_post(
  p_post_id UUID,
  p_user_id UUID,
  p_tenant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_deleted INTEGER := 0;
  v_prayer_count INTEGER := 0;
BEGIN
  PERFORM 1
  FROM public.posts
  WHERE id = p_post_id
    AND tenant_id = p_tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found'
      USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM public.post_prayers
  WHERE post_id = p_post_id
    AND user_id = p_user_id;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  IF v_deleted > 0 THEN
    UPDATE public.posts
    SET prayer_count = GREATEST(COALESCE(prayer_count, 0) - 1, 0),
        updated_at = NOW()
    WHERE id = p_post_id
    RETURNING prayer_count INTO v_prayer_count;
  ELSE
    SELECT COALESCE(prayer_count, 0)
    INTO v_prayer_count
    FROM public.posts
    WHERE id = p_post_id;
  END IF;

  RETURN jsonb_build_object(
    'applied', v_deleted > 0,
    'prayer_count', v_prayer_count
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.atomic_fire_post(
  p_post_id UUID,
  p_user_id UUID,
  p_tenant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_inserted INTEGER := 0;
  v_fires_count INTEGER := 0;
BEGIN
  PERFORM 1
  FROM public.posts
  WHERE id = p_post_id
    AND tenant_id = p_tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found'
      USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.post_fires (post_id, user_id)
  VALUES (p_post_id, p_user_id)
  ON CONFLICT (post_id, user_id) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted > 0 THEN
    UPDATE public.posts
    SET fires_count = COALESCE(fires_count, 0) + 1,
        updated_at = NOW()
    WHERE id = p_post_id
    RETURNING fires_count INTO v_fires_count;
  ELSE
    SELECT COALESCE(fires_count, 0)
    INTO v_fires_count
    FROM public.posts
    WHERE id = p_post_id;
  END IF;

  RETURN jsonb_build_object(
    'applied', v_inserted > 0,
    'duplicate', v_inserted = 0,
    'fires_count', v_fires_count
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.atomic_unfire_post(
  p_post_id UUID,
  p_user_id UUID,
  p_tenant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_deleted INTEGER := 0;
  v_fires_count INTEGER := 0;
BEGIN
  PERFORM 1
  FROM public.posts
  WHERE id = p_post_id
    AND tenant_id = p_tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found'
      USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM public.post_fires
  WHERE post_id = p_post_id
    AND user_id = p_user_id;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  IF v_deleted > 0 THEN
    UPDATE public.posts
    SET fires_count = GREATEST(COALESCE(fires_count, 0) - 1, 0),
        updated_at = NOW()
    WHERE id = p_post_id
    RETURNING fires_count INTO v_fires_count;
  ELSE
    SELECT COALESCE(fires_count, 0)
    INTO v_fires_count
    FROM public.posts
    WHERE id = p_post_id;
  END IF;

  RETURN jsonb_build_object(
    'applied', v_deleted > 0,
    'fires_count', v_fires_count
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.atomic_add_post_comment(
  p_post_id UUID,
  p_user_id UUID,
  p_tenant_id UUID,
  p_content TEXT,
  p_parent_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_comment_id UUID;
  v_comment_count INTEGER := 0;
  v_trimmed_content TEXT := btrim(COALESCE(p_content, ''));
BEGIN
  IF v_trimmed_content = '' THEN
    RAISE EXCEPTION 'Comment content cannot be empty'
      USING ERRCODE = '22023';
  END IF;

  PERFORM 1
  FROM public.posts
  WHERE id = p_post_id
    AND tenant_id = p_tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF p_parent_id IS NOT NULL THEN
    PERFORM 1
    FROM public.post_comments
    WHERE id = p_parent_id
      AND post_id = p_post_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Parent comment not found'
        USING ERRCODE = 'P0002';
    END IF;
  END IF;

  INSERT INTO public.post_comments (post_id, user_id, parent_id, content)
  VALUES (p_post_id, p_user_id, p_parent_id, v_trimmed_content)
  RETURNING id INTO v_comment_id;

  UPDATE public.posts
  SET comment_count = COALESCE(comment_count, 0) + 1,
      updated_at = NOW()
  WHERE id = p_post_id
  RETURNING comment_count INTO v_comment_count;

  RETURN jsonb_build_object(
    'applied', true,
    'comment_id', v_comment_id,
    'comment_count', v_comment_count
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.atomic_delete_comment_thread(
  p_comment_id UUID,
  p_tenant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
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
    AND p.tenant_id = p_tenant_id;

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

  RETURN jsonb_build_object(
    'deleted_count', v_deleted_count,
    'post_id', v_post_id,
    'comment_count', v_comment_count
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.atomic_update_post_with_audit(
  p_post_id UUID,
  p_tenant_id UUID,
  p_actor_user_id UUID,
  p_updates JSONB,
  p_audit_action TEXT DEFAULT 'post_updated',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_post_id UUID;
BEGIN
  UPDATE public.posts
  SET content = CASE WHEN p_updates ? 'content' THEN p_updates->>'content' ELSE content END,
      media = CASE WHEN p_updates ? 'media' THEN COALESCE(p_updates->'media', '[]'::jsonb) ELSE media END,
      status = CASE WHEN p_updates ? 'status' THEN p_updates->>'status' ELSE status END,
      visibility = CASE WHEN p_updates ? 'visibility' THEN p_updates->>'visibility' ELSE visibility END,
      post_type = CASE WHEN p_updates ? 'post_type' THEN p_updates->>'post_type' ELSE post_type END,
      updated_at = NOW()
  WHERE id = p_post_id
    AND tenant_id = p_tenant_id
  RETURNING id INTO v_post_id;

  IF v_post_id IS NULL THEN
    RAISE EXCEPTION 'Post not found'
      USING ERRCODE = 'P0002';
  END IF;

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
    p_audit_action,
    'post',
    v_post_id::TEXT,
    COALESCE(p_updates, '{}'::jsonb),
    p_ip_address,
    p_user_agent
  );

  RETURN jsonb_build_object('post_id', v_post_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.atomic_delete_post_with_audit(
  p_post_id UUID,
  p_tenant_id UUID,
  p_actor_user_id UUID,
  p_audit_action TEXT DEFAULT 'post_deleted',
  p_details JSONB DEFAULT '{}'::jsonb,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_deleted_id UUID;
BEGIN
  DELETE FROM public.posts
  WHERE id = p_post_id
    AND tenant_id = p_tenant_id
  RETURNING id INTO v_deleted_id;

  IF v_deleted_id IS NULL THEN
    RAISE EXCEPTION 'Post not found'
      USING ERRCODE = 'P0002';
  END IF;

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
    p_audit_action,
    'post',
    v_deleted_id::TEXT,
    COALESCE(p_details, '{}'::jsonb),
    p_ip_address,
    p_user_agent
  );

  RETURN jsonb_build_object('post_id', v_deleted_id, 'deleted', true);
END;
$function$;

CREATE OR REPLACE FUNCTION public.atomic_update_profile_with_audit(
  p_profile_id UUID,
  p_tenant_id UUID,
  p_actor_user_id UUID,
  p_updates JSONB,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_profile_id UUID;
BEGIN
  UPDATE public.profiles
  SET first_name = CASE WHEN p_updates ? 'first_name' THEN p_updates->>'first_name' ELSE first_name END,
      last_name = CASE WHEN p_updates ? 'last_name' THEN p_updates->>'last_name' ELSE last_name END,
      avatar_url = CASE WHEN p_updates ? 'avatar_url' THEN p_updates->>'avatar_url' ELSE avatar_url END,
      updated_at = NOW()
  WHERE id = p_profile_id
    AND tenant_id = p_tenant_id
  RETURNING id INTO v_profile_id;

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found'
      USING ERRCODE = 'P0002';
  END IF;

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
    'profile_updated',
    'profile',
    v_profile_id::TEXT,
    COALESCE(p_updates, '{}'::jsonb),
    p_ip_address,
    p_user_agent
  );

  RETURN jsonb_build_object('profile_id', v_profile_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.atomic_create_post_with_audit(
  p_tenant_id UUID,
  p_missionary_id UUID,
  p_content TEXT,
  p_media JSONB DEFAULT '[]'::jsonb,
  p_actor_user_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_post_id UUID;
BEGIN
  INSERT INTO public.posts (
    tenant_id,
    missionary_id,
    content,
    media,
    like_count,
    prayer_count,
    comment_count,
    fires_count
  )
  VALUES (
    p_tenant_id,
    p_missionary_id,
    p_content,
    COALESCE(p_media, '[]'::jsonb),
    0,
    0,
    0,
    0
  )
  RETURNING id INTO v_post_id;

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
    'post_created',
    'post',
    v_post_id::TEXT,
    jsonb_build_object('content', p_content),
    p_ip_address,
    p_user_agent
  );

  RETURN jsonb_build_object('post_id', v_post_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.atomic_update_missionary_with_audit(
  p_profile_id UUID,
  p_tenant_id UUID,
  p_actor_user_id UUID,
  p_updates JSONB,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_missionary_id UUID;
BEGIN
  UPDATE public.missionaries
  SET bio = CASE WHEN p_updates ? 'bio' THEN p_updates->>'bio' ELSE bio END,
      mission_field = CASE WHEN p_updates ? 'mission_field' THEN p_updates->>'mission_field' ELSE mission_field END,
      funding_goal = CASE
        WHEN p_updates ? 'funding_goal' THEN (p_updates->>'funding_goal')::BIGINT
        ELSE funding_goal
      END,
      updated_at = NOW()
  WHERE profile_id = p_profile_id
    AND tenant_id = p_tenant_id
  RETURNING id INTO v_missionary_id;

  IF v_missionary_id IS NULL THEN
    RAISE EXCEPTION 'Missionary not found'
      USING ERRCODE = 'P0002';
  END IF;

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
    'update',
    'missionary',
    v_missionary_id::TEXT,
    COALESCE(p_updates, '{}'::jsonb),
    p_ip_address,
    p_user_agent
  );

  RETURN jsonb_build_object('missionary_id', v_missionary_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.atomic_update_user_role_with_audit(
  p_profile_id UUID,
  p_tenant_id UUID,
  p_actor_user_id UUID,
  p_new_role TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_old_role TEXT;
  v_profile_exists UUID;
BEGIN
  SELECT id, role
  INTO v_profile_exists, v_old_role
  FROM public.profiles
  WHERE id = p_profile_id
    AND tenant_id = p_tenant_id;

  IF v_profile_exists IS NULL THEN
    RAISE EXCEPTION 'User not found'
      USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.profiles
  SET role = p_new_role,
      updated_at = NOW()
  WHERE id = p_profile_id
    AND tenant_id = p_tenant_id;

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
    'role_change',
    'profile',
    p_profile_id::TEXT,
    jsonb_build_object('oldRole', v_old_role, 'newRole', p_new_role),
    p_ip_address,
    p_user_agent
  );

  RETURN jsonb_build_object('profile_id', p_profile_id, 'role', p_new_role);
END;
$function$;

CREATE OR REPLACE FUNCTION public.atomic_create_donation_with_audit(
  p_tenant_id UUID,
  p_donor_profile_id UUID,
  p_actor_user_id UUID,
  p_missionary_id UUID,
  p_amount BIGINT,
  p_currency TEXT DEFAULT 'usd',
  p_fund_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT 'pending',
  p_audit_action TEXT DEFAULT 'donation_created',
  p_details JSONB DEFAULT '{}'::jsonb,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_donor_id UUID;
  v_donation_id UUID;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero'
      USING ERRCODE = '22023';
  END IF;

  SELECT id
  INTO v_donor_id
  FROM public.donors
  WHERE tenant_id = p_tenant_id
    AND profile_id = p_donor_profile_id
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
      p_donor_profile_id,
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
    p_status
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
    p_audit_action,
    'donation',
    v_donation_id::TEXT,
    COALESCE(p_details, '{}'::jsonb),
    p_ip_address,
    p_user_agent
  );

  RETURN jsonb_build_object(
    'donation_id', v_donation_id,
    'donor_id', v_donor_id
  );
END;
$function$;

CREATE TABLE IF NOT EXISTS public.donation_saga_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  missionary_id UUID REFERENCES public.missionaries(id) ON DELETE SET NULL,
  fund_id UUID REFERENCES public.funds(id) ON DELETE SET NULL,
  amount BIGINT NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  idempotency_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processor_lock_id UUID,
  processor_locked_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_payment_intent_id TEXT,
  gateway_response JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_error_code TEXT,
  last_error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT donation_saga_outbox_status_check
    CHECK (status IN ('pending', 'processing', 'failed', 'completed', 'dead_letter')),
  CONSTRAINT donation_saga_outbox_idempotency_unique
    UNIQUE (idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_donation_saga_outbox_status_next_attempt
  ON public.donation_saga_outbox (status, next_attempt_at);

CREATE INDEX IF NOT EXISTS idx_donation_saga_outbox_donation
  ON public.donation_saga_outbox (donation_id);

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

  SELECT id, donation_id
  INTO v_outbox_id, v_donation_id
  FROM public.donation_saga_outbox
  WHERE idempotency_key = p_idempotency_key
  LIMIT 1;

  IF v_outbox_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'replayed', true,
      'outbox_id', v_outbox_id,
      'donation_id', v_donation_id
    );
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
    'pending'
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
    status
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
    'pending'
  )
  RETURNING id INTO v_outbox_id;

  RETURN jsonb_build_object(
    'replayed', false,
    'outbox_id', v_outbox_id,
    'donation_id', v_donation_id,
    'donor_id', v_donor_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.claim_donation_saga_event(
  p_outbox_id UUID,
  p_lock_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_row public.donation_saga_outbox%ROWTYPE;
BEGIN
  UPDATE public.donation_saga_outbox
  SET status = 'processing',
      attempt_count = attempt_count + 1,
      processor_lock_id = p_lock_id,
      processor_locked_at = NOW(),
      updated_at = NOW()
  WHERE id = p_outbox_id
    AND status IN ('pending', 'failed')
    AND next_attempt_at <= NOW()
  RETURNING *
  INTO v_row;

  IF v_row.id IS NULL THEN
    RETURN jsonb_build_object('claimed', false);
  END IF;

  RETURN jsonb_build_object(
    'claimed', true,
    'outbox_id', v_row.id,
    'donation_id', v_row.donation_id,
    'donor_id', v_row.donor_id,
    'tenant_id', v_row.tenant_id,
    'missionary_id', v_row.missionary_id,
    'fund_id', v_row.fund_id,
    'amount', v_row.amount,
    'currency', v_row.currency,
    'attempt_count', v_row.attempt_count,
    'idempotency_key', v_row.idempotency_key,
    'stripe_customer_id', v_row.stripe_customer_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.claim_due_donation_saga_events(
  p_limit INTEGER,
  p_lock_id UUID
)
RETURNS TABLE (
  outbox_id UUID,
  donation_id UUID,
  donor_id UUID,
  tenant_id UUID,
  missionary_id UUID,
  fund_id UUID,
  amount BIGINT,
  currency TEXT,
  attempt_count INTEGER,
  idempotency_key TEXT,
  stripe_customer_id TEXT
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT d.id
    FROM public.donation_saga_outbox d
    WHERE d.status IN ('pending', 'failed')
      AND d.next_attempt_at <= NOW()
    ORDER BY d.created_at ASC
    LIMIT GREATEST(COALESCE(p_limit, 1), 1)
    FOR UPDATE SKIP LOCKED
  ),
  claimed AS (
    UPDATE public.donation_saga_outbox d
    SET status = 'processing',
        attempt_count = d.attempt_count + 1,
        processor_lock_id = p_lock_id,
        processor_locked_at = NOW(),
        updated_at = NOW()
    FROM candidates c
    WHERE d.id = c.id
    RETURNING d.*
  )
  SELECT
    c.id,
    c.donation_id,
    c.donor_id,
    c.tenant_id,
    c.missionary_id,
    c.fund_id,
    c.amount,
    c.currency,
    c.attempt_count,
    c.idempotency_key,
    c.stripe_customer_id
  FROM claimed c;
END;
$function$;

CREATE OR REPLACE FUNCTION public.complete_donation_saga_event(
  p_outbox_id UUID,
  p_lock_id UUID,
  p_stripe_payment_intent_id TEXT,
  p_stripe_customer_id TEXT DEFAULT NULL,
  p_gateway_response JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_row public.donation_saga_outbox%ROWTYPE;
BEGIN
  SELECT *
  INTO v_row
  FROM public.donation_saga_outbox
  WHERE id = p_outbox_id
    AND status = 'processing'
    AND processor_lock_id = p_lock_id
  FOR UPDATE;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'Outbox event is not locked for completion'
      USING ERRCODE = 'P0002';
  END IF;

  IF p_stripe_customer_id IS NOT NULL AND btrim(p_stripe_customer_id) <> '' THEN
    UPDATE public.donors
    SET stripe_customer_id = COALESCE(stripe_customer_id, p_stripe_customer_id),
        updated_at = NOW()
    WHERE id = v_row.donor_id;
  END IF;

  UPDATE public.donations
  SET stripe_payment_intent_id = p_stripe_payment_intent_id,
      status = 'pending',
      processed_at = NOW(),
      error_code = NULL,
      error_message = NULL,
      updated_at = NOW()
  WHERE id = v_row.donation_id;

  UPDATE public.donation_saga_outbox
  SET status = 'completed',
      stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id),
      stripe_payment_intent_id = p_stripe_payment_intent_id,
      gateway_response = COALESCE(p_gateway_response, '{}'::jsonb),
      processor_lock_id = NULL,
      processor_locked_at = NULL,
      last_error_code = NULL,
      last_error_message = NULL,
      updated_at = NOW()
  WHERE id = p_outbox_id;

  RETURN jsonb_build_object(
    'completed', true,
    'outbox_id', p_outbox_id,
    'donation_id', v_row.donation_id,
    'stripe_payment_intent_id', p_stripe_payment_intent_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.record_donation_saga_failure(
  p_outbox_id UUID,
  p_lock_id UUID,
  p_error_code TEXT,
  p_error_message TEXT,
  p_retry_delay_seconds INTEGER DEFAULT 60,
  p_dead_letter_after INTEGER DEFAULT 5
)
RETURNS JSONB
LANGUAGE plpgsql
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
  END IF;

  RETURN jsonb_build_object(
    'outbox_id', p_outbox_id,
    'status', v_next_status,
    'dead_letter', v_dead_letter
  );
END;
$function$;
