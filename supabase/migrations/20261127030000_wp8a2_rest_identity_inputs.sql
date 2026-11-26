-- AL-2681 (WP8a part 2 rest, PR 1, M1; plan 5.4 and lines 1155, 1160 and
-- 1174; rulings Q13, Q-D (ii), W8-R24, W8-R25; issue 2842, option (a)): what
-- a line-based intake records about who gave, and its closing as abandoned.
-- Nothing live writes a line-based intake; every legacy row keeps the new
-- columns NULL and its contract, but for one rule (2842) that binds every
-- row: a recorded organization never changes.
--
-- 1. public.donations: actor_user_id (the signed-in login, NULL for a
--    guest), actor_email (that login's address at intake) and
--    actor_email_confirmed (whether Auth had confirmed it), is_anonymous
--    (the giver's choice; a line-based insert that names none is stamped
--    false) and abandoned_by ('sweep' or 'staff', set by the move into
--    abandoned and kept after a late success). Checks, NOT VALID then
--    validated: a legacy row holds all five NULL; a line-based row has its
--    anonymity, an actor's confirmation exactly when it has an actor, an
--    address only with an actor, abandoned_by only of the two values and
--    always on an abandoned row. donations_line_status_check admits
--    'abandoned'.
-- 2. private.donations_intake_generation() replaced: as 20261126020000
--    wrote it, and (2842) a non-null tenant_id never changes on any row
--    (23514 donation_tenant_frozen), and a line-based row keeps its actor,
--    address, confirmation and anonymity (23514 donation_line_intake_sealed)
--    and is inserted with no abandoned_by.
-- 3. private.donations_line_status() replaced: as 20261126170100 wrote it,
--    and pending or failed may move to abandoned, which sets abandoned_by;
--    abandoned moves only to completed, and only when the sweep abandoned
--    it (a late success, W8-R24); abandoned_by never changes otherwise.
-- 4. public.donation_intake_contacts: the giver's contact details as typed
--    (email, first and last name, an address with the keys of
--    donors.address), keyed (tenant_id, donation_id) to the line-based
--    intake with its entity; row security forced; tenant_guard SELECT behind
--    tenant_guard_isolation and nothing for PUBLIC, anon, authenticated or
--    service_role (Q13); never updated, deleted or truncated (23514).
-- 5. tenant_guard: SELECT of the new intake columns, donor_id and
--    created_at; UPDATE of donor_id and abandoned_by; on donors, SELECT of
--    name, email_normalized, address, party_id and profile_id and INSERT of
--    address (beside WP5's columns). The guard still holds no email column
--    of donors (WP5 rest, fix round F1 rule 1): a new giver's email is
--    written by M4's postgres-owned private.insert_giver_donor.
--
-- Locks, all held to COMMIT, taken first and in this order: SHARE ROW
-- EXCLUSIVE on legal_entities (no new key; the contacts' foreign key reads
-- donations), ACCESS EXCLUSIVE on donations (36 rows hosted, census line
-- 115) and on donors (its grants only). lock_timeout stops a run rather than
-- queue it behind live traffic.
--
-- Recovery. Nothing here is written to run twice: a run lost between its
-- COMMIT and its ledger row stops on the next run at its first ADD COLUMN
-- (42701, column "actor_user_id" already exists). This file has committed
-- when this read-only check is true; it answers false, never an error:
--   SELECT to_regclass('public.donation_intake_contacts') IS NOT NULL
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127030000. It has no preflight or post-assert of its own.
--
-- Down, an operator's last resort, after the Down of every later file of
-- this pull request, for a database with no line-based intake (SELECT
-- count(*) FROM public.donations WHERE intake_format = 'line_based' reads
-- 0); in one transaction:
--   SET LOCAL lock_timeout = '5s';
--   LOCK TABLE public.donations IN ACCESS EXCLUSIVE MODE;
--   DO $$ BEGIN IF EXISTS (SELECT 1 FROM public.donations WHERE intake_format = 'line_based')
--     THEN RAISE EXCEPTION 'Down refused: a line-based intake exists' USING ERRCODE = '55000'; END IF; END $$;
--   DROP TABLE public.donation_intake_contacts;
--   DROP FUNCTION private.donation_intake_contacts_sealed();
--   re-run, verbatim, the CREATE OR REPLACE of private.donations_intake_generation()
--     from 20261126020000 and of private.donations_line_status() from 20261126170100;
--   ALTER TABLE public.donations DROP CONSTRAINT donations_line_status_check,
--     DROP CONSTRAINT donations_identity_inputs_check,
--     DROP COLUMN actor_user_id, DROP COLUMN actor_email, DROP COLUMN actor_email_confirmed,
--     DROP COLUMN is_anonymous, DROP COLUMN abandoned_by;
--   ALTER TABLE public.donations ADD CONSTRAINT donations_line_status_check CHECK (intake_format <> 'line_based'
--     OR (status IN ('pending', 'processing', 'completed', 'failed')) IS TRUE);
--   REVOKE SELECT (name, email_normalized, address, party_id, profile_id), INSERT (address)
--     ON TABLE public.donors FROM tenant_guard;
--   REVOKE SELECT (donor_id, created_at), UPDATE (donor_id) ON TABLE public.donations FROM tenant_guard;
--   DELETE FROM public.field_policies WHERE record_type = 'donations' AND field_key IN
--     ('actor_user_id', 'actor_email', 'actor_email_confirmed', 'is_anonymous', 'abandoned_by');

BEGIN;
SET LOCAL lock_timeout = '5s';

LOCK TABLE public.legal_entities IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.donations IN ACCESS EXCLUSIVE MODE;
LOCK TABLE public.donors IN ACCESS EXCLUSIVE MODE;

ALTER TABLE public.donations
  ADD COLUMN actor_user_id UUID,
  ADD COLUMN actor_email TEXT,
  ADD COLUMN actor_email_confirmed BOOLEAN,
  ADD COLUMN is_anonymous BOOLEAN,
  ADD COLUMN abandoned_by TEXT;

ALTER TABLE public.donations
  DROP CONSTRAINT donations_line_status_check;

ALTER TABLE public.donations
  ADD CONSTRAINT donations_line_status_check
    CHECK (
      intake_format <> 'line_based'
      OR (status IN ('pending', 'processing', 'completed', 'failed', 'abandoned')) IS TRUE
    ) NOT VALID,
  ADD CONSTRAINT donations_identity_inputs_check
    CHECK (
      (intake_format <> 'legacy_header'
        OR (actor_user_id IS NULL
          AND actor_email IS NULL
          AND actor_email_confirmed IS NULL
          AND is_anonymous IS NULL
          AND abandoned_by IS NULL) IS TRUE)
      AND (intake_format <> 'line_based'
        OR (is_anonymous IS NOT NULL
          AND (actor_user_id IS NULL) = (actor_email_confirmed IS NULL)
          AND (actor_user_id IS NOT NULL OR actor_email IS NULL)
          AND (abandoned_by IS NULL OR abandoned_by IN ('sweep', 'staff'))
          AND (status <> 'abandoned' OR abandoned_by IS NOT NULL)) IS TRUE)
    ) NOT VALID;

ALTER TABLE public.donations VALIDATE CONSTRAINT donations_line_status_check;
ALTER TABLE public.donations VALIDATE CONSTRAINT donations_identity_inputs_check;

CREATE OR REPLACE FUNCTION private.donations_intake_generation()
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
          AND NEW.stripe_charge_id IS NULL
          AND NEW.abandoned_by IS NULL) IS NOT TRUE THEN
        RAISE EXCEPTION 'donation_line_intake_invalid'
          USING ERRCODE = '23514',
                DETAIL = 'A line-based intake is created with no donor, payment reference, charge or abandonment.';
      END IF;
      IF NEW.is_anonymous IS NULL THEN
        NEW.is_anonymous := false;
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

  IF OLD.tenant_id IS NOT NULL AND (NEW.tenant_id IS NOT DISTINCT FROM OLD.tenant_id) IS NOT TRUE THEN
    RAISE EXCEPTION 'donation_tenant_frozen'
      USING ERRCODE = '23514',
            DETAIL = 'An intake keeps the organization it was recorded in.';
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
        AND NEW.livemode IS NOT DISTINCT FROM OLD.livemode
        AND NEW.actor_user_id IS NOT DISTINCT FROM OLD.actor_user_id
        AND NEW.actor_email IS NOT DISTINCT FROM OLD.actor_email
        AND NEW.actor_email_confirmed IS NOT DISTINCT FROM OLD.actor_email_confirmed
        AND NEW.is_anonymous IS NOT DISTINCT FROM OLD.is_anonymous) IS NOT TRUE THEN
      RAISE EXCEPTION 'donation_line_intake_sealed'
        USING ERRCODE = '23514',
              DETAIL = 'A line-based intake keeps its tenant, amount, currency, target, entity, binding, account, mode, actor and anonymity.';
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

