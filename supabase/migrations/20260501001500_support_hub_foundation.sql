BEGIN;

CREATE TABLE IF NOT EXISTS public.support_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    relationship TEXT NOT NULL,
    organization TEXT,
    last_seen_at TIMESTAMPTZ,
    giving_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    public_id TEXT NOT NULL,
    contact_id UUID REFERENCES public.support_contacts(id) ON DELETE SET NULL,
    contact_name_snapshot TEXT,
    contact_email_snapshot TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    assigned_to_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    queue_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'normal',
    channel TEXT NOT NULL DEFAULT 'form',
    subject TEXT NOT NULL,
    summary TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    follow_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT support_tickets_public_id_unique UNIQUE (tenant_id, public_id),
    CONSTRAINT support_tickets_queue_id_check CHECK (
      queue_id IN ('donor_care', 'mobilization', 'missionary_support')
    ),
    CONSTRAINT support_tickets_status_check CHECK (
      status IN ('open', 'waiting', 'resolved', 'escalated')
    ),
    CONSTRAINT support_tickets_priority_check CHECK (
      priority IN ('low', 'normal', 'high', 'urgent')
    ),
    CONSTRAINT support_tickets_channel_check CHECK (
      channel IN ('email', 'chat', 'form', 'phone')
    )
);

CREATE INDEX IF NOT EXISTS idx_support_contacts_tenant_email
    ON public.support_contacts (tenant_id, email);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_queue_status_updated_at
    ON public.support_tickets (tenant_id, queue_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_status_priority
    ON public.support_tickets (tenant_id, status, priority);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_updated_at
    ON public.support_tickets (tenant_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_contact
    ON public.support_tickets (tenant_id, contact_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_assignee_status
    ON public.support_tickets (tenant_id, assigned_to_profile_id, status);

ALTER TABLE public.support_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.support_contacts FROM anon;
REVOKE ALL ON TABLE public.support_tickets FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.support_contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.support_tickets TO authenticated;

GRANT ALL ON TABLE public.support_contacts TO service_role;
GRANT ALL ON TABLE public.support_tickets TO service_role;

DROP POLICY IF EXISTS "support contacts select" ON public.support_contacts;
CREATE POLICY "support contacts select"
  ON public.support_contacts
  FOR SELECT
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "support contacts insert" ON public.support_contacts;
CREATE POLICY "support contacts insert"
  ON public.support_contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "support contacts update" ON public.support_contacts;
CREATE POLICY "support contacts update"
  ON public.support_contacts
  FOR UPDATE
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  )
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "support contacts delete" ON public.support_contacts;
CREATE POLICY "support contacts delete"
  ON public.support_contacts
  FOR DELETE
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "support tickets select" ON public.support_tickets;
CREATE POLICY "support tickets select"
  ON public.support_tickets
  FOR SELECT
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "support tickets insert" ON public.support_tickets;
CREATE POLICY "support tickets insert"
  ON public.support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL))
    AND auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "support tickets update" ON public.support_tickets;
CREATE POLICY "support tickets update"
  ON public.support_tickets
  FOR UPDATE
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  )
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "support tickets delete" ON public.support_tickets;
CREATE POLICY "support tickets delete"
  ON public.support_tickets
  FOR DELETE
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

COMMIT;
