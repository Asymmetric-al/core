-- AL-2677 (WP4b part 1; rulings W4b-R2, W4b-R12, W4b-R15, W4b-R17):
-- 1. Grant tenant_guard minimum table/column privileges and tenant_guard_isolation
--    policies on the four member_care_* tables and public.missionaries
--    (SELECT (id, tenant_id), UPDATE (manual_attention) only; no SELECT on
--    public.tenants or public.profiles).
-- 2. Grant EXECUTE on authz.request_tenant_id() to tenant_guard and add two
--    narrow postgres-owned SECURITY DEFINER helpers in private for tenant_guard
--    only: private.share_lock_tenant(uuid) and private.profile_display_name(uuid).
-- 3. Add six tenant_guard human commands gated on care.access with mandatory
--    request-tenant binding, global lock ordering (tenants FOR SHARE ->
--    authz.memberships FOR SHARE -> missionaries FOR SHARE/UPDATE -> target row
--    FOR UPDATE), post-lock authority-first re-checks, SQL-side validation,
--    and zero writes to audit_logs or crm_command_logs.
-- 4. Add six thin public SECURITY INVOKER wrappers taking no p_tenant_id arg,
--    owned by postgres and granted EXECUTE to authenticated only.
--
-- Down (run by hand, in one transaction):
--   DROP FUNCTION IF EXISTS
--     public.create_care_thread_post(UUID, TEXT),
--     public.create_care_private_note(UUID, TEXT),
--     public.upsert_care_goal(UUID, TEXT, TEXT, DATE, UUID),
--     public.log_care_activity(UUID, TEXT, TEXT),
--     public.upsert_care_requirement(UUID, TEXT, INTEGER, TEXT, UUID),
--     public.set_manual_attention_flag(UUID, BOOLEAN),
--     tenant_guard.create_care_thread_post(UUID, UUID, TEXT),
--     tenant_guard.create_care_private_note(UUID, UUID, TEXT),
--     tenant_guard.upsert_care_goal(UUID, UUID, TEXT, TEXT, DATE, UUID),
--     tenant_guard.log_care_activity(UUID, UUID, TEXT, TEXT),
--     tenant_guard.upsert_care_requirement(UUID, UUID, TEXT, INTEGER, TEXT, UUID),
--     tenant_guard.set_manual_attention_flag(UUID, UUID, BOOLEAN),
--     private.profile_display_name(UUID);
--   -- Note: private.share_lock_tenant(UUID) is also created identically by
--   -- 20261123020000_media_custody.sql; do not drop it while media custody
--   -- remains applied.
--   REVOKE EXECUTE ON FUNCTION authz.request_tenant_id() FROM tenant_guard;
--   DROP POLICY IF EXISTS tenant_guard_isolation ON public.member_care_activities;
--   DROP POLICY IF EXISTS tenant_guard_isolation ON public.member_care_private_notes;
--   DROP POLICY IF EXISTS tenant_guard_isolation ON public.member_care_goals;
--   DROP POLICY IF EXISTS tenant_guard_isolation ON public.member_care_requirements;
--   DROP POLICY IF EXISTS tenant_guard_isolation ON public.missionaries;
--   REVOKE ALL ON TABLE public.member_care_activities FROM tenant_guard;
--   REVOKE ALL ON TABLE public.member_care_private_notes FROM tenant_guard;
--   REVOKE ALL ON TABLE public.member_care_goals FROM tenant_guard;
--   REVOKE ALL ON TABLE public.member_care_requirements FROM tenant_guard;
--   REVOKE ALL ON TABLE public.missionaries FROM tenant_guard;

BEGIN;

SET LOCAL lock_timeout = '5s';

-- 1. Least privileges and isolation policies for tenant_guard.
GRANT SELECT, INSERT ON TABLE public.member_care_activities TO tenant_guard;
DROP POLICY IF EXISTS tenant_guard_isolation ON public.member_care_activities;
CREATE POLICY tenant_guard_isolation
  ON public.member_care_activities
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

GRANT SELECT, INSERT ON TABLE public.member_care_private_notes TO tenant_guard;
DROP POLICY IF EXISTS tenant_guard_isolation ON public.member_care_private_notes;
CREATE POLICY tenant_guard_isolation
  ON public.member_care_private_notes
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

