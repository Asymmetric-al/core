-- AL-2678 (WP5 part 1; plan section 12 WP5, lines 984 and 1003-1007; 5.4,
-- lines 242-243; 6.6; Phase 10 PRD lines 96-97, 136-144, 214 and 222;
-- coordinator ruling W5-R7). The worker safety room.
--
-- 1. private.party_restricted: a worker's legal name, real country, precise
--    location and real photo reference (empty until WP14), in the schema the
--    Data API does not expose, row security forced, with the guard's
--    isolation policy and no privilege for PUBLIC, anon or authenticated.
-- 2. One constraint trigger on each of parties and party_restricted refuses,
--    for every role, a restricted or high-risk level whose public alias is
--    blank or equals the legal name: the two names sit in different tables.
-- 3. Signed-in users hold no insert or update privilege on parties at all
--    (the parties migration grants SELECT only), so the security level, its
--    source, the alias and do-not-publish change only through the commands.
-- 4. public.read_party_restricted(uuid): the one read of the private table.
--    A postgres-owned definer that answers only a caller whose request
--    resolves to a live staff membership in the request's tenant
--    (authz.has_staff_membership); a support grant is never consulted.
-- 5. public.worker_public_display_name(alias, approved profile name, party
--    name): the name projection, never the legal name (6.6).
-- 6. public.unreviewed_worker_security_levels(): the workers of the
--    request's tenant whose level still has the unreviewed default, for the
--    tenant's staff (W5-R7). A definer, because signed-in users may not read
--    missionaries.tenant_id or party_id.
-- 7. Three human commands needing safety.restrict_publication, each with a
--    reason and one audit row, behind invoker wrappers for authenticated:
--    set_worker_identity (creates or edits the private row; at creation it
--    sets the level, its source and the alias), restrict_worker_publication
--    (raises or confirms the level, sets the alias, sets do-not-publish) and
--    lift_worker_restriction (lowers the level, clears do-not-publish). Each
--    one that sets a level marks its source manual. Nothing here writes
--    country_default (WP14). The audit row never carries the legal name.
--    Each command first refuses (42501) a request whose organization header
--    (authz.request_tenant_id()) is missing or names another organization
--    than the one it enters, as the Member Care and Sites commands do until
--    begin_human_command checks it itself. Then it takes the repository's
--    lock order: the organization FOR SHARE (private.share_lock_tenant), the
--    caller's assignment FOR SHARE, a re-check of the active organization,
--    the live assignment and the capability, and only then its targets.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. The private row.
CREATE TABLE private.party_restricted (
  party_id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE RESTRICT,
  legal_name TEXT NOT NULL,
  real_country TEXT,
  precise_location TEXT,
  real_photo_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  CONSTRAINT party_restricted_legal_name_check CHECK (pg_catalog.btrim(legal_name) <> ''),
  CONSTRAINT party_restricted_party_same_tenant_fk
    FOREIGN KEY (tenant_id, party_id) REFERENCES public.parties (tenant_id, id) ON DELETE RESTRICT
);
COMMENT ON TABLE private.party_restricted IS
  'A worker''s legal identity (Phase 10, AL-2678). Read only through public.read_party_restricted; written only by tenant_guard.set_worker_identity.';

ALTER TABLE private.party_restricted ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.party_restricted FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.party_restricted FROM PUBLIC, anon, authenticated;

CREATE POLICY tenant_guard_isolation ON private.party_restricted
  FOR ALL TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id())
  WITH CHECK (tenant_id = tenant_guard.current_tenant_id());
GRANT SELECT, INSERT, UPDATE ON TABLE private.party_restricted TO tenant_guard;

CREATE POLICY tenant_guard_isolation ON public.parties
  FOR ALL TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id())
  WITH CHECK (tenant_id = tenant_guard.current_tenant_id());
GRANT SELECT ON TABLE public.parties TO tenant_guard;
GRANT UPDATE (display_name, security_level, security_level_source, public_alias, do_not_publish, updated_at)
  ON TABLE public.parties TO tenant_guard;

