-- AL-2675 (WP2c, part 1; plan 5.1, 5.4, 5.5 and 12 WP2c; record section 9):
-- the platform operator list and the shared operator check.
--
-- 1. `authz.platform_operators`, the operator list (plan 5.4): one row per
--    login that is a platform operator. Row security is forced and there is
--    no policy, and no privilege for signed-in, anonymous or service users:
--    only the owner reads it, inside the functions below, and its one writer
--    is the operator script (`scripts/platform/operators.mjs`), which the
--    release job's owner runs as `postgres`. There is no platform command,
--    wrapper or screen for managing operators. A login on the list cannot be
--    deleted while it is there (ON DELETE RESTRICT), so the list loses a row
--    only through the script, which writes the audit row and refuses to
--    remove the last operator.
-- 2. `authz.is_platform_operator(uuid)`: whether a login is on the list. A
--    definer owned by `postgres` that nobody else may execute here; the
--    role-change commands' migration grants it to `tenant_guard`, which must
--    refuse an operator's row as a target without a privilege on the list.
-- 3. `platform.caller_on_operator_list()`, which stage 1 left failing closed,
--    now reads the list for the session caller, through the guard's helper
--    (`tenant_guard.caller_id()`, never `auth`: D-27). Its signature, owner
--    (postgres), invoker rights, search path and grants (none) are kept. With
--    it the shared check, `platform.require_operator()`, tests both the list
--    and the session's assurance level (`aal2`), which it read already.
-- 4. `public.caller_is_platform_operator()`, the one read function that says
--    whether the caller is on the list, for the admin proxy's admission of
--    the operator area (plan 5.4). It answers false, and never raises, for a
--    signed-in person who is not on the list, and it does not ask for the
--    second factor: the operator area's challenge step does. It lives in
--    `public` because the Data API exposes no other schema. It cannot live in
--    `platform`: the catalog gate requires every `platform` function that
--    signed-in users may execute to begin with the shared check, which raises
--    for a non-operator (PLATFORM_COMMAND_NO_OPERATOR_CHECK). Nor is it a
--    wrapper into `platform`: a `public` function that calls a `platform`
--    function other than a command may not be executed by signed-in users
--    (WRAPPER_GRANTS_WORKER). So it is a definer owned by `postgres` that
--    reads the list through `authz.is_platform_operator`, the same test the
--    shared check makes, for `auth.uid()`.
-- 5. `platform.operator_session()`, a platform command whose whole body is the
--    shared check: it returns the operator's login id when the caller is on
--    the list with a session verified by a second factor, and refuses (42501)
--    otherwise. Server code that acts for an operator outside the database
--    runs the shared check through it on the operator's own token (plan 5.5:
--    "the server runs the shared operator and MFA check"): the assistant
--    runtime's platform gates from this package, the operator area and WP10's
--    Auth admin module later. Reached through `public.platform_operator_session()`.
--
-- Down (run by hand, in one transaction): DROP FUNCTION
-- public.platform_operator_session(); DROP FUNCTION platform.operator_session();
-- DROP FUNCTION public.caller_is_platform_operator(); restore
-- platform.caller_on_operator_list() from
-- 20261117034650_platform_schema_marker_and_health.sql (CREATE OR REPLACE, body
-- `SELECT false;`); DROP FUNCTION authz.is_platform_operator(UUID); DROP TABLE
-- authz.platform_operators. The audit rows the script wrote stay.

BEGIN;

-- 1. The operator list.
CREATE TABLE IF NOT EXISTS authz.platform_operators (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE RESTRICT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  added_by TEXT NOT NULL
    CONSTRAINT platform_operators_added_by_named CHECK (pg_catalog.btrim(added_by) <> ''),
  reason TEXT NOT NULL
    CONSTRAINT platform_operators_reason_given CHECK (pg_catalog.btrim(reason) <> '')
);

ALTER TABLE authz.platform_operators OWNER TO postgres;
ALTER TABLE authz.platform_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE authz.platform_operators FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE authz.platform_operators FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON TABLE authz.platform_operators IS
  'Platform operators (plan 5.4, AL-2675 WP2c). Row security forced, no policy, '
  'no privilege for signed-in, anonymous or service users. One writer: '
  'scripts/platform/operators.mjs, run by the release job''s owner, which writes '
  'an audit row with no tenant and refuses to remove the last operator.';
COMMENT ON COLUMN authz.platform_operators.added_by IS
  'The person who ran the operator script to add this operator, as they named themselves.';
COMMENT ON COLUMN authz.platform_operators.reason IS
  'Why the operator was added, as given to the operator script.';

-- 2. Whether a login is on the list.
CREATE OR REPLACE FUNCTION authz.is_platform_operator(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p_user_id IS NOT NULL
     AND EXISTS (
       SELECT 1
         FROM authz.platform_operators AS o
        WHERE o.user_id = p_user_id
     );
$$;

COMMENT ON FUNCTION authz.is_platform_operator(UUID) IS
  'Whether a login is on the platform operator list (AL-2675 WP2c). The one '
  'test of the list: the shared operator check, the read function and the '
  'commands that refuse an operator as a target all call it.';

ALTER FUNCTION authz.is_platform_operator(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION authz.is_platform_operator(UUID) FROM PUBLIC, anon, authenticated, service_role;

-- 3. The shared check's list test. Signature, owner, rights, search path and
-- grants as stage 1 left them.
CREATE OR REPLACE FUNCTION platform.caller_on_operator_list()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT authz.is_platform_operator(tenant_guard.caller_id());
$$;

ALTER FUNCTION platform.caller_on_operator_list() OWNER TO postgres;
REVOKE ALL ON FUNCTION platform.caller_on_operator_list() FROM PUBLIC, anon, authenticated, service_role;

-- 4. The read function for the admin proxy.
CREATE OR REPLACE FUNCTION public.caller_is_platform_operator()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT authz.is_platform_operator(auth.uid());
$$;

COMMENT ON FUNCTION public.caller_is_platform_operator() IS
  'Whether the signed-in caller is on the platform operator list (plan 5.4, '
  'AL-2675 WP2c). Answers false, never raises, for anyone else, and does not '
  'ask for a second factor: the admin proxy calls it to admit the operator '
  'area, whose challenge step asks for it. EXECUTE for authenticated only.';

ALTER FUNCTION public.caller_is_platform_operator() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.caller_is_platform_operator() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.caller_is_platform_operator() TO authenticated;

-- 5. The shared check as a platform command, and its wrapper.
CREATE OR REPLACE FUNCTION platform.operator_session()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_operator UUID := platform.require_operator();
BEGIN
  RETURN pg_catalog.jsonb_build_object('operator_id', v_operator);
END;
$$;

COMMENT ON FUNCTION platform.operator_session() IS
  'Platform command (AL-2675 WP2c): the shared operator check alone. Returns '
  'the operator''s login id for a caller on the operator list whose session '
  'passed a second factor (aal2), and refuses (42501) anyone else.';

ALTER FUNCTION platform.operator_session() OWNER TO postgres;
REVOKE ALL ON FUNCTION platform.operator_session() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION platform.operator_session() TO authenticated;

CREATE OR REPLACE FUNCTION public.platform_operator_session()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT platform.operator_session();
$$;

COMMENT ON FUNCTION public.platform_operator_session() IS
  'Wrapper of platform.operator_session() for the Data API (AL-2675 WP2c): the '
  'shared operator and second-factor check on the caller''s own token. '
  'EXECUTE for authenticated only.';

ALTER FUNCTION public.platform_operator_session() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.platform_operator_session() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.platform_operator_session() TO authenticated;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
