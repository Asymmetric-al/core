-- AL-2677 (WP4a, part 2b; plan 5.4 and 12 WP4a; record D-14, D-85; the
-- coordinator's ruling on Q11): creating a CRM note becomes one human command
-- of the command lane (docs/security/tenant-guard.md, "Adding a human entry
-- point"), so the one CRM write leaves the service key.
--
-- 1. `tenant_guard.create_crm_note(tenant, idempotency_key, title, body,
--    visibility, linked_record_id, linked_record_type, linked_record_label,
--    request_id)`, reached through a `public` invoker wrapper. The preamble
--    requires `admin.crm.manage`, the capability the registry ties to CRM
--    work, on the caller's selected assignment in an active tenant. The
--    command then writes the note and its `crm_command_logs` row in the one
--    transaction of the call: both rows or neither.
--
--    The author of the note and the actor of the log row are the session's:
--    the caller from the preamble and the caller's own profile, which
--    `private.caller_profile_id()` finds as `authz.caller_profile_ids()`
--    matches it: the profile whose `user_id` is the caller, or else the one
--    whose `id` is. No argument names an author, an actor or a tenant other
--    than the one the preamble entered.
--
--    A restricted note needs the tenant-administrator flag of the selected
--    assignment (plan 5.4, 5.5): the command checks it, as the signed-in
--    insert policy on `crm_notes` does, so a staff member who calls the
--    command directly is refused it too.
--
--    Right after the preamble the command locks the selected assignment
--    `FOR SHARE` and checks it again under the lock, before any write or any
--    return of a stored note: the row is found, is the caller's, in this
--    tenant and live, still holds `admin.crm.manage`, and, for a restricted
--    note, still has the administrator flag. Anything not true refuses with
--    42501. A demotion or revocation therefore either commits before the
--    command's lock, and the command refuses, or waits until the command
--    ends: no note is written or returned on authority already withdrawn,
--    also while the command waits for another submission with the same key.
--    The role-change and revoke commands lock the row `FOR UPDATE` and touch
--    no CRM table, so the two never wait on each other in a cycle.
--
--    The log row holds actor, action, references and outcome only (WP4a
--    part 1, F10): tenant, actor, request ID, action, resource type and ID,
--    idempotency key and status. No title, body, visibility or linked record
--    reaches it; `command_payload`, `result_summary` and `error_message` keep
--    their defaults.
--
--    The command is idempotent on the key the client sends once for each
--    submission (ruling 11), not on the request ID. A retry of the same
--    submission by the same author returns the stored note and its log row
--    with `duplicate: true` and writes nothing; two retries at the same
--    moment meet at the unique index on (tenant_id, idempotency_key), and the
--    second returns the first's rows. A key that names another submission,
--    another author's note or a note with no log row is refused (23505).
--
--    Refusals, each writing nothing: the preamble's (42501: no signed-in
--    caller, no live selected assignment of the caller in the tenant, no
--    `admin.crm.manage`, a tenant that is not active); a restricted note
--    without the administrator flag (42501); a caller with no profile
--    (42501); a missing key, a title of more than 160 or a body of more than
--    10,000 characters, either blank, an unknown visibility or linked record
--    type, or a linked record ID or label of more than 160 characters
--    (22023); a reused key (23505).
--
-- 2. What the guard may now do, in the tenant it entered only
--    (`tenant_guard_isolation`): read and insert `crm_notes` (insert by
--    column grant: no ID, author name or time from the caller), and read and
--    insert `crm_command_logs` by column grants that leave out
--    `command_payload`, `result_summary` and `error_message`. It reads no
--    column of `profiles`: it may execute `private.caller_profile_id()`, a
--    `postgres`-owned definer with an empty search path and no argument,
--    which returns the session caller's own profile ID and nothing else (NULL
--    for a call with no session caller). EXECUTE on it is revoked from
--    PUBLIC, anon, authenticated and service_role and granted to
--    `tenant_guard` alone.
--
-- Down (run by hand, in one transaction): DROP FUNCTION
-- public.create_crm_note(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID),
-- tenant_guard.create_crm_note(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
-- UUID); DROP POLICY tenant_guard_isolation ON public.crm_notes; DROP POLICY
-- tenant_guard_isolation ON public.crm_command_logs; DROP FUNCTION
-- private.caller_profile_id(); REVOKE ALL ON public.crm_notes,
-- public.crm_command_logs FROM tenant_guard. The notes and log rows stay.

BEGIN;

SET LOCAL lock_timeout = '5s';

