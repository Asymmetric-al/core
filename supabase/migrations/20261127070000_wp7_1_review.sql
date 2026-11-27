-- WP7 pull request 1, "Review" (AL-2680): a missionary's update waits for
-- review, or under the missionary path's "automatic" policy its own write
-- approves it; Mission Control approves, rejects or withdraws with a reason.
--
-- 1. posts gain a review state. Rows that exist start approved (D-08); every
--    insert, and every change of a post's text, title, media, visibility,
--    type or status, sets it again in the same statement: approved when the
--    post's missionary path is set to automatic, submitted otherwise. A post
--    on no missionary path is submitted and waits for a person other than
--    its author (5.4).
-- 2. posts.worker_withheld mirrors the worker's Party in the same
--    transaction as a restriction: restricted, high-risk or do-not-publish
--    withholds every update of the worker from every read but the author's
--    and a reviewer's; a lift serves them again. The flag lets the row
--    security below decide without reading parties.
-- 3. public.publication_policies: one row per missionary path (update,
--    profile); none means review.
-- 4. Commands. The own-ministry lane (Q2: begin_human_command(<tenant>,
--    NULL), a live missionary assignment, the caller's own ministry only):
--    submit_ministry_update, withdraw_own_ministry_update. updates.review:
--    approve_ministry_update (never one's own login), reject_ministry_update
--    and withdraw_ministry_update (each with a reason).
--    safety.restrict_publication: set_publication_policy (with a reason).
--    One audit row per command names the person and the assignment.
-- 5. posts' "tanstack browser read" (any signed-in caller read every
--    tenant's published public posts) narrows to anon, approved, public and
--    not withheld; signed-in reads pass tenant-bound policies only.
--
-- Backfill: every existing post is approved (D-08), its author is the
-- login of its missionary_id profile, and it is withheld where its worker
-- is restricted, high-risk or do-not-publish now. The counts go to the
-- release job's log as one NOTICE (no ids or names).
--
-- Locks, observed in pg_locks just before COMMIT (PostgreSQL 17, on
-- develop's chain and its seed): ACCESS EXCLUSIVE on public.posts and the
-- new public.publication_policies to COMMIT; SHARE ROW EXCLUSIVE on
-- public.parties (its new trigger) and on public.missionaries and
-- public.tenants (the new table's keys): readers pass, writers wait; ROW
-- EXCLUSIVE on public.field_policies; ACCESS SHARE on public.profiles,
-- public.account_links, public.donors and public.follows. lock_timeout
-- stops a run rather than queue it. On that database the backfill set 36
-- posts approved with their authors.
--
-- Recovery. A run lost between its COMMIT and its ledger row stops on the
-- next run at its first ADD COLUMN (42701, review_state exists on posts),
-- rolling back. This file has committed when this read-only check is true:
-- SELECT to_regclass('public.publication_policies') IS NOT NULL. Then
-- follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127070000.
--
-- Down, only after the build that calls the commands is rolled back and
-- 20261127070100 is down, in one transaction: DROP the twelve public and
-- tenant_guard functions below, the triggers posts_review_on_write and
-- parties_withhold_posts and their private functions,
-- private.ministry_update_mode and private.ministry_assignment_withheld,
-- TABLE public.publication_policies and its field_policies rows; DROP
-- POLICY "posts anonymous approved read", "posts tenant read" and
-- tenant_guard_isolation ON public.posts, REVOKE SELECT, INSERT, UPDATE ON
-- public.posts FROM tenant_guard, recreate "tanstack browser read" as in
-- 20260625002117; DROP the seven posts columns; then NOTIFY pgrst, 'reload
-- schema'. Rows written stay until then.

BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE public.posts
  ADD COLUMN review_state TEXT NOT NULL DEFAULT 'approved',
  ADD COLUMN author_user_id UUID,
  ADD COLUMN reviewed_by UUID,
  ADD COLUMN reviewed_by_assignment_id UUID,
  ADD COLUMN reviewed_at TIMESTAMPTZ,
  ADD COLUMN review_reason TEXT,
  ADD COLUMN worker_withheld BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.posts
  ADD CONSTRAINT posts_review_state_check
    CHECK (review_state IN ('submitted', 'approved', 'rejected', 'withdrawn'));

ALTER TABLE public.posts ALTER COLUMN review_state SET DEFAULT 'submitted';

UPDATE public.posts AS post
   SET author_user_id = profile.user_id
  FROM public.profiles AS profile
 WHERE profile.id = post.missionary_id
   AND post.author_user_id IS NULL;

CREATE FUNCTION private.ministry_assignment_withheld(
  p_tenant_id UUID,
  p_ministry_assignment_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    (
      SELECT party.security_level IN ('restricted', 'high_risk')
             OR party.do_not_publish
        FROM public.missionaries AS worker
        JOIN public.parties AS party
          ON party.tenant_id = worker.tenant_id
         AND party.id = worker.party_id
       WHERE worker.tenant_id = p_tenant_id
         AND worker.id = p_ministry_assignment_id
    ),
    false
  );
$$;

ALTER FUNCTION private.ministry_assignment_withheld(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.ministry_assignment_withheld(UUID, UUID) FROM PUBLIC, anon, authenticated, service_role;

UPDATE public.posts AS post
   SET worker_withheld = true
  FROM public.missionaries AS worker
  JOIN public.parties AS party
    ON party.tenant_id = worker.tenant_id
   AND party.id = worker.party_id
 WHERE worker.tenant_id = post.tenant_id
   AND worker.id = post.ministry_assignment_id
   AND (party.security_level IN ('restricted', 'high_risk') OR party.do_not_publish);

DO $counts$
DECLARE
  v_posts BIGINT;
  v_approved BIGINT;
  v_authored BIGINT;
  v_withheld BIGINT;
BEGIN
  SELECT pg_catalog.count(*),
         pg_catalog.count(*) FILTER (WHERE review_state = 'approved'),
         pg_catalog.count(author_user_id),
         pg_catalog.count(*) FILTER (WHERE worker_withheld)
    INTO v_posts, v_approved, v_authored, v_withheld
    FROM public.posts;
  RAISE NOTICE 'wp7_1_review backfill: % posts, % approved, % with an author, % withheld',
    v_posts, v_approved, v_authored, v_withheld;
END;
$counts$;

CREATE TABLE public.publication_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE RESTRICT,
  ministry_assignment_id UUID NOT NULL,
  path TEXT NOT NULL,
  mode TEXT NOT NULL,
  reason TEXT NOT NULL,
  set_by UUID NOT NULL,
  set_by_assignment_id UUID NOT NULL,
  set_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT publication_policies_path_check CHECK (path IN ('update', 'profile')),
  CONSTRAINT publication_policies_mode_check CHECK (mode IN ('review', 'automatic')),
  CONSTRAINT publication_policies_assignment_fkey
    FOREIGN KEY (tenant_id, ministry_assignment_id)
    REFERENCES public.missionaries (tenant_id, id) ON DELETE RESTRICT,
  CONSTRAINT publication_policies_one_per_path
    UNIQUE (tenant_id, ministry_assignment_id, path)
);

ALTER TABLE public.publication_policies OWNER TO postgres;
ALTER TABLE public.publication_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_policies FORCE ROW LEVEL SECURITY;

COMMENT ON TABLE public.publication_policies IS
  'WP7 PR 1 (AL-2680): the publication policy of a missionary path (update, profile); no row means review. Written only by tenant_guard.set_publication_policy (safety.restrict_publication, with a reason).';

REVOKE ALL ON TABLE public.publication_policies FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.publication_policies TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.publication_policies TO tenant_guard;

CREATE POLICY publication_policies_staff_read
  ON public.publication_policies
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'::authz.membership_role))
  );

CREATE POLICY tenant_guard_isolation
  ON public.publication_policies
  FOR ALL
  TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id())
  WITH CHECK (tenant_id = tenant_guard.current_tenant_id());

INSERT INTO public.field_policies (
  record_type,
  field_key,
  surface,
  visible,
  editable,
  exportable,
  sensitivity_category
)
SELECT
  fields.record_type,
  fields.field_key,
  surface,
  surface = 'mission_control',
  false,
  false,
  fields.category::public.field_sensitivity_category
FROM (
  VALUES
    ('publication_policies', 'id', 'internal'),
    ('publication_policies', 'tenant_id', 'internal'),
    ('publication_policies', 'ministry_assignment_id', 'internal'),
    ('publication_policies', 'path', 'internal'),
    ('publication_policies', 'mode', 'internal'),
    ('publication_policies', 'reason', 'care'),
    ('publication_policies', 'set_by', 'internal'),
    ('publication_policies', 'set_by_assignment_id', 'internal'),
    ('publication_policies', 'set_at', 'internal')
) AS fields (record_type, field_key, category)
CROSS JOIN UNNEST(
  ARRAY['mission_control', 'donor', 'missionary', 'public', 'export']
) AS surface;

CREATE FUNCTION private.ministry_update_mode(
  p_tenant_id UUID,
  p_ministry_assignment_id UUID
)
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    (
      SELECT policy.mode
        FROM public.publication_policies AS policy
       WHERE policy.tenant_id = p_tenant_id
         AND policy.ministry_assignment_id = p_ministry_assignment_id
         AND policy.path = 'update'
    ),
    'review'
  );
$$;

ALTER FUNCTION private.ministry_update_mode(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.ministry_update_mode(UUID, UUID) FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION private.posts_review_on_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.worker_withheld := private.ministry_assignment_withheld(NEW.tenant_id, NEW.ministry_assignment_id);
  IF TG_OP = 'INSERT' AND NEW.author_user_id IS NULL THEN
    SELECT profile.user_id
      INTO NEW.author_user_id
      FROM public.profiles AS profile
     WHERE profile.id = NEW.missionary_id;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    NEW.author_user_id := OLD.author_user_id;
  END IF;
  IF TG_OP = 'UPDATE'
     AND NEW.title IS NOT DISTINCT FROM OLD.title
     AND NEW.content IS NOT DISTINCT FROM OLD.content
     AND NEW.media IS NOT DISTINCT FROM OLD.media
     AND NEW.image_url IS NOT DISTINCT FROM OLD.image_url
     AND NEW.visibility IS NOT DISTINCT FROM OLD.visibility
     AND NEW.post_type IS NOT DISTINCT FROM OLD.post_type
     AND NEW.type IS NOT DISTINCT FROM OLD.type
     AND NEW.status IS NOT DISTINCT FROM OLD.status
     AND NEW.tenant_id IS NOT DISTINCT FROM OLD.tenant_id
     AND NEW.ministry_assignment_id IS NOT DISTINCT FROM OLD.ministry_assignment_id
     AND NEW.missionary_id IS NOT DISTINCT FROM OLD.missionary_id THEN
    RETURN NEW;
  END IF;
  IF NEW.ministry_assignment_id IS NOT NULL
     AND private.ministry_update_mode(NEW.tenant_id, NEW.ministry_assignment_id) = 'automatic' THEN
    NEW.review_state := 'approved';
    NEW.reviewed_at := pg_catalog.now();
    NEW.review_reason := 'automatic';
  ELSE
    NEW.review_state := 'submitted';
    NEW.reviewed_at := NULL;
    NEW.review_reason := NULL;
  END IF;
  NEW.reviewed_by := NULL;
  NEW.reviewed_by_assignment_id := NULL;
  RETURN NEW;
END;
$$;

ALTER FUNCTION private.posts_review_on_write() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.posts_review_on_write() FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER posts_review_on_write
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION private.posts_review_on_write();

CREATE FUNCTION private.parties_withhold_posts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.posts AS post
     SET worker_withheld = (NEW.security_level IN ('restricted', 'high_risk') OR NEW.do_not_publish)
   WHERE post.tenant_id = NEW.tenant_id
     AND post.ministry_assignment_id IN (
       SELECT worker.id
         FROM public.missionaries AS worker
        WHERE worker.tenant_id = NEW.tenant_id
          AND worker.party_id = NEW.id
     )
     AND post.worker_withheld IS DISTINCT FROM
         (NEW.security_level IN ('restricted', 'high_risk') OR NEW.do_not_publish);
  RETURN NULL;
END;
$$;

ALTER FUNCTION private.parties_withhold_posts() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.parties_withhold_posts() FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER parties_withhold_posts
  AFTER UPDATE OF security_level, do_not_publish ON public.parties
  FOR EACH ROW EXECUTE FUNCTION private.parties_withhold_posts();

GRANT SELECT, INSERT, UPDATE ON TABLE public.posts TO tenant_guard;

CREATE POLICY tenant_guard_isolation
  ON public.posts
  FOR ALL
  TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id())
  WITH CHECK (tenant_id = tenant_guard.current_tenant_id());

DROP POLICY "tanstack browser read" ON public.posts;

CREATE POLICY "posts anonymous approved read"
  ON public.posts
  FOR SELECT
  TO anon
  USING (
    review_state = 'approved'
    AND status = 'published'
    AND visibility = 'public'
    AND NOT worker_withheld
  );

CREATE POLICY "posts tenant read"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (
      (
        author_user_id = (SELECT authz.current_user_id())
        AND (SELECT authz.assignment_is('missionary'::authz.membership_role))
      )
      OR (
        status = 'published'
        AND (SELECT authz.assignment_holds('updates.review'))
      )
      OR (
        review_state = 'approved'
        AND status = 'published'
        AND NOT worker_withheld
        AND (
          visibility = 'public'
          OR (SELECT authz.assignment_is('staff'::authz.membership_role))
          OR (
            (SELECT authz.assignment_is('donor'::authz.membership_role))
            AND ministry_assignment_id IN (
              SELECT follow.ministry_assignment_id
                FROM public.follows AS follow
               WHERE follow.tenant_id = (SELECT authz.current_tenant_id())
                 AND follow.status = 'approved'
                 AND follow.donor_id IN (
                   SELECT donor.id
                     FROM public.donors AS donor
                    WHERE donor.tenant_id = (SELECT authz.current_tenant_id())
                      AND donor.party_id IN (
                        SELECT link.party_id
                          FROM public.account_links AS link
                         WHERE link.tenant_id = (SELECT authz.current_tenant_id())
                           AND link.user_id = (SELECT authz.current_user_id())
                      )
                 )
            )
          )
        )
      )
    )
  );