CREATE OR REPLACE FUNCTION private.donations_line_status()
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
      OR (OLD.status = 'pending' AND NEW.status IN ('processing', 'completed', 'failed', 'abandoned'))
      OR (OLD.status = 'processing' AND NEW.status IN ('completed', 'failed'))
      OR (OLD.status = 'failed' AND NEW.status IN ('processing', 'completed', 'abandoned'))
      OR (OLD.status = 'abandoned' AND NEW.status = 'completed' AND OLD.abandoned_by = 'sweep')) IS NOT TRUE THEN
    RAISE EXCEPTION 'donation_line_status_move'
      USING ERRCODE = '23514',
            DETAIL = pg_catalog.format('A line-based intake does not move from %s to %s.', OLD.status, NEW.status);
  END IF;

  IF (NEW.abandoned_by IS NOT DISTINCT FROM OLD.abandoned_by
      OR (OLD.abandoned_by IS NULL
          AND NEW.status = 'abandoned'
          AND OLD.status IS DISTINCT FROM 'abandoned'
          AND NEW.abandoned_by IN ('sweep', 'staff'))) IS NOT TRUE THEN
    RAISE EXCEPTION 'donation_line_abandonment_fixed'
      USING ERRCODE = '23514',
            DETAIL = 'Who abandoned an intake is set by the move into abandoned and never changes.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TABLE public.donation_intake_contacts (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  donation_id UUID NOT NULL,
  legal_entity_id UUID NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  address JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT donation_intake_contacts_pkey PRIMARY KEY (tenant_id, donation_id),
  CONSTRAINT donation_intake_contacts_intake_fk
    FOREIGN KEY (tenant_id, donation_id, legal_entity_id)
    REFERENCES public.donations (tenant_id, id, legal_entity_id)
    ON DELETE RESTRICT,
  CONSTRAINT donation_intake_contacts_address_check
    CHECK (address IS NULL OR pg_catalog.jsonb_typeof(address) = 'object')
);

