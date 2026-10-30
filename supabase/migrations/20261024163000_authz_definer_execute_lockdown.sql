-- #2270: explicit EXECUTE grant lists for the authz SECURITY DEFINER helpers
-- and public.current_user_memberships.
--
-- `REVOKE ... FROM PUBLIC` is not enough on hosted Supabase. There, postgres
-- has default privileges that grant EXECUTE on new public functions to anon,
-- authenticated and service_role by name, and a PUBLIC revoke leaves those
-- grants in place. 20260802041500 revoked only PUBLIC, so hosted databases
-- let anon and service_role call current_user_memberships. The three authz
-- DEFINER helpers (20260226113000) never revoked PUBLIC at all; only anon's
-- missing USAGE on authz keeps anon out of them.
--
-- This migration revokes PUBLIC and anon by name and re-grants the exact list,
-- so the result is the same whatever a database's default privileges are.
-- service_role loses current_user_memberships, where auth.uid() is always
-- NULL for it. The authz INVOKER helpers (current_user_id, current_tenant_id)
-- are unchanged.
--
-- The 8 "authz staff tenant" CRM policies were TO public and call these
-- helpers. Hosted defaults also give anon table privileges, so without the
-- re-scope anon would get "permission denied for function is_super_admin"
-- instead of 0 rows. They become TO authenticated; USING and WITH CHECK are
-- untouched.
--
-- Contract, deploy note and revert SQL: docs/security/function-execute-grants.md.
-- tests/unit/security/authz-definer-execute-grants.test.ts pins the statements
-- below and the authz DEFINER grant list.

BEGIN;
REVOKE ALL ON FUNCTION public.current_user_memberships(UUID) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_memberships(UUID) TO authenticated;
REVOKE ALL ON FUNCTION authz.is_super_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION authz.has_membership(UUID, authz.membership_role[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION authz.has_staff_membership(UUID, authz.staff_role[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION authz.is_super_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.has_membership(UUID, authz.membership_role[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.has_staff_membership(UUID, authz.staff_role[]) TO authenticated, service_role;
ALTER POLICY "authz staff tenant select crm_command_logs" ON public.crm_command_logs TO authenticated;
ALTER POLICY "authz staff tenant insert crm_command_logs" ON public.crm_command_logs TO authenticated;
ALTER POLICY "authz staff tenant select crm_record_links" ON public.crm_record_links TO authenticated;
ALTER POLICY "authz staff tenant insert crm_record_links" ON public.crm_record_links TO authenticated;
ALTER POLICY "authz staff tenant update crm_record_links" ON public.crm_record_links TO authenticated;
ALTER POLICY "authz staff tenant select crm_merge_candidates" ON public.crm_merge_candidates TO authenticated;
ALTER POLICY "authz staff tenant insert crm_merge_candidates" ON public.crm_merge_candidates TO authenticated;
ALTER POLICY "authz staff tenant update crm_merge_candidates" ON public.crm_merge_candidates TO authenticated;
SELECT pg_notify('pgrst', 'reload schema');
COMMIT;
