-- AL-2674 (WP1 slice 1.1a; plan 5.4, 7.1, 7.4, 7.5; NR-42, D11): the
-- `platform` schema. It holds the environment marker, the expected migration
-- heads, the health function, and the shared operator check that every
-- cross-tenant platform command calls.
--
-- Reachability (plan 7.1): `platform` is not exposed through the Data API.
-- `service_role` reaches the health function through `public.platform_health()`
-- and nothing else here. Signed-in users get USAGE so that the `public` invoker
-- wrapper of each platform command can reach it; they hold EXECUTE on platform
-- commands only, and there are none yet (WP3 ships the first). No table here
-- is granted to anyone: each has row security forced and no policy.
--
-- Platform command convention (plan 5.4), for the packages that add them:
--   CREATE FUNCTION platform.<command>(...) RETURNS jsonb
--     LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
--     DECLARE v_operator uuid := platform.require_operator(); ...
--   owned by postgres; REVOKE ALL ... FROM PUBLIC, anon, authenticated,
--   service_role; GRANT EXECUTE ... TO authenticated. Reached through a
--   `public` SECURITY INVOKER wrapper with `SET search_path = ''`, owned by
--   postgres, EXECUTE for authenticated only. The catalog gate fails a
--   `platform` function that `authenticated` can execute unless its outer
--   DECLARE section initialises a variable from `platform.require_operator()`,
--   and any definer here that postgres does not own. The full convention and
--   the gate codes: docs/security/tenant-guard.md, "Command lane".
--
-- The operator list is WP2c's (`authz.platform_operators`). Until it exists,
-- `platform.caller_on_operator_list()` returns false, so the shared check
-- refuses everyone: it fails closed. WP2c replaces that one function's body,
-- keeping its signature, owner and grants.
--
-- Environment marker (plan 7.5): one row, `disposable`, `shared` or
-- `production`. Seed and reset scripts read it from their target and refuse
-- anything but `disposable`; a database without the row counts as not
-- disposable. The value moves only forward, through
-- `platform.advance_environment()`, which only the owner (the release job's
-- dispatched step) can call, and which never writes `disposable`. Its two
-- triggers are ALWAYS triggers, so `session_replication_role = replica`, which
-- skips ordinary triggers, does not skip them. That is all ALWAYS stops: the
-- table's owner can still disable them (ALTER TABLE ... DISABLE TRIGGER, as a
-- data-only restore with --disable-triggers does) and, on re-enabling them
-- with a plain ENABLE TRIGGER, gets ordinary triggers back. Only the owner
-- (postgres) or a superuser can do either.
--
-- This migration writes `disposable` only on a database whose profiles,
-- donors and donations are empty, that is, one being built from source. It
-- tests only what a rebuild clears: a hosted reset keeps `auth.users`, so a
-- login that survives a rebuild must not stop the rebuilt database from being
-- marked. Applied forward to a database that holds people or gifts (a hosted
-- project migrated in place instead of rebuilt; both hosted projects hold
-- profiles and donations today), it writes no marker, and nothing can make
-- that database `disposable` later: not the release job, and not an explicit
-- insert. Only a rebuild from source (the release job's one-off first rebuild,
-- plan 7.5) gives such a database the marker.
--
-- Down (run by hand): DROP FUNCTION public.platform_health(); DROP SCHEMA
--   platform CASCADE.

BEGIN;

CREATE SCHEMA IF NOT EXISTS platform;
ALTER SCHEMA platform OWNER TO postgres;
REVOKE ALL ON SCHEMA platform FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA platform TO authenticated, service_role;

-- 1. Environment marker.
CREATE TABLE IF NOT EXISTS platform.environment (
  singleton BOOLEAN PRIMARY KEY DEFAULT true
    CONSTRAINT environment_singleton CHECK (singleton),
  kind TEXT NOT NULL
    CONSTRAINT environment_kind_known CHECK (kind IN ('disposable', 'shared', 'production')),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  changed_by TEXT NOT NULL DEFAULT SESSION_USER
);

ALTER TABLE platform.environment OWNER TO postgres;
ALTER TABLE platform.environment ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.environment FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE platform.environment FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON TABLE platform.environment IS
  'Environment marker (plan 7.5). Reset and seed scripts refuse a database '
  'whose marker is missing or is not disposable. Forward only.';

