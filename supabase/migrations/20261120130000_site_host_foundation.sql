BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE public.sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  name text NOT NULL CHECK (name = btrim(name) AND length(name) BETWEEN 1 AND 160),
  is_default boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  primary_domain text COLLATE "C" NOT NULL,
  UNIQUE (tenant_id,id),
  CHECK (NOT is_default OR status = 'active')
);
CREATE UNIQUE INDEX sites_one_default ON public.sites (tenant_id) WHERE is_default;

CREATE TABLE public.donor_portal_hosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE RESTRICT,
  primary_domain text COLLATE "C" NOT NULL,
  UNIQUE (tenant_id,id)
);

CREATE TABLE public.site_domains (
  host text COLLATE "C" PRIMARY KEY CHECK (
    octet_length(host) <= 253 AND
    host ~ '^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]([a-z0-9-]{0,61}[a-z0-9])?$'
  ),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  site_id uuid,
  portal_host_id uuid,
  is_platform_host boolean NOT NULL DEFAULT false,
  verification_requested_at timestamptz,
  verification_requested_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  deployment_attached_at timestamptz,
  redirect_allowlisted_at timestamptz,
  CHECK (num_nonnulls(site_id,portal_host_id) = 1),
  CHECK (verification_requested_by IS NULL OR verification_requested_at IS NOT NULL),
  CHECK (verification_requested_at IS NULL OR is_platform_host OR verification_requested_by IS NOT NULL),
  CHECK (deployment_attached_at IS NULL OR verification_requested_at IS NOT NULL),
  CHECK (redirect_allowlisted_at IS NULL OR (portal_host_id IS NOT NULL AND verification_requested_at IS NOT NULL)),
  UNIQUE (tenant_id,site_id,host),
  UNIQUE (tenant_id,portal_host_id,host),
  FOREIGN KEY (tenant_id,site_id) REFERENCES public.sites(tenant_id,id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id,portal_host_id) REFERENCES public.donor_portal_hosts(tenant_id,id) ON DELETE RESTRICT
);
ALTER TABLE public.sites ADD CONSTRAINT sites_primary_domain_fk
  FOREIGN KEY (tenant_id,id,primary_domain) REFERENCES public.site_domains(tenant_id,site_id,host)
  DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE public.donor_portal_hosts ADD CONSTRAINT donor_portal_hosts_primary_domain_fk
  FOREIGN KEY (tenant_id,id,primary_domain) REFERENCES public.site_domains(tenant_id,portal_host_id,host)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE public.donor_account_brands (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE RESTRICT,
  display_name text NOT NULL CHECK (display_name = btrim(display_name) AND length(display_name) BETWEEN 1 AND 160),
  FOREIGN KEY (tenant_id) REFERENCES public.donor_portal_hosts(tenant_id) ON DELETE RESTRICT
);

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites FORCE ROW LEVEL SECURITY;
ALTER TABLE public.site_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_domains FORCE ROW LEVEL SECURITY;
ALTER TABLE public.donor_portal_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_portal_hosts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.donor_account_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_account_brands FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.sites,public.site_domains,public.donor_portal_hosts,public.donor_account_brands
  FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.sites,public.site_domains,public.donor_portal_hosts,public.donor_account_brands TO tenant_guard;
CREATE POLICY tenant_guard_isolation ON public.sites TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id()) WITH CHECK (tenant_id = tenant_guard.current_tenant_id());
CREATE POLICY tenant_guard_isolation ON public.site_domains TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id()) WITH CHECK (tenant_id = tenant_guard.current_tenant_id());
CREATE POLICY tenant_guard_isolation ON public.donor_portal_hosts TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id()) WITH CHECK (tenant_id = tenant_guard.current_tenant_id());
CREATE POLICY tenant_guard_isolation ON public.donor_account_brands TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id()) WITH CHECK (tenant_id = tenant_guard.current_tenant_id());

CREATE FUNCTION public.resolve_verified_host(p_host text)
RETURNS TABLE (tenant_id uuid, site_id uuid)
LANGUAGE sql STABLE STRICT SECURITY DEFINER SET search_path = '' AS $$
  SELECT domain.tenant_id, domain.site_id
    FROM public.site_domains AS domain
   WHERE domain.host = p_host AND domain.deployment_attached_at IS NOT NULL
     AND (domain.site_id IS NOT NULL OR (
       domain.redirect_allowlisted_at IS NOT NULL AND EXISTS (
         SELECT 1 FROM public.donor_portal_hosts AS portal
          WHERE (portal.tenant_id,portal.id,portal.primary_domain) = (domain.tenant_id,domain.portal_host_id,domain.host)
       )
     ));
$$;
ALTER FUNCTION public.resolve_verified_host(text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.resolve_verified_host(text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.resolve_verified_host(text) TO anon,authenticated,service_role;

INSERT INTO public.field_policies (record_type,field_key,surface,visible,editable,exportable,sensitivity_category)
SELECT fields.record_type, key, surface,
       surface = 'mission_control' OR (surface = 'public' AND fields.record_type = 'site_domains' AND key IN ('tenant_id','site_id')),
       false,false,fields.category::public.field_sensitivity_category
FROM (VALUES
  ('sites','internal',ARRAY['id','tenant_id','is_default','primary_domain']),
  ('sites','contact',ARRAY['name']),('sites','care',ARRAY['status']),
  ('donor_portal_hosts','internal',ARRAY['id','tenant_id','primary_domain']),
  ('site_domains','internal',ARRAY['host','tenant_id','site_id','portal_host_id','is_platform_host']),
  ('site_domains','security',ARRAY['verification_requested_at','verification_requested_by','deployment_attached_at','redirect_allowlisted_at']),
  ('donor_account_brands','internal',ARRAY['tenant_id']),('donor_account_brands','contact',ARRAY['display_name'])
) AS fields(record_type,category,keys)
CROSS JOIN LATERAL unnest(fields.keys) AS key
CROSS JOIN unnest(ARRAY['mission_control','donor','missionary','public','export']) AS surface;
COMMIT;
