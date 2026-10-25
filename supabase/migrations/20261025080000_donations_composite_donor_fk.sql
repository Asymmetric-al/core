-- #2252 (#505 slice 3): donations can only name a donor in their own tenant.
-- PROTECTED AREA (tenant / donor spine). Requires Gate 4 + Gate 8 human sign-off.
--
-- Replaces the single-column donations_donor_id_fkey (donor_id) -> donors(id)
-- from 20250101000000_init_schema.sql with
--   donations_donor_same_tenant_fk (tenant_id, donor_id) -> donors(tenant_id, id)
-- on the existing donors_tenant_id_id_uidx (20260704140000; no PK change).
-- FK checks ignore RLS and roles, so this binds every writer, service_role too.
--
-- Under MATCH SIMPLE a composite FK is not checked when any column is NULL,
-- and donations.tenant_id is nullable. donations_donor_requires_tenant
-- (donor_id IS NULL OR tenant_id IS NOT NULL) closes that gap, so a
-- NULL-tenant donation cannot name any donor (23514).
--
-- One transaction: add both constraints NOT VALID, validate them, then drop
-- the old FK. No committed state ever has two donations -> donors FKs, which
-- would make PostgREST's unhinted donors embed ambiguous (PGRST201).
--
-- Bad rows are surfaced, never rewritten. The preflight below raises 23503
-- with counts only (no ids) if any donation names a donor in another tenant,
-- or names a donor with a NULL tenant_id; VALIDATE stays as a second guard.
-- To list the rows, run this read-only operator query (also in
-- docs/security/tenant-guard.md) and share counts only outside the console:
--
-- SELECT d.id AS donation_id, d.tenant_id AS donation_tenant_id, d.donor_id,
--        dn.tenant_id AS donor_tenant_id,
--        CASE WHEN d.tenant_id IS NULL THEN 'null_tenant' ELSE 'cross_tenant' END AS problem
-- FROM public.donations d
-- JOIN public.donors dn ON dn.id = d.donor_id
-- WHERE d.tenant_id IS NULL OR dn.tenant_id IS DISTINCT FROM d.tenant_id
-- ORDER BY d.id;
--
-- Deploy: run the query on preview, then production, and stop if it returns
-- any rows. Apply in a quiet window: SHARE ROW EXCLUSIVE on donations and
-- donors is held through the VALIDATE scan, and the final DROP takes ACCESS
-- EXCLUSIVE on both until COMMIT. lock_timeout = 5s fails fast instead of
-- queueing. Apply the whole file; don't reload the PostgREST schema mid-apply.
--
-- Down: supabase/migrations/rollback_20261025080000_donations_composite_donor_fk.sql
-- re-adds and validates donations_donor_id_fkey, then drops the composite FK
-- and the CHECK, in one transaction. It touches no data.
--
-- Idempotent: every ADD is guarded by a pg_constraint lookup on conrelid.

BEGIN;

SET LOCAL lock_timeout = '5s';

DO $$
DECLARE
  cross_tenant_rows bigint;
  null_tenant_rows bigint;
BEGIN
  SELECT count(*) INTO cross_tenant_rows
  FROM public.donations d
  JOIN public.donors dn ON dn.id = d.donor_id
  WHERE d.tenant_id IS NOT NULL AND dn.tenant_id IS DISTINCT FROM d.tenant_id;

  SELECT count(*) INTO null_tenant_rows
  FROM public.donations d
  WHERE d.donor_id IS NOT NULL AND d.tenant_id IS NULL;

  IF cross_tenant_rows > 0 OR null_tenant_rows > 0 THEN
    RAISE EXCEPTION 'donations composite donor FK preflight failed: % cross-tenant, % null-tenant donation rows; run the preflight query in docs/security/tenant-guard.md',
      cross_tenant_rows, null_tenant_rows
      USING ERRCODE = '23503';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'donations_donor_requires_tenant'
      AND conrelid = 'public.donations'::regclass
  ) THEN
    ALTER TABLE public.donations
      ADD CONSTRAINT donations_donor_requires_tenant
      CHECK (donor_id IS NULL OR tenant_id IS NOT NULL) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'donations_donor_same_tenant_fk'
      AND conrelid = 'public.donations'::regclass
  ) THEN
    ALTER TABLE public.donations
      ADD CONSTRAINT donations_donor_same_tenant_fk
      FOREIGN KEY (tenant_id, donor_id)
      REFERENCES public.donors (tenant_id, id) NOT VALID;
  END IF;
END $$;

ALTER TABLE public.donations
  VALIDATE CONSTRAINT donations_donor_requires_tenant;
ALTER TABLE public.donations
  VALIDATE CONSTRAINT donations_donor_same_tenant_fk;

ALTER TABLE public.donations
  DROP CONSTRAINT IF EXISTS donations_donor_id_fkey;

COMMIT;
