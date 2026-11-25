-- AL-2678 (WP5 part 2-r2b1; plan section 12 WP5, lines 984, 1004 and 1006;
-- rulings R2B-Q1 and R-P7, and Q6 of the WP5 part 2 rebase ruling). The
-- worker's record in Mission Control: the reads its screens need, the one
-- audited read of a worker's legal identity, and two grants narrowed.
--
-- Adds:
-- 1. public.worker_records(p_assignment_id uuid DEFAULT NULL): the workers of
--    the request's organization (authz.current_tenant_id()), all of them for
--    NULL or the one ministry assignment named, for a caller whose request
--    resolves to a live staff membership there (authz.has_staff_membership);
--    nobody else, never a support grant. Each row: assignment_id, party_id,
--    display_name, public_alias, security_level, security_level_source,
--    do_not_publish, has_legal_identity, has_login, created_at. Never a legal
--    name, country, location or photo reference. has_legal_identity says
--    whether a private row exists, and only when the request's assignment
--    holds safety.restrict_publication (authz.assignment_holds); for any
--    other staff member it is NULL (R-P7). A postgres-owned definer, because
--    signed-in users may not read missionaries.party_id
--    (20261125050100_parties_account_links_and_own_rows.sql), in the form of
--    public.unreviewed_worker_security_levels()
--    (20261125050400_worker_safety_room.sql).
-- 2. tenant_guard.reveal_worker_identity(p_tenant_id, p_party_id, p_reason)
--    and its invoker wrapper public.reveal_worker_identity: a human command
--    needing safety.restrict_publication (R2B-Q1). It opens exactly as
--    tenant_guard.set_worker_identity does (20261125050400 lines 342-393): the
--    command preamble, the request-tenant re-check, the organization FOR
--    SHARE, the caller's assignment FOR SHARE and the authority re-check; a
--    reason normalized by private.normalize_safety_text and refused when
--    nothing is left (22023). Then the Party in the organization (P0002), its
--    private row (P0002), one audit_logs row worker_identity_revealed whose
--    details hold the reason and the assignment and never an identity value,
--    and the legal name, country and location.
-- 3. EXECUTE on public.read_party_restricted(uuid) is revoked from
--    authenticated: the audited reveal is the one read of
--    private.party_restricted a signed-in caller can make (plan line 1006).
-- 4. Q6: service_role keeps on public.parties only the columns its one live
--    writer names. Its table INSERT and UPDATE are revoked first (revoking a
--    table privilege also clears column privileges; PostgreSQL 17
--    sql-revoke.html), then INSERT (id, tenant_id, display_name,
--    import_batch_id, created_at, updated_at) and UPDATE (display_name,
--    import_batch_id, updated_at) are granted. The level, its source, the
--    alias and do-not-publish change only through the safety commands, which
--    write as tenant_guard. The live writer, donors_fill_party_after_insert_temp
--    (20261125050100), runs as postgres and names tenant_id and display_name:
--    no gift is refused.
--
-- Reads public.missionaries, public.parties and private.party_restricted;
-- writes public.audit_logs from the reveal only. Adds no table, column,
-- policy or field-policy row; changes nothing of part 1's commands, columns,
-- triggers or policies. anon gets no EXECUTE, so the catalog gate's anon
-- allowlist does not move; GUARD_REACH does not move.
--
-- The running build calls none of these functions, never calls
-- read_party_restricted and writes no parties row, so nothing it does changes.
-- A build that calls the new functions before this file is applied gets
-- PGRST202 and shows its load error.
--
-- Locks, observed in pg_locks inside the open transaction just before COMMIT
-- (PostgreSQL 17.11, the migrate job's image, on 20261126060000's chain and
-- the seed): ACCESS SHARE on public.missionaries, public.parties and
-- private.party_restricted, taken when worker_records' body is checked at
-- creation; ROW EXCLUSIVE on pg_description for the comments; nothing
-- stronger on any table: the REVOKE and GRANT on public.parties rewrite its
-- catalog row and take no lock on the table that a read or a write waits
-- for. Besides those: ACCESS EXCLUSIVE and SHARE UPDATE EXCLUSIVE object
-- locks on the three new functions, which no other session sees before
-- COMMIT; SHARE UPDATE EXCLUSIVE on read_party_restricted; and ACCESS SHARE
-- object locks on the schemas public and tenant_guard, the roles
-- authenticated, service_role and tenant_guard, and the language plpgsql.
-- lock_timeout stops a run rather than queue it behind a long writer.
--
-- Recovery. A run lost between its COMMIT and its ledger row stops at its
-- first statement, CREATE FUNCTION public.worker_records (42723, the function
-- exists), and rolls back. This file has committed when this read-only check
-- is true; each object it names that is absent gives false, never an error:
--   SELECT to_regprocedure('public.worker_records(uuid)') IS NOT NULL
--      AND to_regprocedure('tenant_guard.reveal_worker_identity(uuid,uuid,text)') IS NOT NULL
--      AND to_regprocedure('public.reveal_worker_identity(uuid,uuid,text)') IS NOT NULL
--      AND COALESCE(NOT has_function_privilege('authenticated', to_regprocedure('public.read_party_restricted(uuid)'), 'EXECUTE'), false)
--      AND COALESCE(NOT has_column_privilege('service_role', to_regclass('public.parties'), 'security_level', 'UPDATE'), false);
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261126120000, in place of the section's own.
--
-- Down (only after the build that calls these functions is rolled back; the
-- audit rows stay). Revoking service_role's table INSERT and UPDATE before
-- re-granting them clears its column entries, so the catalog is the chain's
-- without this file (scripts/release/schema-fingerprint.mjs compares it):
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   DROP FUNCTION public.reveal_worker_identity(uuid, uuid, text);
--   DROP FUNCTION tenant_guard.reveal_worker_identity(uuid, uuid, text);
--   DROP FUNCTION public.worker_records(uuid);
--   GRANT EXECUTE ON FUNCTION public.read_party_restricted(uuid) TO authenticated;
--   COMMENT ON FUNCTION public.read_party_restricted(UUID) IS
--     'A worker''s legal identity, for a caller whose request resolves to a live staff membership in the request''s tenant; nobody else, and never through a support grant (AL-2678, plan WP5).';
--   REVOKE INSERT, UPDATE ON TABLE public.parties FROM service_role;
--   GRANT INSERT, UPDATE ON TABLE public.parties TO service_role;
--   COMMIT;
--   SELECT pg_notify('pgrst', 'reload schema');

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. The workers' directory and record, for the organization's staff. The
-- legal identity's presence only for the safety capability.
CREATE FUNCTION public.worker_records(p_assignment_id UUID DEFAULT NULL)
RETURNS TABLE (
  assignment_id UUID,
  party_id UUID,
  display_name TEXT,
  public_alias TEXT,
  security_level TEXT,
  security_level_source TEXT,
  do_not_publish BOOLEAN,
  has_legal_identity BOOLEAN,
  has_login BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT m.id AS assignment_id, p.id AS party_id, p.display_name, p.public_alias,
         p.security_level, p.security_level_source, p.do_not_publish,
         CASE WHEN authz.assignment_holds('safety.restrict_publication')
              THEN EXISTS (SELECT 1 FROM private.party_restricted AS r
                            WHERE r.party_id = p.id AND r.tenant_id = p.tenant_id)
              ELSE NULL END AS has_legal_identity,
         m.profile_id IS NOT NULL AS has_login, m.created_at
    FROM public.missionaries AS m
    JOIN public.parties AS p ON p.tenant_id = m.tenant_id AND p.id = m.party_id
   WHERE m.tenant_id = authz.current_tenant_id()
     AND (p_assignment_id IS NULL OR m.id = p_assignment_id)
     AND authz.has_staff_membership(authz.current_tenant_id(), NULL)
   ORDER BY p.display_name, m.id;
$$;
COMMENT ON FUNCTION public.worker_records(UUID) IS
  'The workers of the request''s organization for its staff (AL-2678, WP5 part 2-r2b1): never the legal name; has_legal_identity only for safety.restrict_publication, otherwise NULL.';
ALTER FUNCTION public.worker_records(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.worker_records(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.worker_records(UUID) TO authenticated;

-- 2. The audited reveal: the same opening as set_worker_identity, a reason,
-- one audit row without any identity value, then the three values.
CREATE FUNCTION tenant_guard.reveal_worker_identity(
  p_tenant_id UUID,
  p_party_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_request_tenant_id UUID;
  v_tenant_status TEXT;
  v_assignment RECORD;
  v_assignment_found BOOLEAN;
  v_reason TEXT;
  v_party_id UUID;
  v_identity RECORD;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'safety.restrict_publication');

  BEGIN
    v_request_tenant_id := authz.request_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_request_tenant_id := NULL;
  END;
  IF v_request_tenant_id IS NULL OR v_request_tenant_id IS DISTINCT FROM v_ctx.tenant_id THEN
    RAISE EXCEPTION 'tenant_guard: request tenant scope is required and must match command tenant'
      USING ERRCODE = '42501';
  END IF;

  v_tenant_status := private.share_lock_tenant(v_ctx.tenant_id);
  SELECT m.user_id, m.tenant_id, m.is_active, m.revoked_at
    INTO v_assignment
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.id = v_ctx.assignment_id
     FOR SHARE;
  v_assignment_found := FOUND;
  IF (v_tenant_status = 'active') IS NOT TRUE
     OR (
       v_assignment_found
       AND v_assignment.user_id = v_ctx.actor_id
       AND v_assignment.tenant_id = v_ctx.tenant_id
       AND v_assignment.is_active
       AND v_assignment.revoked_at IS NULL
     ) IS NOT TRUE
     OR ('safety.restrict_publication' = ANY (authz.assignment_capabilities(v_ctx.assignment_id))) IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: the caller no longer holds the authority this command requires'
      USING ERRCODE = '42501';
  END IF;

  v_reason := private.normalize_safety_text(p_reason);
  IF v_reason IS NULL THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;

  SELECT p.id
    INTO v_party_id
    FROM public.parties AS p
   WHERE p.id = p_party_id
     AND p.tenant_id = v_ctx.tenant_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No Party with that id in this organization' USING ERRCODE = 'P0002';
  END IF;

  SELECT r.legal_name, r.real_country, r.precise_location
    INTO v_identity
    FROM private.party_restricted AS r
   WHERE r.party_id = v_party_id
     AND r.tenant_id = v_ctx.tenant_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No private identity for that worker' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'worker_identity_revealed',
    'party',
    v_party_id::TEXT,
    pg_catalog.jsonb_build_object('reason', v_reason, 'assignment_id', v_ctx.assignment_id)
  );

  RETURN pg_catalog.jsonb_build_object(
    'party_id', v_party_id,
    'legal_name', v_identity.legal_name,
    'real_country', v_identity.real_country,
    'precise_location', v_identity.precise_location
  );
END;
$$;
COMMENT ON FUNCTION tenant_guard.reveal_worker_identity(UUID, UUID, TEXT) IS
  'Human command (plan 5.4 and line 1006, AL-2678 r2b1): returns a worker''s legal name, country and location and writes one worker_identity_revealed audit row holding the reason, never the values. Needs safety.restrict_publication and a reason.';
REVOKE ALL ON FUNCTION tenant_guard.reveal_worker_identity(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.reveal_worker_identity(UUID, UUID, TEXT) TO authenticated;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.reveal_worker_identity(UUID, UUID, TEXT) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE FUNCTION public.reveal_worker_identity(
  p_tenant_id UUID,
  p_party_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.reveal_worker_identity(p_tenant_id, p_party_id, p_reason);
$$;
COMMENT ON FUNCTION public.reveal_worker_identity(UUID, UUID, TEXT) IS
  'Wrapper of tenant_guard.reveal_worker_identity for the Data API (AL-2678). Runs as the caller; EXECUTE for authenticated only; VOLATILE, so PostgREST runs it only by POST.';
ALTER FUNCTION public.reveal_worker_identity(UUID, UUID, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.reveal_worker_identity(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reveal_worker_identity(UUID, UUID, TEXT) TO authenticated;

-- 3. The audited reveal is the one read of the private row.
REVOKE EXECUTE ON FUNCTION public.read_party_restricted(UUID) FROM authenticated;
COMMENT ON FUNCTION public.read_party_restricted(UUID) IS
  'No grantee since WP5 part 2-r2b1 (AL-2678): the audited reveal, public.reveal_worker_identity, is the one read of a worker''s legal identity.';

-- 4. Q6: the service key writes only the Party columns its live writer
-- names; the safety columns change only through the safety commands.
REVOKE INSERT, UPDATE ON TABLE public.parties FROM service_role;
GRANT INSERT (id, tenant_id, display_name, import_batch_id, created_at, updated_at)
  ON TABLE public.parties TO service_role;
GRANT UPDATE (display_name, import_batch_id, updated_at)
  ON TABLE public.parties TO service_role;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
