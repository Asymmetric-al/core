CREATE TABLE IF NOT EXISTS public.crm_command_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    actor_user_id UUID NOT NULL,
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    request_id TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    idempotency_key TEXT,
    status TEXT NOT NULL CHECK (status IN ('queued', 'attempted', 'succeeded', 'failed', 'skipped')),
    command_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    result_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.crm_command_logs IS
  'Audited CRM command boundary for Twenty-backed operations. Stores Asym actor and redacted command/result summaries only.';

CREATE INDEX IF NOT EXISTS idx_crm_command_logs_tenant_created_at
  ON public.crm_command_logs (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_command_logs_actor_created_at
  ON public.crm_command_logs (actor_user_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_command_logs_tenant_idempotency
  ON public.crm_command_logs (tenant_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE public.crm_command_logs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON TABLE public.crm_command_logs TO authenticated;
GRANT SELECT, INSERT ON TABLE public.crm_command_logs TO service_role;

DROP POLICY IF EXISTS "authz staff tenant select crm_command_logs" ON public.crm_command_logs;
CREATE POLICY "authz staff tenant select crm_command_logs"
  ON public.crm_command_logs
  FOR SELECT
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "authz staff tenant insert crm_command_logs" ON public.crm_command_logs;
CREATE POLICY "authz staff tenant insert crm_command_logs"
  ON public.crm_command_logs
  FOR INSERT
  WITH CHECK (
    authz.is_super_admin()
    OR (
      auth.uid() = actor_user_id
      AND authz.has_staff_membership(tenant_id, NULL)
    )
  );

DROP POLICY IF EXISTS "authz staff tenant update crm_command_logs" ON public.crm_command_logs;
DROP POLICY IF EXISTS "authz staff tenant delete crm_command_logs" ON public.crm_command_logs;
