-- AL-2676, WP3a part 1b-1 (OpenSpec adopt-tenant-owned-domains, task 2.1;
-- plan 12 WP3 lines 904-907 and 925-926): an organization's own names.
--   public.sites                 a Site, which exists before its domain;
--   public.site_domains          the claimed-name record, one row per live claim,
--                                written only when a challenge passes;
--   public.donor_portal_hosts    the home record (same ID; now means home);
--   public.donor_account_brands  the donor account's display name;
--   public.resolve_verified_host(text), the anonymous lookup of a ready or
--   active name.
-- Nothing here writes a real claimed name: no client, service role or guard
-- holds a write on site_domains. The seed writes the local fixtures as owner.
--
-- Locks: creating the foreign keys takes SHARE ROW EXCLUSIVE on public.tenants
-- and auth.users until COMMIT; the four new relations hold no rows to scan.
-- The field-policy rows insert into public.field_policies under ROW EXCLUSIVE.
--
-- Rollback (additive; revert while nothing depends on it), in one transaction:
--   DROP FUNCTION public.resolve_verified_host(text);
--   ALTER TABLE public.sites DROP CONSTRAINT sites_primary_domain_fk;
--   DROP TABLE public.donor_account_brands, public.donor_portal_hosts,
--     public.site_domains, public.sites;
--   DELETE FROM public.field_policies WHERE record_type IN
--     ('sites','site_domains','donor_portal_hosts','donor_account_brands');
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE public.sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  name text NOT NULL CHECK (name = btrim(name) AND length(name) BETWEEN 1 AND 160),
  is_default boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  -- Null until a claimed name of this Site is chosen (design.md, "a Site exists
  -- before its domain"); checked by sites_primary_domain_fk below.
  primary_domain text COLLATE "C",
  UNIQUE (tenant_id,id),
  -- The default Site is never inactive.
  CHECK (NOT is_default OR status = 'active')
);
CREATE UNIQUE INDEX sites_one_default ON public.sites (tenant_id) WHERE is_default;

CREATE TABLE public.site_domains (
  -- Stored canonical: lower-case ASCII DNS labels, no port, no trailing dot.
  host text COLLATE "C" PRIMARY KEY CHECK (
    octet_length(host) <= 253 AND
    host ~ '^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]([a-z0-9-]{0,61}[a-z0-9])?$'
  ),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  -- One database sequence: never a writer's value, never reused after a delete,
  -- so a released name cannot revive an old binding generation.
  generation bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  -- Which surfaces the name serves: at least one, each known, none twice.
  surfaces text[] NOT NULL CHECK (
    array_ndims(surfaces) = 1 AND
    cardinality(surfaces) >= 1 AND
    surfaces <@ ARRAY['website','donor_account','staff','missionary']::text[] AND
    cardinality(array_positions(surfaces,'website')) <= 1 AND
    cardinality(array_positions(surfaces,'donor_account')) <= 1 AND
    cardinality(array_positions(surfaces,'staff')) <= 1 AND
    cardinality(array_positions(surfaces,'missionary')) <= 1
  ),
  site_id uuid,
  -- Core's app key of the hosting project the name must reach (proof 3).
  expected_project text NOT NULL CHECK (expected_project IN ('donor','admin','missionary')),
  -- The six proofs, in order (design.md, "How It Works Under A"). A row exists
  -- only once control is proved.
  control_proved_at timestamptz NOT NULL,
  attached_at timestamptz,
  attached_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  routing_proved_at timestamptz,
  https_proved_at timestamptz,
  sign_in_ready_at timestamptz,
  activation_proved_at timestamptz,
  activation_proved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Derived from the proofs, so no writer sets it and it cannot drift.
  state text NOT NULL GENERATED ALWAYS AS (
    CASE
      WHEN activation_proved_at IS NOT NULL THEN 'active'
      WHEN sign_in_ready_at IS NOT NULL THEN 'ready'
      ELSE 'claimed'
    END
  ) STORED,
  -- A website name is bound to a Site; any other name is not.
  CONSTRAINT site_domains_website_site CHECK ((site_id IS NOT NULL) = ('website' = ANY (surfaces))),
  -- Each proof needs the one before it; an actor needs its time.
  CONSTRAINT site_domains_routing_after_attach CHECK (routing_proved_at IS NULL OR attached_at IS NOT NULL),
  CONSTRAINT site_domains_https_after_routing CHECK (https_proved_at IS NULL OR routing_proved_at IS NOT NULL),
  CONSTRAINT site_domains_sign_in_after_https CHECK (sign_in_ready_at IS NULL OR https_proved_at IS NOT NULL),
  CONSTRAINT site_domains_activation_after_sign_in CHECK (activation_proved_at IS NULL OR sign_in_ready_at IS NOT NULL),
  CONSTRAINT site_domains_attached_by_needs_time CHECK (attached_by IS NULL OR attached_at IS NOT NULL),
  CONSTRAINT site_domains_activation_by_needs_time CHECK (activation_proved_by IS NULL OR activation_proved_at IS NOT NULL),
  UNIQUE (tenant_id,site_id,host),
  UNIQUE (tenant_id,host),
  -- A name binds only a Site of its own tenant, for every writer.
  FOREIGN KEY (tenant_id,site_id) REFERENCES public.sites(tenant_id,id) ON DELETE RESTRICT
);

