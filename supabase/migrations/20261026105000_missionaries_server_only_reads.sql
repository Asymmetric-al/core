-- Down: none; forward-fix only (#2364 OQ5). Restoring the previous grants and
-- policies re-opens browser reads of missionaries and is Blake's call only.
--
-- #2364: every read of public.missionaries goes through server code using the
-- service role. After this migration:
--   - anon and PUBLIC hold no privilege on missionaries and no policy names
--     them;
--   - authenticated holds no table-wide privilege. It keeps column SELECT on
--     the two join keys (id, profile_id) only, limited to the caller's own row
--     by "missionaries own row key read". That is exactly what the
--     own-missionary branch of "donations owner or staff select" and
--     "donor pledges owner or staff select" (20260625002117) reads, so donor,
--     missionary and staff reads of donations and donor_pledges are unchanged
--     (OQ1, ruled B);
--   - "tanstack browser read" (20260625002117), "public read"
--     (20260216153000) and "tenant scoped read" (#2312,
--     20261025120800_close_public_reads_tenant_scope.sql) are gone;
--   - service_role is unchanged, RLS stays enabled and missionaries stays out
--     of supabase_realtime. The force flag set by #2251 is not touched.
--
-- Re-runnable and idempotent with production's interim anon-only change
-- (drop "public read", revoke SELECT from anon): every policy drop uses
-- IF EXISTS, REVOKE ALL also clears column privileges, and the two-column
-- grant and own-row policy are then re-created.
--
-- Apply in order after the backlog and #2312, never before: a later run of
-- 20260625002117 re-creates "tanstack browser read" and the table-wide grant.
-- No function, publication, column or row is changed.

BEGIN;

-- Pre-assert: the table exists and RLS is enabled.
DO $$
DECLARE
  v_rls BOOLEAN;
BEGIN
  IF to_regclass('public.missionaries') IS NULL THEN
    RAISE EXCEPTION 'missionaries_server_only_reads: public.missionaries does not exist';
  END IF;

  SELECT c.relrowsecurity
  INTO v_rls
  FROM pg_catalog.pg_class c
  WHERE c.oid = 'public.missionaries'::regclass;

  IF NOT v_rls THEN
    RAISE EXCEPTION 'missionaries_server_only_reads: public.missionaries must have row level security enabled before this migration'
      USING HINT = 'Stop the deploy; Samson rules on the live state before this migration runs.';
  END IF;
END
$$;

DROP POLICY IF EXISTS "tanstack browser read" ON public.missionaries;
DROP POLICY IF EXISTS "public read" ON public.missionaries;
DROP POLICY IF EXISTS "tenant scoped read" ON public.missionaries;

-- Clears the table-wide SELECT from 20260216153000, 20260625002117 and #2312,
-- and every column privilege, for the three browser-facing roles.
REVOKE ALL ON TABLE public.missionaries FROM anon, authenticated, PUBLIC;

ALTER TABLE public.missionaries ENABLE ROW LEVEL SECURITY;

-- OQ1 (ruled B): the two join keys the donations-side own-missionary branch
-- reads, own row only. Same own-profile test as 20260625002117:202-208.
GRANT SELECT (id, profile_id) ON public.missionaries TO authenticated;

DROP POLICY IF EXISTS "missionaries own row key read" ON public.missionaries;
CREATE POLICY "missionaries own row key read" ON public.missionaries
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = missionaries.profile_id
        AND (p.user_id = (SELECT auth.uid()) OR p.id = (SELECT auth.uid()))
    )
  );

-- Post-assert: privileges, column keys, policy set, RLS and realtime.
DO $$
DECLARE
  v_policies TEXT;
  v_columns TEXT;
  v_rls BOOLEAN;
BEGIN
  IF has_table_privilege('anon', 'public.missionaries', 'SELECT')
    OR has_any_column_privilege('anon', 'public.missionaries', 'SELECT') THEN
    RAISE EXCEPTION 'missionaries_server_only_reads: anon can still read public.missionaries';
  END IF;

  IF has_table_privilege('authenticated', 'public.missionaries', 'SELECT') THEN
    RAISE EXCEPTION 'missionaries_server_only_reads: authenticated still holds table-wide SELECT on public.missionaries';
  END IF;

  SELECT string_agg(a.attname::text, ',' ORDER BY a.attname)
  INTO v_columns
  FROM pg_catalog.pg_attribute a
  WHERE a.attrelid = 'public.missionaries'::regclass
    AND a.attnum > 0
    AND NOT a.attisdropped
    AND has_column_privilege('authenticated', 'public.missionaries', a.attname, 'SELECT');

  IF v_columns IS DISTINCT FROM 'id,profile_id' THEN
    RAISE EXCEPTION 'missionaries_server_only_reads: authenticated column SELECT on public.missionaries is %, expected id,profile_id', coalesce(v_columns, 'none');
  END IF;

  IF NOT has_table_privilege('service_role', 'public.missionaries', 'SELECT') THEN
    RAISE EXCEPTION 'missionaries_server_only_reads: service_role lost SELECT on public.missionaries';
  END IF;

  SELECT string_agg(format('%I', policyname), ', ' ORDER BY policyname)
  INTO v_policies
  FROM pg_catalog.pg_policies
  WHERE schemaname = 'public' AND tablename = 'missionaries';

  IF v_policies IS DISTINCT FROM '"missionaries own row key read"' THEN
    RAISE EXCEPTION 'missionaries_server_only_reads: public.missionaries policies are %, expected only "missionaries own row key read"', coalesce(v_policies, 'none');
  END IF;

  SELECT c.relrowsecurity
  INTO v_rls
  FROM pg_catalog.pg_class c
  WHERE c.oid = 'public.missionaries'::regclass;

  IF NOT v_rls THEN
    RAISE EXCEPTION 'missionaries_server_only_reads: public.missionaries must keep row level security enabled';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'missionaries'
  ) THEN
    RAISE EXCEPTION 'missionaries_server_only_reads: public.missionaries must stay out of supabase_realtime';
  END IF;
END
$$;

COMMIT;
