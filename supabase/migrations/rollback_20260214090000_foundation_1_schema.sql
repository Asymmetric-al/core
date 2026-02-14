-- Foundation 1 schema rollback migration

-- =========================================================
-- Drop performance indexes
-- =========================================================

DROP INDEX IF EXISTS public.idx_pledge_charge_attempts_donation_id;
DROP INDEX IF EXISTS public.idx_posts_visibility_status;
DROP INDEX IF EXISTS public.idx_posts_missionary_created_at;
DROP INDEX IF EXISTS public.idx_pledge_charge_attempts_tenant_scheduled_status;
DROP INDEX IF EXISTS public.idx_pledge_charge_attempts_tenant_status_attempted_at;
DROP INDEX IF EXISTS public.idx_pledge_charge_attempts_pledge_attempted_at;
DROP INDEX IF EXISTS public.idx_pledge_charge_attempts_tenant_pledge_schedule_attempt;
DROP INDEX IF EXISTS public.idx_notification_queue_tenant_channel_dedupe;
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_queue_tenant_channel_dedupe
    ON public.notification_queue (tenant_id, channel, dedupe_key)
    WHERE dedupe_key IS NOT NULL;
DROP INDEX IF EXISTS public.idx_notification_queue_tenant_type_status;
DROP INDEX IF EXISTS public.idx_notification_queue_recipient_donor_id;
DROP INDEX IF EXISTS public.idx_notification_queue_campaign_id;
DROP INDEX IF EXISTS public.idx_notification_queue_tenant_status_scheduled;
DROP INDEX IF EXISTS public.idx_notification_queue_status_available_at;
DROP INDEX IF EXISTS public.idx_campaigns_slug;
DROP INDEX IF EXISTS public.idx_campaigns_missionary_id;
DROP INDEX IF EXISTS public.idx_campaigns_creator_donor_id;
DROP INDEX IF EXISTS public.idx_campaigns_tenant_scheduled_for;
DROP INDEX IF EXISTS public.idx_campaigns_tenant_status;
DROP INDEX IF EXISTS public.idx_follows_donor_status;
DROP INDEX IF EXISTS public.idx_follows_missionary_status;
DROP INDEX IF EXISTS public.idx_donor_pledges_next_payment_active;
DROP INDEX IF EXISTS public.idx_donor_pledges_tenant_status_next_charge;
DROP INDEX IF EXISTS public.idx_donor_pledges_donor_status;
DROP INDEX IF EXISTS public.idx_donors_tenant_status;
DROP INDEX IF EXISTS public.idx_donations_donor_year_gift;
DROP INDEX IF EXISTS public.idx_donations_tenant_year_gift;
DROP INDEX IF EXISTS public.idx_donations_campaign_id;
DROP INDEX IF EXISTS public.idx_donations_status_completed;
DROP INDEX IF EXISTS public.idx_donations_pledge_id;
DROP INDEX IF EXISTS public.idx_donations_missionary_gift_date;
DROP INDEX IF EXISTS public.idx_donations_donor_gift_date;
DROP INDEX IF EXISTS public.idx_donations_tenant_gift_date;

DROP FUNCTION IF EXISTS public.assert_amount_columns_multiple_of_100();

-- =========================================================
-- Remove added columns from existing tables
-- =========================================================

ALTER TABLE public.follows
    DROP COLUMN IF EXISTS muted,
    DROP COLUMN IF EXISTS notification_frequency,
    DROP COLUMN IF EXISTS approved_at,
    DROP COLUMN IF EXISTS is_donor,
    DROP COLUMN IF EXISTS status;

ALTER TABLE public.donors
    DROP COLUMN IF EXISTS preferred_language,
    DROP COLUMN IF EXISTS default_update_frequency,
    DROP COLUMN IF EXISTS receipt_email_frequency,
    DROP COLUMN IF EXISTS do_not_email,
    DROP COLUMN IF EXISTS do_not_contact,
    DROP COLUMN IF EXISTS gift_count,
    DROP COLUMN IF EXISTS first_gift_date;

ALTER TABLE public.donor_pledges
    DROP COLUMN IF EXISTS paused_at,
    DROP COLUMN IF EXISTS pause_reason,
    DROP COLUMN IF EXISTS failed_charge_count,
    DROP COLUMN IF EXISTS last_charge_attempt,
    DROP COLUMN IF EXISTS stripe_payment_method_id,
    DROP COLUMN IF EXISTS billing_timezone,
    DROP COLUMN IF EXISTS billing_day_of_month,
    DROP COLUMN IF EXISTS next_charge_at,
    DROP COLUMN IF EXISTS last_charge_at,
    DROP COLUMN IF EXISTS retry_count,
    DROP COLUMN IF EXISTS stripe_subscription_id,
    DROP COLUMN IF EXISTS currency,
    DROP COLUMN IF EXISTS fund_id,
    DROP COLUMN IF EXISTS missionary_id,
    DROP COLUMN IF EXISTS tenant_id;

