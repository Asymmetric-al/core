-- AL-2681 (WP8a part 2, R2a, M4; plan line 1137; index section 3.4, binding;
-- rulings Q12, Q-A and Q-E): what the provider reported, and the provider
-- request's amount key. Payment events land in part 1's
-- public.stripe_connect_events with no new column (Q12). Nothing live writes
-- a connected payment event or a provider request.
--
-- 1. stripe_connect_events_tenant_account_key UNIQUE (tenant_id, id,
--    provider_account_id, livemode): the observations' event key.
-- 2. public.payment_observations: one row per applied, stale or no-change
--    payment event (event_key), at most one terminal effect (succeeded or
--    canceled) per account, mode and PaymentIntent
--    (payment_observations_terminal_key; Stripe: a canceled PaymentIntent
--    "can't be undone", a succeeded one's "payment flow is complete"); keys to
--    the intake that names the PaymentIntent (donations_payment_object_key)
--    and to the event of the same tenant, account and mode; sealed (23514 on
--    UPDATE or DELETE, for every role). Row security forced; nothing for
--    PUBLIC, anon, authenticated or service_role; tenant_guard SELECT and
--    INSERT behind tenant_guard_isolation.
-- 3. donation_saga_outbox_intake_amount_fk (tenant, intake, account, mode,
--    amount, currency) to donations_account_amount_key, NOT VALID then
--    validated: a provider request asks for its intake's amount in its
--    intake's currency. Legacy rows hold a NULL account and are skipped
--    (MATCH SIMPLE).
-- 4. tenant_guard INSERT of the thirteen outbox columns the enqueue names,
--    behind R1a's tenant_guard_isolation policy (provider requests of the
--    entered tenant only); the kind is stamped by R1a's trigger.
-- 5. mission_control_task_links_payment_contradiction_key: one
--    payment_contradiction link per record (ruling Q-A).
--
-- Locks, all held to COMMIT, taken first and in this order: SHARE ROW
-- EXCLUSIVE on tenants, currency_metadata and donations (the new table's and
-- the new key's targets); ACCESS EXCLUSIVE on stripe_connect_events (its new
-- key; 0 rows hosted) and donation_saga_outbox (its new key; legacy rows
-- only); SHARE on mission_control_task_links (its new index).
-- lock_timeout stops a run rather than queue it behind live traffic.
--
-- A second run of the applied file, as observed: it stops at its first
-- statement after the locks, ADD CONSTRAINT
-- stripe_connect_events_tenant_account_key (42P07, its index already
-- exists), and changes nothing. This file has committed when this read-only
-- check is true; it answers false, never an error, when the table is absent:
--   SELECT to_regclass('public.payment_observations') IS NOT NULL
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version.
--
-- Down, an operator's last resort, in one transaction, after the Down of the
-- R2a enqueue and apply file; it refuses while an observation or a provider
-- request exists. The guard's column INSERT is revoked column by column: a
-- table REVOKE would also strip R1a's own column grants.
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   LOCK TABLE public.donation_saga_outbox IN ACCESS EXCLUSIVE MODE;
--   DO $$
--   BEGIN
--     IF to_regclass('public.payment_observations') IS NOT NULL
--        AND EXISTS (SELECT 1 FROM public.payment_observations) THEN
--       RAISE EXCEPTION 'Down of the R2a observations refused: an observation exists' USING ERRCODE = '55000';
--     END IF;
--     IF EXISTS (SELECT 1 FROM public.donation_saga_outbox WHERE kind = 'provider_request') THEN
--       RAISE EXCEPTION 'Down of the R2a observations refused: a provider request exists' USING ERRCODE = '55000';
--     END IF;
--   END
--   $$;
--   DROP INDEX public.mission_control_task_links_payment_contradiction_key;
--   REVOKE INSERT (id, tenant_id, donation_id, amount, currency,
--     idempotency_key, status, next_attempt_at, request_kind,
--     provider_account_ref, livemode, request_params, request_digest)
--     ON TABLE public.donation_saga_outbox FROM tenant_guard;
--   ALTER TABLE public.donation_saga_outbox
--     DROP CONSTRAINT donation_saga_outbox_intake_amount_fk;
--   DROP TABLE public.payment_observations;
--   DROP FUNCTION private.payment_observations_sealed();
--   ALTER TABLE public.stripe_connect_events
--     DROP CONSTRAINT stripe_connect_events_tenant_account_key;
--   COMMIT;

BEGIN;
SET LOCAL lock_timeout = '5s';

