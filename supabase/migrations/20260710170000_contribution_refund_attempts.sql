-- Durable Stripe refund-attempt ledger. A claimed row is intentionally
-- replayable: if the provider response is ambiguous, the same workflow key can
-- reach Stripe again without relying on mutable donation or charge balances.

CREATE TABLE IF NOT EXISTS public.contribution_refund_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
    idempotency_key TEXT NOT NULL
        CHECK (char_length(idempotency_key) BETWEEN 1 AND 256),
    requested_amount BIGINT NOT NULL CHECK (requested_amount > 0),
    state TEXT NOT NULL DEFAULT 'claimed'
        CHECK (state IN ('claimed', 'finalized')),
    provider_outcome JSONB,
    provider_reference_id TEXT,
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finalized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, idempotency_key),
    CHECK (
        (state = 'claimed' AND provider_outcome IS NULL AND finalized_at IS NULL)
        OR
        (state = 'finalized' AND provider_outcome IS NOT NULL AND finalized_at IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_contribution_refund_attempts_tenant_donation
    ON public.contribution_refund_attempts (tenant_id, donation_id, created_at DESC);

-- PostgreSQL does not index foreign-key columns automatically. Keep donation
-- cascades from scanning the full refund-attempt ledger.
CREATE INDEX IF NOT EXISTS idx_contribution_refund_attempts_donation
    ON public.contribution_refund_attempts (donation_id);

CREATE OR REPLACE FUNCTION public.enforce_contribution_refund_attempt_tenant_ref()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.donations
        WHERE id = NEW.donation_id
          AND tenant_id = NEW.tenant_id
    ) THEN
        RAISE EXCEPTION 'contribution refund attempt donation tenant mismatch'
            USING ERRCODE = '23503';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_contribution_refund_attempt_tenant_ref
    BEFORE INSERT OR UPDATE OF tenant_id, donation_id
    ON public.contribution_refund_attempts
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_contribution_refund_attempt_tenant_ref();

ALTER TABLE public.contribution_refund_attempts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.contribution_refund_attempts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.contribution_refund_attempts TO service_role;

REVOKE ALL ON FUNCTION public.enforce_contribution_refund_attempt_tenant_ref()
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_contribution_refund_attempt_tenant_ref()
    TO service_role;
