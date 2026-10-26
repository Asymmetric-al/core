-- Rollback for 20261025120700_current_user_assignments_rpc.sql (#2258). Drops
-- only public.current_user_assignments(); nothing else depends on it, and
-- public.current_user_memberships(uuid) is untouched. Idempotent (IF EXISTS).

BEGIN;

DROP FUNCTION IF EXISTS public.current_user_assignments();

COMMIT;
