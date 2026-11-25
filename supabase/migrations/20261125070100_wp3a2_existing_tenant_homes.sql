-- AL-2676, WP3a part 2a, Migration B (ruling Q1 (a); record section 9, owed by
-- "WP3b re-scope, N2, N5, N6, N7, WP3a part 2, WP7 and WP10": "a default Site,
-- home record and brand per hosted tenant"). The one-off backfill for the
-- organizations that already exist; new ones get the same rows from
-- platform.provision_tenant.
--
-- 1. Data only: it creates, changes and drops no object.
-- 2. It calls private.ensure_tenant_home (previous migration) once for every
--    organization, whatever its status: active, suspended or closed.
-- 3. It writes only the three rows that helper writes where missing: a default
--    Site, a home record and a brand, each named after the organization. No
--    legal entity, fund, approval-policy row, invitation, step record or
--    claimed name. It invents no claimed name: the Site's and the home
--    record's primary_domain stay null. A row that exists is kept as it is.
-- 4. Locks: SHARE ROW EXCLUSIVE on public.tenants until COMMIT, which waits
--    for, and blocks, only writes to tenants (no live build writes it);
--    FOR SHARE on each organization row (inside the helper); ROW EXCLUSIVE on
--    public.sites, public.donor_portal_hosts and public.donor_account_brands.
--    lock_timeout makes it fail rather than queue behind a long writer.
-- 5. Before the release, each hosted database must return the read-only facts
--    1 to 4 of the WP3a part 2 index, section 5, with fact 3 (organization
--    names that cannot name a Site or brand) at 0. If it is not 0, the
--    preflight below refuses with a count only: find the rows by hand, out of
--    band, without logging an ID, name or slug, and correct them first.
-- 6. Down: forward only for data. Before any Site command, claimed name or
--    provisioning has written, one transaction may delete, for organizations
--    with no claimed-name row: the brands; the home records whose domain is
--    null; the default Sites whose domain is null.
BEGIN;
SET LOCAL lock_timeout = '5s';
LOCK TABLE public.tenants IN SHARE ROW EXCLUSIVE MODE;

DO $$
DECLARE
  v_invalid bigint;
BEGIN
  -- An organization whose name the Site and brand check refuses would stop
  -- the backfill part way; refuse the whole migration first, reporting the
  -- count only, never an ID, name or slug.
  SELECT pg_catalog.count(*)
    INTO v_invalid
    FROM public.tenants AS t
   WHERE (t.name !~ '^[[:space:]]|[[:space:]]$' AND pg_catalog.length(t.name) BETWEEN 1 AND 160) IS NOT TRUE;
  IF v_invalid > 0 THEN
    RAISE EXCEPTION 'WP3a part 2 backfill preflight: organizations whose name cannot name a Site or brand=%', v_invalid
      USING ERRCODE = '22023',
            HINT = 'Nothing was changed. Correct those names by hand, out of band, then release again.';
  END IF;
END $$;

DO $$
BEGIN
  PERFORM private.ensure_tenant_home(t.id) FROM public.tenants AS t ORDER BY t.id;
END $$;
COMMIT;
