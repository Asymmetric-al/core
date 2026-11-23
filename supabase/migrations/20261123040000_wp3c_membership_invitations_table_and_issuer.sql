-- AL-2676 (WP3c, part 1; plan 5.1, 5.4, 12 WP3 line 915; ADR-0025; R6):
-- the membership-invitation table, its field-policy classification rows, its
-- narrow non-secret listing reader for people.manage_members callers, and the
-- one internal SQL issuer helper.
--
-- Table choice: `public.membership_invitations` is added beside
-- `public.legacy_account_invitations` (20261025090000), which is donor-bound
-- (`donor_id NOT NULL`, composite FK to `public.donors`) and pinned by the
-- frozen issue-2255 donor-claim acceptance suite for WP5.
--
-- Protected-action credential storage (ADR-0025): only a random non-secret
-- selector (192-bit base64url) and a versioned SHA-256 digest of an
-- independent 256-bit verifier are stored, never the raw verifier or raw link.
--
-- Down (run by hand, in one transaction):
--   DELETE FROM public.field_policies WHERE record_type = 'membership_invitations';
--   DROP FUNCTION public.tenant_membership_invitations(UUID);
--   DROP FUNCTION tenant_guard.issue_membership_invitation(
--     UUID, TEXT, authz.membership_role, authz.staff_role, BOOLEAN,
--     TEXT, TEXT, UUID, TEXT, INTERVAL
--   );
--   DROP TABLE public.membership_invitations;

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE public.membership_invitations (
  id UUID NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE RESTRICT,
  email TEXT NOT NULL,
  email_normalized TEXT GENERATED ALWAYS AS (public.normalize_email(email)) STORED,
  role authz.membership_role NOT NULL,
  staff_role authz.staff_role,
  is_tenant_admin BOOLEAN NOT NULL DEFAULT false,
  purpose TEXT NOT NULL,
  delivery_mode TEXT NOT NULL,
  selector TEXT NOT NULL,
  verifier_digest_version SMALLINT NOT NULL DEFAULT 1,
  verifier_digest BYTEA NOT NULL,
  invited_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'issued',
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  CONSTRAINT membership_invitations_pkey PRIMARY KEY (tenant_id, id),
  CONSTRAINT membership_invitations_id_key UNIQUE (id),
  CONSTRAINT membership_invitations_email_normalized_check
    CHECK (email_normalized IS NOT NULL),
  CONSTRAINT membership_invitations_role_check
    CHECK (role IN ('staff', 'missionary')),
  CONSTRAINT membership_invitations_staff_role_check
    CHECK (
      (role = 'staff' AND staff_role IS NOT NULL)
      OR (role <> 'staff' AND staff_role IS NULL)
    ),
  CONSTRAINT membership_invitations_tenant_admin_check
    CHECK (NOT is_tenant_admin OR role = 'staff'),
  CONSTRAINT membership_invitations_purpose_check
    CHECK (purpose IN ('member_invite', 'operator_admin_invite')),
  CONSTRAINT membership_invitations_delivery_mode_check
    CHECK (delivery_mode IN ('email', 'operator_handoff')),
  CONSTRAINT membership_invitations_operator_admin_check
    CHECK (
      purpose <> 'operator_admin_invite'
      OR (role = 'staff' AND is_tenant_admin AND delivery_mode = 'operator_handoff')
    ),
  CONSTRAINT membership_invitations_selector_check
    CHECK (selector ~ '^[A-Za-z0-9_-]{32,64}$'),
  CONSTRAINT membership_invitations_verifier_digest_version_check
    CHECK (verifier_digest_version = 1),
  CONSTRAINT membership_invitations_verifier_digest_length_check
    CHECK (pg_catalog.octet_length(verifier_digest) = 32),
  CONSTRAINT membership_invitations_reason_check
    CHECK (pg_catalog.regexp_replace(reason, '^[[:space:]]+|[[:space:]]+$', '', 'g') <> ''),
  CONSTRAINT membership_invitations_expires_after_created_check
    CHECK (expires_at > created_at),
  CONSTRAINT membership_invitations_status_check
    CHECK (status IN ('issued', 'accepted', 'expired', 'revoked')),
  CONSTRAINT membership_invitations_accepted_state_check
    CHECK ((status = 'accepted') = (accepted_at IS NOT NULL)),
  CONSTRAINT membership_invitations_revoked_state_check
    CHECK ((status = 'revoked') = (revoked_at IS NOT NULL))
);

