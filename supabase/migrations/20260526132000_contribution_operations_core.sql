-- Mission Control Contribution Operations Core.
-- Created after `supabase migration new contribution_operations_core` hung in
-- this environment; timestamped manually to keep the migration deterministic.

CREATE TABLE IF NOT EXISTS public.contribution_operation_prompt_settings (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    default_reason_mode TEXT NOT NULL DEFAULT 'optional'
        CHECK (default_reason_mode IN ('optional', 'required')),
    allow_user_reason_prompt_reduction BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.contribution_operation_user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reduce_reason_prompts BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.contribution_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
    staged_gift_id UUID REFERENCES public.staged_gifts(id) ON DELETE SET NULL,
    correction_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'applied'
        CHECK (status IN ('pending', 'applied', 'failed', 'voided')),
    reason TEXT NOT NULL,
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
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    before_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    after_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    provider_outcome JSONB NOT NULL DEFAULT '{}'::jsonb,
    donor_visible_effect JSONB NOT NULL DEFAULT '{}'::jsonb,
    receipt_effect JSONB NOT NULL DEFAULT '{}'::jsonb,
    statement_effect JSONB NOT NULL DEFAULT '{}'::jsonb,
    audit_event_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    applied_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.contribution_operation_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE,
    staged_gift_id UUID REFERENCES public.staged_gifts(id) ON DELETE SET NULL,
    donor_id UUID REFERENCES public.donors(id) ON DELETE SET NULL,
    correction_id UUID REFERENCES public.contribution_corrections(id) ON DELETE SET NULL,
    operation TEXT NOT NULL,
    resource_type TEXT NOT NULL DEFAULT 'donation',
    resource_id UUID,
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
    reason TEXT,
    confirmation_label TEXT,
    policy_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    before_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    after_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    provider_outcome JSONB NOT NULL DEFAULT '{}'::jsonb,
    downstream_effects JSONB NOT NULL DEFAULT '{}'::jsonb,
    related_task_ids UUID[] NOT NULL DEFAULT '{}'::uuid[],
    related_batch_id UUID,
    correlation_id UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contribution_corrections
    ADD CONSTRAINT contribution_corrections_audit_event_id_fkey
    FOREIGN KEY (audit_event_id)
    REFERENCES public.contribution_operation_audit_events(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contribution_corrections_tenant_donation
    ON public.contribution_corrections (tenant_id, donation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_corrections_staged_gift
    ON public.contribution_corrections (staged_gift_id)
    WHERE staged_gift_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contribution_operation_audit_tenant_donation
    ON public.contribution_operation_audit_events (tenant_id, donation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_operation_audit_staged_gift
    ON public.contribution_operation_audit_events (staged_gift_id)
    WHERE staged_gift_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contribution_operation_audit_actor
    ON public.contribution_operation_audit_events (tenant_id, actor_profile_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_operation_user_preferences_profile
    ON public.contribution_operation_user_preferences (profile_id);

ALTER TABLE public.contribution_operation_prompt_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_operation_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_operation_audit_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.contribution_operation_prompt_settings FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_operation_user_preferences FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_corrections FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_operation_audit_events FROM anon, authenticated;
