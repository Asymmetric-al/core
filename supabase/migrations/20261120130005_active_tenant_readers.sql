-- Keep the historical membership RPC for its contract callers, including
-- issue-2675/membership-core.realstack. Its application successor is
-- current_user_assignments(). CREATE OR REPLACE preserves both RPCs' ACLs.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE OR REPLACE FUNCTION public.current_user_memberships(target_tenant uuid)
RETURNS TABLE(tenant_id uuid, role text, staff_role text, is_active boolean, is_tenant_admin boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT m.tenant_id, m.role::text, m.staff_role::text, m.is_active, m.is_tenant_admin
  FROM authz.memberships AS m
  WHERE m.user_id = auth.uid() AND m.tenant_id = target_tenant
    AND m.is_active AND m.revoked_at IS NULL
    AND m.tenant_id IN (SELECT authz.caller_tenant_ids());
$$;

CREATE OR REPLACE FUNCTION public.post_comment_authors(p_post_id uuid)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT DISTINCT ON (c.user_id) c.user_id,
    CASE WHEN member.ok THEN NULLIF(pg_catalog.btrim(p.display_name), '') END,
    CASE WHEN member.ok THEN p.avatar_url END
  FROM public.posts AS post
  JOIN public.post_comments AS c ON c.post_id = post.id
  CROSS JOIN LATERAL (SELECT post.tenant_id IN (SELECT authz.caller_tenant_ids()) AS ok) AS member
  LEFT JOIN public.profiles AS p ON p.user_id = c.user_id OR p.id = c.user_id
  WHERE post.id = p_post_id AND post.status = 'published' AND post.visibility = 'public' AND c.user_id IS NOT NULL
  ORDER BY c.user_id, (p.user_id IS NOT DISTINCT FROM c.user_id) DESC;
$$;
COMMENT ON FUNCTION authz.caller_tenant_ids() IS
  'Active tenants in which the signed-in caller holds an active, unrevoked membership. Used by Storage, membership reads and the command preamble.';
NOTIFY pgrst, 'reload schema';
COMMIT;
