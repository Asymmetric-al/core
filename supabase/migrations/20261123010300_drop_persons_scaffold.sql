-- AL-2678 (WP5 part 1; plan section 12 WP5, lines 988 and 1011). The empty
-- persons scaffold of 20261025110000_person_anchor.sql is dropped: the table,
-- missionaries.person_id, profiles.person_id, their four constraints and
-- their ten field-policy rows. parties replaces it. Nothing reads or writes
-- them. The preflight refuses, with counts only, when the table holds a row
-- or either column holds a value; nothing is dropped then.

BEGIN;
SET LOCAL lock_timeout = '5s';

DO $$
-- preflight: persons-empty
DECLARE
  v_persons BIGINT;
  v_missionaries BIGINT;
  v_profiles BIGINT;
BEGIN
  SELECT pg_catalog.count(*) INTO v_persons FROM public.persons;
  SELECT pg_catalog.count(*) INTO v_missionaries FROM public.missionaries WHERE person_id IS NOT NULL;
  SELECT pg_catalog.count(*) INTO v_profiles FROM public.profiles WHERE person_id IS NOT NULL;
  IF v_persons > 0 OR v_missionaries > 0 OR v_profiles > 0 THEN
    RAISE EXCEPTION 'preflight failed: % persons rows, % missionaries and % profiles name a person; nothing was dropped',
      v_persons, v_missionaries, v_profiles
      USING ERRCODE = '55000';
  END IF;
END
$$;

ALTER TABLE public.missionaries
  DROP CONSTRAINT missionaries_person_same_tenant_fk,
  DROP CONSTRAINT missionaries_person_requires_tenant_check,
  DROP COLUMN person_id;

ALTER TABLE public.profiles
  DROP CONSTRAINT profiles_person_same_tenant_fk,
  DROP CONSTRAINT profiles_person_requires_tenant_check,
  DROP COLUMN person_id;

DELETE FROM public.field_policies
 WHERE record_type IN ('missionaries', 'profiles')
   AND field_key = 'person_id';

DROP TABLE public.persons;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
