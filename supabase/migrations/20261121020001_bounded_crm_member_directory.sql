-- The CRM knows the profile IDs on its page. Resolve only those profiles
-- and emit each once, even when the person holds multiple assignments.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE FUNCTION public.tenant_member_directory(p_tenant_id uuid, p_profile_ids uuid[])
RETURNS TABLE (profile_id uuid, display_name text, email text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF p_tenant_id IS DISTINCT FROM authz.current_tenant_id()
     OR authz.caller_assignment(p_tenant_id, 'staff') IS NULL THEN
    RAISE EXCEPTION 'The member directory requires an active staff assignment in the selected tenant.'
      USING ERRCODE = '42501';
  END IF;
  IF COALESCE(pg_catalog.cardinality(p_profile_ids), 0) > 150 THEN
    RAISE EXCEPTION 'The member directory accepts at most 150 profile IDs.' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
    SELECT p.id,
           COALESCE(NULLIF(btrim(p.display_name), ''), NULLIF(btrim(p.full_name), ''),
                    NULLIF(btrim(concat_ws(' ', p.first_name, p.last_name)), '')),
           p.email
      FROM public.profiles p
     WHERE p.id = ANY (p_profile_ids)
       AND EXISTS (
         SELECT 1 FROM authz.memberships m
          WHERE m.user_id = p.user_id AND m.tenant_id = p_tenant_id
            AND m.is_active AND m.revoked_at IS NULL
       );
END;
$$;
ALTER FUNCTION public.tenant_member_directory(uuid,uuid[]) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.tenant_member_directory(uuid,uuid[]) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.tenant_member_directory(uuid,uuid[]) TO authenticated;

-- Resolve worker IDs and member labels in one Data API call. The invoker's
-- tenant policy judges the worker read. Only the name lookup uses the directory.
CREATE FUNCTION public.crm_missionary_labels(p_tenant_id uuid, p_ids uuid[])
RETURNS TABLE (id uuid, profile_id uuid, member_profile_id uuid, display_name text, email text)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = ''
AS $$
BEGIN
  IF COALESCE(pg_catalog.cardinality(p_ids), 0) > 150 THEN
    RAISE EXCEPTION 'Missionary labels accept at most 150 IDs.' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
  WITH workers AS MATERIALIZED (
    SELECT m.id, m.profile_id FROM public.missionaries m
     WHERE m.tenant_id = p_tenant_id AND m.id = ANY (p_ids)
       AND (SELECT authz.assignment_is('staff'))
  ), names AS (
    SELECT * FROM public.tenant_member_directory(p_tenant_id, ARRAY(SELECT w.profile_id FROM workers w))
  )
  SELECT w.id, w.profile_id, n.profile_id, n.display_name, n.email
    FROM workers w LEFT JOIN names n ON n.profile_id = w.profile_id;
END;
$$;
REVOKE ALL ON FUNCTION public.crm_missionary_labels(uuid,uuid[]) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.crm_missionary_labels(uuid,uuid[]) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
