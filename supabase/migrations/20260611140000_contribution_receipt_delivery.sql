-- Updated receipt delivery policy and receipt content snapshots
-- (ADR-CD-013 / ADR-CD-029 / ADR-CD-030 / ADR-CD-031).

CREATE TABLE IF NOT EXISTS public.contribution_receipt_delivery_policies (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    default_choice TEXT NOT NULL DEFAULT 'email'
        CHECK (default_choice IN ('email', 'pdf', 'defer')),
    allow_defer BOOLEAN NOT NULL DEFAULT TRUE,
    defer_reason_required BOOLEAN NOT NULL DEFAULT TRUE,
    require_delivery_action BOOLEAN NOT NULL DEFAULT FALSE,
    email_capability TEXT NOT NULL DEFAULT 'contributions.manage_receipts',
    pdf_capability TEXT NOT NULL DEFAULT 'contributions.manage_receipts',
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Durable receipt content snapshots: what designation lines and effective
-- values a sent/generated receipt represented at delivery time (ADR-CD-013).
CREATE TABLE IF NOT EXISTS public.contribution_receipt_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
    adjustment_id UUID REFERENCES public.contribution_adjustments(id) ON DELETE SET NULL,
    kind TEXT NOT NULL CHECK (kind IN ('email', 'pdf')),
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contribution_receipt_snapshots_tenant_donation
    ON public.contribution_receipt_snapshots (tenant_id, donation_id, created_at DESC);

ALTER TABLE public.contribution_receipt_delivery_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_receipt_snapshots ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.contribution_receipt_delivery_policies FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_receipt_snapshots FROM anon, authenticated;

GRANT ALL ON TABLE public.contribution_receipt_delivery_policies TO service_role;
GRANT ALL ON TABLE public.contribution_receipt_snapshots TO service_role;