GRANT SELECT, INSERT, UPDATE ON TABLE public.member_care_goals TO tenant_guard;
DROP POLICY IF EXISTS tenant_guard_isolation ON public.member_care_goals;
CREATE POLICY tenant_guard_isolation
  ON public.member_care_goals
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

GRANT SELECT, INSERT, UPDATE ON TABLE public.member_care_requirements TO tenant_guard;
DROP POLICY IF EXISTS tenant_guard_isolation ON public.member_care_requirements;
CREATE POLICY tenant_guard_isolation
  ON public.member_care_requirements
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

GRANT SELECT (id, tenant_id), UPDATE (manual_attention) ON TABLE public.missionaries TO tenant_guard;
DROP POLICY IF EXISTS tenant_guard_isolation ON public.missionaries;
CREATE POLICY tenant_guard_isolation
  ON public.missionaries
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

-- 2. Narrow request-scope and private helpers for tenant_guard.
GRANT EXECUTE ON FUNCTION authz.request_tenant_id() TO tenant_guard;

CREATE OR REPLACE FUNCTION private.share_lock_tenant(p_tenant_id UUID)
RETURNS TEXT
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT t.status
    FROM public.tenants AS t
   WHERE t.id = p_tenant_id
     FOR SHARE;
$$;

COMMENT ON FUNCTION private.share_lock_tenant(UUID) IS
  'Share-locks a tenant row and returns its current status so tenant_guard commands serialize against concurrent tenant suspension or closure without granting SELECT on public.tenants to tenant_guard. EXECUTE for tenant_guard only.';

