-- AL-2676, WP3a part 1b-1 (plan 12 WP3 lines 905-907): the four Site
-- administrator commands, each a tenant_guard SECURITY DEFINER human entry
-- point that opens with tenant_guard.begin_human_command(p_tenant_id,
-- 'sites.manage'), and their public SECURITY INVOKER wrappers, EXECUTE for
-- authenticated only.
--   create_site(uuid, text)               a non-default, active Site, no domain;
--   set_site_status(uuid, uuid, text)     active or inactive, never the default;
--   set_account_brand(uuid, text)         set or replace the display name;
--   designate_home(uuid, text)            first designation of home only.
-- None writes a claimed name: the guard holds no write on site_domains.
--
-- Every command, after the preamble and in this order (the repository's lock
-- order, as the invitation and Member Care commands take it):
--   1. refuses unless the request's tenant (x-asym-tenant) is present and is
--      the tenant the preamble entered, so a person who administers two
--      organizations acts only in the one the request names;
--   2. locks the tenant FOR SHARE (private.share_lock_tenant), which a status
--      change waits for;
--   3. locks the caller's selected assignment FOR SHARE;
--   4. locks its target rows;
--   5. re-checks, under those locks, that the tenant is active and the
--      assignment is the caller's, live and still holds sites.manage (42501),
--      before any validation or write;
--   and writes one public.audit_logs row on success.
--
-- private.share_lock_site_domain(uuid, text) is the one new helper: a
-- postgres-owned definer, executable by the guard only, that reads one claimed
-- name of the tenant it is given FOR SHARE (as private.share_lock_tenant does
-- for the tenant), so the guard can lock the name it designates without any
-- write privilege on site_domains. designate_home passes its entered tenant.
--
-- Locks: the column grants take SHARE ROW EXCLUSIVE on the three tables named
-- until COMMIT; no table is scanned.
--
-- Rollback (additive; revert while nothing depends on it), in one transaction:
--   DROP FUNCTION public.create_site(uuid, text), public.set_site_status(uuid, uuid, text),
--     public.set_account_brand(uuid, text), public.designate_home(uuid, text),
--     tenant_guard.create_site(uuid, text), tenant_guard.set_site_status(uuid, uuid, text),
--     tenant_guard.set_account_brand(uuid, text), tenant_guard.designate_home(uuid, text),
--     private.share_lock_site_domain(uuid, text);
--   REVOKE INSERT, UPDATE ON public.sites, public.donor_account_brands FROM tenant_guard;
--   REVOKE UPDATE ON public.donor_portal_hosts FROM tenant_guard;
BEGIN;
SET LOCAL lock_timeout = '5s';

-- Only the columns each command writes; nothing on site_domains.
GRANT INSERT (tenant_id,name), UPDATE (status) ON public.sites TO tenant_guard;
GRANT UPDATE (primary_domain) ON public.donor_portal_hosts TO tenant_guard;
GRANT INSERT (tenant_id,display_name), UPDATE (display_name) ON public.donor_account_brands TO tenant_guard;

-- Locks and returns one claimed name of the given tenant; no row for a name of
-- another tenant or none.
CREATE FUNCTION private.share_lock_site_domain(p_tenant_id uuid, p_host text)
RETURNS TABLE (host text, state text, surfaces text[])
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT domain.host, domain.state, domain.surfaces
    FROM public.site_domains AS domain
   WHERE domain.tenant_id = p_tenant_id
     AND domain.host = p_host
     FOR SHARE;
$$;
ALTER FUNCTION private.share_lock_site_domain(uuid, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.share_lock_site_domain(uuid, text) FROM PUBLIC, anon, authenticated, service_role, tenant_guard;
GRANT EXECUTE ON FUNCTION private.share_lock_site_domain(uuid, text) TO tenant_guard;

CREATE FUNCTION tenant_guard.create_site(p_tenant_id uuid, p_name text)
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
  v_site public.sites;
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

  -- Defaults make it non-default and active; it has no domain until one of its
  -- own claimed names is chosen.
  INSERT INTO public.sites (tenant_id, name)
  VALUES (v_ctx.tenant_id, p_name)
  RETURNING * INTO v_site;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'site_created',
    'site',
    v_site.id::text,
    pg_catalog.jsonb_build_object(
      'assignment_id', v_ctx.assignment_id,
      'to', pg_catalog.jsonb_build_object(
        'name', v_site.name,
        'status', v_site.status,
        'is_default', v_site.is_default
      )
    )
  );
  RETURN to_jsonb(v_site);
END;
$$;

CREATE FUNCTION tenant_guard.set_site_status(p_tenant_id uuid, p_site_id uuid, p_status text)
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
  v_before public.sites;
  v_site_found boolean;
  v_site public.sites;
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

  SELECT * INTO v_before
    FROM public.sites
   WHERE tenant_id = v_ctx.tenant_id AND id = p_site_id
     FOR UPDATE;
  v_site_found := FOUND;

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

  -- A Site of another tenant is not found, with no hint that it exists.
  IF v_site_found IS NOT TRUE THEN
    RAISE EXCEPTION 'set_site_status: Site not found' USING ERRCODE = 'P0002';
  END IF;

  -- The default Site's check refuses inactive (23514).
  UPDATE public.sites
     SET status = p_status
   WHERE tenant_id = v_ctx.tenant_id AND id = p_site_id
  RETURNING * INTO STRICT v_site;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'site_status_changed',
    'site',
    v_site.id::text,
    pg_catalog.jsonb_build_object(
      'assignment_id', v_ctx.assignment_id,
      'from', pg_catalog.jsonb_build_object('status', v_before.status),
      'to', pg_catalog.jsonb_build_object('status', v_site.status)
    )
  );
  RETURN to_jsonb(v_site);
