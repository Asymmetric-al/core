-- AL-2678 (WP5 rest, part B; brief stage5/wp5-rest.md, pull request 2,
-- invariants 5 to 8). Staff holding safety.restrict_publication add a
-- worker with no login, unreviewed until confirmed.
--
-- 1. private.insert_worker(tenant, display name, legal entity): a
--    postgres-owned definer with an empty search path, EXECUTE for
--    tenant_guard only, in the tenant the transaction entered (42501
--    otherwise). It resolves the legal entity (the one named, which must be
--    the organization's, P0002 otherwise; else the organization's only one;
--    22023 "Name the legal entity" when it has several and none is named,
--    "This organization has no legal entity" when it has none), then
--    inserts one Party (the display name; standard, unreviewed_default) and
--    one worker row on it with no login, and answers both ids. The worker
--    row's assignment-key trigger fires only for a login, so no child row
--    changes.
-- 2. tenant_guard.create_worker(tenant, display name, legal name, real
--    country, precise location, level, public alias, legal entity, reason):
--    a human command owned by tenant_guard, opening with
--    begin_human_command(..., 'safety.restrict_publication'). The reason,
--    the display name and the legal name are required, "blank" being what
--    private.normalize_safety_text returns empty (rule 13), checked before
--    any write. Then it takes the organization's row and the caller's
--    membership FOR SHARE and refuses 42501 as the other commands do after
--    their locks (the organization no longer active, or the caller no
--    longer holding the assignment or the capability), before item 1 reads
--    the legal entity: a revocation that commits while the create waits is
--    refused and nothing is written. In one transaction: the Party and
--    worker through item 1, one audit row worker_created (no legal name),
--    then tenant_guard.set_worker_identity unchanged, which records the legal
--    identity, sets the level (standard and unreviewed_default when none is
--    given) and writes its own worker_identity_set row. It answers the
--    organization, Party, worker, level and source; never the legal name.
-- 3. public.create_worker, its invoker wrapper for the Data API, owned by
--    postgres; EXECUTE on both for authenticated only.
--
-- tenant_guard gains EXECUTE on item 1 only (GUARD_REACH, D-18: a reviewed
-- postgres-owned helper, as invariant 14 allows).
--
-- Locks at migration time: none on a table; the three functions are new.
--
-- What the running build does: nothing calls these until this part ships.
--
-- Recovery. A run lost between its COMMIT and its ledger row stops on the
-- next run at its first CREATE (42723), rolling back. This file has
-- committed when this read-only check returns true (false before it):
-- Check begins
--   SELECT pg_catalog.to_regprocedure('tenant_guard.create_worker(uuid,text,text,text,text,text,text,uuid,text)') IS NOT NULL AS committed;
-- Check ends
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127090100.
--
-- Down (after the build that calls it is rolled back; one transaction).
-- Workers, Parties and audit rows created stay.
-- Down begins
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   DROP FUNCTION public.create_worker(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT);
--   SET LOCAL ROLE tenant_guard;
--   DROP FUNCTION tenant_guard.create_worker(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT);
--   RESET ROLE;
--   DROP FUNCTION private.insert_worker(UUID, TEXT, UUID);
--   COMMIT;
--   SELECT pg_notify('pgrst', 'reload schema');
-- Down ends

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. The Party and worker row, in the entered organization.
CREATE FUNCTION private.insert_worker(
  p_tenant_id UUID,
  p_display_name TEXT,
  p_legal_entity_id UUID
)
RETURNS TABLE (party_id UUID, assignment_id UUID)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_entered UUID;
  v_entity UUID;
  v_entities INTEGER;
  v_party UUID;
  v_worker UUID;
BEGIN
  v_entered := NULLIF(pg_catalog.current_setting('app.current_tenant_id', true), '')::UUID;
  IF (v_entered = p_tenant_id) IS NOT TRUE THEN
    RAISE EXCEPTION 'insert_worker: the transaction did not enter this organization'
      USING ERRCODE = '42501';
  END IF;

  IF p_legal_entity_id IS NOT NULL THEN
    SELECT e.id INTO v_entity
      FROM public.legal_entities AS e
     WHERE e.tenant_id = p_tenant_id
       AND e.id = p_legal_entity_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No legal entity with that id in this organization'
        USING ERRCODE = 'P0002';
    END IF;
  ELSE
    SELECT pg_catalog.count(*)::INTEGER, (pg_catalog.array_agg(e.id))[1]
      INTO v_entities, v_entity
      FROM public.legal_entities AS e
     WHERE e.tenant_id = p_tenant_id;
    IF v_entities = 0 THEN
      RAISE EXCEPTION 'This organization has no legal entity' USING ERRCODE = '22023';
    END IF;
    IF v_entities > 1 THEN
      RAISE EXCEPTION 'Name the legal entity' USING ERRCODE = '22023';
    END IF;
  END IF;

  INSERT INTO public.parties (tenant_id, display_name, security_level, security_level_source)
  VALUES (p_tenant_id, p_display_name, 'standard', 'unreviewed_default')
  RETURNING id INTO v_party;

  INSERT INTO public.missionaries (tenant_id, party_id, profile_id, legal_entity_id)
  VALUES (p_tenant_id, v_party, NULL, v_entity)
  RETURNING id INTO v_worker;

  party_id := v_party;
  assignment_id := v_worker;
  RETURN NEXT;
