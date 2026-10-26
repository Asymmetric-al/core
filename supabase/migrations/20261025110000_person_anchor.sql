-- #2256 (#506 slice c): the inert person anchor. Contract:
-- docs/security/identity-person-anchor.md.
-- PROTECTED AREA (tenant / identity). Schema only: nothing reads or writes
-- public.persons or person_id in Phase 4 (the party spine is Phase 9, #570).
--
-- 1. public.persons: empty, tenant-scoped, PK (tenant_id, id). ENABLE + FORCE
--    RLS; one SELECT policy for active staff of the row's tenant. No anon or
--    PUBLIC access; authenticated may only SELECT; writes are service_role.
-- 2. Nullable missionaries.person_id and profiles.person_id. Each has a
--    composite FK (tenant_id, person_id) -> persons (tenant_id, id), so a
--    person in another tenant can't be referenced and a linked row can't be
--    re-homed. MATCH SIMPLE skips the FK when tenant_id is NULL, so a CHECK
--    requires a tenant whenever person_id is set. profiles.tenant_id stays a
--    nullable home/UI hint (Q17); it is never an authorization input.
-- 3. Ten reviewed field_policies rows (Q11 / OQ6): category security, denied on
--    every surface (docs/security/field-policies/
--    repository-supplement-v3-person-anchor.json).
--
-- No index on (tenant_id, person_id) (OQ5): nothing queries it until Phase 9.
-- donors gets no person_id; donor_merge_candidates is unchanged (Q8).
--
-- Re-running the file changes nothing. Constraints are added NOT VALID, then
-- validated, so the brief ACCESS EXCLUSIVE lock on missionaries and profiles
-- isn't held for a scan; every existing person_id is NULL, so validation
-- passes. SET LOCAL lock_timeout = '5s' bounds the wait for those locks (and
-- the SHARE ROW EXCLUSIVE lock the FKs take on tenants). On SQLSTATE 55P03
-- nothing is applied: re-run it in a quiet window.
-- Rollback: rollback_20261025110000_person_anchor.sql.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. The person anchor. The primary key is added after the table, and the
-- tenant FK is named to sort before it, so pg_constraint lists the FK first
-- in both heap and name order (the #2256 catalog check reads that order).
CREATE TABLE IF NOT EXISTS public.persons (
  tenant_id UUID NOT NULL CONSTRAINT persons_in_tenant_fk REFERENCES public.tenants(id),
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.persons'::regclass
      AND conname = 'persons_pkey'
  ) THEN
    ALTER TABLE public.persons
      ADD CONSTRAINT persons_pkey PRIMARY KEY (tenant_id, id);
  END IF;
END
$$;

COMMENT ON TABLE public.persons IS
  'Inert person anchor (#2256). Empty in Phase 4: no code reads or writes it. Tenant staff may read their tenant''s rows; writes are server-side only.';

ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persons FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS persons_staff_select ON public.persons;
CREATE POLICY persons_staff_select ON public.persons
  FOR SELECT TO authenticated
  USING (authz.has_staff_membership(tenant_id, NULL));

-- Revoke first: hosted Supabase gives new public tables default grants to anon
-- and authenticated.
REVOKE ALL ON TABLE public.persons FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.persons TO authenticated;
GRANT ALL ON TABLE public.persons TO service_role;

-- 2. The person_id seams.
ALTER TABLE public.missionaries ADD COLUMN IF NOT EXISTS person_id uuid NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS person_id uuid NULL;

COMMENT ON COLUMN public.missionaries.person_id IS
  'Inert seam (#2256): always NULL in Phase 4. Same-tenant FK to persons.';
COMMENT ON COLUMN public.profiles.person_id IS
  'Inert seam (#2256): always NULL in Phase 4. Same-tenant FK to persons through the tenant_id hint, which is never an authorization input.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.missionaries'::regclass
      AND conname = 'missionaries_person_requires_tenant_check'
  ) THEN
    ALTER TABLE public.missionaries
      ADD CONSTRAINT missionaries_person_requires_tenant_check
      CHECK (person_id IS NULL OR tenant_id IS NOT NULL) NOT VALID;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.missionaries'::regclass
      AND conname = 'missionaries_person_same_tenant_fk'
  ) THEN
    ALTER TABLE public.missionaries
      ADD CONSTRAINT missionaries_person_same_tenant_fk
      FOREIGN KEY (tenant_id, person_id) REFERENCES public.persons (tenant_id, id) NOT VALID;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND conname = 'profiles_person_requires_tenant_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_person_requires_tenant_check
      CHECK (person_id IS NULL OR tenant_id IS NOT NULL) NOT VALID;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND conname = 'profiles_person_same_tenant_fk'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_person_same_tenant_fk
      FOREIGN KEY (tenant_id, person_id) REFERENCES public.persons (tenant_id, id) NOT VALID;
  END IF;
END
$$;

ALTER TABLE public.missionaries VALIDATE CONSTRAINT missionaries_person_requires_tenant_check;
ALTER TABLE public.missionaries VALIDATE CONSTRAINT missionaries_person_same_tenant_fk;
ALTER TABLE public.profiles VALIDATE CONSTRAINT profiles_person_requires_tenant_check;
ALTER TABLE public.profiles VALIDATE CONSTRAINT profiles_person_same_tenant_fk;

-- 3. Reviewed supplement v3 (Q11 / OQ6): security, denied on every surface.
INSERT INTO public.field_policies
(record_type,field_key,surface,tenant_id,visible,editable,exportable,sensitivity_category) VALUES
  ('missionaries','person_id','mission_control',NULL,false,false,false,'security'),
  ('missionaries','person_id','donor',NULL,false,false,false,'security'),
  ('missionaries','person_id','missionary',NULL,false,false,false,'security'),
  ('missionaries','person_id','public',NULL,false,false,false,'security'),
  ('missionaries','person_id','export',NULL,false,false,false,'security'),
  ('profiles','person_id','mission_control',NULL,false,false,false,'security'),
  ('profiles','person_id','donor',NULL,false,false,false,'security'),
  ('profiles','person_id','missionary',NULL,false,false,false,'security'),
  ('profiles','person_id','public',NULL,false,false,false,'security'),
  ('profiles','person_id','export',NULL,false,false,false,'security')
ON CONFLICT ON CONSTRAINT field_policies_lookup_key DO NOTHING;

COMMIT;
