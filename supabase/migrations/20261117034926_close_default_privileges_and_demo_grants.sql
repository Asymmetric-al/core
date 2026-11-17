-- AL-2674 (WP1, slice 1.1b; audit D01 and D04): close the demo read posture
-- and the hosted default privileges of the Data API roles in `public`.
--
-- Why. Hosted Supabase gives `postgres` default privileges that grant every new
-- `public` table SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
-- and (Postgres 17) MAINTAIN, every sequence USAGE, SELECT and UPDATE, and
-- every function EXECUTE, to `anon` and `authenticated` by name (Supabase,
-- "Securing your API", default privileges). A plain Postgres replay has no such
-- defaults, so CI never saw the grants a hosted rebuild of this chain carries.
-- Replaying the chain with those defaults (tests/unit/acceptance/issue-2674)
-- leaves, beyond the plain replay: TRUNCATE, REFERENCES, TRIGGER and MAINTAIN
-- on 36 tables; DML on 12 tables that no policy admits for that role and
-- command; and EXECUTE on the three functions named in step 5. The demo
-- migration 20260216153000_demo_readonly_rls.sql also left SELECT granted to
-- `anon` on `donations`, `donor_activities`, `donor_pledges`, `donors` and
-- `profiles` after later migrations dropped its policies; RLS returns no rows
-- there, but the grant is the demo posture's residue.
--
-- What. After this migration, on any database whatever its default
-- privileges:
--   1. no "public read" policy of the demo migration remains (the forward
--      migrations 20260625002117 and 20261025120800 already drop all 21; this
--      repeats the drop for a database that skipped them);
--   2. `postgres` creates new tables, sequences and functions in `public`
--      without any grant to `anon` or `authenticated`; each migration grants
--      what it needs, as the repository already does;
--   3. no relation in `public` grants TRUNCATE, REFERENCES, TRIGGER or MAINTAIN
--      to PUBLIC, `anon` or `authenticated`; nothing in the product uses them
--      and no migration grants them;
--   4. on every table in `public`, `anon` and `authenticated` hold SELECT,
--      INSERT, UPDATE or DELETE only where a row-security policy admits that
--      role for that command; a grant that no policy admits is inert under RLS
--      and is the residue of the defaults or of the demo posture. Policies are
--      not changed; WP2 rewrites them. One exception to "inert": INSERT ...
--      ON CONFLICT DO UPDATE needs the UPDATE privilege even when it only
--      inserts, so revoking an UPDATE grant that no policy admits can refuse
--      an upsert. No signed-in upsert on the current chain targets a table
--      without an UPDATE policy; WP2's policy rewrite must keep that true;
--   5. `anon` and `authenticated` cannot execute
--      `public.normalize_currency_code(text)`, `public.normalize_money_currency()`
--      or `public.apply_crm_view_settings_patch(jsonb, jsonb)`. Their migrations
--      revoked PUBLIC and granted only `service_role`; the hosted defaults alone
--      made them callable.
-- The public-read policies that stay (`currency_metadata`, published `posts`,
-- their comments and reactions, and published `locations`; audit NA-06) are
-- untouched, with their SELECT grants. Function EXECUTE granted by name on
-- other functions is either intended or redundant with PUBLIC; the catalog gate
-- owns the anonymous-execution allowlist (plan 5.4).
--
-- Rollback: forward-fix only. Re-granting would reopen the exposure.

BEGIN;

-- 1. The 21 demo policies.
DO $$
DECLARE
  demo_table text;
BEGIN
  FOR demo_table IN
    SELECT tablename FROM pg_policies
    WHERE schemaname = 'public' AND policyname = 'public read'
      AND tablename = ANY (ARRAY[
        'tenants', 'profiles', 'missionaries', 'donors', 'funds', 'posts',
        'post_likes', 'post_prayers', 'post_fires', 'post_comments', 'campaigns',
        'donations', 'follows', 'donor_feed_preferences', 'donor_activities',
        'donor_pledges', 'follower_requests', 'locations', 'missionary_tasks',
        'pdf_templates', 'assets'
      ])
  LOOP
    EXECUTE format('DROP POLICY "public read" ON public.%I', demo_table);
  END LOOP;
END $$;

-- 2. Default privileges of the migration owner in `public`.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

-- 3 and 4. Existing relations and sequences in `public`.
DO $$
DECLARE
  rel record;
  api_role text;
  command text;
  command_code "char";