ALTER FUNCTION private.share_lock_tenant(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.share_lock_tenant(UUID) FROM PUBLIC, anon, authenticated, service_role, tenant_guard;
GRANT EXECUTE ON FUNCTION private.share_lock_tenant(UUID) TO tenant_guard;

CREATE OR REPLACE FUNCTION private.profile_display_name(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (
      SELECT COALESCE(
        NULLIF(pg_catalog.btrim(p.display_name), ''),
        NULLIF(pg_catalog.btrim(p.full_name), ''),
        NULLIF(pg_catalog.btrim(pg_catalog.concat_ws(' ', p.first_name, p.last_name)), '')
      )
        FROM public.profiles AS p
       WHERE p.user_id = p_user_id
       ORDER BY p.id
       LIMIT 1
    ),
    p_user_id::TEXT
  );
$$;

COMMENT ON FUNCTION private.profile_display_name(UUID) IS
  'Resolves an actor display-name snapshot for care commands without granting '
  'tenant_guard SELECT on public.profiles (AL-2677 WP4b part 1; W4b-R15).';

ALTER FUNCTION private.profile_display_name(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.profile_display_name(UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.profile_display_name(UUID) TO tenant_guard;

-- 3. Six tenant_guard human care commands.

CREATE OR REPLACE FUNCTION tenant_guard.create_care_thread_post(
  p_tenant_id UUID,
  p_personnel_id UUID,
  p_content TEXT
)
RETURNS TABLE (id UUID)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_request_tenant_id UUID;
  v_tenant_status TEXT;
  v_assignment RECORD;
  v_assignment_found BOOLEAN;
  v_missionary_id UUID;
  v_missionary_found BOOLEAN;
  v_author_name TEXT;
  v_created_id UUID;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'care.access');

  BEGIN
    v_request_tenant_id := authz.request_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_request_tenant_id := NULL;
  END;

  IF v_request_tenant_id IS NULL OR v_request_tenant_id IS DISTINCT FROM v_ctx.tenant_id THEN
    RAISE EXCEPTION 'tenant_guard: request tenant scope is required and must match command tenant'
      USING ERRCODE = '42501';
  END IF;

  v_tenant_status := private.share_lock_tenant(v_ctx.tenant_id);

  SELECT m.user_id, m.tenant_id, m.is_active, m.revoked_at
    INTO v_assignment
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.id = v_ctx.assignment_id
     FOR SHARE;
  v_assignment_found := FOUND;

  SELECT ms.id
    INTO v_missionary_id
    FROM public.missionaries AS ms
   WHERE ms.tenant_id = v_ctx.tenant_id
     AND ms.id = p_personnel_id
     FOR SHARE;
  v_missionary_found := FOUND;

  IF v_tenant_status IS DISTINCT FROM 'active'
     OR v_assignment_found IS NOT TRUE
     OR v_assignment.user_id IS DISTINCT FROM v_ctx.actor_id
     OR v_assignment.tenant_id IS DISTINCT FROM v_ctx.tenant_id
     OR v_assignment.is_active IS NOT TRUE
     OR v_assignment.revoked_at IS NOT NULL
     OR ('care.access' = ANY (authz.assignment_capabilities(v_ctx.assignment_id))) IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: care access is not active for this assignment'
      USING ERRCODE = '42501';
  END IF;

  IF p_personnel_id IS NULL
     OR p_content IS NULL
     OR pg_catalog.regexp_replace(p_content, '^[[:space:]]+|[[:space:]]+$', '', 'g') = '' THEN
    RAISE EXCEPTION 'Care thread content is required.'
      USING ERRCODE = '22023';
  END IF;

  IF v_missionary_found IS NOT TRUE THEN
    RAISE EXCEPTION 'Missionary not found.'
      USING ERRCODE = 'P0002';
  END IF;

  v_author_name := private.profile_display_name(v_ctx.actor_id);

  INSERT INTO public.member_care_activities (
    tenant_id,
    missionary_id,
    type,
    title,
    description,
    author_user_id,
    author_name_snapshot,
    occurred_at
  )
  VALUES (
    v_ctx.tenant_id,
    v_missionary_id,
    'pastoral_note',
    'Care thread update',
    p_content,
    v_ctx.actor_id,
    v_author_name,
    pg_catalog.now()
  )
  RETURNING member_care_activities.id INTO v_created_id;

  RETURN QUERY SELECT v_created_id;
END;
$$;

CREATE OR REPLACE FUNCTION tenant_guard.create_care_private_note(
  p_tenant_id UUID,
  p_personnel_id UUID,
  p_content TEXT
)
RETURNS TABLE (id UUID)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_request_tenant_id UUID;
  v_tenant_status TEXT;
  v_assignment RECORD;
  v_assignment_found BOOLEAN;
  v_missionary_id UUID;
  v_missionary_found BOOLEAN;
  v_author_name TEXT;
  v_created_id UUID;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'care.access');

  BEGIN
    v_request_tenant_id := authz.request_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_request_tenant_id := NULL;
  END;

  IF v_request_tenant_id IS NULL OR v_request_tenant_id IS DISTINCT FROM v_ctx.tenant_id THEN
    RAISE EXCEPTION 'tenant_guard: request tenant scope is required and must match command tenant'
      USING ERRCODE = '42501';
  END IF;

  v_tenant_status := private.share_lock_tenant(v_ctx.tenant_id);

  SELECT m.user_id, m.tenant_id, m.is_active, m.revoked_at
    INTO v_assignment
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.id = v_ctx.assignment_id
     FOR SHARE;
  v_assignment_found := FOUND;

  SELECT ms.id
    INTO v_missionary_id
    FROM public.missionaries AS ms
   WHERE ms.tenant_id = v_ctx.tenant_id
     AND ms.id = p_personnel_id
     FOR SHARE;
  v_missionary_found := FOUND;

  IF v_tenant_status IS DISTINCT FROM 'active'
     OR v_assignment_found IS NOT TRUE
     OR v_assignment.user_id IS DISTINCT FROM v_ctx.actor_id
     OR v_assignment.tenant_id IS DISTINCT FROM v_ctx.tenant_id
     OR v_assignment.is_active IS NOT TRUE
     OR v_assignment.revoked_at IS NOT NULL
     OR ('care.access' = ANY (authz.assignment_capabilities(v_ctx.assignment_id))) IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: care access is not active for this assignment'
      USING ERRCODE = '42501';
  END IF;

  IF p_personnel_id IS NULL
     OR p_content IS NULL
     OR pg_catalog.regexp_replace(p_content, '^[[:space:]]+|[[:space:]]+$', '', 'g') = '' THEN
    RAISE EXCEPTION 'Private note content is required.'
      USING ERRCODE = '22023';
  END IF;

  IF v_missionary_found IS NOT TRUE THEN
    RAISE EXCEPTION 'Missionary not found.'
      USING ERRCODE = 'P0002';
  END IF;

  v_author_name := private.profile_display_name(v_ctx.actor_id);

  INSERT INTO public.member_care_private_notes (
    tenant_id,
    missionary_id,
    author_user_id,
    author_name_snapshot,
    content
  )
  VALUES (
    v_ctx.tenant_id,
    v_missionary_id,
    v_ctx.actor_id,
    v_author_name,
    p_content
  )
  RETURNING member_care_private_notes.id INTO v_created_id;

  RETURN QUERY SELECT v_created_id;
END;
$$;

CREATE OR REPLACE FUNCTION tenant_guard.upsert_care_goal(
  p_tenant_id UUID,
  p_personnel_id UUID,
  p_title TEXT,
  p_status TEXT,
  p_target_date DATE DEFAULT NULL,
  p_goal_id UUID DEFAULT NULL
)
RETURNS TABLE (id UUID)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_request_tenant_id UUID;
  v_tenant_status TEXT;
  v_assignment RECORD;
  v_assignment_found BOOLEAN;
  v_missionary_id UUID;
  v_missionary_found BOOLEAN;
  v_target_id UUID;
  v_target_found BOOLEAN;
  v_result_id UUID;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'care.access');

  BEGIN
    v_request_tenant_id := authz.request_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_request_tenant_id := NULL;
  END;

  IF v_request_tenant_id IS NULL OR v_request_tenant_id IS DISTINCT FROM v_ctx.tenant_id THEN
    RAISE EXCEPTION 'tenant_guard: request tenant scope is required and must match command tenant'
      USING ERRCODE = '42501';
  END IF;

  v_tenant_status := private.share_lock_tenant(v_ctx.tenant_id);

  SELECT m.user_id, m.tenant_id, m.is_active, m.revoked_at
    INTO v_assignment
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.id = v_ctx.assignment_id
     FOR SHARE;
  v_assignment_found := FOUND;

  SELECT ms.id
    INTO v_missionary_id
    FROM public.missionaries AS ms
   WHERE ms.tenant_id = v_ctx.tenant_id
     AND ms.id = p_personnel_id
     FOR SHARE;
  v_missionary_found := FOUND;

  v_target_found := false;
  IF p_goal_id IS NOT NULL THEN
    SELECT g.id
      INTO v_target_id
      FROM public.member_care_goals AS g
     WHERE g.tenant_id = v_ctx.tenant_id
       AND g.id = p_goal_id
       AND g.missionary_id = p_personnel_id
       FOR UPDATE;
    v_target_found := FOUND;
  END IF;

  IF v_tenant_status IS DISTINCT FROM 'active'
     OR v_assignment_found IS NOT TRUE
     OR v_assignment.user_id IS DISTINCT FROM v_ctx.actor_id
     OR v_assignment.tenant_id IS DISTINCT FROM v_ctx.tenant_id
     OR v_assignment.is_active IS NOT TRUE
     OR v_assignment.revoked_at IS NOT NULL
     OR ('care.access' = ANY (authz.assignment_capabilities(v_ctx.assignment_id))) IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: care access is not active for this assignment'
      USING ERRCODE = '42501';
  END IF;

  IF p_personnel_id IS NULL
     OR p_title IS NULL
     OR pg_catalog.regexp_replace(p_title, '^[[:space:]]+|[[:space:]]+$', '', 'g') = ''
     OR p_status IS NULL
     OR p_status NOT IN ('pending', 'active', 'completed') THEN
    RAISE EXCEPTION 'Invalid care goal payload.'
      USING ERRCODE = '22023';
  END IF;

  IF v_missionary_found IS NOT TRUE THEN
    RAISE EXCEPTION 'Missionary not found.'
      USING ERRCODE = 'P0002';
  END IF;

  IF p_goal_id IS NOT NULL THEN
    IF v_target_found IS NOT TRUE THEN
      RAISE EXCEPTION 'Care goal not found.'
        USING ERRCODE = 'P0002';
    END IF;

    UPDATE public.member_care_goals AS g
       SET title = p_title,
           status = p_status,
           target_date = p_target_date,
           updated_by = v_ctx.actor_id,
           updated_at = pg_catalog.now()
     WHERE g.tenant_id = v_ctx.tenant_id
       AND g.id = v_target_id
       AND g.missionary_id = v_missionary_id
    RETURNING g.id INTO v_result_id;
  ELSE
    INSERT INTO public.member_care_goals (
      tenant_id,
      missionary_id,
      title,
      status,
      target_date,
      updated_by
    )
    VALUES (
      v_ctx.tenant_id,
      v_missionary_id,
      p_title,
      p_status,
      p_target_date,
      v_ctx.actor_id
    )
    RETURNING member_care_goals.id INTO v_result_id;
  END IF;

  RETURN QUERY SELECT v_result_id;
