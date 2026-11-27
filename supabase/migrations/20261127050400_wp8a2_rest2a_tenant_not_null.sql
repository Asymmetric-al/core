-- AL-2681 (WP8a part 2 rest, PR 2a; ruling W8-R16, record line 964):
-- public.donations.tenant_id becomes NOT NULL behind this migration's own
-- count gate.
--
-- The gate counts gifts with no organization and refuses with the count in
-- its detail (55000 donations_without_tenant), changing nothing; it never
-- guesses an organization and never deletes a row. On a clean table it adds
-- donations_tenant_id_present (NOT VALID, then validated) and sets the
-- column NOT NULL, which the validated check lets PostgreSQL do without a
-- second scan.
--
-- No running statement changes meaning: the database's writers of
-- donations are begin_donation_saga, atomic_create_donation_with_audit and
-- tenant_guard.begin_line_gift; the first two already refuse a gift with no
-- organization before they write one (their donor write needs it), and the
-- third enters its organization first
-- (tests/unit/acceptance/issue-2681/wp8a-rest2a-tenant-gate.realstack).
-- donations_tenant_id_fkey is ON DELETE RESTRICT, so no cascade writes NULL.
--
-- Before the release that carries this file, read on each hosted database,
-- read-only: SELECT count(*) FROM public.donations WHERE tenant_id IS NULL;
-- (record line 1026). A count above zero stops the release here.
--
-- Locks, taken first and held to COMMIT: ACCESS EXCLUSIVE on donations.
-- lock_timeout stops a run rather than queue it behind live traffic.
--
-- Recovery. A run lost between its COMMIT and its ledger row stops on the
-- next run at ADD CONSTRAINT donations_tenant_id_present (42710). This file
-- has committed when this read-only check is true:
--   SELECT attnotnull FROM pg_attribute
--    WHERE attrelid = 'public.donations'::regclass AND attname = 'tenant_id'
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127050400.
--
-- Down, in one transaction:
--   SET LOCAL lock_timeout = '5s';
--   ALTER TABLE public.donations ALTER COLUMN tenant_id DROP NOT NULL;
--   ALTER TABLE public.donations DROP CONSTRAINT donations_tenant_id_present;

BEGIN;
SET LOCAL lock_timeout = '5s';

LOCK TABLE public.donations IN ACCESS EXCLUSIVE MODE;

-- gate: begin
DO $$
DECLARE
  v_count BIGINT;
BEGIN
  SELECT pg_catalog.count(*) INTO v_count FROM public.donations WHERE tenant_id IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'donations_without_tenant'
      USING ERRCODE = '55000',
            DETAIL = pg_catalog.format(
              '%s donations have no organization; bring each into line before this migration runs.',
              v_count
            );
  END IF;
END;
$$;

ALTER TABLE public.donations
  ADD CONSTRAINT donations_tenant_id_present CHECK (tenant_id IS NOT NULL) NOT VALID;
ALTER TABLE public.donations VALIDATE CONSTRAINT donations_tenant_id_present;
ALTER TABLE public.donations ALTER COLUMN tenant_id SET NOT NULL;
-- gate: end

COMMIT;
