-- Donor matching / entity resolution: merge candidates + auditable merge workflow.
-- Source: Conrad blocker answers section 2.5-2.6 (2026-07-04).
-- PROTECTED AREA (tenant / donor PII / audit). Requires Gate 4 + Gate 8 human sign-off.
-- Grounded in public.donors (id UUID PK, tenant_id UUID) from
-- 20260214090000_foundation_1_schema.sql. Stacks on 20260702120000 (guest giving).
--
-- Terminology law: canonical / surviving / primary vs duplicate / secondary /
-- merged. A merged donor is redirected to the surviving record, never deleted.
-- Redirect metadata lives in a server-only table so public.donors wildcard reads
-- do not expose merge relationships.

-- 1. Shared donor indexes for tenant-safe references and in-tenant matching.
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS donors_tenant_id_id_uidx
  ON public.donors (tenant_id, id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS donors_tenant_lower_email_idx
  ON public.donors (tenant_id, lower(email));

-- 2. Merge candidates: possible/low matches held for human/agent review.
CREATE TABLE IF NOT EXISTS public.donor_merge_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  existing_donor_id UUID NOT NULL,
  incoming_donor_id UUID,
  confidence TEXT NOT NULL,
  signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  CONSTRAINT donor_merge_candidates_confidence_check
    CHECK (confidence IN ('possible', 'low')),
  CONSTRAINT donor_merge_candidates_status_check
    CHECK (status IN ('open', 'resolved_merged', 'resolved_rejected')),
  CONSTRAINT donor_merge_candidates_distinct_check
    CHECK (incoming_donor_id IS NULL OR incoming_donor_id <> existing_donor_id)
);

CREATE INDEX IF NOT EXISTS donor_merge_candidates_tenant_status_idx
  ON public.donor_merge_candidates (tenant_id, status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'donor_merge_candidates_existing_donor_same_tenant_fk'
      AND conrelid = 'public.donor_merge_candidates'::regclass
  ) THEN
    ALTER TABLE public.donor_merge_candidates
      ADD CONSTRAINT donor_merge_candidates_existing_donor_same_tenant_fk
      FOREIGN KEY (tenant_id, existing_donor_id)
      REFERENCES public.donors (tenant_id, id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'donor_merge_candidates_incoming_donor_same_tenant_fk'
      AND conrelid = 'public.donor_merge_candidates'::regclass
  ) THEN
    ALTER TABLE public.donor_merge_candidates
      ADD CONSTRAINT donor_merge_candidates_incoming_donor_same_tenant_fk
      FOREIGN KEY (tenant_id, incoming_donor_id)
      REFERENCES public.donors (tenant_id, id);
  END IF;
END $$;

ALTER TABLE public.donor_merge_candidates ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.donor_merge_candidates FROM anon, authenticated;
GRANT ALL ON TABLE public.donor_merge_candidates TO service_role;

COMMENT ON TABLE public.donor_merge_candidates IS
  'Duplicate-detection review queue: possible/low matches held for review. Never an auto-merge.';

-- 3. Redirect records: server-only pointer from merged donor to surviving donor.
CREATE TABLE IF NOT EXISTS public.donor_merge_redirects (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  merged_donor_id UUID NOT NULL,
  surviving_donor_id UUID NOT NULL,
  merged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT donor_merge_redirects_pkey PRIMARY KEY (merged_donor_id),
  CONSTRAINT donor_merge_redirects_distinct_check
    CHECK (surviving_donor_id <> merged_donor_id)
);

CREATE INDEX IF NOT EXISTS donor_merge_redirects_tenant_idx
  ON public.donor_merge_redirects (tenant_id, merged_at);
CREATE INDEX IF NOT EXISTS donor_merge_redirects_surviving_idx
  ON public.donor_merge_redirects (surviving_donor_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'donor_merge_redirects_merged_donor_same_tenant_fk'
      AND conrelid = 'public.donor_merge_redirects'::regclass
  ) THEN
    ALTER TABLE public.donor_merge_redirects
      ADD CONSTRAINT donor_merge_redirects_merged_donor_same_tenant_fk
      FOREIGN KEY (tenant_id, merged_donor_id)
      REFERENCES public.donors (tenant_id, id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'donor_merge_redirects_surviving_donor_same_tenant_fk'
      AND conrelid = 'public.donor_merge_redirects'::regclass
  ) THEN
    ALTER TABLE public.donor_merge_redirects
      ADD CONSTRAINT donor_merge_redirects_surviving_donor_same_tenant_fk
      FOREIGN KEY (tenant_id, surviving_donor_id)
      REFERENCES public.donors (tenant_id, id);
  END IF;
END $$;

ALTER TABLE public.donor_merge_redirects ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.donor_merge_redirects FROM anon, authenticated;
GRANT ALL ON TABLE public.donor_merge_redirects TO service_role;

COMMENT ON TABLE public.donor_merge_redirects IS
  'Server-only donor merge redirects. Keeps merge metadata out of public.donors wildcard reads.';

-- 4. Merge audit: append-only, fully auditable merge history.
CREATE TABLE IF NOT EXISTS public.donor_merge_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  surviving_donor_id UUID NOT NULL,
  merged_donor_id UUID NOT NULL,
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'donor_merge_audit_surviving_donor_same_tenant_fk'
      AND conrelid = 'public.donor_merge_audit'::regclass
  ) THEN
    ALTER TABLE public.donor_merge_audit
      ADD CONSTRAINT donor_merge_audit_surviving_donor_same_tenant_fk
      FOREIGN KEY (tenant_id, surviving_donor_id)
      REFERENCES public.donors (tenant_id, id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'donor_merge_audit_merged_donor_same_tenant_fk'
      AND conrelid = 'public.donor_merge_audit'::regclass
  ) THEN
    ALTER TABLE public.donor_merge_audit
      ADD CONSTRAINT donor_merge_audit_merged_donor_same_tenant_fk
      FOREIGN KEY (tenant_id, merged_donor_id)
      REFERENCES public.donors (tenant_id, id);
  END IF;
END $$;

ALTER TABLE public.donor_merge_audit ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.donor_merge_audit FROM anon, authenticated;
GRANT ALL ON TABLE public.donor_merge_audit TO service_role;

COMMENT ON TABLE public.donor_merge_audit IS
  'Auditable merge history: who/what/when/why/confidence-signals/affected-records. Append-only.';