GRANT SELECT ON TABLE public.crm_notes TO tenant_guard;
GRANT INSERT (
  tenant_id,
  title,
  body,
  visibility,
  linked_record_id,
  linked_record_type,
  linked_record_label,
  author_profile_id,
  idempotency_key
) ON TABLE public.crm_notes TO tenant_guard;

DROP POLICY IF EXISTS tenant_guard_isolation ON public.crm_notes;
CREATE POLICY tenant_guard_isolation
  ON public.crm_notes
  FOR ALL
  TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id())
  WITH CHECK (tenant_id = tenant_guard.current_tenant_id());

GRANT SELECT (id, tenant_id, action, resource_id, idempotency_key)
  ON TABLE public.crm_command_logs TO tenant_guard;
GRANT INSERT (
  tenant_id,
  actor_user_id,
  actor_profile_id,
  request_id,
  action,
  resource_type,
  resource_id,
  idempotency_key,
  status
) ON TABLE public.crm_command_logs TO tenant_guard;

DROP POLICY IF EXISTS tenant_guard_isolation ON public.crm_command_logs;
CREATE POLICY tenant_guard_isolation
  ON public.crm_command_logs
  FOR ALL
  TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id())
  WITH CHECK (tenant_id = tenant_guard.current_tenant_id());

CREATE OR REPLACE FUNCTION private.caller_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.id
    FROM public.profiles AS p
   WHERE p.user_id = auth.uid() OR p.id = auth.uid()
   ORDER BY (p.user_id IS NOT DISTINCT FROM auth.uid()) DESC, p.id
   LIMIT 1;
$$;

COMMENT ON FUNCTION private.caller_profile_id() IS
  'The session caller''s own profile ID, matched as authz.caller_profile_ids() '
  'matches it, user_id first (AL-2677 WP4a part 2b). For tenant_guard only.';

ALTER FUNCTION private.caller_profile_id() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.caller_profile_id()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.caller_profile_id() TO tenant_guard;

