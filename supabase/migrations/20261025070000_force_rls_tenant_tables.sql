-- #2251 (slice 2 of #505): ENABLE + FORCE row level security on every public
-- tenant table (a public base table with a live tenant_id column).
--
-- ENABLE applies policies to non-owners only; FORCE also applies them to the
-- table owner. Superusers and BYPASSRLS roles still skip RLS. Today every
-- target table and every app SECURITY DEFINER function is owned by postgres
-- (superuser in CI, BYPASSRLS on hosted Supabase), so this changes no rows seen
-- by anon, authenticated, service_role or postgres-owned definer functions.
--
-- Tables with no policy stay deny-by-default for every role without
-- BYPASSRLS; each is listed with its reason in
-- docs/security/rls-deny-by-default-exceptions.json (Samson's Q5 + clash 2
-- ruling). No policy, grant, owner or function is created or changed here.
--
-- Fail closed: if a target table or a SECURITY DEFINER function in public,
-- authz, document_cutover or private is owned by a role with neither rolsuper
-- nor rolbypassrls, FORCE would silently break it (sign-up, the cutover
-- census, definer RPCs), so the precondition raises and nothing is applied.
-- Functions in schema tenant_guard are RLS-bound by design (#2250) and own no
-- table, so they are out of the check. Contract and how a new table complies:
-- docs/security/tenant-guard.md, "Tenant table RLS posture".
--
-- Re-runnable: only tables still missing ENABLE or FORCE are altered. Each
-- ALTER takes an ACCESS EXCLUSIVE lock until commit; apply in a quiet window,
-- on a preview database first.
--
-- Down: run by hand; touches no data and no policy. NO FORCE on every target
-- except crm_notes (forced since 20260818000000_crm_notes.sql), then DISABLE on
-- exactly the three tables that had RLS off before this migration:
--   DO $$ DECLARE r record; BEGIN
--     FOR r IN SELECT c.oid::regclass AS t FROM pg_class c
--       JOIN pg_namespace n ON n.oid = c.relnamespace
--       WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
--         AND c.relname NOT IN ('crm_notes')
--         AND EXISTS (SELECT 1 FROM pg_attribute a
--           WHERE a.attrelid = c.oid AND a.attname = 'tenant_id'
--             AND a.attnum > 0 AND NOT a.attisdropped)
--     LOOP EXECUTE format('ALTER TABLE %s NO FORCE ROW LEVEL SECURITY', r.t);
--     END LOOP; END $$;
--   ALTER TABLE public.donation_saga_outbox DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.email_templates DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.email_template_versions DISABLE ROW LEVEL SECURITY;
-- The loop un-forces every public tenant table present when it runs, not only
-- the ones this file forced. If a later migration added tenant tables that ship
-- their own ENABLE + FORCE, add them to the NOT IN list before running it.

-- Precondition: every target table and app definer function is owned by a
-- role that bypasses RLS.
DO $$
DECLARE
  v_violators TEXT;
BEGIN
  SELECT string_agg(violator, ', ' ORDER BY violator)
  INTO v_violators
  FROM (
    SELECT format('table %I.%I (owner %s)', n.nspname, c.relname, r.rolname) AS violator
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_catalog.pg_roles r ON r.oid = c.relowner
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p')
      AND EXISTS (
        SELECT 1 FROM pg_catalog.pg_attribute a
        WHERE a.attrelid = c.oid AND a.attname = 'tenant_id'
          AND a.attnum > 0 AND NOT a.attisdropped
      )
      AND NOT (r.rolsuper OR r.rolbypassrls)
    UNION ALL
    SELECT format(
      'function %I.%I(%s) (owner %s)',
      n.nspname, p.proname, pg_catalog.pg_get_function_identity_arguments(p.oid), r.rolname
    )
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_catalog.pg_roles r ON r.oid = p.proowner
    WHERE p.prosecdef
      AND n.nspname IN ('public', 'authz', 'document_cutover', 'private')
      AND NOT (r.rolsuper OR r.rolbypassrls)
  ) v;

  IF v_violators IS NOT NULL THEN
    RAISE EXCEPTION 'force_rls_tenant_tables: owner lacks rolsuper and rolbypassrls, FORCE would bind it: %', v_violators
      USING HINT = 'Give the object back to a BYPASSRLS owner, or route RLS-bound work through tenant_guard (docs/security/tenant-guard.md).';
  END IF;
END
$$;

-- ENABLE + FORCE every public tenant table that still lacks either.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.oid::regclass AS t, c.relrowsecurity, c.relforcerowsecurity
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p')
      AND EXISTS (
        SELECT 1 FROM pg_catalog.pg_attribute a
        WHERE a.attrelid = c.oid AND a.attname = 'tenant_id'
          AND a.attnum > 0 AND NOT a.attisdropped
      )
      AND NOT (c.relrowsecurity AND c.relforcerowsecurity)
    ORDER BY c.relname
  LOOP
    IF NOT r.relrowsecurity THEN
      EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', r.t);
    END IF;
    IF NOT r.relforcerowsecurity THEN
      EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', r.t);
    END IF;
  END LOOP;
END
$$;

-- Postcondition: no public tenant table is left without ENABLE or FORCE.
DO $$
DECLARE
  v_missing TEXT;
BEGIN
  SELECT string_agg(c.relname, ', ' ORDER BY c.relname)
  INTO v_missing
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind IN ('r', 'p')
    AND EXISTS (
      SELECT 1 FROM pg_catalog.pg_attribute a
      WHERE a.attrelid = c.oid AND a.attname = 'tenant_id'
        AND a.attnum > 0 AND NOT a.attisdropped
    )
    AND NOT (c.relrowsecurity AND c.relforcerowsecurity);

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'force_rls_tenant_tables: tenant tables without ENABLE + FORCE: %', v_missing;
  END IF;
END
$$;
