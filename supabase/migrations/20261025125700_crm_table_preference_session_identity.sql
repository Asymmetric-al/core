-- #2402: CRM table-view and table-preference writes take the caller's
-- identity from the session, not from function arguments.
--
-- Rollback: supabase/migrations/rollback_20261025125700_crm_table_preference_session_identity.sql
-- (pair it with reverting the app commit; the restored bodies need the
-- service-role caller again).
--
-- The five SECURITY DEFINER functions from 20260611160000 and 20260611170000
-- trusted p_profile_id / p_actor_profile_id / p_actor_can_manage_defaults and
-- were written for service_role only. Their bodies move unchanged to
-- `private` (ALTER FUNCTION ... SET SCHEMA keeps the reviewed text), and thin
-- public wrappers with the identity arguments removed take their place:
--
-- - the acting user is auth.uid() and the acting profile is the
--   public.profiles row with that user_id;
-- - a super admin (profiles.role = 'super_admin') may act in any existing
--   tenant it supplies; anyone else must supply its profile's tenant_id and
--   hold a CRM role there (profiles.role staff/admin/super_admin, or an active
--   staff membership in authz.memberships);
-- - only a super admin manages tenant defaults outright; a delegated manager
--   listed in the record's delegatedManagerProfileIds is still decided by the
--   original body;
-- - everything else fails closed with 42501 before the body runs.
--
-- Because authenticated now calls these through the Data API, the wrappers
-- also repeat the route's input checks (22023): table id crm.giftHistory and,
-- where a name is set, 1-80 characters after trimming.
--
-- Grants are revoked by name, never from PUBLIC alone, so the result is the
-- same whatever a database's default privileges are (#2270): each wrapper is
-- EXECUTE for postgres (owner) and authenticated; each private body and the
-- private actor helper for postgres only. Contract and deploy notes:
-- docs/security/function-execute-grants.md.

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;

ALTER FUNCTION public.create_crm_table_named_view(UUID, UUID, TEXT, TEXT, BOOLEAN, INTEGER, TEXT, JSONB) SET SCHEMA private;
ALTER FUNCTION public.update_crm_table_named_view(UUID, UUID, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, BOOLEAN, JSONB, BOOLEAN) SET SCHEMA private;
ALTER FUNCTION public.delete_crm_table_named_view(UUID, UUID, TEXT, TEXT, TEXT) SET SCHEMA private;
ALTER FUNCTION public.save_crm_user_table_preference(UUID, UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB) SET SCHEMA private;
ALTER FUNCTION public.save_crm_tenant_table_default(UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB, UUID, BOOLEAN) SET SCHEMA private;

