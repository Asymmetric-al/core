-- A gift names its tenant explicitly: public.donations.tenant_id loses the
-- default it has had since 20250101000000_init_schema.sql:177, the demo
-- tenant's id, one of the last two live holders of that id in the catalog
-- (the other is public.handle_new_user). Every writer already names the
-- tenant: begin_donation_saga and atomic_create_donation_with_audit, the
-- seed and every test fixture; no application code inserts a gift.
-- What an insert that names no tenant gets now: if it names no donor, fund
-- or missionary, a row with tenant_id NULL, which no tenant's policies show
-- (before, it silently became the demo organization's gift); if it names
-- one, the CHECKs of 20261025100000 and 20261120130004 refuse it (23514).
-- The column stays nullable here: a frozen contract permits a NULL tenant on
-- an unassigned gift, and gift intake (WP8a) owes the NOT NULL, with the
-- existing NULL rows accounted for.
-- Locks: ACCESS EXCLUSIVE on donations for a catalog change only, with no
-- scan or rewrite, until COMMIT; lock_timeout bounds the wait.
-- Check first, on preview and then production, and record the number for
-- WP8a: SELECT count(*) FROM public.donations WHERE tenant_id IS NULL;
-- existing rows keep their tenant either way.
-- Back: ALTER TABLE public.donations ALTER COLUMN tenant_id SET DEFAULT
-- '00000000-0000-0000-0000-000000000001'; in one transaction.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE public.donations ALTER COLUMN tenant_id DROP DEFAULT;
COMMIT;
