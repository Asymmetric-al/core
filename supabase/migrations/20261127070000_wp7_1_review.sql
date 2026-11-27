-- WP7 pull request 1, "Review" (AL-2680): a missionary's update waits for
-- review, or under the missionary path's "automatic" policy its own write
-- approves it; Mission Control approves, rejects or withdraws with a reason.
--
-- 1. posts gain a review state. Rows that exist start approved (D-08). The
--    trigger zzz_wp7_posts_review_on_write sorts after WP5's
--    zz_wp5_assignment_key_* triggers, so it decides on the post's final
--    key, never on a key the writer supplied. On insert it sets the review
--    state, the reviewed_* columns, worker_withheld and content_version
--    itself: approved when the post's missionary path is automatic,
--    submitted otherwise; a post on no missionary path is submitted and
--    waits for a person other than its author (5.4). The author is taken
--    from the writer only through the lane (submit_ministry_update);
--    otherwise it is the login of the post's missionary_id profile. A
--    change of the text, title, media, image, visibility, type or status
--    moves content_version by one and sets the review state again; under
--    automatic an update a reviewer rejected or withdrew, or its author
--    withdrew, goes back to submitted, never straight to approved. Any
--    other change, the key's among them, keeps the review columns, the
--    author and the version, and recomputes worker_withheld.
-- 2. posts.worker_withheld mirrors the worker's Party: restricted,
--    high-risk or do-not-publish withholds every update of the worker from
--    every feed but the author's and a reviewer's; a lift serves them
--    again. An insert reads the Party FOR SHARE, so it serializes with a
--    restriction; a restriction updates the posts in its own transaction.
-- 3. public.publication_policies: one row per missionary path (update,
--    profile); none means review.
-- 4. Commands. The own-ministry lane (Q2: begin_human_command(<tenant>,
--    NULL), a live missionary assignment, the caller's own ministry only):
--    submit_ministry_update (refused unless the caller's worker row maps
--    to the caller's own ministry through its one profile; an edit names
--    the updated_at it was loaded at and whether it must still be a
--    draft) and withdraw_own_ministry_update (a submitted or approved
--    update only). updates.review: approve_ministry_update (never one's
--    own login) and reject_ministry_update, each naming the
--    content_version the reviewer read, and withdraw_ministry_update (with
--    a reason); a post that is not published gets the refusal a missing
--    post gets. safety.restrict_publication: set_publication_policy (with
--    a reason). One audit row per command names the person and the
--    assignment.
-- 5. posts' "tanstack browser read" (any signed-in caller read every
--    tenant's published public posts) narrows to anon, approved, public and
--    not withheld; signed-in reads pass tenant-bound policies only: the
--    author, a reviewer (published, hidden or flagged), and approved
--    updates (public, to staff, or partners-only to a donor who follows
--    that worker).
-- 6. Only the commands, the trigger and the owner write the review
--    columns: service_role inserts and updates only the posts columns its
--    writers name (atomic_create_post_with_audit, atomic_update_post_with_
--    audit and the reactions). anon reads only the posts columns that
--    existed before this file.
-- 7. public.post_comment_authors answers only for a published, public,
--    approved, not withheld post of the request's organization, and a
--    do-not-publish commenter counts as restricted.
--
-- Backfill: every existing post is approved (D-08), its author is the
-- login of its missionary_id profile, and it is withheld where its worker
-- is restricted, high-risk or do-not-publish now. The counts go to the
-- release job's log as one NOTICE (no ids or names).
--
-- Locks. Right after lock_timeout the file takes, in the live order,
-- SHARE ROW EXCLUSIVE on public.tenants, public.missionaries and
-- public.parties, then ACCESS EXCLUSIVE on public.posts, all held to
-- COMMIT: readers pass, writers wait, and no restriction commits between
-- the backfill and the Party trigger. Observed in pg_locks just before
-- COMMIT (PostgreSQL 17, on develop's chain and its seed), besides those:
-- ACCESS EXCLUSIVE on the new public.publication_policies, ROW EXCLUSIVE
-- on public.field_policies, ACCESS SHARE on public.profiles,
-- public.account_links, public.donors, public.follows and
-- public.post_comments. lock_timeout stops a run rather than queue it. On that database the backfill set 36
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
-- 20261127070100 is down, in one transaction: DROP the six public wrappers
-- public.submit_ministry_update, public.withdraw_own_ministry_update,
-- public.approve_ministry_update, public.reject_ministry_update,
-- public.withdraw_ministry_update and public.set_publication_policy; the
-- six commands tenant_guard.submit_ministry_update,
-- tenant_guard.withdraw_own_ministry_update,
-- tenant_guard.approve_ministry_update, tenant_guard.reject_ministry_update,
-- tenant_guard.withdraw_ministry_update and
-- tenant_guard.set_publication_policy; then the three helpers after their
-- callers, tenant_guard.review_ministry_update,
-- tenant_guard.lock_live_assignment and tenant_guard.own_ministry; DROP
-- TRIGGER zzz_wp7_posts_review_on_write ON public.posts and
-- parties_withhold_posts ON public.parties, then
-- private.posts_review_on_write, private.parties_withhold_posts,
-- private.ministry_update_mode and private.ministry_assignment_withheld;
-- restore public.post_comment_authors as 20261126050000 creates it, with
-- its owner, comment and grant; DROP TABLE public.publication_policies
-- and its field_policies rows; DROP POLICY "posts anonymous approved
-- read", "posts tenant read" and tenant_guard_isolation ON public.posts,
-- REVOKE SELECT, INSERT, UPDATE ON public.posts FROM tenant_guard, GRANT
-- SELECT ON public.posts TO anon, restore service_role's INSERT and
-- UPDATE on public.posts as the environment held them, recreate "tanstack
-- browser read" as in 20260625002117; DROP the eight posts columns; then
-- NOTIFY pgrst, 'reload schema'. Rows written stay until then.

BEGIN;
SET LOCAL lock_timeout = '5s';
LOCK TABLE public.tenants, public.missionaries, public.parties IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.posts IN ACCESS EXCLUSIVE MODE;

ALTER TABLE public.posts
  ADD COLUMN review_state TEXT NOT NULL DEFAULT 'approved',
  ADD COLUMN author_user_id UUID,
  ADD COLUMN reviewed_by UUID,
  ADD COLUMN reviewed_by_assignment_id UUID,
  ADD COLUMN reviewed_at TIMESTAMPTZ,
  ADD COLUMN review_reason TEXT,
  ADD COLUMN worker_withheld BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN content_version INTEGER NOT NULL DEFAULT 1;

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
    AND (SELECT authz.staff_read())
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
DECLARE
  v_withheld BOOLEAN;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_withheld := false;
    IF NEW.ministry_assignment_id IS NOT NULL THEN
      SELECT party.security_level IN ('restricted', 'high_risk') OR party.do_not_publish
        INTO v_withheld
        FROM public.missionaries AS worker
        JOIN public.parties AS party
          ON party.tenant_id = worker.tenant_id
         AND party.id = worker.party_id
       WHERE worker.tenant_id = NEW.tenant_id
         AND worker.id = NEW.ministry_assignment_id
         FOR SHARE OF party;
    END IF;
    NEW.worker_withheld := COALESCE(v_withheld, false);
    IF NEW.author_user_id IS NULL THEN
      SELECT profile.user_id
        INTO NEW.author_user_id
        FROM public.profiles AS profile
       WHERE profile.id = NEW.missionary_id;
    END IF;
    NEW.content_version := 1;
  ELSE
    NEW.author_user_id := OLD.author_user_id;
    NEW.content_version := OLD.content_version;
    NEW.worker_withheld := private.ministry_assignment_withheld(NEW.tenant_id, NEW.ministry_assignment_id);
    IF NEW.title IS NOT DISTINCT FROM OLD.title
       AND NEW.content IS NOT DISTINCT FROM OLD.content
       AND NEW.media IS NOT DISTINCT FROM OLD.media
       AND NEW.image_url IS NOT DISTINCT FROM OLD.image_url
       AND NEW.visibility IS NOT DISTINCT FROM OLD.visibility
       AND NEW.post_type IS NOT DISTINCT FROM OLD.post_type
       AND NEW.type IS NOT DISTINCT FROM OLD.type
       AND NEW.status IS NOT DISTINCT FROM OLD.status THEN
      RETURN NEW;
    END IF;
    NEW.content_version := OLD.content_version + 1;
  END IF;
  IF NEW.ministry_assignment_id IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.review_state NOT IN ('rejected', 'withdrawn'))
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

CREATE TRIGGER zzz_wp7_posts_review_on_write
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

REVOKE INSERT, UPDATE ON TABLE public.posts FROM service_role;
GRANT INSERT (
  tenant_id, missionary_id, title, content, media, post_type, visibility, status,
  like_count, prayer_count, comment_count, fires_count
) ON TABLE public.posts TO service_role;
GRANT UPDATE (
  title, content, media, status, visibility, post_type, updated_at,
  like_count, prayer_count, fires_count, comment_count
) ON TABLE public.posts TO service_role;

REVOKE SELECT ON TABLE public.posts FROM anon;
GRANT SELECT (
  id, tenant_id, missionary_id, title, content, media, image_url, post_type, type,
  visibility, status, like_count, prayer_count, fires_count, comment_count,
  created_at, updated_at, ministry_assignment_id
) ON TABLE public.posts TO anon;

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
        status IN ('published', 'hidden', 'flagged')
        AND (SELECT authz.assignment_holds('updates.review'))
      )
      OR (
        review_state = 'approved'
        AND status = 'published'
        AND NOT worker_withheld
        AND (
          visibility = 'public'
          OR (SELECT authz.staff_read())
          OR (
            visibility = 'partners_only'
            AND (SELECT authz.assignment_is('donor'::authz.membership_role))
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

CREATE OR REPLACE FUNCTION public.post_comment_authors(p_post_id UUID)
RETURNS TABLE(user_id UUID, display_name TEXT, avatar_url TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH post_row AS (
    SELECT post.id,
           post.tenant_id,
           (post.tenant_id IN (SELECT authz.caller_tenant_ids())) AS member_ok
      FROM public.posts AS post
     WHERE post.id = p_post_id
       AND post.tenant_id = (SELECT authz.current_tenant_id())
       AND post.status = 'published'
       AND post.visibility = 'public'
       AND post.review_state = 'approved'
       AND NOT post.worker_withheld
  ),
  commenters AS (
    SELECT DISTINCT ON (c.user_id)
           c.user_id,
           pr.tenant_id,
           pr.member_ok,
           p.id AS profile_id,
           p.display_name AS profile_display_name,
           p.avatar_url AS profile_avatar_url
      FROM post_row AS pr
      JOIN public.post_comments AS c ON c.post_id = pr.id
      LEFT JOIN public.profiles AS p ON p.user_id = c.user_id OR p.id = c.user_id
     WHERE c.user_id IS NOT NULL
     ORDER BY c.user_id, (p.user_id IS NOT DISTINCT FROM c.user_id) DESC
  )
  SELECT cm.user_id,
         CASE
           WHEN cm.member_ok IS NOT TRUE OR cm.profile_id IS NULL THEN NULL
           WHEN lp.ta_restricted AND lp.ta_party_count > 1 THEN NULL
           WHEN lp.ta_restricted THEN
             lp.ta_sole_party_alias
           WHEN lp.any_worker THEN
             private.worker_public_name_for(cm.tenant_id, lp.ta_sole_assignment_id)
           WHEN lp.any_restricted THEN NULL
           WHEN lp.ta_party_count = 1 AND lp.ta_sole_party_alias IS NOT NULL THEN
             lp.ta_sole_party_alias
           ELSE NULLIF(pg_catalog.btrim(cm.profile_display_name), '')
         END AS display_name,
         CASE
           WHEN cm.member_ok IS NOT TRUE OR cm.profile_id IS NULL THEN NULL
           WHEN lp.any_restricted THEN NULL
           WHEN lp.any_worker AND lp.ta_sole_assignment_id IS NULL THEN NULL
           ELSE cm.profile_avatar_url
         END AS avatar_url
    FROM commenters AS cm
    CROSS JOIN LATERAL (
      SELECT pg_catalog.count(DISTINCT m.id) > 0 AS any_worker,
             CASE
               WHEN pg_catalog.count(DISTINCT m.id) FILTER (WHERE m.tenant_id = cm.tenant_id) = 1
                 THEN (pg_catalog.array_agg(DISTINCT m.id) FILTER (WHERE m.tenant_id = cm.tenant_id))[1]
             END AS ta_sole_assignment_id,
             COALESCE(
               pg_catalog.bool_or(
                 (pt.security_level IN ('standard', 'sensitive') AND NOT pt.do_not_publish) IS NOT TRUE
               ),
               false
             ) AS any_restricted,
             COALESCE(
               pg_catalog.bool_or(
                 (pt.security_level IN ('standard', 'sensitive') AND NOT pt.do_not_publish) IS NOT TRUE
               ) FILTER (WHERE pt.tenant_id = cm.tenant_id),
               false
             ) AS ta_restricted,
             pg_catalog.count(DISTINCT pt.id)
               FILTER (WHERE pt.tenant_id = cm.tenant_id) AS ta_party_count,
             CASE
               WHEN pg_catalog.count(DISTINCT pt.id) FILTER (WHERE pt.tenant_id = cm.tenant_id) = 1
                 THEN private.normalize_safety_text(
                        pg_catalog.max(pt.public_alias) FILTER (WHERE pt.tenant_id = cm.tenant_id)
                      )
             END AS ta_sole_party_alias
        FROM (
          SELECT al.tenant_id, al.party_id
            FROM public.account_links AS al
           WHERE al.user_id = cm.user_id
          UNION
          SELECT m0.tenant_id, m0.party_id
            FROM public.missionaries AS m0
           WHERE m0.profile_id = cm.profile_id
          UNION
          SELECT d.tenant_id, d.party_id
            FROM public.donors AS d
           WHERE d.profile_id = cm.profile_id
             AND d.party_id IS NOT NULL
        ) AS linked
        JOIN public.parties AS pt
          ON pt.tenant_id = linked.tenant_id
         AND pt.id = linked.party_id
        LEFT JOIN public.missionaries AS m
          ON m.tenant_id = pt.tenant_id
         AND m.party_id = pt.id
    ) AS lp
   ORDER BY cm.user_id;
$$;

COMMENT ON FUNCTION public.post_comment_authors(UUID) IS
  'One row for each person who commented on a published public post: the display name (NULL when blank) and the avatar, given only to a caller with a live membership in the post''s organization, and NULL to any other caller, because display_name is not always a name the person chose to show (AL-2675, JB11). Since AL-2678 (WP5 part 2-r2a) a commenter linked to a restricted or high-risk Party in any organization, or a worker with no sole row in the post''s organization, has no photo and is named only by an alias or not at all, and a worker is named by worker_public_name''s rule for the post''s organization, never by display_name. Since AL-2680 (WP7 PR 1) it answers only for an approved, not withheld post of the request''s organization, and a do-not-publish Party counts as restricted.';
ALTER FUNCTION public.post_comment_authors(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.post_comment_authors(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.post_comment_authors(UUID) TO authenticated;

CREATE FUNCTION tenant_guard.lock_live_assignment(
  p_ctx tenant_guard.command_context,
  p_capability TEXT
)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
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

ALTER FUNCTION tenant_guard.lock_live_assignment(tenant_guard.command_context, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION tenant_guard.lock_live_assignment(tenant_guard.command_context, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.lock_live_assignment(tenant_guard.command_context, TEXT) TO tenant_guard;

CREATE FUNCTION tenant_guard.own_ministry(p_ctx tenant_guard.command_context)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
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

ALTER FUNCTION tenant_guard.own_ministry(tenant_guard.command_context) OWNER TO postgres;
REVOKE ALL ON FUNCTION tenant_guard.own_ministry(tenant_guard.command_context) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.own_ministry(tenant_guard.command_context) TO tenant_guard;

CREATE FUNCTION tenant_guard.submit_ministry_update(
  p_tenant_id UUID,
  p_post_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_media JSONB,
  p_visibility TEXT,
  p_post_type TEXT,
  p_publish BOOLEAN,
  p_expected_updated_at TIMESTAMPTZ,
  p_expected_draft BOOLEAN
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
  v_worker RECORD;
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
  SELECT worker.profile_id, worker.party_id
    INTO v_worker
    FROM public.missionaries AS worker
   WHERE worker.tenant_id = v_ctx.tenant_id
     AND worker.id = v_ministry;
  PERFORM 1
    FROM public.parties AS party
   WHERE party.tenant_id = v_ctx.tenant_id
     AND party.id = v_worker.party_id
     FOR SHARE;
  IF v_worker.profile_id IS NULL
     OR (
       SELECT pg_catalog.count(*)
         FROM public.missionaries AS other
        WHERE other.tenant_id = v_ctx.tenant_id
          AND other.profile_id = v_worker.profile_id
     ) <> 1 THEN
    RAISE EXCEPTION 'tenant_guard: the caller''s worker record is not linked to their sign-in'
      USING ERRCODE = '42501', HINT = 'worker_not_linked';
  END IF;
  IF p_post_id IS NULL THEN
    INSERT INTO public.posts (
      tenant_id, missionary_id, ministry_assignment_id, author_user_id, title, content,
      media, visibility, post_type, status
    )
    VALUES (
      v_ctx.tenant_id, v_worker.profile_id, v_ministry, v_ctx.actor_id, p_title, p_content,
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
       AND (p_expected_updated_at IS NULL OR post.updated_at = p_expected_updated_at)
       AND (p_expected_draft IS NOT TRUE OR post.status = 'draft')
    RETURNING post.id, post.review_state INTO v_post, v_state;
    IF v_post IS NULL THEN
      PERFORM 1
        FROM public.posts AS post
       WHERE post.id = p_post_id
         AND post.tenant_id = v_ctx.tenant_id
         AND post.ministry_assignment_id = v_ministry
         AND post.author_user_id = v_ctx.actor_id;
      IF FOUND THEN
        RAISE EXCEPTION 'Post changed since it was loaded' USING ERRCODE = '40001';
      END IF;
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
  v_post RECORD;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, NULL);
  PERFORM tenant_guard.lock_live_assignment(v_ctx, NULL);
  v_ministry := tenant_guard.own_ministry(v_ctx);
  SELECT post.id, post.review_state
    INTO v_post
    FROM public.posts AS post
   WHERE post.id = p_post_id
     AND post.tenant_id = v_ctx.tenant_id
     AND post.ministry_assignment_id = v_ministry
     AND post.author_user_id = v_ctx.actor_id
     FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant_guard: the update is not the caller''s own'
      USING ERRCODE = '42501';
  END IF;
  IF v_post.review_state NOT IN ('submitted', 'approved') THEN
    RAISE EXCEPTION 'Only a submitted or approved update can be withdrawn'
      USING ERRCODE = '22023';
  END IF;
  UPDATE public.posts AS post
     SET review_state = 'withdrawn',
         reviewed_by = v_ctx.actor_id,
         reviewed_by_assignment_id = v_ctx.assignment_id,
         reviewed_at = pg_catalog.now(),
         review_reason = NULL
   WHERE post.id = v_post.id;
  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'ministry_update.withdraw_own',
    'post',
    v_post.id::TEXT,
    pg_catalog.jsonb_build_object('assignment_id', v_ctx.assignment_id)
  );
END;
$$;

CREATE FUNCTION tenant_guard.review_ministry_update(
  p_ctx tenant_guard.command_context,
  p_post_id UUID,
  p_decision TEXT,
  p_version INTEGER,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
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
  SELECT post.id, post.review_state, post.status, post.author_user_id,
         post.ministry_assignment_id, post.content_version
    INTO v_post
    FROM public.posts AS post
   WHERE post.id = p_post_id
     AND post.tenant_id = p_ctx.tenant_id
     FOR UPDATE;
  IF NOT FOUND
     OR v_post.ministry_assignment_id IS DISTINCT FROM v_ministry
     OR v_post.status IS DISTINCT FROM 'published' THEN
    RAISE EXCEPTION 'tenant_guard: no such update in this tenant' USING ERRCODE = '42501';
  END IF;
  IF p_decision = 'approved' THEN
    IF v_post.author_user_id IS NOT DISTINCT FROM p_ctx.actor_id OR v_post.author_user_id IS NULL THEN
      RAISE EXCEPTION 'tenant_guard: an update is approved by a person other than its author'
        USING ERRCODE = '42501';
    END IF;
    IF v_post.review_state IS DISTINCT FROM 'submitted' THEN
      RAISE EXCEPTION 'Only a submitted update can be approved' USING ERRCODE = '22023';
    END IF;
    IF v_withheld THEN
      RAISE EXCEPTION 'The worker''s updates are withheld while they are restricted'
        USING ERRCODE = '22023';
    END IF;
  ELSIF p_decision = 'rejected' THEN
    IF v_post.review_state IS DISTINCT FROM 'submitted' THEN
      RAISE EXCEPTION 'Only a submitted update can be rejected' USING ERRCODE = '22023';
    END IF;
  ELSIF p_decision = 'withdrawn' THEN
    IF v_post.review_state = 'withdrawn' THEN
      RAISE EXCEPTION 'The update is already withdrawn' USING ERRCODE = '22023';
    END IF;
  ELSE
    RAISE EXCEPTION 'Unknown decision' USING ERRCODE = '22023';
  END IF;
  IF p_decision IN ('approved', 'rejected') AND v_post.content_version IS DISTINCT FROM p_version THEN
    RAISE EXCEPTION 'The update changed since it was read' USING ERRCODE = '22023';
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

ALTER FUNCTION tenant_guard.review_ministry_update(tenant_guard.command_context, UUID, TEXT, INTEGER, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION tenant_guard.review_ministry_update(tenant_guard.command_context, UUID, TEXT, INTEGER, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.review_ministry_update(tenant_guard.command_context, UUID, TEXT, INTEGER, TEXT) TO tenant_guard;

CREATE FUNCTION tenant_guard.approve_ministry_update(p_tenant_id UUID, p_post_id UUID, p_version INTEGER)
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
  PERFORM tenant_guard.review_ministry_update(v_ctx, p_post_id, 'approved', p_version, NULL);
END;
$$;

CREATE FUNCTION tenant_guard.reject_ministry_update(
  p_tenant_id UUID,
  p_post_id UUID,
  p_version INTEGER,
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
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'updates.review');
  PERFORM tenant_guard.review_ministry_update(v_ctx, p_post_id, 'rejected', p_version, p_reason);
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
  PERFORM tenant_guard.review_ministry_update(v_ctx, p_post_id, 'withdrawn', NULL, p_reason);
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

REVOKE ALL ON FUNCTION tenant_guard.submit_ministry_update(UUID, UUID, TEXT, TEXT, JSONB, TEXT, TEXT, BOOLEAN, TIMESTAMPTZ, BOOLEAN) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.submit_ministry_update(UUID, UUID, TEXT, TEXT, JSONB, TEXT, TEXT, BOOLEAN, TIMESTAMPTZ, BOOLEAN) TO authenticated;
REVOKE ALL ON FUNCTION tenant_guard.withdraw_own_ministry_update(UUID, UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.withdraw_own_ministry_update(UUID, UUID) TO authenticated;
REVOKE ALL ON FUNCTION tenant_guard.approve_ministry_update(UUID, UUID, INTEGER) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.approve_ministry_update(UUID, UUID, INTEGER) TO authenticated;
REVOKE ALL ON FUNCTION tenant_guard.reject_ministry_update(UUID, UUID, INTEGER, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.reject_ministry_update(UUID, UUID, INTEGER, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION tenant_guard.withdraw_ministry_update(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.withdraw_ministry_update(UUID, UUID, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION tenant_guard.set_publication_policy(UUID, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.set_publication_policy(UUID, UUID, TEXT, TEXT, TEXT) TO authenticated;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.submit_ministry_update(UUID, UUID, TEXT, TEXT, JSONB, TEXT, TEXT, BOOLEAN, TIMESTAMPTZ, BOOLEAN) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.withdraw_own_ministry_update(UUID, UUID) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.approve_ministry_update(UUID, UUID, INTEGER) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.reject_ministry_update(UUID, UUID, INTEGER, TEXT) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.withdraw_ministry_update(UUID, UUID, TEXT) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.set_publication_policy(UUID, UUID, TEXT, TEXT, TEXT) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE FUNCTION public.submit_ministry_update(
  p_tenant_id UUID,
  p_post_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_media JSONB,
  p_visibility TEXT,
  p_post_type TEXT,
  p_publish BOOLEAN,
  p_expected_updated_at TIMESTAMPTZ,
  p_expected_draft BOOLEAN
)
RETURNS UUID
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.submit_ministry_update(
    p_tenant_id, p_post_id, p_title, p_content, p_media, p_visibility, p_post_type, p_publish,
    p_expected_updated_at, p_expected_draft
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

CREATE FUNCTION public.approve_ministry_update(p_tenant_id UUID, p_post_id UUID, p_version INTEGER)
RETURNS VOID
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.approve_ministry_update(p_tenant_id, p_post_id, p_version);
$$;

CREATE FUNCTION public.reject_ministry_update(
  p_tenant_id UUID,
  p_post_id UUID,
  p_version INTEGER,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.reject_ministry_update(p_tenant_id, p_post_id, p_version, p_reason);
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

ALTER FUNCTION public.submit_ministry_update(UUID, UUID, TEXT, TEXT, JSONB, TEXT, TEXT, BOOLEAN, TIMESTAMPTZ, BOOLEAN) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.submit_ministry_update(UUID, UUID, TEXT, TEXT, JSONB, TEXT, TEXT, BOOLEAN, TIMESTAMPTZ, BOOLEAN) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_ministry_update(UUID, UUID, TEXT, TEXT, JSONB, TEXT, TEXT, BOOLEAN, TIMESTAMPTZ, BOOLEAN) TO authenticated;
ALTER FUNCTION public.withdraw_own_ministry_update(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.withdraw_own_ministry_update(UUID, UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.withdraw_own_ministry_update(UUID, UUID) TO authenticated;
ALTER FUNCTION public.approve_ministry_update(UUID, UUID, INTEGER) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.approve_ministry_update(UUID, UUID, INTEGER) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.approve_ministry_update(UUID, UUID, INTEGER) TO authenticated;
ALTER FUNCTION public.reject_ministry_update(UUID, UUID, INTEGER, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.reject_ministry_update(UUID, UUID, INTEGER, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reject_ministry_update(UUID, UUID, INTEGER, TEXT) TO authenticated;
ALTER FUNCTION public.withdraw_ministry_update(UUID, UUID, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.withdraw_ministry_update(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.withdraw_ministry_update(UUID, UUID, TEXT) TO authenticated;
ALTER FUNCTION public.set_publication_policy(UUID, UUID, TEXT, TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.set_publication_policy(UUID, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_publication_policy(UUID, UUID, TEXT, TEXT, TEXT) TO authenticated;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
