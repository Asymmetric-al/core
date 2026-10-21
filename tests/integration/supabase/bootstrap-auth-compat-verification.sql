-- Disposable plain-Postgres compatibility check; never run as a hosted migration.
-- Auth schema USAGE allows the identity helpers without exposing Auth records.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
DO $$
BEGIN
  IF auth.uid() IS DISTINCT FROM '11111111-1111-4111-8111-111111111111'::uuid
    OR auth.role() IS DISTINCT FROM 'authenticated'
    OR auth.jwt()->>'role' IS DISTINCT FROM 'authenticated' THEN
    RAISE EXCEPTION 'Authenticated identity helpers do not preserve the request context';
  END IF;
  BEGIN
    PERFORM 1 FROM auth.users LIMIT 1;
    RAISE EXCEPTION 'Auth records were exposed to authenticated';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
RESET ROLE;
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);
SELECT set_config('request.jwt.claim.role', '', true);
SELECT set_config('request.jwt.claims', '', true);
DO $$
BEGIN
  IF auth.uid() IS NOT NULL OR auth.role() IS DISTINCT FROM 'anon'
    OR auth.jwt() IS DISTINCT FROM '{}'::jsonb THEN
    RAISE EXCEPTION 'Anonymous identity helpers do not fail closed';
  END IF;
  BEGIN
    PERFORM 1 FROM auth.users LIMIT 1;
    RAISE EXCEPTION 'Auth records were exposed to anon';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
RESET ROLE;
SET LOCAL ROLE service_role;
DO $$
BEGIN
  PERFORM auth.uid(), auth.role(), auth.jwt();
END $$;
ROLLBACK;
