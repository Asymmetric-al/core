-- AL-2678 (WP5 rest, part B; brief stage5/wp5-rest.md, pull request 2,
-- invariant 11; ruling Q2 (a)). Staff invite a worker to sign in, and the
-- invited person's acceptance ties their login to that worker under the
-- donor writer's rule.
--
-- 1. public.membership_invitations.party_id: the worker's Party an
--    invitation names, NULL for every invitation issued before and for
--    invite_member's; composite foreign key to public.parties (tenant_id, id),
--    only on a member_invite for a missionary; its five field_policies rows
--    (internal; visible in Mission Control only) and its manifest entry.
-- 2. private.accept_worker_invitation(tenant, Party, login): a postgres-owned
--    definer with an empty search path, EXECUTE for tenant_guard only, in
--    the tenant the transaction entered (42501 otherwise). It locks the Party
--    FOR UPDATE, then its worker row FOR UPDATE, and refuses, writing
--    nothing: no worker row or no profile row for the login (42501, the
--    acceptance's one answer); a worker whose login is another person's, or
--    a Party another login is linked to (55006, "This worker already has a
--    login"); a login that holds an account link, a worker row or a donor on
--    another Party of the organization (21000, "This login already belongs
--    to another person in this organization"). Otherwise it sets the
--    worker's profile_id to the login where NULL (whose row trigger
--    re-derives the login's children under the assignment key's lock), adds
--    the account link ('invitation') where there is none, and answers the
--    worker's id.
-- 3. tenant_guard.invite_worker(tenant, e-mail, Party, display name, legal
--    name, real country, precise location, legal entity, reason): a human
--    command owned by tenant_guard, opening with begin_human_command(...,
--    'people.manage_members'); after it locks the organization and the
--    caller's assignment it refuses 42501 unless that assignment holds both
--    people.manage_members and safety.restrict_publication. Given a Party,
--    it invites that worker (P0002 when the Party has no worker row; 55006
--    when the worker has a login or a linked login; 22023 when names come
--    with it). Given none, it creates the worker as create_worker does
--    (display and legal names required by private.normalize_safety_text;
--    worker_created, then set_worker_identity with no level: standard and
--    unreviewed). Then it issues a member_invite for a missionary through
--    tenant_guard.issue_membership_invitation, names the Party on it, and
--    writes membership_invitation_issued with the Party and worker. It
--    answers the invitation's parts, the Party and the worker; never the
--    legal name. public.invite_worker is its invoker wrapper; EXECUTE on
--    both for authenticated only.
-- 4. tenant_guard.accept_membership_invitation: its text from
--    20261123040100 with three changes for an invitation that names a Party.
--    After the organization's row lock it reads the invitation's Party; with
--    one, it refuses any isolation level but READ COMMITTED (25001) and takes
--    the donor writer's lock ('donor_party_writer', organization:caller)
--    before the caller's membership rows. After the invitation row is locked
--    and checked it calls item 2. Its audit row and answer add party_id and
--    the worker's id (assignment_id). An invitation naming no Party is
--    accepted exactly as before. Owner, grants and the one answer for an
--    invalid invitation unchanged; its reviewed digest in
--    scripts/verify/command-entry-boundaries.mjs moves (D-18).
--
-- tenant_guard gains EXECUTE on item 2 only (GUARD_REACH, D-18: a reviewed
-- postgres-owned helper, as invariant 14 allows).
--
-- Lock order of an acceptance that names a Party: the organization's row
-- (FOR NO KEY UPDATE), the writer's lock, the caller's membership rows in id
-- order, the invitation row, the Party, its worker row, then the worker's
-- trigger takes the login's assignment key and the rows of its children.
-- The claim and the gift writers take the writer's lock, then the Party, so
-- none waits on the others in a cycle.
--
-- Locks at migration time: public.membership_invitations ACCESS EXCLUSIVE
-- for the new column, then SHARE ROW EXCLUSIVE on it and public.parties for
-- the foreign key added NOT VALID and validated (no row names a Party yet);
-- object locks on the replaced function. lock_timeout stops a run rather
-- than queue it.
--
-- What the running build does: nothing calls invite_worker; acceptance of
-- an invitation naming no Party answers as before.
--
-- Recovery. A run lost between its COMMIT and its ledger row stops on the
-- next run at ADD COLUMN (42701), rolling back. This file has committed when
-- this read-only check returns true (false before it, never an error):
-- Check begins
--   SELECT EXISTS (SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid = 'public.membership_invitations'::pg_catalog.regclass AND attname = 'party_id' AND NOT attisdropped) AS committed;
-- Check ends
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127090300.
--
-- Down (after the build that calls it is rolled back; one transaction): the
-- acceptance's text and comment from 20261123040100 replaced as its owner;
-- the invite command, its wrapper and the helper dropped; issued
-- invitations that name a Party revoked, since without the column they
-- would let a person in with no worker; the column, its rows of
-- field_policies and its manifest entry removed; then restore the
-- acceptance's reviewed digest. Accepted invitations, links and logins
-- written stay.
-- Down begins
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
--   SET LOCAL ROLE tenant_guard;
--   CREATE OR REPLACE FUNCTION tenant_guard.accept_membership_invitation(
--   \lines 424-638 of 20261123040100_wp3c_invitation_and_operator_commands.sql
--   RESET ROLE;
--   REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;
--   DROP FUNCTION public.invite_worker(UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, UUID, TEXT);
--   DROP FUNCTION tenant_guard.invite_worker(UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, UUID, TEXT);
--   DROP FUNCTION private.accept_worker_invitation(UUID, UUID, UUID);
--   UPDATE public.membership_invitations SET status = 'revoked', revoked_at = pg_catalog.now(), updated_at = pg_catalog.now() WHERE party_id IS NOT NULL AND status = 'issued';
--   DELETE FROM public.field_policies WHERE record_type = 'membership_invitations' AND field_key = 'party_id';
--   ALTER TABLE public.membership_invitations DROP COLUMN party_id;
--   COMMIT;
--   SELECT pg_notify('pgrst', 'reload schema');
-- Down ends

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. The Party an invitation names.
ALTER TABLE public.membership_invitations ADD COLUMN party_id UUID;
ALTER TABLE public.membership_invitations
  ADD CONSTRAINT membership_invitations_party_same_tenant_fk
  FOREIGN KEY (tenant_id, party_id) REFERENCES public.parties (tenant_id, id) NOT VALID;
ALTER TABLE public.membership_invitations
  VALIDATE CONSTRAINT membership_invitations_party_same_tenant_fk;
ALTER TABLE public.membership_invitations
  ADD CONSTRAINT membership_invitations_party_worker_check
  CHECK (party_id IS NULL OR (role = 'missionary' AND purpose = 'member_invite'));
CREATE INDEX membership_invitations_party_idx
  ON public.membership_invitations (tenant_id, party_id)
  WHERE party_id IS NOT NULL;
COMMENT ON COLUMN public.membership_invitations.party_id IS
  'The worker''s Party a worker invitation names (AL-2678, WP5 rest part B); its acceptance ties the accepting login to that worker. NULL for every other invitation.';

INSERT INTO public.field_policies (
  record_type,
  field_key,
  surface,
  visible,
  editable,
  exportable,
  sensitivity_category
)
SELECT
  'membership_invitations',
  'party_id',
  s.surface,
  s.surface = 'mission_control',
  false,
  false,
  'internal'::public.field_sensitivity_category
FROM pg_catalog.unnest(
  ARRAY['mission_control', 'donor', 'missionary', 'public', 'export']
) AS s(surface);

-- 2. The worker's login and link, under the Party's lock.
CREATE FUNCTION private.accept_worker_invitation(
  p_tenant_id UUID,
  p_party_id UUID,
  p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_entered UUID;
  v_worker RECORD;
BEGIN
  v_entered := NULLIF(pg_catalog.current_setting('app.current_tenant_id', true), '')::UUID;
  IF (v_entered = p_tenant_id) IS NOT TRUE THEN
    RAISE EXCEPTION 'accept_worker_invitation: the transaction did not enter this organization'
      USING ERRCODE = '42501';
  END IF;

  PERFORM 1
     FROM public.parties AS p
    WHERE p.tenant_id = p_tenant_id
      AND p.id = p_party_id
      FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation is invalid or no longer available'
      USING ERRCODE = '42501';
  END IF;

  SELECT m.id, m.profile_id
    INTO v_worker
    FROM public.missionaries AS m
   WHERE m.tenant_id = p_tenant_id
     AND m.party_id = p_party_id
     FOR UPDATE;
  IF NOT FOUND
     OR NOT EXISTS (SELECT 1 FROM public.profiles AS pr WHERE pr.id = p_user_id) THEN
    RAISE EXCEPTION 'Invitation is invalid or no longer available'
      USING ERRCODE = '42501';
  END IF;

  IF (v_worker.profile_id IS NOT NULL AND v_worker.profile_id <> p_user_id)
     OR EXISTS (
       SELECT 1
         FROM public.account_links AS al
        WHERE al.tenant_id = p_tenant_id
          AND al.party_id = p_party_id
          AND al.user_id <> p_user_id
     ) THEN
    RAISE EXCEPTION 'This worker already has a login'
      USING ERRCODE = '55006';
  END IF;

  IF EXISTS (
       SELECT 1
         FROM public.account_links AS al
        WHERE al.tenant_id = p_tenant_id
          AND al.user_id = p_user_id
          AND al.party_id <> p_party_id
     )
     OR EXISTS (
       SELECT 1
         FROM public.missionaries AS m
        WHERE m.tenant_id = p_tenant_id
          AND m.profile_id = p_user_id
          AND m.party_id <> p_party_id
     )
     OR EXISTS (
       SELECT 1
         FROM public.donors AS d
        WHERE d.tenant_id = p_tenant_id
          AND d.profile_id = p_user_id
          AND d.party_id IS DISTINCT FROM p_party_id
     ) THEN
    RAISE EXCEPTION 'This login already belongs to another person in this organization'
      USING ERRCODE = '21000';
  END IF;

  IF v_worker.profile_id IS NULL THEN
    UPDATE public.missionaries AS m
       SET profile_id = p_user_id
     WHERE m.tenant_id = p_tenant_id
       AND m.id = v_worker.id;
  END IF;

  INSERT INTO public.account_links (tenant_id, user_id, party_id, linked_via)
  VALUES (p_tenant_id, p_user_id, p_party_id, 'invitation')
  ON CONFLICT DO NOTHING;

  RETURN v_worker.id;
END;
$$;
COMMENT ON FUNCTION private.accept_worker_invitation(UUID, UUID, UUID) IS
  'For tenant_guard.accept_membership_invitation (AL-2678, WP5 rest part B, invariant 11): in the entered organization, locks the invited worker''s Party, then its worker row, refuses a worker with another login or a linked login (55006) and a login tied to another Party there by a link, a worker row or a donor (21000), then sets the worker''s login where NULL and adds the account link (''invitation''). Answers the worker''s id. EXECUTE: tenant_guard.';
ALTER FUNCTION private.accept_worker_invitation(UUID, UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.accept_worker_invitation(UUID, UUID, UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.accept_worker_invitation(UUID, UUID, UUID) TO tenant_guard;

-- 3 and 4, owned by tenant_guard, which holds CREATE on its schema only for this.
GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
SET LOCAL ROLE tenant_guard;

CREATE FUNCTION tenant_guard.invite_worker(
  p_tenant_id UUID,
  p_email TEXT,
  p_party_id UUID,
  p_display_name TEXT,
  p_legal_name TEXT,
  p_real_country TEXT,
  p_precise_location TEXT,
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
  v_reason TEXT;
  v_display TEXT;
  v_email TEXT;
  v_email_norm TEXT;
  v_tenant_status TEXT;
  v_caller RECORD;
  v_caller_found BOOLEAN;
  v_caps TEXT[];
  v_worker RECORD;
  v_party UUID;
  v_worker_id UUID;
  v_issued RECORD;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'people.manage_members');

  v_reason := private.normalize_safety_text(p_reason);
  IF v_reason IS NULL THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;

  v_email := pg_catalog.btrim(COALESCE(p_email, ''));
  v_email_norm := public.normalize_email(v_email);
  IF v_email_norm IS NULL
     OR v_email_norm !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'A valid email address is required' USING ERRCODE = '22023';
  END IF;

  IF p_party_id IS NOT NULL THEN
    IF p_display_name IS NOT NULL OR p_legal_name IS NOT NULL OR p_real_country IS NOT NULL
       OR p_precise_location IS NOT NULL OR p_legal_entity_id IS NOT NULL THEN
      RAISE EXCEPTION 'Name an existing worker or give a new worker''s names, not both'
        USING ERRCODE = '22023';
    END IF;
  ELSE
    v_display := private.normalize_safety_text(p_display_name);
    IF v_display IS NULL THEN
      RAISE EXCEPTION 'A display name is required' USING ERRCODE = '22023';
    END IF;
    IF private.normalize_safety_text(p_legal_name) IS NULL THEN
      RAISE EXCEPTION 'A legal name is required' USING ERRCODE = '22023';
    END IF;
  END IF;

  v_tenant_status := private.lock_tenant(v_ctx.tenant_id);
  IF v_tenant_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'tenant_guard: tenant is not active' USING ERRCODE = '42501';
  END IF;

  SELECT m.is_active, m.revoked_at
    INTO v_caller
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.id = v_ctx.assignment_id
     FOR UPDATE;
  v_caller_found := FOUND;
  v_caps := authz.assignment_capabilities(v_ctx.assignment_id);

  IF NOT v_caller_found
     OR NOT v_caller.is_active
     OR v_caller.revoked_at IS NOT NULL
     OR NOT ('people.manage_members' = ANY (v_caps))
     OR NOT ('safety.restrict_publication' = ANY (v_caps)) THEN
    RAISE EXCEPTION 'tenant_guard: the selected assignment does not hold the capability this command requires'
      USING ERRCODE = '42501';
  END IF;

  IF p_party_id IS NOT NULL THEN
    SELECT m.id, m.profile_id
      INTO v_worker
      FROM public.missionaries AS m
     WHERE m.tenant_id = v_ctx.tenant_id
       AND m.party_id = p_party_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No worker with that id in this organization' USING ERRCODE = 'P0002';
    END IF;
    IF v_worker.profile_id IS NOT NULL
       OR EXISTS (
         SELECT 1
           FROM public.account_links AS al
          WHERE al.tenant_id = v_ctx.tenant_id
            AND al.party_id = p_party_id
       ) THEN
      RAISE EXCEPTION 'This worker already has a login' USING ERRCODE = '55006';
    END IF;
    v_party := p_party_id;
    v_worker_id := v_worker.id;
  ELSE
    SELECT w.party_id, w.assignment_id
      INTO v_party, v_worker_id
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
        'worker_id', v_worker_id
      )
    );

    PERFORM tenant_guard.set_worker_identity(
      v_ctx.tenant_id, v_party, p_legal_name, p_real_country, p_precise_location,
      v_display, NULL, NULL, p_reason
    );
  END IF;

  SELECT i.invitation_id, i.selector, i.verifier, i.expires_at
    INTO v_issued
    FROM tenant_guard.issue_membership_invitation(
      v_ctx.tenant_id,
      v_email,
      'missionary'::authz.membership_role,
      NULL,
      false,
      'member_invite',
      'email',
      v_ctx.actor_id,
      v_reason,
      INTERVAL '7 days'
    ) AS i;

  UPDATE public.membership_invitations AS i
     SET party_id = v_party
   WHERE i.tenant_id = v_ctx.tenant_id
     AND i.id = v_issued.invitation_id;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'membership_invitation_issued',
    'membership_invitation',
    v_issued.invitation_id::TEXT,
    pg_catalog.jsonb_build_object(
      'reason', v_reason,
      'assignment_id', v_ctx.assignment_id,
      'invitation_id', v_issued.invitation_id,
      'email', v_email_norm,
      'role', 'missionary',
      'staff_role', NULL,
      'is_tenant_admin', false,
      'purpose', 'member_invite',
      'delivery_mode', 'email',
      'expires_at', v_issued.expires_at,
      'party_id', v_party,
      'worker_id', v_worker_id
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'invitation_id', v_issued.invitation_id,
    'tenant_id', tenant_guard.current_tenant_id(),
    'selector', v_issued.selector,
    'verifier', v_issued.verifier,
    'expires_at', v_issued.expires_at,
    'role', 'missionary',
    'staff_role', NULL,
    'is_tenant_admin', false,
    'party_id', v_party,
    'assignment_id', v_worker_id
  );
END;
$$;
COMMENT ON FUNCTION tenant_guard.invite_worker(UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) IS
  'Human command (AL-2678, WP5 rest part B, invariant 11): staff holding people.manage_members and safety.restrict_publication invite a worker to sign in: the worker a Party names (no login, no linked login), or a new one made as create_worker makes it (names required; standard and unreviewed). Issues a member_invite for a missionary naming the Party; audits without the legal name or a secret; answers the link''s parts, the Party and the worker.';

CREATE OR REPLACE FUNCTION tenant_guard.accept_membership_invitation(
  p_selector TEXT,
  p_verifier TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor UUID;
  v_match RECORD;
  v_tenant_status TEXT;
  v_party UUID;
  v_worker UUID;
  v_inv RECORD;
  v_existing RECORD;
  v_other_op RECORD;
  v_membership_id UUID;
  v_revived BOOLEAN;
  v_now TIMESTAMPTZ;
BEGIN
  v_actor := tenant_guard.caller_id();
  IF v_actor IS NULL OR private.is_platform_operator(v_actor) THEN
    RAISE EXCEPTION 'Invitation is invalid or no longer available'
      USING ERRCODE = '42501';
  END IF;

  SELECT r.invitation_id, r.tenant_id
    INTO v_match
    FROM private.resolve_invitation_for_caller(p_selector, p_verifier, v_actor) AS r;

  IF NOT FOUND OR v_match.invitation_id IS NULL OR v_match.tenant_id IS NULL THEN
    RAISE EXCEPTION 'Invitation is invalid or no longer available'
      USING ERRCODE = '42501';
  END IF;

  PERFORM tenant_guard.enter(v_match.tenant_id);

  v_tenant_status := private.lock_tenant(v_match.tenant_id);
  IF v_tenant_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'This organization is not currently active and cannot accept invitations'
      USING ERRCODE = '55000';
  END IF;

  SELECT i.party_id
    INTO v_party
    FROM public.membership_invitations AS i
   WHERE i.tenant_id = v_match.tenant_id
     AND i.id = v_match.invitation_id;

  IF v_party IS NOT NULL THEN
    IF (pg_catalog.current_setting('transaction_isolation') = 'read committed') IS NOT TRUE THEN
      RAISE EXCEPTION 'read_committed_required'
        USING ERRCODE = '25001',
              DETAIL = 'A worker invitation is accepted only at READ COMMITTED.';
    END IF;
    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtext('donor_party_writer'),
      pg_catalog.hashtext(v_match.tenant_id::TEXT || ':' || v_actor::TEXT)
    );
  END IF;

  PERFORM 1
     FROM authz.memberships AS m
    WHERE m.tenant_id = v_match.tenant_id
      AND m.user_id = v_actor
    ORDER BY m.id
      FOR UPDATE;

  SELECT
    i.id,
    i.role,
    i.staff_role,
    i.is_tenant_admin,
    i.purpose,
    i.delivery_mode,
    i.invited_by,
    i.status,
    i.expires_at
  INTO v_inv
  FROM public.membership_invitations AS i
  WHERE i.tenant_id = v_match.tenant_id
    AND i.id = v_match.invitation_id
    FOR UPDATE;

  IF NOT FOUND
     OR v_inv.status <> 'issued'
     OR v_inv.expires_at <= pg_catalog.now()
     OR (v_inv.invited_by IS NOT NULL AND v_inv.invited_by = v_actor)
     OR private.is_platform_operator(v_actor) THEN
    RAISE EXCEPTION 'Invitation is invalid or no longer available'
      USING ERRCODE = '42501';
  END IF;

  IF v_party IS NOT NULL THEN
    v_worker := private.accept_worker_invitation(v_match.tenant_id, v_party, v_actor);
  END IF;

  SELECT m.id, m.is_active, m.revoked_at
    INTO v_existing
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_match.tenant_id
     AND m.user_id = v_actor
     AND m.role = v_inv.role
     AND m.staff_role IS NOT DISTINCT FROM v_inv.staff_role;

  v_now := pg_catalog.clock_timestamp();

  IF FOUND THEN
    IF v_existing.is_active AND v_existing.revoked_at IS NULL THEN
      RAISE EXCEPTION 'You already hold this active membership in this organization'
        USING ERRCODE = '23505';
    END IF;

    UPDATE authz.memberships AS m
       SET is_active = true,
           is_tenant_admin = v_inv.is_tenant_admin,
           granted_by = v_inv.invited_by,
           updated_at = v_now
     WHERE m.tenant_id = v_match.tenant_id
       AND m.id = v_existing.id;

    v_membership_id := v_existing.id;
    v_revived := true;
  ELSE
    INSERT INTO authz.memberships (
      user_id,
      tenant_id,
      role,
      staff_role,
      is_tenant_admin,
      is_active,
      granted_by,
      updated_at
    )
    VALUES (
      v_actor,
      v_match.tenant_id,
      v_inv.role,
      v_inv.staff_role,
      v_inv.is_tenant_admin,
      true,
      v_inv.invited_by,
      v_now
    )
    RETURNING id INTO v_membership_id;

    v_revived := false;
  END IF;

  UPDATE public.membership_invitations AS i
     SET status = 'accepted',
         accepted_at = v_now,
         accepted_by = v_actor,
         updated_at = v_now
   WHERE i.tenant_id = v_match.tenant_id
     AND i.id = v_inv.id;

  IF v_inv.is_tenant_admin THEN
    FOR v_other_op IN
      SELECT i.id, i.email_normalized, i.staff_role
        FROM public.membership_invitations AS i
       WHERE i.tenant_id = v_match.tenant_id
         AND i.purpose = 'operator_admin_invite'
         AND i.status = 'issued'
         AND i.id <> v_inv.id
       ORDER BY i.id
         FOR UPDATE OF i
    LOOP
      UPDATE public.membership_invitations AS i
         SET status = 'revoked',
             revoked_at = v_now,
             revoked_by = v_actor,
             updated_at = v_now
       WHERE i.tenant_id = v_match.tenant_id
         AND i.id = v_other_op.id;

      INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
      VALUES (
        v_match.tenant_id,
        v_actor,
        'membership_invitation_revoked',
        'membership_invitation',
        v_other_op.id::TEXT,
        pg_catalog.jsonb_build_object(
          'reason', 'Superseded when tenant administrator membership was accepted',
          'invitation_id', v_other_op.id,
          'superseded_by_invitation_id', v_inv.id,
          'email', v_other_op.email_normalized,
          'role', 'staff',
          'staff_role', v_other_op.staff_role::TEXT,
          'is_tenant_admin', true,
          'purpose', 'operator_admin_invite',
          'revoked_at', v_now
        )
      );
    END LOOP;
  END IF;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_match.tenant_id,
    v_actor,
    'membership_invitation_accepted',
    'membership',
    v_membership_id::TEXT,
    pg_catalog.jsonb_build_object(
      'invitation_id', v_inv.id,
      'purpose', v_inv.purpose,
      'delivery_mode', v_inv.delivery_mode,
      'membership_id', v_membership_id,
      'revived', v_revived,
      'role', v_inv.role::TEXT,
      'staff_role', v_inv.staff_role::TEXT,
      'is_tenant_admin', v_inv.is_tenant_admin,
      'invited_by', v_inv.invited_by
    ) || CASE
      WHEN v_party IS NULL THEN '{}'::JSONB
      ELSE pg_catalog.jsonb_build_object('party_id', v_party, 'worker_id', v_worker)
    END
  );

  RETURN pg_catalog.jsonb_build_object(
    'invitation_id', v_inv.id,
    'tenant_id', tenant_guard.current_tenant_id(),
    'membership_id', v_membership_id,
    'user_id', v_actor,
    'role', v_inv.role::TEXT,
    'staff_role', v_inv.staff_role::TEXT,
    'is_tenant_admin', v_inv.is_tenant_admin,
    'revived', v_revived,
    'accepted_at', v_now
  ) || CASE
    WHEN v_party IS NULL THEN '{}'::JSONB
    ELSE pg_catalog.jsonb_build_object('party_id', v_party, 'assignment_id', v_worker)
  END;
END;
$$;
COMMENT ON FUNCTION tenant_guard.accept_membership_invitation(TEXT, TEXT) IS
  'Pre-membership human command (plan 5.4 line 260, AL-2676 WP3c, R1, R14, R15, F1, F2, F3; AL-2678 WP5 rest part B, invariant 11): '
  'refuses platform operators and issuer self-acceptance, verifies selector, verifier digest, '
  'live status, expiry, and caller confirmed email before entering the tenant or locking any row; '
  'revives revoked same-role rows cleanly. An invitation that names a worker''s Party is accepted only at READ COMMITTED (25001), '
  'under the donor writer''s lock taken after the organization''s row and before the caller''s memberships, and ties the login to that worker '
  'through private.accept_worker_invitation (login set where NULL, account link ''invitation''), refusing a worker with a login (55006) '
  'and a login tied to another Party there (21000); its answer adds party_id and assignment_id.';

RESET ROLE;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

REVOKE ALL ON FUNCTION tenant_guard.invite_worker(UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.invite_worker(UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) TO authenticated;

-- 3. The wrapper.
CREATE FUNCTION public.invite_worker(
  p_tenant_id UUID,
  p_email TEXT,
  p_party_id UUID,
  p_display_name TEXT,
  p_legal_name TEXT,
  p_real_country TEXT,
  p_precise_location TEXT,
  p_legal_entity_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.invite_worker(
    p_tenant_id, p_email, p_party_id, p_display_name, p_legal_name,
    p_real_country, p_precise_location, p_legal_entity_id, p_reason
  );
$$;
COMMENT ON FUNCTION public.invite_worker(UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) IS
  'Wrapper of tenant_guard.invite_worker for the Data API (AL-2678). Runs as the caller; EXECUTE for authenticated only.';
ALTER FUNCTION public.invite_worker(UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.invite_worker(UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.invite_worker(UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) TO authenticated;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
