-- AL-2676, WP3b part 2 (OpenSpec adopt-tenant-owned-domains, task 2.2; plan 12
-- WP3 lines 906-907; ruling WP3b part 2 Q1 and Q6): the home read behind the
-- redirect of a Site name's account paths to its organization's home.
--   public.resolve_home_host(text), the anonymous read of one name: the home
--   record's primary_domain, only when the asked name is active and serves
--   website, the same organization's home record names a host, that host is
--   not the asked one, and that host is active and serves donor_account;
--   otherwise nothing. It returns no tenant, Site, generation, status or
--   brand, takes no tenant ID and reads no status.
--   public.field_policies: donor_portal_hosts.primary_domain becomes category
--   public, visible on the public surface (its five tenant_id IS NULL rows).
-- public.resolve_verified_host(text) is not changed.
--
-- Locks, all held to COMMIT (observed in pg_locks for the session, the
-- file's statements run in an open transaction): CREATE FUNCTION takes ACCESS
-- SHARE on public.site_domains and public.donor_portal_hosts while its SQL
-- body is checked; the UPDATE takes ROW EXCLUSIVE on public.field_policies
-- and its index field_policies_lookup_key. ACCESS SHARE conflicts only with
-- ACCESS EXCLUSIVE, so no read or write of the live build waits on it.
-- SET LOCAL lock_timeout = '5s' stops a run rather than queue it.
--
-- Recovery. Nothing here is written to run twice: a run lost between its
-- COMMIT and its ledger row stops on the next run at its first CREATE,
-- CREATE FUNCTION public.resolve_home_host (42723, the function already
-- exists), and rolls back with public.field_policies unchanged (observed on
-- a second run of the applied file). This file has committed when this
-- read-only check is true; it reads false, and never raises, before:
--   SELECT to_regprocedure('public.resolve_home_host(text)') IS NOT NULL
--      AND EXISTS (SELECT 1 FROM public.field_policies
--                   WHERE record_type = 'donor_portal_hosts' AND field_key = 'primary_domain'
--                     AND surface = 'public' AND tenant_id IS NULL
--                     AND visible AND sensitivity_category = 'public');
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261126030000. It has no preflight or post-assert of its own.
--
-- Grants: REVOKE ALL on the function FROM PUBLIC, anon, authenticated and
-- service_role by name, then GRANT EXECUTE TO anon, authenticated and
-- service_role (docs/security/anon-definer-allowlist.json). No table grant
-- changes: no client role reads sites, site_domains, donor_portal_hosts or
-- donor_account_brands.
--
-- Down (one transaction; nothing else depends on it):
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   DROP FUNCTION public.resolve_home_host(text);
--   UPDATE public.field_policies
--      SET sensitivity_category = 'internal', visible = (surface = 'mission_control')
--    WHERE record_type = 'donor_portal_hosts' AND field_key = 'primary_domain'
--      AND tenant_id IS NULL;
--   NOTIFY pgrst, 'reload schema';
--   COMMIT;
--
-- Read-only check after the release (expect one row: t, s, t, postgres,
-- {search_path=""}, {anon,authenticated,service_role}, no PUBLIC; no row and
-- no error while the function is absent; then the manifest's five rows:
-- mission_control and public visible, none editable or exportable, every
-- category public):
--   SELECT p.prosecdef, p.provolatile, p.proisstrict, p.proowner::regrole, p.proconfig,
--          (SELECT array_agg(g.grantee ORDER BY g.grantee)
--             FROM (SELECT CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE a.grantee::regrole::text END AS grantee
--                     FROM aclexplode(p.proacl) AS a
--                    WHERE a.privilege_type = 'EXECUTE' AND a.grantee <> p.proowner) AS g)
--     FROM pg_proc AS p WHERE p.oid = to_regprocedure('public.resolve_home_host(text)');
--   SELECT surface, visible, editable, exportable, sensitivity_category
--     FROM public.field_policies
--    WHERE record_type = 'donor_portal_hosts' AND field_key = 'primary_domain'
--      AND tenant_id IS NULL ORDER BY surface;
BEGIN;
SET LOCAL lock_timeout = '5s';

-- The asked host is normalised with resolve_verified_host's expression, copied
-- verbatim (tests/unit/auth/home-name-contract.test.ts holds the two texts
-- equal). The home record's composite foreign key keeps the answer in the
-- asked name's organization.
CREATE FUNCTION public.resolve_home_host(p_host text)
RETURNS TABLE (primary_domain text)
LANGUAGE sql STABLE STRICT SECURITY DEFINER SET search_path = '' AS $$
  SELECT home.primary_domain
    FROM public.site_domains AS asked
    JOIN public.donor_portal_hosts AS home
      ON home.tenant_id = asked.tenant_id
    JOIN public.site_domains AS target
      ON target.tenant_id = home.tenant_id AND target.host = home.primary_domain
   WHERE asked.host = CASE
           WHEN pg_catalog.octet_length(p_host) <= 300
           THEN pg_catalog.lower(pg_catalog.regexp_replace(p_host COLLATE "C", '\.?(:[0-9]+)?$', ''))
         END
     AND asked.state = 'active'
     AND 'website' = ANY (asked.surfaces)
     AND home.primary_domain IS NOT NULL
     AND home.primary_domain <> asked.host
     AND target.state = 'active'
     AND 'donor_account' = ANY (target.surfaces);
$$;
ALTER FUNCTION public.resolve_home_host(text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.resolve_home_host(text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.resolve_home_host(text) TO anon,authenticated,service_role;

-- Ruling WP3b part 2 Q1: the home name is where every redirect sends a
-- person, so it is public, shown on the public surface only, never editable
-- or exportable. sites.primary_domain and site_domains.host stay internal;
-- scripts/verify/field-policy-census.mjs holds the reviewed floor exception.
UPDATE public.field_policies
   SET sensitivity_category = 'public',
       visible = surface IN ('mission_control','public')
 WHERE record_type = 'donor_portal_hosts'
   AND field_key = 'primary_domain'
   AND tenant_id IS NULL;

NOTIFY pgrst, 'reload schema';
COMMIT;
