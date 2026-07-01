-- Inbound email workflow status (Inngest durable workflow executor).
-- Additive only: the inbound email placeholder tracks body and attachment
-- retrieval state so Support Hub routing can require the body while
-- attachments stay pending/retrying/failed/available without blocking the
-- conversation. See openspec/changes/add-inngest-durable-workflow-executor.

ALTER TABLE public.email_inbound_messages
  ADD COLUMN IF NOT EXISTS body_retrieval_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS body_retrieval_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS body_retrieved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS body_retrieval_error TEXT,
  ADD COLUMN IF NOT EXISTS attachment_retrieval_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS attachment_retrieval_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS attachments_retrieved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS attachment_retrieval_error TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'email_inbound_messages_body_retrieval_status_check'
  ) THEN
    ALTER TABLE public.email_inbound_messages
      ADD CONSTRAINT email_inbound_messages_body_retrieval_status_check
      CHECK (body_retrieval_status IN ('pending', 'processing', 'available', 'failed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'email_inbound_messages_attachment_retrieval_status_check'
  ) THEN
    ALTER TABLE public.email_inbound_messages
      ADD CONSTRAINT email_inbound_messages_attachment_retrieval_status_check
      CHECK (
        attachment_retrieval_status IN ('none', 'pending', 'retrying', 'failed', 'available')
      );
  END IF;
END $$;

COMMENT ON COLUMN public.email_inbound_messages.body_retrieval_status IS
  'Inbound body retrieval state. Support Hub routing requires available; pending/processing/failed placeholders stay visible and must never become empty support messages.';

COMMENT ON COLUMN public.email_inbound_messages.attachment_retrieval_status IS
  'Staff-visible attachment state for the inbound message (none when the email reports no attachments). Attachment retrieval never blocks Support Hub routing after the body is available.';

-- Rows created before this migration already carried their body inline.
UPDATE public.email_inbound_messages
SET body_retrieval_status = 'available'
WHERE body_retrieval_status = 'pending'
  AND parsed_text IS NOT NULL
  AND parsed_text <> '';

UPDATE public.email_inbound_messages
SET attachment_retrieval_status = 'available'
WHERE attachment_retrieval_status = 'none'
  AND attachment_count > 0;

CREATE INDEX IF NOT EXISTS idx_email_inbound_messages_body_status
  ON public.email_inbound_messages (tenant_id, body_retrieval_status)
  WHERE body_retrieval_status IN ('pending', 'processing', 'failed');
