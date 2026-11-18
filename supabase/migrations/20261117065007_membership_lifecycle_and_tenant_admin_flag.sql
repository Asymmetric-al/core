-- AL-2675 (WP2a, the membership core; plan 5.1, 9.4 and WP2 "Data"; audit
-- A03, A06, NR-18): a membership row is the only authority.
--
-- 1. `authz.memberships` gains `granted_by`, `revoked_at` and the
--    tenant-administrator flag `is_tenant_admin`. The flag lives only on a
--    staff row. Tenant administration is not a role or a sub-role, so the
--    staff check and the general membership check stay as they are.
-- 2. One lifecycle rule, kept by a trigger for every writer: a row is live
--    exactly when it is active and unrevoked. Revoking (clearing `is_active`
--    or stamping `revoked_at`) sets both together; granting a role the person
--    held before revives that same row, because the unique key covers revoked
--    rows too: `is_active` returns and `revoked_at` clears, and the writer sets
--    the new `granted_by`. The helpers that test `is_active` stay correct.
--    A row that is not live never carries the tenant-administrator flag: the
--    trigger clears it on revocation, so a re-grant brings no administration
--    back unless the re-granting statement sets the flag itself (council
--    round 1 on WP2a, F1).
-- 3. The active-membership index (plan 9.4) covers the lookups every helper
--    makes: the caller's live rows in a tenant, by class and sub-role.
-- 4. Data. No staff row keeps the member-care sub-role by default: each such
--    row takes the development sub-role (the decision table,
--    docs/audits/core-crm-cms-database-proofs/wp2a-membership-decision-table.md,
--    names no other). A profile whose role class has no membership row in its
--    tenant gets one from its profile role, so no one who reaches a surface
--    today through the profile-role fallback loses it: donor and missionary
--    profiles a row of that class, staff, admin and super_admin profiles a
--    staff row with the development sub-role. Admin and super_admin profiles
--    get the flag on their staff row in that tenant. A super_admin profile with
--    no tenant is placed in the demo tenant, as the application does today. A
--    class that has any row there, live or revoked, gets no new one, so a
--    revocation stands. Profiles with any other role get nothing: they hold no
--    authority today.
-- 5. The assignments functions return the flag.
--
-- Down (run by hand, in one transaction): restore the two functions from
-- 20261025120700_current_user_assignments_rpc.sql and
-- 20260802041500_current_user_memberships_rpc.sql (DROP them first, then run
-- their bodies and grants); DROP TRIGGER authz_memberships_lifecycle ON
-- authz.memberships; DROP FUNCTION authz.memberships_lifecycle(); DROP INDEX
-- authz.authz_memberships_live_idx; CREATE INDEX
-- authz_memberships_user_tenant_active_idx ON authz.memberships (user_id,
-- tenant_id) WHERE is_active = true; ALTER TABLE authz.memberships DROP
-- CONSTRAINT authz_memberships_live_chk, DROP CONSTRAINT
-- authz_memberships_tenant_admin_staff_chk, DROP COLUMN is_tenant_admin, DROP
-- COLUMN revoked_at, DROP COLUMN granted_by. The data step is not reversed:
-- the sub-role change and the added rows are what the decision table records.

BEGIN;

-- 1. Columns.
ALTER TABLE authz.memberships
  ADD COLUMN IF NOT EXISTS granted_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_tenant_admin BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN authz.memberships.granted_by IS
  'The person who granted, or last re-granted, this row. NULL for rows the system created.';
COMMENT ON COLUMN authz.memberships.revoked_at IS
  'When the row was revoked. Set exactly when is_active is false (trigger authz_memberships_lifecycle).';
COMMENT ON COLUMN authz.memberships.is_tenant_admin IS
  'Tenant administration (plan 5.1): a flag on a staff row, reaching the capability registry as the tenant_admin grant.';

-- A row that is inactive today was revoked when it was last changed.
UPDATE authz.memberships
   SET revoked_at = updated_at
 WHERE NOT is_active
   AND revoked_at IS NULL;

ALTER TABLE authz.memberships
  ADD CONSTRAINT authz_memberships_live_chk
    CHECK (is_active = (revoked_at IS NULL)),
  ADD CONSTRAINT authz_memberships_tenant_admin_staff_chk
    CHECK (NOT is_tenant_admin OR role = 'staff');

-- 2. The lifecycle rule. Owned by postgres, invoker rights: it only reshapes
-- the row its writer is already allowed to write.
CREATE OR REPLACE FUNCTION authz.memberships_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  -- Stamping revoked_at on a live row revokes it.
  IF NEW.revoked_at IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.revoked_at IS NULL) THEN
    NEW.is_active := false;
  END IF;

  IF NEW.is_active THEN
    -- A grant, or a re-grant of a role held before, clears the revocation.
    NEW.revoked_at := NULL;
  ELSIF NEW.revoked_at IS NULL THEN
    NEW.revoked_at := pg_catalog.now();
  END IF;

  -- A row that is not live holds no administration, so a revocation takes
  -- the flag with it and a re-grant does not bring it back. A writer that
  -- re-grants with the flag sets it in the statement that makes the row live.
  IF NOT NEW.is_active THEN
    NEW.is_tenant_admin := false;
  END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION authz.memberships_lifecycle() OWNER TO postgres;
REVOKE ALL ON FUNCTION authz.memberships_lifecycle() FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS authz_memberships_lifecycle ON authz.memberships;
CREATE TRIGGER authz_memberships_lifecycle
  BEFORE INSERT OR UPDATE ON authz.memberships
  FOR EACH ROW EXECUTE FUNCTION authz.memberships_lifecycle();

