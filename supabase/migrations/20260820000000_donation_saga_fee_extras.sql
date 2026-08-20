-- Persist quoted Gift processing-fee extras on the donation saga outbox so
-- recovery, due-batch, and admin replay can rebind PaymentIntent method types
-- after the HTTP first-shot extras are gone. Do not store this on
-- donations.payment_method; Stripe webhooks overwrite that column.
--
-- Rollback:
--   ALTER TABLE public.donation_saga_outbox DROP COLUMN IF EXISTS fee_extras;

ALTER TABLE public.donation_saga_outbox
  ADD COLUMN IF NOT EXISTS fee_extras JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.donation_saga_outbox.fee_extras IS
  'Quoted Gift processing-fee Stripe metadata (payment_method, cover amounts). Used to bind PaymentIntent method types on recovery and replay.';