-- A Site's primary domain is one of its own claimed names; checked at commit,
-- and not at all while it is null.
ALTER TABLE public.sites ADD CONSTRAINT sites_primary_domain_fk
  FOREIGN KEY (tenant_id,id,primary_domain) REFERENCES public.site_domains(tenant_id,site_id,host)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE public.donor_portal_hosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- One home record per tenant.
  tenant_id uuid NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE RESTRICT,
  -- Null until designate_home names one of the tenant's own claimed names.
  primary_domain text COLLATE "C",
  UNIQUE (tenant_id,id),
  CONSTRAINT donor_portal_hosts_primary_domain_fk
    FOREIGN KEY (tenant_id,primary_domain) REFERENCES public.site_domains(tenant_id,host)
    ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE public.donor_account_brands (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE RESTRICT,
  display_name text NOT NULL CHECK (display_name = btrim(display_name) AND length(display_name) BETWEEN 1 AND 160),
  -- A brand belongs to a tenant that has its home record.
  FOREIGN KEY (tenant_id) REFERENCES public.donor_portal_hosts(tenant_id) ON DELETE RESTRICT
);

-- No client reads or writes these tables; the guard reads its entered tenant's
-- rows, and Migration B gives it only the columns each command writes.
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

-- The anonymous lookup (docs/security/anon-definer-allowlist.json): a ready or
-- active name gives six fields, anything else nothing. HTTP spelling is
-- normalised (lower case; one trailing dot and a numeric port removed); a
-- Unicode or malformed name never matches the stored ASCII host. It neither
-- filters nor returns tenant or Site status: the request path reads status.
CREATE FUNCTION public.resolve_verified_host(p_host text)
RETURNS TABLE (tenant_id uuid, site_id uuid, generation bigint, surfaces text[], state text, is_home boolean)
LANGUAGE sql STABLE STRICT SECURITY DEFINER SET search_path = '' AS $$
  SELECT domain.tenant_id, domain.site_id, domain.generation, domain.surfaces, domain.state,
         EXISTS (
           SELECT 1 FROM public.donor_portal_hosts AS home
            WHERE home.tenant_id = domain.tenant_id AND home.primary_domain = domain.host
         )
    FROM public.site_domains AS domain
   WHERE domain.host = pg_catalog.lower(pg_catalog.regexp_replace(p_host COLLATE "C", '\.?(:[0-9]+)?$', ''))
     AND domain.state IN ('ready','active');
$$;
ALTER FUNCTION public.resolve_verified_host(text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.resolve_verified_host(text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.resolve_verified_host(text) TO anon,authenticated,service_role;

-- Every column on the five surfaces: Mission Control sees all; the public
-- surface sees only the lookup's five record fields; nothing is editable or
-- exportable. site_domains.tenant_id is the one reviewed same-name exception.
INSERT INTO public.field_policies (record_type,field_key,surface,visible,editable,exportable,sensitivity_category)
SELECT fields.record_type, key, surface,
       surface = 'mission_control' OR (surface = 'public' AND fields.record_type = 'site_domains'
         AND key IN ('tenant_id','site_id','generation','surfaces','state')),
       false,false,fields.category::public.field_sensitivity_category
FROM (VALUES
  ('sites','internal',ARRAY['id','tenant_id','is_default','primary_domain']),
  ('sites','contact',ARRAY['name']),
  ('sites','care',ARRAY['status']),
  ('site_domains','internal',ARRAY['host','expected_project']),
  ('site_domains','public',ARRAY['tenant_id','site_id','generation','surfaces','state']),
  ('site_domains','security',ARRAY['control_proved_at','attached_at','attached_by','routing_proved_at',
    'https_proved_at','sign_in_ready_at','activation_proved_at','activation_proved_by']),
  ('donor_portal_hosts','internal',ARRAY['id','tenant_id','primary_domain']),
  ('donor_account_brands','internal',ARRAY['tenant_id']),
  ('donor_account_brands','contact',ARRAY['display_name'])
) AS fields(record_type,category,keys)
CROSS JOIN LATERAL unnest(fields.keys) AS key
CROSS JOIN unnest(ARRAY['mission_control','donor','missionary','public','export']) AS surface;
COMMIT;
