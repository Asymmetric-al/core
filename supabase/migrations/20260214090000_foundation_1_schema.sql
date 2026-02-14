-- Foundation 1 schema forward migration
-- NOTE: We intentionally use uuid_generate_v4() for new table IDs in this
-- migration so defaults stay aligned with supabase/schema.sql (canonical schema)
-- and avoid schema drift/confusion between migration-applied and recreated DBs.

-- =========================================================
-- New tables
-- =========================================================

CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    channel TEXT NOT NULL DEFAULT 'email',
    status TEXT NOT NULL DEFAULT 'draft',
    audience_filter JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    donor_id UUID REFERENCES public.donors(id) ON DELETE SET NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    channel TEXT NOT NULL DEFAULT 'email',
    template_key TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    dedupe_key TEXT,
    status TEXT NOT NULL DEFAULT 'queued',
    attempts INTEGER NOT NULL DEFAULT 0,
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pledge_charge_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    pledge_id UUID NOT NULL REFERENCES public.donor_pledges(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES public.donors(id) ON DELETE SET NULL,
    donation_id UUID REFERENCES public.donations(id) ON DELETE SET NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending',
    amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'usd',
    gateway_response JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- Existing table alters
-- =========================================================

ALTER TABLE public.tenants
    ADD COLUMN IF NOT EXISTS billing_email TEXT,
    ADD COLUMN IF NOT EXISTS default_timezone TEXT NOT NULL DEFAULT 'UTC',
    ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'en-US';

ALTER TABLE public.donations
    ADD COLUMN IF NOT EXISTS gift_date DATE,
    ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS pledge_id UUID,
    ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'donations_pledge_id_fkey'
  ) THEN
    ALTER TABLE public.donations
    ADD CONSTRAINT donations_pledge_id_fkey
    FOREIGN KEY (pledge_id) REFERENCES public.donor_pledges(id) ON DELETE SET NULL;
  END IF;
END $$;

UPDATE public.donations
SET gift_date = COALESCE(gift_date, created_at::date, CURRENT_DATE)
WHERE gift_date IS NULL;

ALTER TABLE public.donations
    ALTER COLUMN gift_date SET NOT NULL,
    ALTER COLUMN gift_date SET DEFAULT CURRENT_DATE;

ALTER TABLE public.donor_pledges
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS missionary_id UUID REFERENCES public.missionaries(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS fund_id UUID REFERENCES public.funds(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'usd',
    ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
    ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_charge_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS next_charge_at TIMESTAMPTZ;

UPDATE public.donor_pledges dp
SET tenant_id = d.tenant_id
FROM public.donors d
WHERE dp.tenant_id IS NULL
  AND dp.donor_id = d.id;

UPDATE public.donor_pledges
SET next_charge_at = next_payment_date::timestamptz
WHERE next_charge_at IS NULL
  AND next_payment_date IS NOT NULL;

ALTER TABLE public.donors
    ADD COLUMN IF NOT EXISTS first_gift_date DATE,
    ADD COLUMN IF NOT EXISTS gift_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS do_not_contact BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS do_not_email BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.donors d
SET
    first_gift_date = x.first_gift_date,
    last_gift_date = x.last_gift_ts,
    gift_count = x.gift_count
FROM (
    SELECT
        donor_id,
        MIN(gift_date)::date AS first_gift_date,
        MAX(gift_date)::timestamptz AS last_gift_ts,
        COUNT(*)::integer AS gift_count
    FROM public.donations
    WHERE donor_id IS NOT NULL
    GROUP BY donor_id
) x
WHERE d.id = x.donor_id;

ALTER TABLE public.follows
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved',
    ADD COLUMN IF NOT EXISTS is_donor BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

UPDATE public.follows f
SET
    approved_at = COALESCE(f.approved_at, f.created_at),
    is_donor = EXISTS (
        SELECT 1
        FROM public.donors d
        WHERE d.id = f.donor_id
          AND COALESCE(d.total_given, 0) > 0
    )
WHERE f.approved_at IS NULL
   OR f.is_donor IS DISTINCT FROM EXISTS (
        SELECT 1
        FROM public.donors d
        WHERE d.id = f.donor_id
          AND COALESCE(d.total_given, 0) > 0
    );

-- =========================================================
-- Performance indexes
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_donations_tenant_gift_date
    ON public.donations (tenant_id, gift_date DESC);

CREATE INDEX IF NOT EXISTS idx_donations_donor_gift_date
    ON public.donations (donor_id, gift_date DESC);

CREATE INDEX IF NOT EXISTS idx_donations_missionary_gift_date
    ON public.donations (missionary_id, gift_date DESC);

CREATE INDEX IF NOT EXISTS idx_donations_pledge_id
    ON public.donations (pledge_id);

CREATE INDEX IF NOT EXISTS idx_donors_tenant_status
    ON public.donors (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_donor_pledges_donor_status
    ON public.donor_pledges (donor_id, status);

CREATE INDEX IF NOT EXISTS idx_donor_pledges_tenant_status_next_charge
    ON public.donor_pledges (tenant_id, status, next_charge_at);

CREATE INDEX IF NOT EXISTS idx_follows_missionary_status
    ON public.follows (missionary_id, status);

CREATE INDEX IF NOT EXISTS idx_follows_donor_status
    ON public.follows (donor_id, status);

CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_status
    ON public.campaigns (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_scheduled_for
    ON public.campaigns (tenant_id, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status_available_at
    ON public.notification_queue (status, available_at);

CREATE INDEX IF NOT EXISTS idx_notification_queue_tenant_status_scheduled
    ON public.notification_queue (tenant_id, status, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_notification_queue_campaign_id
    ON public.notification_queue (campaign_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_queue_tenant_channel_dedupe
    ON public.notification_queue (tenant_id, channel, dedupe_key)
    WHERE dedupe_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pledge_charge_attempts_pledge_attempted_at
    ON public.pledge_charge_attempts (pledge_id, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_pledge_charge_attempts_tenant_status_attempted_at
    ON public.pledge_charge_attempts (tenant_id, status, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_pledge_charge_attempts_donation_id
    ON public.pledge_charge_attempts (donation_id);

