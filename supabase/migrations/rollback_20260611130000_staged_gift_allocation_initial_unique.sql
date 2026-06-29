BEGIN;

DROP INDEX IF EXISTS public.staged_gift_allocations_initial_unique;

ALTER TABLE public.staged_gift_allocations
  DROP COLUMN IF EXISTS is_initial;

COMMIT;
