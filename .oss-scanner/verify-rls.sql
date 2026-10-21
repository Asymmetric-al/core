\set ON_ERROR_STOP on
-- Run as the owner of the disposable local scanner database, after migrations
-- and seed. This exercises real grants, policies and authz memberships, not
-- Supabase Auth/PostgREST or application authorization. Every fixture rolls back.
-- Policy source: supabase/migrations/20260818000000_crm_notes.sql.
BEGIN;
SET LOCAL statement_timeout = '30s';
SET LOCAL lock_timeout = '5s';

INSERT INTO public.tenants (id, name, slug) VALUES
  ('f2177000-0000-4000-8000-000000000001', 'Scanner tenant A', 'oss-scanner-2177-a'),
  ('f2177000-0000-4000-8000-000000000002', 'Scanner tenant B', 'oss-scanner-2177-b');

-- The actual auth.users trigger creates the two profiles as donors. Privileged
-- fixture setup then assigns ordinary staff; it never supplies a super-admin.
INSERT INTO auth.users (id, email, raw_app_meta_data) VALUES
  ('f2177000-0000-4000-8000-000000000011', 'scanner-a@example.invalid',
   '{"tenant_id":"f2177000-0000-4000-8000-000000000001"}'),
  ('f2177000-0000-4000-8000-000000000012', 'scanner-b@example.invalid',
   '{"tenant_id":"f2177000-0000-4000-8000-000000000002"}');
UPDATE public.profiles SET role = 'staff'
WHERE user_id IN (
  'f2177000-0000-4000-8000-000000000011',
  'f2177000-0000-4000-8000-000000000012'
);
DELETE FROM authz.memberships WHERE user_id IN (
  'f2177000-0000-4000-8000-000000000011',
  'f2177000-0000-4000-8000-000000000012'
);
INSERT INTO authz.memberships (user_id, tenant_id, role, staff_role, is_active) VALUES
  ('f2177000-0000-4000-8000-000000000011', 'f2177000-0000-4000-8000-000000000001', 'staff', 'member_care', true),
  ('f2177000-0000-4000-8000-000000000012', 'f2177000-0000-4000-8000-000000000002', 'staff', 'member_care', true);
INSERT INTO public.crm_notes (tenant_id, id, title, body, visibility) VALUES
  ('f2177000-0000-4000-8000-000000000001', 'f2177000-0000-4000-8000-000000000021', 'A standard', 'Synthetic A note', 'standard'),
  ('f2177000-0000-4000-8000-000000000002', 'f2177000-0000-4000-8000-000000000022', 'B standard', 'Synthetic B note', 'standard'),
  ('f2177000-0000-4000-8000-000000000001', 'f2177000-0000-4000-8000-000000000023', 'A restricted', 'Synthetic restricted note', 'restricted');

DO $$
BEGIN
  IF (SELECT count(*) FROM public.profiles WHERE user_id IN (
    'f2177000-0000-4000-8000-000000000011',
    'f2177000-0000-4000-8000-000000000012'
  ) AND role = 'staff') <> 2 THEN
    RAISE EXCEPTION 'Fixture error: actual auth trigger did not create both staff profiles';
  END IF;
  IF NOT (SELECT relrowsecurity AND relforcerowsecurity FROM pg_class
          WHERE oid = 'public.crm_notes'::regclass) THEN
    RAISE EXCEPTION 'crm_notes must have forced RLS enabled';
  END IF;
END $$;

