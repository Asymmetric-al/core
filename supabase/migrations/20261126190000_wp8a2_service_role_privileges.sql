-- AL-2681 (WP8a part 2; issue 2841; ruling of 26 November 2026 on the third
-- confirmation of #2832, conditions 2a to 2f): `service_role` loses the four
-- table privileges and the schema CREATE that let it step around the seals of
-- the line-based money rows, and the five sealed tables refuse TRUNCATE.
--
-- This amends decision D-111 (21 November 2026: `service_role` keeps every
-- privilege the platform's default privileges give it until WP4's exit) for
-- TRUNCATE, REFERENCES, TRIGGER and MAINTAIN on relations in `public` and for
-- CREATE on schema `authz` only. SELECT, INSERT, UPDATE and DELETE, the
-- sequence privileges and EXECUTE stay as D-111 ruled. The seals of M3
-- (20261126170200: staged gifts and their allocations) and of R1a
-- (20261126020000: line-based intakes), and the "never deleted" seals of
-- 20261126170100 (intake lines) and 20261126170300 (payment observations),
-- hold against TRUNCATE and trigger DDL only from this version on: TRUNCATE
-- fires no row trigger, and a later-sorting BEFORE trigger that `service_role`
-- could create would rewrite a row after the seal had checked it.
--
-- Why. Hosted Supabase gives `postgres` default privileges that grant every
-- new table in `public` all table privileges for `service_role`
-- (scripts/sql/hosted-default-privileges.sql:37), and 70 statements in 28
-- migrations grant it ALL by name; 20261117034926 revoked the four from
-- PUBLIC, `anon` and `authenticated` only. 20260226113000:11 granted CREATE
-- on `authz` to `service_role`, and nothing revoked it. No request the
-- running system accepts uses any of them: the Data API carries no TRUNCATE
-- and no DDL, and no function `service_role` may execute locks or maintains
-- a table (the inventory of issue 2841; tests/unit/acceptance/issue-2681/
-- wp8a-p2-service-role.realstack.acceptance.test.ts).
--
-- What.
-- 1. On every relation in `public` (tables, partitioned tables, views,
--    materialized views, foreign tables), REVOKE TRUNCATE, REFERENCES and
--    TRIGGER, and MAINTAIN on Postgres 17 or later, FROM service_role: the
--    loop of 20261117034926:97-104 for one more role. A table-level REVOKE
--    also removes a column's REFERENCES (none exists).
-- 2. The default privileges of `postgres` in `public`, and its default
--    privileges for every schema (the global entry, which applies in `public`
--    too), no longer grant `service_role` the four on tables, so a table a
--    later migration creates in `public` does not receive them again. Its DML
--    from those defaults stays. The global revoke is a no-op where no global
--    entry exists (as on the replays and the platform's image), and creates
--    none. Default privileges of `postgres` in any other schema, such as the
--    platform's `storage`, which grant `service_role` everything there, are
--    not this file's: it neither changes nor reads them, as stage 1
--    (20261117034926:161-182) and the release job read only `public` and the
--    global entry.
-- 3. REVOKE CREATE ON SCHEMA authz FROM service_role (it keeps USAGE). The
--    post-assert shows that `service_role` holds CREATE on no schema the
--    chain owns (`cms` was closed at 20261117084109:315).
-- What the post-assert reads as `service_role`: its own privileges and those
-- of every role it can use or SET ROLE to (pg_has_role USAGE or SET), so a
-- membership granted WITH INHERIT FALSE, SET TRUE does not hide one.
-- 4. private.refuse_sealed_truncate() and a statement-level BEFORE TRUNCATE
--    trigger, <table>_no_truncate, on each table whose rows carry a "never
--    deleted" seal: public.staged_gifts, public.staged_gift_allocations,
--    public.donations, public.donation_intake_lines and
--    public.payment_observations. It refuses with 23514
--    sealed_table_truncate_refused, naming the table, any TRUNCATE that
--    reaches one of them, by name or by CASCADE (from tenants, donors, funds
--    and the other parents), as any role. The triggers fire in origin mode,
--    not ENABLE ALWAYS: replica mode stays the owner's deliberate way out,
--    as for the row seals. The tables and `private` are owned by `postgres`,
--    which creates the function and the triggers itself; the SET ROLE of the
--    migrations that replace objects owned by `tenant_guard` does not apply.
--    What they do to the operations that clear a database: a reset drops
--    objects (no TRUNCATE trigger fires); supabase/seed.sql clears with
--    DELETE; removeTwoTenants in the tests deletes in replica mode. None
--    truncates, so none is refused. Postgres checks a TRUNCATE's foreign keys
--    before its triggers: a TRUNCATE naming a sealed table without the
--    tables that reference it answers 0A000, as it did before.
-- The catalog gate (scripts/verify/tenant-rls-catalog.mjs) keeps 1 and 3 on
-- every later chain: it fails when `service_role`, or a role it can use or
-- SET ROLE to, holds one of the four on a relation in `public` or CREATE on
-- a schema the release fingerprint covers, unless a reviewed exception names
-- it. It reads no default privileges. So a later migration that grants
-- `service_role` ALL, or one of the four, on a table in `public` fails the
-- gate in CI and in the release (SERVICE_ROLE_UNSAFE_PRIVILEGE): it grants
-- the DML it needs by name instead.
--
-- Locks, taken first and held to COMMIT: SHARE ROW EXCLUSIVE on the five
-- tables in the writers' order (donations, donation_intake_lines,
-- payment_observations, staged_gifts, staged_gift_allocations), which
-- CREATE TRIGGER needs; the revokes change catalog rows only. lock_timeout
-- stops a run rather than queue it behind live traffic.
--
-- A second run of the applied file: the revokes change nothing, and it stops
-- at CREATE FUNCTION private.refuse_sealed_truncate() (42723, function
-- already exists) and changes nothing. This file has committed when this
-- read-only check is true; it answers false, never an error, when the
-- function is absent:
--   SELECT to_regprocedure('private.refuse_sealed_truncate()') IS NOT NULL
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version.
--
-- Hosted order (issue 2841): on each hosted database this file is applied in
-- an earlier release than, or the same release as, the first one that
-- deploys a live writer of a line-based row there. Before that release, read
-- on the database the roles `service_role` can use or SET ROLE to, and the
-- relations in `public` that `postgres` does not own; the post-assert fails
-- the release if one of those roles holds one of the four in `public` or
-- CREATE on a schema of the chain, or if such a relation grants
-- `service_role` one of the four:
--   SELECT r.rolname FROM pg_roles r WHERE r.rolname <> 'service_role'
--     AND (pg_has_role('service_role', r.oid, 'USAGE')
--          OR pg_has_role('service_role', r.oid, 'SET'));
--   SELECT c.relname, pg_get_userbyid(c.relowner) FROM pg_class c
--     WHERE c.relnamespace = 'public'::regnamespace
--     AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
--     AND c.relowner <> 'postgres'::regrole;
-- After that release, this read-only query answers no row:
--   SELECT c.relname, p FROM pg_class c CROSS JOIN unnest(ARRAY['TRUNCATE',
--     'REFERENCES', 'TRIGGER', 'MAINTAIN']) p JOIN pg_roles r
--     ON pg_has_role('service_role', r.oid, 'USAGE')
--     OR pg_has_role('service_role', r.oid, 'SET') WHERE c.oid IN
--     ('public.staged_gifts'::regclass, 'public.staged_gift_allocations'::regclass,
--     'public.donations'::regclass, 'public.donation_intake_lines'::regclass,
--     'public.payment_observations'::regclass)
--     AND has_table_privilege(r.oid, c.oid, p)
--   UNION ALL SELECT 'schema authz', 'CREATE' FROM pg_roles r
--     WHERE (pg_has_role('service_role', r.oid, 'USAGE')
--            OR pg_has_role('service_role', r.oid, 'SET'))
--     AND has_schema_privilege(r.oid, 'authz', 'CREATE');
--
-- Down, an operator's last resort, in one transaction; it locks the five
-- tables first, in the writers' order, then refuses while any of them holds
-- a line-based row. Following 20261117034926, it re-grants nothing:
-- re-granting would reopen what this file closes. After a Down,
-- `service_role` therefore holds a narrower list of privileges than before
-- this file (none of the four in `public`, no CREATE on `authz`, and the
-- narrowed default privileges of `postgres`), and a fingerprint differs
-- from a replay of the earlier chain in those access lists only.
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   LOCK TABLE public.donations, public.donation_intake_lines,
--     public.payment_observations, public.staged_gifts,
--     public.staged_gift_allocations IN ACCESS EXCLUSIVE MODE;
--   DO $$
--   BEGIN
--     IF EXISTS (SELECT 1 FROM public.donations WHERE intake_format = 'line_based')
--        OR EXISTS (SELECT 1 FROM public.donation_intake_lines)
--        OR EXISTS (SELECT 1 FROM public.payment_observations)
--        OR EXISTS (SELECT 1 FROM public.staged_gifts WHERE intake_format = 'line_based')
--        OR EXISTS (SELECT 1 FROM public.staged_gift_allocations WHERE intake_format = 'line_based') THEN
--       RAISE EXCEPTION 'Down of 20261126190000 refused: a line-based row exists' USING ERRCODE = '55000';
--     END IF;
--   END
--   $$;
--   DROP TRIGGER staged_gift_allocations_no_truncate ON public.staged_gift_allocations;
--   DROP TRIGGER staged_gifts_no_truncate ON public.staged_gifts;
--   DROP TRIGGER payment_observations_no_truncate ON public.payment_observations;
--   DROP TRIGGER donation_intake_lines_no_truncate ON public.donation_intake_lines;
--   DROP TRIGGER donations_no_truncate ON public.donations;
--   DROP FUNCTION private.refuse_sealed_truncate();
--   COMMIT;

BEGIN;
SET LOCAL lock_timeout = '5s';

LOCK TABLE public.donations IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.donation_intake_lines IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.payment_observations IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.staged_gifts IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.staged_gift_allocations IN SHARE ROW EXCLUSIVE MODE;

-- 1. The four table privileges on every relation in `public`.
DO $$
DECLARE
  rel record;
BEGIN
  FOR rel IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
    ORDER BY c.relname
  LOOP
    EXECUTE format(
      'REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLE public.%I FROM service_role',
      rel.relname);
    IF current_setting('server_version_num')::int >= 170000 THEN
      EXECUTE format(
        'REVOKE MAINTAIN ON TABLE public.%I FROM service_role',
        rel.relname);
    END IF;
  END LOOP;
END $$;

-- 2. The default privileges of `postgres` in `public` and for every schema.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres
  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM service_role;
DO $$
BEGIN
  IF current_setting('server_version_num')::int >= 170000 THEN
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public '
      'REVOKE MAINTAIN ON TABLES FROM service_role';
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE postgres '
      'REVOKE MAINTAIN ON TABLES FROM service_role';
  END IF;
END $$;

-- 3. CREATE on `authz`.
REVOKE CREATE ON SCHEMA authz FROM service_role;

-- 4. The sealed tables refuse TRUNCATE.
CREATE FUNCTION private.refuse_sealed_truncate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'sealed_table_truncate_refused'
    USING ERRCODE = '23514',
          DETAIL = pg_catalog.format(
            '%I.%I keeps rows that are never deleted; TRUNCATE fires no row trigger, so it is refused for the whole table.',
            TG_TABLE_SCHEMA, TG_TABLE_NAME);
END;
$$;

REVOKE ALL ON FUNCTION private.refuse_sealed_truncate()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER donations_no_truncate
  BEFORE TRUNCATE ON public.donations
  FOR EACH STATEMENT EXECUTE FUNCTION private.refuse_sealed_truncate();
CREATE TRIGGER donation_intake_lines_no_truncate
  BEFORE TRUNCATE ON public.donation_intake_lines
  FOR EACH STATEMENT EXECUTE FUNCTION private.refuse_sealed_truncate();
CREATE TRIGGER payment_observations_no_truncate
  BEFORE TRUNCATE ON public.payment_observations
  FOR EACH STATEMENT EXECUTE FUNCTION private.refuse_sealed_truncate();
CREATE TRIGGER staged_gifts_no_truncate
  BEFORE TRUNCATE ON public.staged_gifts
  FOR EACH STATEMENT EXECUTE FUNCTION private.refuse_sealed_truncate();
CREATE TRIGGER staged_gift_allocations_no_truncate
  BEFORE TRUNCATE ON public.staged_gift_allocations
  FOR EACH STATEMENT EXECUTE FUNCTION private.refuse_sealed_truncate();

-- Post-assert: the end state above holds, or the migration fails.
DO $$
-- post-assert: service_role privileges and sealed truncate
DECLARE
  unsafe text[] := ARRAY['TRUNCATE', 'REFERENCES', 'TRIGGER'];
  problem text;
BEGIN
  IF current_setting('server_version_num')::int >= 170000 THEN
    unsafe := array_append(unsafe, 'MAINTAIN');
  END IF;

  SELECT string_agg(h.held, ', ' ORDER BY h.held)
  INTO problem
  FROM (
    SELECT DISTINCT format('%s %s', c.relname, p) AS held
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    CROSS JOIN unnest(unsafe) AS p
    JOIN pg_roles r ON pg_has_role('service_role', r.oid, 'USAGE')
                    OR pg_has_role('service_role', r.oid, 'SET')
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
      AND (has_table_privilege(r.oid, c.oid, p)
           OR (p = 'REFERENCES'
               AND has_any_column_privilege(r.oid, c.oid, p)))
  ) AS h;
  IF problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2681: service_role still holds in public: %', problem;
  END IF;

  SELECT string_agg(h.held, ', ' ORDER BY h.held)
  INTO problem
  FROM (
    SELECT DISTINCT format('%s %s',
      coalesce(nullif(d.defaclnamespace, 0)::regnamespace::text, 'every schema'),
      a.privilege_type) AS held
    FROM pg_default_acl d
    CROSS JOIN LATERAL aclexplode(d.defaclacl) a
    WHERE d.defaclrole = 'postgres'::regrole
      AND d.defaclnamespace IN ('public'::regnamespace, 0)
      AND d.defaclobjtype = 'r'
      AND a.privilege_type = ANY (unsafe)
      AND (a.grantee = 0 OR EXISTS (
        SELECT 1 FROM pg_roles r
        WHERE r.oid = a.grantee
          AND (pg_has_role('service_role', r.oid, 'USAGE')
               OR pg_has_role('service_role', r.oid, 'SET'))))
  ) AS h;
  IF problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2681: default privileges of postgres in public or for every schema still grant service_role: %', problem;
  END IF;

  SELECT string_agg(n.nspname, ', ' ORDER BY n.nspname)
  INTO problem
  FROM pg_namespace n
  WHERE n.nspname IN ('public', 'authz', 'cms', 'document_cutover', 'platform',
                      'private', 'tenant_guard')
    AND EXISTS (
      SELECT 1 FROM pg_roles r
      WHERE (pg_has_role('service_role', r.oid, 'USAGE')
             OR pg_has_role('service_role', r.oid, 'SET'))
        AND has_schema_privilege(r.oid, n.oid, 'CREATE'));
  IF problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2681: service_role still holds CREATE on schema: %', problem;
  END IF;

  SELECT string_agg(t.relname, ', ' ORDER BY t.relname)
  INTO problem
  FROM unnest(ARRAY['staged_gifts', 'staged_gift_allocations', 'donations',
                    'donation_intake_lines', 'payment_observations']) AS t(relname)
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_trigger g
    WHERE g.tgrelid = format('public.%I', t.relname)::regclass
      AND g.tgname = t.relname || '_no_truncate'
      AND g.tgenabled = 'O'
      AND g.tgtype::int = 34
      AND g.tgfoid = 'private.refuse_sealed_truncate()'::regprocedure);
  IF problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2681: a sealed table lacks its TRUNCATE refusal: %', problem;
  END IF;
END $$;

COMMIT;