ALTER TABLE public.donations
    DROP COLUMN IF EXISTS source,
    DROP COLUMN IF EXISTS refund_amount,
    DROP COLUMN IF EXISTS refunded_at,
    DROP COLUMN IF EXISTS stripe_charge_id,
    DROP COLUMN IF EXISTS error_message,
    DROP COLUMN IF EXISTS error_code,
    DROP COLUMN IF EXISTS failed_at,
    DROP COLUMN IF EXISTS completed_at,
    DROP COLUMN IF EXISTS pledge_id,
    DROP COLUMN IF EXISTS campaign_id;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'donations'
          AND column_name = 'gift_date'
    ) THEN
        ALTER TABLE public.donations
            ALTER COLUMN gift_date DROP NOT NULL,
            ALTER COLUMN gift_date DROP DEFAULT;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'donations'
          AND column_name = 'processed_at'
    ) THEN
        ALTER TABLE public.donations
            ALTER COLUMN processed_at DROP NOT NULL,
            ALTER COLUMN processed_at DROP DEFAULT;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'donations'
          AND column_name = 'currency'
    ) THEN
        ALTER TABLE public.donations
            ALTER COLUMN currency DROP NOT NULL;
    END IF;
END
$$;

ALTER TABLE public.donations
    DROP COLUMN IF EXISTS gift_date,
    DROP COLUMN IF EXISTS processed_at;

ALTER TABLE public.tenants
    DROP COLUMN IF EXISTS stripe_webhook_secret;

ALTER TABLE public.notification_queue
    DROP COLUMN IF EXISTS notification_type,
    DROP COLUMN IF EXISTS recipient_donor_id;

ALTER TABLE public.campaigns
    DROP CONSTRAINT IF EXISTS campaigns_share_url_unique,
    DROP CONSTRAINT IF EXISTS valid_dates,
    DROP CONSTRAINT IF EXISTS valid_goal;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'campaigns'
          AND column_name = 'title'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'campaigns'
          AND column_name = 'name'
    ) THEN
        ALTER TABLE public.campaigns RENAME COLUMN title TO name;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'campaigns'
          AND column_name = 'story'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'campaigns'
          AND column_name = 'description'
    ) THEN
        ALTER TABLE public.campaigns RENAME COLUMN story TO description;
    END IF;
END $$;

ALTER TABLE public.campaigns
    DROP COLUMN IF EXISTS end_date,
    DROP COLUMN IF EXISTS start_date,
    DROP COLUMN IF EXISTS missionary_id,
    DROP COLUMN IF EXISTS creator_donor_id,
    DROP COLUMN IF EXISTS slug,
    DROP COLUMN IF EXISTS share_url,
    DROP COLUMN IF EXISTS current_amount,
    DROP COLUMN IF EXISTS goal_amount;

ALTER TABLE public.pledge_charge_attempts
    ALTER COLUMN status SET DEFAULT 'pending',
    ALTER COLUMN scheduled_for_date TYPE TIMESTAMPTZ USING scheduled_for_date::timestamptz,
    ALTER COLUMN scheduled_for_date SET DEFAULT NOW();

ALTER TABLE public.pledge_charge_attempts
    DROP COLUMN IF EXISTS updated_at,
    DROP COLUMN IF EXISTS error_code,
    DROP COLUMN IF EXISTS stripe_payment_intent_id,
    DROP COLUMN IF EXISTS scheduled_for_date;

ALTER TABLE public.donations
    DROP CONSTRAINT IF EXISTS donations_amount_nonnegative,
    DROP CONSTRAINT IF EXISTS donations_refund_amount_nonnegative;

ALTER TABLE public.donor_pledges
    DROP CONSTRAINT IF EXISTS donor_pledges_amount_nonnegative,
    DROP CONSTRAINT IF EXISTS donor_pledges_total_paid_nonnegative,
    DROP CONSTRAINT IF EXISTS donor_pledges_total_expected_nonnegative;

ALTER TABLE public.funds
    DROP CONSTRAINT IF EXISTS funds_target_amount_nonnegative,
    DROP CONSTRAINT IF EXISTS funds_goal_amount_nonnegative,
    DROP CONSTRAINT IF EXISTS funds_current_amount_nonnegative;

