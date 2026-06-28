-- Bulk Contribution Actions and Batch Results.

CREATE TABLE IF NOT EXISTS public.contribution_operation_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    operation TEXT NOT NULL,
    risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'high')),
    source_surface TEXT NOT NULL DEFAULT 'contribution_hub',
    selection_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    preview_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    preview_skipped BOOLEAN NOT NULL DEFAULT FALSE,
    confirmation_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'running'
        CHECK (status IN ('running', 'complete', 'complete_with_issues', 'failed', 'cancelled')),
    execution_mode TEXT NOT NULL DEFAULT 'immediate'
        CHECK (execution_mode IN ('immediate', 'background')),
    total_count INTEGER NOT NULL DEFAULT 0,
    processed_count INTEGER NOT NULL DEFAULT 0,
    succeeded_count INTEGER NOT NULL DEFAULT 0,
    skipped_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    follow_up_task_count INTEGER NOT NULL DEFAULT 0,
    created_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    activity_audit_event_id UUID REFERENCES public.contribution_operation_audit_events(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.contribution_operation_batch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.contribution_operation_batches(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    record_index INTEGER NOT NULL DEFAULT 0,
    resource_type TEXT NOT NULL DEFAULT 'donation',
    resource_id UUID,
    donation_id UUID REFERENCES public.donations(id) ON DELETE SET NULL,
    staged_gift_id UUID REFERENCES public.staged_gifts(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'succeeded', 'skipped', 'failed')),
    skip_reason TEXT,
    error_code TEXT,
    error_message TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB NOT NULL DEFAULT '{}'::jsonb,
    operation_audit_event_id UUID REFERENCES public.contribution_operation_audit_events(id) ON DELETE SET NULL,
    task_id UUID REFERENCES public.mission_control_tasks(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contribution_batches_tenant_status
    ON public.contribution_operation_batches (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_batch_items_batch
    ON public.contribution_operation_batch_items (batch_id, record_index);

CREATE INDEX IF NOT EXISTS idx_contribution_batch_items_batch_status
    ON public.contribution_operation_batch_items (tenant_id, batch_id, status, record_index);

ALTER TABLE public.contribution_operation_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_operation_batch_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.contribution_operation_batches FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_operation_batch_items FROM anon, authenticated;

GRANT ALL ON TABLE public.contribution_operation_batches TO service_role;
GRANT ALL ON TABLE public.contribution_operation_batch_items TO service_role;
