-- Normalize both operands with PostgreSQL's own collation before matching.
-- Unlike the four ILIKE predicates on an ordered list scan, the planner can
-- execute this set-returning query in parallel under RLS. The incoming
-- PostgREST filters, sort, cursor and limit apply to its result. A SQL body
-- parsed at creation binds the relations and functions without a runtime
-- search_path setting that would prevent inlining.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE FUNCTION public.search_crm_donors(p_tenant_id uuid, p_term text)
RETURNS SETOF public.donors
LANGUAGE sql STABLE PARALLEL SAFE SECURITY INVOKER
BEGIN ATOMIC
  -- Return the composite. Expanding d.* binds a separate dependency on
  -- every donor column, including fields the search never reads.
  SELECT d FROM public.donors d
   WHERE d.tenant_id = p_tenant_id
     AND d.tenant_id = (SELECT authz.current_tenant_id())
     AND (SELECT authz.assignment_is('staff'))
     AND (pg_catalog.lower(d.name) LIKE '%' || pg_catalog.lower(p_term) || '%'
       OR pg_catalog.lower(d.email) LIKE '%' || pg_catalog.lower(p_term) || '%'
       OR pg_catalog.lower(d.organization) LIKE '%' || pg_catalog.lower(p_term) || '%'
       OR pg_catalog.lower(d.phone) LIKE '%' || pg_catalog.lower(p_term) || '%');
END;
REVOKE ALL ON FUNCTION public.search_crm_donors(uuid,text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_crm_donors(uuid,text) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