-- Whether the database holds a person or a gift: a profile, a donor or a
-- donation. These are what a rebuild from source clears; `auth.users` is not
-- tested, because a hosted reset keeps it (see the header).
CREATE OR REPLACE FUNCTION platform.holds_people_or_gifts()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles)
      OR EXISTS (SELECT 1 FROM public.donors)
      OR EXISTS (SELECT 1 FROM public.donations);
$$;

-- Keeps the marker forward only: no delete, no truncate, no move back, and no
-- `disposable` row on a database that holds people or gifts.
CREATE OR REPLACE FUNCTION platform.guard_environment_marker()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_rank CONSTANT JSONB := '{"disposable": 0, "shared": 1, "production": 2}';
BEGIN
  IF TG_OP IN ('DELETE', 'TRUNCATE') THEN
    RAISE EXCEPTION 'platform: the environment marker cannot be removed'
      USING ERRCODE = '42501';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.kind = 'disposable' AND platform.holds_people_or_gifts() THEN
      RAISE EXCEPTION 'platform: a database that holds people or gifts cannot be marked disposable'
        USING ERRCODE = '42501';
    END IF;
  ELSIF (v_rank ->> NEW.kind)::INTEGER < (v_rank ->> OLD.kind)::INTEGER THEN
    RAISE EXCEPTION 'platform: the environment marker moves forward only (% to % refused)', OLD.kind, NEW.kind
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS environment_marker_forward_only ON platform.environment;
CREATE TRIGGER environment_marker_forward_only
  BEFORE INSERT OR UPDATE OR DELETE ON platform.environment
  FOR EACH ROW EXECUTE FUNCTION platform.guard_environment_marker();

DROP TRIGGER IF EXISTS environment_marker_no_truncate ON platform.environment;
CREATE TRIGGER environment_marker_no_truncate
  BEFORE TRUNCATE ON platform.environment
  FOR EACH STATEMENT EXECUTE FUNCTION platform.guard_environment_marker();

-- Ordinary triggers do not fire under `session_replication_role = replica`,
-- which hosted Supabase lets `postgres` set. ALWAYS triggers do.
ALTER TABLE platform.environment ENABLE ALWAYS TRIGGER environment_marker_forward_only;
ALTER TABLE platform.environment ENABLE ALWAYS TRIGGER environment_marker_no_truncate;

-- The marker, or NULL when the database has none. Reset scripts call it as
-- the database owner.
CREATE OR REPLACE FUNCTION platform.environment_kind()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT e.kind FROM platform.environment AS e;
$$;

-- The release job's dispatched step, on the owner's approval: moves the marker
-- forward to `shared` or `production`, or sets it on a database that has
-- none. `disposable` is written only by the migration on a database built
-- from source.
CREATE OR REPLACE FUNCTION platform.advance_environment(p_kind TEXT)
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF p_kind IS NULL OR p_kind NOT IN ('shared', 'production') THEN
    RAISE EXCEPTION 'platform: the environment marker can only be advanced to shared or production'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO platform.environment (singleton, kind)
  VALUES (true, p_kind)
  ON CONFLICT (singleton) DO UPDATE
    SET kind = EXCLUDED.kind,
        changed_at = pg_catalog.now(),
        changed_by = SESSION_USER;

  RETURN platform.environment_kind();
END;
$$;

INSERT INTO platform.environment (singleton, kind)
SELECT true, 'disposable'
WHERE NOT platform.holds_people_or_gifts()
ON CONFLICT (singleton) DO NOTHING;

-- 2. Expected migration heads, written by the release job after the catalog
-- gates pass (plan 7.4). A health check compares the heads its application
-- was built against with these; a database that is behind blocks promotion
-- and one that is ahead passes.
CREATE TABLE IF NOT EXISTS platform.migration_heads (
  ledger TEXT PRIMARY KEY
    CONSTRAINT migration_heads_ledger_known CHECK (ledger IN ('supabase', 'payload')),
  head TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  CONSTRAINT migration_heads_head_format CHECK (
    (ledger = 'supabase' AND head ~ '^[0-9]{14}$')
    OR (ledger = 'payload' AND head ~ '^[0-9]{8}_[0-9]{6}(_[A-Za-z0-9_-]+)?$')
  )
);

ALTER TABLE platform.migration_heads OWNER TO postgres;
ALTER TABLE platform.migration_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.migration_heads FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE platform.migration_heads FROM PUBLIC, anon, authenticated, service_role;

