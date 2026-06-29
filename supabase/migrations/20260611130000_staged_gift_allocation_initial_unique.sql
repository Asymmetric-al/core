BEGIN;

-- Mark the single allocation auto-created at Stripe-webhook staging time.
-- Admin split allocations (apps admin contributions PATCH) leave this false,
-- so they are never constrained by the partial unique index below.
ALTER TABLE public.staged_gift_allocations
  ADD COLUMN IF NOT EXISTS is_initial BOOLEAN NOT NULL DEFAULT false;

-- At most one initial allocation per staged gift. Backstops the
-- concurrent-webhook double-insert race in ensureInitialAllocation
-- (the existence check covers sequential retries; this covers true
-- concurrency where neither delivery sees the other's uncommitted row).
CREATE UNIQUE INDEX IF NOT EXISTS staged_gift_allocations_initial_unique
  ON public.staged_gift_allocations (staged_gift_id)
  WHERE is_initial;

COMMIT;