CREATE OR REPLACE FUNCTION tenant_guard.create_crm_note(
  p_tenant_id UUID,
  p_idempotency_key UUID,
  p_title TEXT,
  p_body TEXT,
  p_visibility TEXT,
  p_linked_record_id TEXT,
  p_linked_record_type TEXT,
  p_linked_record_label TEXT,
  p_request_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_key TEXT;
  v_title TEXT;
  v_body TEXT;
  v_linked_id TEXT;
  v_linked_label TEXT;
  v_profile_id UUID;
  v_note public.crm_notes%ROWTYPE;
  v_log_id UUID;
  v_live BOOLEAN;
  v_admin BOOLEAN;
  v_capable BOOLEAN;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'admin.crm.manage');

  SELECT m.is_tenant_admin
    INTO v_admin
    FROM authz.memberships AS m
   WHERE m.id = v_ctx.assignment_id
     AND m.user_id = v_ctx.actor_id
     AND m.tenant_id = v_ctx.tenant_id
     AND m.is_active
     AND m.revoked_at IS NULL
     FOR SHARE;
  v_live := FOUND;

  IF v_live IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: the selected assignment is no longer a live assignment of the caller in this tenant'
      USING ERRCODE = '42501';
  END IF;

  v_capable := 'admin.crm.manage' = ANY (authz.assignment_capabilities(v_ctx.assignment_id));

  IF v_capable IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: the selected assignment no longer holds admin.crm.manage'
      USING ERRCODE = '42501';
  END IF;

  IF p_visibility = 'restricted' AND v_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: a restricted CRM note needs the tenant-administrator flag'
      USING ERRCODE = '42501';
  END IF;

  v_key := p_idempotency_key::TEXT;
  v_title := pg_catalog.btrim(p_title);
  v_body := pg_catalog.btrim(p_body);
  v_linked_id := NULLIF(pg_catalog.btrim(p_linked_record_id), '');
  v_linked_label := NULLIF(pg_catalog.btrim(p_linked_record_label), '');

  IF v_key IS NULL
     OR COALESCE(pg_catalog.char_length(v_title), 0) NOT BETWEEN 1 AND 160
     OR COALESCE(pg_catalog.char_length(v_body), 0) NOT BETWEEN 1 AND 10000
     OR p_visibility IS NULL
     OR p_visibility NOT IN ('standard', 'restricted')
     OR COALESCE(p_linked_record_type IN ('donor_profile', 'missionary_profile', 'organization'), p_linked_record_type IS NULL) IS NOT TRUE
     OR COALESCE(pg_catalog.char_length(v_linked_id), 0) > 160
     OR COALESCE(pg_catalog.char_length(v_linked_label), 0) > 160 THEN
    RAISE EXCEPTION 'tenant_guard: the CRM note is not valid'
      USING ERRCODE = '22023';
  END IF;

  v_profile_id := private.caller_profile_id();

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'tenant_guard: the caller has no profile'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.crm_notes (
    tenant_id,
    title,
    body,
    visibility,
    linked_record_id,
    linked_record_type,
    linked_record_label,
    author_profile_id,
    idempotency_key
  )
  VALUES (
    v_ctx.tenant_id,
    v_title,
    v_body,
    p_visibility,
    v_linked_id,
    p_linked_record_type,
    v_linked_label,
    v_profile_id,
    v_key
  )
  ON CONFLICT (tenant_id, idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
  RETURNING * INTO v_note;

  IF FOUND THEN
    INSERT INTO public.crm_command_logs (
      tenant_id,
      actor_user_id,
      actor_profile_id,
      request_id,
      action,
      resource_type,
      resource_id,
      idempotency_key,
      status
    )
    VALUES (
      v_ctx.tenant_id,
      v_ctx.actor_id,
      v_profile_id,
      p_request_id::TEXT,
      'crm.note.create',
      'note',
      v_note.id::TEXT,
      v_key,
      'succeeded'
    )
    RETURNING id INTO v_log_id;

    RETURN pg_catalog.jsonb_build_object(
      'note', pg_catalog.to_jsonb(v_note),
      'commandLogId', v_log_id,
      'duplicate', false
    );
  END IF;

  SELECT n.*
    INTO v_note
    FROM public.crm_notes AS n
   WHERE n.tenant_id = v_ctx.tenant_id
     AND n.idempotency_key = v_key
     AND n.author_profile_id = v_profile_id
     AND n.title = v_title
     AND n.body = v_body
     AND n.visibility = p_visibility
     AND (n.visibility <> 'restricted' OR v_admin IS TRUE)
     AND n.linked_record_id IS NOT DISTINCT FROM v_linked_id
     AND n.linked_record_type IS NOT DISTINCT FROM p_linked_record_type
     AND n.linked_record_label IS NOT DISTINCT FROM v_linked_label;

  IF FOUND THEN
    SELECT l.id
      INTO v_log_id
      FROM public.crm_command_logs AS l
     WHERE l.tenant_id = v_ctx.tenant_id
       AND l.idempotency_key = v_key
       AND l.action = 'crm.note.create'
       AND l.resource_id = v_note.id::TEXT;
  END IF;

  IF v_log_id IS NULL THEN
    RAISE EXCEPTION 'tenant_guard: this submission key was used for another CRM note'
      USING ERRCODE = '23505';
  END IF;

  RETURN pg_catalog.jsonb_build_object(
    'note', pg_catalog.to_jsonb(v_note),
    'commandLogId', v_log_id,
    'duplicate', true
  );
END;
$$;

COMMENT ON FUNCTION tenant_guard.create_crm_note(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) IS
  'Human command (plan 5.4, AL-2677 WP4a part 2b): creates a CRM note and its '
  'command-log row in one transaction, in the caller''s tenant, by the caller. '
  'Needs admin.crm.manage, and the tenant-administrator flag for a restricted '
  'note; idempotent on the client''s submission key.';

REVOKE ALL ON FUNCTION tenant_guard.create_crm_note(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.create_crm_note(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  TO authenticated;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.create_crm_note(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE OR REPLACE FUNCTION public.create_crm_note(
  p_tenant_id UUID,
  p_idempotency_key UUID,
  p_title TEXT,
  p_body TEXT,
  p_visibility TEXT,
  p_linked_record_id TEXT,
  p_linked_record_type TEXT,
  p_linked_record_label TEXT,
  p_request_id UUID
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.create_crm_note(
    p_tenant_id,
    p_idempotency_key,
    p_title,
    p_body,
    p_visibility,
    p_linked_record_id,
    p_linked_record_type,
    p_linked_record_label,
    p_request_id
  );
$$;

COMMENT ON FUNCTION public.create_crm_note(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) IS
  'Wrapper of tenant_guard.create_crm_note for the Data API (AL-2677 WP4a '
  'part 2b). Runs as the caller; EXECUTE for authenticated only.';

ALTER FUNCTION public.create_crm_note(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  OWNER TO postgres;
REVOKE ALL ON FUNCTION public.create_crm_note(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_crm_note(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
