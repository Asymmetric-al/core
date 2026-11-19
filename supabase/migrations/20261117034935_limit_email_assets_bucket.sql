-- AL-2674 (WP1, slice 1.1b; audit D06): size and type limits on the
-- `email-assets` bucket, and no anonymous listing of it.
--
-- The three public buckets, and what reads each one publicly:
--   * `profiles` (avatars and covers): public object URLs, which the profile
--     image URL rule pins to /storage/v1/object/public/profiles/...
--     (packages/api/src/profile/image-url.ts) and the donor portal, the
--     missionary workspace and the public site render. Already limited to 5 MB
--     of JPEG, PNG, WebP and GIF, with owner-only API reads
--     (20261027100000_profiles_bucket_owner_folders.sql). Unchanged.
--   * `document-uploads` (rich-text editor images): the upload route answers
--     with the public URL (packages/api/src/upload/editor-image.ts), which feed
--     posts embed and the donor feed and public site render; care images use it
--     until WP4b moves them. Already limited the same way, with owner-only API
--     reads (20261028100000_editor_image_storage.sql). Unchanged.
--   * `email-assets` (Email Studio images): the server uploads with the service
--     key and stores the public URL in the email (packages/api/src/email/assets.ts),
--     and recipients' mail clients fetch it with no credentials, so the bucket
--     stays public. Serving a public bucket's object by URL needs no policy
--     (Supabase Storage, "Public buckets"). The "Public read email-assets"
--     SELECT policy, granted to PUBLIC, served only the API's list and
--     authenticated download, which nothing in the product calls; it let anyone
--     holding the anon key enumerate every tenant's email images. It is dropped.
--     The bucket gets the upload route's own limits: 5 MB (MAX_IMAGE_BYTES) of
--     PNG, JPEG, WebP and GIF (ALLOWED_IMAGE_TYPES).
-- The private `eve-replay-artifacts` bucket is not public and is unchanged.
--
-- Prior limits: none. The census audit read the hosted buckets with no size or
-- type limit and no objects (D06), so nothing is recorded for rollback.
-- Rollback: forward-fix only.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'email-assets') THEN
    RAISE EXCEPTION 'AL-2674: bucket email-assets is missing';
  END IF;
END $$;

UPDATE storage.buckets
SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/gif', 'image/jpeg', 'image/png', 'image/webp'],
  updated_at = NOW()
WHERE id = 'email-assets';

DROP POLICY IF EXISTS "Public read email-assets" ON storage.objects;

DO $$
DECLARE
  problem text;
BEGIN
  SELECT string_agg(policyname, ', ') INTO problem
  FROM pg_policies
  WHERE schemaname = 'storage' AND tablename = 'objects'
    AND (qual LIKE '%email-assets%' OR with_check LIKE '%email-assets%');
  IF problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2674: email-assets policies remain: %', problem;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets
    WHERE id = 'email-assets'
      AND public
      AND file_size_limit = 5242880
      AND allowed_mime_types::text[] @> ARRAY['image/gif', 'image/jpeg', 'image/png', 'image/webp']
      AND cardinality(allowed_mime_types) = 4
  ) THEN
    RAISE EXCEPTION 'AL-2674: email-assets bucket limits did not apply';
  END IF;
END $$;

COMMIT;