CREATE FUNCTION private.donation_intake_contacts_sealed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'donation_intake_contact_sealed'
    USING ERRCODE = '23514',
          DETAIL = 'A giver''s contact details as given are kept as given.';
END;
$$;

REVOKE ALL ON FUNCTION private.donation_intake_contacts_sealed()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER donation_intake_contacts_sealed
  BEFORE UPDATE OR DELETE ON public.donation_intake_contacts
  FOR EACH ROW
  EXECUTE FUNCTION private.donation_intake_contacts_sealed();

CREATE TRIGGER donation_intake_contacts_no_truncate
  BEFORE TRUNCATE ON public.donation_intake_contacts
  FOR EACH STATEMENT
  EXECUTE FUNCTION private.donation_intake_contacts_sealed();

ALTER TABLE public.donation_intake_contacts
  ENABLE ROW LEVEL SECURITY,
  FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.donation_intake_contacts
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.donation_intake_contacts TO tenant_guard;

CREATE POLICY tenant_guard_isolation
  ON public.donation_intake_contacts
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

GRANT SELECT (actor_user_id, actor_email, actor_email_confirmed, is_anonymous, abandoned_by, donor_id, created_at)
  ON TABLE public.donations TO tenant_guard;
GRANT UPDATE (donor_id, abandoned_by)
  ON TABLE public.donations TO tenant_guard;

GRANT SELECT (name, email_normalized, address, party_id, profile_id)
  ON TABLE public.donors TO tenant_guard;
GRANT INSERT (address)
  ON TABLE public.donors TO tenant_guard;

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
    ('actor_user_id', 'internal'),
    ('actor_email', 'contact'),
    ('actor_email_confirmed', 'internal'),
    ('is_anonymous', 'internal'),
    ('abandoned_by', 'internal')
) AS v(field_key, category)
CROSS JOIN unnest(
  ARRAY['mission_control', 'donor', 'missionary', 'public', 'export']
) AS s(surface);

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