CREATE FUNCTION tenant_guard.lock_live_assignment(
  p_ctx tenant_guard.command_context,
  p_capability TEXT
)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_tenant_status TEXT;
  v_assignment RECORD;
  v_assignment_found BOOLEAN;
BEGIN
  v_tenant_status := private.share_lock_tenant(p_ctx.tenant_id);
  SELECT member.user_id, member.tenant_id, member.role::TEXT AS role, member.is_active, member.revoked_at
    INTO v_assignment
    FROM authz.memberships AS member
   WHERE member.tenant_id = p_ctx.tenant_id
     AND member.id = p_ctx.assignment_id
     FOR SHARE;
  v_assignment_found := FOUND;
  IF (v_tenant_status = 'active') IS NOT TRUE
     OR (
       v_assignment_found
       AND v_assignment.user_id = p_ctx.actor_id
       AND v_assignment.tenant_id = p_ctx.tenant_id
       AND v_assignment.is_active
       AND v_assignment.revoked_at IS NULL
     ) IS NOT TRUE
     OR (
       p_capability IS NULL
       AND v_assignment.role IS DISTINCT FROM 'missionary'
     )
     OR (
       p_capability IS NOT NULL
       AND (p_capability = ANY (authz.assignment_capabilities(p_ctx.assignment_id))) IS NOT TRUE
     ) THEN
    RAISE EXCEPTION 'tenant_guard: the caller does not hold the authority this command requires'
      USING ERRCODE = '42501';
  END IF;
