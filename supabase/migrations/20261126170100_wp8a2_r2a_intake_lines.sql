-- AL-2681 (WP8a part 2, R2a, M2; plan line 1137; index section 3.2, binding;
-- rulings W8-R20, Q-D (i) and Q-E; TP2 section 6 row 11): the lines of a
-- line-based intake, its four keys and its status rule. Nothing live writes a
-- line-based intake; every key, check and trigger here binds line-based rows
-- only.
--
-- 1. public.donations:
--    - four keys, valid at once: donations_tenant_entity_key (tenant, id,
--      entity), the lines' target; donations_staged_amount_key (tenant, id,
--      entity, amount, currency), the staged gift's; donations_payment_object_key
--      (tenant, id, account, mode, payment reference), the observations';
--      donations_account_amount_key (tenant, id, account, mode, amount,
--      currency), the provider request's;
--    - donations_line_status_check (pending, processing, completed or failed)
--      and donations_line_payment_method_check (NULL, card, ach or wallet),
--      each 'intake_format <> line_based OR (...) IS TRUE', NOT VALID then
--      validated;
--    - trigger donations_line_status (BEFORE UPDATE, line-based rows only; by
--      name after donations_intake_generation, before
--      donations_normalize_currency): a changed payment_method is 23514
--      donation_line_intake_sealed; a status move other than pending to
--      processing, completed or failed, processing to completed or failed, or
--      failed to processing or completed is 23514 donation_line_status_move.
--      Nothing leaves completed;
--    - tenant_guard gains SELECT (legal_entity_id, status, payment_method) and
--      UPDATE (status), behind R1a's tenant_guard_isolation policy.
-- 2. public.donation_intake_lines: ordered (line_number 1 to 100, one per
--    number), immutable (23514 donation_intake_lines_sealed on UPDATE or
--    DELETE, for every role), a fund or a missionary, at most one fee line,
--    on the entity's reserved fee-cover fund and nowhere else, every line of
--    its intake's tenant and entity (23503 otherwise). Constraint triggers,
--    deferred to commit, on the lines and on a line-based intake, run
--    private.donation_intake_lines_balance(): under the intake's lock, an
--    intake with no donor line, or whose lines do not sum to its amount, is
--    23514 donation_intake_lines_unbalanced. freeze_giving_target_entity
--    fixes each target's entity. Row security forced; nothing for PUBLIC,
--    anon, authenticated or service_role; tenant_guard SELECT of every column
--    behind tenant_guard_isolation. No INSERT grant: 2b's intake command
--    brings it.
--
-- Locks, all held to COMMIT, taken first and in this order: SHARE ROW
-- EXCLUSIVE on tenants, funds and missionaries (the new table's foreign
-- keys); ACCESS EXCLUSIVE on donations (36 rows hosted at census, 187 in the
-- seed). lock_timeout stops a run rather than queue it behind live traffic.
--
-- A second run of the applied file, as observed: it stops at its first
-- statement after the locks, ADD CONSTRAINT donations_tenant_entity_key
-- (42P07, its index already exists), and changes nothing. This file has
-- committed when this read-only check is true; it answers false, never an
-- error, when the table is absent:
--   SELECT to_regclass('public.donation_intake_lines') IS NOT NULL
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version.
--
-- Down, an operator's last resort, in one transaction, after the Down of
-- every later R2a file; it refuses while a line-based intake exists:
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   LOCK TABLE public.donations IN ACCESS EXCLUSIVE MODE;
--   DO $$
--   BEGIN
--     IF EXISTS (SELECT 1 FROM public.donations WHERE intake_format = 'line_based') THEN
--       RAISE EXCEPTION 'Down of the R2a intake lines refused: a line-based intake exists' USING ERRCODE = '55000';
--     END IF;
--   END
--   $$;
--   DROP TABLE public.donation_intake_lines;
--   DROP TRIGGER donations_intake_lines_balance ON public.donations;
--   DROP FUNCTION private.donation_intake_lines_sealed(),
--     private.donation_intake_lines_balance();
--   DROP TRIGGER donations_line_status ON public.donations;
--   DROP FUNCTION private.donations_line_status();
--   REVOKE SELECT (legal_entity_id, status, payment_method),
--     UPDATE (status) ON TABLE public.donations FROM tenant_guard;
--   ALTER TABLE public.donations
--     DROP CONSTRAINT donations_line_payment_method_check,
--     DROP CONSTRAINT donations_line_status_check,
--     DROP CONSTRAINT donations_account_amount_key,
--     DROP CONSTRAINT donations_payment_object_key,
--     DROP CONSTRAINT donations_staged_amount_key,
--     DROP CONSTRAINT donations_tenant_entity_key;
--   COMMIT;

