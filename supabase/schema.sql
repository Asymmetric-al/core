-- Supabase Schema for Asymmetric.al
-- Canonical schema for the hosted Supabase project

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- TABLES
-- ==========================================

-- 1. Tenants (Organizations)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    org_post_visibility TEXT DEFAULT 'all_donors',
    org_settings JSONB DEFAULT '{}'::jsonb,
    stripe_secret_key TEXT,
    stripe_publishable_key TEXT,
    stripe_webhook_secret TEXT,
    billing_email TEXT,
    default_timezone TEXT NOT NULL DEFAULT 'UTC',
    locale TEXT NOT NULL DEFAULT 'en-US',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles (Unified User Table)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID UNIQUE, -- Redundant but used in some queries
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    display_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'donor', -- 'admin', 'missionary', 'donor'
    tenant_id UUID REFERENCES public.tenants(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Missionaries
CREATE TABLE IF NOT EXISTS public.missionaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio TEXT,
    mission_field TEXT,
    funding_goal BIGINT DEFAULT 0,
    current_funding BIGINT DEFAULT 0,
    tagline TEXT,
    location TEXT,
    phone TEXT,
    cover_url TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Donors
CREATE TABLE IF NOT EXISTS public.donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    profile_id UUID REFERENCES public.profiles(id),
    missionary_id UUID REFERENCES public.profiles(id), -- The missionary this donor is primarily associated with
    name TEXT,
    email TEXT,
    phone TEXT,
    mobile TEXT,
    work_phone TEXT,
    preferred_contact TEXT DEFAULT 'email',
    avatar_url TEXT,
    location TEXT,
    type TEXT DEFAULT 'individual',
    status TEXT DEFAULT 'active',
    giving_preferences JSONB DEFAULT '{}'::jsonb,
    total_given BIGINT DEFAULT 0 CHECK (total_given >= 0),
    first_gift_date DATE,
    last_gift_date TIMESTAMPTZ,
    last_gift_amount BIGINT DEFAULT 0 CHECK (last_gift_amount IS NULL OR last_gift_amount >= 0),
    gift_count INTEGER NOT NULL DEFAULT 0,
    frequency TEXT,
    joined_date DATE DEFAULT CURRENT_DATE,
    tags TEXT[],
    score NUMERIC DEFAULT 0,
    address JSONB,
    work_address JSONB,
    website TEXT,
    organization TEXT,
    title TEXT,
    birthday DATE,
    anniversary DATE,
    spouse TEXT,
    notes TEXT,
    do_not_contact BOOLEAN NOT NULL DEFAULT FALSE,
    do_not_email BOOLEAN NOT NULL DEFAULT FALSE,
    receipt_email_frequency TEXT NOT NULL DEFAULT 'monthly',
    default_update_frequency TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'en',
    has_active_pledge BOOLEAN DEFAULT FALSE,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Funds (Projects / Designated Funds)
CREATE TABLE IF NOT EXISTS public.funds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    name TEXT NOT NULL,
    description TEXT,
    target_amount BIGINT NOT NULL DEFAULT 0 CHECK (target_amount >= 0),
    goal_amount BIGINT NOT NULL DEFAULT 0 CHECK (goal_amount >= 0),
    current_amount BIGINT NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    currency TEXT DEFAULT 'usd',
    missionary_id UUID REFERENCES public.missionaries(id),
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Posts (Updates from Missionaries or Org)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    missionary_id UUID REFERENCES public.profiles(id),
    title TEXT,
    content TEXT,
    media JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    post_type TEXT DEFAULT 'Update',
    type TEXT DEFAULT 'missionary_update', -- 'org_update', 'missionary_update'
    visibility TEXT DEFAULT 'public', -- 'public', 'partners_only'
    status TEXT DEFAULT 'published',
    like_count INTEGER DEFAULT 0,
    prayer_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Interactions
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_prayers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_fires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    parent_id UUID REFERENCES public.post_comments(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Campaigns
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

-- 9. Donations
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    donor_id UUID REFERENCES public.donors(id),
    missionary_id UUID REFERENCES public.missionaries(id),
    fund_id UUID REFERENCES public.funds(id),
    amount BIGINT NOT NULL DEFAULT 0 CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT DEFAULT 'pending',
    donation_type TEXT DEFAULT 'one_time',
    payment_method TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_interval TEXT,
    notes TEXT,
    stripe_payment_intent_id TEXT,
    gift_date DATE NOT NULL DEFAULT CURRENT_DATE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    pledge_id UUID,
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    error_code TEXT,
    error_message TEXT,
    stripe_charge_id TEXT,
    refunded_at TIMESTAMPTZ,
    refund_amount BIGINT NOT NULL DEFAULT 0 CHECK (refund_amount >= 0),
    source TEXT DEFAULT 'direct',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Follows (Donors following missionaries)
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    donor_id UUID REFERENCES public.donors(id),
    missionary_id UUID REFERENCES public.profiles(id),
    status TEXT NOT NULL DEFAULT 'approved',
    is_donor BOOLEAN NOT NULL DEFAULT FALSE,
    approved_at TIMESTAMPTZ,
    notification_frequency TEXT,
    muted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(donor_id, missionary_id)
);

-- 11. Notification Queue
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

-- 12. Donor Feed Preferences
CREATE TABLE IF NOT EXISTS public.donor_feed_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID REFERENCES public.donors(id),
    tenant_id UUID REFERENCES public.tenants(id),
    show_org_posts BOOLEAN DEFAULT TRUE,
    show_missionary_posts BOOLEAN DEFAULT TRUE,
    follow_org BOOLEAN DEFAULT TRUE,
    email_org_posts BOOLEAN DEFAULT FALSE,
    email_missionary_posts BOOLEAN DEFAULT FALSE,
    push_org_posts BOOLEAN DEFAULT FALSE,
    push_missionary_posts BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(donor_id, tenant_id)
);

