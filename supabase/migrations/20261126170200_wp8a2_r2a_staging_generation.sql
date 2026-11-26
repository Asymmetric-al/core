-- AL-2681 (WP8a part 2, R2a, M3; plan line 1137; index section 3.3, binding;
-- rulings W8-R14 and W8-R20): the staging generation. A line-based intake is
-- staged as one gift with one allocation per line; a legacy one as today.
-- Legacy rows keep every new column NULL, are stamped 'legacy_header', and
-- meet no new rule.
--
-- 1. public.staged_gifts: intake_format text NOT NULL ('legacy_header' or
--    'line_based'; added with the default 'legacy_header' for the existing
--    rows, the default then dropped) and legal_entity_id; checks (the
--    format's domain; a line-based gift names its entity and no fund,
--    missionary or legacy raw event; a legacy one names no entity), NOT VALID
--    then validated; staged_gifts_tenant_entity_key (tenant, id, entity), the
--    allocations' target; staged_gifts_intake_fk (tenant, donation, entity,
--    amount, currency) to donations_staged_amount_key, NOT VALID then
--    validated. Trigger staged_gifts_generation (BEFORE INSERT OR UPDATE OR
--    DELETE; by name before staged_gifts_normalize_currency): an insert takes
--    its intake's format, read as the inserting role, and is 42501
--    staged_gift_generation_owner when that intake is invisible, line-based
--    and the role is not tenant_guard, legacy and the role is tenant_guard, or
--    the supplied format differs; a changed format, or on a line-based gift a
--    changed tenant, intake, entity, amount or currency, is 23514; a
--    line-based gift is never deleted (23514).
-- 2. public.staged_gift_allocations: intake_format, legal_entity_id,
--    line_number (1 to 100) and is_fee_cover; checks (legacy: the three new
--    columns NULL; line-based: all set, one target, a fee line on a fund, a
--    positive amount, never initial), NOT VALID then validated; UNIQUE
--    (tenant, gift, line); one fee allocation per gift; keys to the gift's
--    entity, to the fund with the fee flag (funds_tenant_entity_fee_cover_key)
--    and to the missionary's entity, NOT VALID then validated, beside the
--    same-tenant keys of 20261120130004, which stay for legacy rows. Trigger
--    staged_gift_allocations_generation (BEFORE INSERT OR UPDATE): an insert
--    takes its gift's format, read as the inserting role, and is 42501
--    staged_gift_allocation_generation_owner when the gift is invisible or
--    the supplied format differs; on a line-based allocation the tenant,
--    gift, format, entity, line number and fee flag never change (23514);
--    an update that moves any other allocation to another gift or
--    organization reads the destination gift the same way and is 42501
--    unless that gift is visible, of the allocation's organization and of its
--    format, so no allocation crosses generations. A donor allocation's
--    amount and target, and its deletion, stay open to review (W8-R14) under
--    the balance rule below.
-- 3. Balance, deferred to commit: constraint triggers on a line-based gift
--    (AFTER INSERT) and on its allocations (AFTER INSERT OR UPDATE, AFTER
--    DELETE) run private.staged_gift_allocations_balance(): under the gift's
--    lock, 23514 staged_gift_allocations_unbalanced unless it has a donor
--    allocation, its allocations sum to its amount, and its fee allocations
--    equal its intake's fee line (none, or one with the same fund and amount).
-- 4. tenant_guard: SELECT and INSERT of named columns on both tables behind a
--    tenant_guard_isolation policy that admits line-based rows of the entered
--    tenant only; EXECUTE on public.normalize_currency_code(text), which the
--    currency triggers on donations and staged_gifts call as the inserting
--    role (index section 3.3).
--
-- Locks, all held to COMMIT, taken first and in this order: SHARE ROW
-- EXCLUSIVE on donations, funds and missionaries (the new keys' targets);
-- ACCESS EXCLUSIVE on staged_gifts and staged_gift_allocations (0 rows each
-- in the seed; the hosted counts are read before the release, index 3.1).
-- lock_timeout stops a run rather than queue it behind live traffic.
--
-- A second run of the applied file, as observed: it stops at its first
-- statement after the locks, ADD COLUMN intake_format on staged_gifts (42701,
-- column already exists), and changes nothing. This file has committed when
-- this read-only check is true; it answers false, never an error, when the
-- table or the column is absent:
--   SELECT EXISTS (SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid =
--   to_regclass('public.staged_gift_allocations') AND attname = 'line_number'
--   AND NOT attisdropped)
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version.
--
-- Down, an operator's last resort, in one transaction, after the Down of
-- every later R2a file; it refuses while a line-based staged gift exists:
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   LOCK TABLE public.staged_gifts, public.staged_gift_allocations IN ACCESS EXCLUSIVE MODE;
--   DO $$
--   BEGIN
--     IF EXISTS (SELECT 1 FROM public.staged_gifts WHERE intake_format = 'line_based') THEN
--       RAISE EXCEPTION 'Down of the R2a staging generation refused: a line-based staged gift exists' USING ERRCODE = '55000';
--     END IF;
--   END
--   $$;
--   REVOKE EXECUTE ON FUNCTION public.normalize_currency_code(text) FROM tenant_guard;
--   DROP POLICY tenant_guard_isolation ON public.staged_gift_allocations;
--   DROP POLICY tenant_guard_isolation ON public.staged_gifts;
--   REVOKE ALL ON TABLE public.staged_gift_allocations, public.staged_gifts FROM tenant_guard;
--   DROP TRIGGER staged_gift_allocations_balance ON public.staged_gift_allocations;
--   DROP TRIGGER staged_gift_allocations_delete_balance ON public.staged_gift_allocations;
--   DROP TRIGGER staged_gifts_allocations_balance ON public.staged_gifts;
--   DROP FUNCTION private.staged_gift_allocations_balance();
--   DROP TRIGGER staged_gift_allocations_generation ON public.staged_gift_allocations;
--   DROP FUNCTION private.staged_gift_allocations_generation();
--   DROP TRIGGER staged_gifts_generation ON public.staged_gifts;
--   DROP FUNCTION private.staged_gifts_generation();
--   DROP INDEX public.staged_gift_allocations_one_fee_line;
--   ALTER TABLE public.staged_gift_allocations
--     DROP CONSTRAINT staged_gift_allocations_missionary_entity_fk,
--     DROP CONSTRAINT staged_gift_allocations_fund_fee_fk,
--     DROP CONSTRAINT staged_gift_allocations_gift_entity_fk,
--     DROP CONSTRAINT staged_gift_allocations_line_key,
--     DROP CONSTRAINT staged_gift_allocations_line_based_check,
--     DROP CONSTRAINT staged_gift_allocations_legacy_header_check,
--     DROP CONSTRAINT staged_gift_allocations_intake_format_check,
--     DROP COLUMN intake_format, DROP COLUMN legal_entity_id,
--     DROP COLUMN line_number, DROP COLUMN is_fee_cover;
--   ALTER TABLE public.staged_gifts
--     DROP CONSTRAINT staged_gifts_intake_fk,
--     DROP CONSTRAINT staged_gifts_tenant_entity_key,
--     DROP CONSTRAINT staged_gifts_line_based_check,
--     DROP CONSTRAINT staged_gifts_legacy_header_check,
--     DROP CONSTRAINT staged_gifts_intake_format_check,
--     DROP COLUMN intake_format, DROP COLUMN legal_entity_id;
--   COMMIT;

BEGIN;
SET LOCAL lock_timeout = '5s';

LOCK TABLE public.donations IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.funds IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.missionaries IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.staged_gifts IN ACCESS EXCLUSIVE MODE;
LOCK TABLE public.staged_gift_allocations IN ACCESS EXCLUSIVE MODE;

ALTER TABLE public.staged_gifts
  ADD COLUMN intake_format TEXT NOT NULL DEFAULT 'legacy_header',
  ADD COLUMN legal_entity_id UUID;

ALTER TABLE public.staged_gifts
  ALTER COLUMN intake_format DROP DEFAULT;

ALTER TABLE public.staged_gift_allocations
  ADD COLUMN intake_format TEXT NOT NULL DEFAULT 'legacy_header',
  ADD COLUMN legal_entity_id UUID,
  ADD COLUMN line_number INTEGER,
  ADD COLUMN is_fee_cover BOOLEAN;

ALTER TABLE public.staged_gift_allocations
  ALTER COLUMN intake_format DROP DEFAULT;

ALTER TABLE public.staged_gifts
  ADD CONSTRAINT staged_gifts_intake_format_check
    CHECK (intake_format IN ('legacy_header', 'line_based')) NOT VALID,
  ADD CONSTRAINT staged_gifts_line_based_check
    CHECK (
      intake_format <> 'line_based'
      OR (
        legal_entity_id IS NOT NULL
        AND fund_id IS NULL
        AND missionary_id IS NULL
        AND stripe_raw_event_id IS NULL
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT staged_gifts_legacy_header_check
    CHECK (intake_format <> 'legacy_header' OR (legal_entity_id IS NULL) IS TRUE) NOT VALID,
  ADD CONSTRAINT staged_gifts_tenant_entity_key
    UNIQUE (tenant_id, id, legal_entity_id),
  ADD CONSTRAINT staged_gifts_intake_fk
    FOREIGN KEY (tenant_id, donation_id, legal_entity_id, amount, currency)
    REFERENCES public.donations (tenant_id, id, legal_entity_id, amount, currency)
    ON DELETE RESTRICT
    NOT VALID;

ALTER TABLE public.staged_gifts VALIDATE CONSTRAINT staged_gifts_intake_format_check;
ALTER TABLE public.staged_gifts VALIDATE CONSTRAINT staged_gifts_line_based_check;
ALTER TABLE public.staged_gifts VALIDATE CONSTRAINT staged_gifts_legacy_header_check;
ALTER TABLE public.staged_gifts VALIDATE CONSTRAINT staged_gifts_intake_fk;

ALTER TABLE public.staged_gift_allocations
  ADD CONSTRAINT staged_gift_allocations_line_number_check
    CHECK (line_number BETWEEN 1 AND 100) NOT VALID,
  ADD CONSTRAINT staged_gift_allocations_intake_format_check
    CHECK (intake_format IN ('legacy_header', 'line_based')) NOT VALID,
  ADD CONSTRAINT staged_gift_allocations_legacy_header_check
    CHECK (
      intake_format <> 'legacy_header'
      OR (
        legal_entity_id IS NULL
        AND line_number IS NULL
        AND is_fee_cover IS NULL
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT staged_gift_allocations_line_based_check
    CHECK (
      intake_format <> 'line_based'
      OR (
        legal_entity_id IS NOT NULL
        AND line_number IS NOT NULL
        AND is_fee_cover IS NOT NULL
        AND num_nonnulls(fund_id, missionary_id) = 1
        AND (NOT is_fee_cover OR fund_id IS NOT NULL)
        AND amount > 0
        AND NOT is_initial
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT staged_gift_allocations_line_key
    UNIQUE (tenant_id, staged_gift_id, line_number),
  ADD CONSTRAINT staged_gift_allocations_gift_entity_fk
    FOREIGN KEY (tenant_id, staged_gift_id, legal_entity_id)
    REFERENCES public.staged_gifts (tenant_id, id, legal_entity_id)
    ON DELETE RESTRICT
    NOT VALID,
  ADD CONSTRAINT staged_gift_allocations_fund_fee_fk
    FOREIGN KEY (tenant_id, fund_id, legal_entity_id, is_fee_cover)
    REFERENCES public.funds (tenant_id, id, legal_entity_id, is_reserved_fee_cover)
    ON DELETE RESTRICT
    NOT VALID,
  ADD CONSTRAINT staged_gift_allocations_missionary_entity_fk
    FOREIGN KEY (tenant_id, missionary_id, legal_entity_id)
    REFERENCES public.missionaries (tenant_id, id, legal_entity_id)
    ON DELETE RESTRICT
    NOT VALID;

ALTER TABLE public.staged_gift_allocations VALIDATE CONSTRAINT staged_gift_allocations_line_number_check;
ALTER TABLE public.staged_gift_allocations VALIDATE CONSTRAINT staged_gift_allocations_intake_format_check;
ALTER TABLE public.staged_gift_allocations VALIDATE CONSTRAINT staged_gift_allocations_legacy_header_check;
ALTER TABLE public.staged_gift_allocations VALIDATE CONSTRAINT staged_gift_allocations_line_based_check;
ALTER TABLE public.staged_gift_allocations VALIDATE CONSTRAINT staged_gift_allocations_gift_entity_fk;
ALTER TABLE public.staged_gift_allocations VALIDATE CONSTRAINT staged_gift_allocations_fund_fee_fk;
ALTER TABLE public.staged_gift_allocations VALIDATE CONSTRAINT staged_gift_allocations_missionary_entity_fk;

CREATE UNIQUE INDEX staged_gift_allocations_one_fee_line
  ON public.staged_gift_allocations (staged_gift_id)
  WHERE is_fee_cover;

CREATE FUNCTION private.staged_gifts_generation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_format TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT d.intake_format
      INTO v_format
      FROM public.donations AS d
     WHERE d.id = NEW.donation_id;

    IF (v_format IS NOT NULL
        AND (v_format = 'line_based') = (current_user = 'tenant_guard')
        AND (NEW.intake_format IS NULL OR NEW.intake_format = v_format)) IS NOT TRUE THEN
      RAISE EXCEPTION 'staged_gift_generation_owner'
        USING ERRCODE = '42501',
              DETAIL = pg_catalog.format(
                '%s may stage only the intakes it may see of its own generation (intake format %s, supplied %s).',
                current_user, COALESCE(v_format, 'unseen'), COALESCE(NEW.intake_format, 'none')
              );
    END IF;

    NEW.intake_format := v_format;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF (OLD.intake_format <> 'line_based') IS NOT TRUE THEN
      RAISE EXCEPTION 'staged_gift_line_sealed'
        USING ERRCODE = '23514',
              DETAIL = 'A line-based staged gift is never deleted.';
    END IF;
    RETURN OLD;
  END IF;

  IF (NEW.intake_format = OLD.intake_format) IS NOT TRUE THEN
    RAISE EXCEPTION 'staged_gift_generation_frozen'
      USING ERRCODE = '23514',
            DETAIL = 'A staged gift keeps the format it was created with.';
  END IF;

  IF OLD.intake_format = 'line_based'
     AND (NEW.tenant_id IS NOT DISTINCT FROM OLD.tenant_id
          AND NEW.donation_id IS NOT DISTINCT FROM OLD.donation_id
          AND NEW.legal_entity_id IS NOT DISTINCT FROM OLD.legal_entity_id
          AND NEW.amount IS NOT DISTINCT FROM OLD.amount
          AND NEW.currency IS NOT DISTINCT FROM OLD.currency) IS NOT TRUE THEN
    RAISE EXCEPTION 'staged_gift_line_sealed'
      USING ERRCODE = '23514',
            DETAIL = 'A line-based staged gift keeps its tenant, intake, entity, amount and currency.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.staged_gifts_generation()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER staged_gifts_generation
  BEFORE INSERT OR UPDATE OR DELETE ON public.staged_gifts
  FOR EACH ROW
  EXECUTE FUNCTION private.staged_gifts_generation();

CREATE FUNCTION private.staged_gift_allocations_generation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_format TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT g.intake_format
      INTO v_format
      FROM public.staged_gifts AS g
     WHERE g.id = NEW.staged_gift_id
       AND g.tenant_id = NEW.tenant_id;

    IF (v_format IS NOT NULL
        AND (NEW.intake_format IS NULL OR NEW.intake_format = v_format)) IS NOT TRUE THEN
      RAISE EXCEPTION 'staged_gift_allocation_generation_owner'
        USING ERRCODE = '42501',
              DETAIL = pg_catalog.format(
                '%s may allocate only a staged gift it may see, in that gift''s format (gift format %s, supplied %s).',
                current_user, COALESCE(v_format, 'unseen'), COALESCE(NEW.intake_format, 'none')
              );
    END IF;

    NEW.intake_format := v_format;
    RETURN NEW;
  END IF;

  IF (NEW.intake_format = OLD.intake_format) IS NOT TRUE THEN
    RAISE EXCEPTION 'staged_gift_allocation_generation_frozen'
      USING ERRCODE = '23514',
            DETAIL = 'An allocation keeps the format it was created with.';
  END IF;

  IF OLD.intake_format = 'line_based'
     AND (NEW.tenant_id IS NOT DISTINCT FROM OLD.tenant_id
          AND NEW.staged_gift_id IS NOT DISTINCT FROM OLD.staged_gift_id
          AND NEW.legal_entity_id IS NOT DISTINCT FROM OLD.legal_entity_id
          AND NEW.line_number IS NOT DISTINCT FROM OLD.line_number
          AND NEW.is_fee_cover IS NOT DISTINCT FROM OLD.is_fee_cover) IS NOT TRUE THEN
    RAISE EXCEPTION 'staged_gift_allocation_line_sealed'
      USING ERRCODE = '23514',
            DETAIL = 'A line-based allocation keeps its tenant, gift, format, entity, line number and fee flag.';
  END IF;

  IF (NEW.staged_gift_id IS NOT DISTINCT FROM OLD.staged_gift_id
      AND NEW.tenant_id IS NOT DISTINCT FROM OLD.tenant_id) IS NOT TRUE THEN
    SELECT g.intake_format
      INTO v_format
      FROM public.staged_gifts AS g
     WHERE g.id = NEW.staged_gift_id
       AND g.tenant_id = NEW.tenant_id;

    IF (v_format IS NOT NULL AND v_format = NEW.intake_format) IS NOT TRUE THEN
      RAISE EXCEPTION 'staged_gift_allocation_generation_owner'
        USING ERRCODE = '42501',
              DETAIL = pg_catalog.format(
                '%s may move an allocation only to a staged gift it may see, of its organization and its format (gift format %s, allocation %s).',
                current_user, COALESCE(v_format, 'unseen'), NEW.intake_format
              );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.staged_gift_allocations_generation()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER staged_gift_allocations_generation
  BEFORE INSERT OR UPDATE ON public.staged_gift_allocations
  FOR EACH ROW
  EXECUTE FUNCTION private.staged_gift_allocations_generation();

CREATE FUNCTION private.staged_gift_allocations_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_gift_id UUID;
  v_gift RECORD;
  v_found BOOLEAN;
  v_donor_allocations BIGINT;
  v_sum NUMERIC;
  v_fee_allocations BIGINT;
  v_fee_fund UUID;
  v_fee_amount BIGINT;
  v_line_fund UUID;
  v_line_amount BIGINT;
  v_line_found BOOLEAN;
BEGIN
  IF TG_TABLE_NAME = 'staged_gifts' THEN
    v_gift_id := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    v_gift_id := OLD.staged_gift_id;
  ELSE
    v_gift_id := NEW.staged_gift_id;
  END IF;

  SELECT g.id, g.tenant_id, g.donation_id, g.amount
    INTO v_gift
    FROM public.staged_gifts AS g
   WHERE g.id = v_gift_id
     AND g.intake_format = 'line_based'
     FOR NO KEY UPDATE;
  v_found := FOUND;

  IF NOT v_found THEN
    RETURN NULL;
  END IF;

  SELECT pg_catalog.count(*) FILTER (WHERE NOT a.is_fee_cover),
         COALESCE(pg_catalog.sum(a.amount), 0),
         pg_catalog.count(*) FILTER (WHERE a.is_fee_cover),
         (pg_catalog.min(a.fund_id::TEXT) FILTER (WHERE a.is_fee_cover))::UUID,
         pg_catalog.min(a.amount) FILTER (WHERE a.is_fee_cover)
    INTO v_donor_allocations, v_sum, v_fee_allocations, v_fee_fund, v_fee_amount
    FROM public.staged_gift_allocations AS a
   WHERE a.tenant_id = v_gift.tenant_id
     AND a.staged_gift_id = v_gift.id;

  SELECT l.fund_id, l.amount
    INTO v_line_fund, v_line_amount
    FROM public.donation_intake_lines AS l
   WHERE l.tenant_id = v_gift.tenant_id
     AND l.donation_id = v_gift.donation_id
     AND l.is_fee_cover;
  v_line_found := FOUND;

  IF (v_donor_allocations > 0
      AND v_sum = v_gift.amount
      AND CASE
            WHEN v_line_found THEN v_fee_allocations = 1
                                   AND v_fee_fund = v_line_fund
                                   AND v_fee_amount = v_line_amount
            ELSE v_fee_allocations = 0
          END) IS NOT TRUE THEN
    RAISE EXCEPTION 'staged_gift_allocations_unbalanced'
      USING ERRCODE = '23514',
            DETAIL = pg_catalog.format(
              'Staged gift %s of amount %s has %s donor allocations and %s fee allocations, summing to %s; its intake has %s fee line.',
              v_gift.id, v_gift.amount, v_donor_allocations, v_fee_allocations, v_sum,
              CASE WHEN v_line_found THEN 'one' ELSE 'no' END
            );
  END IF;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION private.staged_gift_allocations_balance()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE CONSTRAINT TRIGGER staged_gifts_allocations_balance
  AFTER INSERT ON public.staged_gifts
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  WHEN (NEW.intake_format = 'line_based')
  EXECUTE FUNCTION private.staged_gift_allocations_balance();

CREATE CONSTRAINT TRIGGER staged_gift_allocations_balance
  AFTER INSERT OR UPDATE ON public.staged_gift_allocations
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  WHEN (NEW.intake_format = 'line_based')
  EXECUTE FUNCTION private.staged_gift_allocations_balance();

CREATE CONSTRAINT TRIGGER staged_gift_allocations_delete_balance
  AFTER DELETE ON public.staged_gift_allocations
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  WHEN (OLD.intake_format = 'line_based')
  EXECUTE FUNCTION private.staged_gift_allocations_balance();

GRANT SELECT (id, tenant_id, donation_id, legal_entity_id, intake_format, amount, currency, status)
  ON TABLE public.staged_gifts TO tenant_guard;
GRANT INSERT (
  tenant_id,
  donation_id,
  legal_entity_id,
  amount,
  currency,
  status,
  donor_match_status,
  allocation_status,
  review_reason,
  stripe_payment_intent_id,
  stripe_event_id
) ON TABLE public.staged_gifts TO tenant_guard;

GRANT SELECT (
  id,
  tenant_id,
  staged_gift_id,
  legal_entity_id,
  intake_format,
  line_number,
  fund_id,
  missionary_id,
  is_fee_cover,
  amount
) ON TABLE public.staged_gift_allocations TO tenant_guard;
GRANT INSERT (
  tenant_id,
  staged_gift_id,
  legal_entity_id,
  line_number,
  fund_id,
  missionary_id,
  is_fee_cover,
  amount
) ON TABLE public.staged_gift_allocations TO tenant_guard;

CREATE POLICY tenant_guard_isolation
  ON public.staged_gifts
  FOR ALL
  TO tenant_guard
  USING (
    tenant_id = (SELECT tenant_guard.current_tenant_id())
    AND intake_format = 'line_based'
  )
  WITH CHECK (
    tenant_id = (SELECT tenant_guard.current_tenant_id())
    AND intake_format = 'line_based'
  );

CREATE POLICY tenant_guard_isolation
  ON public.staged_gift_allocations
  FOR ALL
  TO tenant_guard
  USING (
    tenant_id = (SELECT tenant_guard.current_tenant_id())
    AND intake_format = 'line_based'
  )
  WITH CHECK (
    tenant_id = (SELECT tenant_guard.current_tenant_id())
    AND intake_format = 'line_based'
  );

GRANT EXECUTE ON FUNCTION public.normalize_currency_code(text) TO tenant_guard;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