END;
$$;

CREATE OR REPLACE FUNCTION tenant_guard.log_care_activity(
  p_tenant_id UUID,
  p_personnel_id UUID,
  p_type TEXT,
  p_content TEXT
)
RETURNS TABLE (id UUID)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_request_tenant_id UUID;
  v_tenant_status TEXT;
  v_assignment RECORD;
  v_assignment_found BOOLEAN;
  v_missionary_id UUID;
  v_missionary_found BOOLEAN;
  v_title TEXT;
  v_author_name TEXT;
  v_created_id UUID;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'care.access');

  BEGIN
    v_request_tenant_id := authz.request_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_request_tenant_id := NULL;
  END;

  IF v_request_tenant_id IS NULL OR v_request_tenant_id IS DISTINCT FROM v_ctx.tenant_id THEN
    RAISE EXCEPTION 'tenant_guard: request tenant scope is required and must match command tenant'
      USING ERRCODE = '42501';
  END IF;

  v_tenant_status := private.share_lock_tenant(v_ctx.tenant_id);

  SELECT m.user_id, m.tenant_id, m.is_active, m.revoked_at
    INTO v_assignment
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.id = v_ctx.assignment_id
     FOR SHARE;
  v_assignment_found := FOUND;

  SELECT ms.id
    INTO v_missionary_id
    FROM public.missionaries AS ms
   WHERE ms.tenant_id = v_ctx.tenant_id
     AND ms.id = p_personnel_id
     FOR SHARE;
  v_missionary_found := FOUND;

  IF v_tenant_status IS DISTINCT FROM 'active'
     OR v_assignment_found IS NOT TRUE
     OR v_assignment.user_id IS DISTINCT FROM v_ctx.actor_id
     OR v_assignment.tenant_id IS DISTINCT FROM v_ctx.tenant_id
     OR v_assignment.is_active IS NOT TRUE
     OR v_assignment.revoked_at IS NOT NULL
     OR ('care.access' = ANY (authz.assignment_capabilities(v_ctx.assignment_id))) IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: care access is not active for this assignment'
      USING ERRCODE = '42501';
  END IF;

  v_title := CASE p_type
    WHEN 'video_call' THEN 'Video Call'
    WHEN 'in_person_visit' THEN 'In-Person Visit'
    WHEN 'check_in' THEN 'Check-in'
    WHEN 'pastoral_note' THEN 'Pastoral Note'
    WHEN 'care_plan_update' THEN 'Care Plan Update'
    WHEN 'crisis_intervention' THEN 'Crisis Intervention'
    WHEN 'birthday' THEN 'Birthday'
    WHEN 'prayer_request' THEN 'Prayer Request'
    ELSE NULL
  END;

  IF p_personnel_id IS NULL
     OR v_title IS NULL
     OR p_content IS NULL
     OR pg_catalog.regexp_replace(p_content, '^[[:space:]]+|[[:space:]]+$', '', 'g') = '' THEN
    RAISE EXCEPTION 'Invalid care activity payload.'
      USING ERRCODE = '22023';
  END IF;

  IF v_missionary_found IS NOT TRUE THEN
    RAISE EXCEPTION 'Missionary not found.'
      USING ERRCODE = 'P0002';
  END IF;

  v_author_name := private.profile_display_name(v_ctx.actor_id);

  INSERT INTO public.member_care_activities (
    tenant_id,
    missionary_id,
    type,
    title,
    description,
    author_user_id,
    author_name_snapshot,
    occurred_at
  )
  VALUES (
    v_ctx.tenant_id,
    v_missionary_id,
    p_type,
    v_title,
    p_content,
    v_ctx.actor_id,
    v_author_name,
    pg_catalog.now()
  )
  RETURNING member_care_activities.id INTO v_created_id;

  RETURN QUERY SELECT v_created_id;
