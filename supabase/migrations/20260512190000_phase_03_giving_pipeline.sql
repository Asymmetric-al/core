-- Phase 3 Payments / Giving Pipeline local-dev foundation.
-- Additive only: raw Stripe event ledger, staged gift workflow, CRM link
-- records, receipt/reconciliation evidence, and Stripe event processing locks.

ALTER TYPE public.crm_sync_domain ADD VALUE IF NOT EXISTS 'gifts';

CREATE TABLE IF NOT EXISTS public.stripe_raw_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  donation_id UUID REFERENCES public.donations(id) ON DELETE SET NULL,
  staged_gift_id UUID,
  stripe_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  api_version TEXT,
  livemode BOOLEAN NOT NULL DEFAULT false,
  stripe_account TEXT,
  payment_intent_id TEXT,
  charge_id TEXT,
  payload_sha256 TEXT NOT NULL,
  signature_header_present BOOLEAN NOT NULL DEFAULT false,
  signature_header_sha256 TEXT,
  signature_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processing_status TEXT NOT NULL DEFAULT 'received',
  process_attempts INTEGER NOT NULL DEFAULT 0 CHECK (process_attempts >= 0),
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lock_id UUID,
  locked_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  dead_letter_at TIMESTAMPTZ,
  last_error_code TEXT,
  last_error_message TEXT,
  retryable BOOLEAN,
  processing_outcome JSONB NOT NULL DEFAULT '{}'::jsonb,
  correlation_id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT stripe_raw_events_event_unique UNIQUE (stripe_event_id),
  CONSTRAINT stripe_raw_events_status_check CHECK (
    processing_status IN (
      'received',
      'processing',
      'processed',
      'ignored',
      'failed',
      'dead_letter'
    )
  )
);

COMMENT ON TABLE public.stripe_raw_events IS
  'Durable raw Stripe webhook event ledger. Signed events are stored before processing and replayed by event id without exposing webhook secrets.';

