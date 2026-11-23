-- AL-2676 (WP3c, part 1; plan 5.1, 5.4, 5.5, 12 WP3 lines 915, 930-937;
-- ADR-0025; rulings R1, R2, R6, F1, F2, F3, F4, F6):
-- human invite and revoke-invitation commands, the operator administrator
-- invitation platform command, the pre-membership invitation acceptance
-- command, their two narrow postgres-owned private helpers, and the public
-- invoker wrappers.
--
-- Global deadlock-free lock order across all invitation and membership
-- commands (F1, F4, R6, R17):
--   1. public.tenants (id) FOR NO KEY UPDATE (via private.lock_tenant or
--      directly in platform.issue_admin_invitation; serializes against other
--      FOR NO KEY UPDATE / FOR UPDATE callers while allowing concurrent
--      FOR KEY SHARE foreign-key checks such as public.audit_logs inserts)
--   2. authz.platform_operators (user_id) FOR SHARE (platform command only)
--   3. authz.memberships ORDER BY id FOR UPDATE
--   4. public.membership_invitations ORDER BY id FOR UPDATE
--
-- Down (run by hand, in one transaction):
--   DROP FUNCTION public.invite_member(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT);
--   DROP FUNCTION public.revoke_membership_invitation(UUID, UUID, TEXT);
--   DROP FUNCTION public.accept_membership_invitation(TEXT, TEXT);
--   DROP FUNCTION public.issue_admin_invitation(UUID, TEXT, TEXT, TEXT);
--   DROP FUNCTION tenant_guard.invite_member(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT);
--   DROP FUNCTION tenant_guard.revoke_membership_invitation(UUID, UUID, TEXT);
--   DROP FUNCTION tenant_guard.accept_membership_invitation(TEXT, TEXT);
--   DROP FUNCTION platform.issue_admin_invitation(UUID, TEXT, TEXT, TEXT);
--   DROP FUNCTION private.resolve_invitation_for_caller(TEXT, TEXT, UUID);
--   DROP FUNCTION private.lock_tenant(UUID);
--   REVOKE INSERT (updated_at) ON TABLE authz.memberships FROM tenant_guard;

BEGIN;
SET LOCAL lock_timeout = '5s';

GRANT INSERT (updated_at) ON TABLE authz.memberships TO tenant_guard;

CREATE FUNCTION private.lock_tenant(p_tenant_id UUID)
RETURNS TEXT
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT t.status
    FROM public.tenants AS t
   WHERE t.id = p_tenant_id
     FOR NO KEY UPDATE;
$$;

COMMENT ON FUNCTION private.lock_tenant(UUID) IS
  'Shared tenant-row serialization lock (AL-2676 WP3c, F1, R17). Locks public.tenants '
  'FOR NO KEY UPDATE and returns its status so tenant_guard commands serialize with '
  'platform.issue_admin_invitation without blocking concurrent FOR KEY SHARE foreign-key '
  'inserts or granting tenant_guard SELECT on public.tenants.';

