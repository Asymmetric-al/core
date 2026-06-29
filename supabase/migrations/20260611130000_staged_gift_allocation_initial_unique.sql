BEGIN;

-- Mark the single allocation auto-created at Stripe-webhook staging time.
-- Admin split allocations (apps admin contributions PATCH) leave this false,
-- so they are never constrained by the partial unique index below.
ALTER TABLE public.staged_gift_allocations
  ADD COLUMN IF NOT EXISTS is_initial BOOLEAN NOT NULL DEFAULT false;

-- Pre-migration webhook rows were the sole allocation per gift; mark the earliest
-- row per gift as initial when none are flagged yet (admin splits stay false).
UPDATE public.staged_gift_allocations sga
SET is_initial = true
WHERE NOT EXISTS (
  SELECT 1
  FROM public.staged_gift_allocations existing
  WHERE existing.staged_gift_id = sga.staged_gift_id
    AND existing.is_initial = true
)
AND sga.id = (
  SELECT candidate.id
  FROM public.staged_gift_allocations candidate
  WHERE candidate.staged_gift_id = sga.staged_gift_id
  ORDER BY candidate.created_at ASC NULLS LAST, candidate.id ASC
  LIMIT 1
);

-- At most one initial allocation per staged gift. Backstops the
-- concurrent-webhook double-insert race in ensureInitialAllocation
-- (the existence check covers sequential retries; this covers true
-- concurrency where neither delivery sees the other's uncommitted row).
CREATE UNIQUE INDEX IF NOT EXISTS staged_gift_allocations_initial_unique
  ON public.staged_gift_allocations (staged_gift_id)
  WHERE is_initial;

COMMIT;
