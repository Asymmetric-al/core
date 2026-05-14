DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crm_sync_domain') THEN
    CREATE TYPE public.crm_sync_domain AS ENUM (
      'people',
      'companies',
      'churches',
      'households',
      'tasks',
      'notes',
      'ministry_activities',
      'relationship_commitments'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crm_sync_direction') THEN
    CREATE TYPE public.crm_sync_direction AS ENUM (
      'inbound',
      'outbound',
      'replay',
      'reconciliation'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crm_sync_record_status') THEN
    CREATE TYPE public.crm_sync_record_status AS ENUM (
      'received',
      'queued',
      'processing',
      'processed',
      'succeeded',
      'ignored',
      'failed',
      'dead_letter',
      'paused'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crm_outbound_job_type') THEN
    CREATE TYPE public.crm_outbound_job_type AS ENUM (
      'create',
      'update',
      'delete',
      'upsert',
      'reconcile'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crm_reconciliation_status') THEN
    CREATE TYPE public.crm_reconciliation_status AS ENUM (
      'queued',
      'running',
      'succeeded',
      'failed'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.crm_sync_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  domain public.crm_sync_domain NOT NULL,
  inbound_paused BOOLEAN NOT NULL DEFAULT false,
  outbound_paused BOOLEAN NOT NULL DEFAULT false,
  replay_paused BOOLEAN NOT NULL DEFAULT false,
  paused_reason TEXT,
  paused_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  paused_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, domain)
);

COMMENT ON TABLE public.crm_sync_settings IS
  'Tenant and domain-scoped pause controls for Twenty CRM inbound, outbound, and replay paths.';

CREATE TABLE IF NOT EXISTS public.crm_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  crm_provider TEXT NOT NULL DEFAULT 'twenty' CHECK (crm_provider = 'twenty'),
  webhook_event_key TEXT NOT NULL,
  twenty_event_type TEXT NOT NULL,
  twenty_object_name TEXT NOT NULL,
  twenty_record_id TEXT,
  domain public.crm_sync_domain,
  event_action TEXT NOT NULL,
  webhook_timestamp TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signature_hash TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  payload JSONB NOT NULL,
  status public.crm_sync_record_status NOT NULL DEFAULT 'received',
  process_attempts INTEGER NOT NULL DEFAULT 0 CHECK (process_attempts >= 0),
  replay_count INTEGER NOT NULL DEFAULT 0 CHECK (replay_count >= 0),
  ignored_reason TEXT,
  last_error TEXT,
  processed_at TIMESTAMPTZ,
  replayed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.crm_webhook_events IS
  'Durable Twenty webhook ingress. Accepted signed events are stored before processing, with ignored and failed events distinguishable for operators.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_webhook_events_provider_key
  ON public.crm_webhook_events (crm_provider, webhook_event_key);

CREATE INDEX IF NOT EXISTS idx_crm_webhook_events_tenant_status
  ON public.crm_webhook_events (tenant_id, status, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_webhook_events_record
  ON public.crm_webhook_events (
    crm_provider,
    twenty_object_name,
    twenty_record_id
  );

CREATE TABLE IF NOT EXISTS public.crm_outbound_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  domain public.crm_sync_domain NOT NULL,
  job_type public.crm_outbound_job_type NOT NULL,
  twenty_object_name TEXT NOT NULL,
  source_entity_type public.crm_link_entity_type,
  source_entity_id TEXT,
  crm_record_link_id UUID REFERENCES public.crm_record_links(id) ON DELETE SET NULL,
  idempotency_key TEXT NOT NULL,
  status public.crm_sync_record_status NOT NULL DEFAULT 'queued',
  priority INTEGER NOT NULL DEFAULT 100,
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts > 0),
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_at TIMESTAMPTZ,
  locked_by TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.crm_outbound_jobs IS
  'Durable outbound Twenty write queue with idempotency, retry, pause, replay, and dead-letter state.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_outbound_jobs_tenant_idempotency
  ON public.crm_outbound_jobs (tenant_id, idempotency_key);

CREATE INDEX IF NOT EXISTS idx_crm_outbound_jobs_queue
  ON public.crm_outbound_jobs (
    tenant_id,
    status,
    next_attempt_at,
    priority,
    created_at
  );

CREATE INDEX IF NOT EXISTS idx_crm_outbound_jobs_source
  ON public.crm_outbound_jobs (
    tenant_id,
    source_entity_type,
    source_entity_id
  );

CREATE TABLE IF NOT EXISTS public.crm_reconciliation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  domain public.crm_sync_domain,
  reconciliation_type TEXT NOT NULL,
  status public.crm_reconciliation_status NOT NULL DEFAULT 'queued',
  checked_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  findings JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_error TEXT,
  requested_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.crm_reconciliation_runs IS
  'CRM reconciliation evidence for link drift, stale projections, stalled jobs, duplicate candidates, and failed webhooks.';

CREATE INDEX IF NOT EXISTS idx_crm_reconciliation_runs_tenant_created
  ON public.crm_reconciliation_runs (tenant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.crm_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  direction public.crm_sync_direction NOT NULL,
  domain public.crm_sync_domain,
  status public.crm_sync_record_status NOT NULL,
  source_table TEXT NOT NULL,
  source_id TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.crm_sync_logs IS
  'Append-only operational log for CRM webhook, outbound, replay, and reconciliation paths.';

CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_tenant_created
  ON public.crm_sync_logs (tenant_id, created_at DESC);

ALTER TABLE public.crm_sync_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_outbound_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_reconciliation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_sync_logs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON TABLE public.crm_sync_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.crm_sync_settings TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.crm_webhook_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.crm_webhook_events TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.crm_outbound_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.crm_outbound_jobs TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.crm_reconciliation_runs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.crm_reconciliation_runs TO service_role;
GRANT SELECT, INSERT ON TABLE public.crm_sync_logs TO authenticated;
GRANT SELECT, INSERT ON TABLE public.crm_sync_logs TO service_role;

DROP POLICY IF EXISTS "authz staff tenant select crm_sync_settings" ON public.crm_sync_settings;
CREATE POLICY "authz staff tenant select crm_sync_settings"
  ON public.crm_sync_settings
  FOR SELECT
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "authz staff tenant insert crm_sync_settings" ON public.crm_sync_settings;
CREATE POLICY "authz staff tenant insert crm_sync_settings"
  ON public.crm_sync_settings
  FOR INSERT
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "authz staff tenant update crm_sync_settings" ON public.crm_sync_settings;
CREATE POLICY "authz staff tenant update crm_sync_settings"
  ON public.crm_sync_settings
  FOR UPDATE
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  )
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "authz staff tenant select crm_webhook_events" ON public.crm_webhook_events;
CREATE POLICY "authz staff tenant select crm_webhook_events"
  ON public.crm_webhook_events
  FOR SELECT
  USING (
    authz.is_super_admin()
    OR (
      tenant_id IS NOT NULL
      AND authz.has_staff_membership(tenant_id, NULL)
    )
  );

DROP POLICY IF EXISTS "authz staff tenant insert crm_webhook_events" ON public.crm_webhook_events;
CREATE POLICY "authz staff tenant insert crm_webhook_events"
  ON public.crm_webhook_events
  FOR INSERT
  WITH CHECK (
    authz.is_super_admin()
    OR (
      tenant_id IS NOT NULL
      AND authz.has_staff_membership(tenant_id, NULL)
    )
  );

DROP POLICY IF EXISTS "authz staff tenant update crm_webhook_events" ON public.crm_webhook_events;
CREATE POLICY "authz staff tenant update crm_webhook_events"
  ON public.crm_webhook_events
  FOR UPDATE
  USING (
    authz.is_super_admin()
    OR (
      tenant_id IS NOT NULL
      AND authz.has_staff_membership(tenant_id, NULL)
    )
  )
  WITH CHECK (
    authz.is_super_admin()
    OR (
      tenant_id IS NOT NULL
      AND authz.has_staff_membership(tenant_id, NULL)
    )
  );

DROP POLICY IF EXISTS "authz staff tenant select crm_outbound_jobs" ON public.crm_outbound_jobs;
CREATE POLICY "authz staff tenant select crm_outbound_jobs"
  ON public.crm_outbound_jobs
  FOR SELECT
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "authz staff tenant insert crm_outbound_jobs" ON public.crm_outbound_jobs;
CREATE POLICY "authz staff tenant insert crm_outbound_jobs"
  ON public.crm_outbound_jobs
  FOR INSERT
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "authz staff tenant update crm_outbound_jobs" ON public.crm_outbound_jobs;
CREATE POLICY "authz staff tenant update crm_outbound_jobs"
  ON public.crm_outbound_jobs
  FOR UPDATE
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  )
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "authz staff tenant select crm_reconciliation_runs" ON public.crm_reconciliation_runs;
CREATE POLICY "authz staff tenant select crm_reconciliation_runs"
  ON public.crm_reconciliation_runs
  FOR SELECT
  USING (
    authz.is_super_admin()
    OR (
      tenant_id IS NOT NULL
      AND authz.has_staff_membership(tenant_id, NULL)
    )
  );

DROP POLICY IF EXISTS "authz staff tenant insert crm_reconciliation_runs" ON public.crm_reconciliation_runs;
CREATE POLICY "authz staff tenant insert crm_reconciliation_runs"
  ON public.crm_reconciliation_runs
  FOR INSERT
  WITH CHECK (
    authz.is_super_admin()
    OR (
      tenant_id IS NOT NULL
      AND authz.has_staff_membership(tenant_id, NULL)
    )
  );

DROP POLICY IF EXISTS "authz staff tenant update crm_reconciliation_runs" ON public.crm_reconciliation_runs;
CREATE POLICY "authz staff tenant update crm_reconciliation_runs"
  ON public.crm_reconciliation_runs
  FOR UPDATE
  USING (
    authz.is_super_admin()
    OR (
      tenant_id IS NOT NULL
      AND authz.has_staff_membership(tenant_id, NULL)
    )
  )
  WITH CHECK (
    authz.is_super_admin()
    OR (
      tenant_id IS NOT NULL
      AND authz.has_staff_membership(tenant_id, NULL)
    )
  );

DROP POLICY IF EXISTS "authz staff tenant select crm_sync_logs" ON public.crm_sync_logs;
CREATE POLICY "authz staff tenant select crm_sync_logs"
  ON public.crm_sync_logs
  FOR SELECT
  USING (
    authz.is_super_admin()
    OR (
      tenant_id IS NOT NULL
      AND authz.has_staff_membership(tenant_id, NULL)
    )
  );

DROP POLICY IF EXISTS "authz staff tenant insert crm_sync_logs" ON public.crm_sync_logs;
CREATE POLICY "authz staff tenant insert crm_sync_logs"
  ON public.crm_sync_logs
  FOR INSERT
  WITH CHECK (
    authz.is_super_admin()
    OR (
      tenant_id IS NOT NULL
      AND authz.has_staff_membership(tenant_id, NULL)
    )
  );

DROP POLICY IF EXISTS "authz staff tenant delete crm_sync_tables" ON public.crm_sync_settings;
DROP POLICY IF EXISTS "authz staff tenant delete crm_webhook_events" ON public.crm_webhook_events;
DROP POLICY IF EXISTS "authz staff tenant delete crm_outbound_jobs" ON public.crm_outbound_jobs;
DROP POLICY IF EXISTS "authz staff tenant delete crm_reconciliation_runs" ON public.crm_reconciliation_runs;
DROP POLICY IF EXISTS "authz staff tenant delete crm_sync_logs" ON public.crm_sync_logs;
