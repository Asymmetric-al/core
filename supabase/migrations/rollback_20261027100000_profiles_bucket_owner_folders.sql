-- Rollback for 20261027100000_profiles_bucket_owner_folders.sql (#2406).
-- Restores the pre-migration `profiles` storage policies (the three
-- originals exactly as 20250101000000_init_schema.sql defines them), sets the
-- bucket's file_size_limit and allowed_mime_types back to the values the
-- forward migration recorded, and drops the record table.
--
-- The restored policies are the pre-migration upload and read rules, so ship
-- this only together with reverting the app commit. If the recorded row is
-- missing it raises and changes nothing; it never falls back to NULL limits.
-- One transaction, so a failure under plain `psql -f` leaves no partial state.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM private.storage_bucket_limits_20261027100000
    WHERE bucket_id = 'profiles'
  ) THEN
    RAISE EXCEPTION 'rollback_20261027100000: no recorded limits for bucket profiles; nothing was changed';
  END IF;
END
$$;

UPDATE storage.buckets AS b
SET file_size_limit = r.file_size_limit,
    allowed_mime_types = r.allowed_mime_types
FROM private.storage_bucket_limits_20261027100000 AS r
WHERE b.id = 'profiles'
  AND r.bucket_id = 'profiles';

DROP POLICY "profiles owner folder insert" ON storage.objects;
DROP POLICY "profiles owner folder update" ON storage.objects;
DROP POLICY "profiles owner select" ON storage.objects;

CREATE POLICY "Public read profiles"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profiles');

CREATE POLICY "Authenticated upload profiles"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "Owner update profiles"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profiles' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'profiles' AND auth.uid() = owner);

DROP TABLE private.storage_bucket_limits_20261027100000;

COMMIT;
