-- AL-2676: require the request's organization (`x-asym-tenant`) in
-- `tenant_guard.begin_human_command` for every human command, and record the
-- exact before-value on concurrent first-time `tenant_guard.set_account_brand`
-- writes on PostgreSQL 17.
--
-- Replaces:
--   - `tenant_guard.begin_human_command(uuid, text)` from
--     `supabase/migrations/20261120130001_tenant_status_membership.sql:173-259`
--     (adds the `authz.request_tenant_id()` check after the active-tenant check
--     and before `tenant_guard.enter`, keeping `SECURITY INVOKER`,
--     `SET search_path = ''`, owner `postgres`, and `EXECUTE` for `tenant_guard`
--     only).
--   - `tenant_guard.set_account_brand(uuid, text)` from
--     `supabase/migrations/20261125010100_wp3a1b_site_commands.sql:226-304`
--     (replaces `INSERT ... ON CONFLICT DO UPDATE` with
--     `INSERT ... ON CONFLICT (tenant_id) DO NOTHING RETURNING *`, falling back
--     to `SELECT display_name INTO STRICT ... FOR UPDATE` and `UPDATE ...
--     RETURNING * INTO STRICT`, keeping its locks, re-check, grants, owner, and
--     untouched `public.set_account_brand` wrapper).
--
-- Down (run by hand, in one transaction):
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   -- 1. Restore `tenant_guard.begin_human_command(uuid, text)` with
--   --    `CREATE OR REPLACE FUNCTION` from
--   --    `supabase/migrations/20261120130001_tenant_status_membership.sql:173-259`.
--   -- 2. Restore `tenant_guard.set_account_brand(uuid, text)`:
--   --    DROP FUNCTION tenant_guard.set_account_brand(uuid, text);
--   --    Recreate it verbatim from
--   --    `supabase/migrations/20261125010100_wp3a1b_site_commands.sql:226-304`;
--   --    REVOKE ALL ON FUNCTION tenant_guard.set_account_brand(uuid, text)
--   --      FROM PUBLIC, anon, authenticated, service_role;
--   --    GRANT EXECUTE ON FUNCTION tenant_guard.set_account_brand(uuid, text)
--   --      TO authenticated;
--   --    GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
--   --    ALTER FUNCTION tenant_guard.set_account_brand(uuid, text)
--   --      OWNER TO tenant_guard;
--   --    REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;
--   NOTIFY pgrst, 'reload schema';
--   COMMIT;

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE OR REPLACE FUNCTION tenant_guard.begin_human_command(
  p_tenant_id UUID,
  p_capability TEXT DEFAULT NULL
)
RETURNS tenant_guard.command_context
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_actor UUID := tenant_guard.caller_id();
  v_named UUID := tenant_guard.request_assignment_id();
  v_ctx tenant_guard.command_context;
  v_live INTEGER;
  v_request_tenant_id UUID;
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'tenant_guard: a human command needs a signed-in caller'
      USING ERRCODE = '42501';
  END IF;

  IF p_tenant_id IS NULL THEN
    RAISE EXCEPTION 'tenant_guard: tenant id is required'
      USING ERRCODE = '22004';
  END IF;

  IF p_capability IS NOT NULL AND pg_catalog.btrim(p_capability) = '' THEN
    RAISE EXCEPTION 'tenant_guard: a capability name is required'
      USING ERRCODE = '22023';
  END IF;

  IF v_named IS NOT NULL THEN
    SELECT v_actor, m.tenant_id, m.id, m.role::TEXT, m.staff_role::TEXT, m.is_tenant_admin
      INTO v_ctx
      FROM authz.memberships AS m
     WHERE m.id = v_named
       AND m.user_id = v_actor
       AND m.tenant_id = p_tenant_id
       AND m.is_active
       AND m.revoked_at IS NULL;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'tenant_guard: the selected assignment is not a live assignment of the caller in this tenant'
        USING ERRCODE = '42501';
    END IF;
  ELSE
    SELECT pg_catalog.count(*)::INTEGER
      INTO v_live
      FROM authz.memberships AS m
     WHERE m.user_id = v_actor
       AND m.tenant_id = p_tenant_id
       AND m.is_active
       AND m.revoked_at IS NULL;

    IF v_live = 0 THEN
      RAISE EXCEPTION 'tenant_guard: the caller has no live assignment in this tenant'
        USING ERRCODE = '42501';
    END IF;

    IF v_live > 1 THEN
      RAISE EXCEPTION 'tenant_guard: the caller has several live assignments in this tenant and the request names none'
        USING ERRCODE = '42501';
    END IF;

    SELECT v_actor, m.tenant_id, m.id, m.role::TEXT, m.staff_role::TEXT, m.is_tenant_admin
      INTO v_ctx
      FROM authz.memberships AS m
     WHERE m.user_id = v_actor
       AND m.tenant_id = p_tenant_id
       AND m.is_active
       AND m.revoked_at IS NULL;
  END IF;

  IF p_capability IS NOT NULL
     AND NOT (p_capability = ANY (authz.assignment_capabilities(v_ctx.assignment_id))) THEN
    RAISE EXCEPTION 'tenant_guard: the selected assignment does not hold the capability this command requires'
      USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM authz.caller_tenant_ids() AS active(id) WHERE active.id = p_tenant_id) THEN
    RAISE EXCEPTION 'tenant_guard: tenant is not active' USING ERRCODE = '42501';
  END IF;

  BEGIN
    v_request_tenant_id := authz.request_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_request_tenant_id := NULL;
  END;

  IF v_request_tenant_id IS NULL OR v_request_tenant_id IS DISTINCT FROM v_ctx.tenant_id THEN
    RAISE EXCEPTION 'tenant_guard: request tenant scope is required and must match command tenant'
      USING ERRCODE = '42501';
  END IF;

  PERFORM tenant_guard.enter(v_ctx.tenant_id);
  RETURN v_ctx;
