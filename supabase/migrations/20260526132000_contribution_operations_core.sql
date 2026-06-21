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

CREATE OR REPLACE FUNCTION public.enforce_contribution_operation_tenant_refs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
    row_data JSONB;
    row_tenant_id UUID;
    row_donation_id UUID;
    ref_id UUID;
    ref_tenant_id UUID;
    ref_donation_id UUID;
BEGIN
    row_data := to_jsonb(NEW);
    row_tenant_id := (row_data ->> 'tenant_id')::uuid;

    IF row_data ? 'donation_id' AND (row_data ->> 'donation_id') IS NOT NULL THEN
        row_donation_id := (row_data ->> 'donation_id')::uuid;
        SELECT d.tenant_id
        INTO ref_tenant_id
        FROM public.donations AS d
        WHERE d.id = row_donation_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation donation tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF
        row_data ? 'staged_gift_id'
        AND (row_data ->> 'staged_gift_id') IS NOT NULL
    THEN
        ref_id := (row_data ->> 'staged_gift_id')::uuid;
        SELECT sg.tenant_id, sg.donation_id
        INTO ref_tenant_id, ref_donation_id
        FROM public.staged_gifts AS sg
        WHERE sg.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation staged gift tenant mismatch'
                USING ERRCODE = '23514';
        END IF;

        IF
            FOUND
            AND row_donation_id IS NOT NULL
            AND ref_donation_id IS DISTINCT FROM row_donation_id
        THEN
            RAISE EXCEPTION 'contribution operation staged gift donation mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF row_data ? 'correction_id' AND (row_data ->> 'correction_id') IS NOT NULL THEN
        ref_id := (row_data ->> 'correction_id')::uuid;
        SELECT cc.tenant_id
        INTO ref_tenant_id
        FROM public.contribution_corrections AS cc
        WHERE cc.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation correction tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF
        row_data ? 'audit_event_id'
        AND (row_data ->> 'audit_event_id') IS NOT NULL
    THEN
        ref_id := (row_data ->> 'audit_event_id')::uuid;
        SELECT ae.tenant_id
        INTO ref_tenant_id
        FROM public.contribution_operation_audit_events AS ae
        WHERE ae.id = ref_id;

        IF FOUND AND ref_tenant_id IS DISTINCT FROM row_tenant_id THEN
            RAISE EXCEPTION 'contribution operation audit event tenant mismatch'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS enforce_contribution_corrections_tenant_refs
    ON public.contribution_corrections;

CREATE TRIGGER enforce_contribution_corrections_tenant_refs
    BEFORE INSERT OR UPDATE OF
        tenant_id,
        donation_id,
        staged_gift_id,
        audit_event_id
    ON public.contribution_corrections
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_contribution_operation_tenant_refs();

DROP TRIGGER IF EXISTS enforce_contribution_operation_audit_events_tenant_refs
    ON public.contribution_operation_audit_events;

CREATE TRIGGER enforce_contribution_operation_audit_events_tenant_refs
    BEFORE INSERT OR UPDATE OF
        tenant_id,
        donation_id,
        staged_gift_id,
        correction_id
    ON public.contribution_operation_audit_events
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_contribution_operation_tenant_refs();

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