-- SET SCHEMA keeps the old ACL (postgres, service_role), so revoke by name.
REVOKE ALL ON FUNCTION private.create_crm_table_named_view(UUID, UUID, TEXT, TEXT, BOOLEAN, INTEGER, TEXT, JSONB) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION private.update_crm_table_named_view(UUID, UUID, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, BOOLEAN, JSONB, BOOLEAN) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION private.delete_crm_table_named_view(UUID, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION private.save_crm_user_table_preference(UUID, UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION private.save_crm_tenant_table_default(UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB, UUID, BOOLEAN) FROM PUBLIC, anon, authenticated, service_role;

-- Resolves the session actor for p_tenant_id or raises 42501, then checks the
-- table id (22023). Called only from the wrappers below, which run as postgres.
CREATE FUNCTION private.crm_table_preference_actor(
    p_tenant_id UUID,
    p_table_id TEXT,
    OUT actor_profile_id UUID,
    OUT actor_is_super_admin BOOLEAN
)
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_profile_tenant_id UUID;
    v_profile_role TEXT;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Forbidden: CRM table preferences require a signed-in user.'
            USING ERRCODE = '42501';
    END IF;

    SELECT p.id, p.tenant_id, p.role
    INTO actor_profile_id, v_profile_tenant_id, v_profile_role
    FROM public.profiles AS p
    WHERE p.user_id = v_user_id;

    IF actor_profile_id IS NULL THEN
        RAISE EXCEPTION 'Forbidden: CRM table preferences require a profile.'
            USING ERRCODE = '42501';
    END IF;

    actor_is_super_admin := v_profile_role = 'super_admin';

    IF actor_is_super_admin THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.tenants AS t WHERE t.id = p_tenant_id
        ) THEN
            RAISE EXCEPTION 'Forbidden: CRM tenant not found.'
                USING ERRCODE = '42501';
        END IF;
    ELSIF p_tenant_id IS NULL
          OR p_tenant_id IS DISTINCT FROM v_profile_tenant_id
          OR NOT (
              v_profile_role IN ('staff', 'admin')
              OR EXISTS (
                  SELECT 1
                  FROM authz.memberships AS m
                  WHERE m.user_id = v_user_id
                    AND m.tenant_id = p_tenant_id
                    AND m.role = 'staff'
                    AND m.is_active
              )
          ) THEN
        RAISE EXCEPTION 'Forbidden: CRM table preferences require a CRM role in this tenant.'
            USING ERRCODE = '42501';
    END IF;

    IF p_table_id IS DISTINCT FROM 'crm.giftHistory' THEN
        RAISE EXCEPTION 'Unknown CRM table id.'
            USING ERRCODE = '22023';
    END IF;
END;
$$;

CREATE FUNCTION public.create_crm_table_named_view(
    p_tenant_id UUID,
    p_table_id TEXT,
    p_name TEXT,
    p_is_default BOOLEAN,
    p_schema_version INTEGER,
    p_pinned_action_id TEXT,
    p_settings JSONB
)
RETURNS public.crm_table_named_views
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor_profile_id UUID;
BEGIN
    SELECT a.actor_profile_id
    INTO v_actor_profile_id
    FROM private.crm_table_preference_actor(p_tenant_id, p_table_id) AS a;
    IF p_name IS NULL OR char_length(btrim(p_name)) NOT BETWEEN 1 AND 80 THEN
        RAISE EXCEPTION 'A view name must be 1 to 80 characters.'
            USING ERRCODE = '22023';
    END IF;

    RETURN private.create_crm_table_named_view(
        p_tenant_id,
        v_actor_profile_id,
        p_table_id,
        p_name,
        p_is_default,
        p_schema_version,
        p_pinned_action_id,
        p_settings
    );
END;
$$;

CREATE FUNCTION public.update_crm_table_named_view(
    p_tenant_id UUID,
    p_table_id TEXT,
    p_view_id TEXT,
    p_name TEXT,
    p_name_is_set BOOLEAN,
    p_is_default BOOLEAN,
    p_is_default_is_set BOOLEAN,
    p_schema_version INTEGER,
    p_pinned_action_id TEXT,
    p_pinned_action_id_is_set BOOLEAN,
    p_settings JSONB,
    p_settings_is_set BOOLEAN
)
RETURNS public.crm_table_named_views
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor_profile_id UUID;
BEGIN
    SELECT a.actor_profile_id
    INTO v_actor_profile_id
    FROM private.crm_table_preference_actor(p_tenant_id, p_table_id) AS a;
    IF p_name_is_set
       AND (p_name IS NULL OR char_length(btrim(p_name)) NOT BETWEEN 1 AND 80) THEN
        RAISE EXCEPTION 'A view name must be 1 to 80 characters.'
            USING ERRCODE = '22023';
    END IF;

    RETURN private.update_crm_table_named_view(
        p_tenant_id,
        v_actor_profile_id,
        p_table_id,
        p_view_id,
        p_name,
        p_name_is_set,
        p_is_default,
        p_is_default_is_set,
        p_schema_version,
        p_pinned_action_id,
        p_pinned_action_id_is_set,
        p_settings,
        p_settings_is_set
    );
END;
$$;

CREATE FUNCTION public.delete_crm_table_named_view(
    p_tenant_id UUID,
    p_table_id TEXT,
    p_view_id TEXT,
    p_next_default_view_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor_profile_id UUID;
BEGIN
    SELECT a.actor_profile_id
    INTO v_actor_profile_id
    FROM private.crm_table_preference_actor(p_tenant_id, p_table_id) AS a;

    RETURN private.delete_crm_table_named_view(
        p_tenant_id,
        v_actor_profile_id,
        p_table_id,
        p_view_id,
        p_next_default_view_id
    );
END;
$$;

CREATE FUNCTION public.save_crm_user_table_preference(
    p_tenant_id UUID,
    p_table_id TEXT,
    p_pinned_action_id TEXT,
    p_pinned_action_id_is_set BOOLEAN,
    p_schema_version INTEGER,
    p_settings_patch JSONB
)
RETURNS public.crm_table_user_preferences
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor_profile_id UUID;
BEGIN
    SELECT a.actor_profile_id
    INTO v_actor_profile_id
    FROM private.crm_table_preference_actor(p_tenant_id, p_table_id) AS a;

    RETURN private.save_crm_user_table_preference(
        p_tenant_id,
        v_actor_profile_id,
        p_table_id,
        p_pinned_action_id,
        p_pinned_action_id_is_set,
        p_schema_version,
        p_settings_patch
    );
END;
$$;

-- Super admins manage tenant defaults; for anyone else the body allows only
-- a profile listed in delegatedManagerProfileIds, and never lets it change
-- that list.
CREATE FUNCTION public.save_crm_tenant_table_default(
    p_tenant_id UUID,
    p_table_id TEXT,
    p_pinned_action_id TEXT,
    p_pinned_action_id_is_set BOOLEAN,
    p_schema_version INTEGER,
    p_settings_patch JSONB
)
RETURNS public.crm_table_tenant_defaults
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor_profile_id UUID;
    v_actor_is_super_admin BOOLEAN;
BEGIN
    SELECT a.actor_profile_id, a.actor_is_super_admin
    INTO v_actor_profile_id, v_actor_is_super_admin
    FROM private.crm_table_preference_actor(p_tenant_id, p_table_id) AS a;

    RETURN private.save_crm_tenant_table_default(
        p_tenant_id,
        p_table_id,
        p_pinned_action_id,
        p_pinned_action_id_is_set,
        p_schema_version,
        p_settings_patch,
        v_actor_profile_id,
        v_actor_is_super_admin
    );
END;
$$;

ALTER FUNCTION private.crm_table_preference_actor(UUID, TEXT) OWNER TO postgres;
ALTER FUNCTION public.create_crm_table_named_view(UUID, TEXT, TEXT, BOOLEAN, INTEGER, TEXT, JSONB) OWNER TO postgres;
ALTER FUNCTION public.update_crm_table_named_view(UUID, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, BOOLEAN, JSONB, BOOLEAN) OWNER TO postgres;
ALTER FUNCTION public.delete_crm_table_named_view(UUID, TEXT, TEXT, TEXT) OWNER TO postgres;
ALTER FUNCTION public.save_crm_user_table_preference(UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB) OWNER TO postgres;
ALTER FUNCTION public.save_crm_tenant_table_default(UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB) OWNER TO postgres;

REVOKE ALL ON FUNCTION private.crm_table_preference_actor(UUID, TEXT) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.create_crm_table_named_view(UUID, TEXT, TEXT, BOOLEAN, INTEGER, TEXT, JSONB) FROM PUBLIC, anon, service_role;
REVOKE ALL ON FUNCTION public.update_crm_table_named_view(UUID, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, BOOLEAN, JSONB, BOOLEAN) FROM PUBLIC, anon, service_role;
REVOKE ALL ON FUNCTION public.delete_crm_table_named_view(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, service_role;
REVOKE ALL ON FUNCTION public.save_crm_user_table_preference(UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB) FROM PUBLIC, anon, service_role;
REVOKE ALL ON FUNCTION public.save_crm_tenant_table_default(UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB) FROM PUBLIC, anon, service_role;

GRANT EXECUTE ON FUNCTION public.create_crm_table_named_view(UUID, TEXT, TEXT, BOOLEAN, INTEGER, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_crm_table_named_view(UUID, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, BOOLEAN, JSONB, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_crm_table_named_view(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_crm_user_table_preference(UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_crm_tenant_table_default(UUID, TEXT, TEXT, BOOLEAN, INTEGER, JSONB) TO authenticated;

SELECT pg_notify('pgrst', 'reload schema');
COMMIT;
