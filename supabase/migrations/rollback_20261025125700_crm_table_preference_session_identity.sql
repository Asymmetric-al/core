-- Rollback for 20261025125700_crm_table_preference_session_identity.sql
-- (#2402). Drops the five session-identity wrappers and the private actor
-- helper, moves the original bodies back to `public` under their original
-- signatures and restores the EXECUTE list those migrations declared:
-- postgres (owner) and service_role, nothing for anon or authenticated.
-- Touches no rows. Not idempotent: it expects the forward migration's state
-- and stops otherwise. Pair it with reverting the app commit, because the
-- restored bodies trust their p_profile_id / p_actor_* arguments and need the
-- service-role caller.

BEGIN;

DROP FUNCTION public.create_crm_table_named_view(UUID, TEXT, TEXT, BOOLEAN, INTEGER, TEXT, JSONB);
DROP FUNCTION public.update_crm_table_named_view(UUID, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, BOOLEAN, JSONB, BOOLEAN);
DROP FUNCTION public.delete_crm_table_named_view(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION public.save_crm_user_table_preference(UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB);
DROP FUNCTION public.save_crm_tenant_table_default(UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB);
DROP FUNCTION private.crm_table_preference_actor(UUID, TEXT);

ALTER FUNCTION private.create_crm_table_named_view(UUID, UUID, TEXT, TEXT, BOOLEAN, INTEGER, TEXT, JSONB) SET SCHEMA public;
ALTER FUNCTION private.update_crm_table_named_view(UUID, UUID, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, BOOLEAN, JSONB, BOOLEAN) SET SCHEMA public;
ALTER FUNCTION private.delete_crm_table_named_view(UUID, UUID, TEXT, TEXT, TEXT) SET SCHEMA public;
ALTER FUNCTION private.save_crm_user_table_preference(UUID, UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB) SET SCHEMA public;
ALTER FUNCTION private.save_crm_tenant_table_default(UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB, UUID, BOOLEAN) SET SCHEMA public;

REVOKE ALL ON FUNCTION public.create_crm_table_named_view(UUID, UUID, TEXT, TEXT, BOOLEAN, INTEGER, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_crm_table_named_view(UUID, UUID, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, BOOLEAN, JSONB, BOOLEAN) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_crm_table_named_view(UUID, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.save_crm_user_table_preference(UUID, UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.save_crm_tenant_table_default(UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB, UUID, BOOLEAN) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_crm_table_named_view(UUID, UUID, TEXT, TEXT, BOOLEAN, INTEGER, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_crm_table_named_view(UUID, UUID, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, BOOLEAN, JSONB, BOOLEAN) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_crm_table_named_view(UUID, UUID, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.save_crm_user_table_preference(UUID, UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.save_crm_tenant_table_default(UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB, UUID, BOOLEAN) TO service_role;

SELECT pg_notify('pgrst', 'reload schema');
COMMIT;
