-- Normalize both operands with PostgreSQL's own collation before matching.
-- Unlike the four ILIKE predicates on an ordered list scan, the planner can
-- execute this set-returning query in parallel under RLS. The incoming
-- PostgREST filters, sort, cursor and limit apply to its result. A SQL body
-- parsed at creation binds the relations and functions without a runtime
-- search_path setting that would prevent inlining.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE FUNCTION public.search_crm_donors(p_tenant_id uuid, p_term text)
RETURNS TABLE (
  tenant_id uuid, id uuid, profile_id uuid, missionary_id uuid,
  name text, email text, phone text, avatar_url text,
  location text, type text, status text, total_given bigint,
  last_gift_date timestamptz, tags text[], organization text, title text,
  notes text, created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql STABLE PARALLEL SAFE SECURITY INVOKER
BEGIN ATOMIC
  -- Keep the projected columns inlinable and bind no unused donor fields.
  SELECT d.tenant_id, d.id, d.profile_id, d.missionary_id, d.name,
         d.email, d.phone, d.avatar_url, d.location, d.type,
         d.status, d.total_given, d.last_gift_date, d.tags, d.organization,
         d.title, d.notes, d.created_at, d.updated_at
    FROM public.donors d
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