CREATE UNIQUE INDEX membership_invitations_selector_uidx
  ON public.membership_invitations (selector);

CREATE UNIQUE INDEX membership_invitations_one_live_operator_admin_uidx
  ON public.membership_invitations (tenant_id)
  WHERE purpose = 'operator_admin_invite' AND status = 'issued';

CREATE INDEX membership_invitations_tenant_status_idx
  ON public.membership_invitations (tenant_id, status, created_at DESC);

CREATE INDEX membership_invitations_tenant_email_idx
  ON public.membership_invitations (tenant_id, email_normalized);

COMMENT ON TABLE public.membership_invitations IS
  'Single-use, expiring, revocable membership invitations for staff, missionaries, '
  'and operator-issued tenant administrators (AL-2676 WP3c; ADR-0025). Stores '
  'only a random selector and a versioned SHA-256 digest of a 256-bit verifier.';
COMMENT ON COLUMN public.membership_invitations.selector IS
  'Random non-secret protected-action URL selector (192-bit base64url). Never granted to authenticated.';
COMMENT ON COLUMN public.membership_invitations.verifier_digest IS
  'Versioned 32-byte SHA-256 digest of selector and 256-bit verifier. Raw verifier is never stored.';

ALTER TABLE public.membership_invitations OWNER TO postgres;
ALTER TABLE public.membership_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_invitations FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.membership_invitations FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.membership_invitations TO tenant_guard;

CREATE POLICY tenant_guard_isolation
  ON public.membership_invitations
  FOR ALL
  TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id())
  WITH CHECK (tenant_id = tenant_guard.current_tenant_id());

