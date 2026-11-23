-- AL-2681 (WP8a part 1; plan 5.4, 8.1, 8.2, 12 WP8a; TP2 sections 6 and 10;
-- rulings W8-R31, W8-R32, W8-R35):
-- 1. private.share_lock_tenant(uuid): the tenant row FOR SHARE for guard
--    commands, which hold no SELECT on public.tenants. The same function, with
--    the same body, is added by other packages, hence CREATE OR REPLACE.
-- 2. public.payment_onboarding_intents: the durable, audited intent a person
--    records for (tenant, legal entity, mode, next version). A person names no
--    provider account.
-- 3. public.payment_provider_accounts: the authoritative mapping
--    (provider account, mode) -> (tenant, legal entity). Only the
--    service_role-only confirmation command of 20261123030300 writes it, after
--    a Stripe-signed event for the account; no function that authenticated may
--    execute accepts a provider account id.
-- 4. public.payment_account_bindings: version, lifecycle status, provider
--    account and mode, TP2's keys, one live binding per entity and mode.
-- 5. Human commands: begin_payment_account_onboarding (intent first; tenant
--    and assignment share-locked, then authority re-checked under the locks)
--    and list_payment_legal_entities (tax_id behind payments.manage_account).
-- 6. field_policies rows for every new column.

BEGIN;

SET LOCAL lock_timeout = '5s';

LOCK TABLE public.payment_account_bindings IN SHARE ROW EXCLUSIVE MODE;

DO $$
DECLARE
  v_bindings BIGINT;
BEGIN
  SELECT pg_catalog.count(*) INTO v_bindings FROM public.payment_account_bindings;
  IF v_bindings > 0 THEN
    RAISE EXCEPTION 'WP8a binding preflight: payment account bindings=%', v_bindings
      USING ERRCODE = '22023',
            HINT = 'Nothing was changed. Bindings are created only by WP8a onboarding; map each existing row explicitly before releasing.';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION private.share_lock_tenant(p_tenant_id uuid)
RETURNS text
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT t.status FROM public.tenants AS t WHERE t.id = p_tenant_id FOR SHARE
$$;

