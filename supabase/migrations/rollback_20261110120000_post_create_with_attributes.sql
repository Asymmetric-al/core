-- Rollback for 20261110120000_post_create_with_attributes.sql.
-- Restores atomic_create_post_with_audit and atomic_update_post_with_audit
-- exactly as 20260223170000_atomic_rpc_and_donation_saga.sql defines them,
-- with the same service-role-only grants. Pair it with reverting the app
-- commit: POST /api/posts passes the attribute parameters this removes.
-- One transaction, so a failure under plain `psql -f` leaves no partial state.

BEGIN;

DROP FUNCTION IF EXISTS public.atomic_create_post_with_audit(UUID, UUID, TEXT, JSONB, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

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

REVOKE EXECUTE ON FUNCTION public.atomic_create_post_with_audit(UUID, UUID, TEXT, JSONB, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.atomic_create_post_with_audit(UUID, UUID, TEXT, JSONB, UUID, TEXT, TEXT) TO service_role;

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

REVOKE EXECUTE ON FUNCTION public.atomic_update_post_with_audit(UUID, UUID, UUID, JSONB, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.atomic_update_post_with_audit(UUID, UUID, UUID, JSONB, TEXT, TEXT, TEXT) TO service_role;

COMMIT;
