-- Rollback for 20260704140000_donor_matching_merge_candidates.sql
-- Drops the new server-only merge tables. Idempotent (IF EXISTS).

DROP TABLE IF EXISTS public.donor_merge_audit;
DROP TABLE IF EXISTS public.donor_merge_redirects;
DROP TABLE IF EXISTS public.donor_merge_candidates;

-- Keep donors_tenant_id_id_uidx and donors_tenant_lower_email_idx: the forward
-- migration creates them with IF NOT EXISTS, so they may have existed before this
-- migration ran. Leaving them is safer than dropping shared indexes.
