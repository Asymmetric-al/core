-- Product work claims (Inngest durable workflow executor).
-- Additive only: one active claim per tenant-scoped product work item so
-- manual replay, recovery scans, and workflow retries cannot run the same
-- business effect concurrently. Claims guard attempts; product idempotency
-- keys remain the guard for business outcomes.
-- See openspec/changes/add-inngest-durable-workflow-executor.

CREATE TABLE IF NOT EXISTS public.workflow_work_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subject_type TEXT NOT NULL CHECK (char_length(subject_type) BETWEEN 1 AND 64),
  subject_id TEXT NOT NULL CHECK (char_length(subject_id) BETWEEN 1 AND 128),
  claimed_by TEXT NOT NULL CHECK (char_length(claimed_by) BETWEEN 1 AND 128),
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'released', 'expired')
  ),
  expires_at TIMESTAMPTZ NOT NULL,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.workflow_work_claims IS
  'Product-owned work claims: one active claim per tenant-scoped work item. Decides whether a runner (workflow retry, manual replay, recovery scan, staff tool) may attempt a durable work item now.';

-- One active claim per tenant-scoped work item.
CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_work_claims_active
  ON public.workflow_work_claims (tenant_id, subject_type, subject_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_workflow_work_claims_tenant_created
  ON public.workflow_work_claims (tenant_id, created_at DESC);

DROP TRIGGER IF EXISTS set_workflow_work_claims_updated_at
  ON public.workflow_work_claims;
CREATE TRIGGER set_workflow_work_claims_updated_at
  BEFORE UPDATE ON public.workflow_work_claims
  FOR EACH ROW EXECUTE FUNCTION public.set_workflow_dispatch_updated_at();

ALTER TABLE public.workflow_work_claims ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.workflow_work_claims FROM anon;
REVOKE ALL ON TABLE public.workflow_work_claims FROM authenticated;
GRANT ALL ON TABLE public.workflow_work_claims TO service_role;

-- Acquire a claim atomically. Stale active claims (expired TTL) are expired
-- first so crashed runners cannot block recovery forever.
CREATE OR REPLACE FUNCTION public.acquire_workflow_work_claim(
  p_tenant_id UUID,
  p_subject_type TEXT,
  p_subject_id TEXT,
  p_claimed_by TEXT,
  p_ttl_seconds INTEGER DEFAULT 300
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_claim public.workflow_work_claims;
BEGIN
  IF p_tenant_id IS NULL OR p_subject_type IS NULL
     OR p_subject_id IS NULL OR p_claimed_by IS NULL THEN
    RAISE EXCEPTION 'tenant, subject, and claimed_by are required';
  END IF;

  IF p_ttl_seconds IS NULL OR p_ttl_seconds < 1 OR p_ttl_seconds > 3600 THEN
    RAISE EXCEPTION 'p_ttl_seconds must be between 1 and 3600';
  END IF;

  -- Stale claim recovery: expire active claims whose TTL has passed.
  UPDATE public.workflow_work_claims
  SET status = 'expired', released_at = NOW()
  WHERE tenant_id = p_tenant_id
    AND subject_type = p_subject_type
    AND subject_id = p_subject_id
    AND status = 'active'
    AND expires_at < NOW();

  INSERT INTO public.workflow_work_claims (
    tenant_id, subject_type, subject_id, claimed_by, status, expires_at
  )
  VALUES (
    p_tenant_id, p_subject_type, p_subject_id, p_claimed_by, 'active',
    NOW() + make_interval(secs => p_ttl_seconds)
  )
  ON CONFLICT (tenant_id, subject_type, subject_id) WHERE status = 'active' DO NOTHING
  RETURNING * INTO v_claim;

  IF v_claim.id IS NULL THEN
    RETURN jsonb_build_object('acquired', false);
  END IF;

  RETURN jsonb_build_object(
    'acquired', true,
    'claim_id', v_claim.id,
    'expires_at', v_claim.expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.release_workflow_work_claim(
  p_claim_id UUID,
  p_status TEXT DEFAULT 'released'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status NOT IN ('released', 'expired') THEN
    RAISE EXCEPTION 'p_status must be released or expired';
  END IF;

  UPDATE public.workflow_work_claims
  SET status = p_status, released_at = NOW()
  WHERE id = p_claim_id
    AND status = 'active';

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.acquire_workflow_work_claim(UUID, TEXT, TEXT, TEXT, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.acquire_workflow_work_claim(UUID, TEXT, TEXT, TEXT, INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.acquire_workflow_work_claim(UUID, TEXT, TEXT, TEXT, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_workflow_work_claim(UUID, TEXT, TEXT, TEXT, INTEGER) TO service_role;

REVOKE ALL ON FUNCTION public.release_workflow_work_claim(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_workflow_work_claim(UUID, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.release_workflow_work_claim(UUID, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.release_workflow_work_claim(UUID, TEXT) TO service_role;
