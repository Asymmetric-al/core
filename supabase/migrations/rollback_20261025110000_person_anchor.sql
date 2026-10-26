-- Rollback for 20261025110000_person_anchor.sql (#2256). Removes the ten
-- person_id field_policies rows, the four seam constraints, both person_id
-- columns and public.persons (with its policy, index and grants), in that
-- order. No CASCADE: if anything else came to depend on persons, this stops
-- instead of dropping it. Idempotent (IF EXISTS). Run it before #2254's
-- rollback.

BEGIN;

DELETE FROM public.field_policies
WHERE record_type IN ('missionaries', 'profiles')
  AND field_key = 'person_id'
  AND tenant_id IS NULL;

ALTER TABLE public.missionaries DROP CONSTRAINT IF EXISTS missionaries_person_same_tenant_fk;
ALTER TABLE public.missionaries DROP CONSTRAINT IF EXISTS missionaries_person_requires_tenant_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_person_same_tenant_fk;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_person_requires_tenant_check;

ALTER TABLE public.missionaries DROP COLUMN IF EXISTS person_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS person_id;

DROP TABLE IF EXISTS public.persons;

COMMIT;