-- 13. Donor Activities
CREATE TABLE IF NOT EXISTS public.donor_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID REFERENCES public.donors(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ,
    amount BIGINT DEFAULT 0 CHECK (amount IS NULL OR amount >= 0),
    status TEXT,
    gift_type TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Donor Pledges
CREATE TABLE IF NOT EXISTS public.donor_pledges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    donor_id UUID REFERENCES public.donors(id),
    missionary_id UUID REFERENCES public.missionaries(id) ON DELETE SET NULL,
    fund_id UUID REFERENCES public.funds(id) ON DELETE SET NULL,
    amount BIGINT NOT NULL DEFAULT 0 CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'usd',
    frequency TEXT,
    status TEXT DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    next_payment_date DATE,
    stripe_subscription_id TEXT,
    billing_day_of_month INTEGER,
    billing_timezone TEXT,
    stripe_payment_method_id TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_charge_at TIMESTAMPTZ,
    last_charge_attempt TIMESTAMPTZ,
    failed_charge_count INTEGER NOT NULL DEFAULT 0,
    pause_reason TEXT,
    paused_at TIMESTAMPTZ,
    next_charge_at TIMESTAMPTZ,
    total_paid BIGINT NOT NULL DEFAULT 0 CHECK (total_paid >= 0),
    total_expected BIGINT NOT NULL DEFAULT 0 CHECK (total_expected >= 0),
    payments_completed INTEGER DEFAULT 0,
    payments_remaining INTEGER DEFAULT 0,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- 15. Pledge Charge Attempts
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

-- 16. Follower Requests
CREATE TABLE IF NOT EXISTS public.follower_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID REFERENCES public.donors(id),
    missionary_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'pending',
    access_level TEXT DEFAULT 'view',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    UNIQUE(donor_id, missionary_id)
);

-- 17. Locations
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    title TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    type TEXT DEFAULT 'custom',
    linked_id TEXT,
    summary TEXT,
    image_public_id TEXT,
    status TEXT DEFAULT 'draft',
    sort_key INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Missionary Tasks
CREATE TABLE IF NOT EXISTS public.missionary_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    missionary_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES public.donors(id),
    title VARCHAR NOT NULL,
    description TEXT,
    task_type VARCHAR,
    status VARCHAR DEFAULT 'pending',
    priority VARCHAR DEFAULT 'medium',
    sort_key INTEGER DEFAULT 0,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. PDF Templates
