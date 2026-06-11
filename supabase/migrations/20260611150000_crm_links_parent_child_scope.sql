-- Parent gift vs child designation CRM record links (ADR-CD-012).
-- One parent gift link represents the donation in the CRM; designation lines
-- may post as child records. Failures stay parent- or line-scoped so retries
-- can target the failed scope.

ALTER TABLE public.donation_crm_links
    ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'parent'
        CHECK (scope IN ('parent', 'designation')),
    ADD COLUMN IF NOT EXISTS allocation_id UUID
        REFERENCES public.staged_gift_allocations(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS last_error TEXT;

CREATE INDEX IF NOT EXISTS idx_donation_crm_links_donation_scope
    ON public.donation_crm_links (tenant_id, donation_id, scope);
