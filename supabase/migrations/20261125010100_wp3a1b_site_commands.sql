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
-- Locks: the column grants take SHARE ROW EXCLUSIVE on the three tables named
-- until COMMIT; no table is scanned.
--
-- Rollback (additive; revert while nothing depends on it), in one transaction:
--   DROP FUNCTION public.create_site(uuid, text), public.set_site_status(uuid, uuid, text),
--     public.set_account_brand(uuid, text), public.designate_home(uuid, text),
--     tenant_guard.create_site(uuid, text), tenant_guard.set_site_status(uuid, uuid, text),
--     tenant_guard.set_account_brand(uuid, text), tenant_guard.designate_home(uuid, text);
--   REVOKE INSERT, UPDATE ON public.sites, public.donor_account_brands FROM tenant_guard;
--   REVOKE UPDATE ON public.donor_portal_hosts FROM tenant_guard;
BEGIN;
SET LOCAL lock_timeout = '5s';

-- Only the columns each command writes; nothing on site_domains.
GRANT INSERT (tenant_id,name), UPDATE (status) ON public.sites TO tenant_guard;
GRANT UPDATE (primary_domain) ON public.donor_portal_hosts TO tenant_guard;
GRANT INSERT (tenant_id,display_name), UPDATE (display_name) ON public.donor_account_brands TO tenant_guard;

CREATE FUNCTION tenant_guard.create_site(p_tenant_id uuid, p_name text)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_site public.sites;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'sites.manage');
  -- Defaults make it non-default and active; it has no domain until one of its
  -- own claimed names is chosen.
  INSERT INTO public.sites (tenant_id, name)
  VALUES (v_ctx.tenant_id, p_name)
  RETURNING * INTO v_site;
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
  v_site public.sites;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'sites.manage');
  -- A Site of another tenant is not found (P0002); the default Site's check
  -- refuses inactive (23514).
  UPDATE public.sites
     SET status = p_status
   WHERE tenant_id = v_ctx.tenant_id AND id = p_site_id
  RETURNING * INTO STRICT v_site;
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
  v_brand public.donor_account_brands;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'sites.manage');
  INSERT INTO public.donor_account_brands (tenant_id, display_name)
  VALUES (v_ctx.tenant_id, p_display_name)
  ON CONFLICT (tenant_id) DO UPDATE SET display_name = excluded.display_name
  RETURNING * INTO v_brand;
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
  v_home public.donor_portal_hosts;
  v_domain public.site_domains;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'sites.manage');
  IF p_host IS NULL THEN
    RAISE EXCEPTION 'designate_home: a host is required' USING ERRCODE = '22004';
  END IF;
  -- Serialise designations of one tenant's home.
  SELECT * INTO v_home
    FROM public.donor_portal_hosts
   WHERE tenant_id = v_ctx.tenant_id
     FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'designate_home: this organization has no home record' USING ERRCODE = 'P0002';
  END IF;
  -- The host is compared as stored (canonical). The guard sees only the entered
  -- tenant's names, so another tenant's name is not found, with no hint that
  -- it exists.
  SELECT * INTO v_domain
    FROM public.site_domains
   WHERE tenant_id = v_ctx.tenant_id AND host = p_host;
  IF NOT FOUND THEN
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
