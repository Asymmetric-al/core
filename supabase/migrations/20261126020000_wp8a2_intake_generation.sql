-- AL-2681 (WP8a part 2, R1a; plan lines 1154 and 1173; index section 10,
-- binding; TP4 sections 6 and 9; ruling W8-R21): the intake generation on
-- public.donations. Nothing live writes a line-based row; every existing row
-- and every row a live writer inserts stays a legacy header.
--
-- 1. intake_format text NOT NULL ('legacy_header' or 'line_based'), added with
--    the default 'legacy_header' for the existing rows, the default then
--    dropped; legal_entity_id, payment_account_binding_id,
--    provider_account_ref and livemode, nullable, set on line-based rows only.
-- 2. Trigger donations_intake_generation (BEFORE INSERT OR UPDATE OR DELETE;
--    its name sorts before donations_normalize_currency, so it sees the
--    currency as sent). An insert is stamped 'line_based' when current_user
--    is tenant_guard and 'legacy_header' otherwise; a supplied marker that
--    differs is refused (42501). A line-based insert whose currency is not
--    three lower-case ASCII letters, or that names a donor, a payment
--    reference or a charge, is refused (23514). The marker never changes
--    (23514). On a line-based row, for every role: tenant, amount, currency,
--    fund, missionary and the four new columns never change, a recorded
--    payment reference never changes, and the row is never deleted (23514).
--    status and donor_id stay writable. Legacy rows pass unchanged.
-- 3. Checks, each NOT VALID then validated: the marker's domain; a line-based
--    row carries its tenant, entity, binding, account and mode, a positive
--    amount, no header target, an account 'acct_...' and a reference
--    'pi_...' or none; a legacy row has the four new columns NULL.
-- 4. Keys: payment_account_bindings_frozen_key (tenant, id, entity, account,
--    mode); donations_account_key (tenant, id, account, mode); one payment
--    reference per account and mode among line-based rows. Foreign keys
--    donations_frozen_binding_fk (the five columns) and
--    donations_entity_currency_fk (tenant, entity, currency), each NOT VALID
--    then validated. Legacy rows hold NULLs and are skipped (MATCH SIMPLE).
-- 5. tenant_guard: SELECT of nine columns and UPDATE of the payment reference
--    and updated_at, behind a tenant_guard_isolation policy that admits
--    line-based rows of the entered tenant only. No role gains EXECUTE on
--    public.normalize_currency_code(text): a later part decides it before the
--    first real line-based insert.
-- 6. field_policies rows for the five new columns (manifest).
--
-- Locks, all held to COMMIT, taken first and in this order: SHARE ROW
-- EXCLUSIVE on legal_entities (the new foreign key's target), ACCESS
-- EXCLUSIVE on payment_account_bindings (its new key) and on donations (36
-- rows hosted, census line 115); ROW EXCLUSIVE on field_policies for its new
-- rows. lock_timeout stops a run rather than queue it behind live traffic.
--
-- Recovery. Nothing here is written to run twice: a run lost between its
-- COMMIT and its ledger row stops on the next run at its first ADD COLUMN
-- (42701). This file has committed when this read-only check is true:
-- SELECT EXISTS (SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid =
-- 'public.donations'::regclass AND attname = 'intake_format' AND NOT
-- attisdropped). Then follow docs/ops/release-job.md, "If the migration
-- committed but its ledger row is missing", with this check and this file's
-- version, 20261126020000. It has no preflight or post-assert of its own.
--
-- Down (in one transaction, after 20261126020100 is reverted):
--   DELETE FROM public.field_policies WHERE record_type = 'donations' AND
--     field_key IN ('intake_format', 'legal_entity_id',
--     'payment_account_binding_id', 'provider_account_ref', 'livemode');
--   DROP POLICY tenant_guard_isolation ON public.donations;
--   REVOKE ALL ON TABLE public.donations FROM tenant_guard;
--   DROP TRIGGER donations_intake_generation ON public.donations;
--   DROP FUNCTION private.donations_intake_generation();
--   ALTER TABLE public.donations DROP CONSTRAINT donations_frozen_binding_fk,
--     DROP CONSTRAINT donations_entity_currency_fk,
--     DROP CONSTRAINT donations_account_key,
--     DROP COLUMN intake_format, DROP COLUMN legal_entity_id,
--     DROP COLUMN payment_account_binding_id,
--     DROP COLUMN provider_account_ref, DROP COLUMN livemode;
--   ALTER TABLE public.payment_account_bindings
--     DROP CONSTRAINT payment_account_bindings_frozen_key;

BEGIN;
SET LOCAL lock_timeout = '5s';

LOCK TABLE public.legal_entities IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.payment_account_bindings IN ACCESS EXCLUSIVE MODE;
LOCK TABLE public.donations IN ACCESS EXCLUSIVE MODE;

ALTER TABLE public.payment_account_bindings
  ADD CONSTRAINT payment_account_bindings_frozen_key
    UNIQUE (tenant_id, id, legal_entity_id, provider_account_ref, livemode);

ALTER TABLE public.donations
  ADD COLUMN intake_format TEXT NOT NULL DEFAULT 'legacy_header',
  ADD COLUMN legal_entity_id UUID,
  ADD COLUMN payment_account_binding_id UUID,
  ADD COLUMN provider_account_ref TEXT,
  ADD COLUMN livemode BOOLEAN;

ALTER TABLE public.donations
  ALTER COLUMN intake_format DROP DEFAULT;

CREATE FUNCTION private.donations_intake_generation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_format TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_format := CASE WHEN current_user = 'tenant_guard' THEN 'line_based' ELSE 'legacy_header' END;
    IF NEW.intake_format IS NULL THEN
      NEW.intake_format := v_format;
    END IF;
    IF (NEW.intake_format = v_format) IS NOT TRUE THEN
      RAISE EXCEPTION 'donation_intake_format_mismatch'
        USING ERRCODE = '42501',
              DETAIL = pg_catalog.format('%s may insert only %s intakes', current_user, v_format);
    END IF;
    IF NEW.intake_format = 'line_based' THEN
      IF (NEW.currency ~ '^[a-z]{3}$') IS NOT TRUE THEN
        RAISE EXCEPTION 'donation_line_intake_invalid'
          USING ERRCODE = '23514',
                DETAIL = 'A line-based intake names its currency as three lower-case letters.';
      END IF;
      IF (NEW.donor_id IS NULL
          AND NEW.stripe_payment_intent_id IS NULL
          AND NEW.stripe_charge_id IS NULL) IS NOT TRUE THEN
        RAISE EXCEPTION 'donation_line_intake_invalid'
          USING ERRCODE = '23514',
                DETAIL = 'A line-based intake is created with no donor, payment reference or charge.';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF (OLD.intake_format <> 'line_based') IS NOT TRUE THEN
      RAISE EXCEPTION 'donation_line_intake_sealed'
        USING ERRCODE = '23514',
              DETAIL = 'A line-based intake is never deleted.';
    END IF;
    RETURN OLD;
  END IF;

  IF (NEW.intake_format = OLD.intake_format) IS NOT TRUE THEN
    RAISE EXCEPTION 'donation_intake_format_frozen'
      USING ERRCODE = '23514',
            DETAIL = 'An intake keeps the format it was created with.';
  END IF;

  IF OLD.intake_format = 'line_based' THEN
    IF (NEW.tenant_id IS NOT DISTINCT FROM OLD.tenant_id
        AND NEW.amount IS NOT DISTINCT FROM OLD.amount
        AND NEW.currency IS NOT DISTINCT FROM OLD.currency
        AND NEW.fund_id IS NOT DISTINCT FROM OLD.fund_id
        AND NEW.missionary_id IS NOT DISTINCT FROM OLD.missionary_id
        AND NEW.legal_entity_id IS NOT DISTINCT FROM OLD.legal_entity_id
        AND NEW.payment_account_binding_id IS NOT DISTINCT FROM OLD.payment_account_binding_id
        AND NEW.provider_account_ref IS NOT DISTINCT FROM OLD.provider_account_ref
        AND NEW.livemode IS NOT DISTINCT FROM OLD.livemode) IS NOT TRUE THEN
      RAISE EXCEPTION 'donation_line_intake_sealed'
        USING ERRCODE = '23514',
              DETAIL = 'A line-based intake keeps its tenant, amount, currency, target, entity, binding, account and mode.';
    END IF;
    IF (OLD.stripe_payment_intent_id IS NULL
        OR NEW.stripe_payment_intent_id IS NOT DISTINCT FROM OLD.stripe_payment_intent_id) IS NOT TRUE THEN
      RAISE EXCEPTION 'donation_payment_reference_fixed'
        USING ERRCODE = '23514',
              DETAIL = 'A recorded payment reference never changes.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.donations_intake_generation()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER donations_intake_generation
  BEFORE INSERT OR UPDATE OR DELETE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION private.donations_intake_generation();

ALTER TABLE public.donations
  ADD CONSTRAINT donations_intake_format_check
    CHECK (intake_format IN ('legacy_header', 'line_based')) NOT VALID,
  ADD CONSTRAINT donations_line_based_check
    CHECK (
      intake_format <> 'line_based'
      OR (
        tenant_id IS NOT NULL
        AND legal_entity_id IS NOT NULL
        AND payment_account_binding_id IS NOT NULL
        AND provider_account_ref IS NOT NULL
        AND livemode IS NOT NULL
        AND amount > 0
        AND fund_id IS NULL
        AND missionary_id IS NULL
        AND provider_account_ref ~ '^acct_[A-Za-z0-9]+$'
        AND (stripe_payment_intent_id IS NULL OR stripe_payment_intent_id ~ '^pi_[A-Za-z0-9]+$')
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donations_legacy_header_check
    CHECK (
      intake_format <> 'legacy_header'
      OR (
        legal_entity_id IS NULL
        AND payment_account_binding_id IS NULL
        AND provider_account_ref IS NULL
        AND livemode IS NULL
      ) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donations_account_key
    UNIQUE (tenant_id, id, provider_account_ref, livemode),
  ADD CONSTRAINT donations_frozen_binding_fk
    FOREIGN KEY (tenant_id, payment_account_binding_id, legal_entity_id, provider_account_ref, livemode)
    REFERENCES public.payment_account_bindings (tenant_id, id, legal_entity_id, provider_account_ref, livemode)
    NOT VALID,
  ADD CONSTRAINT donations_entity_currency_fk
    FOREIGN KEY (tenant_id, legal_entity_id, currency)
    REFERENCES public.legal_entities (tenant_id, id, currency)
    NOT VALID;

ALTER TABLE public.donations VALIDATE CONSTRAINT donations_intake_format_check;
ALTER TABLE public.donations VALIDATE CONSTRAINT donations_line_based_check;
ALTER TABLE public.donations VALIDATE CONSTRAINT donations_legacy_header_check;
ALTER TABLE public.donations VALIDATE CONSTRAINT donations_frozen_binding_fk;
ALTER TABLE public.donations VALIDATE CONSTRAINT donations_entity_currency_fk;

CREATE UNIQUE INDEX donations_line_payment_reference_key
  ON public.donations (provider_account_ref, livemode, stripe_payment_intent_id)
  WHERE intake_format = 'line_based' AND stripe_payment_intent_id IS NOT NULL;

GRANT SELECT (
  id,
  tenant_id,
  intake_format,
  payment_account_binding_id,
  provider_account_ref,
  livemode,
  amount,
  currency,
  stripe_payment_intent_id
) ON TABLE public.donations TO tenant_guard;
GRANT UPDATE (stripe_payment_intent_id, updated_at)
  ON TABLE public.donations TO tenant_guard;

DROP POLICY IF EXISTS tenant_guard_isolation ON public.donations;
CREATE POLICY tenant_guard_isolation
  ON public.donations
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
  'donations',
  v.field_key,
  s.surface,
  s.surface = 'mission_control',
  false,
  false,
  v.category::public.field_sensitivity_category
FROM (
  VALUES
    ('intake_format', 'internal'),
    ('legal_entity_id', 'financial'),
    ('payment_account_binding_id', 'financial'),
    ('provider_account_ref', 'financial'),
    ('livemode', 'internal')
) AS v(field_key, category)
CROSS JOIN unnest(
  ARRAY['mission_control', 'donor', 'missionary', 'public', 'export']
) AS s(surface);

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