ALTER TABLE public.pledge_charge_attempts
    DROP CONSTRAINT IF EXISTS pledge_charge_attempts_amount_nonnegative;

ALTER TABLE public.donors
    DROP CONSTRAINT IF EXISTS donors_total_given_nonnegative,
    DROP CONSTRAINT IF EXISTS donors_last_gift_amount_nonnegative;

ALTER TABLE public.donor_activities
    DROP CONSTRAINT IF EXISTS donor_activities_amount_nonnegative;

ALTER TABLE public.missionaries
    DROP CONSTRAINT IF EXISTS missionaries_funding_goal_nonnegative,
    DROP CONSTRAINT IF EXISTS missionaries_current_funding_nonnegative;

-- Revert money columns from integer cents to numeric dollars.
ALTER TABLE public.donations
    ALTER COLUMN amount TYPE NUMERIC USING (amount::numeric / 100),
    ALTER COLUMN amount DROP DEFAULT;

ALTER TABLE public.donor_pledges
    ALTER COLUMN amount TYPE NUMERIC USING (amount::numeric / 100),
    ALTER COLUMN amount SET DEFAULT 0,
    ALTER COLUMN total_paid TYPE NUMERIC USING (total_paid::numeric / 100),
    ALTER COLUMN total_paid SET DEFAULT 0,
    ALTER COLUMN total_expected TYPE NUMERIC USING (total_expected::numeric / 100),
    ALTER COLUMN total_expected SET DEFAULT 0;

ALTER TABLE public.donor_pledges
    ALTER COLUMN amount DROP NOT NULL,
    ALTER COLUMN total_paid DROP NOT NULL,
    ALTER COLUMN total_expected DROP NOT NULL;

ALTER TABLE public.funds
    ALTER COLUMN target_amount TYPE NUMERIC USING (target_amount::numeric / 100),
    ALTER COLUMN target_amount SET DEFAULT 0,
    ALTER COLUMN goal_amount TYPE NUMERIC USING (goal_amount::numeric / 100),
    ALTER COLUMN goal_amount SET DEFAULT 0,
    ALTER COLUMN current_amount TYPE NUMERIC USING (current_amount::numeric / 100),
    ALTER COLUMN current_amount SET DEFAULT 0;

ALTER TABLE public.funds
    ALTER COLUMN target_amount DROP NOT NULL,
    ALTER COLUMN goal_amount DROP NOT NULL,
    ALTER COLUMN current_amount DROP NOT NULL;

ALTER TABLE public.pledge_charge_attempts
    ALTER COLUMN amount TYPE NUMERIC USING (amount::numeric / 100),
    ALTER COLUMN amount SET DEFAULT 0;

ALTER TABLE public.donors
    ALTER COLUMN total_given TYPE NUMERIC USING (total_given::numeric / 100),
    ALTER COLUMN total_given SET DEFAULT 0,
    ALTER COLUMN last_gift_amount TYPE NUMERIC USING (last_gift_amount::numeric / 100),
    ALTER COLUMN last_gift_amount DROP DEFAULT;

ALTER TABLE public.donor_activities
    ALTER COLUMN amount TYPE NUMERIC USING (amount::numeric / 100),
    ALTER COLUMN amount DROP DEFAULT;

ALTER TABLE public.missionaries
    ALTER COLUMN funding_goal TYPE NUMERIC USING (funding_goal::numeric / 100),
    ALTER COLUMN funding_goal DROP DEFAULT,
    ALTER COLUMN current_funding TYPE NUMERIC USING (current_funding::numeric / 100),
    ALTER COLUMN current_funding DROP DEFAULT;

-- =========================================================
-- Drop new tables
-- =========================================================

DROP TABLE IF EXISTS public.pledge_charge_attempts;
DROP TABLE IF EXISTS public.notification_queue;
DROP TABLE IF EXISTS public.campaigns;

DROP TABLE IF EXISTS public.backup_money_donor_activities_20260214;
DROP TABLE IF EXISTS public.backup_money_donors_20260214;
DROP TABLE IF EXISTS public.backup_money_pledge_charge_attempts_20260214;
DROP TABLE IF EXISTS public.backup_money_funds_20260214;
DROP TABLE IF EXISTS public.backup_money_donor_pledges_20260214;
DROP TABLE IF EXISTS public.backup_money_donations_20260214;
DROP TABLE IF EXISTS public.backup_money_missionaries_20260214;
DROP TABLE IF EXISTS public.backup_notification_queue_orphans_20260214;

