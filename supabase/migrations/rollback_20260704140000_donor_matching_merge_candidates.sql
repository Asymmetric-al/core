-- Rollback for 20260704140000_donor_matching_merge_candidates.sql
-- Drops the new tables and the donors redirect columns. Idempotent (IF EXISTS).
-- Safe ordering: audit/candidate tables first (they FK donors), then donors columns.

DROP TABLE IF EXISTS public.donor_merge_audit;
DROP TABLE IF EXISTS public.donor_merge_candidates;

DROP INDEX IF EXISTS public.donors_tenant_lower_email_idx;
DROP INDEX IF EXISTS public.donors_merged_into_donor_id_idx;

ALTER TABLE public.donors
  DROP COLUMN IF EXISTS merged_at,
  DROP COLUMN IF EXISTS merged_into_donor_id;