END;
$$;

CREATE OR REPLACE FUNCTION tenant_guard.upsert_care_requirement(
  p_tenant_id UUID,
  p_personnel_id UUID,
  p_activity_type TEXT,
  p_interval_days INTEGER,
  p_notes TEXT DEFAULT NULL,
  p_requirement_id UUID DEFAULT NULL
)
RETURNS TABLE (id UUID)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_request_tenant_id UUID;
  v_tenant_status TEXT;
  v_assignment RECORD;
  v_assignment_found BOOLEAN;
  v_missionary_id UUID;
  v_missionary_found BOOLEAN;
  v_target_id UUID;
  v_target_found BOOLEAN;
  v_result_id UUID;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'care.access');

  BEGIN
    v_request_tenant_id := authz.request_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_request_tenant_id := NULL;
  END;

  IF v_request_tenant_id IS NULL OR v_request_tenant_id IS DISTINCT FROM v_ctx.tenant_id THEN
    RAISE EXCEPTION 'tenant_guard: request tenant scope is required and must match command tenant'
      USING ERRCODE = '42501';
  END IF;

  v_tenant_status := private.share_lock_tenant(v_ctx.tenant_id);

  SELECT m.user_id, m.tenant_id, m.is_active, m.revoked_at
    INTO v_assignment
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.id = v_ctx.assignment_id
     FOR SHARE;
  v_assignment_found := FOUND;

  SELECT ms.id
    INTO v_missionary_id
    FROM public.missionaries AS ms
   WHERE ms.tenant_id = v_ctx.tenant_id
     AND ms.id = p_personnel_id
     FOR SHARE;
  v_missionary_found := FOUND;

  v_target_found := false;
  IF p_requirement_id IS NOT NULL THEN
    SELECT r.id
      INTO v_target_id
      FROM public.member_care_requirements AS r
     WHERE r.tenant_id = v_ctx.tenant_id
       AND r.id = p_requirement_id
       AND r.missionary_id = p_personnel_id
       FOR UPDATE;
    v_target_found := FOUND;
  END IF;

  IF v_tenant_status IS DISTINCT FROM 'active'
     OR v_assignment_found IS NOT TRUE
     OR v_assignment.user_id IS DISTINCT FROM v_ctx.actor_id
     OR v_assignment.tenant_id IS DISTINCT FROM v_ctx.tenant_id
     OR v_assignment.is_active IS NOT TRUE
     OR v_assignment.revoked_at IS NOT NULL
     OR ('care.access' = ANY (authz.assignment_capabilities(v_ctx.assignment_id))) IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: care access is not active for this assignment'
      USING ERRCODE = '42501';
  END IF;

  IF p_personnel_id IS NULL
     OR p_activity_type IS NULL
     OR p_activity_type NOT IN (
       'video_call',
       'in_person_visit',
       'check_in',
       'pastoral_note',
       'care_plan_update',
       'crisis_intervention',
       'birthday',
       'prayer_request'
     )
     OR p_interval_days IS NULL
     OR p_interval_days <= 0 THEN
    RAISE EXCEPTION 'Invalid care requirement payload.'
      USING ERRCODE = '22023';
  END IF;

  IF v_missionary_found IS NOT TRUE THEN
    RAISE EXCEPTION 'Missionary not found.'
      USING ERRCODE = 'P0002';
  END IF;

  IF p_requirement_id IS NOT NULL THEN
    IF v_target_found IS NOT TRUE THEN
      RAISE EXCEPTION 'Care requirement not found.'
        USING ERRCODE = 'P0002';
    END IF;

    UPDATE public.member_care_requirements AS r
       SET activity_type = p_activity_type,
           interval_days = p_interval_days,
           notes = p_notes,
           updated_by = v_ctx.actor_id,
           updated_at = pg_catalog.now()
     WHERE r.tenant_id = v_ctx.tenant_id
       AND r.id = v_target_id
       AND r.missionary_id = v_missionary_id
    RETURNING r.id INTO v_result_id;
  ELSE
    INSERT INTO public.member_care_requirements (
      tenant_id,
      missionary_id,
      activity_type,
      interval_days,
      notes,
      updated_by
    )
    VALUES (
      v_ctx.tenant_id,
      v_missionary_id,
      p_activity_type,
      p_interval_days,
      p_notes,
      v_ctx.actor_id
    )
    RETURNING member_care_requirements.id INTO v_result_id;
  END IF;

  RETURN QUERY SELECT v_result_id;
