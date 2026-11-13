-- Missionaries can publish ministry updates from their app (POST /api/posts),
-- not just edit seeded ones.
--
-- atomic_create_post_with_audit only wrote content and media, so a new post
-- took the column defaults (status 'published', visibility 'public',
-- post_type 'Update') and setting anything else needed a second call. A draft
-- or partners-only update would have been public in between. It now takes the
-- title, type, visibility and status and writes them with the post and its
-- audit row in one statement. The new parameters come last with defaults, so
-- existing named-argument callers keep working unchanged.
--
-- atomic_update_post_with_audit also learns `title`, so editing an update can
-- change it.
--
-- Values are validated in the API (packages/api/src/schemas/posts.ts); these
-- functions stay service-role only, exactly as before.
--
-- Rollback: supabase/migrations/rollback_20261110120000_post_create_with_attributes.sql

BEGIN;

DROP FUNCTION IF EXISTS public.atomic_create_post_with_audit(UUID, UUID, TEXT, JSONB, UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.atomic_create_post_with_audit(
  p_tenant_id UUID,
  p_missionary_id UUID,
  p_content TEXT,
  p_media JSONB DEFAULT '[]'::jsonb,
  p_actor_user_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_title TEXT DEFAULT NULL,
  p_post_type TEXT DEFAULT 'Update',
  p_visibility TEXT DEFAULT 'public',
  p_status TEXT DEFAULT 'published'
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
  v_post_id UUID;
BEGIN
  INSERT INTO public.posts (
    tenant_id,
    missionary_id,
    title,
    content,
    media,
    post_type,
    visibility,
    status,
    like_count,
    prayer_count,
    comment_count,
    fires_count
  )
  VALUES (
    p_tenant_id,
    p_missionary_id,
    p_title,
    p_content,
    COALESCE(p_media, '[]'::jsonb),
    COALESCE(p_post_type, 'Update'),
    COALESCE(p_visibility, 'public'),
    COALESCE(p_status, 'published'),
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
    jsonb_build_object(
      'content', p_content,
      'title', p_title,
      'post_type', COALESCE(p_post_type, 'Update'),
      'visibility', COALESCE(p_visibility, 'public'),
      'status', COALESCE(p_status, 'published')
    ),
    p_ip_address,
    p_user_agent
  );

  RETURN jsonb_build_object('post_id', v_post_id);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.atomic_create_post_with_audit(UUID, UUID, TEXT, JSONB, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.atomic_create_post_with_audit(UUID, UUID, TEXT, JSONB, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

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