END;
$$;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.lock_live_assignment(tenant_guard.command_context, TEXT) OWNER TO tenant_guard;
REVOKE ALL ON FUNCTION tenant_guard.lock_live_assignment(tenant_guard.command_context, TEXT) FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION tenant_guard.own_ministry(p_ctx tenant_guard.command_context)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ministry UUID;
BEGIN
  SELECT worker.id
    INTO v_ministry
    FROM public.missionaries AS worker
    JOIN public.account_links AS link
      ON link.tenant_id = worker.tenant_id
     AND link.party_id = worker.party_id
   WHERE worker.tenant_id = p_ctx.tenant_id
     AND link.user_id = p_ctx.actor_id;
  IF v_ministry IS NULL THEN
    RAISE EXCEPTION 'tenant_guard: the caller has no ministry in this tenant'
      USING ERRCODE = '42501';
  END IF;
  RETURN v_ministry;
END;
$$;

ALTER FUNCTION tenant_guard.own_ministry(tenant_guard.command_context) OWNER TO tenant_guard;
REVOKE ALL ON FUNCTION tenant_guard.own_ministry(tenant_guard.command_context) FROM PUBLIC, anon, authenticated, service_role;


CREATE FUNCTION tenant_guard.submit_ministry_update(
  p_tenant_id UUID,
  p_post_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_media JSONB,
  p_visibility TEXT,
  p_post_type TEXT,
  p_publish BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_ministry UUID;
  v_profile UUID;
  v_post UUID;
  v_state TEXT;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, NULL);
  PERFORM tenant_guard.lock_live_assignment(v_ctx, NULL);
  v_ministry := tenant_guard.own_ministry(v_ctx);
  IF p_visibility IS NULL OR p_visibility NOT IN ('public', 'partners_only') THEN
    RAISE EXCEPTION 'Unknown visibility' USING ERRCODE = '22023';
  END IF;
  IF p_media IS NOT NULL AND pg_catalog.jsonb_typeof(p_media) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Media must be a list' USING ERRCODE = '22023';
  END IF;
  SELECT worker.profile_id
    INTO v_profile
    FROM public.missionaries AS worker
   WHERE worker.tenant_id = v_ctx.tenant_id
     AND worker.id = v_ministry;
  IF p_post_id IS NULL THEN
    INSERT INTO public.posts (
      tenant_id, missionary_id, ministry_assignment_id, author_user_id, title, content,
      media, visibility, post_type, status
    )
    VALUES (
      v_ctx.tenant_id, v_profile, v_ministry, v_ctx.actor_id, p_title, p_content,
      COALESCE(p_media, '[]'::JSONB), p_visibility, COALESCE(p_post_type, 'Update'),
      CASE WHEN p_publish THEN 'published' ELSE 'draft' END
    )
    RETURNING id, review_state INTO v_post, v_state;
  ELSE
    UPDATE public.posts AS post
       SET title = p_title,
           content = p_content,
           media = COALESCE(p_media, post.media),
           visibility = p_visibility,
           post_type = COALESCE(p_post_type, post.post_type),
           status = CASE WHEN p_publish THEN 'published' ELSE 'draft' END,
           updated_at = pg_catalog.now()
     WHERE post.id = p_post_id
       AND post.tenant_id = v_ctx.tenant_id
       AND post.ministry_assignment_id = v_ministry
       AND post.author_user_id = v_ctx.actor_id
    RETURNING post.id, post.review_state INTO v_post, v_state;
    IF v_post IS NULL THEN
      RAISE EXCEPTION 'tenant_guard: the update is not the caller''s own'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'ministry_update.submit',
    'post',
    v_post::TEXT,
    pg_catalog.jsonb_build_object(
      'assignment_id', v_ctx.assignment_id,
      'ministry_assignment_id', v_ministry,
      'review_state', v_state,
      'published', COALESCE(p_publish, false)
    )
  );
  RETURN v_post;
