-- AL-2674 (WP1, slice 1.1b; audit D09): retire the February 2026 backup
-- tables and close signed-in writes on `crm_record_links`.
--
-- Hosted rule (plan section 12, WP1): this migration reaches a hosted database
-- only after the owner signs off the census of that database. The backup tables
-- hold pre-conversion money values and orphaned notification rows from
-- 20260214090000_foundation_1_schema.sql; the census decides whether any of
-- them is kept data and exports it first.
--
-- Dropped: the eight `backup_*` tables. No application, package, script,
-- function, view or policy reads them; the tenant RLS catalog exception for
-- `backup_notification_queue_orphans_20260214` is removed with it.
--
-- The retired Twenty-era `crm_*` tables. Six of them (`crm_outbound_jobs`,
-- `crm_webhook_events`, `crm_sync_settings`, `crm_sync_logs`,
-- `crm_reconciliation_runs`, `crm_projection_state`) are already dropped by
-- 20260818010000_retire_twenty_crm_runtime.sql; the post-assert below proves
-- none of them exists. Kept, by the plan and by current readers:
--   * `crm_command_logs`: the audited CRM command boundary, written by
--     packages/api/src/crm/commands/log.ts;
--   * `crm_record_links`: kept as generalized provider links (ADR-0001); no
--     code writes it, so the signed-in INSERT and UPDATE grants are revoked and
--     only the staff SELECT remains. Its two write policies stay in place,
--     inert without the grants, until WP2 rewrites the CRM policies;
--   * `crm_merge_candidates`: still read by CRM detail
--     (packages/api/src/admin/crm/detail/service.ts). WP4a moves that read to
--     `donor_merge_candidates`; the table is dropped after that move.
--
-- No CASCADE: an unexpected dependent object fails the migration instead of
-- being dropped with it. Rollback: forward-fix only; restore a dropped table
-- from the census export if the owner kept it.

BEGIN;

DROP TABLE public.backup_money_donations_20260214;
DROP TABLE public.backup_money_donor_activities_20260214;
DROP TABLE public.backup_money_donor_pledges_20260214;
DROP TABLE public.backup_money_donors_20260214;
DROP TABLE public.backup_money_funds_20260214;
DROP TABLE public.backup_money_missionaries_20260214;
DROP TABLE public.backup_money_pledge_charge_attempts_20260214;
DROP TABLE public.backup_notification_queue_orphans_20260214;

REVOKE INSERT, UPDATE, DELETE ON TABLE public.crm_record_links FROM anon, authenticated;

DO $$
DECLARE
  problem text;
BEGIN
  SELECT string_agg(c.relname, ', ') INTO problem
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND (c.relname LIKE 'backup\_%' ESCAPE '\'
      OR c.relname IN ('crm_outbound_jobs', 'crm_webhook_events',
        'crm_sync_settings', 'crm_sync_logs', 'crm_reconciliation_runs',
        'crm_projection_state'));
  IF problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2674: retired tables remain: %', problem;
  END IF;

  SELECT string_agg(format('%s %s', r, p), ', ') INTO problem
  FROM unnest(ARRAY['anon', 'authenticated']) r
  CROSS JOIN unnest(ARRAY['INSERT', 'UPDATE', 'DELETE']) p
  WHERE has_table_privilege(r, 'public.crm_record_links', p);
  IF problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2674: crm_record_links writes remain: %', problem;
  END IF;
END $$;

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;
