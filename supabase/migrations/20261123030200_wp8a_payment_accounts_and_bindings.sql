-- AL-2681 (WP8a part 1; plan 5.4, 8.1, 8.2, 12 WP8a; TP2 sections 6 and 10):
-- 1. Create public.payment_provider_accounts unique on (provider_account_id, livemode)
--    with composite FK to public.legal_entities and forced RLS.
-- 2. Expand public.payment_account_bindings with monotonic version, lifecycle
--    status, provider_account_ref, livemode, timestamps, TP2 unique key, and
--    single non-disconnected binding per (tenant_id, legal_entity_id, livemode).
-- 3. Seed field_policies rows for payment_provider_accounts and all new
--    payment_account_bindings columns.
-- 4. Add human command tenant_guard.begin_payment_account_onboarding and its
--    public wrapper requiring payments.manage_account and a non-blank reason.

BEGIN;

SET LOCAL lock_timeout = '5s';

CREATE TABLE public.payment_provider_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  legal_entity_id UUID NOT NULL,
  provider_account_id TEXT NOT NULL
    CHECK (pg_catalog.length(pg_catalog.btrim(provider_account_id)) > 0),
  livemode BOOLEAN NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'restricted', 'disconnected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payment_provider_accounts_provider_livemode_key
    UNIQUE (provider_account_id, livemode),
  CONSTRAINT payment_provider_accounts_tenant_provider_livemode_key
    UNIQUE (tenant_id, provider_account_id, livemode),
  CONSTRAINT payment_provider_accounts_tenant_id_id_key
    UNIQUE (tenant_id, id),
  CONSTRAINT payment_provider_accounts_legal_entity_same_tenant_fk
    FOREIGN KEY (tenant_id, legal_entity_id)
    REFERENCES public.legal_entities(tenant_id, id)
    ON DELETE RESTRICT
);

ALTER TABLE public.payment_provider_accounts
  ENABLE ROW LEVEL SECURITY,
  FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.payment_provider_accounts
  FROM PUBLIC, anon, authenticated, service_role;

GRANT SELECT ON TABLE public.payment_provider_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.payment_provider_accounts
  TO service_role, tenant_guard;

CREATE POLICY "payment provider accounts staff tenant select"
  ON public.payment_provider_accounts
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'::authz.membership_role))
  );

CREATE POLICY tenant_guard_isolation
  ON public.payment_provider_accounts
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

ALTER TABLE public.payment_account_bindings
  ADD COLUMN version INTEGER NOT NULL CHECK (version >= 1),
  ADD COLUMN status TEXT NOT NULL
    CHECK (status IN ('pending', 'active', 'restricted', 'disconnected')),
  ADD COLUMN provider_account_ref TEXT NOT NULL
    CHECK (pg_catalog.length(pg_catalog.btrim(provider_account_ref)) > 0),
  ADD COLUMN livemode BOOLEAN NOT NULL,
  ADD COLUMN created_by UUID,
  ADD COLUMN activated_at TIMESTAMPTZ,
  ADD COLUMN restricted_at TIMESTAMPTZ,
  ADD COLUMN disconnected_at TIMESTAMPTZ,
  ADD COLUMN last_provider_event_at TIMESTAMPTZ,
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD CONSTRAINT payment_account_bindings_account_same_tenant_fk
    FOREIGN KEY (tenant_id, provider_account_ref, livemode)
    REFERENCES public.payment_provider_accounts(tenant_id, provider_account_id, livemode)
    ON DELETE RESTRICT,
  ADD CONSTRAINT payment_account_bindings_tp2_donation_key
    UNIQUE (tenant_id, id, legal_entity_id, provider_account_ref),
  ADD CONSTRAINT payment_account_bindings_entity_mode_version_key
    UNIQUE (tenant_id, legal_entity_id, livemode, version);

CREATE UNIQUE INDEX payment_account_bindings_one_live_per_entity_mode
  ON public.payment_account_bindings (tenant_id, legal_entity_id, livemode)
  WHERE status IN ('pending', 'active', 'restricted');

GRANT SELECT ON TABLE public.payment_account_bindings TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.payment_account_bindings TO tenant_guard;