CREATE FUNCTION tenant_guard.issue_membership_invitation(
  p_tenant_id UUID,
  p_email TEXT,
  p_role authz.membership_role,
  p_staff_role authz.staff_role,
  p_is_tenant_admin BOOLEAN,
  p_purpose TEXT,
  p_delivery_mode TEXT,
  p_invited_by UUID,
  p_reason TEXT,
  p_ttl INTERVAL DEFAULT INTERVAL '7 days'
)
RETURNS TABLE (
  invitation_id UUID,
  selector TEXT,
  verifier TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_email TEXT;
  v_email_norm TEXT;
  v_reason TEXT;
  v_admin BOOLEAN;
  v_selector_bytes BYTEA;
  v_verifier_bytes BYTEA;
  v_selector TEXT;
  v_verifier TEXT;
  v_digest BYTEA;
  v_now TIMESTAMPTZ;
  v_expires TIMESTAMPTZ;
  v_id UUID;
BEGIN
  IF p_tenant_id IS NULL THEN
    RAISE EXCEPTION 'tenant_guard: tenant id is required'
      USING ERRCODE = '22004';
  END IF;

  v_email := pg_catalog.btrim(COALESCE(p_email, ''));
  v_email_norm := public.normalize_email(v_email);
  IF v_email_norm IS NULL
     OR v_email_norm !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'A valid email address is required'
      USING ERRCODE = '22023';
  END IF;

  v_reason := pg_catalog.regexp_replace(
    COALESCE(p_reason, ''),
    '^[[:space:]]+|[[:space:]]+$',
    '',
    'g'
  );
  IF v_reason = '' THEN
    RAISE EXCEPTION 'A reason is required'
      USING ERRCODE = '22023';
  END IF;

  v_admin := COALESCE(p_is_tenant_admin, false);
  IF p_role IS NULL
     OR p_role NOT IN ('staff', 'missionary')
     OR (p_role = 'staff' AND p_staff_role IS NULL)
     OR (p_role <> 'staff' AND (p_staff_role IS NOT NULL OR v_admin)) THEN
    RAISE EXCEPTION 'Invalid invitation role or administrator flag'
      USING ERRCODE = '22023';
  END IF;

  IF p_purpose IS NULL OR p_purpose NOT IN ('member_invite', 'operator_admin_invite') THEN
    RAISE EXCEPTION 'Invalid invitation purpose'
      USING ERRCODE = '22023';
  END IF;

  IF p_delivery_mode IS NULL OR p_delivery_mode NOT IN ('email', 'operator_handoff') THEN
    RAISE EXCEPTION 'Invalid invitation delivery mode'
      USING ERRCODE = '22023';
  END IF;

  IF p_purpose = 'operator_admin_invite'
     AND (p_role <> 'staff' OR NOT v_admin OR p_delivery_mode <> 'operator_handoff') THEN
    RAISE EXCEPTION 'Operator administrator invitations must be staff administrator handoffs'
      USING ERRCODE = '22023';
  END IF;

  IF p_ttl IS NULL OR p_ttl <= INTERVAL '0 seconds' OR p_ttl > INTERVAL '30 days' THEN
    RAISE EXCEPTION 'Invitation expiry must be positive and at most 30 days'
      USING ERRCODE = '22023';
  END IF;

  v_selector_bytes := pg_catalog.substr(
    pg_catalog.sha256(
      pg_catalog.uuid_send(pg_catalog.gen_random_uuid())
      || pg_catalog.uuid_send(pg_catalog.gen_random_uuid())
    ),
    1,
    24
  );
  v_selector := pg_catalog.translate(
    pg_catalog.rtrim(pg_catalog.encode(v_selector_bytes, 'base64'), '='),
    '+/',
    '-_'
  );

  v_verifier_bytes := pg_catalog.sha256(
    pg_catalog.uuid_send(pg_catalog.gen_random_uuid())
    || pg_catalog.uuid_send(pg_catalog.gen_random_uuid())
    || pg_catalog.uuid_send(pg_catalog.gen_random_uuid())
  );
  v_verifier := pg_catalog.translate(
    pg_catalog.rtrim(pg_catalog.encode(v_verifier_bytes, 'base64'), '='),
    '+/',
    '-_'
  );

  v_digest := pg_catalog.sha256(
    pg_catalog.convert_to(
      'asym-membership-invitation:v1:' || v_selector || ':' || v_verifier,
      'UTF8'
    )
  );

  v_now := pg_catalog.clock_timestamp();
  v_expires := v_now + p_ttl;

  INSERT INTO public.membership_invitations (
    tenant_id,
    email,
    role,
    staff_role,
    is_tenant_admin,
    purpose,
    delivery_mode,
    selector,
    verifier_digest_version,
    verifier_digest,
    invited_by,
    reason,
    expires_at,
    status,
    created_at,
    updated_at
  )
  VALUES (
    p_tenant_id,
    v_email,
    p_role,
    p_staff_role,
    v_admin,
    p_purpose,
    p_delivery_mode,
    v_selector,
    1,
    v_digest,
    p_invited_by,
    v_reason,
    v_expires,
    'issued',
    v_now,
    v_now
  )
  RETURNING id INTO v_id;

  invitation_id := v_id;
  selector := v_selector;
  verifier := v_verifier;
  expires_at := v_expires;
  RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION tenant_guard.issue_membership_invitation(
  UUID, TEXT, authz.membership_role, authz.staff_role, BOOLEAN,
  TEXT, TEXT, UUID, TEXT, INTERVAL
) IS
  'Internal SQL issuer helper (AL-2676 WP3c; ADR-0025). Owned by postgres, '
  'SECURITY INVOKER, EXECUTE for tenant_guard only (and callable by postgres-owned '
  'platform commands). Generates selector and 256-bit verifier, persists only '
  'selector and versioned SHA-256 digest.';

ALTER FUNCTION tenant_guard.issue_membership_invitation(
  UUID, TEXT, authz.membership_role, authz.staff_role, BOOLEAN,
  TEXT, TEXT, UUID, TEXT, INTERVAL
) OWNER TO postgres;
REVOKE ALL ON FUNCTION tenant_guard.issue_membership_invitation(
  UUID, TEXT, authz.membership_role, authz.staff_role, BOOLEAN,
  TEXT, TEXT, UUID, TEXT, INTERVAL
) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.issue_membership_invitation(
  UUID, TEXT, authz.membership_role, authz.staff_role, BOOLEAN,
  TEXT, TEXT, UUID, TEXT, INTERVAL
) TO tenant_guard;

CREATE FUNCTION public.tenant_membership_invitations(p_tenant_id UUID)
RETURNS TABLE (
  id UUID,
  tenant_id UUID,
  email TEXT,
  role TEXT,
  staff_role TEXT,
  is_tenant_admin BOOLEAN,
  purpose TEXT,
  delivery_mode TEXT,
  status TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_assignment UUID;
BEGIN
  v_assignment := authz.caller_assignment(p_tenant_id, 'staff');
  IF v_assignment IS NULL
     OR NOT ('people.manage_members' = ANY (authz.assignment_capabilities(v_assignment))) THEN
    RAISE EXCEPTION 'Forbidden: listing invitations requires people.manage_members in this tenant.'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT
      i.id,
      i.tenant_id,
      i.email,
      i.role::TEXT,
      i.staff_role::TEXT,
      i.is_tenant_admin,
      i.purpose,
      i.delivery_mode,
      i.status,
      i.expires_at,
      i.created_at
    FROM public.membership_invitations AS i
    WHERE i.tenant_id = p_tenant_id
    ORDER BY i.created_at DESC, i.id;
END;
$$;

COMMENT ON FUNCTION public.tenant_membership_invitations(UUID) IS
  'Non-secret listing of membership invitations for a tenant, callable only by '
  'a live staff assignment holding people.manage_members in an active tenant '
  '(AL-2676 WP3c, R6). Never exposes selector or verifier_digest.';

ALTER FUNCTION public.tenant_membership_invitations(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.tenant_membership_invitations(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.tenant_membership_invitations(UUID) TO authenticated;

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
  f.field_key,
  s.surface,
  f.mc_visible AND s.surface = 'mission_control',
  false,
  false,
  f.category::public.field_sensitivity_category
FROM (
  VALUES
    ('id', 'internal', true),
    ('tenant_id', 'internal', true),
    ('email', 'contact', true),
    ('email_normalized', 'contact', true),
    ('role', 'security', true),
    ('staff_role', 'security', true),
    ('is_tenant_admin', 'security', true),
    ('purpose', 'internal', true),
    ('delivery_mode', 'internal', true),
    ('selector', 'security', false),
    ('verifier_digest_version', 'security', false),
    ('verifier_digest', 'security', false),
    ('invited_by', 'internal', true),
    ('reason', 'internal', true),
    ('expires_at', 'internal', true),
    ('status', 'care', true),
    ('accepted_at', 'internal', true),
    ('accepted_by', 'internal', true),
    ('revoked_at', 'internal', true),
    ('revoked_by', 'internal', true),
    ('created_at', 'internal', true),
    ('updated_at', 'internal', true)
) AS f(field_key, category, mc_visible)
CROSS JOIN pg_catalog.unnest(
  ARRAY['mission_control', 'donor', 'missionary', 'public', 'export']
) AS s(surface);

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