BEGIN
  FOR rel IN
    SELECT c.oid, c.relname, c.relkind, c.relrowsecurity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
    ORDER BY c.relname
  LOOP
    EXECUTE format(
      'REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLE public.%I FROM PUBLIC, anon, authenticated',
      rel.relname);
    IF current_setting('server_version_num')::int >= 170000 THEN
      EXECUTE format(
        'REVOKE MAINTAIN ON TABLE public.%I FROM PUBLIC, anon, authenticated',
        rel.relname);
    END IF;

    CONTINUE WHEN rel.relkind NOT IN ('r', 'p');
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', rel.relname);
    FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      FOREACH command IN ARRAY ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE'] LOOP
        command_code := CASE command
          WHEN 'SELECT' THEN 'r' WHEN 'INSERT' THEN 'a'
          WHEN 'UPDATE' THEN 'w' ELSE 'd' END;
        IF NOT rel.relrowsecurity OR NOT EXISTS (
          SELECT 1 FROM pg_policy p
          WHERE p.polrelid = rel.oid
            AND p.polcmd IN ('*', command_code)
            AND (p.polroles @> ARRAY[0::oid]
              OR p.polroles @> ARRAY[api_role::regrole::oid])
        ) THEN
          EXECUTE format('REVOKE %s ON TABLE public.%I FROM %I',
            command, rel.relname, api_role);
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;

  FOR rel IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'S'
  LOOP
    EXECUTE format('REVOKE ALL ON SEQUENCE public.%I FROM PUBLIC, anon', rel.relname);
    EXECUTE format('REVOKE UPDATE ON SEQUENCE public.%I FROM authenticated', rel.relname);
  END LOOP;
END $$;

-- 5. The three functions whose only anonymous and signed-in EXECUTE came from
-- the hosted defaults.
REVOKE ALL ON FUNCTION public.normalize_currency_code(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.normalize_money_currency() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_crm_view_settings_patch(jsonb, jsonb)
  FROM PUBLIC, anon, authenticated;

-- Post-assert: the end state above holds, or the migration fails. The
-- catalog gate (scripts/verify/tenant-rls-catalog.mjs) keeps the table-grant
-- part of it on every later chain.
DO $$
-- post-assert: default privileges and table grants
DECLARE
  problem text;
BEGIN
  SELECT string_agg(format('%s on %s', policyname, tablename), ', ')
  INTO problem
  FROM pg_policies
  WHERE schemaname = 'public' AND policyname = 'public read';
  IF problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2674: demo policies remain: %', problem;
  END IF;

  SELECT string_agg(format('%s %s', d.defaclobjtype, a.grantee::regrole), ', ')
  INTO problem
  FROM pg_default_acl d
  CROSS JOIN LATERAL aclexplode(d.defaclacl) a
  WHERE d.defaclrole = 'postgres'::regrole
    AND d.defaclnamespace = 'public'::regnamespace
    AND a.grantee IN ('anon'::regrole, 'authenticated'::regrole);
  IF problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2674: default privileges in public still grant: %', problem;
  END IF;

  -- A global default (no schema) applies in every schema, public included.
  SELECT string_agg(format('%s %s', d.defaclobjtype, a.grantee::regrole), ', ')
  INTO problem
  FROM pg_default_acl d
  CROSS JOIN LATERAL aclexplode(d.defaclacl) a
  WHERE d.defaclrole = 'postgres'::regrole
    AND d.defaclnamespace = 0
    AND a.grantee IN ('anon'::regrole, 'authenticated'::regrole);
  IF problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2674: global default privileges of postgres still grant: %', problem;
  END IF;

  SELECT string_agg(format('%s %s %s', c.relname,
      CASE a.grantee WHEN 0 THEN 'PUBLIC' ELSE a.grantee::regrole::text END,
      a.privilege_type), ', ')
  INTO problem
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  CROSS JOIN LATERAL aclexplode(c.relacl) a
  WHERE n.nspname = 'public'
    AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
    AND a.grantee IN (0, 'anon'::regrole, 'authenticated'::regrole)
    AND (
      a.privilege_type IN ('TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN')
      OR a.grantee = 0
      OR (c.relkind IN ('r', 'p') AND NOT EXISTS (
        SELECT 1 FROM pg_policy p
        WHERE c.relrowsecurity
          AND p.polrelid = c.oid
          AND p.polcmd IN ('*', CASE a.privilege_type
            WHEN 'SELECT' THEN 'r' WHEN 'INSERT' THEN 'a'
            WHEN 'UPDATE' THEN 'w' WHEN 'DELETE' THEN 'd' END::"char")
          AND (p.polroles @> ARRAY[0::oid] OR p.polroles @> ARRAY[a.grantee])
      ))
    );
  IF problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2674: table grants without a use remain: %', problem;
  END IF;

  SELECT string_agg(format('%s %s', f, r), ', ')
  INTO problem
  FROM unnest(ARRAY[
    'public.normalize_currency_code(text)',
    'public.normalize_money_currency()',
    'public.apply_crm_view_settings_patch(jsonb,jsonb)'
  ]) f
  CROSS JOIN unnest(ARRAY['anon', 'authenticated']) r
  WHERE has_function_privilege(r, f, 'EXECUTE');
  IF problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2674: default-derived EXECUTE remains: %', problem;
  END IF;
END $$;

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;
