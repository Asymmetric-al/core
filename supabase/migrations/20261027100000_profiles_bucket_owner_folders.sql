-- #2406 (folds in #2417): owner-scoped writes, owner-only object reads and
-- size/type limits for the `profiles` storage bucket.
--
-- Rollback: supabase/migrations/rollback_20261027100000_profiles_bucket_owner_folders.sql
-- (it restores the pre-migration INSERT, UPDATE and SELECT policies, so pair
-- it with reverting the app commit). Contract and deploy notes:
-- docs/security/storage-profiles-bucket.md.
--
-- Object keys follow {avatars|covers}/{tenantId}/{userId}/{rest} (the #2308
-- upload route). An authenticated caller may insert only under its own
-- folder: purpose avatars or covers, tenant = the caller's profiles.tenant_id
-- (the demo tenant only for a super_admin whose tenant_id is NULL, mirroring
-- getAuthContext), user = auth.uid(), and a non-empty remainder. Owners may
-- update their own objects, but the updated row must satisfy the same folder
-- rule, so a legacy object can be moved into the folder but not rewritten in
-- place. "Public read profiles" gives way to an owner-only SELECT policy; the
-- bucket stays public, so public object URLs keep working without it.
-- "Owner delete profiles" is unchanged.
--
-- The folder check uses string_to_array(name, '/') rather than
-- storage.foldername(), so it runs on hosted storage and on CI's compat
-- schema alike.
--
-- The bucket's prior file_size_limit and allowed_mime_types are recorded in a
-- private table before they change (first record wins on re-apply) so the
-- rollback can restore them. No API role can reach that table. This
-- migration adds no grants.

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.storage_bucket_limits_20261027100000 (
  bucket_id TEXT PRIMARY KEY,
  file_size_limit BIGINT,
  allowed_mime_types TEXT[],
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

REVOKE ALL ON TABLE private.storage_bucket_limits_20261027100000 FROM PUBLIC, anon, authenticated, service_role;

INSERT INTO private.storage_bucket_limits_20261027100000 (bucket_id, file_size_limit, allowed_mime_types)
SELECT id, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'profiles'
ON CONFLICT (bucket_id) DO NOTHING;

-- 5 MB (the upload route's cap) and the route's four image types.
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'profiles';

DROP POLICY IF EXISTS "Authenticated upload profiles" ON storage.objects;
DROP POLICY IF EXISTS "Owner update profiles" ON storage.objects;
DROP POLICY IF EXISTS "Public read profiles" ON storage.objects;
DROP POLICY IF EXISTS "profiles owner folder insert" ON storage.objects;
DROP POLICY IF EXISTS "profiles owner folder update" ON storage.objects;
DROP POLICY IF EXISTS "profiles owner select" ON storage.objects;

-- '00000000-0000-0000-0000-000000000001' is DEMO_TENANT_ID
-- (packages/auth/constants.ts).
CREATE POLICY "profiles owner folder insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profiles'
    AND (string_to_array(name, '/'))[1] IN ('avatars', 'covers')
    AND (string_to_array(name, '/'))[2] IN (
      SELECT COALESCE(
        p.tenant_id::text,
        CASE WHEN p.role = 'super_admin' THEN '00000000-0000-0000-0000-000000000001' END
      )
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    )
    AND (string_to_array(name, '/'))[3] = (SELECT auth.uid())::text
    AND (string_to_array(name, '/'))[4] <> ''
  );

CREATE POLICY "profiles owner folder update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profiles' AND owner = (SELECT auth.uid()))
  WITH CHECK (
    bucket_id = 'profiles'
    AND owner = (SELECT auth.uid())
    AND (string_to_array(name, '/'))[1] IN ('avatars', 'covers')
    AND (string_to_array(name, '/'))[2] IN (
      SELECT COALESCE(
        p.tenant_id::text,
        CASE WHEN p.role = 'super_admin' THEN '00000000-0000-0000-0000-000000000001' END
      )
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    )
    AND (string_to_array(name, '/'))[3] = (SELECT auth.uid())::text
    AND (string_to_array(name, '/'))[4] <> ''
  );

CREATE POLICY "profiles owner select"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'profiles' AND owner = (SELECT auth.uid()));

COMMIT;
