-- Membership-based authorization foundation.
-- - Adds authz.memberships as the source of tenant role membership.
-- - Adds low-cost helper functions for gateway + RLS checks.
-- - Enables tenant RLS backup enforcement on platform tables.

BEGIN;

CREATE SCHEMA IF NOT EXISTS authz;

GRANT USAGE ON SCHEMA authz TO authenticated, service_role;
GRANT CREATE ON SCHEMA authz TO postgres, service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'authz'
      AND t.typname = 'membership_role'
  ) THEN
    CREATE TYPE authz.membership_role AS ENUM ('donor', 'missionary', 'staff');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'authz'
      AND t.typname = 'staff_role'
  ) THEN
    CREATE TYPE authz.staff_role AS ENUM (
      'finance',
      'mobilizer',
      'development',
      'hr',
      'member_care'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS authz.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role authz.membership_role NOT NULL,
  staff_role authz.staff_role,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT authz_memberships_staff_role_chk CHECK (
    (role = 'staff' AND staff_role IS NOT NULL)
    OR
    (role <> 'staff' AND staff_role IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS authz_memberships_user_tenant_role_uq
  ON authz.memberships (user_id, tenant_id, role, COALESCE(staff_role::text, ''));

CREATE INDEX IF NOT EXISTS authz_memberships_user_tenant_active_idx
  ON authz.memberships (user_id, tenant_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS authz_memberships_tenant_role_active_idx
  ON authz.memberships (tenant_id, role)
  WHERE is_active = true;

ALTER TABLE authz.memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authz memberships select own" ON authz.memberships;
CREATE POLICY "authz memberships select own"
  ON authz.memberships
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "authz memberships service role" ON authz.memberships;
CREATE POLICY "authz memberships service role"
  ON authz.memberships
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT SELECT ON authz.memberships TO authenticated;
GRANT ALL ON authz.memberships TO service_role;

INSERT INTO authz.memberships (
  user_id,
  tenant_id,
  role,
  staff_role,
  is_active
)
SELECT
  p.user_id,
  p.tenant_id,
  CASE
    WHEN p.role = 'missionary' THEN 'missionary'::authz.membership_role
    WHEN p.role = 'donor' THEN 'donor'::authz.membership_role
    WHEN p.role IN ('staff', 'admin', 'super_admin') THEN 'staff'::authz.membership_role
    ELSE 'donor'::authz.membership_role
  END,
  CASE
    WHEN p.role IN ('staff', 'admin', 'super_admin') THEN 'member_care'::authz.staff_role
    ELSE NULL
  END,
  true
FROM public.profiles p
WHERE p.user_id IS NOT NULL
  AND p.tenant_id IS NOT NULL
ON CONFLICT (user_id, tenant_id, role, COALESCE(staff_role::text, ''))
DO UPDATE
SET
  is_active = true,
  updated_at = NOW();

CREATE OR REPLACE FUNCTION authz.current_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION authz.current_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN (auth.jwt() -> 'app_metadata' ->> 'tenant_id')
      ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    THEN (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION authz.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION authz.has_membership(
  target_tenant UUID,
  required_roles authz.membership_role[] DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = authz
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM authz.memberships m
    WHERE m.user_id = auth.uid()
      AND m.tenant_id = target_tenant
      AND m.is_active = true
      AND (
        required_roles IS NULL
        OR m.role = ANY(required_roles)
      )
  );
$$;

CREATE OR REPLACE FUNCTION authz.has_staff_membership(
  target_tenant UUID,
  required_staff_roles authz.staff_role[] DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = authz
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM authz.memberships m
    WHERE m.user_id = auth.uid()
      AND m.tenant_id = target_tenant
      AND m.role = 'staff'
      AND m.is_active = true
      AND (
        required_staff_roles IS NULL
        OR m.staff_role = ANY(required_staff_roles)
      )
  );
$$;

GRANT EXECUTE ON FUNCTION authz.current_user_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.current_tenant_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.is_super_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.has_membership(UUID, authz.membership_role[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.has_staff_membership(UUID, authz.staff_role[]) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  requested_role TEXT := lower(COALESCE(new.raw_user_meta_data ->> 'role', 'donor'));
  role_from_metadata TEXT := CASE
    WHEN requested_role = 'missionary' THEN 'missionary'
    ELSE 'donor'
  END;
  tenant_from_metadata UUID := CASE
    WHEN (new.raw_app_meta_data ->> 'tenant_id')
      ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    THEN (new.raw_app_meta_data ->> 'tenant_id')::uuid
    ELSE '00000000-0000-0000-0000-000000000001'::uuid
  END;
  membership_role authz.membership_role;
  membership_staff_role authz.staff_role;
BEGIN
  INSERT INTO public.profiles (
    id,
    user_id,
    email,
    first_name,
    last_name,
    full_name,
    avatar_url,
    role,
    tenant_id
  )
  VALUES (
    new.id,
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    COALESCE(
      new.raw_user_meta_data ->> 'full_name',
      TRIM(
        CONCAT(
          new.raw_user_meta_data ->> 'first_name',
          ' ',
          new.raw_user_meta_data ->> 'last_name'
        )
      )
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    role_from_metadata,
    tenant_from_metadata
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    role = EXCLUDED.role,
    tenant_id = EXCLUDED.tenant_id,
    updated_at = NOW();

  IF role_from_metadata = 'missionary' THEN
    membership_role := 'missionary';
    membership_staff_role := NULL;
  ELSE
    membership_role := 'donor';
    membership_staff_role := NULL;
  END IF;

  INSERT INTO authz.memberships (
    user_id,
    tenant_id,
    role,
    staff_role,
    is_active
  )
  VALUES (
    new.id,
    tenant_from_metadata,
    membership_role,
    membership_staff_role,
    true
  )
  ON CONFLICT (user_id, tenant_id, role, COALESCE(staff_role::text, ''))
  DO UPDATE
  SET
    is_active = true,
    updated_at = NOW();

  RETURN new;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tenant RLS backup boundaries for platform tables.
-- Primary enforcement remains in BFF route/handler logic.
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notification_queue TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pdf_templates TO authenticated;
GRANT SELECT, INSERT ON TABLE public.audit_logs TO authenticated;

DROP POLICY IF EXISTS "authz staff tenant select notification_queue" ON public.notification_queue;
CREATE POLICY "authz staff tenant select notification_queue"
  ON public.notification_queue
  FOR SELECT
  TO authenticated
  USING (
    (
      tenant_id IS NOT NULL
      AND authz.has_membership(tenant_id, ARRAY['staff']::authz.membership_role[])
    )
    OR authz.is_super_admin()
  );

DROP POLICY IF EXISTS "authz staff tenant insert notification_queue" ON public.notification_queue;
CREATE POLICY "authz staff tenant insert notification_queue"
  ON public.notification_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      tenant_id IS NOT NULL
      AND authz.has_membership(tenant_id, ARRAY['staff']::authz.membership_role[])
    )
    OR authz.is_super_admin()
  );

DROP POLICY IF EXISTS "authz staff tenant update notification_queue" ON public.notification_queue;
CREATE POLICY "authz staff tenant update notification_queue"
  ON public.notification_queue
  FOR UPDATE
  TO authenticated
  USING (
    (
      tenant_id IS NOT NULL
      AND authz.has_membership(tenant_id, ARRAY['staff']::authz.membership_role[])
    )
    OR authz.is_super_admin()
  )
  WITH CHECK (
    (
      tenant_id IS NOT NULL
      AND authz.has_membership(tenant_id, ARRAY['staff']::authz.membership_role[])
    )
    OR authz.is_super_admin()
  );

DROP POLICY IF EXISTS "authz staff tenant delete notification_queue" ON public.notification_queue;
CREATE POLICY "authz staff tenant delete notification_queue"
  ON public.notification_queue
  FOR DELETE
  TO authenticated
  USING (
    (
      tenant_id IS NOT NULL
      AND authz.has_membership(tenant_id, ARRAY['staff']::authz.membership_role[])
    )
    OR authz.is_super_admin()
  );

DROP POLICY IF EXISTS "authz staff tenant select pdf_templates" ON public.pdf_templates;
CREATE POLICY "authz staff tenant select pdf_templates"
  ON public.pdf_templates
  FOR SELECT
  TO authenticated
  USING (
    (
      tenant_id IS NOT NULL
      AND authz.has_membership(tenant_id, ARRAY['staff']::authz.membership_role[])
    )
    OR authz.is_super_admin()
  );

DROP POLICY IF EXISTS "authz staff tenant insert pdf_templates" ON public.pdf_templates;
CREATE POLICY "authz staff tenant insert pdf_templates"
  ON public.pdf_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      tenant_id IS NOT NULL
      AND authz.has_membership(tenant_id, ARRAY['staff']::authz.membership_role[])
    )
    OR authz.is_super_admin()
  );

DROP POLICY IF EXISTS "authz staff tenant update pdf_templates" ON public.pdf_templates;
CREATE POLICY "authz staff tenant update pdf_templates"
  ON public.pdf_templates
  FOR UPDATE
  TO authenticated
  USING (
    (
      tenant_id IS NOT NULL
      AND authz.has_membership(tenant_id, ARRAY['staff']::authz.membership_role[])
    )
    OR authz.is_super_admin()
  )
  WITH CHECK (
    (
      tenant_id IS NOT NULL
      AND authz.has_membership(tenant_id, ARRAY['staff']::authz.membership_role[])
    )
    OR authz.is_super_admin()
  );

DROP POLICY IF EXISTS "authz staff tenant delete pdf_templates" ON public.pdf_templates;
CREATE POLICY "authz staff tenant delete pdf_templates"
  ON public.pdf_templates
  FOR DELETE
  TO authenticated
  USING (
    (
      tenant_id IS NOT NULL
      AND authz.has_membership(tenant_id, ARRAY['staff']::authz.membership_role[])
    )
    OR authz.is_super_admin()
  );

DROP POLICY IF EXISTS "authz staff tenant select audit_logs" ON public.audit_logs;
CREATE POLICY "authz staff tenant select audit_logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    (
      tenant_id IS NOT NULL
      AND authz.has_membership(tenant_id, ARRAY['staff']::authz.membership_role[])
    )
    OR authz.is_super_admin()
  );

DROP POLICY IF EXISTS "authz staff tenant insert audit_logs" ON public.audit_logs;
CREATE POLICY "authz staff tenant insert audit_logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      tenant_id IS NOT NULL
      AND authz.has_membership(tenant_id, ARRAY['staff']::authz.membership_role[])
    )
    OR authz.is_super_admin()
  );

DROP POLICY IF EXISTS "authz staff tenant update audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "authz staff tenant delete audit_logs" ON public.audit_logs;

COMMIT;
