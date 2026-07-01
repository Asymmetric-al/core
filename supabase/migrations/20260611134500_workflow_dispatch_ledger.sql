-- Workflow dispatch ledger foundation (Inngest durable workflow executor).
-- Additive only: the shared product-owned ledger of workflow handoff
-- requests. Product areas create or reuse dispatch requests; Inngest receives
-- only the safe identifier-only event envelope that points back to these
-- rows. See openspec/changes/add-inngest-durable-workflow-executor.

CREATE TABLE IF NOT EXISTS public.workflow_dispatch_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_area TEXT NOT NULL CHECK (char_length(product_area) BETWEEN 1 AND 64),
  workflow_name TEXT NOT NULL CHECK (char_length(workflow_name) BETWEEN 1 AND 128),
  subject_type TEXT NOT NULL CHECK (char_length(subject_type) BETWEEN 1 AND 64),
  subject_id TEXT NOT NULL CHECK (char_length(subject_id) BETWEEN 1 AND 128),
  idempotency_key TEXT NOT NULL CHECK (char_length(idempotency_key) BETWEEN 1 AND 256),
  schema_version INTEGER NOT NULL DEFAULT 1 CHECK (schema_version >= 1),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'dispatched', 'failed', 'dead_letter')
  ),
  dispatch_attempts INTEGER NOT NULL DEFAULT 0 CHECK (dispatch_attempts >= 0),
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_error_code TEXT,
  last_error_message TEXT,
  event_ids TEXT[] NOT NULL DEFAULT '{}',
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  dispatched_at TIMESTAMPTZ,
  dead_letter_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT workflow_dispatch_requests_tenant_idempotency_unique
    UNIQUE (tenant_id, idempotency_key)
);

COMMENT ON TABLE public.workflow_dispatch_requests IS
  'Shared product-owned workflow dispatch ledger. Records every request to hand work to workflow orchestration (Inngest) and the handoff status. Product records stay authoritative; this table only tracks handoffs and recovery eligibility.';

COMMENT ON COLUMN public.workflow_dispatch_requests.context IS
  'Safe audit/routing context only (identifiers and small scalars). The application envelope validator rejects secrets, bodies, payment internals, and broad payloads before rows are written.';

-- Recovery scan eligibility: stored-but-not-handed-off work, due for retry.
CREATE INDEX IF NOT EXISTS idx_workflow_dispatch_requests_recovery
  ON public.workflow_dispatch_requests (status, next_attempt_at)
  WHERE status IN ('pending', 'failed');

-- Mission Control summaries: newest activity per tenant.
CREATE INDEX IF NOT EXISTS idx_workflow_dispatch_requests_tenant_created
  ON public.workflow_dispatch_requests (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_dispatch_requests_subject
  ON public.workflow_dispatch_requests (tenant_id, subject_type, subject_id);

CREATE OR REPLACE FUNCTION public.set_workflow_dispatch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_workflow_dispatch_requests_updated_at
  ON public.workflow_dispatch_requests;
CREATE TRIGGER set_workflow_dispatch_requests_updated_at
  BEFORE UPDATE ON public.workflow_dispatch_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_workflow_dispatch_updated_at();

-- Service-role only: all reads/writes go through packages/api with product
-- authorization. Staff visibility arrives via Mission Control server code,
-- not direct table access.
ALTER TABLE public.workflow_dispatch_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.workflow_dispatch_requests FROM anon;
REVOKE ALL ON TABLE public.workflow_dispatch_requests FROM authenticated;
GRANT ALL ON TABLE public.workflow_dispatch_requests TO service_role;
