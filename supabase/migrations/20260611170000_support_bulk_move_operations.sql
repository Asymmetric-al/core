-- Bulk Support Hub move operations (Inngest durable workflow executor).
-- Additive only: the product-owned record of a bulk move batch so partial
-- success is visible and Retry failed can retry only failed items while
-- reusing the original reason and linking audit to the original batch.
-- See openspec/changes/add-inngest-durable-workflow-executor.

CREATE TABLE IF NOT EXISTS public.support_bulk_move_operations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  destination_inbox_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 5 AND 500),
  created_by_profile_id UUID,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'partial' CHECK (
    status IN ('completed', 'partial')
  ),
  retry_of UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.support_bulk_move_operations IS
  'Bulk Support Hub move batches. Items carry per-conversation results with safe staff-visible failure text; successful items stay moved and Retry failed retries only failed items with the original shared reason.';

CREATE INDEX IF NOT EXISTS idx_support_bulk_move_operations_tenant
  ON public.support_bulk_move_operations (tenant_id, created_at DESC);

DO $$
BEGIN
  EXECUTE 'DROP TRIGGER IF EXISTS set_support_bulk_move_operations_updated_at ON public.support_bulk_move_operations';
  EXECUTE 'CREATE TRIGGER set_support_bulk_move_operations_updated_at BEFORE UPDATE ON public.support_bulk_move_operations FOR EACH ROW EXECUTE FUNCTION public.set_workflow_dispatch_updated_at()';
END $$;

ALTER TABLE public.support_bulk_move_operations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.support_bulk_move_operations FROM anon;
REVOKE ALL ON TABLE public.support_bulk_move_operations FROM authenticated;
GRANT ALL ON TABLE public.support_bulk_move_operations TO service_role;