END;
$$;

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
  ON CONFLICT (tenant_id) DO UPDATE SET display_name = excluded.display_name
  RETURNING * INTO v_brand;

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

CREATE FUNCTION tenant_guard.designate_home(p_tenant_id uuid, p_host text)
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
  v_home public.donor_portal_hosts;
  v_home_found boolean;
  v_domain record;
  v_domain_found boolean;
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

  -- Serialise designations of one tenant's home, then hold the name it names.
  -- The host is compared as stored (canonical), among the entered tenant's
  -- names only, so another tenant's name is not found.
  SELECT * INTO v_home
    FROM public.donor_portal_hosts
   WHERE tenant_id = v_ctx.tenant_id
     FOR UPDATE;
  v_home_found := FOUND;
  SELECT * INTO v_domain FROM private.share_lock_site_domain(v_ctx.tenant_id, p_host);
  v_domain_found := FOUND;

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

  IF p_host IS NULL THEN
    RAISE EXCEPTION 'designate_home: a host is required' USING ERRCODE = '22004';
  END IF;
  IF v_home_found IS NOT TRUE THEN
    RAISE EXCEPTION 'designate_home: this organization has no home record' USING ERRCODE = 'P0002';
  END IF;
  IF v_domain_found IS NOT TRUE THEN
    RAISE EXCEPTION 'designate_home: this organization has no claimed name %', p_host USING ERRCODE = 'P0002';
  END IF;
  -- Home serves the signed-in surfaces, so it must be ready and serve all three.
  IF v_domain.state NOT IN ('ready', 'active')
     OR NOT (v_domain.surfaces @> ARRAY['donor_account', 'staff', 'missionary']::text[]) THEN
    RAISE EXCEPTION 'designate_home: the home name must be ready and serve the donor account, staff and missionary surfaces'
      USING ERRCODE = '23514';
  END IF;
  -- First designation only; moving home is a later command.
  IF v_home.primary_domain IS NOT NULL THEN
    RAISE EXCEPTION 'designate_home: home is already designated' USING ERRCODE = '55000';
  END IF;

  UPDATE public.donor_portal_hosts
     SET primary_domain = v_domain.host
   WHERE id = v_home.id
  RETURNING * INTO STRICT v_home;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'home_designated',
    'donor_portal_host',
    v_home.id::text,
    pg_catalog.jsonb_build_object(
      'assignment_id', v_ctx.assignment_id,
      'from', pg_catalog.jsonb_build_object('primary_domain', NULL),
      'to', pg_catalog.jsonb_build_object('primary_domain', v_home.primary_domain)
    )
  );
  RETURN to_jsonb(v_home);
END;
$$;

REVOKE ALL ON FUNCTION tenant_guard.create_site(uuid, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.set_site_status(uuid, uuid, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.set_account_brand(uuid, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.designate_home(uuid, text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.create_site(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION tenant_guard.set_site_status(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION tenant_guard.set_account_brand(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION tenant_guard.designate_home(uuid, text) TO authenticated;

-- The guard owns its commands, so each runs without bypassing row security.
GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.create_site(uuid, text) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.set_site_status(uuid, uuid, text) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.set_account_brand(uuid, text) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.designate_home(uuid, text) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE FUNCTION public.create_site(p_tenant_id uuid, p_name text)
RETURNS jsonb LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path = ''
AS $$ SELECT tenant_guard.create_site(p_tenant_id, p_name); $$;
CREATE FUNCTION public.set_site_status(p_tenant_id uuid, p_site_id uuid, p_status text)
RETURNS jsonb LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path = ''
AS $$ SELECT tenant_guard.set_site_status(p_tenant_id, p_site_id, p_status); $$;
CREATE FUNCTION public.set_account_brand(p_tenant_id uuid, p_display_name text)
RETURNS jsonb LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path = ''
AS $$ SELECT tenant_guard.set_account_brand(p_tenant_id, p_display_name); $$;
CREATE FUNCTION public.designate_home(p_tenant_id uuid, p_host text)
RETURNS jsonb LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path = ''
AS $$ SELECT tenant_guard.designate_home(p_tenant_id, p_host); $$;

ALTER FUNCTION public.create_site(uuid, text) OWNER TO postgres;
ALTER FUNCTION public.set_site_status(uuid, uuid, text) OWNER TO postgres;
ALTER FUNCTION public.set_account_brand(uuid, text) OWNER TO postgres;
ALTER FUNCTION public.designate_home(uuid, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.create_site(uuid, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.set_site_status(uuid, uuid, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.set_account_brand(uuid, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.designate_home(uuid, text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_site(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_site_status(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_account_brand(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.designate_home(uuid, text) TO authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