END;
$$;

CREATE FUNCTION tenant_guard.withdraw_own_ministry_update(
  p_tenant_id UUID,
  p_post_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_ministry UUID;
  v_post UUID;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, NULL);
  PERFORM tenant_guard.lock_live_assignment(v_ctx, NULL);
  v_ministry := tenant_guard.own_ministry(v_ctx);
  UPDATE public.posts AS post
     SET review_state = 'withdrawn',
         reviewed_by = v_ctx.actor_id,
         reviewed_by_assignment_id = v_ctx.assignment_id,
         reviewed_at = pg_catalog.now(),
         review_reason = NULL
   WHERE post.id = p_post_id
     AND post.tenant_id = v_ctx.tenant_id
     AND post.ministry_assignment_id = v_ministry
     AND post.author_user_id = v_ctx.actor_id
  RETURNING post.id INTO v_post;
  IF v_post IS NULL THEN
    RAISE EXCEPTION 'tenant_guard: the update is not the caller''s own'
      USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'ministry_update.withdraw_own',
    'post',
    v_post::TEXT,
    pg_catalog.jsonb_build_object('assignment_id', v_ctx.assignment_id)
  );
END;
$$;

CREATE FUNCTION tenant_guard.review_ministry_update(
  p_ctx tenant_guard.command_context,
  p_post_id UUID,
  p_decision TEXT,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_reason TEXT;
  v_ministry UUID;
  v_post RECORD;
  v_withheld BOOLEAN;
BEGIN
  PERFORM tenant_guard.lock_live_assignment(p_ctx, 'updates.review');
  v_reason := private.normalize_safety_text(p_reason);
  IF p_decision IN ('rejected', 'withdrawn') AND v_reason IS NULL THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;
  SELECT post.ministry_assignment_id
    INTO v_ministry
    FROM public.posts AS post
   WHERE post.id = p_post_id
     AND post.tenant_id = p_ctx.tenant_id;
  IF v_ministry IS NOT NULL THEN
    SELECT party.security_level IN ('restricted', 'high_risk') OR party.do_not_publish
      INTO v_withheld
      FROM public.missionaries AS worker
      JOIN public.parties AS party
        ON party.tenant_id = worker.tenant_id
       AND party.id = worker.party_id
     WHERE worker.tenant_id = p_ctx.tenant_id
       AND worker.id = v_ministry
       FOR SHARE OF party;
  END IF;
  SELECT post.id, post.review_state, post.status, post.author_user_id, post.ministry_assignment_id
    INTO v_post
    FROM public.posts AS post
   WHERE post.id = p_post_id
     AND post.tenant_id = p_ctx.tenant_id
     FOR UPDATE;
  IF NOT FOUND OR v_post.ministry_assignment_id IS DISTINCT FROM v_ministry THEN
    RAISE EXCEPTION 'tenant_guard: no such update in this tenant' USING ERRCODE = '42501';
  END IF;
  IF p_decision = 'approved' THEN
    IF v_post.author_user_id IS NOT DISTINCT FROM p_ctx.actor_id OR v_post.author_user_id IS NULL THEN
      RAISE EXCEPTION 'tenant_guard: an update is approved by a person other than its author'
        USING ERRCODE = '42501';
    END IF;
    IF v_post.review_state IS DISTINCT FROM 'submitted' OR v_post.status IS DISTINCT FROM 'published' THEN
      RAISE EXCEPTION 'Only a submitted update can be approved' USING ERRCODE = '22023';
    END IF;
    IF v_withheld THEN
      RAISE EXCEPTION 'The worker''s updates are withheld while they are restricted'
        USING ERRCODE = '22023';
    END IF;
  ELSIF p_decision = 'rejected' THEN
    IF v_post.review_state IS DISTINCT FROM 'submitted' OR v_post.status IS DISTINCT FROM 'published' THEN
      RAISE EXCEPTION 'Only a submitted update can be rejected' USING ERRCODE = '22023';
    END IF;
  ELSIF p_decision = 'withdrawn' THEN
    IF v_post.review_state = 'withdrawn' THEN
      RAISE EXCEPTION 'The update is already withdrawn' USING ERRCODE = '22023';
    END IF;
  ELSE
    RAISE EXCEPTION 'Unknown decision' USING ERRCODE = '22023';
  END IF;
  UPDATE public.posts AS post
     SET review_state = p_decision,
         reviewed_by = p_ctx.actor_id,
         reviewed_by_assignment_id = p_ctx.assignment_id,
         reviewed_at = pg_catalog.now(),
         review_reason = v_reason
   WHERE post.id = v_post.id;
  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    p_ctx.tenant_id,
    p_ctx.actor_id,
    'ministry_update.' || p_decision,
    'post',
    v_post.id::TEXT,
    pg_catalog.jsonb_build_object('assignment_id', p_ctx.assignment_id, 'reason', v_reason)
  );
