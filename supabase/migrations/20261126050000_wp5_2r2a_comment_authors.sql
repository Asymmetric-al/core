-- AL-2678 (WP5 part 2-r2a; plan section 12 WP5, line 1003, for commenters;
-- the D-16 rulings on r2a, 1 to 6, and the coordinator's notes N3). A
-- commenter outside Mission Control is named only by the public name, and a
-- restriction shows at the next request.
--
-- Replaces public.post_comment_authors(uuid), the body of
-- 20261120130005_active_tenant_readers.sql lines 30-42, which named
-- every commenter by profiles.display_name. The signature, the columns, the
-- rows, the profile match, the filters and the order are unchanged:
-- - Rows: one for each person who commented on a published public post; a
--   commenter whose profile row is missing still gets one row (LEFT JOIN).
-- - The caller's test: a caller who is not a live member of the post's
--   organization (IS NOT TRUE, so a post with no organization too) gets NULL
--   in every name and photo.
-- What changes is the name and the photo:
-- - A commenter's Parties are every Party linked to the login in ANY
--   organization: by public.account_links (the login), by
--   public.missionaries.profile_id or by public.donors.profile_id (the
--   profile). A worker is a commenter with a public.missionaries row on one of
--   those Parties, in any organization.
-- - A worker is named by the post's organization's projection,
--   private.worker_public_name_for(post tenant, the sole worker row there):
--   the alias, else the normalized Party name for a standard or sensitive
--   worker, else NULL. No sole row there (none, or two) gives NULL, whatever
--   the worker's level elsewhere. The worker branch never reaches
--   profiles.display_name: no COALESCE and no ELSE leads to it.
-- - Two Parties in the post's organization, one of them restricted or
--   high-risk, give NULL: neither can be told to be the one to name.
-- - A non-worker restricted or high-risk in the post's organization is named
--   by that Party's alias or not at all; one restricted or high-risk only
--   elsewhere is named not at all; one whose sole Party here carries an alias
--   is named by it. Only an unrestricted person with no alias here keeps
--   NULLIF(btrim(display_name), '').
-- - The photo (profiles.avatar_url) is NULL for a commenter linked to a
--   restricted or high-risk Party in any organization, and for a worker with
--   no sole row in the post's organization; everyone else keeps it.
-- Restricted means any level but standard and sensitive, NULL included, as in
-- private.worker_public_name_for.
--
-- Reads public.posts, public.post_comments, public.profiles,
-- public.account_links, public.missionaries, public.donors and public.parties,
-- authz.caller_tenant_ids(), private.worker_public_name_for(uuid, uuid) and
-- private.normalize_safety_text(text), which
-- 20261126010000_wp5_2r1_worker_names.sql creates (it comes first).
--
-- Adds two indexes, shared with WP5 part 2-r2s, which reads the organization
-- and the Party from them: comments are read on every post, and a lookup by
-- login alone may not read public.missionaries and public.donors in full.
-- Each leads with the login, (profile_id, tenant_id, party_id), for rows that
-- name one.
--
-- CREATE OR REPLACE keeps the function's owner (postgres), its ACL (EXECUTE to
-- authenticated only, 20261119135200_post_comment_authors.sql lines 75-77)
-- and SECURITY DEFINER with the empty search path; nothing is granted here.
--
-- Locks, observed in pg_locks inside the open transaction just before COMMIT
-- (PostgreSQL 17.11): SHARE on public.missionaries, then public.donors, from
-- each index build until COMMIT (writes to them wait, reads do not; the order
-- a gift takes them); ACCESS SHARE on the seven tables the body names, taken
-- when the body is checked at creation; ROW EXCLUSIVE on pg_description for
-- the comment; nothing stronger on any table that exists before the run.
-- Besides those: ACCESS EXCLUSIVE on the two new indexes, which no other
-- session sees before COMMIT, and a SHARE UPDATE EXCLUSIVE object lock on the
-- function it replaces. lock_timeout stops a run rather than queue it behind
-- a long writer. IF NOT EXISTS and CREATE OR REPLACE keep a second
-- run harmless: it succeeds and changes nothing.
--
-- Recovery. A run lost between its COMMIT and its ledger row succeeds again
-- unchanged. This file has committed when this read-only check is true:
-- SELECT pg_get_functiondef('public.post_comment_authors(uuid)'::regprocedure)
-- LIKE '%worker_public_name_for%'. Then follow docs/ops/release-job.md, "If
-- the migration committed but its ledger row is missing", with this check and
-- this file's version, 20261126050000, in place of the section's own.
--
-- Down, after the build's rollback, in one transaction:
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   CREATE OR REPLACE FUNCTION public.post_comment_authors(p_post_id uuid)
--   RETURNS TABLE(user_id uuid, display_name text, avatar_url text)
--   LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
--     SELECT DISTINCT ON (c.user_id) c.user_id,
--       CASE WHEN member.ok THEN NULLIF(pg_catalog.btrim(p.display_name), '') END,
--       CASE WHEN member.ok THEN p.avatar_url END
--     FROM public.posts AS post
--     JOIN public.post_comments AS c ON c.post_id = post.id
--     CROSS JOIN LATERAL (SELECT post.tenant_id IN (SELECT authz.caller_tenant_ids()) AS ok) AS member
--     LEFT JOIN public.profiles AS p ON p.user_id = c.user_id OR p.id = c.user_id
--     WHERE post.id = p_post_id AND post.status = 'published' AND post.visibility = 'public' AND c.user_id IS NOT NULL
--     ORDER BY c.user_id, (p.user_id IS NOT DISTINCT FROM c.user_id) DESC;
--   $$;
--   COMMENT ON FUNCTION public.post_comment_authors(UUID) IS
--     'One row for each person who commented on a published public post: the '
--     'display name (NULL when blank) and the avatar, given only to a caller with '
--     'a live membership in the post''s organization, and NULL to any other '
--     'caller, because display_name is not always a name the person chose to show '
--     '(AL-2675, JB11).';
--   ALTER FUNCTION public.post_comment_authors(UUID) OWNER TO postgres;
--   REVOKE ALL ON FUNCTION public.post_comment_authors(UUID) FROM PUBLIC, anon, authenticated, service_role;
--   GRANT EXECUTE ON FUNCTION public.post_comment_authors(UUID) TO authenticated;
--   DROP INDEX public.donors_profile_party_idx;
--   DROP INDEX public.missionaries_profile_party_idx;
--   COMMIT;
--   SELECT pg_notify('pgrst', 'reload schema');
-- The body is 20261120130005 lines 30-42 verbatim; the comment and the grants
-- are 20261119135200 lines 68-77.
BEGIN;
SET LOCAL lock_timeout = '5s';

