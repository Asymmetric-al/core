BEGIN;

SET LOCAL lock_timeout = '5s';

ALTER TABLE public.tenants ADD COLUMN status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','closed'));

CREATE OR REPLACE FUNCTION authz.request_assignment(
  OUT membership_id UUID,
  OUT tenant_id UUID,
  OUT role authz.membership_role,
  OUT staff_role authz.staff_role,
  OUT is_tenant_admin BOOLEAN
)
LANGUAGE plpgsql
STABLE
PARALLEL SAFE
SECURITY DEFINER
SET search_path = ''
AS $$
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
    JOIN public.tenants AS t ON t.id = m.tenant_id AND t.status = 'active'
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
$$;

CREATE OR REPLACE FUNCTION authz.caller_tenant_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
PARALLEL SAFE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT DISTINCT m.tenant_id
    FROM authz.memberships AS m
    JOIN public.tenants AS t ON t.id = m.tenant_id AND t.status = 'active'
   WHERE m.user_id = auth.uid()
     AND m.is_active
     AND m.revoked_at IS NULL;
$$;

CREATE OR REPLACE FUNCTION authz.caller_assignment(
  p_tenant_id UUID,
  p_role authz.membership_role
)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
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
    JOIN public.tenants AS t ON t.id = m.tenant_id AND t.status = 'active'
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
$$;

CREATE OR REPLACE FUNCTION public.current_user_organizations()
RETURNS TABLE (
  tenant_id UUID,
  name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT t.id, t.name
  FROM public.tenants t
  WHERE t.status = 'active' AND EXISTS (
    SELECT 1
    FROM authz.memberships m
    WHERE m.tenant_id = t.id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.revoked_at IS NULL
  )
  ORDER BY t.id;
$$;

CREATE OR REPLACE FUNCTION public.current_user_assignments()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  tenant_id UUID,
  role TEXT,
  staff_role TEXT,
  is_tenant_admin BOOLEAN,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
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
    AND m.is_active = true AND m.revoked_at IS NULL
    AND m.tenant_id IN (SELECT authz.caller_tenant_ids())
  ORDER BY m.tenant_id, m.id;
$$;

GRANT EXECUTE ON FUNCTION authz.caller_tenant_ids() TO tenant_guard;

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

  PERFORM tenant_guard.enter(v_ctx.tenant_id);
  RETURN v_ctx;
END;
$$;

COMMIT;
