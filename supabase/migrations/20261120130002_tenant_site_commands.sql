BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE FUNCTION private.check_custom_site_host() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.is_platform_host OR NEW.host ~ '(^|\.)(localhost|local|invalid|test|example|example\.(com|net|org))$' OR EXISTS (
    SELECT FROM public.site_domains AS platform_domain
      WHERE platform_domain.is_platform_host AND
        (NEW.host = substr(platform_domain.host, strpos(platform_domain.host,'.')+1)
         OR NEW.host LIKE '%' || substr(platform_domain.host,strpos(platform_domain.host,'.')))
  ) THEN
    RAISE EXCEPTION 'Host is reserved' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.check_custom_site_host() FROM PUBLIC,anon,authenticated,service_role,tenant_guard;
CREATE TRIGGER check_custom_site_host BEFORE INSERT OR UPDATE OF verification_requested_at ON public.site_domains
FOR EACH ROW WHEN (current_user = 'tenant_guard') EXECUTE FUNCTION private.check_custom_site_host();

GRANT INSERT (tenant_id,name,primary_domain), UPDATE (status) ON public.sites TO tenant_guard;
GRANT INSERT (host,tenant_id,site_id,portal_host_id,verification_requested_by,verification_requested_at), UPDATE (verification_requested_at,verification_requested_by) ON public.site_domains TO tenant_guard;
GRANT INSERT (tenant_id,display_name), UPDATE (display_name) ON public.donor_account_brands TO tenant_guard;

CREATE FUNCTION tenant_guard.create_site(p_tenant_id uuid,p_name text,p_primary_domain text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_site public.sites;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id,'sites.manage');
  INSERT INTO public.sites (tenant_id,name,primary_domain) VALUES (v_ctx.tenant_id,p_name,p_primary_domain) RETURNING * INTO v_site;
  INSERT INTO public.site_domains (host,tenant_id,site_id) VALUES (p_primary_domain,v_ctx.tenant_id,v_site.id);
  RETURN to_jsonb(v_site);
END;
$$;

CREATE FUNCTION tenant_guard.set_site_status(p_tenant_id uuid,p_site_id uuid,p_status text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_site public.sites;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id,'sites.manage');
  UPDATE public.sites SET status=p_status WHERE tenant_id=v_ctx.tenant_id AND id=p_site_id RETURNING * INTO STRICT v_site;
  RETURN to_jsonb(v_site);
END;
$$;

CREATE FUNCTION tenant_guard.verify_domain(p_tenant_id uuid,p_host text,p_site_id uuid,p_portal_host_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_domain public.site_domains;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id,'sites.manage');
  IF num_nonnulls(p_site_id,p_portal_host_id) <> 1 OR NOT (
    EXISTS (SELECT FROM public.sites WHERE (tenant_id,id)=(v_ctx.tenant_id,p_site_id)) OR
    EXISTS (SELECT FROM public.donor_portal_hosts WHERE (tenant_id,id)=(v_ctx.tenant_id,p_portal_host_id))
  ) THEN RAISE EXCEPTION 'Unknown host destination' USING ERRCODE='22023'; END IF;
  SELECT * INTO v_domain FROM public.site_domains WHERE host=p_host AND tenant_id=v_ctx.tenant_id;
  IF FOUND THEN
    IF v_domain.is_platform_host OR v_domain.site_id IS DISTINCT FROM p_site_id OR v_domain.portal_host_id IS DISTINCT FROM p_portal_host_id THEN
      RAISE EXCEPTION 'Host unavailable' USING ERRCODE='23514';
    END IF;
    UPDATE public.site_domains SET verification_requested_at=coalesce(verification_requested_at,now()),verification_requested_by=coalesce(verification_requested_by,v_ctx.actor_id)
      WHERE host=p_host AND tenant_id=v_ctx.tenant_id RETURNING * INTO STRICT v_domain;
  ELSE
    INSERT INTO public.site_domains (tenant_id,host,site_id,portal_host_id,verification_requested_at,verification_requested_by)
      VALUES (v_ctx.tenant_id,p_host,p_site_id,p_portal_host_id,now(),v_ctx.actor_id) RETURNING * INTO v_domain;
  END IF;
  RETURN to_jsonb(v_domain);
END;
$$;

CREATE FUNCTION tenant_guard.set_account_brand(p_tenant_id uuid,p_display_name text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_brand public.donor_account_brands;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id,'sites.manage');
  INSERT INTO public.donor_account_brands (tenant_id,display_name) VALUES (v_ctx.tenant_id,p_display_name)
    ON CONFLICT (tenant_id) DO UPDATE SET display_name=excluded.display_name RETURNING * INTO v_brand;
  RETURN to_jsonb(v_brand);
END;
$$;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.create_site(uuid,text,text) OWNER TO tenant_guard;
REVOKE ALL ON FUNCTION tenant_guard.create_site(uuid,text,text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.create_site(uuid,text,text) TO authenticated;
CREATE FUNCTION public.create_site(p_tenant_id uuid,p_name text,p_primary_domain text) RETURNS jsonb
LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path='' AS $$ SELECT tenant_guard.create_site(p_tenant_id,p_name,p_primary_domain); $$;
REVOKE ALL ON FUNCTION public.create_site(uuid,text,text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.create_site(uuid,text,text) TO authenticated;

ALTER FUNCTION tenant_guard.set_site_status(uuid,uuid,text) OWNER TO tenant_guard;
REVOKE ALL ON FUNCTION tenant_guard.set_site_status(uuid,uuid,text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.set_site_status(uuid,uuid,text) TO authenticated;
CREATE FUNCTION public.set_site_status(p_tenant_id uuid,p_site_id uuid,p_status text) RETURNS jsonb
LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path='' AS $$ SELECT tenant_guard.set_site_status(p_tenant_id,p_site_id,p_status); $$;
REVOKE ALL ON FUNCTION public.set_site_status(uuid,uuid,text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.set_site_status(uuid,uuid,text) TO authenticated;

ALTER FUNCTION tenant_guard.verify_domain(uuid,text,uuid,uuid) OWNER TO tenant_guard;
REVOKE ALL ON FUNCTION tenant_guard.verify_domain(uuid,text,uuid,uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.verify_domain(uuid,text,uuid,uuid) TO authenticated;
CREATE FUNCTION public.verify_domain(p_tenant_id uuid,p_host text,p_site_id uuid,p_portal_host_id uuid) RETURNS jsonb
LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path='' AS $$ SELECT tenant_guard.verify_domain(p_tenant_id,p_host,p_site_id,p_portal_host_id); $$;
REVOKE ALL ON FUNCTION public.verify_domain(uuid,text,uuid,uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.verify_domain(uuid,text,uuid,uuid) TO authenticated;

ALTER FUNCTION tenant_guard.set_account_brand(uuid,text) OWNER TO tenant_guard;
REVOKE ALL ON FUNCTION tenant_guard.set_account_brand(uuid,text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.set_account_brand(uuid,text) TO authenticated;
CREATE FUNCTION public.set_account_brand(p_tenant_id uuid,p_display_name text) RETURNS jsonb
LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path='' AS $$ SELECT tenant_guard.set_account_brand(p_tenant_id,p_display_name); $$;
REVOKE ALL ON FUNCTION public.set_account_brand(uuid,text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.set_account_brand(uuid,text) TO authenticated;

REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;
NOTIFY pgrst,'reload schema';
COMMIT;
