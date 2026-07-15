-- Stripe refund ids on donations (issue #266, provider proof drawer).
-- Additive only: stores the convergent set of Stripe refund ids (`re_...`)
-- observed for the donation's charge. Written by the shared
-- "apply refunded charge" routine used by both the charge.refunded webhook
-- and the admin refund action; the detail read model surfaces the ids as
-- role-gated provider proof. The set is merge-unioned (existing + provider
-- reported) because Stripe's embedded charge.refunds list can be absent or
-- truncated, so a replace write could silently drop known refund ids.
--
-- Rollback:
--   ALTER TABLE public.donations DROP COLUMN IF EXISTS stripe_refund_ids;

ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS stripe_refund_ids TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.donations.stripe_refund_ids IS
  'Convergent set of Stripe refund ids observed for this donation''s charge. Merge-union of previously stored ids and provider-reported ids; provider proof only — refund_amount stays the financial truth.';
