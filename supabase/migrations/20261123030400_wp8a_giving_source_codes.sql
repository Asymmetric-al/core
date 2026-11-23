-- AL-2681 (WP8a part 1; plan 5.4, 12 WP8a; ruling W8-R32):
-- 1. Create public.giving_source_codes with forced RLS, tenant_guard isolation,
--    staff SELECT policy, explicit grants, and field_policies rows.
-- 2. Add human commands create_giving_source_code and update_giving_source_code
--    opening with contributions.manage_settings and requiring a reason. After
--    the preamble each takes the tenant row FOR SHARE, the caller's selected
--    assignment FOR SHARE, then its target, and re-checks its authority under
--    those locks before anything else.

BEGIN;

SET LOCAL lock_timeout = '5s';

CREATE TABLE public.giving_source_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  code TEXT NOT NULL
    CHECK (code = pg_catalog.lower(pg_catalog.btrim(code)) AND code ~ '^[a-z0-9][a-z0-9_-]{0,63}$'),
  label TEXT NOT NULL
    CHECK (pg_catalog.length(pg_catalog.btrim(label)) > 0 AND pg_catalog.char_length(pg_catalog.btrim(label)) <= 120),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT giving_source_codes_tenant_code_key UNIQUE (tenant_id, code),
  CONSTRAINT giving_source_codes_tenant_id_id_key UNIQUE (tenant_id, id)
);

ALTER TABLE public.giving_source_codes
  ENABLE ROW LEVEL SECURITY,
  FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.giving_source_codes
  FROM PUBLIC, anon, authenticated, service_role;

GRANT SELECT ON TABLE public.giving_source_codes TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.giving_source_codes TO tenant_guard;

CREATE POLICY "giving source codes staff tenant select"
  ON public.giving_source_codes
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'::authz.membership_role))
  );

CREATE POLICY tenant_guard_isolation
  ON public.giving_source_codes
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

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
  'giving_source_codes',
  v.field_key,
  s.surface,
  s.surface = 'mission_control',
  CASE WHEN s.surface = 'mission_control' THEN v.mc_editable ELSE false END,
  false,
  v.category::public.field_sensitivity_category
FROM (
  VALUES
    ('id', 'internal', false),
    ('tenant_id', 'internal', false),
    ('code', 'internal', true),
    ('label', 'contact', true),
    ('is_active', 'internal', true),
    ('created_at', 'internal', false),
    ('updated_at', 'internal', false)
) AS v(field_key, category, mc_editable)
CROSS JOIN unnest(
  ARRAY['mission_control', 'donor', 'missionary', 'public', 'export']
) AS s(surface);

