-- Foundation 1 schema forward migration
-- Ensure UUID generator is available before creating new tables.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- New tables
-- =========================================================

CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    story TEXT,
    channel TEXT NOT NULL DEFAULT 'email',
    status TEXT NOT NULL DEFAULT 'active',
    audience_filter JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    goal_amount BIGINT NOT NULL DEFAULT 0,
    current_amount BIGINT NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    share_url TEXT,
    slug TEXT UNIQUE,
    creator_donor_id UUID NOT NULL REFERENCES public.donors(id),
    missionary_id UUID NOT NULL REFERENCES public.missionaries(id),
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_goal CHECK (goal_amount >= 0),
    CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date > start_date),
    CONSTRAINT campaigns_share_url_unique UNIQUE (share_url)
);

CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    donor_id UUID REFERENCES public.donors(id) ON DELETE SET NULL,
    recipient_donor_id UUID NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notification_type TEXT NOT NULL DEFAULT 'campaign_update',
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    pledge_id UUID NOT NULL REFERENCES public.donor_pledges(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES public.donors(id) ON DELETE SET NULL,
    donation_id UUID REFERENCES public.donations(id) ON DELETE SET NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'created',
    amount BIGINT NOT NULL DEFAULT 0 CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'usd',
    scheduled_for_date DATE NOT NULL,
    stripe_payment_intent_id TEXT,
    gateway_response JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_code TEXT,
    error_message TEXT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- Existing table alters
-- =========================================================

ALTER TABLE public.tenants
    ADD COLUMN IF NOT EXISTS billing_email TEXT,
    ADD COLUMN IF NOT EXISTS default_timezone TEXT NOT NULL DEFAULT 'UTC',
    ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'en-US',
    ADD COLUMN IF NOT EXISTS stripe_webhook_secret TEXT;

ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS title TEXT,
    ADD COLUMN IF NOT EXISTS story TEXT,
    ADD COLUMN IF NOT EXISTS goal_amount BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS current_amount BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS share_url TEXT,
    ADD COLUMN IF NOT EXISTS slug TEXT,
    ADD COLUMN IF NOT EXISTS creator_donor_id UUID REFERENCES public.donors(id),
    ADD COLUMN IF NOT EXISTS missionary_id UUID REFERENCES public.missionaries(id),
    ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'campaigns'
      AND column_name = 'name'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'campaigns'
      AND column_name = 'title'
  ) THEN
    ALTER TABLE public.campaigns RENAME COLUMN name TO title;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'campaigns'
      AND column_name = 'description'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'campaigns'
      AND column_name = 'story'
  ) THEN
    ALTER TABLE public.campaigns RENAME COLUMN description TO story;
  END IF;
END $$;

ALTER TABLE public.campaigns
    ALTER COLUMN status SET DEFAULT 'active',
    ALTER COLUMN start_date TYPE TIMESTAMPTZ USING start_date::timestamptz,
    ALTER COLUMN start_date SET DEFAULT NOW(),
    ALTER COLUMN creator_donor_id SET NOT NULL,
    ALTER COLUMN missionary_id SET NOT NULL;

ALTER TABLE public.campaigns
    ALTER COLUMN goal_amount TYPE BIGINT USING (goal_amount * 100)::BIGINT,
    ALTER COLUMN goal_amount SET DEFAULT 0,
    ALTER COLUMN current_amount TYPE BIGINT USING (current_amount * 100)::BIGINT,
    ALTER COLUMN current_amount SET DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'valid_goal'
      AND conrelid = 'public.campaigns'::regclass
  ) THEN
    ALTER TABLE public.campaigns
      ADD CONSTRAINT valid_goal CHECK (goal_amount >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'valid_dates'
      AND conrelid = 'public.campaigns'::regclass
  ) THEN
    ALTER TABLE public.campaigns
      ADD CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date > start_date);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.campaigns'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%current_amount >= 0%'
  ) THEN
    ALTER TABLE public.campaigns
      ADD CONSTRAINT campaigns_current_amount_nonnegative CHECK (current_amount >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'campaigns_share_url_unique'
      AND conrelid = 'public.campaigns'::regclass
  ) THEN
    ALTER TABLE public.campaigns
      ADD CONSTRAINT campaigns_share_url_unique UNIQUE (share_url);
  END IF;