END;
$$;

ALTER FUNCTION tenant_guard.review_ministry_update(tenant_guard.command_context, UUID, TEXT, TEXT) OWNER TO tenant_guard;
REVOKE ALL ON FUNCTION tenant_guard.review_ministry_update(tenant_guard.command_context, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION tenant_guard.approve_ministry_update(p_tenant_id UUID, p_post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'updates.review');
  PERFORM tenant_guard.review_ministry_update(v_ctx, p_post_id, 'approved', NULL);
END;
$$;

CREATE FUNCTION tenant_guard.reject_ministry_update(p_tenant_id UUID, p_post_id UUID, p_reason TEXT)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'updates.review');
  PERFORM tenant_guard.review_ministry_update(v_ctx, p_post_id, 'rejected', p_reason);
END;
$$;

CREATE FUNCTION tenant_guard.withdraw_ministry_update(p_tenant_id UUID, p_post_id UUID, p_reason TEXT)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'updates.review');
  PERFORM tenant_guard.review_ministry_update(v_ctx, p_post_id, 'withdrawn', p_reason);
END;
$$;

CREATE FUNCTION tenant_guard.set_publication_policy(
  p_tenant_id UUID,
  p_ministry_assignment_id UUID,
  p_path TEXT,
  p_mode TEXT,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_reason TEXT;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'safety.restrict_publication');
  PERFORM tenant_guard.lock_live_assignment(v_ctx, 'safety.restrict_publication');
  v_reason := private.normalize_safety_text(p_reason);
  IF v_reason IS NULL THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;
  IF p_path IS NULL OR p_path NOT IN ('update', 'profile') THEN
    RAISE EXCEPTION 'Unknown path' USING ERRCODE = '22023';
  END IF;
  IF p_mode IS NULL OR p_mode NOT IN ('review', 'automatic') THEN
    RAISE EXCEPTION 'Unknown mode' USING ERRCODE = '22023';
  END IF;
  PERFORM 1
    FROM public.missionaries AS worker
   WHERE worker.tenant_id = v_ctx.tenant_id
     AND worker.id = p_ministry_assignment_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant_guard: no such worker in this tenant' USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.publication_policies (
    tenant_id, ministry_assignment_id, path, mode, reason, set_by, set_by_assignment_id
  )
  VALUES (
    v_ctx.tenant_id, p_ministry_assignment_id, p_path, p_mode, v_reason,
    v_ctx.actor_id, v_ctx.assignment_id
  )
  ON CONFLICT (tenant_id, ministry_assignment_id, path) DO UPDATE
     SET mode = EXCLUDED.mode,
         reason = EXCLUDED.reason,
         set_by = EXCLUDED.set_by,
         set_by_assignment_id = EXCLUDED.set_by_assignment_id,
         set_at = pg_catalog.now();
  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'publication_policy.set',
    'missionary',
    p_ministry_assignment_id::TEXT,
    pg_catalog.jsonb_build_object(
      'assignment_id', v_ctx.assignment_id,
      'path', p_path,
      'mode', p_mode,
      'reason', v_reason
    )
  );