CREATE OR REPLACE FUNCTION tenant_guard.create_giving_source_code(
  p_tenant_id UUID,
  p_code TEXT,
  p_label TEXT,
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
  v_capability_held BOOLEAN;
  v_reason TEXT;
  v_code TEXT;
  v_label TEXT;
  v_row RECORD;
  v_now TIMESTAMPTZ;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'contributions.manage_settings');

  v_tenant_status := private.share_lock_tenant(v_ctx.tenant_id);

  SELECT m.user_id, m.tenant_id, m.is_active, m.revoked_at
    INTO v_assignment
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.id = v_ctx.assignment_id
     FOR SHARE;
  v_assignment_found := FOUND;

  v_capability_held := 'contributions.manage_settings' = ANY (authz.assignment_capabilities(v_ctx.assignment_id));

  IF (v_tenant_status = 'active') IS NOT TRUE
     OR (
       v_assignment_found
       AND v_assignment.user_id = v_ctx.actor_id
       AND v_assignment.tenant_id = v_ctx.tenant_id
       AND v_assignment.is_active
       AND v_assignment.revoked_at IS NULL
     ) IS NOT TRUE
     OR v_capability_held IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: the caller no longer holds the authority this command requires'
      USING ERRCODE = '42501';
  END IF;

  v_reason := pg_catalog.regexp_replace(COALESCE(p_reason, ''), '^[[:space:]]+|[[:space:]]+$', '', 'g');
  IF v_reason = '' THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;

  v_code := pg_catalog.lower(pg_catalog.regexp_replace(COALESCE(p_code, ''), '^[[:space:]]+|[[:space:]]+$', '', 'g'));
  IF v_code !~ '^[a-z0-9][a-z0-9_-]{0,63}$' THEN
    RAISE EXCEPTION 'Source code must use 1 to 64 lowercase letters, digits, hyphens, or underscores'
      USING ERRCODE = '22023';
  END IF;

  v_label := pg_catalog.regexp_replace(COALESCE(p_label, ''), '^[[:space:]]+|[[:space:]]+$', '', 'g');
  IF v_label = '' OR pg_catalog.char_length(v_label) > 120 THEN
    RAISE EXCEPTION 'Source code label must be between 1 and 120 characters'
      USING ERRCODE = '22023';
  END IF;

  v_now := pg_catalog.clock_timestamp();

  INSERT INTO public.giving_source_codes (
    tenant_id,
    code,
    label,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    v_ctx.tenant_id,
    v_code,
    v_label,
    true,
    v_now,
    v_now
  )
  RETURNING id, code, label, is_active, created_at, updated_at INTO v_row;

  INSERT INTO public.audit_logs (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    details
  )
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'giving_source_code_created',
    'giving_source_code',
    v_row.id::TEXT,
    pg_catalog.jsonb_build_object(
      'reason', v_reason,
      'assignment_id', v_ctx.assignment_id,
      'code', v_row.code,
      'label', v_row.label,
      'is_active', v_row.is_active
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'source_code_id', v_row.id,
    'tenant_id', tenant_guard.current_tenant_id(),
    'code', v_row.code,
    'label', v_row.label,
    'is_active', v_row.is_active,
    'created_at', v_row.created_at,
    'updated_at', v_row.updated_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION tenant_guard.update_giving_source_code(
  p_tenant_id UUID,
  p_source_code_id UUID,
  p_label TEXT,
  p_is_active BOOLEAN,
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
  v_capability_held BOOLEAN;
  v_reason TEXT;
  v_target RECORD;
  v_target_found BOOLEAN;
  v_next_label TEXT;
  v_next_active BOOLEAN;
  v_now TIMESTAMPTZ;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'contributions.manage_settings');

  v_tenant_status := private.share_lock_tenant(v_ctx.tenant_id);

  SELECT m.user_id, m.tenant_id, m.is_active, m.revoked_at
    INTO v_assignment
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.id = v_ctx.assignment_id
     FOR SHARE;
  v_assignment_found := FOUND;

  SELECT s.*
    INTO v_target
    FROM public.giving_source_codes AS s
   WHERE s.id = p_source_code_id
     AND s.tenant_id = v_ctx.tenant_id
     FOR UPDATE;
  v_target_found := FOUND;

  v_capability_held := 'contributions.manage_settings' = ANY (authz.assignment_capabilities(v_ctx.assignment_id));

  IF (v_tenant_status = 'active') IS NOT TRUE
     OR (
       v_assignment_found
       AND v_assignment.user_id = v_ctx.actor_id
       AND v_assignment.tenant_id = v_ctx.tenant_id
       AND v_assignment.is_active
       AND v_assignment.revoked_at IS NULL
     ) IS NOT TRUE
     OR v_capability_held IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: the caller no longer holds the authority this command requires'
      USING ERRCODE = '42501';
  END IF;

  v_reason := pg_catalog.regexp_replace(COALESCE(p_reason, ''), '^[[:space:]]+|[[:space:]]+$', '', 'g');
  IF v_reason = '' THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;

  IF NOT v_target_found THEN
    RAISE EXCEPTION 'No source code with that id in this organization'
      USING ERRCODE = 'P0002';
  END IF;

  IF p_label IS NOT NULL THEN
    v_next_label := pg_catalog.regexp_replace(p_label, '^[[:space:]]+|[[:space:]]+$', '', 'g');
    IF v_next_label = '' OR pg_catalog.char_length(v_next_label) > 120 THEN
      RAISE EXCEPTION 'Source code label must be between 1 and 120 characters'
        USING ERRCODE = '22023';
    END IF;
  ELSE
    v_next_label := v_target.label;
  END IF;

  v_next_active := COALESCE(p_is_active, v_target.is_active);

  IF v_next_label = v_target.label AND v_next_active = v_target.is_active THEN
    RETURN pg_catalog.jsonb_build_object(
      'changed', false,
      'source_code_id', v_target.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'code', v_target.code,
      'label', v_target.label,
      'is_active', v_target.is_active
    );
  END IF;

  v_now := pg_catalog.clock_timestamp();

  UPDATE public.giving_source_codes
     SET label = v_next_label,
         is_active = v_next_active,
         updated_at = v_now
   WHERE id = v_target.id;

  INSERT INTO public.audit_logs (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    details
  )
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'giving_source_code_updated',
    'giving_source_code',
    v_target.id::TEXT,
    pg_catalog.jsonb_build_object(
      'reason', v_reason,
      'assignment_id', v_ctx.assignment_id,
      'code', v_target.code,
      'from', pg_catalog.jsonb_build_object('label', v_target.label, 'is_active', v_target.is_active),
      'to', pg_catalog.jsonb_build_object('label', v_next_label, 'is_active', v_next_active)
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'changed', true,
    'source_code_id', v_target.id,
    'tenant_id', tenant_guard.current_tenant_id(),
    'code', v_target.code,
    'label', v_next_label,
    'is_active', v_next_active,
    'updated_at', v_now
  );
END;
$$;

REVOKE ALL ON FUNCTION
  tenant_guard.create_giving_source_code(UUID, TEXT, TEXT, TEXT),
  tenant_guard.update_giving_source_code(UUID, UUID, TEXT, BOOLEAN, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
  tenant_guard.create_giving_source_code(UUID, TEXT, TEXT, TEXT),
  tenant_guard.update_giving_source_code(UUID, UUID, TEXT, BOOLEAN, TEXT)
  TO authenticated;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.create_giving_source_code(UUID, TEXT, TEXT, TEXT) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.update_giving_source_code(UUID, UUID, TEXT, BOOLEAN, TEXT) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE OR REPLACE FUNCTION public.create_giving_source_code(
  p_tenant_id UUID,
  p_code TEXT,
  p_label TEXT,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.create_giving_source_code(
    p_tenant_id,
    p_code,
    p_label,
    p_reason
  );
$$;

CREATE OR REPLACE FUNCTION public.update_giving_source_code(
  p_tenant_id UUID,
  p_source_code_id UUID,
  p_label TEXT,
  p_is_active BOOLEAN,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.update_giving_source_code(
    p_tenant_id,
    p_source_code_id,
    p_label,
    p_is_active,
    p_reason
  );
$$;

REVOKE ALL ON FUNCTION
  public.create_giving_source_code(UUID, TEXT, TEXT, TEXT),
  public.update_giving_source_code(UUID, UUID, TEXT, BOOLEAN, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
  public.create_giving_source_code(UUID, TEXT, TEXT, TEXT),
  public.update_giving_source_code(UUID, UUID, TEXT, BOOLEAN, TEXT)
  TO authenticated;

COMMIT;
