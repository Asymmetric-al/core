-- Rollback for 20261025100000_donations_composite_donor_fk.sql
-- Re-adds and validates the single-column donations_donor_id_fkey first, then
-- drops the composite FK and the CHECK, so there is never a moment with no
-- donor FK. One transaction, so no committed state has two donations ->
-- donors FKs (PGRST201). Idempotent (guarded ADD, DROP ... IF EXISTS); it
-- touches no data. The re-validate scans donations and the final DROP takes
-- ACCESS EXCLUSIVE on donations and donors: apply in a quiet window.

BEGIN;

SET LOCAL lock_timeout = '5s';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'donations_donor_id_fkey'
      AND conrelid = 'public.donations'::regclass
  ) THEN
    ALTER TABLE public.donations
      ADD CONSTRAINT donations_donor_id_fkey
      FOREIGN KEY (donor_id) REFERENCES public.donors(id) NOT VALID;
  END IF;
END $$;

ALTER TABLE public.donations
  VALIDATE CONSTRAINT donations_donor_id_fkey;

ALTER TABLE public.donations
  DROP CONSTRAINT IF EXISTS donations_donor_same_tenant_fk;
ALTER TABLE public.donations
  DROP CONSTRAINT IF EXISTS donations_donor_requires_tenant;

COMMIT;