DROP POLICY IF EXISTS "payment account bindings staff tenant select" ON public.payment_account_bindings;
CREATE POLICY "payment account bindings staff tenant select"
  ON public.payment_account_bindings
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'::authz.membership_role))
  );

DROP POLICY IF EXISTS tenant_guard_isolation ON public.payment_account_bindings;
CREATE POLICY tenant_guard_isolation
  ON public.payment_account_bindings
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
  v.record_type,
  v.field_key,
  s.surface,
  s.surface = 'mission_control',
  false,
  false,
  v.category::public.field_sensitivity_category
FROM (
  VALUES
    ('payment_provider_accounts', 'id', 'internal'),
    ('payment_provider_accounts', 'tenant_id', 'internal'),
    ('payment_provider_accounts', 'legal_entity_id', 'financial'),
    ('payment_provider_accounts', 'provider_account_id', 'financial'),
    ('payment_provider_accounts', 'livemode', 'internal'),
    ('payment_provider_accounts', 'status', 'care'),
    ('payment_provider_accounts', 'created_at', 'internal'),
    ('payment_provider_accounts', 'updated_at', 'internal'),
    ('payment_account_bindings', 'version', 'internal'),
    ('payment_account_bindings', 'status', 'care'),
    ('payment_account_bindings', 'provider_account_ref', 'financial'),
    ('payment_account_bindings', 'livemode', 'internal'),
    ('payment_account_bindings', 'created_by', 'internal'),
    ('payment_account_bindings', 'activated_at', 'financial'),
    ('payment_account_bindings', 'restricted_at', 'financial'),
    ('payment_account_bindings', 'disconnected_at', 'financial'),
    ('payment_account_bindings', 'last_provider_event_at', 'internal'),
    ('payment_account_bindings', 'updated_at', 'internal')
) AS v(record_type, field_key, category)
CROSS JOIN unnest(
  ARRAY['mission_control', 'donor', 'missionary', 'public', 'export']
) AS s(surface);

