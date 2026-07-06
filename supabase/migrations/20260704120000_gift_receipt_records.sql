-- Minimum Statement-Studio-compatible receipt trail (Conrad 2026-07-04 §3 / §2.6).
--
-- One immutable receipt record per successful gift, capturing the donor identity
-- and gift facts AS THEY WERE AT TIME OF GIVING. Existing receipt rendering reads
-- live from mutable `donors`/`profiles`; a later donor merge/rename would rewrite
-- receipt truth. This table is the receipt truth of record so merges cannot.
--
-- Server-only (service_role): no anon, no authenticated grants. Corrections are
-- append-only (no UPDATE policy) — a later correction is a new row, preserving
-- audit trail. Phase 0 (#312) must reconcile this with the Statement Studio
-- persistence model (`pdf_*` / `contribution_receipt_snapshots`) before it is
-- promoted past MVP; see docs/guides/features/statement-studio/data-model.md.

CREATE TABLE IF NOT EXISTS public.gift_receipt_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE RESTRICT,
    receipt_number TEXT NOT NULL,
    status TEXT NOT NULL
        CHECK (status IN ('paid', 'processing', 'pending', 'failed', 'refunded')),
    payment_method TEXT,
    snapshot_version INTEGER NOT NULL DEFAULT 1,
    -- Frozen identity + gift facts at time of giving (donor name/email, amount,
    -- currency, designation, gift date, receipt number, status, notice).
    snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_test BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One receipt per gift → idempotent writes from the money path (23505 on re-delivery).
CREATE UNIQUE INDEX IF NOT EXISTS uq_gift_receipt_records_donation
    ON public.gift_receipt_records (donation_id);

CREATE INDEX IF NOT EXISTS idx_gift_receipt_records_tenant_created
    ON public.gift_receipt_records (tenant_id, created_at DESC);

ALTER TABLE public.gift_receipt_records ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.gift_receipt_records FROM anon, authenticated;
GRANT ALL ON TABLE public.gift_receipt_records TO service_role;
