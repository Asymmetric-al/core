-- Storage bucket for Email Studio image uploads.
-- Uploads are performed server-side through the admin API. The bucket is public
-- so exported emails can reference hosted image URLs directly.

INSERT INTO storage.buckets (id, name, public)
VALUES ('email-assets', 'email-assets', true)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  updated_at = NOW();

DROP POLICY IF EXISTS "Public read email-assets" ON storage.objects;
CREATE POLICY "Public read email-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'email-assets');
