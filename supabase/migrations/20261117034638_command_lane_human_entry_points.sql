-- AL-2674 (WP1 slice 1.1a; plan 5.4, 7.1, 7.2; NR-13, NR-29, NR-58): the
-- command schema `tenant_guard` generalized from one worker path to the
-- command lane for signed-in people.
--
-- Two kinds of entry point live in `tenant_guard`, and they never mix:
--
-- * A human entry point takes its actor from the session. It is a SECURITY
--   DEFINER function owned by `tenant_guard` (NOLOGIN, NOBYPASSRLS), with
--   `SET search_path = ''`, whose first statement is
--   `tenant_guard.begin_human_command(<tenant>)`. That helper reads the caller
--   from the session and the assignment from the request's assignment header,
--   checks that the row is the caller's and live in that tenant, and only then
--   enters the tenant for the transaction. EXECUTE goes to `authenticated`
--   only, on the guard function and on its `public` SECURITY INVOKER wrapper.
-- * A worker entry point is executable by `service_role` only. Signed-in and
--   anonymous users cannot call it. Under plan 5.4 a worker derives its
--   tenant from a stored anchor: a service-key wrapper finds the tenant from
--   the anchor it is given, and the guard function enters it and reads the
--   anchor again under the guard's policy. The existing workflow claim pair is
--   a worker entry point by its grants but predates that rule: it enters the
--   `p_tenant_id` its caller passes (20261024150000_tenant_guard.sql:126).
--
-- Signed-in users get USAGE on `tenant_guard` so that a `public` invoker
-- wrapper can reach the guard function, and EXECUTE on each human entry point
-- and on nothing else in the schema. The catalog gate
-- (scripts/verify/tenant-rls-catalog.mjs) fails a `tenant_guard` function that
-- `authenticated` can execute without the preamble, one that both
-- `authenticated` and `service_role` can execute, and any `PUBLIC` or `anon`
-- EXECUTE there. The convention later packages follow, the guard's grant
-- matrix and every gate code: docs/security/tenant-guard.md, "Command lane".
--
-- The guard gains what the preamble needs and nothing more (NR-13): USAGE on
-- `authz` and EXECUTE on its two membership helpers; SELECT on
-- `authz.memberships` through a policy that shows the guard only the session
-- caller's own rows. `authz.is_super_admin()` is deliberately not granted:
-- commands never take a platform-role branch (plan 5.4, "No super_admin
-- branch").
--
-- The guard holds nothing on `auth` (plan 15.2, "Definer functions owned by a
-- non-bypass role on hosted Supabase", settled by the fallback the plan
-- names). On Supabase's own Postgres image `auth` belongs to
-- `supabase_auth_admin`, and `postgres`, which runs migrations and is not a
-- superuser there, holds USAGE on it and EXECUTE on `auth.uid()` and
-- `auth.jwt()` without the grant option: a GRANT of them to the guard only
-- warns and grants nothing, and every human command would fail. So the guard
-- reads the caller from the request's claims settings itself, in
-- `tenant_guard.caller_id()` and `tenant_guard.request_claims()`, with the
-- precedence and the result of the installed `auth.uid()` and `auth.jwt()`
-- (supabase/auth migration 20220224000811 and 20220531120530). The catalog
-- gate fails any function in a command schema whose body names `auth.`.
--
-- A GRANT made by a role that lacks the grant option does not fail: Postgres
-- warns that no privileges were granted and the transaction commits. The
-- post-assert at the end of this migration therefore checks that
-- `tenant_guard` holds each privilege below and raises otherwise, so a
-- refused grant fails the migration as a whole.
--
-- No tenant has a status column yet (WP3 adds it), and there is no SQL
-- capability function yet (WP2a). `begin_human_command` therefore checks the
-- caller, the assignment and its tenant; WP3 adds the tenant-status check and
-- WP2a the capability check, both inside the same helper.
--
-- Down (run by hand, in one transaction):
--   DROP FUNCTION public.resolve_command_assignment(UUID);
--   DROP FUNCTION tenant_guard.resolve_command_assignment(UUID);
--   DROP FUNCTION tenant_guard.begin_human_command(UUID);
--   DROP TYPE tenant_guard.command_context;
--   DROP POLICY tenant_guard_own_assignments ON authz.memberships;
--   DROP FUNCTION tenant_guard.request_assignment_id();
--   DROP FUNCTION tenant_guard.request_claims();
--   DROP FUNCTION tenant_guard.caller_id();
--   REVOKE SELECT ON authz.memberships FROM tenant_guard;
--   REVOKE EXECUTE ON FUNCTION authz.has_membership(UUID, authz.membership_role[]),
--     authz.has_staff_membership(UUID, authz.staff_role[]) FROM tenant_guard;
--   REVOKE USAGE ON SCHEMA authz FROM tenant_guard;
--   REVOKE USAGE ON SCHEMA tenant_guard FROM authenticated;

BEGIN;

-- 1. What the guard role may use to judge membership.
GRANT USAGE ON SCHEMA authz TO tenant_guard;
GRANT EXECUTE ON FUNCTION authz.has_membership(UUID, authz.membership_role[]) TO tenant_guard;
GRANT EXECUTE ON FUNCTION authz.has_staff_membership(UUID, authz.staff_role[]) TO tenant_guard;
GRANT SELECT ON TABLE authz.memberships TO tenant_guard;

-- 2. Signed-in users may reach the schema; EXECUTE stays per function.
GRANT USAGE ON SCHEMA tenant_guard TO authenticated;

-- 3. Helpers for human entry points. Owned by postgres, SECURITY INVOKER, so
-- inside a guard-owned command they run as tenant_guard. EXECUTE for
-- tenant_guard only.

-- The session caller, read from the request's claims settings as the
-- installed auth.uid() reads them: the single-claim setting first, then `sub`
-- of the JSON claims setting. An empty or absent setting is NULL; a value that
-- is not a UUID raises (22P02), never NULL. PostgREST sets the JSON setting.
CREATE OR REPLACE FUNCTION tenant_guard.caller_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT COALESCE(
    NULLIF(pg_catalog.current_setting('request.jwt.claim.sub', true), ''),
    NULLIF(pg_catalog.current_setting('request.jwt.claims', true), '')::JSONB ->> 'sub'
  )::UUID;
$$;

-- The request's JWT claims, as the installed auth.jwt() reads them: the
-- single JSON setting first, then the JSON claims setting; NULL when neither
-- is set. For a command that reads the assurance level or another claim.
CREATE OR REPLACE FUNCTION tenant_guard.request_claims()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT COALESCE(
    NULLIF(pg_catalog.current_setting('request.jwt.claim', true), ''),
    NULLIF(pg_catalog.current_setting('request.jwt.claims', true), '')
  )::JSONB;
$$;

-- The preamble reads the caller's own membership rows, in every tenant,
-- before any tenant is entered, so this policy is keyed on the session caller
-- and not on the guard tenant. A worker call has no session caller and sees no
-- row. Later commands that write memberships bring their own guard policy.
DROP POLICY IF EXISTS tenant_guard_own_assignments ON authz.memberships;
CREATE POLICY tenant_guard_own_assignments
  ON authz.memberships
  FOR SELECT
  TO tenant_guard
  USING (user_id = (SELECT tenant_guard.caller_id()));

-- The membership row the request selects, from the Data API's request
-- headers (lowercased by PostgREST; '' once a transaction has ended). NULL
-- when the header is absent or empty. A value that is not a UUID raises.
CREATE OR REPLACE FUNCTION tenant_guard.request_assignment_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_headers TEXT := NULLIF(pg_catalog.current_setting('request.headers', true), '');
  v_value TEXT;
BEGIN
  IF v_headers IS NULL THEN
    RETURN NULL;
  END IF;

  v_value := NULLIF(pg_catalog.btrim(v_headers::jsonb ->> 'x-asym-assignment'), '');
  IF v_value IS NULL THEN
    RETURN NULL;
  END IF;

  IF v_value !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RAISE EXCEPTION 'tenant_guard: the assignment header is not a UUID'
      USING ERRCODE = '22P02';
  END IF;

  RETURN v_value::uuid;
END;
$$;

DO $$
BEGIN
  IF pg_catalog.to_regtype('tenant_guard.command_context') IS NULL THEN
    CREATE TYPE tenant_guard.command_context AS (
      actor_id UUID,
      tenant_id UUID,
      assignment_id UUID,
      role TEXT,
      staff_role TEXT
    );
  END IF;
END
$$;

-- The first statement of every human entry point. Refuses (42501) a call
-- with no signed-in caller, an assignment header that names a row that is not
-- the caller's live row in this tenant, a caller with no live row here, and a
-- caller with several live rows here who names none. Then enters the tenant.
CREATE OR REPLACE FUNCTION tenant_guard.begin_human_command(p_tenant_id UUID)
RETURNS tenant_guard.command_context
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_actor UUID := tenant_guard.caller_id();
  v_named UUID := tenant_guard.request_assignment_id();
  v_ctx tenant_guard.command_context;
  v_live INTEGER;
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'tenant_guard: a human command needs a signed-in caller'
      USING ERRCODE = '42501';
  END IF;

  IF p_tenant_id IS NULL THEN
    RAISE EXCEPTION 'tenant_guard: tenant id is required'
      USING ERRCODE = '22004';
  END IF;

  IF v_named IS NOT NULL THEN
    SELECT v_actor, m.tenant_id, m.id, m.role::TEXT, m.staff_role::TEXT
      INTO v_ctx
      FROM authz.memberships AS m
     WHERE m.id = v_named
       AND m.user_id = v_actor
       AND m.tenant_id = p_tenant_id
       AND m.is_active;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'tenant_guard: the selected assignment is not a live assignment of the caller in this tenant'
        USING ERRCODE = '42501';
    END IF;
  ELSE
    SELECT pg_catalog.count(*)::INTEGER
      INTO v_live
      FROM authz.memberships AS m
     WHERE m.user_id = v_actor
       AND m.tenant_id = p_tenant_id
       AND m.is_active;

    IF v_live = 0 THEN
      RAISE EXCEPTION 'tenant_guard: the caller has no live assignment in this tenant'
        USING ERRCODE = '42501';
    END IF;

    IF v_live > 1 THEN
      RAISE EXCEPTION 'tenant_guard: the caller has several live assignments in this tenant and the request names none'
        USING ERRCODE = '42501';
    END IF;

    SELECT v_actor, m.tenant_id, m.id, m.role::TEXT, m.staff_role::TEXT
      INTO v_ctx
      FROM authz.memberships AS m
     WHERE m.user_id = v_actor
       AND m.tenant_id = p_tenant_id
       AND m.is_active;
  END IF;

  PERFORM tenant_guard.enter(v_ctx.tenant_id);
  RETURN v_ctx;
END;
$$;

ALTER FUNCTION tenant_guard.caller_id() OWNER TO postgres;
ALTER FUNCTION tenant_guard.request_claims() OWNER TO postgres;
ALTER FUNCTION tenant_guard.request_assignment_id() OWNER TO postgres;
ALTER FUNCTION tenant_guard.begin_human_command(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION tenant_guard.caller_id() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.request_claims() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.request_assignment_id() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.begin_human_command(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.caller_id() TO tenant_guard;
GRANT EXECUTE ON FUNCTION tenant_guard.request_claims() TO tenant_guard;
GRANT EXECUTE ON FUNCTION tenant_guard.request_assignment_id() TO tenant_guard;
GRANT EXECUTE ON FUNCTION tenant_guard.begin_human_command(UUID) TO tenant_guard;

-- 4. The first human entry point: resolve the assignment a command would act
-- under in a tenant. It reads nothing beyond the caller's own membership rows
-- and writes nothing. Its echo of the guard tenant shows the call ran inside
-- the guard (contract: docs/security/tenant-guard.md). It exists so that one
-- human command can be proved on a signed-in token (WP1 platform proof). No
-- application code calls it; WP2b decides whether the organization chooser
-- uses it or a later migration drops it.
CREATE OR REPLACE FUNCTION tenant_guard.resolve_command_assignment(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id);

  RETURN pg_catalog.jsonb_build_object(
    'actor_id', v_ctx.actor_id,
    'assignment_id', v_ctx.assignment_id,
    'role', v_ctx.role,
    'staff_role', v_ctx.staff_role,
    'tenant_id', tenant_guard.current_tenant_id()
  );
END;
$$;

REVOKE ALL ON FUNCTION tenant_guard.resolve_command_assignment(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.resolve_command_assignment(UUID) TO authenticated;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.resolve_command_assignment(UUID) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE OR REPLACE FUNCTION public.resolve_command_assignment(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.resolve_command_assignment(p_tenant_id);
$$;

ALTER FUNCTION public.resolve_command_assignment(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.resolve_command_assignment(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.resolve_command_assignment(UUID) TO authenticated;

COMMENT ON FUNCTION public.resolve_command_assignment(UUID) IS
  'Human entry point (AL-2674): the caller''s live assignment in a tenant, as a '
  'command would resolve it from the session and the x-asym-assignment header. '
  'Runs as tenant_guard; EXECUTE for authenticated only.';

-- 5. Post-assert: the guard holds every privilege step 1 granted. A refused
-- grant only warns (see the header), so this is what fails the migration.
DO $$
-- post-assert: tenant_guard privileges
DECLARE
  v_missing TEXT;
BEGIN
  SELECT pg_catalog.string_agg(g.item, ', ' ORDER BY g.item)
    INTO v_missing
    FROM (VALUES
      ('USAGE on schema authz',
        pg_catalog.has_schema_privilege('tenant_guard', 'authz', 'USAGE')),
      ('EXECUTE on authz.has_membership(uuid, authz.membership_role[])',
        pg_catalog.has_function_privilege('tenant_guard',
          'authz.has_membership(uuid, authz.membership_role[])', 'EXECUTE')),
      ('EXECUTE on authz.has_staff_membership(uuid, authz.staff_role[])',
        pg_catalog.has_function_privilege('tenant_guard',
          'authz.has_staff_membership(uuid, authz.staff_role[])', 'EXECUTE')),
      ('SELECT on authz.memberships',
        pg_catalog.has_table_privilege('tenant_guard', 'authz.memberships', 'SELECT'))
    ) AS g(item, held)
   WHERE NOT g.held;

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2674: tenant_guard lacks %: a grant was refused (no grant option), see docs/security/tenant-guard.md', v_missing
      USING ERRCODE = '42501';
  END IF;
END
$$;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
