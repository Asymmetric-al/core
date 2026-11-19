-- The commenters on a post, for its comments (AL-2675, WP2b first release;
-- council on the joined release, JB11, and the decision reader's ruling).
--
-- The comments route embedded `user:profiles!user_id(...)`, which PostgREST
-- cannot answer: `post_comments.user_id` references `auth.users`, and no
-- foreign key joins it to `public.profiles`, so the whole read failed
-- (PGRST200). The second release also stops other people's `profiles` rows
-- from being readable. This read gives one row for each person who commented
-- on a published public post, and from their profile the display name and
-- the avatar only, so the route works in this release and keeps working when
-- the second release narrows `profiles`. The second release's migration
-- created the same function; it now only drops the broad policy.
--
-- The name is the profile's `display_name`, or NULL when it is blank, for
-- every caller: no fallback to `full_name`, to first and last names or to
-- initials (the field-policy manifest classes all four as contact data).
-- And because `display_name` is not always a name a person chose to show
-- (saving donor profile settings builds it from the first and last names),
-- the name and the avatar are given only to a caller who holds a live
-- membership row, of any class, in the post's organization. Any other
-- signed-in caller still gets one row for each commenter, so the comments
-- show, with NULL for the name and the avatar. The membership test is the one
-- the second release's `authz.caller_tenant_ids()` makes, written inline.
--
-- The profile is matched by the login as `authz.caller_profile_ids()` does
-- (`p.user_id = c.user_id OR p.id = c.user_id`), preferring the match on
-- `user_id`; a commenter with no profile still has a row.
--
-- Rollback: DROP FUNCTION public.post_comment_authors(UUID); the comments
-- route then lists comments with no author names.

CREATE OR REPLACE FUNCTION public.post_comment_authors(p_post_id UUID)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT DISTINCT ON (c.user_id)
    c.user_id,
    CASE WHEN member.ok THEN NULLIF(pg_catalog.btrim(p.display_name), '') END,
    CASE WHEN member.ok THEN p.avatar_url END
  FROM public.posts AS post
  JOIN public.post_comments AS c ON c.post_id = post.id
  CROSS JOIN LATERAL (
    SELECT EXISTS (
      SELECT 1
        FROM authz.memberships AS m
       WHERE m.user_id = auth.uid()
         AND m.tenant_id = post.tenant_id
         AND m.is_active
         AND m.revoked_at IS NULL
    ) AS ok
  ) AS member
  LEFT JOIN public.profiles AS p
    ON p.user_id = c.user_id OR p.id = c.user_id
  WHERE post.id = p_post_id
    AND post.status = 'published'
    AND post.visibility = 'public'
    AND c.user_id IS NOT NULL
  ORDER BY c.user_id, (p.user_id IS NOT DISTINCT FROM c.user_id) DESC;
$$;

COMMENT ON FUNCTION public.post_comment_authors(UUID) IS
  'One row for each person who commented on a published public post: the '
  'display name (NULL when blank) and the avatar, given only to a caller with '
  'a live membership in the post''s organization, and NULL to any other '
  'caller, because display_name is not always a name the person chose to show '
  '(AL-2675, JB11).';

ALTER FUNCTION public.post_comment_authors(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.post_comment_authors(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.post_comment_authors(UUID) TO authenticated;

SELECT pg_notify('pgrst', 'reload schema');
