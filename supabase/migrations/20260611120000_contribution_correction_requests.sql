-- High-risk correction requests and tenant approval policy
-- (ADR-CD-005 / ADR-CD-025 / ADR-CD-027).

CREATE TABLE IF NOT EXISTS public.contribution_approval_policies (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    ownership_mode TEXT NOT NULL DEFAULT 'separation_of_duties'
        CHECK (
            ownership_mode IN (
                'no_approval_required',
                'one_approver',
                'separation_of_duties'
            )
        ),
    suppressed_gates TEXT[] NOT NULL DEFAULT '{}'::text[],
    stronger_approval_categories TEXT[] NOT NULL DEFAULT '{}'::text[],
    reminder_hours INTEGER NOT NULL DEFAULT 24 CHECK (reminder_hours > 0),
    escalation_hours INTEGER CHECK (escalation_hours > 0),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contribution_correction_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    reason TEXT NOT NULL,
    requested_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    source_surface TEXT NOT NULL
        CHECK (
            source_surface IN (
                'contribution_hub',
                'donor_crm_record',
                'automation',
                'bulk_action',
                'api'
            )
        ),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'superseded')),
    expected_revision TEXT,
    idempotency_key TEXT,
    receipt_delivery_proposal JSONB NOT NULL DEFAULT '{}'::jsonb,
    decided_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    decided_at TIMESTAMPTZ,
    decision_reason TEXT,
    applied_adjustment_id UUID REFERENCES public.contribution_adjustments(id) ON DELETE SET NULL,
    approval_task_id UUID,
    follow_up_task_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_contribution_correction_requests_idempotency
    ON public.contribution_correction_requests (tenant_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contribution_correction_requests_tenant_donation
    ON public.contribution_correction_requests (tenant_id, donation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_correction_requests_pending
    ON public.contribution_correction_requests (tenant_id, status, created_at)
    WHERE status = 'pending';

ALTER TABLE public.contribution_approval_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_correction_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.contribution_approval_policies FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_correction_requests FROM anon, authenticated;

GRANT ALL ON TABLE public.contribution_approval_policies TO service_role;
GRANT ALL ON TABLE public.contribution_correction_requests TO service_role;
