-- Down: run by hand, and only on Blake's explicit call: drop the five new
-- policies ("tenant scoped read" on missionaries, funds, assets and campaigns;
-- "tenant scoped own or staff read" on follows), then restore the pre-state
-- privileges and policies recorded in preflight P2/P3, taken after the backlog
-- deploy (docs/security/tenant-read-floor.md, deploy order). Restoring them
-- re-opens the exposure. Never re-run or revert backlog migrations as part of
-- the rollback; prefer a forward fix.
--
-- #2312: none of these five tables is public (Blake's ruling). The anon key
-- could read every row of missionaries, funds, follows and assets through
-- "tanstack browser read" (20260625002117) and every row of campaigns through
-- "public read" (20260216153000), across all tenants. Hosted projects still
-- carry "public read" on all five.
--
-- After this migration anon and PUBLIC hold no privilege on the five tables
-- and authenticated holds exactly SELECT. Each table keeps exactly one SELECT
-- policy for authenticated:
--   - missionaries, funds, assets, campaigns: "tenant scoped read", the tenant
--     floor (tenant_id is the caller's authz.current_tenant_id(); NULL-tenant
--     rows are hidden);
--   - follows: "tenant scoped own or staff read", the tenant floor AND (the
--     caller is the follower, through the same-tenant donor and its profile,
--     OR the caller has an active staff membership in the row's tenant).
-- service_role (every product read, through the admin client) is unchanged.
--
-- The legacy policies are dropped by the names found in the catalog, behind a
-- pre-assert that raises on any other policy, or on none, so an unexpected
-- live state stops the deploy instead of being absorbed. The post-assert
-- checks policies, privileges and that RLS stays enabled and forced (#2251,
-- 20261025070000_force_rls_tenant_tables.sql, already forces all five).
--
-- No function, publication, column or row is changed.
-- Contract, deploy order and forward rule: docs/security/tenant-read-floor.md.

BEGIN;

-- Pre-assert, then drop whichever legacy policies exist.
DO $$
DECLARE
  v_table TEXT;
  v_found TEXT;
  v_unexpected TEXT;
  r RECORD;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['missionaries', 'funds', 'follows', 'assets', 'campaigns'] LOOP
    IF to_regclass(format('public.%I', v_table)) IS NULL THEN
      RAISE EXCEPTION 'close_public_reads_tenant_scope: public.% does not exist', v_table;
    END IF;

    SELECT string_agg(format('%I', policyname), ', ' ORDER BY policyname)
    INTO v_found
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = v_table;

    IF v_found IS NULL THEN
      RAISE EXCEPTION 'close_public_reads_tenant_scope: public.% has no policy (expected "public read" and/or "tanstack browser read")', v_table
        USING HINT = 'Stop the deploy; Samson rules on the live state before this migration runs.';
    END IF;

    SELECT string_agg(
      format('%I (%s, %s, %s, qual %s, with_check %s)', policyname, permissive, cmd, roles::text, coalesce(qual, 'none'), coalesce(with_check, 'none')),
      ', ' ORDER BY policyname
    )
    INTO v_unexpected
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'public'
      AND tablename = v_table
      AND NOT (
        policyname IN ('public read', 'tanstack browser read')
        AND cmd = 'SELECT'
        AND qual = 'true'
        AND with_check IS NULL
        AND roles <@ ARRAY['anon', 'authenticated']::name[]
      );

    IF v_unexpected IS NOT NULL THEN
      RAISE EXCEPTION 'close_public_reads_tenant_scope: public.% has unexpected policies: % (found: %)', v_table, v_unexpected, v_found
        USING HINT = 'Stop the deploy; Samson rules on the live state before this migration runs.';
    END IF;
  END LOOP;

  FOR r IN
    SELECT policyname, tablename
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY (ARRAY['missionaries', 'funds', 'follows', 'assets', 'campaigns'])
    ORDER BY tablename, policyname
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END
$$;

-- Hosted Supabase gives anon and authenticated ALL on public tables by default
-- privileges. REVOKE ALL runs first and also clears column-level privileges.
REVOKE ALL ON TABLE public.missionaries FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.funds FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.follows FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.assets FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.campaigns FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.missionaries TO authenticated;
GRANT SELECT ON TABLE public.funds TO authenticated;
GRANT SELECT ON TABLE public.follows TO authenticated;
GRANT SELECT ON TABLE public.assets TO authenticated;
GRANT SELECT ON TABLE public.campaigns TO authenticated;

CREATE POLICY "tenant scoped read" ON public.missionaries
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (tenant_id IS NOT NULL AND tenant_id = (SELECT authz.current_tenant_id()));

CREATE POLICY "tenant scoped read" ON public.funds
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (tenant_id IS NOT NULL AND tenant_id = (SELECT authz.current_tenant_id()));

CREATE POLICY "tenant scoped read" ON public.assets
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (tenant_id IS NOT NULL AND tenant_id = (SELECT authz.current_tenant_id()));

CREATE POLICY "tenant scoped read" ON public.campaigns
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (tenant_id IS NOT NULL AND tenant_id = (SELECT authz.current_tenant_id()));

-- Own: the follower is a donor in the row's tenant whose profile belongs to
-- auth.uid() (by user_id or id, as every existing owner policy). The followed
-- missionary (follows.missionary_id, a profile id) is not an owner. Staff: an
-- active staff membership in the row's tenant, any staff role.
CREATE POLICY "tenant scoped own or staff read" ON public.follows
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (
    tenant_id IS NOT NULL AND tenant_id = (SELECT authz.current_tenant_id())
    AND (
      EXISTS (
        SELECT 1
        FROM public.donors d JOIN public.profiles p ON p.id = d.profile_id
        WHERE d.id = follows.donor_id
          AND d.tenant_id = follows.tenant_id
          AND (p.user_id = (SELECT auth.uid()) OR p.id = (SELECT auth.uid()))
      )
      OR (SELECT authz.has_staff_membership(follows.tenant_id, NULL::authz.staff_role[]))
    )
  );

-- Post-assert: one policy per table, no anon or PUBLIC privilege, exactly
-- SELECT for authenticated, nothing per column, RLS enabled and forced.
DO $$
DECLARE
  v_table TEXT;
  v_name TEXT;
  v_policies TEXT;
  v_qual TEXT;
  v_rls BOOLEAN;
  v_force BOOLEAN;
  v_anon TEXT;
  v_public TEXT;
  v_authenticated TEXT;
  v_columns TEXT;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['missionaries', 'funds', 'follows', 'assets', 'campaigns'] LOOP
    v_name := CASE WHEN v_table = 'follows' THEN 'tenant scoped own or staff read' ELSE 'tenant scoped read' END;

    SELECT string_agg(format('%s:%s:%s:%s', policyname, permissive, cmd, roles::text), ', ' ORDER BY policyname),
      max(qual)
    INTO v_policies, v_qual
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = v_table;

    IF v_policies IS DISTINCT FROM format('%s:PERMISSIVE:SELECT:{authenticated}', v_name) THEN
      RAISE EXCEPTION 'close_public_reads_tenant_scope: public.% has policies % (expected only "%")', v_table, coalesce(v_policies, 'none'), v_name;
    END IF;

    IF v_qual IS NULL
      OR strpos(v_qual, 'tenant_id IS NOT NULL') = 0
      OR strpos(v_qual, 'authz.current_tenant_id()') = 0
      OR (v_table = 'follows' AND (strpos(v_qual, 'has_staff_membership') = 0 OR strpos(v_qual, 'auth.uid()') = 0))
    THEN
      RAISE EXCEPTION 'close_public_reads_tenant_scope: public.% policy "%" has an unexpected qual: %', v_table, v_name, coalesce(v_qual, 'none');
    END IF;

    SELECT c.relrowsecurity, c.relforcerowsecurity
    INTO v_rls, v_force
    FROM pg_catalog.pg_class c
    WHERE c.oid = to_regclass(format('public.%I', v_table));

    IF NOT (v_rls AND v_force) THEN
      RAISE EXCEPTION 'close_public_reads_tenant_scope: public.% must keep row level security enabled and forced (relrowsecurity %, relforcerowsecurity %)', v_table, v_rls, v_force
        USING HINT = '#2251 (20261025070000_force_rls_tenant_tables.sql) forces it; nothing may undo that.';
    END IF;

    SELECT
      string_agg(x.privilege_type, ',' ORDER BY x.privilege_type) FILTER (WHERE x.grantee = 'anon'::regrole),
      string_agg(x.privilege_type, ',' ORDER BY x.privilege_type) FILTER (WHERE x.grantee = 0),
      string_agg(x.privilege_type, ',' ORDER BY x.privilege_type) FILTER (WHERE x.grantee = 'authenticated'::regrole)
    INTO v_anon, v_public, v_authenticated
    FROM pg_catalog.pg_class c
    CROSS JOIN LATERAL aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) x
    WHERE c.oid = to_regclass(format('public.%I', v_table));

    IF v_anon IS NOT NULL
      OR v_public IS NOT NULL
      OR has_table_privilege('anon', format('public.%I', v_table), 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')
    THEN
      RAISE EXCEPTION 'close_public_reads_tenant_scope: public.% still lets anon (%) or PUBLIC (%) in', v_table, coalesce(v_anon, 'none'), coalesce(v_public, 'none');
    END IF;

    IF v_authenticated IS DISTINCT FROM 'SELECT' THEN
      RAISE EXCEPTION 'close_public_reads_tenant_scope: public.% authenticated holds % (expected SELECT only)', v_table, coalesce(v_authenticated, 'none');
    END IF;

    SELECT string_agg(format('%s:%s', a.attname, g.rolname), ', ' ORDER BY a.attname, g.rolname)
    INTO v_columns
    FROM pg_catalog.pg_attribute a
    CROSS JOIN LATERAL aclexplode(a.attacl) x
    LEFT JOIN pg_catalog.pg_roles g ON g.oid = x.grantee
    WHERE a.attrelid = to_regclass(format('public.%I', v_table))
      AND a.attacl IS NOT NULL
      AND (x.grantee = 0 OR g.rolname IN ('anon', 'authenticated'));

    IF v_columns IS NOT NULL THEN
      RAISE EXCEPTION 'close_public_reads_tenant_scope: public.% keeps column-level privileges: %', v_table, v_columns;
    END IF;
  END LOOP;
END
$$;

COMMIT;
