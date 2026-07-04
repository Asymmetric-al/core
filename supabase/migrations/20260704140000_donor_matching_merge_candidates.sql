-- Donor matching / entity resolution: merge candidates + auditable merge workflow.
-- Source: Conrad blocker answers §2.5–§2.6 (2026-07-04).
-- PROTECTED AREA (tenant / donor PII / audit). Requires Gate 4 + Gate 8 human sign-off.
-- Grounded in public.donors (id UUID PK, tenant_id UUID) from
-- 20260214090000_foundation_1_schema.sql. Stacks on 20260702120000 (guest giving).
--
-- Terminology LAW (§2.5): canonical / surviving / primary vs duplicate / secondary /
-- merged. The legacy dominant/subordinate naming is never used. A merged donor is REDIRECTED to the
-- surviving record (merged_into_donor_id), never deleted.
--
-- Design notes:
--   * All ADDs/CREATEs are idempotent (IF NOT EXISTS). Column ADDs on public.donors
--     are nullable with no default → metadata-only, no table rewrite.
--   * A donor is CANONICAL when merged_into_donor_id IS NULL; MERGED otherwise.
--   * Merge audit is append-only history: who/what/when/why/confidence-signals/
--     affected-records (§2.5). Receipts are NOT rewritten by a merge (§2.6); receipt
--     snapshot columns from 20260702120000 stay authoritative and a correction/link
--     is recorded in application logic, not by mutating the snapshot here.

-- 1. Redirect pointer on the duplicate/secondary record (marked merged, not deleted).
ALTER TABLE public.donors
  ADD COLUMN IF NOT EXISTS merged_into_donor_id UUID REFERENCES public.donors(id),
  ADD COLUMN IF NOT EXISTS merged_at TIMESTAMPTZ;

COMMENT ON COLUMN public.donors.merged_into_donor_id IS
  'Entity resolution (§2.5): when set, this is a MERGED/secondary record redirected to '
  'the surviving/canonical donor. NULL = canonical record. Never deleted on merge.';
COMMENT ON COLUMN public.donors.merged_at IS
  'Timestamp the donor record was merged/redirected into the surviving record.';

CREATE INDEX IF NOT EXISTS donors_merged_into_donor_id_idx
  ON public.donors (merged_into_donor_id) WHERE merged_into_donor_id IS NOT NULL;

-- Fast in-tenant matching on normalized email (§2.1 exact/high-confidence match).
CREATE INDEX IF NOT EXISTS donors_tenant_lower_email_idx
  ON public.donors (tenant_id, lower(email));

-- 2. Merge candidates — possible/low matches held for human/agent review (§2.2/§2.4).
CREATE TABLE IF NOT EXISTS public.donor_merge_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  existing_donor_id UUID NOT NULL REFERENCES public.donors(id),
  incoming_donor_id UUID REFERENCES public.donors(id),
  confidence TEXT NOT NULL,
  signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  CONSTRAINT donor_merge_candidates_confidence_check
    CHECK (confidence IN ('exact', 'high', 'possible', 'low', 'none')),
  CONSTRAINT donor_merge_candidates_status_check
    CHECK (status IN ('open', 'resolved_merged', 'resolved_rejected')),
  -- A candidate never pairs a record with itself.
  CONSTRAINT donor_merge_candidates_distinct_check
    CHECK (incoming_donor_id IS NULL OR incoming_donor_id <> existing_donor_id)
);

CREATE INDEX IF NOT EXISTS donor_merge_candidates_tenant_status_idx
  ON public.donor_merge_candidates (tenant_id, status);

COMMENT ON TABLE public.donor_merge_candidates IS
  'Duplicate-detection review queue (§2.2/§2.4): possible/low matches held for human '
  'or agent-assisted review. Never an auto-merge.';

-- 3. Merge audit — append-only, fully auditable merge history (§2.5).
CREATE TABLE IF NOT EXISTS public.donor_merge_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  surviving_donor_id UUID NOT NULL REFERENCES public.donors(id), -- canonical / primary
  merged_donor_id UUID NOT NULL REFERENCES public.donors(id),    -- duplicate / secondary
  actor_id UUID NOT NULL,
  actor_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  confidence_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  affected_records JSONB NOT NULL DEFAULT '{}'::jsonb,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT donor_merge_audit_actor_type_check
    CHECK (actor_type IN ('staff', 'agent')),
  CONSTRAINT donor_merge_audit_distinct_check
    CHECK (surviving_donor_id <> merged_donor_id)
);

CREATE INDEX IF NOT EXISTS donor_merge_audit_tenant_idx
  ON public.donor_merge_audit (tenant_id, decided_at);
CREATE INDEX IF NOT EXISTS donor_merge_audit_surviving_idx
  ON public.donor_merge_audit (surviving_donor_id);

COMMENT ON TABLE public.donor_merge_audit IS
  'Auditable merge history (§2.5): who/what/when/why/confidence-signals/affected-records. '
  'Append-only. A merge marks the duplicate redirected (donors.merged_into_donor_id), '
  'never deleted, and never rewrites receipt snapshots (§2.6).';
