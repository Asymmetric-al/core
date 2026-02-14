-- Foundation 1 schema rollback migration

-- =========================================================
-- Drop performance indexes
-- =========================================================

DROP INDEX IF EXISTS public.idx_pledge_charge_attempts_donation_id;
DROP INDEX IF EXISTS public.idx_pledge_charge_attempts_tenant_status_attempted_at;
DROP INDEX IF EXISTS public.idx_pledge_charge_attempts_pledge_attempted_at;
DROP INDEX IF EXISTS public.idx_notification_queue_tenant_channel_dedupe;
DROP INDEX IF EXISTS public.idx_notification_queue_campaign_id;
DROP INDEX IF EXISTS public.idx_notification_queue_tenant_status_scheduled;
DROP INDEX IF EXISTS public.idx_notification_queue_status_available_at;
DROP INDEX IF EXISTS public.idx_campaigns_tenant_scheduled_for;
DROP INDEX IF EXISTS public.idx_campaigns_tenant_status;
DROP INDEX IF EXISTS public.idx_follows_donor_status;
DROP INDEX IF EXISTS public.idx_follows_missionary_status;
DROP INDEX IF EXISTS public.idx_donor_pledges_tenant_status_next_charge;
DROP INDEX IF EXISTS public.idx_donor_pledges_donor_status;
DROP INDEX IF EXISTS public.idx_donors_tenant_status;
DROP INDEX IF EXISTS public.idx_donations_pledge_id;
DROP INDEX IF EXISTS public.idx_donations_missionary_gift_date;
DROP INDEX IF EXISTS public.idx_donations_donor_gift_date;
DROP INDEX IF EXISTS public.idx_donations_tenant_gift_date;

-- =========================================================
-- Remove added columns from existing tables
-- =========================================================

ALTER TABLE public.follows
    DROP COLUMN IF EXISTS approved_at,
    DROP COLUMN IF EXISTS is_donor,
    DROP COLUMN IF EXISTS status;

ALTER TABLE public.donors
    DROP COLUMN IF EXISTS do_not_email,
    DROP COLUMN IF EXISTS do_not_contact,
    DROP COLUMN IF EXISTS gift_count,
    DROP COLUMN IF EXISTS first_gift_date;

ALTER TABLE public.donor_pledges
    DROP COLUMN IF EXISTS next_charge_at,
    DROP COLUMN IF EXISTS last_charge_at,
    DROP COLUMN IF EXISTS retry_count,
    DROP COLUMN IF EXISTS stripe_subscription_id,
    DROP COLUMN IF EXISTS currency,
    DROP COLUMN IF EXISTS fund_id,
    DROP COLUMN IF EXISTS missionary_id,
    DROP COLUMN IF EXISTS tenant_id;

ALTER TABLE public.donations
    DROP COLUMN IF EXISTS processed_at,
    DROP COLUMN IF EXISTS pledge_id,
    DROP COLUMN IF EXISTS campaign_id,
    DROP COLUMN IF EXISTS gift_date;

ALTER TABLE public.tenants
    DROP COLUMN IF EXISTS locale,
    DROP COLUMN IF EXISTS default_timezone,
    DROP COLUMN IF EXISTS billing_email;

-- =========================================================
-- Drop new tables
-- =========================================================

DROP TABLE IF EXISTS public.pledge_charge_attempts;
DROP TABLE IF EXISTS public.notification_queue;
DROP TABLE IF EXISTS public.campaigns;

