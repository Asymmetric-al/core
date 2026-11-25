-- AL-2676, WP3b part 3 (plan 12 WP3 lines 917 and 926; ruling WP3b part 3
-- Q1-Q4): the staff read behind Mission Control's Sites settings.
--   tenant_guard.tenant_site_settings(uuid), a tenant_guard SECURITY DEFINER
--   human entry point that opens with tenant_guard.begin_human_command(p_tenant_id,
--   'sites.manage') and returns, for the tenant the preamble entered only,
--   { "sites": [ { id, name, is_default, status, primary_domain } ],
--     "brand": { "display_name" } | null }, the default Site first, then by
--   name, then by id. It takes no lock and writes nothing (no audit row, as
--   tenant_guard.list_payment_legal_entities); it reads no other table.
--   public.tenant_site_settings(uuid), its SECURITY INVOKER wrapper.
-- No command, table, trigger, grant or policy of WP3a changes.
--
-- Why a function and not a policy: a policy needs a table SELECT grant to
-- authenticated on WP3a's tables, which this part may not change, and would
-- show every column to every staff member of the tenant unless it tested the
-- capability per row. The function gives five Site fields and one brand
-- field, only to a caller whose selected assignment holds sites.manage in the
-- tenant the request names (x-asym-tenant), through the lane every command
-- uses, and changes no grant. It is VOLATILE because the preamble enters the
-- tenant (tenant_guard.enter). Neither function is STRICT: the preamble
-- answers a NULL tenant with 22004.
--
-- Field policies: no row changes (ruling Q3). The read returns only
-- classified columns, each visible on mission_control and nowhere else:
-- sites.id, is_default and primary_domain internal, sites.name contact,
-- sites.status care, donor_account_brands.display_name contact.
--
-- Grants: REVOKE ALL on each function FROM PUBLIC, anon, authenticated and
-- service_role by name, then GRANT EXECUTE TO authenticated only. The guard
-- function is owned by tenant_guard (GRANT CREATE ON SCHEMA, ALTER OWNER,
-- REVOKE CREATE), the wrapper by postgres. No table grant changes.
--
-- Locks, all held to COMMIT (observed in pg_locks for the session, the
-- file's statements run in an open transaction): ACCESS EXCLUSIVE object
-- locks on the two new functions, which no other session can see before
-- COMMIT, and ACCESS SHARE object locks on the schemas tenant_guard and
-- public, the owner roles and the function language; no lock on any table.
-- The plpgsql body is not analysed at creation, and the SQL wrapper's body
-- names only a function. SET LOCAL lock_timeout = '5s' stops a run rather
-- than queue it.
--
-- Recovery. Nothing here is written to run twice: a run lost between its
-- COMMIT and its ledger row stops on the next run at its first CREATE,
-- CREATE FUNCTION tenant_guard.tenant_site_settings (42723, the function
-- already exists), and rolls back with nothing changed (observed on a second
-- run of the applied file). This file has committed when this read-only check
-- is true; it reads false, and never raises, before:
--   SELECT to_regprocedure('tenant_guard.tenant_site_settings(uuid)') IS NOT NULL
--      AND to_regprocedure('public.tenant_site_settings(uuid)') IS NOT NULL;
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261126130000. It has no preflight or post-assert of its own.
--
-- Down (one transaction; nothing in the database depends on either function):
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   DROP FUNCTION public.tenant_site_settings(uuid);
--   DROP FUNCTION tenant_guard.tenant_site_settings(uuid);
--   NOTIFY pgrst, 'reload schema';
--   COMMIT;
--
-- Read-only check after the release (two rows; no row and no error while the
-- functions are absent; the empty search path prints both names with their
-- schema):
--   SET search_path = '';
--   SELECT p.oid::regprocedure::text AS fn, p.prosecdef, p.provolatile, p.proisstrict,
--          p.proowner::regrole::text AS owner, p.proconfig,
--          (SELECT COALESCE(array_agg(CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE a.grantee::regrole::text END
--                                     ORDER BY a.grantee), '{}')
--             FROM aclexplode(p.proacl) a
--            WHERE a.privilege_type = 'EXECUTE' AND a.grantee <> p.proowner) AS execute_grantees
--     FROM pg_proc p
--    WHERE p.oid IN (to_regprocedure('tenant_guard.tenant_site_settings(uuid)'),
--                    to_regprocedure('public.tenant_site_settings(uuid)'))
--    ORDER BY fn;
--   -- public.tenant_site_settings(uuid): f, v, f, postgres, {search_path=""}, {authenticated}
--   -- tenant_guard.tenant_site_settings(uuid): t, v, f, tenant_guard, {search_path=""}, {authenticated}
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE FUNCTION tenant_guard.tenant_site_settings(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_sites jsonb;
  v_brand text;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'sites.manage');

  SELECT COALESCE(
           pg_catalog.jsonb_agg(
             pg_catalog.jsonb_build_object(
               'id', s.id,
               'name', s.name,
               'is_default', s.is_default,
               'status', s.status,
               'primary_domain', s.primary_domain
             )
             ORDER BY s.is_default DESC, s.name, s.id
           ),
           '[]'::jsonb
         )
    INTO v_sites
    FROM public.sites AS s
   WHERE s.tenant_id = v_ctx.tenant_id;

  SELECT b.display_name
    INTO v_brand
    FROM public.donor_account_brands AS b
   WHERE b.tenant_id = v_ctx.tenant_id;

  RETURN pg_catalog.jsonb_build_object(
    'sites', v_sites,
    'brand', CASE
               WHEN v_brand IS NULL THEN NULL
               ELSE pg_catalog.jsonb_build_object('display_name', v_brand)
             END
  );
END;
$$;

REVOKE ALL ON FUNCTION tenant_guard.tenant_site_settings(uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.tenant_site_settings(uuid) TO authenticated;

-- The guard owns its read, so it runs without bypassing row security.
GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.tenant_site_settings(uuid) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE FUNCTION public.tenant_site_settings(p_tenant_id uuid)
RETURNS jsonb LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path = ''
AS $$ SELECT tenant_guard.tenant_site_settings(p_tenant_id); $$;

ALTER FUNCTION public.tenant_site_settings(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.tenant_site_settings(uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.tenant_site_settings(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