LOCK TABLE public.tenants IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.currency_metadata IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.donations IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.stripe_connect_events IN ACCESS EXCLUSIVE MODE;
LOCK TABLE public.donation_saga_outbox IN ACCESS EXCLUSIVE MODE;
LOCK TABLE public.mission_control_task_links IN SHARE MODE;

ALTER TABLE public.stripe_connect_events
  ADD CONSTRAINT stripe_connect_events_tenant_account_key
    UNIQUE (tenant_id, id, provider_account_id, livemode);

CREATE TABLE public.payment_observations (
  id UUID PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  donation_id UUID NOT NULL,
  event_id UUID NOT NULL,
  provider_account_ref TEXT NOT NULL,
  livemode BOOLEAN NOT NULL,
  payment_object_id TEXT NOT NULL
    CONSTRAINT payment_observations_payment_object_id_check
      CHECK (payment_object_id ~ '^pi_[A-Za-z0-9]+$'),
  effect_kind TEXT NOT NULL
    CONSTRAINT payment_observations_effect_kind_check
      CHECK (effect_kind IN ('processing', 'succeeded', 'payment_failed', 'canceled')),
  provider_created_at TIMESTAMPTZ NOT NULL,
  amount BIGINT NOT NULL
    CONSTRAINT payment_observations_amount_check CHECK (amount > 0),
  currency TEXT NOT NULL
    CONSTRAINT payment_observations_currency_check CHECK (currency ~ '^[a-z]{3}$')
    REFERENCES public.currency_metadata(code),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payment_observations_event_key UNIQUE (event_id),
  CONSTRAINT payment_observations_intake_fk
    FOREIGN KEY (tenant_id, donation_id, provider_account_ref, livemode, payment_object_id)
    REFERENCES public.donations (tenant_id, id, provider_account_ref, livemode, stripe_payment_intent_id)
    ON DELETE RESTRICT,
  CONSTRAINT payment_observations_event_fk
    FOREIGN KEY (tenant_id, event_id, provider_account_ref, livemode)
    REFERENCES public.stripe_connect_events (tenant_id, id, provider_account_id, livemode)
    ON DELETE RESTRICT
);

CREATE UNIQUE INDEX payment_observations_terminal_key
  ON public.payment_observations (provider_account_ref, livemode, payment_object_id)
  WHERE effect_kind IN ('succeeded', 'canceled');

CREATE INDEX payment_observations_intake_idx
  ON public.payment_observations (tenant_id, donation_id, provider_created_at);

CREATE FUNCTION private.payment_observations_sealed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'payment_observation_sealed'
    USING ERRCODE = '23514',
          DETAIL = 'A payment observation is evidence and is never changed or deleted.';
END;
$$;

REVOKE ALL ON FUNCTION private.payment_observations_sealed()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER payment_observations_sealed
  BEFORE UPDATE OR DELETE ON public.payment_observations
  FOR EACH ROW
  EXECUTE FUNCTION private.payment_observations_sealed();

ALTER TABLE public.payment_observations
  ENABLE ROW LEVEL SECURITY,
  FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.payment_observations
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.payment_observations TO tenant_guard;
GRANT INSERT (
  tenant_id,
  donation_id,
  event_id,
  provider_account_ref,
  livemode,
  payment_object_id,
  effect_kind,
  provider_created_at,
  amount,
  currency
) ON TABLE public.payment_observations TO tenant_guard;

CREATE POLICY tenant_guard_isolation
  ON public.payment_observations
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

ALTER TABLE public.donation_saga_outbox
  ADD CONSTRAINT donation_saga_outbox_intake_amount_fk
    FOREIGN KEY (tenant_id, donation_id, provider_account_ref, livemode, amount, currency)
    REFERENCES public.donations (tenant_id, id, provider_account_ref, livemode, amount, currency)
    NOT VALID;

ALTER TABLE public.donation_saga_outbox
  VALIDATE CONSTRAINT donation_saga_outbox_intake_amount_fk;

GRANT INSERT (
  id,
  tenant_id,
  donation_id,
  amount,
  currency,
  idempotency_key,
  status,
  next_attempt_at,
  request_kind,
  provider_account_ref,
  livemode,
  request_params,
  request_digest
) ON TABLE public.donation_saga_outbox TO tenant_guard;

CREATE UNIQUE INDEX mission_control_task_links_payment_contradiction_key
  ON public.mission_control_task_links (tenant_id, record_type, record_id, relationship)
  WHERE relationship = 'payment_contradiction';

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