BEGIN;
SET LOCAL lock_timeout = '5s';

LOCK TABLE public.tenants IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.funds IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.missionaries IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.donations IN ACCESS EXCLUSIVE MODE;

ALTER TABLE public.donations
  ADD CONSTRAINT donations_tenant_entity_key
    UNIQUE (tenant_id, id, legal_entity_id),
  ADD CONSTRAINT donations_staged_amount_key
    UNIQUE (tenant_id, id, legal_entity_id, amount, currency),
  ADD CONSTRAINT donations_payment_object_key
    UNIQUE (tenant_id, id, provider_account_ref, livemode, stripe_payment_intent_id),
  ADD CONSTRAINT donations_account_amount_key
    UNIQUE (tenant_id, id, provider_account_ref, livemode, amount, currency);

ALTER TABLE public.donations
  ADD CONSTRAINT donations_line_status_check
    CHECK (
      intake_format <> 'line_based'
      OR (status IN ('pending', 'processing', 'completed', 'failed')) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donations_line_payment_method_check
    CHECK (
      intake_format <> 'line_based'
      OR (payment_method IS NULL OR payment_method IN ('card', 'ach', 'wallet')) IS TRUE
    ) NOT VALID;

ALTER TABLE public.donations VALIDATE CONSTRAINT donations_line_status_check;
ALTER TABLE public.donations VALIDATE CONSTRAINT donations_line_payment_method_check;

CREATE FUNCTION private.donations_line_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF (NEW.payment_method IS NOT DISTINCT FROM OLD.payment_method) IS NOT TRUE THEN
    RAISE EXCEPTION 'donation_line_intake_sealed'
      USING ERRCODE = '23514',
            DETAIL = 'A line-based intake keeps its payment method.';
  END IF;

  IF (NEW.status IS NOT DISTINCT FROM OLD.status
      OR (OLD.status = 'pending' AND NEW.status IN ('processing', 'completed', 'failed'))
      OR (OLD.status = 'processing' AND NEW.status IN ('completed', 'failed'))
      OR (OLD.status = 'failed' AND NEW.status IN ('processing', 'completed'))) IS NOT TRUE THEN
    RAISE EXCEPTION 'donation_line_status_move'
      USING ERRCODE = '23514',
            DETAIL = pg_catalog.format('A line-based intake does not move from %s to %s.', OLD.status, NEW.status);
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.donations_line_status()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER donations_line_status
  BEFORE UPDATE ON public.donations
  FOR EACH ROW
  WHEN (OLD.intake_format = 'line_based')
  EXECUTE FUNCTION private.donations_line_status();

GRANT SELECT (legal_entity_id, status, payment_method)
  ON TABLE public.donations TO tenant_guard;
GRANT UPDATE (status) ON TABLE public.donations TO tenant_guard;

CREATE TABLE public.donation_intake_lines (
  id UUID PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  donation_id UUID NOT NULL,
  legal_entity_id UUID NOT NULL,
  line_number INTEGER NOT NULL
    CONSTRAINT donation_intake_lines_line_number_check CHECK (line_number BETWEEN 1 AND 100),
  fund_id UUID,
  missionary_id UUID,
  is_fee_cover BOOLEAN NOT NULL,
  amount BIGINT NOT NULL
    CONSTRAINT donation_intake_lines_amount_check CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT donation_intake_lines_line_key
    UNIQUE (tenant_id, donation_id, line_number),
  CONSTRAINT donation_intake_lines_one_target_check
    CHECK (num_nonnulls(fund_id, missionary_id) = 1),
  CONSTRAINT donation_intake_lines_fee_fund_check
    CHECK (NOT is_fee_cover OR fund_id IS NOT NULL),
  CONSTRAINT donation_intake_lines_intake_fk
    FOREIGN KEY (tenant_id, donation_id, legal_entity_id)
    REFERENCES public.donations (tenant_id, id, legal_entity_id)
    ON DELETE RESTRICT,
  CONSTRAINT donation_intake_lines_fund_fk
    FOREIGN KEY (tenant_id, fund_id, legal_entity_id, is_fee_cover)
    REFERENCES public.funds (tenant_id, id, legal_entity_id, is_reserved_fee_cover)
    ON DELETE RESTRICT,
  CONSTRAINT donation_intake_lines_missionary_fk
    FOREIGN KEY (tenant_id, missionary_id, legal_entity_id)
    REFERENCES public.missionaries (tenant_id, id, legal_entity_id)
    ON DELETE RESTRICT
);

CREATE UNIQUE INDEX donation_intake_lines_one_fee_line
  ON public.donation_intake_lines (donation_id)
  WHERE is_fee_cover;

CREATE FUNCTION private.donation_intake_lines_sealed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'donation_intake_lines_sealed'
    USING ERRCODE = '23514',
          DETAIL = 'An intake line is never changed or deleted.';
END;
$$;

REVOKE ALL ON FUNCTION private.donation_intake_lines_sealed()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER donation_intake_lines_sealed
  BEFORE UPDATE OR DELETE ON public.donation_intake_lines
  FOR EACH ROW
  EXECUTE FUNCTION private.donation_intake_lines_sealed();

CREATE TRIGGER freeze_giving_target_entity
  AFTER INSERT ON public.donation_intake_lines
  FOR EACH ROW
  EXECUTE FUNCTION private.freeze_giving_target_entity();

CREATE FUNCTION private.donation_intake_lines_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_donation_id UUID;
  v_tenant_id UUID;
  v_amount BIGINT;
  v_found BOOLEAN;
  v_donor_lines BIGINT;
  v_sum NUMERIC;
BEGIN
  IF TG_TABLE_NAME = 'donations' THEN
    v_donation_id := NEW.id;
  ELSE
    v_donation_id := NEW.donation_id;
  END IF;

  SELECT d.tenant_id, d.amount
    INTO v_tenant_id, v_amount
    FROM public.donations AS d
   WHERE d.id = v_donation_id
     AND d.intake_format = 'line_based'
     FOR NO KEY UPDATE;
  v_found := FOUND;

  IF NOT v_found THEN
    RETURN NULL;
  END IF;

  SELECT pg_catalog.count(*) FILTER (WHERE NOT l.is_fee_cover),
         COALESCE(pg_catalog.sum(l.amount), 0)
    INTO v_donor_lines, v_sum
    FROM public.donation_intake_lines AS l
   WHERE l.tenant_id = v_tenant_id
     AND l.donation_id = v_donation_id;

  IF (v_donor_lines > 0 AND v_sum = v_amount) IS NOT TRUE THEN
    RAISE EXCEPTION 'donation_intake_lines_unbalanced'
      USING ERRCODE = '23514',
            DETAIL = pg_catalog.format(
              'Intake %s of amount %s has %s donor lines, and its lines sum to %s.',
              v_donation_id, v_amount, v_donor_lines, v_sum
            );
  END IF;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION private.donation_intake_lines_balance()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE CONSTRAINT TRIGGER donation_intake_lines_balance
  AFTER INSERT ON public.donation_intake_lines
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION private.donation_intake_lines_balance();

CREATE CONSTRAINT TRIGGER donations_intake_lines_balance
  AFTER INSERT ON public.donations
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  WHEN (NEW.intake_format = 'line_based')
  EXECUTE FUNCTION private.donation_intake_lines_balance();

ALTER TABLE public.donation_intake_lines
  ENABLE ROW LEVEL SECURITY,
  FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.donation_intake_lines
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.donation_intake_lines TO tenant_guard;

CREATE POLICY tenant_guard_isolation
  ON public.donation_intake_lines
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
