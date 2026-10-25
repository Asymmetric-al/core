-- Rollback for 20261025090000_account_claim_and_invitation_tables.sql (#2255).
-- Drops both tables, and with them their policies, indexes and grants.
-- Idempotent (IF EXISTS). Run it before #2254's rollback: these tables'
-- generated columns depend on public.normalize_email. Once #509/#510 write
-- real rows, this deletes them.

BEGIN;

DROP TABLE IF EXISTS public.legacy_account_invitations;
DROP TABLE IF EXISTS public.account_claim_requests;

COMMIT;