-- A commenter's Parties are found by login in every organization; these
-- keep that lookup to one index probe per commenter.
CREATE INDEX IF NOT EXISTS missionaries_profile_party_idx
  ON public.missionaries (profile_id, tenant_id, party_id) WHERE profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS donors_profile_party_idx
  ON public.donors (profile_id, tenant_id, party_id) WHERE profile_id IS NOT NULL;

-- The name and the photo by the rules in this file's header; the body is the
-- coordinator's N3 text, unchanged.
CREATE OR REPLACE FUNCTION public.post_comment_authors(p_post_id uuid)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text)
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
       AND post.status = 'published'
       AND post.visibility = 'public'
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
           WHEN lp.any_worker THEN
             private.worker_public_name_for(cm.tenant_id, lp.ta_sole_assignment_id)
           WHEN lp.ta_restricted THEN
             lp.ta_sole_party_alias
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
               pg_catalog.bool_or((pt.security_level IN ('standard', 'sensitive')) IS NOT TRUE),
               false
             ) AS any_restricted,
             COALESCE(
               pg_catalog.bool_or((pt.security_level IN ('standard', 'sensitive')) IS NOT TRUE)
                 FILTER (WHERE pt.tenant_id = cm.tenant_id),
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
  'One row for each person who commented on a published public post: the '
  'display name (NULL when blank) and the avatar, given only to a caller with '
  'a live membership in the post''s organization, and NULL to any other '
  'caller, because display_name is not always a name the person chose to show '
  '(AL-2675, JB11). Since AL-2678 (WP5 part 2-r2a) a commenter linked to a '
  'restricted or high-risk Party in any organization, or a worker with no sole '
  'row in the post''s organization, has no photo and is named only by an alias '
  'or not at all, and a worker is named by worker_public_name''s rule for the '
  'post''s organization, never by display_name.';

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
