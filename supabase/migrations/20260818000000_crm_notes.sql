-- Native Mission Control CRM notes. Asym Postgres is the source of truth.
-- Restricted notes stay tenant-owned; staff cannot read them unless they are
-- an admin or super_admin. Notes are append-only from this migration.

CREATE TABLE IF NOT EXISTS public.crm_notes (
  tenant_id uuid NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  visibility text NOT NULL,
  linked_record_id text,
  linked_record_type text,
  linked_record_label text,
  author_profile_id uuid,
  author_name text NOT NULL DEFAULT 'Mission Control',
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT crm_notes_title_not_blank CHECK (char_length(btrim(title)) > 0),
  CONSTRAINT crm_notes_body_not_blank CHECK (char_length(btrim(body)) > 0),
  CONSTRAINT crm_notes_visibility_valid CHECK (visibility IN ('standard', 'restricted')),
  CONSTRAINT crm_notes_linked_type_when_id CHECK (
    linked_record_id IS NULL
    OR char_length(btrim(linked_record_id)) > 0
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS crm_notes_tenant_idempotency_key
  ON public.crm_notes (tenant_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS crm_notes_tenant_updated_at_idx
  ON public.crm_notes (tenant_id, updated_at DESC);

COMMENT ON TABLE public.crm_notes IS
  'Authoritative tenant-owned CRM notes. Twenty CRM is retired and is not a write target.';

ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_notes FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.crm_notes FROM PUBLIC, anon;
GRANT SELECT, INSERT ON TABLE public.crm_notes TO authenticated, service_role;

DROP POLICY IF EXISTS crm_notes_tenant_select ON public.crm_notes;
CREATE POLICY crm_notes_tenant_select
  ON public.crm_notes
  FOR SELECT
  TO authenticated
  USING (
    authz.has_staff_membership(tenant_id, NULL)
    AND (
      visibility <> 'restricted'
      OR EXISTS (
        SELECT 1
        FROM public.profiles AS p
        WHERE p.user_id = (SELECT auth.uid())
          AND p.role IN ('admin', 'super_admin')
      )
    )
  );

DROP POLICY IF EXISTS crm_notes_tenant_insert ON public.crm_notes;
CREATE POLICY crm_notes_tenant_insert
  ON public.crm_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    authz.has_staff_membership(tenant_id, NULL)
    AND (
      visibility <> 'restricted'
      OR EXISTS (
        SELECT 1
        FROM public.profiles AS p
        WHERE p.user_id = (SELECT auth.uid())
          AND p.role IN ('admin', 'super_admin')
      )
    )
  );