ALTER FUNCTION private.lock_tenant(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.lock_tenant(UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.lock_tenant(UUID) TO tenant_guard;

CREATE FUNCTION private.resolve_invitation_for_caller(
  p_selector TEXT,
  p_verifier TEXT,
  p_caller_id UUID
)
RETURNS TABLE (
  invitation_id UUID,
  tenant_id UUID
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_inv RECORD;
  v_found BOOLEAN;
  v_expected BYTEA;
  v_stored BYTEA;
  v_diff INTEGER;
  v_idx INTEGER;
  v_caller_email TEXT;
BEGIN
  IF p_selector IS NULL
     OR p_verifier IS NULL
     OR p_caller_id IS NULL
     OR pg_catalog.btrim(p_selector) = ''
     OR pg_catalog.btrim(p_verifier) = '' THEN
    RETURN;
  END IF;

  SELECT
    i.id,
    i.tenant_id,
    i.email_normalized,
    i.verifier_digest_version,
    i.verifier_digest,
    i.invited_by,
    i.status,
    i.expires_at
  INTO v_inv
  FROM public.membership_invitations AS i
  WHERE i.selector = p_selector;

  v_found := FOUND;

  v_expected := pg_catalog.sha256(
    pg_catalog.convert_to(
      'asym-membership-invitation:v1:' || p_selector || ':' || p_verifier,
      'UTF8'
    )
  );

  IF v_found AND pg_catalog.octet_length(v_inv.verifier_digest) = 32 THEN
    v_stored := v_inv.verifier_digest;
  ELSE
    v_stored := pg_catalog.decode(pg_catalog.repeat('00', 32), 'hex');
  END IF;

  v_diff := 0;
  FOR v_idx IN 0..31 LOOP
    v_diff := v_diff | (
      pg_catalog.get_byte(v_stored, v_idx)
      # pg_catalog.get_byte(v_expected, v_idx)
    );
  END LOOP;

  IF NOT v_found
     OR v_inv.verifier_digest_version <> 1
     OR v_diff <> 0
     OR v_inv.status <> 'issued'
     OR v_inv.expires_at <= pg_catalog.now()
     OR (v_inv.invited_by IS NOT NULL AND v_inv.invited_by = p_caller_id) THEN
    RETURN;
  END IF;

  SELECT public.normalize_email(u.email)
    INTO v_caller_email
    FROM auth.users AS u
   WHERE u.id = p_caller_id
     AND u.email_confirmed_at IS NOT NULL
     AND (pg_catalog.to_jsonb(u) ->> 'deleted_at') IS NULL;

  IF NOT FOUND
     OR v_caller_email IS NULL
     OR v_caller_email <> v_inv.email_normalized THEN
    RETURN;
  END IF;

  invitation_id := v_inv.id;
  tenant_id := v_inv.tenant_id;
  RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION private.resolve_invitation_for_caller(TEXT, TEXT, UUID) IS
  'Pre-entry verifier for accept_membership_invitation (AL-2676 WP3c, R1, R14, F2, F3). '
  'Verifies selector, constant-time SHA-256 verifier digest, live status, expiry, '
  'non-self issuer, and caller confirmed non-deleted email without setting tenant context or taking any lock.';

ALTER FUNCTION private.resolve_invitation_for_caller(TEXT, TEXT, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.resolve_invitation_for_caller(TEXT, TEXT, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.resolve_invitation_for_caller(TEXT, TEXT, UUID) TO tenant_guard;

CREATE FUNCTION tenant_guard.invite_member(
  p_tenant_id UUID,
  p_email TEXT,
  p_role TEXT,
  p_staff_role TEXT,
  p_is_tenant_admin BOOLEAN,
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
  v_email TEXT;
  v_email_norm TEXT;
  v_admin BOOLEAN;
  v_role authz.membership_role;
  v_staff authz.staff_role;
  v_tenant_status TEXT;
  v_caller_active BOOLEAN;
  v_caller_revoked TIMESTAMPTZ;
  v_issued RECORD;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'people.manage_members');

  v_reason := pg_catalog.regexp_replace(
    COALESCE(p_reason, ''),
    '^[[:space:]]+|[[:space:]]+$',
    '',
    'g'
  );
  IF v_reason = '' THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;

  v_email := pg_catalog.btrim(COALESCE(p_email, ''));
  v_email_norm := public.normalize_email(v_email);
  IF v_email_norm IS NULL
     OR v_email_norm !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'A valid email address is required' USING ERRCODE = '22023';
  END IF;

  v_admin := COALESCE(p_is_tenant_admin, false);
  IF p_role IS NULL
     OR p_role NOT IN ('staff', 'missionary')
     OR (p_role = 'staff' AND (
          p_staff_role IS NULL
          OR p_staff_role NOT IN ('finance', 'mobilizer', 'development', 'hr', 'member_care')
        ))
     OR (p_role <> 'staff' AND (p_staff_role IS NOT NULL OR v_admin)) THEN
    RAISE EXCEPTION 'Invalid invitation role or administrator flag' USING ERRCODE = '22023';
  END IF;

  v_role := p_role::authz.membership_role;
  v_staff := p_staff_role::authz.staff_role;

  v_tenant_status := private.lock_tenant(v_ctx.tenant_id);
  IF v_tenant_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'tenant_guard: tenant is not active' USING ERRCODE = '42501';
  END IF;

  SELECT m.is_active, m.revoked_at
    INTO v_caller_active, v_caller_revoked
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.id = v_ctx.assignment_id
     FOR UPDATE;

  IF NOT FOUND
     OR NOT v_caller_active
     OR v_caller_revoked IS NOT NULL
     OR NOT ('people.manage_members' = ANY (authz.assignment_capabilities(v_ctx.assignment_id))) THEN
    RAISE EXCEPTION 'tenant_guard: the selected assignment does not hold the capability this command requires'
      USING ERRCODE = '42501';
  END IF;

  SELECT i.invitation_id, i.selector, i.verifier, i.expires_at
    INTO v_issued
    FROM tenant_guard.issue_membership_invitation(
      v_ctx.tenant_id,
      v_email,
      v_role,
      v_staff,
      v_admin,
      'member_invite',
      'email',
      v_ctx.actor_id,
      v_reason,
      INTERVAL '7 days'
    ) AS i;

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
      'role', v_role::TEXT,
      'staff_role', v_staff::TEXT,
      'is_tenant_admin', v_admin,
      'purpose', 'member_invite',
      'delivery_mode', 'email',
      'expires_at', v_issued.expires_at
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'invitation_id', v_issued.invitation_id,
    'tenant_id', tenant_guard.current_tenant_id(),
    'selector', v_issued.selector,
    'verifier', v_issued.verifier,
    'expires_at', v_issued.expires_at,
    'role', v_role::TEXT,
    'staff_role', v_staff::TEXT,
    'is_tenant_admin', v_admin
  );
END;
$$;

COMMENT ON FUNCTION tenant_guard.invite_member(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT) IS
  'Human command (plan 5.4, AL-2676 WP3c): issues a protected-action invitation for '
  'a staff member or missionary. Requires people.manage_members and a reason; re-checks '
  'capability after locking tenant and caller assignment; writes one audit row with no secret.';

CREATE FUNCTION tenant_guard.revoke_membership_invitation(
  p_tenant_id UUID,
  p_invitation_id UUID,
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
  v_tenant_status TEXT;
  v_caller_active BOOLEAN;
  v_caller_revoked TIMESTAMPTZ;
  v_inv RECORD;
  v_now TIMESTAMPTZ;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'people.manage_members');

  v_reason := pg_catalog.regexp_replace(
    COALESCE(p_reason, ''),
    '^[[:space:]]+|[[:space:]]+$',
    '',
    'g'
  );
  IF v_reason = '' THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;

  IF p_invitation_id IS NULL THEN
    RAISE EXCEPTION 'Invitation id is required' USING ERRCODE = '22004';
  END IF;

  v_tenant_status := private.lock_tenant(v_ctx.tenant_id);
  IF v_tenant_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'tenant_guard: tenant is not active' USING ERRCODE = '42501';
  END IF;

  SELECT m.is_active, m.revoked_at
    INTO v_caller_active, v_caller_revoked
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.id = v_ctx.assignment_id
     FOR UPDATE;

  IF NOT FOUND
     OR NOT v_caller_active
     OR v_caller_revoked IS NOT NULL
     OR NOT ('people.manage_members' = ANY (authz.assignment_capabilities(v_ctx.assignment_id))) THEN
    RAISE EXCEPTION 'tenant_guard: the selected assignment does not hold the capability this command requires'
      USING ERRCODE = '42501';
  END IF;

  SELECT
    i.id,
    i.email_normalized,
    i.role,
    i.staff_role,
    i.is_tenant_admin,
    i.purpose,
    i.status,
    i.expires_at
  INTO v_inv
  FROM public.membership_invitations AS i
  WHERE i.tenant_id = v_ctx.tenant_id
    AND i.id = p_invitation_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No membership invitation with that id in this organization'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_inv.status <> 'issued' OR v_inv.expires_at <= pg_catalog.now() THEN
    RAISE EXCEPTION 'Only pending unexpired invitations can be revoked'
      USING ERRCODE = '55000';
  END IF;

  v_now := pg_catalog.clock_timestamp();

  UPDATE public.membership_invitations AS i
     SET status = 'revoked',
         revoked_at = v_now,
         revoked_by = v_ctx.actor_id,
         updated_at = v_now
   WHERE i.tenant_id = v_ctx.tenant_id
     AND i.id = v_inv.id;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'membership_invitation_revoked',
    'membership_invitation',
    v_inv.id::TEXT,
    pg_catalog.jsonb_build_object(
      'reason', v_reason,
      'assignment_id', v_ctx.assignment_id,
      'invitation_id', v_inv.id,
      'email', v_inv.email_normalized,
      'role', v_inv.role::TEXT,
      'staff_role', v_inv.staff_role::TEXT,
      'is_tenant_admin', v_inv.is_tenant_admin,
      'purpose', v_inv.purpose,
      'revoked_at', v_now
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'invitation_id', v_inv.id,
    'tenant_id', tenant_guard.current_tenant_id(),
    'status', 'revoked',
    'revoked_at', v_now
  );
END;
$$;

COMMENT ON FUNCTION tenant_guard.revoke_membership_invitation(UUID, UUID, TEXT) IS
  'Human command (AL-2676 WP3c, R6, F4): revokes a pending membership invitation '
  'in the caller''s tenant. Requires people.manage_members and a reason.';

CREATE FUNCTION tenant_guard.accept_membership_invitation(
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
    )
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
  );
END;
$$;

COMMENT ON FUNCTION tenant_guard.accept_membership_invitation(TEXT, TEXT) IS
  'Pre-membership human command (plan 5.4 line 260, AL-2676 WP3c, R1, R14, R15, F1, F2, F3): '
  'refuses platform operators and issuer self-acceptance, verifies selector, verifier digest, '
  'live status, expiry, and caller confirmed email before entering the tenant or locking any row; '
  'revives revoked same-role rows cleanly.';

REVOKE ALL ON FUNCTION tenant_guard.invite_member(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.revoke_membership_invitation(UUID, UUID, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.accept_membership_invitation(TEXT, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION tenant_guard.invite_member(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION tenant_guard.revoke_membership_invitation(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION tenant_guard.accept_membership_invitation(TEXT, TEXT) TO authenticated;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.invite_member(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.revoke_membership_invitation(UUID, UUID, TEXT) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.accept_membership_invitation(TEXT, TEXT) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE FUNCTION platform.issue_admin_invitation(
  p_tenant_id UUID,
  p_email TEXT,
  p_staff_role TEXT,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_operator UUID := platform.require_operator();
  v_reason TEXT;
  v_email TEXT;
  v_email_norm TEXT;
  v_staff_text TEXT;
  v_staff authz.staff_role;
  v_tenant_status TEXT;
  v_tenant_found BOOLEAN;
  v_prior RECORD;
  v_revoke_now TIMESTAMPTZ;
  v_issued RECORD;
BEGIN
  IF p_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Organization id is required' USING ERRCODE = '22004';
  END IF;

  v_reason := pg_catalog.regexp_replace(
    COALESCE(p_reason, ''),
    '^[[:space:]]+|[[:space:]]+$',
    '',
    'g'
  );
  IF v_reason = '' THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;

  v_email := pg_catalog.btrim(COALESCE(p_email, ''));
  v_email_norm := public.normalize_email(v_email);
  IF v_email_norm IS NULL
     OR v_email_norm !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'A valid email address is required' USING ERRCODE = '22023';
  END IF;

  v_staff_text := NULLIF(pg_catalog.btrim(COALESCE(p_staff_role, '')), '');
  IF v_staff_text IS NULL THEN
    v_staff_text := 'development';
  END IF;
  IF v_staff_text NOT IN ('finance', 'mobilizer', 'development', 'hr', 'member_care') THEN
    RAISE EXCEPTION 'Invalid staff role for administrator invitation' USING ERRCODE = '22023';
  END IF;
  v_staff := v_staff_text::authz.staff_role;

  SELECT t.status
    INTO v_tenant_status
    FROM public.tenants AS t
   WHERE t.id = p_tenant_id
     FOR NO KEY UPDATE;
  v_tenant_found := FOUND;

  PERFORM 1
     FROM authz.platform_operators AS o
    WHERE o.user_id = v_operator
      FOR SHARE;

  PERFORM platform.require_operator();

  IF NOT v_tenant_found THEN
    RAISE EXCEPTION 'Organization not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_tenant_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'Organization is not active; administrator invitations require an active organization'
      USING ERRCODE = '55000';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM authz.memberships AS m
     WHERE m.tenant_id = p_tenant_id
       AND m.is_active
       AND m.revoked_at IS NULL
       AND m.is_tenant_admin
  ) THEN
    RAISE EXCEPTION 'Organization already has a live administrator'
      USING ERRCODE = '42501';
  END IF;

  FOR v_prior IN
    SELECT i.id, i.email_normalized, i.staff_role
      FROM public.membership_invitations AS i
     WHERE i.tenant_id = p_tenant_id
       AND i.purpose = 'operator_admin_invite'
       AND i.status = 'issued'
     ORDER BY i.id
       FOR UPDATE OF i
  LOOP
    v_revoke_now := pg_catalog.clock_timestamp();

    UPDATE public.membership_invitations AS i
       SET status = 'revoked',
           revoked_at = v_revoke_now,
           revoked_by = v_operator,
           updated_at = v_revoke_now
     WHERE i.tenant_id = p_tenant_id
       AND i.id = v_prior.id;

    INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
    VALUES (
      p_tenant_id,
      v_operator,
      'membership_invitation_revoked',
      'membership_invitation',
      v_prior.id::TEXT,
      pg_catalog.jsonb_build_object(
        'reason', v_reason,
        'operator_id', v_operator,
        'superseded_by_operator_admin_invite', true,
        'invitation_id', v_prior.id,
        'email', v_prior.email_normalized,
        'role', 'staff',
        'staff_role', v_prior.staff_role::TEXT,
        'is_tenant_admin', true,
        'purpose', 'operator_admin_invite',
        'revoked_at', v_revoke_now
      )
    );
  END LOOP;

  SELECT i.invitation_id, i.selector, i.verifier, i.expires_at
    INTO v_issued
    FROM tenant_guard.issue_membership_invitation(
      p_tenant_id,
      v_email,
      'staff'::authz.membership_role,
      v_staff,
      true,
      'operator_admin_invite',
      'operator_handoff',
      v_operator,
      v_reason,
      INTERVAL '24 hours'
    ) AS i;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    p_tenant_id,
    v_operator,
    'operator_admin_invitation_issued',
    'membership_invitation',
    v_issued.invitation_id::TEXT,
    pg_catalog.jsonb_build_object(
      'reason', v_reason,
      'operator_id', v_operator,
      'invitation_id', v_issued.invitation_id,
      'email', v_email_norm,
      'role', 'staff',
      'staff_role', v_staff::TEXT,
      'is_tenant_admin', true,
      'purpose', 'operator_admin_invite',
      'delivery_mode', 'operator_handoff',
      'expires_at', v_issued.expires_at
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'invitation_id', v_issued.invitation_id,
    'tenant_id', p_tenant_id,
    'selector', v_issued.selector,
    'verifier', v_issued.verifier,
    'expires_at', v_issued.expires_at,
    'staff_role', v_staff::TEXT
  );
END;
$$;

COMMENT ON FUNCTION platform.issue_admin_invitation(UUID, TEXT, TEXT, TEXT) IS
  'Platform command (plan 5.4, WP3 lines 915 & 937, AL-2676 WP3c, R2, R6, F1, F4): '
  'issues a short-lived personal-handoff administrator invitation for an active tenant '
  'that has no live administrator, revoking any prior unaccepted operator invite.';

ALTER FUNCTION platform.issue_admin_invitation(UUID, TEXT, TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION platform.issue_admin_invitation(UUID, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION platform.issue_admin_invitation(UUID, TEXT, TEXT, TEXT) TO authenticated;

CREATE FUNCTION public.invite_member(
  p_tenant_id UUID,
  p_email TEXT,
  p_role TEXT,
  p_staff_role TEXT,
  p_is_tenant_admin BOOLEAN,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.invite_member(
    p_tenant_id, p_email, p_role, p_staff_role, p_is_tenant_admin, p_reason
  );
$$;

CREATE FUNCTION public.revoke_membership_invitation(
  p_tenant_id UUID,
  p_invitation_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.revoke_membership_invitation(p_tenant_id, p_invitation_id, p_reason);
$$;

CREATE FUNCTION public.accept_membership_invitation(
  p_selector TEXT,
  p_verifier TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.accept_membership_invitation(p_selector, p_verifier);
$$;

CREATE FUNCTION public.issue_admin_invitation(
  p_tenant_id UUID,
  p_email TEXT,
  p_staff_role TEXT,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT platform.issue_admin_invitation(p_tenant_id, p_email, p_staff_role, p_reason);
$$;

COMMENT ON FUNCTION public.invite_member(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT) IS
  'Wrapper of tenant_guard.invite_member for the Data API (AL-2676 WP3c). '
  'Runs as the caller; EXECUTE for authenticated only.';
COMMENT ON FUNCTION public.revoke_membership_invitation(UUID, UUID, TEXT) IS
  'Wrapper of tenant_guard.revoke_membership_invitation for the Data API (AL-2676 WP3c). '
  'Runs as the caller; EXECUTE for authenticated only.';
COMMENT ON FUNCTION public.accept_membership_invitation(TEXT, TEXT) IS
  'Wrapper of tenant_guard.accept_membership_invitation for the Data API (AL-2676 WP3c). '
  'Runs as the caller; EXECUTE for authenticated only.';
COMMENT ON FUNCTION public.issue_admin_invitation(UUID, TEXT, TEXT, TEXT) IS
  'Wrapper of platform.issue_admin_invitation for the Data API (AL-2676 WP3c). '
  'Runs as the caller; EXECUTE for authenticated only.';

ALTER FUNCTION public.invite_member(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT) OWNER TO postgres;
ALTER FUNCTION public.revoke_membership_invitation(UUID, UUID, TEXT) OWNER TO postgres;
ALTER FUNCTION public.accept_membership_invitation(TEXT, TEXT) OWNER TO postgres;
ALTER FUNCTION public.issue_admin_invitation(UUID, TEXT, TEXT, TEXT) OWNER TO postgres;

REVOKE ALL ON FUNCTION public.invite_member(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.revoke_membership_invitation(UUID, UUID, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.accept_membership_invitation(TEXT, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.issue_admin_invitation(UUID, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.invite_member(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_membership_invitation(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_membership_invitation(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.issue_admin_invitation(UUID, TEXT, TEXT, TEXT) TO authenticated;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
