-- Restore the six definitions from the catalog immediately before 20261120130001.
-- Reconcile the release ledger separately; this rollback never edits it.
-- Rebuild later WP3 migrations first or use a forward fix: their readers depend on status.
BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL search_path = public;

DO $$
DECLARE
  v_newest TEXT;
BEGIN
  IF pg_catalog.to_regclass('supabase_migrations.schema_migrations') IS NULL THEN
    RAISE EXCEPTION 'rollback_20261120130001: this database has no migration ledger (supabase_migrations.schema_migrations), so it cannot show that 20261120130001 is its newest migration; nothing was changed';
  END IF;
  -- Held until this transaction ends: no other session writes the ledger
  -- between this check and the commit.
  LOCK TABLE supabase_migrations.schema_migrations IN SHARE ROW EXCLUSIVE MODE;
  SELECT pg_catalog.max(version) INTO v_newest FROM supabase_migrations.schema_migrations;
  IF v_newest IS DISTINCT FROM '20261120130001' THEN
    RAISE EXCEPTION 'rollback_20261120130001: the newest migration recorded is %, not 20261120130001. Reverse every later migration first, newest first, then run this file; nothing was changed', COALESCE(v_newest, 'none');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION authz.caller_assignment(p_tenant_id uuid, p_role authz.membership_role)
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
DECLARE
  v_user UUID := auth.uid();
  v_tenant UUID := authz.request_tenant_id();
  v_named UUID := tenant_guard.request_assignment_id();
  v_id UUID;
  v_role authz.membership_role;
  v_rows BIGINT;
BEGIN
  IF v_user IS NULL OR p_tenant_id IS NULL OR p_role IS NULL THEN
    RETURN NULL;
  END IF;
  IF v_tenant IS NOT NULL AND v_tenant <> p_tenant_id THEN
    RETURN NULL;
  END IF;

  SELECT m.id, m.role, pg_catalog.count(*) OVER ()
    INTO v_id, v_role, v_rows
    FROM authz.memberships AS m
   WHERE m.user_id = v_user
     AND m.tenant_id = p_tenant_id
     AND m.is_active
     AND m.revoked_at IS NULL
     AND (v_named IS NULL OR m.id = v_named)
   LIMIT 1;

  IF v_rows IS DISTINCT FROM 1 OR v_role IS DISTINCT FROM p_role THEN
    RETURN NULL;
  END IF;
  RETURN v_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION authz.caller_tenant_ids()
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE PARALLEL SAFE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT DISTINCT m.tenant_id
    FROM authz.memberships AS m
   WHERE m.user_id = auth.uid()
     AND m.is_active
     AND m.revoked_at IS NULL;
$function$
;
CREATE OR REPLACE FUNCTION authz.request_assignment(OUT membership_id uuid, OUT tenant_id uuid, OUT role authz.membership_role, OUT staff_role authz.staff_role, OUT is_tenant_admin boolean)
 RETURNS record
 LANGUAGE plpgsql
 STABLE PARALLEL SAFE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_user UUID := auth.uid();
  v_tenant UUID := authz.request_tenant_id();
  v_named UUID := authz.request_assignment_id();
  v_rows BIGINT;
BEGIN
  IF v_user IS NULL OR v_tenant IS NULL THEN
    RETURN;
  END IF;

  -- One live row of the caller there, the named one if a row is named; the
  -- window count sees every match, so several unnamed rows resolve nothing.
  SELECT m.id, m.tenant_id, m.role, m.staff_role, m.is_tenant_admin,
         pg_catalog.count(*) OVER ()
    INTO membership_id, tenant_id, role, staff_role, is_tenant_admin, v_rows
    FROM authz.memberships AS m
    JOIN public.tenants AS t ON t.id = m.tenant_id
   WHERE m.user_id = v_user
     AND m.tenant_id = v_tenant
     AND m.is_active
     AND m.revoked_at IS NULL
     AND (v_named IS NULL OR m.id = v_named)
   LIMIT 1;

  IF v_rows IS DISTINCT FROM 1 THEN
    membership_id := NULL;
    tenant_id := NULL;
    role := NULL;
    staff_role := NULL;
    is_tenant_admin := NULL;
  END IF;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.current_user_assignments()
 RETURNS TABLE(id uuid, user_id uuid, tenant_id uuid, role text, staff_role text, is_tenant_admin boolean, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
  SELECT
    m.id,
    m.user_id,
    m.tenant_id,
    m.role::TEXT,
    m.staff_role::TEXT,
    m.is_tenant_admin,
    m.updated_at
  FROM authz.memberships m
  WHERE m.user_id = auth.uid()
    AND m.is_active = true
  ORDER BY m.tenant_id, m.id;
$function$
;
CREATE OR REPLACE FUNCTION public.current_user_organizations()
 RETURNS TABLE(tenant_id uuid, name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT t.id, t.name
  FROM public.tenants t
  WHERE EXISTS (
    SELECT 1
    FROM authz.memberships m
    WHERE m.tenant_id = t.id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.revoked_at IS NULL
  )
  ORDER BY t.id;
$function$
;
CREATE OR REPLACE FUNCTION tenant_guard.begin_human_command(p_tenant_id uuid, p_capability text DEFAULT NULL::text)
 RETURNS tenant_guard.command_context
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  v_actor UUID := tenant_guard.caller_id();
  v_named UUID := tenant_guard.request_assignment_id();
  v_ctx tenant_guard.command_context;
  v_live INTEGER;
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

  PERFORM tenant_guard.enter(v_ctx.tenant_id);
  RETURN v_ctx;
END;
$function$
;
REVOKE EXECUTE ON FUNCTION authz.caller_tenant_ids() FROM tenant_guard;
ALTER TABLE public.tenants DROP COLUMN status;
NOTIFY pgrst, 'reload schema';
COMMIT;
