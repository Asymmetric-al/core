-- AL-2677 (WP4b part 1b; ruling under D-16 on Member Care access in the
-- demonstration data): from WP4b part 1, Member Care opens only for an active
-- staff row with the member_care sub-role, and administrators without one are
-- refused. The hosted demonstration database has one staff person in the
-- demonstration organization, the seed's owner, as administrator on a
-- development row, and nobody with member_care. The product cannot repair that
-- from inside: change_membership_role refuses an administrator's own row. So
-- this migration gives that one person a second staff row, member_care, not an
-- administrator, next to the development row they keep. At sign-in they choose
-- which of the two to act under.
--
-- The guard. It acts only for the demonstration organization
-- 00000000-0000-0000-0000-000000000001 and the seed's owner
-- 11111111-1111-1111-1111-111111111111 (both public in supabase/seed.sql), and
-- only when that person holds a live, administrator staff:development row
-- there: the demonstration rows identified by their own identity, as WP8a
-- part 1 identified the demonstration issuers (20261123030100). Where the
-- organization is absent or not active, or the person's login or that row is
-- absent, it raises a NOTICE and changes nothing, never an exception. Fresh and
-- CI databases run every migration before the seed: there the organization row
-- exists already (20250101000000 creates it) but the owner's login does not,
-- so the login check makes the migration a no-op. A local database gets its
-- care person from the seed instead, which rewrites every membership after the
-- migrations.
--
-- Idempotent: on conflict with authz_memberships_user_tenant_role_uq
-- (user_id, tenant_id, role, staff_role) it does nothing, so a second run adds
-- nothing and a member_care row that exists stays as it is; a revoked one stays
-- revoked. It creates no login, and it reads and writes no other person and no
-- other organization.
--
-- The record. granted_by stays NULL: the column holds the person who granted
-- the row and is NULL for rows the system created (20261117160000, whose data
-- step wrote memberships the same way). One audit_logs row in the
-- demonstration organization, with no acting user, names this migration as the
-- grantor and carries the new row, the shape the membership commands of
-- 20261119135500 use for a grant; it is written only when the row is.
--
-- Down (run by hand, in one transaction). Delete only the row this migration
-- created, which its audit entry names:
--   DELETE FROM authz.memberships AS m USING public.audit_logs AS a
--    WHERE a.action = 'membership_granted' AND a.resource_type = 'membership'
--      AND a.details ->> 'granted_by_migration' =
--          '20261124020000_demo_member_care_assignment'
--      AND m.id::TEXT = a.resource_id;
-- Where this migration changed nothing there is no such entry, so a row that
-- existed before it, live or revoked, is left alone. The audit row stays as
-- the record.

BEGIN;

SET LOCAL lock_timeout = '5s';

DO $$
DECLARE
  v_tenant CONSTANT UUID := '00000000-0000-0000-0000-000000000001';
  v_owner CONSTANT UUID := '11111111-1111-1111-1111-111111111111';
  v_migration CONSTANT TEXT := '20261124020000_demo_member_care_assignment';
  v_id UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM public.tenants AS t
     WHERE t.id = v_tenant
       AND t.status = 'active'
  ) THEN
    RAISE NOTICE 'Demonstration Member Care grant: the demonstration organization is absent or not active; nothing changed.';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM auth.users AS login
     WHERE login.id = v_owner
       AND (pg_catalog.to_jsonb(login) ->> 'deleted_at') IS NULL
  ) THEN
    RAISE NOTICE 'Demonstration Member Care grant: the demonstration owner has no login here; nothing changed.';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM authz.memberships AS m
     WHERE m.user_id = v_owner
       AND m.tenant_id = v_tenant
       AND m.role = 'staff'
       AND m.staff_role = 'development'
       AND m.is_active
       AND m.revoked_at IS NULL
       AND m.is_tenant_admin
  ) THEN
    RAISE NOTICE 'Demonstration Member Care grant: the demonstration owner holds no live administrator development row in the demonstration organization; nothing changed.';
    RETURN;
  END IF;

  INSERT INTO authz.memberships (user_id, tenant_id, role, staff_role, is_active, is_tenant_admin, granted_by)
  VALUES (v_owner, v_tenant, 'staff', 'member_care', true, false, NULL)
  ON CONFLICT (user_id, tenant_id, role, staff_role) DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE NOTICE 'Demonstration Member Care grant: the demonstration owner already holds a member_care row there, live or revoked; nothing changed.';
    RETURN;
  END IF;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_tenant,
    NULL,
    'membership_granted',
    'membership',
    v_id::TEXT,
    pg_catalog.jsonb_build_object(
      'reason', 'Demonstration access to Member Care (AL-2677, WP4b part 1b, ruling under D-16)',
      'granted_by_migration', v_migration,
      'target_user_id', v_owner,
      'to', pg_catalog.jsonb_build_object(
        'membership_id', v_id,
        'role', 'staff',
        'staff_role', 'member_care',
        'is_tenant_admin', false
      )
    )
  );

  RAISE NOTICE 'Demonstration Member Care grant: granted the demonstration owner a member_care staff row, not an administrator.';
END $$;

COMMIT;