END;
$$;

CREATE OR REPLACE FUNCTION tenant_guard.set_manual_attention_flag(
  p_tenant_id UUID,
  p_personnel_id UUID,
  p_manual_attention BOOLEAN
)
RETURNS TABLE (id UUID)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_request_tenant_id UUID;
  v_tenant_status TEXT;
  v_assignment RECORD;
  v_assignment_found BOOLEAN;
  v_missionary_id UUID;
  v_missionary_found BOOLEAN;
  v_updated_id UUID;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'care.access');

  BEGIN
    v_request_tenant_id := authz.request_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_request_tenant_id := NULL;
  END;

  IF v_request_tenant_id IS NULL OR v_request_tenant_id IS DISTINCT FROM v_ctx.tenant_id THEN
    RAISE EXCEPTION 'tenant_guard: request tenant scope is required and must match command tenant'
      USING ERRCODE = '42501';
  END IF;

  v_tenant_status := private.share_lock_tenant(v_ctx.tenant_id);

  SELECT m.user_id, m.tenant_id, m.is_active, m.revoked_at
    INTO v_assignment
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.id = v_ctx.assignment_id
     FOR SHARE;
  v_assignment_found := FOUND;

  SELECT ms.id
    INTO v_missionary_id
    FROM public.missionaries AS ms
   WHERE ms.tenant_id = v_ctx.tenant_id
     AND ms.id = p_personnel_id
     FOR UPDATE;
  v_missionary_found := FOUND;

  IF v_tenant_status IS DISTINCT FROM 'active'
     OR v_assignment_found IS NOT TRUE
     OR v_assignment.user_id IS DISTINCT FROM v_ctx.actor_id
     OR v_assignment.tenant_id IS DISTINCT FROM v_ctx.tenant_id
     OR v_assignment.is_active IS NOT TRUE
     OR v_assignment.revoked_at IS NOT NULL
     OR ('care.access' = ANY (authz.assignment_capabilities(v_ctx.assignment_id))) IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: care access is not active for this assignment'
      USING ERRCODE = '42501';
  END IF;

  IF p_personnel_id IS NULL OR p_manual_attention IS NULL THEN
    RAISE EXCEPTION 'Invalid manual attention payload.'
      USING ERRCODE = '22023';
  END IF;

  IF v_missionary_found IS NOT TRUE THEN
    RAISE EXCEPTION 'Missionary not found.'
      USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.missionaries AS ms
     SET manual_attention = p_manual_attention
   WHERE ms.tenant_id = v_ctx.tenant_id
     AND ms.id = v_missionary_id
  RETURNING ms.id INTO v_updated_id;

  RETURN QUERY SELECT v_updated_id;
