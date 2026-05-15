BEGIN;

DROP POLICY IF EXISTS "profiles select own authenticated" ON public.profiles;

CREATE POLICY "profiles select own authenticated"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR id = (SELECT auth.uid())
  );

COMMIT;
