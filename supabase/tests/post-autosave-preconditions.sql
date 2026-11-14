-- Run against a migrated, seeded local database. All fixture writes roll back.
BEGIN;
DO $test$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_post_id UUID := gen_random_uuid();
  v_revision TIMESTAMPTZ;
  v_status TEXT;
  v_content TEXT;
BEGIN
  SELECT * INTO STRICT v_profile FROM public.profiles LIMIT 1;
  INSERT INTO public.posts (id, tenant_id, missionary_id, content, post_type, visibility, status, updated_at)
  VALUES (v_post_id, v_profile.tenant_id, v_profile.id, 'Original draft', 'Update', 'public', 'draft', '2026-01-01T00:00:00Z');

  PERFORM public.atomic_update_post_with_audit(v_post_id, v_profile.tenant_id, v_profile.user_id,
    '{"content":"Published text","status":"published"}'::jsonb);
  BEGIN
    PERFORM public.atomic_update_post_with_audit(v_post_id, v_profile.tenant_id, v_profile.user_id,
      '{"content":"Stale autosave","status":"draft","expected_status":"draft","expected_updated_at":"2026-01-01T00:00:00Z"}'::jsonb);
    RAISE EXCEPTION 'Stale autosave overwrote a published update';
  EXCEPTION WHEN serialization_failure THEN NULL;
  END;
  SELECT status, content INTO v_status, v_content FROM public.posts WHERE id = v_post_id;
  ASSERT v_status = 'published' AND v_content = 'Published text', 'Publication was not preserved';

  UPDATE public.posts SET status = 'draft' WHERE id = v_post_id RETURNING updated_at INTO v_revision;
  BEGIN
    PERFORM public.atomic_update_post_with_audit(v_post_id, v_profile.tenant_id, v_profile.user_id,
      '{"content":"Old revision","status":"draft","expected_status":"draft","expected_updated_at":"2025-01-01T00:00:00Z"}'::jsonb);
    RAISE EXCEPTION 'Stale revision overwrote a newer draft';
  EXCEPTION WHEN serialization_failure THEN NULL;
  END;
  PERFORM public.atomic_update_post_with_audit(v_post_id, v_profile.tenant_id, v_profile.user_id,
    jsonb_build_object('content', 'Latest draft', 'status', 'draft', 'expected_status', 'draft', 'expected_updated_at', v_revision));
  SELECT content INTO v_content FROM public.posts WHERE id = v_post_id;
  ASSERT v_content = 'Latest draft', 'Current revision could not save';
END;
$test$;
ROLLBACK;
