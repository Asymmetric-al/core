-- Down: run by hand; touches no data. Drop the three own-row policies, then
-- remove every anon / authenticated / PUBLIC privilege again (the pre-#2260
-- deny-by-default state; service_role is not touched):
--   DROP POLICY IF EXISTS donor_feed_preferences_own_select ON public.donor_feed_preferences;
--   DROP POLICY IF EXISTS donor_feed_preferences_own_insert ON public.donor_feed_preferences;
--   DROP POLICY IF EXISTS donor_feed_preferences_own_update ON public.donor_feed_preferences;
--   REVOKE ALL ON TABLE public.donor_feed_preferences FROM PUBLIC, anon, authenticated;
-- Then re-add the donor_feed_preferences entry to
-- docs/security/rls-deny-by-default-exceptions.json (service_role_needed), or
-- the #2253 RLS catalog gate fails on a policy-less, unlisted tenant table.
--
-- #2260: a signed-in donor reads and saves their own feed preferences through
-- the user-JWT route (packages/api/src/feed-preferences/index.ts), so the
-- database, not the route, decides which rows they can touch.
--
-- authenticated gets SELECT, INSERT, UPDATE (no DELETE, no TRUNCATE) and three
-- own-row policies. A row is visible or writable only when its tenant_id is the
-- caller's JWT tenant (authz.current_tenant_id(), NULL without a valid claim)
-- and its donor_id is a donor in that same tenant whose profile belongs to
-- auth.uid(). anon and PUBLIC keep nothing. service_role (donor portal, through
-- the admin client) is unchanged.
--
-- Hosted Supabase grants ALL on new public tables to anon and authenticated by
-- default privileges; CI does not emulate that. So the REVOKE below is explicit
-- and runs before the GRANT, which also clears any column-level grant.
--
-- Needs #2251 (20261025070000_force_rls_tenant_tables.sql): the precondition
-- raises unless the table already has ENABLE + FORCE row level security.
-- Re-runnable: REVOKE / GRANT are idempotent and each policy is dropped before
-- it is created. No function, publication, column or row is changed.
-- Contract and threat model: docs/security/donor-feed-preferences-rls.md.

BEGIN;

DO $$
DECLARE
  v_rls BOOLEAN;
  v_force BOOLEAN;
BEGIN
  SELECT c.relrowsecurity, c.relforcerowsecurity
  INTO v_rls, v_force
  FROM pg_catalog.pg_class c
  WHERE c.oid = to_regclass('public.donor_feed_preferences');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'donor_feed_preferences_own_rows: public.donor_feed_preferences does not exist';
  END IF;

  IF NOT (v_rls AND v_force) THEN
    RAISE EXCEPTION 'donor_feed_preferences_own_rows: public.donor_feed_preferences needs ENABLE + FORCE row level security from #2251 (20261025070000_force_rls_tenant_tables.sql) first'
      USING HINT = 'Apply #2251 before this migration.';
  END IF;
END
$$;

REVOKE ALL ON TABLE public.donor_feed_preferences FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.donor_feed_preferences TO authenticated;

DROP POLICY IF EXISTS donor_feed_preferences_own_select ON public.donor_feed_preferences;
CREATE POLICY donor_feed_preferences_own_select
  ON public.donor_feed_preferences
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND EXISTS (
      SELECT 1
      FROM public.donors d
      JOIN public.profiles p ON p.id = d.profile_id
      WHERE d.id = donor_feed_preferences.donor_id
        AND d.tenant_id = donor_feed_preferences.tenant_id
        AND p.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS donor_feed_preferences_own_insert ON public.donor_feed_preferences;
CREATE POLICY donor_feed_preferences_own_insert
  ON public.donor_feed_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = (SELECT authz.current_tenant_id())
    AND EXISTS (
      SELECT 1
      FROM public.donors d
      JOIN public.profiles p ON p.id = d.profile_id
      WHERE d.id = donor_feed_preferences.donor_id
        AND d.tenant_id = donor_feed_preferences.tenant_id
        AND p.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS donor_feed_preferences_own_update ON public.donor_feed_preferences;
CREATE POLICY donor_feed_preferences_own_update
  ON public.donor_feed_preferences
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND EXISTS (
      SELECT 1
      FROM public.donors d
      JOIN public.profiles p ON p.id = d.profile_id
      WHERE d.id = donor_feed_preferences.donor_id
        AND d.tenant_id = donor_feed_preferences.tenant_id
        AND p.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    tenant_id = (SELECT authz.current_tenant_id())
    AND EXISTS (
      SELECT 1
      FROM public.donors d
      JOIN public.profiles p ON p.id = d.profile_id
      WHERE d.id = donor_feed_preferences.donor_id
        AND d.tenant_id = donor_feed_preferences.tenant_id
        AND p.user_id = (SELECT auth.uid())
    )
  );

-- Postcondition: exactly the three policies; anon holds nothing; authenticated
-- holds exactly SELECT, INSERT, UPDATE at table level and nothing per column.
DO $$
DECLARE
  v_policies TEXT;
  v_anon TEXT;
  v_authenticated TEXT;
  v_columns TEXT;
BEGIN
  SELECT string_agg(format('%s:%s:%s', policyname, cmd, roles::text), ', ' ORDER BY policyname)
  INTO v_policies
  FROM pg_catalog.pg_policies
  WHERE schemaname = 'public' AND tablename = 'donor_feed_preferences';

  IF v_policies IS DISTINCT FROM
    'donor_feed_preferences_own_insert:INSERT:{authenticated}, '
    'donor_feed_preferences_own_select:SELECT:{authenticated}, '
    'donor_feed_preferences_own_update:UPDATE:{authenticated}'
  THEN
    RAISE EXCEPTION 'donor_feed_preferences_own_rows: unexpected policies: %', v_policies;
  END IF;

  SELECT
    string_agg(p, ',' ORDER BY p) FILTER (WHERE has_table_privilege('anon', 'public.donor_feed_preferences', p)),
    string_agg(p, ',' ORDER BY p) FILTER (WHERE has_table_privilege('authenticated', 'public.donor_feed_preferences', p))
  INTO v_anon, v_authenticated
  FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) AS p;

  IF v_anon IS NOT NULL THEN
    RAISE EXCEPTION 'donor_feed_preferences_own_rows: anon still holds %', v_anon;
  END IF;

  IF v_authenticated IS DISTINCT FROM 'INSERT,SELECT,UPDATE' THEN
    RAISE EXCEPTION 'donor_feed_preferences_own_rows: authenticated holds % (expected INSERT,SELECT,UPDATE)', v_authenticated;
  END IF;

  SELECT string_agg(format('%s:%s', a.attname, r.rolname), ', ' ORDER BY a.attname, r.rolname)
  INTO v_columns
  FROM pg_catalog.pg_attribute a
  CROSS JOIN LATERAL aclexplode(a.attacl) x
  JOIN pg_catalog.pg_roles r ON r.oid = x.grantee
  WHERE a.attrelid = 'public.donor_feed_preferences'::regclass
    AND a.attacl IS NOT NULL
    AND r.rolname IN ('anon', 'authenticated');

  IF v_columns IS NOT NULL THEN
    RAISE EXCEPTION 'donor_feed_preferences_own_rows: column-level privileges remain: %', v_columns;
  END IF;
END
$$;

COMMIT;
