BEGIN;

-- Check revision and draft status in the same UPDATE that writes the post.
-- The optional controls preserve the existing RPC signature and older callers.
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
SET search_path = ''
AS $function$
DECLARE
  v_post_id UUID;
BEGIN
  UPDATE public.posts
  SET title = CASE WHEN p_updates ? 'title' THEN p_updates->>'title' ELSE title END,
      content = CASE WHEN p_updates ? 'content' THEN p_updates->>'content' ELSE content END,
      media = CASE WHEN p_updates ? 'media' THEN COALESCE(p_updates->'media', '[]'::jsonb) ELSE media END,
      status = CASE WHEN p_updates ? 'status' THEN p_updates->>'status' ELSE status END,
      visibility = CASE WHEN p_updates ? 'visibility' THEN p_updates->>'visibility' ELSE visibility END,
      post_type = CASE WHEN p_updates ? 'post_type' THEN p_updates->>'post_type' ELSE post_type END,
      updated_at = NOW()
  WHERE id = p_post_id
    AND tenant_id = p_tenant_id
    AND (NOT (p_updates ? 'expected_status') OR status = p_updates->>'expected_status')
    AND (NOT (p_updates ? 'expected_updated_at') OR updated_at IS NOT DISTINCT FROM (p_updates->>'expected_updated_at')::timestamptz)
  RETURNING id INTO v_post_id;

  IF v_post_id IS NULL THEN
    IF EXISTS (SELECT 1 FROM public.posts WHERE id = p_post_id AND tenant_id = p_tenant_id) THEN
      RAISE EXCEPTION 'Post changed since it was loaded' USING ERRCODE = '40001';
    END IF;
    RAISE EXCEPTION 'Post not found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details, ip_address, user_agent)
  VALUES (p_tenant_id, p_actor_user_id, p_audit_action, 'post', v_post_id::TEXT,
    COALESCE(p_updates, '{}'::jsonb), p_ip_address, p_user_agent);

  RETURN jsonb_build_object('post_id', v_post_id);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.atomic_update_post_with_audit(UUID, UUID, UUID, JSONB, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.atomic_update_post_with_audit(UUID, UUID, UUID, JSONB, TEXT, TEXT, TEXT) TO service_role;

COMMIT;
