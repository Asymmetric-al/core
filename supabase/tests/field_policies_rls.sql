-- AL-491 acceptance-v1. Disposable local database only; all fixtures roll back.
-- Run as the local database owner after applying candidate migrations.
-- Uses actual authz functions, profiles and memberships; never mocks RLS.
BEGIN;
INSERT INTO public.tenants(id,name,slug) VALUES
  ('f4910000-0000-4000-8000-000000000001','Field policy acceptance A','field-policy-acceptance-a'),
  ('f4910000-0000-4000-8000-000000000002','Field policy acceptance B','field-policy-acceptance-b');
INSERT INTO auth.users(id,email,raw_app_meta_data) VALUES
  ('f4910000-0000-4000-8000-000000000011','member491@example.invalid','{"tenant_id":"f4910000-0000-4000-8000-000000000001"}'),
  ('f4910000-0000-4000-8000-000000000012','admin491@example.invalid','{"tenant_id":"f4910000-0000-4000-8000-000000000001"}'),
  ('f4910000-0000-4000-8000-000000000013','super491@example.invalid','{"tenant_id":"f4910000-0000-4000-8000-000000000001"}'),
  ('f4910000-0000-4000-8000-000000000014','outsider491@example.invalid','{"tenant_id":"f4910000-0000-4000-8000-000000000002"}');
UPDATE public.profiles SET role='admin' WHERE user_id='f4910000-0000-4000-8000-000000000012';
UPDATE public.profiles SET role='super_admin' WHERE user_id='f4910000-0000-4000-8000-000000000013';
DELETE FROM authz.memberships WHERE user_id IN (
  'f4910000-0000-4000-8000-000000000011','f4910000-0000-4000-8000-000000000012',
  'f4910000-0000-4000-8000-000000000013','f4910000-0000-4000-8000-000000000014');
INSERT INTO authz.memberships(user_id,tenant_id,role,staff_role,is_active) VALUES
  ('f4910000-0000-4000-8000-000000000011','f4910000-0000-4000-8000-000000000001','donor',NULL,true),
  ('f4910000-0000-4000-8000-000000000012','f4910000-0000-4000-8000-000000000001','staff','finance',true);

-- Reserved tenant rows are synthetic fixtures, never seed activation.
INSERT INTO public.field_policies(record_type,field_key,surface,tenant_id,visible,editable,exportable,sensitivity_category) VALUES
  ('donors','email','mission_control','f4910000-0000-4000-8000-000000000001',false,false,false,'contact'),
  ('donors','email','mission_control','f4910000-0000-4000-8000-000000000002',false,false,false,'contact');
DO $$ BEGIN
  BEGIN
    INSERT INTO public.field_policies(record_type,field_key,surface,tenant_id,visible,editable,exportable,sensitivity_category)
    VALUES ('donors','email','mission_control','f4910000-0000-4000-8000-000000000001',false,false,false,'contact');
    RAISE EXCEPTION 'C2: duplicate non-NULL policy key accepted';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  RAISE NOTICE 'C2: actual duplicate non-NULL policy insert rejected; two tenants coexist';
END $$;

