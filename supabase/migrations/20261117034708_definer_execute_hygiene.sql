-- AL-2674 (WP1 slice 1.1a; plan 5.4): no SECURITY DEFINER function may be
-- executable by PUBLIC, and anon may execute one only when it is on the
-- reviewed allowlist of public read functions. The catalog gate asserts this
-- from now on (scripts/verify/tenant-rls-catalog.mjs). These three functions
-- broke it on the migrated database: each kept Postgres's default PUBLIC
-- EXECUTE, so anon and authenticated could call them directly.
--
-- All three are trigger functions. A trigger fires without any EXECUTE check
-- on its function, so revoking EXECUTE stops only direct calls; sign-up
-- (`on_auth_user_created` on auth.users) and the contribution tenant checks
-- keep working. Called directly, a trigger function raises anyway; the revoke
-- removes the surface.
--
-- Down (run by hand): GRANT EXECUTE ON FUNCTION <each> TO PUBLIC.

BEGIN;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.enforce_contribution_notification_tenant_refs() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.enforce_contribution_operation_tenant_refs() FROM PUBLIC, anon, authenticated, service_role;

COMMIT;