END;
$$;

DO $grants$
DECLARE
  v_signature TEXT;
BEGIN
  FOREACH v_signature IN ARRAY ARRAY[
    'tenant_guard.submit_ministry_update(UUID, UUID, TEXT, TEXT, JSONB, TEXT, TEXT, BOOLEAN)',
    'tenant_guard.withdraw_own_ministry_update(UUID, UUID)',
    'tenant_guard.approve_ministry_update(UUID, UUID)',
    'tenant_guard.reject_ministry_update(UUID, UUID, TEXT)',
    'tenant_guard.withdraw_ministry_update(UUID, UUID, TEXT)',
    'tenant_guard.set_publication_policy(UUID, UUID, TEXT, TEXT, TEXT)'
  ] LOOP
    EXECUTE pg_catalog.format('ALTER FUNCTION %s OWNER TO tenant_guard', v_signature);
    EXECUTE pg_catalog.format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated, service_role', v_signature);
    EXECUTE pg_catalog.format('GRANT EXECUTE ON FUNCTION %s TO authenticated', v_signature);
  END LOOP;
END;
$grants$;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE FUNCTION public.submit_ministry_update(
  p_tenant_id UUID,
  p_post_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_media JSONB,
  p_visibility TEXT,
  p_post_type TEXT,
  p_publish BOOLEAN
)
RETURNS UUID
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.submit_ministry_update(
    p_tenant_id, p_post_id, p_title, p_content, p_media, p_visibility, p_post_type, p_publish
  );