ALTER FUNCTION private.share_lock_tenant(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.share_lock_tenant(uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.share_lock_tenant(uuid) TO tenant_guard;

CREATE TABLE public.payment_onboarding_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  legal_entity_id UUID NOT NULL,
  livemode BOOLEAN NOT NULL,
  version INTEGER NOT NULL CHECK (version >= 1),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'confirmed')),
  reason TEXT NOT NULL CHECK (pg_catalog.length(pg_catalog.btrim(reason)) > 0),
  created_by UUID NOT NULL,
  assignment_id UUID NOT NULL,
  provider_account_id TEXT,
  confirmed_at TIMESTAMPTZ,
  confirmed_by_event TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payment_onboarding_intents_tenant_id_id_key UNIQUE (tenant_id, id),
  CONSTRAINT payment_onboarding_intents_entity_mode_version_key
    UNIQUE (tenant_id, legal_entity_id, livemode, version),
  CONSTRAINT payment_onboarding_intents_legal_entity_same_tenant_fk
    FOREIGN KEY (tenant_id, legal_entity_id)
    REFERENCES public.legal_entities(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT payment_onboarding_intents_confirmation_check CHECK (
    (status = 'open' AND provider_account_id IS NULL AND confirmed_at IS NULL AND confirmed_by_event IS NULL)
    OR (status = 'confirmed' AND provider_account_id IS NOT NULL AND confirmed_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX payment_onboarding_intents_one_open_per_entity_mode
  ON public.payment_onboarding_intents (tenant_id, legal_entity_id, livemode)
  WHERE status = 'open';

ALTER TABLE public.payment_onboarding_intents
  ENABLE ROW LEVEL SECURITY,
  FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.payment_onboarding_intents
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.payment_onboarding_intents TO authenticated, service_role;
GRANT SELECT, INSERT ON TABLE public.payment_onboarding_intents TO tenant_guard;
GRANT UPDATE (status, provider_account_id, confirmed_at, confirmed_by_event, updated_at)
  ON TABLE public.payment_onboarding_intents TO tenant_guard;

CREATE POLICY "payment onboarding intents staff tenant select"
  ON public.payment_onboarding_intents
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'::authz.membership_role))
  );

CREATE POLICY tenant_guard_isolation
  ON public.payment_onboarding_intents
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

CREATE TABLE public.payment_provider_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  legal_entity_id UUID NOT NULL,
  provider_account_id TEXT NOT NULL
    CHECK (provider_account_id ~ '^acct_[A-Za-z0-9]+$'),
  livemode BOOLEAN NOT NULL,
  onboarding_intent_id UUID NOT NULL,
  confirmed_at TIMESTAMPTZ NOT NULL,
  sync_lease_event_id UUID,
  sync_lease_expires_at TIMESTAMPTZ,
  state_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payment_provider_accounts_provider_livemode_key
    UNIQUE (provider_account_id, livemode),
  CONSTRAINT payment_provider_accounts_tenant_provider_livemode_key
    UNIQUE (tenant_id, provider_account_id, livemode),
  CONSTRAINT payment_provider_accounts_entity_provider_livemode_key
    UNIQUE (tenant_id, legal_entity_id, provider_account_id, livemode),
  CONSTRAINT payment_provider_accounts_tenant_id_id_key
    UNIQUE (tenant_id, id),
  CONSTRAINT payment_provider_accounts_onboarding_intent_key
    UNIQUE (onboarding_intent_id),
  CONSTRAINT payment_provider_accounts_legal_entity_same_tenant_fk
    FOREIGN KEY (tenant_id, legal_entity_id)
    REFERENCES public.legal_entities(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT payment_provider_accounts_intent_same_tenant_fk
    FOREIGN KEY (tenant_id, onboarding_intent_id)
    REFERENCES public.payment_onboarding_intents(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT payment_provider_accounts_sync_lease_check
    CHECK ((sync_lease_event_id IS NULL) = (sync_lease_expires_at IS NULL))
);

ALTER TABLE public.payment_provider_accounts
  ENABLE ROW LEVEL SECURITY,
  FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.payment_provider_accounts
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.payment_provider_accounts TO authenticated, service_role;
GRANT SELECT, INSERT ON TABLE public.payment_provider_accounts TO tenant_guard;
GRANT UPDATE (sync_lease_event_id, sync_lease_expires_at, state_synced_at, updated_at)
  ON TABLE public.payment_provider_accounts TO tenant_guard;

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
  ADD COLUMN provider_account_ref TEXT NOT NULL,
  ADD COLUMN livemode BOOLEAN NOT NULL,
  ADD COLUMN onboarding_intent_id UUID,
  ADD COLUMN created_by UUID,
  ADD COLUMN activated_at TIMESTAMPTZ,
  ADD COLUMN restricted_at TIMESTAMPTZ,
  ADD COLUMN disconnected_at TIMESTAMPTZ,
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD CONSTRAINT payment_account_bindings_account_same_entity_fk
    FOREIGN KEY (tenant_id, legal_entity_id, provider_account_ref, livemode)
    REFERENCES public.payment_provider_accounts(tenant_id, legal_entity_id, provider_account_id, livemode)
    ON DELETE RESTRICT,
  ADD CONSTRAINT payment_account_bindings_intent_same_tenant_fk
    FOREIGN KEY (tenant_id, onboarding_intent_id)
    REFERENCES public.payment_onboarding_intents(tenant_id, id)
    ON DELETE RESTRICT,
  ADD CONSTRAINT payment_account_bindings_onboarding_intent_key
    UNIQUE (onboarding_intent_id),
  ADD CONSTRAINT payment_account_bindings_tp2_donation_key
    UNIQUE (tenant_id, id, legal_entity_id, provider_account_ref),
  ADD CONSTRAINT payment_account_bindings_entity_mode_version_key
    UNIQUE (tenant_id, legal_entity_id, livemode, version);

CREATE UNIQUE INDEX payment_account_bindings_one_live_per_entity_mode
  ON public.payment_account_bindings (tenant_id, legal_entity_id, livemode)
  WHERE status IN ('pending', 'active', 'restricted');

GRANT SELECT ON TABLE public.payment_account_bindings TO authenticated, service_role;
GRANT SELECT, INSERT ON TABLE public.payment_account_bindings TO tenant_guard;
GRANT UPDATE (status, activated_at, restricted_at, disconnected_at, updated_at)
  ON TABLE public.payment_account_bindings TO tenant_guard;

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
    ('payment_onboarding_intents', 'id', 'internal'),
    ('payment_onboarding_intents', 'tenant_id', 'internal'),
    ('payment_onboarding_intents', 'legal_entity_id', 'financial'),
    ('payment_onboarding_intents', 'livemode', 'internal'),
    ('payment_onboarding_intents', 'version', 'internal'),
    ('payment_onboarding_intents', 'status', 'care'),
    ('payment_onboarding_intents', 'reason', 'care'),
    ('payment_onboarding_intents', 'created_by', 'internal'),
    ('payment_onboarding_intents', 'assignment_id', 'internal'),
    ('payment_onboarding_intents', 'provider_account_id', 'financial'),
    ('payment_onboarding_intents', 'confirmed_at', 'internal'),
    ('payment_onboarding_intents', 'confirmed_by_event', 'internal'),
    ('payment_onboarding_intents', 'created_at', 'internal'),
    ('payment_onboarding_intents', 'updated_at', 'internal'),
    ('payment_provider_accounts', 'id', 'internal'),
    ('payment_provider_accounts', 'tenant_id', 'internal'),
    ('payment_provider_accounts', 'legal_entity_id', 'financial'),
    ('payment_provider_accounts', 'provider_account_id', 'financial'),
    ('payment_provider_accounts', 'livemode', 'internal'),
    ('payment_provider_accounts', 'onboarding_intent_id', 'internal'),
    ('payment_provider_accounts', 'confirmed_at', 'internal'),
    ('payment_provider_accounts', 'sync_lease_event_id', 'internal'),
    ('payment_provider_accounts', 'sync_lease_expires_at', 'internal'),
    ('payment_provider_accounts', 'state_synced_at', 'internal'),
    ('payment_provider_accounts', 'created_at', 'internal'),
    ('payment_provider_accounts', 'updated_at', 'internal'),
    ('payment_account_bindings', 'version', 'internal'),
    ('payment_account_bindings', 'status', 'care'),
    ('payment_account_bindings', 'provider_account_ref', 'financial'),
    ('payment_account_bindings', 'livemode', 'internal'),
    ('payment_account_bindings', 'onboarding_intent_id', 'internal'),
    ('payment_account_bindings', 'created_by', 'internal'),
    ('payment_account_bindings', 'activated_at', 'financial'),
    ('payment_account_bindings', 'restricted_at', 'financial'),
    ('payment_account_bindings', 'disconnected_at', 'financial'),
    ('payment_account_bindings', 'updated_at', 'internal')
) AS v(record_type, field_key, category)
CROSS JOIN unnest(
  ARRAY['mission_control', 'donor', 'missionary', 'public', 'export']
) AS s(surface);

CREATE OR REPLACE FUNCTION tenant_guard.begin_payment_account_onboarding(
  p_tenant_id UUID,
  p_legal_entity_id UUID,
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
  v_tenant_status TEXT;
  v_assignment RECORD;
  v_assignment_found BOOLEAN;
  v_capability_held BOOLEAN;
  v_reason TEXT;
  v_entity_found BOOLEAN;
  v_open RECORD;
  v_open_found BOOLEAN;
  v_binding RECORD;
  v_binding_found BOOLEAN;
  v_next_version INTEGER;
  v_intent RECORD;
  v_now TIMESTAMPTZ;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'payments.manage_account');

  v_tenant_status := private.share_lock_tenant(v_ctx.tenant_id);

  SELECT m.user_id, m.tenant_id, m.is_active, m.revoked_at
    INTO v_assignment
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.id = v_ctx.assignment_id
     FOR SHARE;
  v_assignment_found := FOUND;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'payment_onboarding:' || v_ctx.tenant_id::TEXT || ':'
        || COALESCE(p_legal_entity_id::TEXT, '') || ':' || COALESCE(p_livemode::TEXT, ''),
      2681
    )
  );

  v_capability_held := 'payments.manage_account' = ANY (authz.assignment_capabilities(v_ctx.assignment_id));

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

  IF p_livemode IS NULL THEN
    RAISE EXCEPTION 'Mode (livemode) is required' USING ERRCODE = '22023';
  END IF;

  PERFORM 1
     FROM public.legal_entities AS le
    WHERE le.id = p_legal_entity_id
      AND le.tenant_id = v_ctx.tenant_id;
  v_entity_found := FOUND;

  IF NOT v_entity_found THEN
    RAISE EXCEPTION 'No legal entity with that id in this organization'
      USING ERRCODE = 'P0002';
  END IF;

  SELECT i.id, i.version, i.created_at
    INTO v_open
    FROM public.payment_onboarding_intents AS i
   WHERE i.tenant_id = v_ctx.tenant_id
     AND i.legal_entity_id = p_legal_entity_id
     AND i.livemode = p_livemode
     AND i.status = 'open';
  v_open_found := FOUND;

  IF v_open_found THEN
    RETURN pg_catalog.jsonb_build_object(
      'intent_id', v_open.id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'legal_entity_id', p_legal_entity_id,
      'livemode', p_livemode,
      'version', v_open.version,
      'status', 'open',
      'provider_account_id', NULL,
      'binding_id', NULL,
      'binding_status', NULL,
      'created_at', v_open.created_at,
      'replayed', true
    );
  END IF;

  SELECT b.id, b.version, b.status, b.provider_account_ref, b.onboarding_intent_id
    INTO v_binding
    FROM public.payment_account_bindings AS b
   WHERE b.tenant_id = v_ctx.tenant_id
     AND b.legal_entity_id = p_legal_entity_id
     AND b.livemode = p_livemode
     AND b.status IN ('pending', 'active', 'restricted');
  v_binding_found := FOUND;

  IF v_binding_found THEN
    RETURN pg_catalog.jsonb_build_object(
      'intent_id', v_binding.onboarding_intent_id,
      'tenant_id', tenant_guard.current_tenant_id(),
      'legal_entity_id', p_legal_entity_id,
      'livemode', p_livemode,
      'version', v_binding.version,
      'status', 'confirmed',
      'provider_account_id', v_binding.provider_account_ref,
      'binding_id', v_binding.id,
      'binding_status', v_binding.status,
      'created_at', NULL,
      'replayed', true
    );
  END IF;

  SELECT GREATEST(
           COALESCE((SELECT pg_catalog.max(i.version)
                       FROM public.payment_onboarding_intents AS i
                      WHERE i.tenant_id = v_ctx.tenant_id
                        AND i.legal_entity_id = p_legal_entity_id
                        AND i.livemode = p_livemode), 0),
           COALESCE((SELECT pg_catalog.max(b.version)
                       FROM public.payment_account_bindings AS b
                      WHERE b.tenant_id = v_ctx.tenant_id
                        AND b.legal_entity_id = p_legal_entity_id
                        AND b.livemode = p_livemode), 0)
         ) + 1
    INTO v_next_version;

  v_now := pg_catalog.clock_timestamp();

  INSERT INTO public.payment_onboarding_intents (
    tenant_id,
    legal_entity_id,
    livemode,
    version,
    status,
    reason,
    created_by,
    assignment_id,
    created_at,
    updated_at
  )
  VALUES (
    v_ctx.tenant_id,
    p_legal_entity_id,
    p_livemode,
    v_next_version,
    'open',
    v_reason,
    v_ctx.actor_id,
    v_ctx.assignment_id,
    v_now,
    v_now
  )
  RETURNING id, version, created_at INTO v_intent;

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
    'payment_account_onboarding_intent_recorded',
    'payment_onboarding_intent',
    v_intent.id::TEXT,
    pg_catalog.jsonb_build_object(
      'reason', v_reason,
      'assignment_id', v_ctx.assignment_id,
      'legal_entity_id', p_legal_entity_id,
      'livemode', p_livemode,
      'version', v_intent.version
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'intent_id', v_intent.id,
    'tenant_id', tenant_guard.current_tenant_id(),
    'legal_entity_id', p_legal_entity_id,
    'livemode', p_livemode,
    'version', v_intent.version,
    'status', 'open',
    'provider_account_id', NULL,
    'binding_id', NULL,
    'binding_status', NULL,
    'created_at', v_intent.created_at,
    'replayed', false
  );
