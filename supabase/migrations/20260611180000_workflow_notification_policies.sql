-- Workflow notification policy storage (Inngest durable workflow executor).
-- Additive only: tenant/admin adjustable notification overrides. Defaults
-- live in code and prioritize donor trust, money integrity, tenant-wide sync
-- health, and stuck infrastructure; routine retryable failures stay visible
-- without becoming urgent alerts.
-- See openspec/changes/add-inngest-durable-workflow-executor.

CREATE TABLE IF NOT EXISTS public.workflow_notification_policies (
  tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by_profile_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.workflow_notification_policies IS
  'Tenant overrides for workflow notification behavior (e.g. escalate retries for an area, mute failed alerts). Defaults stay quiet and live in application code.';

DO $$
BEGIN
  EXECUTE 'DROP TRIGGER IF EXISTS set_workflow_notification_policies_updated_at ON public.workflow_notification_policies';
  EXECUTE 'CREATE TRIGGER set_workflow_notification_policies_updated_at BEFORE UPDATE ON public.workflow_notification_policies FOR EACH ROW EXECUTE FUNCTION public.set_workflow_dispatch_updated_at()';
END $$;

ALTER TABLE public.workflow_notification_policies ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.workflow_notification_policies FROM anon;
REVOKE ALL ON TABLE public.workflow_notification_policies FROM authenticated;
GRANT ALL ON TABLE public.workflow_notification_policies TO service_role;