CREATE TABLE IF NOT EXISTS public.pdf_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    name TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    design JSONB NOT NULL,
    html TEXT,
    category TEXT DEFAULT 'custom',
    page_size TEXT DEFAULT 'Letter',
    orientation TEXT DEFAULT 'portrait',
    margins JSONB DEFAULT '{"top":72,"right":72,"bottom":72,"left":72}'::jsonb,
    tags TEXT[] DEFAULT '{}'::text[],
    status TEXT DEFAULT 'draft',
    is_default BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    user_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Assets
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_id TEXT NOT NULL,
    secure_url TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    format TEXT,
    resource_type TEXT DEFAULT 'image',
    purpose TEXT,
    user_id UUID,
    tenant_id UUID REFERENCES public.tenants(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- BACKFILLS
-- ==========================================

UPDATE public.donations
SET gift_date = COALESCE(gift_date, created_at::date, CURRENT_DATE)
WHERE gift_date IS NULL;

UPDATE public.donations
SET refund_amount = COALESCE(refund_amount, 0)
WHERE refund_amount IS NULL;

UPDATE public.donations
SET source = COALESCE(source, donation_type, 'direct')
WHERE source IS NULL;

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

-- ==========================================
-- INDEXES
-- ==========================================

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

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_queue_tenant_channel_dedupe
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

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- RPC helpers for post counters
CREATE OR REPLACE FUNCTION public.increment_post_like_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET like_count = COALESCE(like_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_post_like_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_post_prayer_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET prayer_count = COALESCE(prayer_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_post_prayer_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET prayer_count = GREATEST(COALESCE(prayer_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_post_fire_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET fires_count = COALESCE(fires_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_post_fire_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET fires_count = GREATEST(COALESCE(fires_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_post_comment_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET comment_count = COALESCE(comment_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

-- ==========================================
-- STORAGE BUCKETS & POLICIES
-- ==========================================

-- Buckets used by the app (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('profiles', 'profiles', true),
  ('document-uploads', 'document-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for uploaded media
DROP POLICY IF EXISTS "Public read profiles" ON storage.objects;
CREATE POLICY "Public read profiles"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profiles');

DROP POLICY IF EXISTS "Public read document-uploads" ON storage.objects;
CREATE POLICY "Public read document-uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'document-uploads');

-- Authenticated uploads (client-side)
DROP POLICY IF EXISTS "Authenticated upload profiles" ON storage.objects;
CREATE POLICY "Authenticated upload profiles"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated upload document-uploads" ON storage.objects;
CREATE POLICY "Authenticated upload document-uploads"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'document-uploads' AND auth.role() = 'authenticated');

-- Owner update/delete for authenticated users
DROP POLICY IF EXISTS "Owner update profiles" ON storage.objects;
CREATE POLICY "Owner update profiles"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profiles' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'profiles' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Owner delete profiles" ON storage.objects;
CREATE POLICY "Owner delete profiles"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'profiles' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Owner update document-uploads" ON storage.objects;
CREATE POLICY "Owner update document-uploads"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'document-uploads' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'document-uploads' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Owner delete document-uploads" ON storage.objects;
CREATE POLICY "Owner delete document-uploads"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'document-uploads' AND auth.uid() = owner);

-- Trigger to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, first_name, last_name, full_name, avatar_url, role, tenant_id)
  VALUES (
    new.id,
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      TRIM(CONCAT(new.raw_user_meta_data->>'first_name', ' ', new.raw_user_meta_data->>'last_name'))
    ),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'donor'),
    COALESCE((new.raw_app_meta_data->>'tenant_id')::uuid, '00000000-0000-0000-0000-000000000001'::uuid)
  );
  RETURN new;
END;
$function$;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- SEED DATA
-- ==========================================

-- Create default tenant
INSERT INTO public.tenants (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'GiveHope Organization', 'give-hope')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- RLS (Row Level Security)
-- ==========================================
-- For development/demo ease, we are keeping RLS disabled on most tables.
-- In production, you MUST enable RLS and define policies.

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.missionaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_prayers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_fires DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.funds DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pledge_charge_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_feed_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_pledges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follower_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.missionary_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets DISABLE ROW LEVEL SECURITY;