END;
$$;

REVOKE ALL ON FUNCTION tenant_guard.create_care_thread_post(UUID, UUID, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.create_care_private_note(UUID, UUID, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.upsert_care_goal(UUID, UUID, TEXT, TEXT, DATE, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.log_care_activity(UUID, UUID, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.upsert_care_requirement(UUID, UUID, TEXT, INTEGER, TEXT, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.set_manual_attention_flag(UUID, UUID, BOOLEAN)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION tenant_guard.create_care_thread_post(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION tenant_guard.create_care_private_note(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION tenant_guard.upsert_care_goal(UUID, UUID, TEXT, TEXT, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION tenant_guard.log_care_activity(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION tenant_guard.upsert_care_requirement(UUID, UUID, TEXT, INTEGER, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION tenant_guard.set_manual_attention_flag(UUID, UUID, BOOLEAN) TO authenticated;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.create_care_thread_post(UUID, UUID, TEXT) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.create_care_private_note(UUID, UUID, TEXT) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.upsert_care_goal(UUID, UUID, TEXT, TEXT, DATE, UUID) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.log_care_activity(UUID, UUID, TEXT, TEXT) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.upsert_care_requirement(UUID, UUID, TEXT, INTEGER, TEXT, UUID) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.set_manual_attention_flag(UUID, UUID, BOOLEAN) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

-- 4. Six thin public SECURITY INVOKER wrappers (no p_tenant_id argument).

CREATE OR REPLACE FUNCTION public.create_care_thread_post(
  p_personnel_id UUID,
  p_content TEXT
)
RETURNS TABLE (id UUID)
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  BEGIN
    v_tenant_id := authz.current_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_tenant_id := NULL;
  END;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Member care writes require an active tenant assignment.'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT r.id
      FROM tenant_guard.create_care_thread_post(v_tenant_id, p_personnel_id, p_content) AS r;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_care_private_note(
  p_personnel_id UUID,
  p_content TEXT
)
RETURNS TABLE (id UUID)
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  BEGIN
    v_tenant_id := authz.current_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_tenant_id := NULL;
  END;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Member care writes require an active tenant assignment.'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT r.id
      FROM tenant_guard.create_care_private_note(v_tenant_id, p_personnel_id, p_content) AS r;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_care_goal(
  p_personnel_id UUID,
  p_title TEXT,
  p_status TEXT DEFAULT 'pending',
  p_target_date DATE DEFAULT NULL,
  p_goal_id UUID DEFAULT NULL
)
RETURNS TABLE (id UUID)
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  BEGIN
    v_tenant_id := authz.current_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_tenant_id := NULL;
  END;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Member care writes require an active tenant assignment.'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT r.id
      FROM tenant_guard.upsert_care_goal(
        v_tenant_id,
        p_personnel_id,
        p_title,
        p_status,
        p_target_date,
        p_goal_id
      ) AS r;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_care_activity(
  p_personnel_id UUID,
  p_type TEXT,
  p_content TEXT
)
RETURNS TABLE (id UUID)
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  BEGIN
    v_tenant_id := authz.current_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_tenant_id := NULL;
  END;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Member care writes require an active tenant assignment.'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT r.id
      FROM tenant_guard.log_care_activity(v_tenant_id, p_personnel_id, p_type, p_content) AS r;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_care_requirement(
  p_personnel_id UUID,
  p_activity_type TEXT,
  p_interval_days INTEGER,
  p_notes TEXT DEFAULT NULL,
  p_requirement_id UUID DEFAULT NULL
)
RETURNS TABLE (id UUID)
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  BEGIN
    v_tenant_id := authz.current_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_tenant_id := NULL;
  END;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Member care writes require an active tenant assignment.'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT r.id
      FROM tenant_guard.upsert_care_requirement(
        v_tenant_id,
        p_personnel_id,
        p_activity_type,
        p_interval_days,
        p_notes,
        p_requirement_id
      ) AS r;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_manual_attention_flag(
  p_personnel_id UUID,
  p_manual_attention BOOLEAN
)
RETURNS TABLE (id UUID)
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  BEGIN
    v_tenant_id := authz.current_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_tenant_id := NULL;
  END;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Member care writes require an active tenant assignment.'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT r.id
      FROM tenant_guard.set_manual_attention_flag(v_tenant_id, p_personnel_id, p_manual_attention) AS r;
END;
$$;

ALTER FUNCTION public.create_care_thread_post(UUID, TEXT) OWNER TO postgres;
ALTER FUNCTION public.create_care_private_note(UUID, TEXT) OWNER TO postgres;
ALTER FUNCTION public.upsert_care_goal(UUID, TEXT, TEXT, DATE, UUID) OWNER TO postgres;
ALTER FUNCTION public.log_care_activity(UUID, TEXT, TEXT) OWNER TO postgres;
ALTER FUNCTION public.upsert_care_requirement(UUID, TEXT, INTEGER, TEXT, UUID) OWNER TO postgres;
ALTER FUNCTION public.set_manual_attention_flag(UUID, BOOLEAN) OWNER TO postgres;

REVOKE ALL ON FUNCTION public.create_care_thread_post(UUID, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.create_care_private_note(UUID, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.upsert_care_goal(UUID, TEXT, TEXT, DATE, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.log_care_activity(UUID, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.upsert_care_requirement(UUID, TEXT, INTEGER, TEXT, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.set_manual_attention_flag(UUID, BOOLEAN)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.create_care_thread_post(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_care_private_note(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_care_goal(UUID, TEXT, TEXT, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_care_activity(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_care_requirement(UUID, TEXT, INTEGER, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_manual_attention_flag(UUID, BOOLEAN) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