SET LOCAL request.jwt.claim.sub = 'f2177000-0000-4000-8000-000000000011';
SET LOCAL request.jwt.claim.role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"f2177000-0000-4000-8000-000000000011","role":"authenticated","app_metadata":{"tenant_id":"f2177000-0000-4000-8000-000000000001"}}';
SET LOCAL ROLE authenticated;
DO $$
DECLARE n integer;
BEGIN
  IF current_user <> 'authenticated' OR EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolsuper OR rolbypassrls)
  ) THEN
    RAISE EXCEPTION 'RLS proof must run as authenticated without bypass privileges';
  END IF;
  SELECT count(*) INTO n FROM public.crm_notes
  WHERE id = 'f2177000-0000-4000-8000-000000000021';
  IF n <> 1 THEN RAISE EXCEPTION 'Tenant A staff cannot read own standard note'; END IF;
  SELECT count(*) INTO n FROM public.crm_notes
  WHERE id IN ('f2177000-0000-4000-8000-000000000022', 'f2177000-0000-4000-8000-000000000023');
  IF n <> 0 THEN RAISE EXCEPTION 'Tenant A staff read cross-tenant or restricted note'; END IF;

  INSERT INTO public.crm_notes (tenant_id, id, title, body, visibility) VALUES
    ('f2177000-0000-4000-8000-000000000001', 'f2177000-0000-4000-8000-000000000031', 'Allowed A insert', 'Synthetic write', 'standard');
  SELECT count(*) INTO n FROM public.crm_notes WHERE id = 'f2177000-0000-4000-8000-000000000031';
  IF n <> 1 THEN RAISE EXCEPTION 'Own-tenant inserted note is not readable'; END IF;
  BEGIN
    INSERT INTO public.crm_notes (tenant_id, id, title, body, visibility) VALUES
      ('f2177000-0000-4000-8000-000000000002', 'f2177000-0000-4000-8000-000000000032', 'Forbidden cross-tenant insert', 'Synthetic write', 'standard');
    RAISE EXCEPTION 'Tenant A staff inserted a tenant B note';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO public.crm_notes (tenant_id, id, title, body, visibility) VALUES
      ('f2177000-0000-4000-8000-000000000001', 'f2177000-0000-4000-8000-000000000033', 'Forbidden restricted insert', 'Synthetic write', 'restricted');
    RAISE EXCEPTION 'Ordinary staff inserted a restricted note';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS: authenticated A reads/inserts own standard notes; cross-tenant and restricted reads/inserts denied';
END $$;
RESET ROLE;

-- A changed JWT tenant claim cannot grant membership in the other tenant.
SET LOCAL request.jwt.claims = '{"sub":"f2177000-0000-4000-8000-000000000011","role":"authenticated","app_metadata":{"tenant_id":"f2177000-0000-4000-8000-000000000002"}}';
SET LOCAL ROLE authenticated;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.crm_notes WHERE id = 'f2177000-0000-4000-8000-000000000022') THEN
    RAISE EXCEPTION 'A tenant claim without membership disclosed tenant B note';
  END IF;
  RAISE NOTICE 'PASS: tenant claim without matching membership does not unlock another tenant';
END $$;
RESET ROLE;

SET LOCAL request.jwt.claim.sub = 'f2177000-0000-4000-8000-000000000012';
SET LOCAL request.jwt.claims = '{"sub":"f2177000-0000-4000-8000-000000000012","role":"authenticated","app_metadata":{"tenant_id":"f2177000-0000-4000-8000-000000000002"}}';
SET LOCAL ROLE authenticated;
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM public.crm_notes WHERE id = 'f2177000-0000-4000-8000-000000000022';
  IF n <> 1 THEN RAISE EXCEPTION 'Tenant B staff cannot read own standard note'; END IF;
  IF EXISTS (SELECT 1 FROM public.crm_notes WHERE tenant_id = 'f2177000-0000-4000-8000-000000000001') THEN
    RAISE EXCEPTION 'Tenant B staff read tenant A notes';
  END IF;
  BEGIN
    INSERT INTO public.crm_notes (tenant_id, title, body, visibility) VALUES
      ('f2177000-0000-4000-8000-000000000001', 'Forbidden B to A insert', 'Synthetic write', 'standard');
    RAISE EXCEPTION 'Tenant B staff inserted a tenant A note';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS: authenticated B reads own note; tenant A read/insert denied';
END $$;
RESET ROLE;

SET LOCAL request.jwt.claim.sub = '';
SET LOCAL request.jwt.claim.role = 'anon';
SET LOCAL request.jwt.claims = '{"role":"anon"}';
SET LOCAL ROLE anon;
DO $$
DECLARE n integer;
BEGIN
  IF current_user <> 'anon' THEN RAISE EXCEPTION 'Anonymous proof must run as anon'; END IF;
  BEGIN
    SELECT count(*) INTO n FROM public.crm_notes;
    IF n <> 0 THEN RAISE EXCEPTION 'Anonymous actor read CRM notes'; END IF;
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO public.crm_notes (tenant_id, title, body, visibility) VALUES
      ('f2177000-0000-4000-8000-000000000001', 'Forbidden anonymous insert', 'Synthetic write', 'standard');
    RAISE EXCEPTION 'Anonymous actor inserted a CRM note';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS: anonymous CRM note read/insert denied by grants or RLS';
END $$;
RESET ROLE;
ROLLBACK;
\echo 'PASS: real local PostgreSQL CRM note RLS checks complete; every fixture rolled back'
