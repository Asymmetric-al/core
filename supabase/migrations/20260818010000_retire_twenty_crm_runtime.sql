-- Retire Twenty CRM runtime tables after Asym Postgres became CRM truth.
-- Development (pnmlrbgjiqzzsthsoikm) and production (btewedpsxwsjczvmegby)
-- both returned COUNT(*) = 0 on 2026-08-18 for:
--   crm_outbound_jobs, crm_webhook_events, crm_sync_settings,
--   crm_sync_logs, crm_reconciliation_runs, crm_projection_state,
--   crm_record_links, donation_crm_links, crm_merge_candidates,
--   crm_command_logs.
-- Production never contained Twenty CRM rows in these tables.
-- Keep Asym-owned leftover link/audit tables; drop Twenty-only sync tables.

ALTER TABLE public.staged_gifts
  DROP CONSTRAINT IF EXISTS staged_gifts_crm_outbound_job_id_fkey;

DROP TABLE IF EXISTS public.crm_outbound_jobs CASCADE;
DROP TABLE IF EXISTS public.crm_webhook_events CASCADE;
DROP TABLE IF EXISTS public.crm_sync_settings CASCADE;
DROP TABLE IF EXISTS public.crm_sync_logs CASCADE;
DROP TABLE IF EXISTS public.crm_reconciliation_runs CASCADE;
DROP TABLE IF EXISTS public.crm_projection_state CASCADE;

ALTER TABLE public.crm_record_links
  DROP CONSTRAINT IF EXISTS crm_record_links_crm_provider_check;

ALTER TABLE public.crm_merge_candidates
  DROP CONSTRAINT IF EXISTS crm_merge_candidates_crm_provider_check;

ALTER TABLE public.donation_crm_links
  DROP CONSTRAINT IF EXISTS donation_crm_links_provider_check;

ALTER TABLE public.donation_crm_links
  DROP CONSTRAINT IF EXISTS donation_crm_links_crm_provider_check;

COMMENT ON TABLE public.crm_record_links IS
  'Tenant-scoped leftover provider links for Asym identity concepts. Historical Twenty record ids may remain as retired references; they are not CRM truth.';

COMMENT ON TABLE public.crm_command_logs IS
  'Audited CRM command boundary for Asym-owned CRM operations. Stores Asym actor and redacted command/result summaries only.';

COMMENT ON TABLE public.staged_gifts IS
  'Finance review queue for successful Stripe gifts before issuing receipts. CRM posting to Twenty is retired; gifts stay in Asym Postgres.';