-- 3. The active-membership index. It replaces the (user_id, tenant_id) one,
-- which it extends.
CREATE INDEX IF NOT EXISTS authz_memberships_live_idx
  ON authz.memberships (user_id, tenant_id, role, staff_role)
  INCLUDE (is_tenant_admin)
  WHERE is_active;
DROP INDEX IF EXISTS authz.authz_memberships_user_tenant_active_idx;

-- 4. Data.
-- 4a. No staff row keeps the member-care sub-role. Where the person already
-- holds a development row in that tenant, that row carries the access and the
-- member-care row is revoked; otherwise the member-care row becomes the
-- development row.
UPDATE authz.memberships AS d
   SET is_active = true,
       updated_at = pg_catalog.now()
  FROM authz.memberships AS mc
 WHERE mc.role = 'staff'
   AND mc.staff_role = 'member_care'
   AND mc.is_active
   AND d.user_id = mc.user_id
   AND d.tenant_id = mc.tenant_id
   AND d.role = 'staff'
   AND d.staff_role = 'development'
   AND NOT d.is_active;

UPDATE authz.memberships AS mc
   SET is_active = false,
       updated_at = pg_catalog.now()
 WHERE mc.role = 'staff'
   AND mc.staff_role = 'member_care'
   AND mc.is_active
   AND EXISTS (
     SELECT 1
       FROM authz.memberships AS d
      WHERE d.user_id = mc.user_id
        AND d.tenant_id = mc.tenant_id
        AND d.role = 'staff'
        AND d.staff_role = 'development'
   );

UPDATE authz.memberships AS mc
   SET staff_role = 'development',
       updated_at = pg_catalog.now()
 WHERE mc.role = 'staff'
   AND mc.staff_role = 'member_care'
   AND NOT EXISTS (
     SELECT 1
       FROM authz.memberships AS d
      WHERE d.user_id = mc.user_id
        AND d.tenant_id = mc.tenant_id
        AND d.role = 'staff'
        AND d.staff_role = 'development'
   );

-- 4b. A membership for every profile whose role class has none in its tenant.
WITH profile_class AS (
  SELECT
    p.user_id,
    t.id AS tenant_id,
    CASE p.role
      WHEN 'donor' THEN 'donor'
      WHEN 'missionary' THEN 'missionary'
      ELSE 'staff'
    END::authz.membership_role AS role,
    p.role IN ('admin', 'super_admin') AS is_tenant_admin
  FROM public.profiles AS p
  JOIN public.tenants AS t
    ON t.id = COALESCE(
      p.tenant_id,
      CASE WHEN p.role = 'super_admin' THEN '00000000-0000-0000-0000-000000000001'::uuid END
    )
  WHERE p.user_id IS NOT NULL
    AND p.role IN ('donor', 'missionary', 'staff', 'admin', 'super_admin')
)
INSERT INTO authz.memberships (user_id, tenant_id, role, staff_role, is_tenant_admin)
SELECT
  pc.user_id,
  pc.tenant_id,
  pc.role,
  CASE WHEN pc.role = 'staff' THEN 'development'::authz.staff_role END,
  pc.is_tenant_admin
FROM profile_class AS pc
WHERE NOT EXISTS (
  SELECT 1
    FROM authz.memberships AS m
   WHERE m.user_id = pc.user_id
     AND m.tenant_id = pc.tenant_id
     AND m.role = pc.role
)
ON CONFLICT DO NOTHING;

-- 4c. The flag on the live staff rows admin and super_admin profiles hold in
-- their tenant.
UPDATE authz.memberships AS m
   SET is_tenant_admin = true,
       updated_at = pg_catalog.now()
  FROM public.profiles AS p
 WHERE p.user_id = m.user_id
   AND p.role IN ('admin', 'super_admin')
   AND m.tenant_id = COALESCE(
     p.tenant_id,
     CASE WHEN p.role = 'super_admin' THEN '00000000-0000-0000-0000-000000000001'::uuid END
   )
   AND m.role = 'staff'
   AND m.is_active
   AND NOT m.is_tenant_admin;

-- 5. The assignments functions return the flag. Their result types change,
-- so each is dropped and created again with its grants revoked by name
-- (docs/security/function-execute-grants.md).
DROP FUNCTION IF EXISTS public.current_user_assignments();
CREATE FUNCTION public.current_user_assignments()
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
    AND m.is_active = true
  ORDER BY m.tenant_id, m.id;
$$;

COMMENT ON FUNCTION public.current_user_assignments() IS
  'Live authz.memberships rows of the calling user across all tenants, with the '
  'tenant-administrator flag, for the principal resolver (packages/auth/principal). '
  'Invoker rights; the caller sees only its own rows.';

ALTER FUNCTION public.current_user_assignments() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.current_user_assignments() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_assignments() TO authenticated;

DROP FUNCTION IF EXISTS public.current_user_memberships(UUID);
CREATE FUNCTION public.current_user_memberships(target_tenant UUID)
RETURNS TABLE (
  tenant_id UUID,
  role TEXT,
  staff_role TEXT,
  is_active BOOLEAN,
  is_tenant_admin BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    m.tenant_id,
    m.role::TEXT,
    m.staff_role::TEXT,
    m.is_active,
    m.is_tenant_admin
  FROM authz.memberships m
  WHERE m.user_id = auth.uid()
    AND m.tenant_id = target_tenant
    AND m.is_active = true;
$$;

COMMENT ON FUNCTION public.current_user_memberships(UUID) IS
  'Live authz.memberships rows of the calling user in one tenant, with the '
  'tenant-administrator flag. The application resolves through '
  'public.current_user_assignments(); this function is kept for its callers.';

ALTER FUNCTION public.current_user_memberships(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.current_user_memberships(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_memberships(UUID) TO authenticated;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