$$;

CREATE FUNCTION public.withdraw_own_ministry_update(p_tenant_id UUID, p_post_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.withdraw_own_ministry_update(p_tenant_id, p_post_id);
$$;

CREATE FUNCTION public.approve_ministry_update(p_tenant_id UUID, p_post_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.approve_ministry_update(p_tenant_id, p_post_id);
$$;

CREATE FUNCTION public.reject_ministry_update(p_tenant_id UUID, p_post_id UUID, p_reason TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.reject_ministry_update(p_tenant_id, p_post_id, p_reason);
$$;

CREATE FUNCTION public.withdraw_ministry_update(p_tenant_id UUID, p_post_id UUID, p_reason TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.withdraw_ministry_update(p_tenant_id, p_post_id, p_reason);
$$;

CREATE FUNCTION public.set_publication_policy(
  p_tenant_id UUID,
  p_ministry_assignment_id UUID,
  p_path TEXT,
  p_mode TEXT,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.set_publication_policy(
    p_tenant_id, p_ministry_assignment_id, p_path, p_mode, p_reason
  );
$$;

DO $wrappers$
DECLARE
  v_signature TEXT;
BEGIN
  FOREACH v_signature IN ARRAY ARRAY[
    'public.submit_ministry_update(UUID, UUID, TEXT, TEXT, JSONB, TEXT, TEXT, BOOLEAN)',
    'public.withdraw_own_ministry_update(UUID, UUID)',
    'public.approve_ministry_update(UUID, UUID)',
    'public.reject_ministry_update(UUID, UUID, TEXT)',
    'public.withdraw_ministry_update(UUID, UUID, TEXT)',
    'public.set_publication_policy(UUID, UUID, TEXT, TEXT, TEXT)'
  ] LOOP
    EXECUTE pg_catalog.format('ALTER FUNCTION %s OWNER TO postgres', v_signature);
    EXECUTE pg_catalog.format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated, service_role', v_signature);
    EXECUTE pg_catalog.format('GRANT EXECUTE ON FUNCTION %s TO authenticated', v_signature);
  END LOOP;
END;
$wrappers$;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