CREATE OR REPLACE FUNCTION tenant_guard.begin_payment_account_onboarding(
  p_tenant_id UUID,
  p_legal_entity_id UUID,
  p_provider_account_id TEXT,
  p_livemode BOOLEAN,
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
  v_account_id TEXT;
  v_entity_id UUID;
  v_live_binding RECORD;
  v_max_version INTEGER;
  v_next_version INTEGER;
  v_provider_row_id UUID;
  v_binding_id UUID;
  v_now TIMESTAMPTZ;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'payments.manage_account');

  v_reason := pg_catalog.regexp_replace(COALESCE(p_reason, ''), '^[[:space:]]+|[[:space:]]+$', '', 'g');
  IF v_reason = '' THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;

  v_account_id := pg_catalog.regexp_replace(COALESCE(p_provider_account_id, ''), '^[[:space:]]+|[[:space:]]+$', '', 'g');
  IF v_account_id = '' THEN
    RAISE EXCEPTION 'A provider account id is required' USING ERRCODE = '22023';
  END IF;

  IF p_livemode IS NULL THEN
    RAISE EXCEPTION 'Mode (livemode) is required' USING ERRCODE = '22023';
  END IF;

  SELECT le.id
    INTO v_entity_id
    FROM public.legal_entities AS le
   WHERE le.id = p_legal_entity_id
     AND le.tenant_id = v_ctx.tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No legal entity with that id in this organization'
      USING ERRCODE = 'P0002';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      v_ctx.tenant_id::TEXT || ':' || p_legal_entity_id::TEXT || ':' || p_livemode::TEXT,
      2681
    )
  );

  PERFORM 1
     FROM public.payment_account_bindings AS b
    WHERE b.tenant_id = v_ctx.tenant_id
      AND b.legal_entity_id = p_legal_entity_id
      AND b.livemode = p_livemode
    ORDER BY b.version DESC
    FOR UPDATE;

  SELECT b.id, b.version, b.status, b.provider_account_ref
    INTO v_live_binding
    FROM public.payment_account_bindings AS b
   WHERE b.tenant_id = v_ctx.tenant_id
     AND b.legal_entity_id = p_legal_entity_id
     AND b.livemode = p_livemode
     AND b.status IN ('pending', 'active', 'restricted')
   LIMIT 1;

  IF FOUND THEN
    IF v_live_binding.status = 'pending'
       AND v_live_binding.provider_account_ref = v_account_id THEN
      RETURN pg_catalog.jsonb_build_object(
        'binding_id', v_live_binding.id,
        'tenant_id', tenant_guard.current_tenant_id(),
        'legal_entity_id', p_legal_entity_id,
        'provider_account_id', v_account_id,
        'livemode', p_livemode,
        'version', v_live_binding.version,
        'status', v_live_binding.status,
        'replayed', true
      );
    END IF;
    RAISE EXCEPTION 'Legal entity already holds a non-disconnected payment account binding in this mode'
      USING ERRCODE = '23505';
  END IF;

  SELECT pg_catalog.max(b.version)
    INTO v_max_version
    FROM public.payment_account_bindings AS b
   WHERE b.tenant_id = v_ctx.tenant_id
     AND b.legal_entity_id = p_legal_entity_id
     AND b.livemode = p_livemode;

  v_next_version := COALESCE(v_max_version, 0) + 1;
  v_now := pg_catalog.clock_timestamp();

  SELECT a.id
    INTO v_provider_row_id
    FROM public.payment_provider_accounts AS a
   WHERE a.tenant_id = v_ctx.tenant_id
     AND a.provider_account_id = v_account_id
     AND a.livemode = p_livemode
     FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.payment_provider_accounts (
      tenant_id,
      legal_entity_id,
      provider_account_id,
      livemode,
      status,
      created_at,
      updated_at
    )
    VALUES (
      v_ctx.tenant_id,
      p_legal_entity_id,
      v_account_id,
      p_livemode,
      'pending',
      v_now,
      v_now
    )
    RETURNING id INTO v_provider_row_id;
  ELSE
    UPDATE public.payment_provider_accounts
       SET status = 'pending',
           updated_at = v_now
     WHERE id = v_provider_row_id
       AND tenant_id = v_ctx.tenant_id
       AND legal_entity_id = p_legal_entity_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Provider account belongs to another legal entity'
        USING ERRCODE = '23505';
    END IF;
  END IF;

  INSERT INTO public.payment_account_bindings (
    tenant_id,
    legal_entity_id,
    version,
    status,
    provider_account_ref,
    livemode,
    created_by,
    created_at,
    updated_at
  )
  VALUES (
    v_ctx.tenant_id,
    p_legal_entity_id,
    v_next_version,
    'pending',
    v_account_id,
    p_livemode,
    v_ctx.actor_id,
    v_now,
    v_now
  )
  RETURNING id INTO v_binding_id;

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
    'payment_account_onboarding_started',
    'payment_account_binding',
    v_binding_id::TEXT,
    pg_catalog.jsonb_build_object(
      'reason', v_reason,
      'assignment_id', v_ctx.assignment_id,
      'legal_entity_id', p_legal_entity_id,
      'provider_account_id', v_account_id,
      'livemode', p_livemode,
      'version', v_next_version
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'binding_id', v_binding_id,
    'tenant_id', tenant_guard.current_tenant_id(),
    'legal_entity_id', p_legal_entity_id,
    'provider_account_id', v_account_id,
    'livemode', p_livemode,
    'version', v_next_version,
    'status', 'pending',
    'replayed', false
  );
END;
$$;

REVOKE ALL ON FUNCTION tenant_guard.begin_payment_account_onboarding(UUID, UUID, TEXT, BOOLEAN, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.begin_payment_account_onboarding(UUID, UUID, TEXT, BOOLEAN, TEXT)
  TO authenticated;
GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.begin_payment_account_onboarding(UUID, UUID, TEXT, BOOLEAN, TEXT)
  OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE OR REPLACE FUNCTION public.begin_payment_account_onboarding(
  p_tenant_id UUID,
  p_legal_entity_id UUID,
  p_provider_account_id TEXT,
  p_livemode BOOLEAN,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.begin_payment_account_onboarding(
    p_tenant_id,
    p_legal_entity_id,
    p_provider_account_id,
    p_livemode,
    p_reason
  );
$$;

REVOKE ALL ON FUNCTION public.begin_payment_account_onboarding(UUID, UUID, TEXT, BOOLEAN, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.begin_payment_account_onboarding(UUID, UUID, TEXT, BOOLEAN, TEXT)
  TO authenticated;

COMMIT;