-- 2. The alias rule, on both tables, for every role.
CREATE FUNCTION private.party_alias_problem(p_party_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE
           WHEN p.security_level NOT IN ('restricted', 'high_risk') THEN NULL
           WHEN NULLIF(pg_catalog.btrim(p.public_alias), '') IS NULL THEN 'a restricted or high-risk worker needs a public alias'
           WHEN r.legal_name IS NOT NULL
            AND pg_catalog.lower(pg_catalog.btrim(p.public_alias)) = pg_catalog.lower(pg_catalog.btrim(r.legal_name))
             THEN 'a restricted or high-risk worker''s public alias must differ from the legal name'
         END
    FROM public.parties AS p
    LEFT JOIN private.party_restricted AS r ON r.party_id = p.id
   WHERE p.id = p_party_id;
$$;
ALTER FUNCTION private.party_alias_problem(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.party_alias_problem(UUID) FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION private.parties_alias_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_problem TEXT;
BEGIN
  v_problem := private.party_alias_problem(NEW.id);
  IF v_problem IS NOT NULL THEN
    RAISE EXCEPTION '%', v_problem USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END;
$$;
ALTER FUNCTION private.parties_alias_check() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.parties_alias_check() FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION private.party_restricted_alias_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_problem TEXT;
BEGIN
  v_problem := private.party_alias_problem(NEW.party_id);
  IF v_problem IS NOT NULL THEN
    RAISE EXCEPTION '%', v_problem USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END;
$$;
ALTER FUNCTION private.party_restricted_alias_check() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.party_restricted_alias_check() FROM PUBLIC, anon, authenticated, service_role;

CREATE CONSTRAINT TRIGGER parties_alias_check
  AFTER INSERT OR UPDATE ON public.parties
  FOR EACH ROW EXECUTE FUNCTION private.parties_alias_check();
CREATE CONSTRAINT TRIGGER party_restricted_alias_check
  AFTER INSERT OR UPDATE ON private.party_restricted
  FOR EACH ROW EXECUTE FUNCTION private.party_restricted_alias_check();

-- 4. The one read of the private row.
CREATE FUNCTION public.read_party_restricted(p_party_id UUID)
RETURNS TABLE (
  party_id UUID,
  tenant_id UUID,
  legal_name TEXT,
  real_country TEXT,
  precise_location TEXT,
  real_photo_ref TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT r.party_id, r.tenant_id, r.legal_name, r.real_country, r.precise_location, r.real_photo_ref
    FROM private.party_restricted AS r
   WHERE r.party_id = p_party_id
     AND r.tenant_id = authz.current_tenant_id()
     AND authz.has_staff_membership(authz.current_tenant_id(), NULL);
$$;
COMMENT ON FUNCTION public.read_party_restricted(UUID) IS
  'A worker''s legal identity, for a caller whose request resolves to a live staff membership in the request''s tenant; nobody else, and never through a support grant (AL-2678, plan WP5).';
ALTER FUNCTION public.read_party_restricted(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.read_party_restricted(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.read_party_restricted(UUID) TO authenticated;

-- 5. The name projection.
CREATE FUNCTION public.worker_public_display_name(
  p_public_alias TEXT,
  p_approved_profile_display_name TEXT,
  p_party_display_name TEXT
)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT COALESCE(
    NULLIF(pg_catalog.btrim(p_public_alias), ''),
    NULLIF(pg_catalog.btrim(p_approved_profile_display_name), ''),
    p_party_display_name
  );
$$;
COMMENT ON FUNCTION public.worker_public_display_name(TEXT, TEXT, TEXT) IS
  'A worker''s name outside Mission Control: the alias, else the approved profile''s display name, else the Party''s display name; never the legal name (plan 6.6, AL-2678).';
ALTER FUNCTION public.worker_public_display_name(TEXT, TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.worker_public_display_name(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.worker_public_display_name(TEXT, TEXT, TEXT) TO authenticated, service_role;

-- 6. The unreviewed signal.
CREATE FUNCTION public.unreviewed_worker_security_levels()
RETURNS TABLE (
  party_id UUID,
  missionary_id UUID,
  display_name TEXT,
  security_level TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.id, m.id, p.display_name, p.security_level, p.created_at
    FROM public.parties AS p
    JOIN public.missionaries AS m
      ON m.tenant_id = p.tenant_id
     AND m.party_id = p.id
   WHERE p.tenant_id = authz.current_tenant_id()
     AND p.security_level_source = 'unreviewed_default'
     AND authz.has_staff_membership(authz.current_tenant_id(), NULL)
   ORDER BY p.created_at, p.id;
$$;
COMMENT ON FUNCTION public.unreviewed_worker_security_levels() IS
  'Workers of the request''s tenant whose security level was never confirmed (W5-R7), for the tenant''s staff (AL-2678).';
ALTER FUNCTION public.unreviewed_worker_security_levels() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.unreviewed_worker_security_levels() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.unreviewed_worker_security_levels() TO authenticated;

-- 7. The commands.
CREATE FUNCTION tenant_guard.set_worker_identity(
  p_tenant_id UUID,
  p_party_id UUID,
  p_legal_name TEXT,
  p_real_country TEXT,
  p_precise_location TEXT,
  p_display_name TEXT,
  p_security_level TEXT,
  p_public_alias TEXT,
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
  v_legal TEXT;
  v_party RECORD;
  v_created BOOLEAN;
  v_level TEXT;
  v_source TEXT;
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

  v_reason := pg_catalog.btrim(COALESCE(p_reason, ''));
  IF v_reason = '' THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;
  v_legal := pg_catalog.btrim(COALESCE(p_legal_name, ''));
  IF v_legal = '' THEN
    RAISE EXCEPTION 'A legal name is required' USING ERRCODE = '22023';
  END IF;

  SELECT p.id, p.security_level, p.security_level_source
    INTO v_party
    FROM public.parties AS p
   WHERE p.id = p_party_id
     AND p.tenant_id = v_ctx.tenant_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No Party with that id in this organization' USING ERRCODE = 'P0002';
  END IF;

  PERFORM 1 FROM private.party_restricted AS r WHERE r.party_id = v_party.id FOR UPDATE;
  v_created := NOT FOUND;

  IF v_created THEN
    v_level := COALESCE(p_security_level, 'standard');
    v_source := CASE WHEN p_security_level IS NULL THEN 'unreviewed_default' ELSE 'manual' END;
    IF v_level NOT IN ('standard', 'sensitive', 'restricted', 'high_risk') THEN
      RAISE EXCEPTION 'Unknown security level' USING ERRCODE = '22023';
    END IF;
    UPDATE public.parties AS p
       SET security_level = v_level,
           security_level_source = v_source,
           public_alias = NULLIF(pg_catalog.btrim(p_public_alias), ''),
           display_name = COALESCE(NULLIF(pg_catalog.btrim(p_display_name), ''), p.display_name),
           updated_at = pg_catalog.now()
     WHERE p.id = v_party.id;
    INSERT INTO private.party_restricted (party_id, tenant_id, legal_name, real_country, precise_location)
    VALUES (v_party.id, v_ctx.tenant_id, v_legal,
            NULLIF(pg_catalog.btrim(p_real_country), ''), NULLIF(pg_catalog.btrim(p_precise_location), ''));
  ELSE
    IF p_security_level IS NOT NULL OR p_public_alias IS NOT NULL THEN
      RAISE EXCEPTION 'A worker''s level and alias change through restrict_worker_publication and lift_worker_restriction'
        USING ERRCODE = '22023';
    END IF;
    v_level := v_party.security_level;
    v_source := v_party.security_level_source;
    UPDATE private.party_restricted AS r
       SET legal_name = v_legal,
           real_country = NULLIF(pg_catalog.btrim(p_real_country), ''),
           precise_location = NULLIF(pg_catalog.btrim(p_precise_location), ''),
           updated_at = pg_catalog.now()
     WHERE r.party_id = v_party.id;
    IF NULLIF(pg_catalog.btrim(p_display_name), '') IS NOT NULL THEN
      UPDATE public.parties AS p
         SET display_name = pg_catalog.btrim(p_display_name),
             updated_at = pg_catalog.now()
       WHERE p.id = v_party.id;
    END IF;
  END IF;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'worker_identity_set',
    'party',
    v_party.id::TEXT,
    pg_catalog.jsonb_build_object(
      'reason', v_reason,
      'assignment_id', v_ctx.assignment_id,
      'created', v_created,
      'security_level', v_level,
      'security_level_source', v_source
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'tenant_id', tenant_guard.current_tenant_id(),
    'party_id', v_party.id,
    'created', v_created,
    'security_level', v_level,
    'security_level_source', v_source
  );
END;
$$;

CREATE FUNCTION tenant_guard.restrict_worker_publication(
  p_tenant_id UUID,
  p_party_id UUID,
  p_security_level TEXT,
  p_public_alias TEXT,
  p_do_not_publish BOOLEAN,
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
  v_party RECORD;
  v_levels TEXT[];
  v_after RECORD;
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

  v_reason := pg_catalog.btrim(COALESCE(p_reason, ''));
  IF v_reason = '' THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;
  v_levels := ARRAY['standard', 'sensitive', 'restricted', 'high_risk'];
  IF p_security_level IS NOT NULL AND NOT (p_security_level = ANY (v_levels)) THEN
    RAISE EXCEPTION 'Unknown security level' USING ERRCODE = '22023';
  END IF;
  IF p_do_not_publish IS FALSE THEN
    RAISE EXCEPTION 'Clearing do-not-publish is lift_worker_restriction''s' USING ERRCODE = '22023';
  END IF;
  IF p_security_level IS NULL AND p_public_alias IS NULL AND p_do_not_publish IS NULL THEN
    RAISE EXCEPTION 'Nothing to change' USING ERRCODE = '22023';
  END IF;

  SELECT p.id, p.security_level, p.security_level_source, p.public_alias, p.do_not_publish
    INTO v_party
    FROM public.parties AS p
   WHERE p.id = p_party_id
     AND p.tenant_id = v_ctx.tenant_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No Party with that id in this organization' USING ERRCODE = 'P0002';
  END IF;
  IF p_security_level IS NOT NULL
     AND pg_catalog.array_position(v_levels, p_security_level) < pg_catalog.array_position(v_levels, v_party.security_level) THEN
    RAISE EXCEPTION 'Lowering a level is lift_worker_restriction''s' USING ERRCODE = '22023';
  END IF;

  UPDATE public.parties AS p
     SET security_level = COALESCE(p_security_level, p.security_level),
         security_level_source = CASE WHEN p_security_level IS NULL THEN p.security_level_source ELSE 'manual' END,
         public_alias = CASE WHEN p_public_alias IS NULL THEN p.public_alias ELSE NULLIF(pg_catalog.btrim(p_public_alias), '') END,
         do_not_publish = COALESCE(p_do_not_publish, p.do_not_publish),
         updated_at = pg_catalog.now()
   WHERE p.id = v_party.id
  RETURNING p.security_level, p.security_level_source, p.do_not_publish INTO v_after;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'worker_publication_restricted',
    'party',
    v_party.id::TEXT,
    pg_catalog.jsonb_build_object(
      'reason', v_reason,
      'assignment_id', v_ctx.assignment_id,
      'before', pg_catalog.jsonb_build_object(
        'security_level', v_party.security_level,
        'security_level_source', v_party.security_level_source,
        'do_not_publish', v_party.do_not_publish
      ),
      'after', pg_catalog.jsonb_build_object(
        'security_level', v_after.security_level,
        'security_level_source', v_after.security_level_source,
        'do_not_publish', v_after.do_not_publish
      ),
      'alias_changed', p_public_alias IS NOT NULL
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'tenant_id', tenant_guard.current_tenant_id(),
    'party_id', v_party.id,
    'security_level', v_after.security_level,
    'security_level_source', v_after.security_level_source,
    'do_not_publish', v_after.do_not_publish
  );
END;
$$;

CREATE FUNCTION tenant_guard.lift_worker_restriction(
  p_tenant_id UUID,
  p_party_id UUID,
  p_security_level TEXT,
  p_clear_do_not_publish BOOLEAN,
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
  v_party RECORD;
  v_levels TEXT[];
  v_after RECORD;
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

  v_reason := pg_catalog.btrim(COALESCE(p_reason, ''));
  IF v_reason = '' THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;
  v_levels := ARRAY['standard', 'sensitive', 'restricted', 'high_risk'];
  IF p_security_level IS NOT NULL AND NOT (p_security_level = ANY (v_levels)) THEN
    RAISE EXCEPTION 'Unknown security level' USING ERRCODE = '22023';
  END IF;
  IF p_security_level IS NULL AND p_clear_do_not_publish IS NOT TRUE THEN
    RAISE EXCEPTION 'Nothing to change' USING ERRCODE = '22023';
  END IF;

  SELECT p.id, p.security_level, p.security_level_source, p.do_not_publish
    INTO v_party
    FROM public.parties AS p
   WHERE p.id = p_party_id
     AND p.tenant_id = v_ctx.tenant_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No Party with that id in this organization' USING ERRCODE = 'P0002';
  END IF;
  IF p_security_level IS NOT NULL
     AND pg_catalog.array_position(v_levels, p_security_level) > pg_catalog.array_position(v_levels, v_party.security_level) THEN
    RAISE EXCEPTION 'Raising a level is restrict_worker_publication''s' USING ERRCODE = '22023';
  END IF;

  UPDATE public.parties AS p
     SET security_level = COALESCE(p_security_level, p.security_level),
         security_level_source = CASE WHEN p_security_level IS NULL THEN p.security_level_source ELSE 'manual' END,
         do_not_publish = CASE WHEN p_clear_do_not_publish THEN false ELSE p.do_not_publish END,
         updated_at = pg_catalog.now()
   WHERE p.id = v_party.id
  RETURNING p.security_level, p.security_level_source, p.do_not_publish INTO v_after;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'worker_restriction_lifted',
    'party',
    v_party.id::TEXT,
    pg_catalog.jsonb_build_object(
      'reason', v_reason,
      'assignment_id', v_ctx.assignment_id,
      'before', pg_catalog.jsonb_build_object(
        'security_level', v_party.security_level,
        'security_level_source', v_party.security_level_source,
        'do_not_publish', v_party.do_not_publish
      ),
      'after', pg_catalog.jsonb_build_object(
        'security_level', v_after.security_level,
        'security_level_source', v_after.security_level_source,
        'do_not_publish', v_after.do_not_publish
      )
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'tenant_id', tenant_guard.current_tenant_id(),
    'party_id', v_party.id,
    'security_level', v_after.security_level,
    'security_level_source', v_after.security_level_source,
    'do_not_publish', v_after.do_not_publish
  );
END;
$$;

COMMENT ON FUNCTION tenant_guard.set_worker_identity(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) IS
  'Human command (plan 5.4, AL-2678): creates or edits a worker''s private identity row and, at creation, sets the level, its source and the alias. Needs safety.restrict_publication and a reason.';
COMMENT ON FUNCTION tenant_guard.restrict_worker_publication(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT) IS
  'Human command (plan 5.4, AL-2678): raises or confirms a worker''s level, sets the alias or do-not-publish. Needs safety.restrict_publication and a reason.';
COMMENT ON FUNCTION tenant_guard.lift_worker_restriction(UUID, UUID, TEXT, BOOLEAN, TEXT) IS
  'Human command (plan 5.4, AL-2678): lowers a worker''s level or clears do-not-publish. Needs safety.restrict_publication and a reason.';

REVOKE ALL ON FUNCTION tenant_guard.set_worker_identity(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.restrict_worker_publication(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.lift_worker_restriction(UUID, UUID, TEXT, BOOLEAN, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.set_worker_identity(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION tenant_guard.restrict_worker_publication(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION tenant_guard.lift_worker_restriction(UUID, UUID, TEXT, BOOLEAN, TEXT) TO authenticated;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.set_worker_identity(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.restrict_worker_publication(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.lift_worker_restriction(UUID, UUID, TEXT, BOOLEAN, TEXT) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE FUNCTION public.set_worker_identity(
  p_tenant_id UUID,
  p_party_id UUID,
  p_legal_name TEXT,
  p_real_country TEXT,
  p_precise_location TEXT,
  p_display_name TEXT,
  p_security_level TEXT,
  p_public_alias TEXT,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.set_worker_identity(
    p_tenant_id, p_party_id, p_legal_name, p_real_country, p_precise_location,
    p_display_name, p_security_level, p_public_alias, p_reason
  );
$$;

CREATE FUNCTION public.restrict_worker_publication(
  p_tenant_id UUID,
  p_party_id UUID,
  p_security_level TEXT,
  p_public_alias TEXT,
  p_do_not_publish BOOLEAN,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.restrict_worker_publication(
    p_tenant_id, p_party_id, p_security_level, p_public_alias, p_do_not_publish, p_reason
  );
$$;

CREATE FUNCTION public.lift_worker_restriction(
  p_tenant_id UUID,
  p_party_id UUID,
  p_security_level TEXT,
  p_clear_do_not_publish BOOLEAN,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.lift_worker_restriction(
    p_tenant_id, p_party_id, p_security_level, p_clear_do_not_publish, p_reason
  );
$$;

COMMENT ON FUNCTION public.set_worker_identity(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) IS
  'Wrapper of tenant_guard.set_worker_identity for the Data API (AL-2678). Runs as the caller; EXECUTE for authenticated only.';
COMMENT ON FUNCTION public.restrict_worker_publication(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT) IS
  'Wrapper of tenant_guard.restrict_worker_publication for the Data API (AL-2678). Runs as the caller; EXECUTE for authenticated only.';
COMMENT ON FUNCTION public.lift_worker_restriction(UUID, UUID, TEXT, BOOLEAN, TEXT) IS
  'Wrapper of tenant_guard.lift_worker_restriction for the Data API (AL-2678). Runs as the caller; EXECUTE for authenticated only.';

ALTER FUNCTION public.set_worker_identity(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) OWNER TO postgres;
ALTER FUNCTION public.restrict_worker_publication(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT) OWNER TO postgres;
ALTER FUNCTION public.lift_worker_restriction(UUID, UUID, TEXT, BOOLEAN, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.set_worker_identity(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.restrict_worker_publication(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.lift_worker_restriction(UUID, UUID, TEXT, BOOLEAN, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_worker_identity(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restrict_worker_publication(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lift_worker_restriction(UUID, UUID, TEXT, BOOLEAN, TEXT) TO authenticated;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
