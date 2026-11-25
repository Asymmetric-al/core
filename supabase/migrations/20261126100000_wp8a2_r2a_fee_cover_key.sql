-- AL-2681 (WP8a part 2, R2a, M1; plan line 1137; record line 1002; index
-- sections 3.1 and 3.2, binding; rulings W8-R15 and W8-R26): the reserved
-- fee-cover fund becomes a key a line can name, and every legal entity gets
-- one. Nothing live names the new column or key.
--
-- 1. funds.is_reserved_fee_cover boolean NOT NULL GENERATED ALWAYS AS
--    (system_purpose IS NOT DISTINCT FROM 'fee_cover') STORED: true for the
--    entity's reserved fee-cover fund, false otherwise (a NULL purpose gives
--    false).
-- 2. funds_tenant_entity_fee_cover_key UNIQUE (tenant_id, id, legal_entity_id,
--    is_reserved_fee_cover), nondeferrable: the target of the lines' and the
--    allocations' fund keys, which carry the line's fee flag, so a donor line
--    never names the reserved fund and a fee line names nothing else.
-- 3. Preflight, after the locks, counts only: a reserved fund that is not
--    active (is_active not true) stops the run with the count (55000) and
--    changes nothing; a NOTICE gives the number of legal entities that have
--    no reserved fund.
-- 4. Backfill, one statement: for each legal entity with no reserved fund,
--    one fund named 'Fee cover' with system_purpose 'fee_cover' and the
--    entity's tenant, id and currency (record line 1002: hosted development
--    holds none; supabase/seed.sql creates them only on a fresh database). It
--    skips an entity that has one (ON CONFLICT on funds_one_fee_cover_per_entity,
--    the form of 20261125070000:260-261's provisioning).
-- 5. field_policies: five rows for the new column, with the category and
--    flags of funds.system_purpose (internal; visible to Mission Control only).
--
-- Locks, all held to COMMIT, taken first and in this order: SHARE ROW
-- EXCLUSIVE on legal_entities (the backfill reads every entity; 2 rows in the
-- seed); ACCESS EXCLUSIVE on funds (rewritten for the stored column; 8 rows
-- hosted at census, 10 in the seed); ROW EXCLUSIVE on field_policies for its
-- new rows. lock_timeout stops a run rather than queue it behind live
-- traffic.
--
-- A second run of the applied file, as observed: it stops at its first
-- statement after the locks and the preflight, ADD COLUMN
-- is_reserved_fee_cover (42701, column already exists), and changes nothing.
-- The backfill statement alone, run again, inserts nothing (test A1). This
-- file has committed when this read-only check is true; it answers false,
-- never an error, when the table or the column is absent:
--   SELECT EXISTS (SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid =
--   to_regclass('public.funds') AND attname = 'is_reserved_fee_cover' AND NOT
--   attisdropped)
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version.
--
-- Before a hosted run, read these counts (W8-R26); the third must be 0:
--   SELECT count(*) FROM public.legal_entities;
--   SELECT count(*) FROM public.legal_entities AS e WHERE NOT EXISTS (SELECT 1
--     FROM public.funds AS f WHERE f.legal_entity_id = e.id AND
--     f.system_purpose = 'fee_cover');
--   SELECT count(*) FROM public.funds WHERE system_purpose = 'fee_cover' AND
--     is_active IS NOT TRUE;
--   SELECT count(*) FROM public.funds;
-- A positive third count opens a data decision; it never disables the check.
--
-- Down, an operator's last resort, in one transaction, after the Down of
-- every later R2a file (their keys name this one). It never refuses: once the
-- lines and the allocation keys are gone, nothing names the column or the
-- key. The backfilled funds stay, as data: the provisioning command and the
-- seed create the same funds, and every live fund list hides them (its
-- system_purpose IS NULL filter, and the staff policy on funds).
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   LOCK TABLE public.funds IN ACCESS EXCLUSIVE MODE;
--   DELETE FROM public.field_policies WHERE record_type = 'funds' AND
--     field_key = 'is_reserved_fee_cover';
--   ALTER TABLE public.funds
--     DROP CONSTRAINT funds_tenant_entity_fee_cover_key,
--     DROP COLUMN is_reserved_fee_cover;
--   COMMIT;

BEGIN;
SET LOCAL lock_timeout = '5s';

LOCK TABLE public.legal_entities IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.funds IN ACCESS EXCLUSIVE MODE;
LOCK TABLE public.field_policies IN ROW EXCLUSIVE MODE;

DO $$
DECLARE
  v_inactive BIGINT;
  v_without BIGINT;
BEGIN
  SELECT pg_catalog.count(*)
    INTO v_inactive
    FROM public.funds AS f
   WHERE f.system_purpose = 'fee_cover'
     AND f.is_active IS NOT TRUE;

  SELECT pg_catalog.count(*)
    INTO v_without
    FROM public.legal_entities AS e
   WHERE NOT EXISTS (
     SELECT 1
       FROM public.funds AS f
      WHERE f.legal_entity_id = e.id
        AND f.system_purpose = 'fee_cover'
   );

  IF v_inactive > 0 THEN
    RAISE EXCEPTION 'fee_cover_fund_inactive'
      USING ERRCODE = '55000',
            DETAIL = pg_catalog.format('%s reserved fee-cover funds are not active; nothing was changed.', v_inactive);
  END IF;

  RAISE NOTICE 'fee_cover_backfill: % legal entities have no reserved fee-cover fund', v_without;
END
$$;

ALTER TABLE public.funds
  ADD COLUMN is_reserved_fee_cover BOOLEAN NOT NULL
    GENERATED ALWAYS AS (system_purpose IS NOT DISTINCT FROM 'fee_cover') STORED;

ALTER TABLE public.funds
  ADD CONSTRAINT funds_tenant_entity_fee_cover_key
    UNIQUE (tenant_id, id, legal_entity_id, is_reserved_fee_cover);

INSERT INTO public.funds (tenant_id, legal_entity_id, name, currency, system_purpose)
SELECT e.tenant_id, e.id, 'Fee cover', e.currency, 'fee_cover'
  FROM public.legal_entities AS e
 WHERE NOT EXISTS (
   SELECT 1
     FROM public.funds AS f
    WHERE f.legal_entity_id = e.id
      AND f.system_purpose = 'fee_cover'
 )
ON CONFLICT (legal_entity_id) WHERE system_purpose = 'fee_cover' DO NOTHING;

INSERT INTO public.field_policies (
  record_type,
  field_key,
  surface,
  visible,
  editable,
  exportable,
  sensitivity_category
)
SELECT
  'funds',
  'is_reserved_fee_cover',
  s.surface,
  s.surface = 'mission_control',
  false,
  false,
  'internal'::public.field_sensitivity_category
FROM unnest(
  ARRAY['mission_control', 'donor', 'missionary', 'public', 'export']
) AS s(surface);

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