END;
$$;

DROP FUNCTION tenant_guard.set_account_brand(uuid, text);

CREATE FUNCTION tenant_guard.set_account_brand(p_tenant_id uuid, p_display_name text)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_request_tenant_id uuid;
  v_tenant_status text;
  v_assignment record;
  v_assignment_found boolean;
  v_before_name text;
  v_brand public.donor_account_brands;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'sites.manage');

  BEGIN
    v_request_tenant_id := authz.request_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_request_tenant_id := NULL;
  END;
  IF v_request_tenant_id IS NULL OR v_request_tenant_id IS DISTINCT FROM v_ctx.tenant_id THEN
    RAISE EXCEPTION 'tenant_guard: request tenant scope is required and must match command tenant'
      USING ERRCODE = '42501';
  END IF;

  v_tenant_status := private.share_lock_tenant(v_ctx.tenant_id);
  SELECT m.user_id, m.tenant_id, m.is_active, m.revoked_at
    INTO v_assignment
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.id = v_ctx.assignment_id
     FOR SHARE;
  v_assignment_found := FOUND;

  -- The brand belongs to the home record; hold it, then the brand itself.
  PERFORM 1
     FROM public.donor_portal_hosts
    WHERE tenant_id = v_ctx.tenant_id
      FOR SHARE;
  SELECT display_name INTO v_before_name
    FROM public.donor_account_brands
   WHERE tenant_id = v_ctx.tenant_id
     FOR UPDATE;

  IF v_tenant_status IS DISTINCT FROM 'active'
     OR v_assignment_found IS NOT TRUE
     OR v_assignment.user_id IS DISTINCT FROM v_ctx.actor_id
     OR v_assignment.tenant_id IS DISTINCT FROM v_ctx.tenant_id
     OR v_assignment.is_active IS NOT TRUE
     OR v_assignment.revoked_at IS NOT NULL
     OR ('sites.manage' = ANY (authz.assignment_capabilities(v_ctx.assignment_id))) IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: Site management is not active for this assignment'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.donor_account_brands (tenant_id, display_name)
  VALUES (v_ctx.tenant_id, p_display_name)
  ON CONFLICT (tenant_id) DO NOTHING
  RETURNING * INTO v_brand;

  IF FOUND THEN
    v_before_name := NULL;
  ELSE
    SELECT display_name
      INTO STRICT v_before_name
      FROM public.donor_account_brands
     WHERE tenant_id = v_ctx.tenant_id
       FOR UPDATE;

    UPDATE public.donor_account_brands
       SET display_name = p_display_name
     WHERE tenant_id = v_ctx.tenant_id
    RETURNING * INTO STRICT v_brand;
  END IF;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'account_brand_set',
    'donor_account_brand',
    v_brand.tenant_id::text,
    pg_catalog.jsonb_build_object(
      'assignment_id', v_ctx.assignment_id,
      'from', pg_catalog.jsonb_build_object('display_name', v_before_name),
      'to', pg_catalog.jsonb_build_object('display_name', v_brand.display_name)
    )
  );
  RETURN to_jsonb(v_brand);
END;
$$;

REVOKE ALL ON FUNCTION tenant_guard.set_account_brand(uuid, text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.set_account_brand(uuid, text) TO authenticated;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.set_account_brand(uuid, text) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

NOTIFY pgrst, 'reload schema';
COMMIT;