CREATE INDEX IF NOT EXISTS idx_stripe_raw_events_tenant_status
  ON public.stripe_raw_events (tenant_id, processing_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stripe_raw_events_payment_intent
  ON public.stripe_raw_events (payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_stripe_raw_events_donation
  ON public.stripe_raw_events (donation_id);

CREATE TABLE IF NOT EXISTS public.staged_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES public.donors(id) ON DELETE SET NULL,
  missionary_id UUID REFERENCES public.missionaries(id) ON DELETE SET NULL,
  fund_id UUID REFERENCES public.funds(id) ON DELETE SET NULL,
  stripe_raw_event_id UUID REFERENCES public.stripe_raw_events(id) ON DELETE SET NULL,
  stripe_event_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  amount BIGINT NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'received',
  donor_match_status TEXT NOT NULL DEFAULT 'matched',
  allocation_status TEXT NOT NULL DEFAULT 'single_allocation',
  review_reason TEXT,
  receipt_status TEXT NOT NULL DEFAULT 'pending',
  receipt_send_log_id UUID REFERENCES public.email_send_logs(id) ON DELETE SET NULL,
  crm_post_status TEXT NOT NULL DEFAULT 'not_required',
  crm_outbound_job_id UUID REFERENCES public.crm_outbound_jobs(id) ON DELETE SET NULL,
  twenty_record_id TEXT,
  reviewed_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  posted_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  posted_at TIMESTAMPTZ,
  last_error_code TEXT,
  last_error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT staged_gifts_donation_unique UNIQUE (donation_id),
  CONSTRAINT staged_gifts_status_check CHECK (
    status IN (
      'received',
      'needs_review',
      'ready_to_post',
      'posted',
      'failed',
      'refunded',
      'voided'
    )
  ),
  CONSTRAINT staged_gifts_donor_match_status_check CHECK (
    donor_match_status IN ('matched', 'needs_review', 'corrected')
  ),
  CONSTRAINT staged_gifts_allocation_status_check CHECK (
    allocation_status IN (
      'single_allocation',
      'split',
      'needs_review',
      'corrected'
    )
  ),
  CONSTRAINT staged_gifts_receipt_status_check CHECK (
    receipt_status IN (
      'not_required',
      'pending',
      'sent',
      'failed',
      'suppressed'
    )
  ),
  CONSTRAINT staged_gifts_crm_post_status_check CHECK (
    crm_post_status IN ('not_required', 'queued', 'posted', 'failed', 'blocked')
  )
);

COMMENT ON TABLE public.staged_gifts IS
  'Finance review queue for successful Stripe gifts before posting summary context to Twenty and issuing receipts.';

ALTER TABLE public.stripe_raw_events
  DROP CONSTRAINT IF EXISTS stripe_raw_events_staged_gift_id_fkey;

ALTER TABLE public.stripe_raw_events
  ADD CONSTRAINT stripe_raw_events_staged_gift_id_fkey
  FOREIGN KEY (staged_gift_id)
  REFERENCES public.staged_gifts(id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_staged_gifts_tenant_status
  ON public.staged_gifts (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_staged_gifts_crm_post_status
  ON public.staged_gifts (tenant_id, crm_post_status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_staged_gifts_receipt_status
  ON public.staged_gifts (tenant_id, receipt_status, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.staged_gift_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staged_gift_id UUID NOT NULL REFERENCES public.staged_gifts(id) ON DELETE CASCADE,
  fund_id UUID REFERENCES public.funds(id) ON DELETE SET NULL,
  missionary_id UUID REFERENCES public.missionaries(id) ON DELETE SET NULL,
  amount BIGINT NOT NULL CHECK (amount >= 0),
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staged_gift_allocations_gift
  ON public.staged_gift_allocations (staged_gift_id);

CREATE TABLE IF NOT EXISTS public.staged_gift_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staged_gift_id UUID NOT NULL REFERENCES public.staged_gifts(id) ON DELETE CASCADE,
  actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  note TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staged_gift_audit_events_gift_created
  ON public.staged_gift_audit_events (staged_gift_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.donation_crm_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE,
  staged_gift_id UUID REFERENCES public.staged_gifts(id) ON DELETE SET NULL,
  crm_provider TEXT NOT NULL DEFAULT 'twenty',
  crm_record_link_id UUID REFERENCES public.crm_record_links(id) ON DELETE SET NULL,
  twenty_object_name TEXT,
  twenty_record_id TEXT,
  link_status TEXT NOT NULL DEFAULT 'active',
  linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT donation_crm_links_provider_check CHECK (crm_provider = 'twenty'),
  CONSTRAINT donation_crm_links_status_check CHECK (
    link_status IN ('active', 'queued', 'failed', 'archived')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_donation_crm_links_donation_record
  ON public.donation_crm_links (
    tenant_id,
    donation_id,
    crm_provider,
    twenty_object_name,
    twenty_record_id
  )
  WHERE donation_id IS NOT NULL
    AND twenty_object_name IS NOT NULL
    AND twenty_record_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_donation_crm_links_staged_gift
  ON public.donation_crm_links (staged_gift_id);

CREATE TABLE IF NOT EXISTS public.giving_reconciliation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  checked_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  findings JSONB NOT NULL DEFAULT '{}'::jsonb,
  requested_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT giving_reconciliation_runs_type_check CHECK (
    run_type IN (
      'stripe_raw_events_vs_donations',
      'donation_saga_outbox_vs_staged_gifts',
      'staged_gifts_vs_twenty_links',
      'receipt_required_vs_receipt_sent',
      'full'
    )
  ),
  CONSTRAINT giving_reconciliation_runs_status_check CHECK (
    status IN ('running', 'succeeded', 'failed')
  )
);

CREATE INDEX IF NOT EXISTS idx_giving_reconciliation_runs_tenant_created
  ON public.giving_reconciliation_runs (tenant_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.claim_stripe_raw_event(
  p_raw_event_id UUID,
  p_lock_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path TO public
AS $function$
DECLARE
  v_row public.stripe_raw_events%ROWTYPE;
BEGIN
  UPDATE public.stripe_raw_events
  SET processing_status = 'processing',
      process_attempts = process_attempts + 1,
      lock_id = p_lock_id,
      locked_at = NOW(),
      updated_at = NOW()
  WHERE id = p_raw_event_id
    AND processing_status IN ('received', 'failed')
    AND next_attempt_at <= NOW()
  RETURNING *
  INTO v_row;

  IF v_row.id IS NULL THEN
    RETURN jsonb_build_object('claimed', false);
  END IF;

  RETURN jsonb_build_object(
    'claimed', true,
    'raw_event_id', v_row.id,
    'stripe_event_id', v_row.stripe_event_id,
    'event_type', v_row.event_type,
    'tenant_id', v_row.tenant_id,
    'donation_id', v_row.donation_id,
    'process_attempts', v_row.process_attempts,
    'correlation_id', v_row.correlation_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.complete_stripe_raw_event(
  p_raw_event_id UUID,
  p_lock_id UUID,
  p_processing_status TEXT,
  p_processing_outcome JSONB DEFAULT '{}'::jsonb,
  p_staged_gift_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path TO public
AS $function$
DECLARE
  v_row public.stripe_raw_events%ROWTYPE;
  v_next_status TEXT;
BEGIN
  IF p_processing_status NOT IN ('processed', 'ignored') THEN
    RAISE EXCEPTION 'Stripe raw event completion status must be processed or ignored'
      USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_row
  FROM public.stripe_raw_events
  WHERE id = p_raw_event_id
    AND processing_status = 'processing'
    AND lock_id = p_lock_id
  FOR UPDATE;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'Stripe raw event is not locked for completion'
      USING ERRCODE = 'P0002';
  END IF;

  v_next_status := p_processing_status;

  UPDATE public.stripe_raw_events
  SET processing_status = v_next_status,
      processing_outcome = COALESCE(p_processing_outcome, '{}'::jsonb),
      staged_gift_id = COALESCE(p_staged_gift_id, staged_gift_id),
      processed_at = NOW(),
      failed_at = NULL,
      last_error_code = NULL,
      last_error_message = NULL,
      retryable = NULL,
      lock_id = NULL,
      locked_at = NULL,
      updated_at = NOW()
  WHERE id = p_raw_event_id;

  RETURN jsonb_build_object(
    'raw_event_id', p_raw_event_id,
    'stripe_event_id', v_row.stripe_event_id,
    'processing_status', v_next_status
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.record_stripe_raw_event_failure(
  p_raw_event_id UUID,
  p_lock_id UUID,
  p_error_code TEXT,
  p_error_message TEXT,
  p_retryable BOOLEAN DEFAULT true,
  p_retry_delay_seconds INTEGER DEFAULT 60,
  p_dead_letter_after INTEGER DEFAULT 5
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path TO public
AS $function$
DECLARE
  v_row public.stripe_raw_events%ROWTYPE;
  v_dead_letter BOOLEAN;
  v_next_status TEXT;
BEGIN
  SELECT *
  INTO v_row
  FROM public.stripe_raw_events
  WHERE id = p_raw_event_id
    AND processing_status = 'processing'
    AND lock_id = p_lock_id
  FOR UPDATE;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'Stripe raw event is not locked for failure'
      USING ERRCODE = 'P0002';
  END IF;

  v_dead_letter := NOT COALESCE(p_retryable, true)
    OR v_row.process_attempts >= GREATEST(COALESCE(p_dead_letter_after, 5), 1);
  v_next_status := CASE WHEN v_dead_letter THEN 'dead_letter' ELSE 'failed' END;

  UPDATE public.stripe_raw_events
  SET processing_status = v_next_status,
      next_attempt_at = CASE
        WHEN v_dead_letter THEN NOW()
        ELSE NOW() + make_interval(secs => GREATEST(COALESCE(p_retry_delay_seconds, 60), 5))
      END,
      failed_at = NOW(),
      dead_letter_at = CASE WHEN v_dead_letter THEN NOW() ELSE dead_letter_at END,
      last_error_code = p_error_code,
      last_error_message = p_error_message,
      retryable = p_retryable,
      lock_id = NULL,
      locked_at = NULL,
      updated_at = NOW()
  WHERE id = p_raw_event_id;

  RETURN jsonb_build_object(
    'raw_event_id', p_raw_event_id,
    'stripe_event_id', v_row.stripe_event_id,
    'processing_status', v_next_status,
    'dead_letter', v_dead_letter
  );
END;
$function$;

ALTER TABLE public.stripe_raw_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staged_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staged_gift_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staged_gift_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_crm_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giving_reconciliation_runs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.stripe_raw_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.staged_gifts FROM anon, authenticated;
REVOKE ALL ON TABLE public.staged_gift_allocations FROM anon, authenticated;
REVOKE ALL ON TABLE public.staged_gift_audit_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.donation_crm_links FROM anon, authenticated;
REVOKE ALL ON TABLE public.giving_reconciliation_runs FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.stripe_raw_events TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.staged_gifts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.staged_gift_allocations TO service_role;
GRANT SELECT, INSERT ON TABLE public.staged_gift_audit_events TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.donation_crm_links TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.giving_reconciliation_runs TO service_role;

REVOKE EXECUTE ON FUNCTION public.claim_stripe_raw_event(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.complete_stripe_raw_event(UUID, UUID, TEXT, JSONB, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_stripe_raw_event_failure(UUID, UUID, TEXT, TEXT, BOOLEAN, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.claim_stripe_raw_event(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_stripe_raw_event(UUID, UUID, TEXT, JSONB, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_stripe_raw_event_failure(UUID, UUID, TEXT, TEXT, BOOLEAN, INTEGER, INTEGER) TO service_role;
