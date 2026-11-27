-- AL-2675 (WP2c rest, pull request A; brief stage5/wp2c-rest.md, invariants
-- 1 to 4, rulings 1 and 2 of its check; plan 5.4 and 12 WP2c; record D-80,
-- D-88 and D-226): the two operator reads, each a platform command in the
-- form the catalog gate admits, reached through a `public` invoker wrapper.
--
-- 1. platform.tenant_operators(p_tenant_id) and public.tenant_operators(uuid):
--    the people the assistant runtime's launch-permission grant accepts in an
--    organization, for its picker. It returns, as a JSON array of
--    {id, display_name, email}, exactly the profiles that
--    public.assert_eve_launch_profile(<tenant>, <profile>, 'super_admin')
--    accepts there: a login on the operator list with a live row (active, not
--    revoked) in that organization, whatever its class. The name and the
--    e-mail come from the profile, never from `auth`. It refuses (42501),
--    changing nothing, unless the caller passes the shared operator check
--    (on the list, a session at aal2), the organization asked for is the
--    request's own organization as authz.request_tenant_id() reads
--    x-asym-tenant (absent, blank or not a UUID counts as none, as D-226's
--    check reads it), and the caller holds a live staff row there, found as
--    the organization's other reads find it (authz.request_assignment,
--    authz.caller_assignment): the organization is active, and when the
--    request names an assignment (x-asym-assignment) that assignment is
--    the staff row; a malformed or foreign one refuses. A suspended or
--    closed organization, a named row that is not the caller's live staff
--    row there, and no such row at all get one and the same refusal.
-- 2. platform.eve_history(p_limit) and public.platform_eve_history(integer):
--    the assistant runtime's changes recorded with no organization (D-88: a
--    global kill switch, a global model-policy change), for every confirmed
--    operator, whoever acted (an operator, a service or a bot), newest first,
--    at most p_limit rows, p_limit from 1 to 200 (22023 otherwise). A row that
--    carries any organization never appears: an operator reads an
--    organization's history only under WP10's support grant. It refuses
--    (42501) a caller who does not pass the shared operator check.
--
-- Both commands are SECURITY DEFINER, owned by postgres, with an empty search
-- path; each initialises a variable from platform.require_operator() alone in
-- its DECLARE section, and names nothing in `auth`. EXECUTE goes to
-- authenticated alone, by name, on the commands and on their wrappers; none
-- to PUBLIC, anon or service_role. Neither writes a row. The assistant
-- runtime's routes and service-key functions are unchanged (ruling Q3).
--
-- Locks: object locks on the four new functions only, to COMMIT. No table is
-- altered or locked. lock_timeout stops a run rather than queue it.
--
-- Recovery. A run lost between its COMMIT and its ledger row stops on the
-- next run at its first CREATE (platform.tenant_operators, 42723), rolling
-- back. This file has committed when this read-only check is true: SELECT
-- to_regprocedure('public.platform_eve_history(integer)') IS NOT NULL. Then
-- follow docs/ops/release-job.md, "If the migration committed but its ledger
-- row is missing", with this check and this file's version, 20261127020000.
--
-- Down (only after the build that calls them is rolled back; in one
-- transaction; no row was written): DROP FUNCTION
-- public.platform_eve_history(integer), platform.eve_history(integer),
-- public.tenant_operators(uuid), platform.tenant_operators(uuid); then
-- NOTIFY pgrst, 'reload schema';

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. The picker's list.
CREATE FUNCTION platform.tenant_operators(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_operator uuid := platform.require_operator();
  v_request_tenant_id uuid;
  v_named uuid;
  v_named_readable boolean := true;
BEGIN
  BEGIN
    v_request_tenant_id := authz.request_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_request_tenant_id := NULL;
  END;

  BEGIN
    v_named := authz.request_assignment_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_named_readable := false;
  END;

  IF p_tenant_id IS NULL
     OR v_request_tenant_id IS NULL
     OR v_request_tenant_id IS DISTINCT FROM p_tenant_id THEN
    RAISE EXCEPTION 'platform: the organization asked for must be the request''s own organization'
      USING ERRCODE = '42501';
  END IF;

  IF NOT v_named_readable OR NOT EXISTS (
    SELECT 1
      FROM authz.memberships AS m
      JOIN public.tenants AS t ON t.id = m.tenant_id AND t.status = 'active'
     WHERE m.user_id = v_operator
       AND m.tenant_id = p_tenant_id
       AND m.role = 'staff'::authz.membership_role
       AND m.is_active
       AND m.revoked_at IS NULL
       AND (v_named IS NULL OR m.id = v_named)
  ) THEN
    RAISE EXCEPTION 'platform: the request has no live staff assignment of the caller in this organization'
      USING ERRCODE = '42501';
  END IF;

  RETURN COALESCE(
    (SELECT pg_catalog.jsonb_agg(
              pg_catalog.jsonb_build_object(
                'id', o.id,
                'display_name', o.display_name,
                'email', o.email)
              ORDER BY o.display_name NULLS LAST, o.email NULLS LAST, o.id)
       FROM (
         SELECT p.id,
                COALESCE(
                  NULLIF(pg_catalog.btrim(p.display_name), ''),
                  NULLIF(pg_catalog.btrim(p.full_name), ''),
                  NULLIF(pg_catalog.btrim(pg_catalog.concat_ws(' ', p.first_name, p.last_name)), '')
                ) AS display_name,
                NULLIF(pg_catalog.btrim(p.email), '') AS email
           FROM public.profiles AS p
          WHERE private.is_platform_operator(p.user_id)
            AND EXISTS (
              SELECT 1
                FROM authz.memberships AS m
               WHERE m.user_id = p.user_id
                 AND m.tenant_id = p_tenant_id
                 AND m.is_active
                 AND m.revoked_at IS NULL)
       ) AS o),
    '[]'::jsonb);
END;
$$;

COMMENT ON FUNCTION platform.tenant_operators(uuid) IS
  'Platform command (AL-2675 WP2c rest): the profiles that '
  'assert_eve_launch_profile(tenant, profile, ''super_admin'') accepts in the '
  'request''s own organization, as {id, display_name, email}. Refuses (42501) '
  'unless the caller passes the shared operator check, the organization is '
  'the request''s x-asym-tenant and active, and the caller holds a live staff '
  'row there, the one x-asym-assignment names when it names one.';

ALTER FUNCTION platform.tenant_operators(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION platform.tenant_operators(uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION platform.tenant_operators(uuid) TO authenticated;

CREATE FUNCTION public.tenant_operators(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT platform.tenant_operators(p_tenant_id);
$$;

COMMENT ON FUNCTION public.tenant_operators(uuid) IS
  'Wrapper of platform.tenant_operators(uuid) for the Data API (AL-2675 WP2c '
  'rest), on the caller''s own token. EXECUTE for authenticated only.';

ALTER FUNCTION public.tenant_operators(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.tenant_operators(uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.tenant_operators(uuid) TO authenticated;

-- 2. The changes recorded with no organization.
CREATE FUNCTION platform.eve_history(p_limit integer)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_operator uuid := platform.require_operator();
BEGIN
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 200 THEN
    RAISE EXCEPTION 'platform: the history limit must be from 1 to 200'
      USING ERRCODE = '22023';
  END IF;

  RETURN COALESCE(
    (SELECT pg_catalog.jsonb_agg(
              pg_catalog.jsonb_build_object(
                'id', e.id,
                'run_id', e.run_id,
                'tenant_id', e.tenant_id,
                'actor_id', e.actor_id,
                'actor_profile_id', e.actor_profile_id,
                'actor_role', e.actor_role,
                'identity_mode', e.identity_mode,
                'initiator_type', e.initiator_type,
                'initiator_id', e.initiator_id,
                'policy_id', e.policy_id,
                'policy_status', e.policy_status,
                'governance_state_version', e.governance_state_version,
                'action', e.action,
                'target', e.target,
                'result', e.result,
                'tool_name', e.tool_name,
                'subagent_name', e.subagent_name,
                'model_role', e.model_role,
                'evidence_summary', e.evidence_summary,
                'change_summary', e.change_summary,
                'decision_summary', e.decision_summary,
                'debug_metadata', e.debug_metadata,
                'redaction_version', e.redaction_version,
                'created_at', e.created_at)
              ORDER BY e.created_at DESC, e.id DESC)
       FROM (
         SELECT a.*
           FROM public.eve_audit_events AS a
          WHERE a.tenant_id IS NULL
          ORDER BY a.created_at DESC, a.id DESC
          LIMIT p_limit
       ) AS e),
    '[]'::jsonb);
END;
$$;

COMMENT ON FUNCTION platform.eve_history(integer) IS
  'Platform command (AL-2675 WP2c rest, D-88): the assistant runtime''s audit '
  'rows recorded with no organization, newest first, at most p_limit (1 to '
  '200, 22023 otherwise), for any caller who passes the shared operator check; '
  'a row that carries an organization never appears.';

ALTER FUNCTION platform.eve_history(integer) OWNER TO postgres;
REVOKE ALL ON FUNCTION platform.eve_history(integer) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION platform.eve_history(integer) TO authenticated;

CREATE FUNCTION public.platform_eve_history(p_limit integer)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT platform.eve_history(p_limit);
$$;

COMMENT ON FUNCTION public.platform_eve_history(integer) IS
  'Wrapper of platform.eve_history(integer) for the Data API (AL-2675 WP2c '
  'rest), on the operator''s own token. EXECUTE for authenticated only.';

ALTER FUNCTION public.platform_eve_history(integer) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.platform_eve_history(integer) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.platform_eve_history(integer) TO authenticated;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