-- The release job's writer. A malformed head fails the table's checks; a
-- well-formed head moves forward only, and an equal head is re-recorded.
CREATE OR REPLACE FUNCTION platform.record_migration_head(p_ledger TEXT, p_head TEXT)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO platform.migration_heads AS h (ledger, head)
  VALUES (p_ledger, p_head)
  ON CONFLICT (ledger) DO UPDATE
    SET head = EXCLUDED.head,
        recorded_at = pg_catalog.now()
    WHERE h.head <= EXCLUDED.head;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'platform: the % migration head moves forward only (% refused)', p_ledger, p_head
      USING ERRCODE = '22023';
  END IF;
END;
$$;

-- 3. The health function (plan 7.4): the read-only function each
-- application's health route calls with the service key. `expected_heads` is
-- what the job recorded; `applied_heads.supabase` is the newest version in the
-- Supabase CLI's ledger, or null where that ledger is absent (a database built
-- by psql). The application compares its build-time heads with
-- `expected_heads`; a missing expected head counts as behind.
CREATE OR REPLACE FUNCTION platform.health()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_applied_supabase TEXT;
BEGIN
  IF pg_catalog.to_regclass('supabase_migrations.schema_migrations') IS NOT NULL THEN
    SELECT pg_catalog.max(m.version) INTO v_applied_supabase
      FROM supabase_migrations.schema_migrations AS m;
  END IF;

  RETURN pg_catalog.jsonb_build_object(
    'environment', platform.environment_kind(),
    'expected_heads', COALESCE(
      (SELECT pg_catalog.jsonb_object_agg(h.ledger, h.head) FROM platform.migration_heads AS h),
      '{}'::JSONB
    ),
    'applied_heads', pg_catalog.jsonb_build_object('supabase', v_applied_supabase),
    'checked_at', pg_catalog.now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.platform_health()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT platform.health();
$$;

COMMENT ON FUNCTION public.platform_health() IS
  'Release health (plan 7.4, AL-2674): environment marker, expected and applied '
  'migration heads. EXECUTE for service_role only.';

-- 4. The shared operator check (plan 5.4). WP2c supplies the operator list
-- by replacing caller_on_operator_list(); until then it returns false and
-- every platform command refuses its caller.
CREATE OR REPLACE FUNCTION platform.caller_on_operator_list()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT false;
$$;

-- The first statement of every platform command. Returns the operator's user
-- id, or refuses (42501): no signed-in caller, a caller not on the operator
-- list, or a session without a second factor (aal2).
CREATE OR REPLACE FUNCTION platform.require_operator()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_actor UUID := auth.uid();
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'platform: a platform command needs a signed-in caller'
      USING ERRCODE = '42501';
  END IF;

  IF NOT COALESCE(platform.caller_on_operator_list(), false) THEN
    RAISE EXCEPTION 'platform: the caller is not a platform operator'
      USING ERRCODE = '42501';
  END IF;

  IF COALESCE(auth.jwt() ->> 'aal', '') <> 'aal2' THEN
    RAISE EXCEPTION 'platform: a platform command needs a session verified with a second factor'
      USING ERRCODE = '42501';
  END IF;

  RETURN v_actor;
END;
$$;

-- 5. Ownership and EXECUTE, by name for every role (hosted Supabase grants
-- EXECUTE on new public functions to anon, authenticated and service_role by
-- default; docs/security/function-execute-grants.md).
ALTER FUNCTION platform.holds_people_or_gifts() OWNER TO postgres;
ALTER FUNCTION platform.guard_environment_marker() OWNER TO postgres;
ALTER FUNCTION platform.environment_kind() OWNER TO postgres;
ALTER FUNCTION platform.advance_environment(TEXT) OWNER TO postgres;
ALTER FUNCTION platform.record_migration_head(TEXT, TEXT) OWNER TO postgres;
ALTER FUNCTION platform.health() OWNER TO postgres;
ALTER FUNCTION public.platform_health() OWNER TO postgres;
ALTER FUNCTION platform.caller_on_operator_list() OWNER TO postgres;
ALTER FUNCTION platform.require_operator() OWNER TO postgres;

REVOKE ALL ON FUNCTION platform.holds_people_or_gifts() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION platform.guard_environment_marker() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION platform.environment_kind() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION platform.advance_environment(TEXT) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION platform.record_migration_head(TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION platform.health() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.platform_health() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION platform.caller_on_operator_list() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION platform.require_operator() FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION platform.health() TO service_role;
GRANT EXECUTE ON FUNCTION public.platform_health() TO service_role;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