END;
$$;
COMMENT ON FUNCTION private.insert_worker(UUID, TEXT, UUID) IS
  'For tenant_guard.create_worker (AL-2678, WP5 rest part B): in the entered organization, one Party (standard, unreviewed) and one worker row with no login under the named or only legal entity. EXECUTE: tenant_guard.';
ALTER FUNCTION private.insert_worker(UUID, TEXT, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.insert_worker(UUID, TEXT, UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.insert_worker(UUID, TEXT, UUID) TO tenant_guard;

-- 2. The command.
GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
SET LOCAL ROLE tenant_guard;
CREATE FUNCTION tenant_guard.create_worker(
  p_tenant_id UUID,
  p_display_name TEXT,
  p_legal_name TEXT,
  p_real_country TEXT,
  p_precise_location TEXT,
  p_security_level TEXT,
  p_public_alias TEXT,
  p_legal_entity_id UUID,
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
  v_tenant_status TEXT;
  v_assignment RECORD;
  v_assignment_found BOOLEAN;
  v_reason TEXT;
  v_display TEXT;
  v_party UUID;
  v_worker UUID;
  v_identity JSONB;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'safety.restrict_publication');

  v_reason := private.normalize_safety_text(p_reason);
  IF v_reason IS NULL THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;
  v_display := private.normalize_safety_text(p_display_name);
  IF v_display IS NULL THEN
    RAISE EXCEPTION 'A display name is required' USING ERRCODE = '22023';
  END IF;
  IF private.normalize_safety_text(p_legal_name) IS NULL THEN
    RAISE EXCEPTION 'A legal name is required' USING ERRCODE = '22023';
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

  SELECT w.party_id, w.assignment_id
    INTO v_party, v_worker
    FROM private.insert_worker(v_ctx.tenant_id, v_display, p_legal_entity_id) AS w;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'worker_created',
    'party',
    v_party::TEXT,
    pg_catalog.jsonb_build_object(
      'reason', v_reason,
      'assignment_id', v_ctx.assignment_id,
      'worker_id', v_worker
    )
  );

  v_identity := tenant_guard.set_worker_identity(
    v_ctx.tenant_id, v_party, p_legal_name, p_real_country, p_precise_location,
    v_display, p_security_level, p_public_alias, p_reason
  );

  RETURN pg_catalog.jsonb_build_object(
    'tenant_id', v_ctx.tenant_id,
    'party_id', v_party,
    'assignment_id', v_worker,
    'security_level', v_identity->>'security_level',
    'security_level_source', v_identity->>'security_level_source'
  );
END;
$$;
COMMENT ON FUNCTION tenant_guard.create_worker(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) IS
  'Human command (AL-2678, WP5 rest part B): staff with safety.restrict_publication add a worker with no login: one Party and worker row, worker_created, then set_worker_identity (standard and unreviewed when no level is given). Names and reason required by the safety normalization; the legal name is in no answer.';
-- Granted as its owner: on Supabase postgres is no superuser and cannot
-- change the grants of a function tenant_guard owns.
REVOKE ALL ON FUNCTION tenant_guard.create_worker(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.create_worker(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) TO authenticated;
RESET ROLE;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

-- 3. The wrapper.
CREATE FUNCTION public.create_worker(
  p_tenant_id UUID,
  p_display_name TEXT,
  p_legal_name TEXT,
  p_real_country TEXT,
  p_precise_location TEXT,
  p_security_level TEXT,
  p_public_alias TEXT,
  p_legal_entity_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.create_worker(
    p_tenant_id, p_display_name, p_legal_name, p_real_country, p_precise_location,
    p_security_level, p_public_alias, p_legal_entity_id, p_reason
  );
$$;
COMMENT ON FUNCTION public.create_worker(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) IS
  'Wrapper of tenant_guard.create_worker for the Data API (AL-2678). Runs as the caller; EXECUTE for authenticated only.';
ALTER FUNCTION public.create_worker(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.create_worker(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_worker(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) TO authenticated;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
