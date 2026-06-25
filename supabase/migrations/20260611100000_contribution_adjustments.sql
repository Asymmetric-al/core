-- Contribution adjustment records (ADR-CD-004).
-- Corrections and refunds never rewrite original donation truth. They are
-- persisted as immutable adjustment records linked to donation.id, and the
-- current effective gift view derives from original donation data plus every
-- applied adjustment.

CREATE TABLE IF NOT EXISTS public.contribution_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
    correction_id UUID REFERENCES public.contribution_corrections(id) ON DELETE SET NULL,
    adjustment_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'applied'
        CHECK (status IN ('applied', 'reversed')),
    effective_values JSONB NOT NULL DEFAULT '{}'::jsonb,
    reason TEXT NOT NULL,
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
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
    base_revision TEXT,
    idempotency_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent retry: a repeated save with the same idempotency key returns the
-- existing adjustment instead of creating a duplicate.
CREATE UNIQUE INDEX IF NOT EXISTS idx_contribution_adjustments_idempotency
    ON public.contribution_adjustments (tenant_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contribution_adjustments_tenant_donation
    ON public.contribution_adjustments (tenant_id, donation_id, created_at);

ALTER TABLE public.contribution_adjustments ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.contribution_adjustments FROM anon, authenticated;
GRANT ALL ON TABLE public.contribution_adjustments TO service_role;