END $$;

ALTER TABLE public.notification_queue
    ADD COLUMN IF NOT EXISTS recipient_donor_id UUID REFERENCES public.donors(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS notification_type TEXT NOT NULL DEFAULT 'campaign_update';

-- Prevent a race where new rows with NULL recipient_donor_id are inserted
-- between backfill/cleanup and SET NOT NULL.
LOCK TABLE public.notification_queue IN SHARE ROW EXCLUSIVE MODE;

UPDATE public.notification_queue
SET recipient_donor_id = donor_id
WHERE recipient_donor_id IS NULL
  AND donor_id IS NOT NULL;

UPDATE public.notification_queue nq
SET recipient_donor_id = d.id
FROM public.donors d
WHERE nq.recipient_donor_id IS NULL
  AND nq.profile_id IS NOT NULL
  AND d.profile_id = nq.profile_id;

CREATE TABLE IF NOT EXISTS public.backup_notification_queue_orphans_20260214 (
    id UUID PRIMARY KEY,
    tenant_id UUID,
    campaign_id UUID,
    donor_id UUID,
    profile_id UUID,
    notification_type TEXT,
    channel TEXT,
    template_key TEXT,
    payload JSONB,
    dedupe_key TEXT,
    status TEXT,
    attempts INTEGER,
    scheduled_for TIMESTAMPTZ,
    available_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.backup_notification_queue_orphans_20260214 (
    id, tenant_id, campaign_id, donor_id, profile_id, notification_type, channel,
    template_key, payload, dedupe_key, status, attempts, scheduled_for, available_at,
    processed_at, last_error, created_at, updated_at
)
SELECT
    id, tenant_id, campaign_id, donor_id, profile_id, notification_type, channel,
    template_key, payload, dedupe_key, status, attempts, scheduled_for, available_at,
    processed_at, last_error, created_at, updated_at
FROM public.notification_queue
WHERE recipient_donor_id IS NULL
ON CONFLICT (id) DO NOTHING;

DELETE FROM public.notification_queue
WHERE recipient_donor_id IS NULL;

-- Final safety sweep in case additional rows slipped in during migration.
INSERT INTO public.backup_notification_queue_orphans_20260214 (
    id, tenant_id, campaign_id, donor_id, profile_id, notification_type, channel,
    template_key, payload, dedupe_key, status, attempts, scheduled_for, available_at,
    processed_at, last_error, created_at, updated_at
)
SELECT
    id, tenant_id, campaign_id, donor_id, profile_id, notification_type, channel,
    template_key, payload, dedupe_key, status, attempts, scheduled_for, available_at,
    processed_at, last_error, created_at, updated_at
FROM public.notification_queue
WHERE recipient_donor_id IS NULL
ON CONFLICT (id) DO NOTHING;

DELETE FROM public.notification_queue
WHERE recipient_donor_id IS NULL;

ALTER TABLE public.notification_queue
    ALTER COLUMN recipient_donor_id SET NOT NULL;

ALTER TABLE public.pledge_charge_attempts
    ADD COLUMN IF NOT EXISTS scheduled_for_date DATE,
    ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
    ADD COLUMN IF NOT EXISTS error_code TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.pledge_charge_attempts
SET scheduled_for_date = COALESCE(scheduled_for_date, attempted_at::date, CURRENT_DATE)
WHERE scheduled_for_date IS NULL;

ALTER TABLE public.pledge_charge_attempts
    ALTER COLUMN scheduled_for_date SET NOT NULL,
    ALTER COLUMN scheduled_for_date DROP DEFAULT,
    ALTER COLUMN status SET DEFAULT 'created';

ALTER TABLE public.donations
    ADD COLUMN IF NOT EXISTS gift_date DATE,
    ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS pledge_id UUID,
    ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS error_code TEXT,
    ADD COLUMN IF NOT EXISTS error_message TEXT,
    ADD COLUMN IF NOT EXISTS stripe_charge_id TEXT,
    ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS refund_amount BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS source TEXT;

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

UPDATE public.donations
SET refund_amount = COALESCE(refund_amount, 0)
WHERE refund_amount IS NULL;

UPDATE public.donations
SET source = COALESCE(source, donation_type, 'direct')
WHERE source IS NULL;

UPDATE public.donations
SET currency = COALESCE(currency, 'usd')
WHERE currency IS NULL;

ALTER TABLE public.donations
    ALTER COLUMN gift_date SET NOT NULL,
    ALTER COLUMN gift_date SET DEFAULT CURRENT_DATE,
    ALTER COLUMN currency SET NOT NULL,
    ALTER COLUMN currency SET DEFAULT 'usd',
    ALTER COLUMN refund_amount SET DEFAULT 0,
    ALTER COLUMN source SET DEFAULT 'direct';

ALTER TABLE public.donor_pledges
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS missionary_id UUID REFERENCES public.missionaries(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS fund_id UUID REFERENCES public.funds(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'usd',
    ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
    ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_charge_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS next_charge_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS billing_day_of_month INTEGER,
    ADD COLUMN IF NOT EXISTS billing_timezone TEXT,
    ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT,
    ADD COLUMN IF NOT EXISTS last_charge_attempt TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS failed_charge_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS pause_reason TEXT,
    ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;

UPDATE public.donor_pledges dp
SET tenant_id = d.tenant_id
FROM public.donors d
WHERE dp.tenant_id IS NULL
  AND dp.donor_id = d.id;

UPDATE public.donor_pledges
SET next_charge_at = next_payment_date::timestamptz
WHERE next_charge_at IS NULL
  AND next_payment_date IS NOT NULL;

UPDATE public.donor_pledges
SET failed_charge_count = COALESCE(failed_charge_count, 0)
WHERE failed_charge_count IS NULL;

ALTER TABLE public.donor_pledges
    ALTER COLUMN failed_charge_count SET DEFAULT 0;

ALTER TABLE public.donors
    ADD COLUMN IF NOT EXISTS first_gift_date DATE,
    ADD COLUMN IF NOT EXISTS gift_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS do_not_contact BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS do_not_email BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS receipt_email_frequency TEXT NOT NULL DEFAULT 'monthly',
    ADD COLUMN IF NOT EXISTS default_update_frequency TEXT,
    ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en';

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

UPDATE public.donors
SET receipt_email_frequency = COALESCE(receipt_email_frequency, 'monthly'),
    preferred_language = COALESCE(preferred_language, 'en')
WHERE receipt_email_frequency IS NULL
   OR preferred_language IS NULL;

ALTER TABLE public.follows
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved',
    ADD COLUMN IF NOT EXISTS is_donor BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS notification_frequency TEXT,
    ADD COLUMN IF NOT EXISTS muted BOOLEAN NOT NULL DEFAULT FALSE;

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

UPDATE public.follows
SET muted = COALESCE(muted, FALSE)
WHERE muted IS NULL;

-- =========================================================
-- Money columns: backup and convert to integer cents
-- =========================================================

CREATE TABLE IF NOT EXISTS public.backup_money_donations_20260214 AS
SELECT id, amount FROM public.donations;

CREATE TABLE IF NOT EXISTS public.backup_money_donor_pledges_20260214 AS
SELECT id, amount, total_paid, total_expected FROM public.donor_pledges;

CREATE TABLE IF NOT EXISTS public.backup_money_funds_20260214 AS
SELECT id, target_amount, goal_amount, current_amount FROM public.funds;

CREATE TABLE IF NOT EXISTS public.backup_money_pledge_charge_attempts_20260214 AS
SELECT id, amount FROM public.pledge_charge_attempts;

CREATE TABLE IF NOT EXISTS public.backup_money_donors_20260214 AS
SELECT id, total_given, last_gift_amount FROM public.donors;

CREATE TABLE IF NOT EXISTS public.backup_money_donor_activities_20260214 AS
SELECT id, amount FROM public.donor_activities;

CREATE TABLE IF NOT EXISTS public.backup_money_missionaries_20260214 AS
SELECT id, funding_goal, current_funding FROM public.missionaries;

ALTER TABLE public.donations
    ALTER COLUMN amount TYPE BIGINT USING (amount * 100)::BIGINT,
    ALTER COLUMN amount SET DEFAULT 0;

ALTER TABLE public.donor_pledges
    ALTER COLUMN amount TYPE BIGINT USING (amount * 100)::BIGINT,
    ALTER COLUMN amount SET DEFAULT 0,
    ALTER COLUMN total_paid TYPE BIGINT USING (total_paid * 100)::BIGINT,
    ALTER COLUMN total_paid SET DEFAULT 0,
    ALTER COLUMN total_expected TYPE BIGINT USING (total_expected * 100)::BIGINT,
    ALTER COLUMN total_expected SET DEFAULT 0;

UPDATE public.donor_pledges
SET amount = COALESCE(amount, 0),
    total_paid = COALESCE(total_paid, 0),
    total_expected = COALESCE(total_expected, 0)
WHERE amount IS NULL
   OR total_paid IS NULL
   OR total_expected IS NULL;

ALTER TABLE public.donor_pledges
    ALTER COLUMN amount SET NOT NULL,
    ALTER COLUMN total_paid SET NOT NULL,
    ALTER COLUMN total_expected SET NOT NULL;

ALTER TABLE public.funds
    ALTER COLUMN target_amount TYPE BIGINT USING (target_amount * 100)::BIGINT,
    ALTER COLUMN target_amount SET DEFAULT 0,
    ALTER COLUMN goal_amount TYPE BIGINT USING (goal_amount * 100)::BIGINT,
    ALTER COLUMN goal_amount SET DEFAULT 0,
    ALTER COLUMN current_amount TYPE BIGINT USING (current_amount * 100)::BIGINT,
    ALTER COLUMN current_amount SET DEFAULT 0;

UPDATE public.funds
SET target_amount = COALESCE(target_amount, 0),
    goal_amount = COALESCE(goal_amount, 0),
    current_amount = COALESCE(current_amount, 0)
WHERE target_amount IS NULL
   OR goal_amount IS NULL
   OR current_amount IS NULL;

ALTER TABLE public.funds
    ALTER COLUMN target_amount SET NOT NULL,
    ALTER COLUMN goal_amount SET NOT NULL,
    ALTER COLUMN current_amount SET NOT NULL;

ALTER TABLE public.pledge_charge_attempts
    ALTER COLUMN amount TYPE BIGINT USING (amount * 100)::BIGINT,
    ALTER COLUMN amount SET DEFAULT 0;

ALTER TABLE public.donors
    ALTER COLUMN total_given TYPE BIGINT USING (total_given * 100)::BIGINT,
    ALTER COLUMN total_given SET DEFAULT 0,
    ALTER COLUMN last_gift_amount TYPE BIGINT USING (last_gift_amount * 100)::BIGINT,
    ALTER COLUMN last_gift_amount SET DEFAULT 0;

ALTER TABLE public.donor_activities
    ALTER COLUMN amount TYPE BIGINT USING (amount * 100)::BIGINT,
    ALTER COLUMN amount SET DEFAULT 0;

ALTER TABLE public.missionaries
    ALTER COLUMN funding_goal TYPE BIGINT USING (funding_goal * 100)::BIGINT,
    ALTER COLUMN funding_goal SET DEFAULT 0,
    ALTER COLUMN current_funding TYPE BIGINT USING (current_funding * 100)::BIGINT,
    ALTER COLUMN current_funding SET DEFAULT 0;

ALTER TABLE public.donations
    ADD CONSTRAINT donations_amount_nonnegative CHECK (amount >= 0),
    ADD CONSTRAINT donations_refund_amount_nonnegative CHECK (refund_amount >= 0);

ALTER TABLE public.donor_pledges
    ADD CONSTRAINT donor_pledges_amount_nonnegative CHECK (amount >= 0),
    ADD CONSTRAINT donor_pledges_total_paid_nonnegative CHECK (total_paid >= 0),
    ADD CONSTRAINT donor_pledges_total_expected_nonnegative CHECK (total_expected >= 0);

ALTER TABLE public.funds
    ADD CONSTRAINT funds_target_amount_nonnegative CHECK (target_amount >= 0),
    ADD CONSTRAINT funds_goal_amount_nonnegative CHECK (goal_amount >= 0),
    ADD CONSTRAINT funds_current_amount_nonnegative CHECK (current_amount >= 0);

ALTER TABLE public.pledge_charge_attempts
    ADD CONSTRAINT pledge_charge_attempts_amount_nonnegative CHECK (amount >= 0);

ALTER TABLE public.donors
    ADD CONSTRAINT donors_total_given_nonnegative CHECK (total_given >= 0),
    ADD CONSTRAINT donors_last_gift_amount_nonnegative CHECK (last_gift_amount IS NULL OR last_gift_amount >= 0);

ALTER TABLE public.donor_activities
    ADD CONSTRAINT donor_activities_amount_nonnegative CHECK (amount IS NULL OR amount >= 0);

ALTER TABLE public.missionaries
    ADD CONSTRAINT missionaries_funding_goal_nonnegative CHECK (funding_goal >= 0),
    ADD CONSTRAINT missionaries_current_funding_nonnegative CHECK (current_funding >= 0);

-- Guardrail for conversion correctness:
-- these columns were migrated from NUMERIC dollars to BIGINT cents, so
-- existing values should be divisible by 100 (whole-dollar source values).
CREATE OR REPLACE FUNCTION public.assert_amount_columns_multiple_of_100()
RETURNS VOID
LANGUAGE plpgsql
AS $function$
DECLARE
    invalid_count BIGINT;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM (
        SELECT amount AS v FROM public.donations WHERE amount IS NOT NULL AND mod(amount, 100) <> 0
        UNION ALL
        SELECT amount AS v FROM public.donor_pledges WHERE amount IS NOT NULL AND mod(amount, 100) <> 0
        UNION ALL
        SELECT total_paid AS v FROM public.donor_pledges WHERE total_paid IS NOT NULL AND mod(total_paid, 100) <> 0
        UNION ALL
        SELECT total_expected AS v FROM public.donor_pledges WHERE total_expected IS NOT NULL AND mod(total_expected, 100) <> 0
        UNION ALL
        SELECT target_amount AS v FROM public.funds WHERE target_amount IS NOT NULL AND mod(target_amount, 100) <> 0
        UNION ALL
        SELECT goal_amount AS v FROM public.funds WHERE goal_amount IS NOT NULL AND mod(goal_amount, 100) <> 0
        UNION ALL
        SELECT current_amount AS v FROM public.funds WHERE current_amount IS NOT NULL AND mod(current_amount, 100) <> 0
        UNION ALL
        SELECT amount AS v FROM public.pledge_charge_attempts WHERE amount IS NOT NULL AND mod(amount, 100) <> 0
        UNION ALL
        SELECT total_given AS v FROM public.donors WHERE total_given IS NOT NULL AND mod(total_given, 100) <> 0
        UNION ALL
        SELECT last_gift_amount AS v FROM public.donors WHERE last_gift_amount IS NOT NULL AND mod(last_gift_amount, 100) <> 0
        UNION ALL
        SELECT amount AS v FROM public.donor_activities WHERE amount IS NOT NULL AND mod(amount, 100) <> 0
        UNION ALL
        SELECT funding_goal AS v FROM public.missionaries WHERE funding_goal IS NOT NULL AND mod(funding_goal, 100) <> 0
        UNION ALL
        SELECT current_funding AS v FROM public.missionaries WHERE current_funding IS NOT NULL AND mod(current_funding, 100) <> 0
    ) violations;

    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Amount verification failed: % rows are not integer cent amounts', invalid_count;
    END IF;
END;
$function$;

-- =========================================================
-- Performance indexes
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_donations_tenant_gift_date
    ON public.donations (tenant_id, gift_date DESC);

CREATE INDEX IF NOT EXISTS idx_posts_missionary_created_at
    ON public.posts (missionary_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_visibility_status
    ON public.posts (visibility, status);

CREATE INDEX IF NOT EXISTS idx_donations_donor_gift_date
    ON public.donations (donor_id, gift_date DESC);

CREATE INDEX IF NOT EXISTS idx_donations_missionary_gift_date
    ON public.donations (missionary_id, gift_date DESC);

CREATE INDEX IF NOT EXISTS idx_donations_pledge_id
    ON public.donations (pledge_id);

CREATE INDEX IF NOT EXISTS idx_donations_status_completed
    ON public.donations (status)
    WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_donations_campaign_id
    ON public.donations (campaign_id);

CREATE INDEX IF NOT EXISTS idx_donations_tenant_year_gift
    ON public.donations (tenant_id, DATE_TRUNC('year', gift_date::timestamp));

CREATE INDEX IF NOT EXISTS idx_donations_donor_year_gift
    ON public.donations (donor_id, DATE_TRUNC('year', gift_date::timestamp));

CREATE INDEX IF NOT EXISTS idx_donors_tenant_status
    ON public.donors (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_donor_pledges_donor_status
    ON public.donor_pledges (donor_id, status);

CREATE INDEX IF NOT EXISTS idx_donor_pledges_tenant_status_next_charge
    ON public.donor_pledges (tenant_id, status, next_charge_at);

CREATE INDEX IF NOT EXISTS idx_donor_pledges_next_payment_active
    ON public.donor_pledges (next_payment_date)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_follows_missionary_status
    ON public.follows (missionary_id, status);

CREATE INDEX IF NOT EXISTS idx_follows_donor_status
    ON public.follows (donor_id, status);

CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_status
    ON public.campaigns (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_scheduled_for
    ON public.campaigns (tenant_id, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_campaigns_creator_donor_id
    ON public.campaigns (creator_donor_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_missionary_id
    ON public.campaigns (missionary_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_slug
    ON public.campaigns (slug);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status_available_at
    ON public.notification_queue (status, available_at);

CREATE INDEX IF NOT EXISTS idx_notification_queue_tenant_status_scheduled
    ON public.notification_queue (tenant_id, status, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_notification_queue_campaign_id
    ON public.notification_queue (campaign_id);

CREATE INDEX IF NOT EXISTS idx_notification_queue_recipient_donor_id
    ON public.notification_queue (recipient_donor_id);

CREATE INDEX IF NOT EXISTS idx_notification_queue_tenant_type_status
    ON public.notification_queue (tenant_id, notification_type, status);

-- Dedupe index shape changed in this migration:
--   previous/rollback shape: (tenant_id, channel, dedupe_key) WHERE dedupe_key IS NOT NULL
--   new/forward shape: (tenant_id, recipient_donor_id, notification_type, channel, dedupe_key) WHERE dedupe_key IS NOT NULL
DROP INDEX IF EXISTS public.idx_notification_queue_tenant_channel_dedupe;
CREATE UNIQUE INDEX idx_notification_queue_tenant_channel_dedupe
    ON public.notification_queue (tenant_id, recipient_donor_id, notification_type, channel, dedupe_key)
    WHERE dedupe_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pledge_charge_attempts_pledge_attempted_at
    ON public.pledge_charge_attempts (pledge_id, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_pledge_charge_attempts_tenant_status_attempted_at
    ON public.pledge_charge_attempts (tenant_id, status, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_pledge_charge_attempts_tenant_scheduled_status
    ON public.pledge_charge_attempts (tenant_id, scheduled_for_date, status);

CREATE INDEX IF NOT EXISTS idx_pledge_charge_attempts_donation_id
    ON public.pledge_charge_attempts (donation_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pledge_charge_attempts_tenant_pledge_schedule_attempt
    ON public.pledge_charge_attempts (tenant_id, pledge_id, scheduled_for_date, attempt_number);

