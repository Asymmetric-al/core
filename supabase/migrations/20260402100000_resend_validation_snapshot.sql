BEGIN;

ALTER TABLE public.tenant_email_settings
  ADD COLUMN IF NOT EXISTS validation_snapshot JSONB;

COMMENT ON COLUMN public.tenant_email_settings.validation_snapshot IS
  'Persisted Resend validation snapshot used to hydrate sender/domain metadata without revalidating on read.';

COMMIT;
