-- #2407 (PR a): owner-scoped writes, owner-only object reads and size/type
-- limits for the editor image bucket (`document-uploads`).
--
-- Rollback: supabase/migrations/rollback_20261028100000_editor_image_storage.sql
-- (it restores the pre-migration INSERT, UPDATE and SELECT policies, so pair
-- it with reverting the app commit). Contract and deploy notes:
-- docs/security/storage-editor-images.md.
--
-- Object keys follow editor/{tenantId}/{userId}/{rest} (the
-- /api/upload/editor-image route). An authenticated caller may insert only
-- under its own folder: tenant = the caller's profiles.tenant_id (the demo
-- tenant only for a super_admin whose tenant_id is NULL, mirroring
-- getAuthContext), user = auth.uid(), and a non-empty remainder. The tenant
-- expression is #2406's text unchanged. Owners may update their own objects,
-- but the updated row must satisfy the same folder rule, so a legacy object
-- can be moved into the folder but not rewritten in place. The public read
-- policy gives way to an owner-only SELECT policy; the bucket stays public,
-- so public object URLs keep working without it. The owner delete policy is
-- unchanged.
--
-- The bucket's prior file_size_limit and allowed_mime_types are recorded in a
-- private table before they change (first record wins on re-apply) so the
-- rollback can restore them. No API role can reach that table. This
-- migration adds no grants.

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.storage_bucket_limits_20261028100000 (
  bucket_id TEXT PRIMARY KEY,
  file_size_limit BIGINT,
  allowed_mime_types TEXT[],
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

REVOKE ALL ON TABLE private.storage_bucket_limits_20261028100000 FROM PUBLIC, anon, authenticated, service_role;

INSERT INTO private.storage_bucket_limits_20261028100000 (bucket_id, file_size_limit, allowed_mime_types)
SELECT id, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'document-uploads'
ON CONFLICT (bucket_id) DO NOTHING;

-- 5 MB (the upload route's cap) and the route's four image types.
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'document-uploads';

DROP POLICY IF EXISTS "Authenticated upload document-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Owner update document-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read document-uploads" ON storage.objects;
DROP POLICY IF EXISTS "editor images owner folder insert" ON storage.objects;
DROP POLICY IF EXISTS "editor images owner folder update" ON storage.objects;
DROP POLICY IF EXISTS "editor images owner select" ON storage.objects;

-- '00000000-0000-0000-0000-000000000001' is DEMO_TENANT_ID
-- (packages/auth/constants.ts).
CREATE POLICY "editor images owner folder insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'document-uploads'
    AND (string_to_array(name, '/'))[1] = 'editor'
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

CREATE POLICY "editor images owner folder update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'document-uploads' AND owner = (SELECT auth.uid()))
  WITH CHECK (
    bucket_id = 'document-uploads'
    AND owner = (SELECT auth.uid())
    AND (string_to_array(name, '/'))[1] = 'editor'
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

CREATE POLICY "editor images owner select"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'document-uploads' AND owner = (SELECT auth.uid()));

COMMIT;