END;
$$;

CREATE OR REPLACE FUNCTION tenant_guard.list_payment_legal_entities(
  p_tenant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_rows JSONB;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'payments.manage_account');

  SELECT COALESCE(
           pg_catalog.jsonb_agg(
             pg_catalog.jsonb_build_object(
               'id', le.id,
               'tenant_id', le.tenant_id,
               'name', le.name,
               'legal_name', le.legal_name,
               'country_code', le.country_code,
               'currency', le.currency,
               'tax_id', le.tax_id,
               'created_at', le.created_at
             )
             ORDER BY le.created_at, le.id
           ),
           '[]'::JSONB
         )
    INTO v_rows
    FROM public.legal_entities AS le
   WHERE le.tenant_id = v_ctx.tenant_id;

  RETURN v_rows;
END;
$$;

REVOKE ALL ON FUNCTION
  tenant_guard.begin_payment_account_onboarding(UUID, UUID, BOOLEAN, TEXT),
  tenant_guard.list_payment_legal_entities(UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION
  tenant_guard.begin_payment_account_onboarding(UUID, UUID, BOOLEAN, TEXT),
  tenant_guard.list_payment_legal_entities(UUID)
  TO authenticated;
GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.begin_payment_account_onboarding(UUID, UUID, BOOLEAN, TEXT)
  OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.list_payment_legal_entities(UUID)
  OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE OR REPLACE FUNCTION public.begin_payment_account_onboarding(
  p_tenant_id UUID,
  p_legal_entity_id UUID,
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
    p_livemode,
    p_reason
  );
$$;

CREATE OR REPLACE FUNCTION public.list_payment_legal_entities(
  p_tenant_id UUID
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.list_payment_legal_entities(p_tenant_id);
$$;

REVOKE ALL ON FUNCTION
  public.begin_payment_account_onboarding(UUID, UUID, BOOLEAN, TEXT),
  public.list_payment_legal_entities(UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION
  public.begin_payment_account_onboarding(UUID, UUID, BOOLEAN, TEXT),
  public.list_payment_legal_entities(UUID)
  TO authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