SET LOCAL ROLE anon;
DO $$ DECLARE n integer; BEGIN
  BEGIN
    SELECT count(*) INTO n FROM public.field_policies;
    IF n<>0 THEN RAISE EXCEPTION 'C3: anonymous actor can read field policies'; END IF;
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  RAISE NOTICE 'C3: anonymous field-policy read denied';
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub','f4910000-0000-4000-8000-000000000011',true);
SELECT set_config('request.jwt.claims','{"sub":"f4910000-0000-4000-8000-000000000011","role":"authenticated","app_metadata":{"tenant_id":"f4910000-0000-4000-8000-000000000001"}}',true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE n integer; BEGIN
  SELECT count(*) INTO n FROM public.field_policies WHERE tenant_id IS NULL;
  IF n=0 THEN RAISE EXCEPTION 'C3: active member cannot read baseline static ceiling'; END IF;
  SELECT count(*) INTO n FROM public.field_policies WHERE tenant_id='f4910000-0000-4000-8000-000000000002';
  IF n<>0 THEN RAISE EXCEPTION 'C3: member can read another tenant policies'; END IF;
  BEGIN
    INSERT INTO public.field_policies(record_type,field_key,surface,tenant_id,visible,editable,exportable,sensitivity_category)
    VALUES ('donors','acceptance491','mission_control',NULL,false,false,false,'internal');
    RAISE EXCEPTION 'C3: ordinary member can insert baseline';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    UPDATE public.field_policies SET visible=NOT visible WHERE tenant_id IS NULL;
    GET DIAGNOSTICS n=ROW_COUNT;
    IF n<>0 THEN RAISE EXCEPTION 'C3: ordinary member can update baseline'; END IF;
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    DELETE FROM public.field_policies WHERE tenant_id IS NULL;
    GET DIAGNOSTICS n=ROW_COUNT;
    IF n<>0 THEN RAISE EXCEPTION 'C3: ordinary member can delete baseline'; END IF;
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  RAISE NOTICE 'C3: member reads baseline, cannot read other tenant or mutate baseline';
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub','f4910000-0000-4000-8000-000000000012',true);
SELECT set_config('request.jwt.claims','{"sub":"f4910000-0000-4000-8000-000000000012","role":"authenticated","app_metadata":{"tenant_id":"f4910000-0000-4000-8000-000000000001"}}',true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE n integer; BEGIN
  BEGIN
    INSERT INTO public.field_policies(record_type,field_key,surface,tenant_id,visible,editable,exportable,sensitivity_category)
    VALUES ('donors','acceptance491','mission_control',NULL,false,false,false,'internal');
    RAISE EXCEPTION 'C3: Mission Control admin can insert baseline without super-admin';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    UPDATE public.field_policies SET visible=NOT visible WHERE tenant_id IS NULL;
    GET DIAGNOSTICS n=ROW_COUNT;
    IF n<>0 THEN RAISE EXCEPTION 'C3: Mission Control admin can update baseline without super-admin'; END IF;
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    DELETE FROM public.field_policies WHERE tenant_id IS NULL;
    GET DIAGNOSTICS n=ROW_COUNT;
    IF n<>0 THEN RAISE EXCEPTION 'C3: Mission Control admin can delete baseline without super-admin'; END IF;
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  RAISE NOTICE 'C3: baseline insert/update/delete denied to non-super Mission Control admin';
END $$;
RESET ROLE;

-- A tenant claim without an active membership cannot unlock the global baseline.
SELECT set_config('request.jwt.claim.sub','f4910000-0000-4000-8000-000000000014',true);
SELECT set_config('request.jwt.claims','{"sub":"f4910000-0000-4000-8000-000000000014","role":"authenticated","app_metadata":{"tenant_id":"f4910000-0000-4000-8000-000000000001"}}',true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE n integer; BEGIN
  SELECT count(*) INTO n FROM public.field_policies;
  IF n<>0 THEN RAISE EXCEPTION 'C3: unaffiliated actor with claimed tenant can read policies'; END IF;
  RAISE NOTICE 'C3: unaffiliated actor denied despite tenant claim';
END $$;
RESET ROLE;

UPDATE authz.memberships SET is_active=false WHERE user_id='f4910000-0000-4000-8000-000000000011';
SELECT set_config('request.jwt.claim.sub','f4910000-0000-4000-8000-000000000011',true);
SELECT set_config('request.jwt.claims','{"sub":"f4910000-0000-4000-8000-000000000011","role":"authenticated","app_metadata":{"tenant_id":"f4910000-0000-4000-8000-000000000001"}}',true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE n integer; BEGIN
  SELECT count(*) INTO n FROM public.field_policies;
  IF n<>0 THEN RAISE EXCEPTION 'C3: inactive membership can read policies'; END IF;
  RAISE NOTICE 'C3: inactive membership denied';
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub','f4910000-0000-4000-8000-000000000013',true);
SELECT set_config('request.jwt.claims','{"sub":"f4910000-0000-4000-8000-000000000013","role":"authenticated","app_metadata":{}}',true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE n integer; BEGIN
  INSERT INTO public.field_policies(record_type,field_key,surface,tenant_id,visible,editable,exportable,sensitivity_category)
  VALUES ('donors','acceptance491','mission_control',NULL,false,false,false,'internal');
  UPDATE public.field_policies SET visible=true WHERE record_type='donors' AND field_key='acceptance491' AND tenant_id IS NULL;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'C3: super-admin cannot update inserted baseline'; END IF;
  DELETE FROM public.field_policies WHERE record_type='donors' AND field_key='acceptance491' AND tenant_id IS NULL;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'C3: super-admin cannot delete inserted baseline'; END IF;
  RAISE NOTICE 'C3: super-admin baseline insert/update/delete succeeds';
END $$;
RESET ROLE;
ROLLBACK;
