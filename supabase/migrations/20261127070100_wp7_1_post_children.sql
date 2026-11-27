-- WP7 pull request 1, "Review" (AL-2680), invariant 10: the four post
-- tables (post_comments, post_fires, post_likes, post_prayers) carry their
-- post's tenant.
--
-- - tenant_id is set before insert from the parent post, so
--   atomic_like_post, atomic_pray_for_post, atomic_fire_post and
--   atomic_add_post_comment, which omit it, still work; it is keyed to
--   public.tenants(id) ON DELETE RESTRICT and, with post_id, to the same
--   tenant's post: a reaction or comment naming another tenant's post with
--   its own tenant fails.
-- - Row security is forced. A signed-in read is tenant-bound and admits a
--   row only while its post is readable under the caller's own row security
--   on posts (20261127070000); the anonymous read admits a row only while
--   its post is (approved, published, public, not withheld), until WP7's
--   third pull request ends anonymous reads.
-- - They leave PARENT_SCOPED_TABLES (scripts/verify/tenant-rls-catalog.mjs).
--
-- - A post with no organization holds no reaction or comment from here on
--   (the insert is refused, 23502). The preflight stops the run, changing
--   nothing, if any existing one belongs to such a post or to no post; the
--   count names how many.
--
-- Locks, observed in pg_locks just before COMMIT (PostgreSQL 17, on
-- develop's chain and its seed): ACCESS EXCLUSIVE on public.posts (its new
-- unique constraint) and on each of the four tables (ALTER TABLE, its
-- policies and trigger) to COMMIT; SHARE ROW EXCLUSIVE on public.tenants
-- (the new keys): readers pass, writers wait. lock_timeout stops a run
-- rather than queue it. On that database every existing row took its
-- post's tenant (18 likes, 20 comments, 12 prayers, 9 fires).
--
-- Recovery. A run lost between its COMMIT and its ledger row stops on the
-- next run at its first statement after the preflight (42P07,
-- posts_tenant_id_id_key exists), rolling back. This file has committed
-- when this read-only check is true: SELECT
-- to_regprocedure('private.post_child_tenant()') IS NOT NULL. Then follow
-- docs/ops/release-job.md, "If the migration committed but its ledger row
-- is missing", with this check and this file's version, 20261127070100.
--
-- Down, only after the build that reads these tables is rolled back, in one
-- transaction: on each table DROP POLICY "<table> tenant read" and
-- "<table> anonymous read", recreate "tanstack browser read" as in
-- 20260625002117, NO FORCE ROW LEVEL SECURITY, DROP TRIGGER
-- post_children_tenant, the two constraints and the column; then DROP
-- FUNCTION private.post_child_tenant(), ALTER TABLE public.posts DROP
-- CONSTRAINT posts_tenant_id_id_key, and NOTIFY pgrst, 'reload schema'.

BEGIN;
SET LOCAL lock_timeout = '5s';

DO $$
-- preflight: post tables carry their post's tenant
DECLARE
  v_without_tenant BIGINT;
BEGIN
  SELECT (SELECT pg_catalog.count(*) FROM public.post_comments AS child LEFT JOIN public.posts AS post ON post.id = child.post_id WHERE post.tenant_id IS NULL)
       + (SELECT pg_catalog.count(*) FROM public.post_fires AS child LEFT JOIN public.posts AS post ON post.id = child.post_id WHERE post.tenant_id IS NULL)
       + (SELECT pg_catalog.count(*) FROM public.post_likes AS child LEFT JOIN public.posts AS post ON post.id = child.post_id WHERE post.tenant_id IS NULL)
       + (SELECT pg_catalog.count(*) FROM public.post_prayers AS child LEFT JOIN public.posts AS post ON post.id = child.post_id WHERE post.tenant_id IS NULL)
    INTO v_without_tenant;
  IF v_without_tenant > 0 THEN
    RAISE EXCEPTION 'wp7_1_post_children: % reactions or comments belong to a post with no organization or to no post; nothing was changed', v_without_tenant
      USING ERRCODE = '23502';
  END IF;
END;
$$;

ALTER TABLE public.posts
  ADD CONSTRAINT posts_tenant_id_id_key UNIQUE (tenant_id, id);

CREATE FUNCTION private.post_child_tenant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    SELECT post.tenant_id
      INTO NEW.tenant_id
      FROM public.posts AS post
     WHERE post.id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION private.post_child_tenant() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.post_child_tenant() FROM PUBLIC, anon, authenticated, service_role;

DO $children$
DECLARE
  v_table TEXT;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['post_comments', 'post_fires', 'post_likes', 'post_prayers'] LOOP
    EXECUTE pg_catalog.format('ALTER TABLE public.%I ADD COLUMN tenant_id UUID', v_table);
    EXECUTE pg_catalog.format(
      'UPDATE public.%I AS child SET tenant_id = post.tenant_id FROM public.posts AS post WHERE post.id = child.post_id',
      v_table
    );
    EXECUTE pg_catalog.format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET NOT NULL', v_table);
    EXECUTE pg_catalog.format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE RESTRICT',
      v_table, v_table || '_tenant_id_fkey'
    );
    EXECUTE pg_catalog.format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (tenant_id, post_id) REFERENCES public.posts (tenant_id, id) ON DELETE CASCADE',
      v_table, v_table || '_same_tenant_post_fkey'
    );
    EXECUTE pg_catalog.format(
      'CREATE TRIGGER post_children_tenant BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION private.post_child_tenant()',
      v_table
    );
    EXECUTE pg_catalog.format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', v_table);
    EXECUTE pg_catalog.format('DROP POLICY "tanstack browser read" ON public.%I', v_table);
    EXECUTE pg_catalog.format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING ('
        || 'tenant_id = (SELECT authz.current_tenant_id()) '
        || 'AND EXISTS (SELECT 1 FROM public.posts AS parent_post WHERE parent_post.id = %I.post_id))',
      v_table || ' tenant read', v_table, v_table
    );
    EXECUTE pg_catalog.format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO anon USING ('
        || 'EXISTS (SELECT 1 FROM public.posts AS parent_post WHERE parent_post.id = %I.post_id))',
      v_table || ' anonymous read', v_table, v_table
    );
  END LOOP;
END;
$children$;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
