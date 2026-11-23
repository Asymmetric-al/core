-- AL-2679 (WP6 part 1; plan 4, 5.4, 6.6, 7.1, 12 WP6; rulings W6-R1, W6-R2,
-- W6-R4): Core media custody table (`public.media_assets`), field-policy
-- classification (18 columns x 5 surfaces = 90 rows), private Storage bucket
-- `cms-media`, `tenant_guard` upload-start and delete human commands, and the
-- silent staff media-access lookup for `/api/media/[assetId]`.
--
-- Purge delay: `35 days` (`INTERVAL '35 days'`), strictly longer than
-- Supabase's 7-day daily backup window and maximum 30-day point-in-time
-- recovery window, so restored databases never reference purged media keys.
--
-- Down (run by hand, in one transaction):
--   DROP FUNCTION public.resolve_staff_media_access(UUID);
--   DROP FUNCTION public.delete_media_asset(UUID, UUID);
--   DROP FUNCTION tenant_guard.delete_media_asset(UUID, UUID);
--   DROP FUNCTION public.start_media_upload(UUID, BIGINT, TEXT);
--   DROP FUNCTION tenant_guard.start_media_upload(UUID, BIGINT, TEXT);
--   DELETE FROM public.field_policies WHERE record_type = 'media_assets' AND tenant_id IS NULL;
--   DROP TABLE public.media_assets;
--   DELETE FROM storage.buckets WHERE id = 'cms-media';

BEGIN;

SET LOCAL lock_timeout = '5s';

CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE RESTRICT,
  status TEXT NOT NULL
    CONSTRAINT media_assets_status_check
      CHECK (status IN ('uploading', 'ready', 'failed', 'deleted')),
  declared_byte_size BIGINT NOT NULL
    CONSTRAINT media_assets_declared_byte_size_check
      CHECK (declared_byte_size > 0 AND declared_byte_size <= 15728640),
  declared_mime_type TEXT NOT NULL
    CONSTRAINT media_assets_declared_mime_type_check
      CHECK (declared_mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  mime_type TEXT
    CONSTRAINT media_assets_mime_type_check
      CHECK (mime_type IS NULL OR mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  content_hash TEXT
    CONSTRAINT media_assets_content_hash_check
      CHECK (content_hash IS NULL OR content_hash ~ '^[0-9a-f]{64}$'),
  master_key TEXT,
  variants JSONB NOT NULL DEFAULT '{}'::jsonb
    CONSTRAINT media_assets_variants_object_check
      CHECK (pg_catalog.jsonb_typeof(variants) = 'object'),
  byte_size BIGINT
    CONSTRAINT media_assets_byte_size_check
      CHECK (byte_size IS NULL OR (byte_size > 0 AND byte_size <= 15728640)),
  width INTEGER
    CONSTRAINT media_assets_width_check
      CHECK (width IS NULL OR width > 0),
  height INTEGER
    CONSTRAINT media_assets_height_check
      CHECK (height IS NULL OR height > 0),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  deleted_at TIMESTAMPTZ,
  purge_after TIMESTAMPTZ,
  purged_at TIMESTAMPTZ,
  CONSTRAINT media_assets_tenant_id_id_key UNIQUE (tenant_id, id),
  CONSTRAINT media_assets_ready_fields_check CHECK (
    status <> 'ready'
    OR (
      mime_type IS NOT NULL
      AND content_hash IS NOT NULL
      AND master_key IS NOT NULL
      AND byte_size IS NOT NULL
      AND width IS NOT NULL
      AND height IS NOT NULL
    )
  ),
  CONSTRAINT media_assets_deleted_fields_check CHECK (
    status <> 'deleted'
    OR (
      deleted_at IS NOT NULL
      AND purge_after IS NOT NULL
      AND purge_after > deleted_at
    )
  )
);

COMMENT ON TABLE public.media_assets IS
  'Core media custody records (AL-2679, WP6 part 1). Signed-in staff hold SELECT only; upload start and delete run via tenant_guard commands; finished-upload metadata and delayed purge are written exclusively by packages/api/src/storage/media-store.ts.';

CREATE INDEX media_assets_tenant_status_created_idx
  ON public.media_assets (tenant_id, status, created_at DESC);

CREATE INDEX media_assets_tenant_content_hash_idx
  ON public.media_assets (tenant_id, content_hash)
  WHERE content_hash IS NOT NULL;

CREATE INDEX media_assets_pending_purge_idx
  ON public.media_assets (purge_after)
  WHERE deleted_at IS NOT NULL AND purged_at IS NULL;

ALTER TABLE public.media_assets OWNER TO postgres;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.media_assets FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.media_assets TO authenticated;
GRANT SELECT ON TABLE public.media_assets TO tenant_guard;
GRANT INSERT (
  id,
  tenant_id,
  status,
  declared_byte_size,
  declared_mime_type,
  created_by,
  created_at,
  updated_at
) ON TABLE public.media_assets TO tenant_guard;
GRANT UPDATE (
  status,
  deleted_at,
  purge_after,
  updated_at
) ON TABLE public.media_assets TO tenant_guard;
GRANT SELECT, UPDATE ON TABLE public.media_assets TO service_role;

CREATE POLICY media_assets_staff_select
  ON public.media_assets
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = (SELECT authz.current_tenant_id())
    AND (SELECT authz.assignment_is('staff'::authz.membership_role))
  );

CREATE POLICY tenant_guard_isolation
  ON public.media_assets
  FOR ALL
  TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id())
  WITH CHECK (tenant_id = tenant_guard.current_tenant_id());

INSERT INTO public.field_policies (
  record_type,
  field_key,
  surface,
  visible,
  editable,
  exportable,
  sensitivity_category
)
SELECT
  fields.record_type,
  fields.field_key,
  surface,
  surface = 'mission_control',
  false,
  false,
  fields.category::public.field_sensitivity_category
FROM (
  VALUES
    ('media_assets', 'id', 'internal'),
    ('media_assets', 'tenant_id', 'internal'),
    ('media_assets', 'status', 'care'),
    ('media_assets', 'declared_byte_size', 'internal'),
    ('media_assets', 'declared_mime_type', 'internal'),
    ('media_assets', 'mime_type', 'internal'),
    ('media_assets', 'content_hash', 'internal'),
    ('media_assets', 'master_key', 'internal'),
    ('media_assets', 'variants', 'internal'),
    ('media_assets', 'byte_size', 'internal'),
    ('media_assets', 'width', 'internal'),
    ('media_assets', 'height', 'internal'),
    ('media_assets', 'created_by', 'internal'),
    ('media_assets', 'created_at', 'internal'),
    ('media_assets', 'updated_at', 'internal'),
    ('media_assets', 'deleted_at', 'internal'),
    ('media_assets', 'purge_after', 'internal'),
    ('media_assets', 'purged_at', 'internal')
) AS fields (record_type, field_key, category)
CROSS JOIN pg_catalog.unnest(
  ARRAY['mission_control', 'donor', 'missionary', 'public', 'export']
) AS surface;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cms-media',
  'cms-media',
  false,
  15728640,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  updated_at = pg_catalog.now();

CREATE OR REPLACE FUNCTION tenant_guard.start_media_upload(
  p_tenant_id UUID,
  p_byte_size BIGINT,
  p_mime_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_asset_id UUID;
  v_staging_key TEXT;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'web_studio.edit');

  IF p_byte_size IS NULL OR p_byte_size <= 0 OR p_byte_size > 15728640 THEN
    RAISE EXCEPTION 'media_upload: declared byte size must be between 1 and 15728640 bytes'
      USING ERRCODE = '22023';
  END IF;

  IF p_mime_type IS NULL OR p_mime_type NOT IN ('image/jpeg', 'image/png', 'image/webp') THEN
    RAISE EXCEPTION 'media_upload: mime type must be image/jpeg, image/png, or image/webp'
      USING ERRCODE = '22023';
  END IF;

  v_asset_id := pg_catalog.gen_random_uuid();
  v_staging_key := 'tmp/' || v_ctx.tenant_id::TEXT || '/' || v_asset_id::TEXT;

  INSERT INTO public.media_assets (
    id,
    tenant_id,
    status,
    declared_byte_size,
    declared_mime_type,
    created_by
  )
  VALUES (
    v_asset_id,
    v_ctx.tenant_id,
    'uploading',
    p_byte_size,
    p_mime_type,
    v_ctx.actor_id
  );

  RETURN pg_catalog.jsonb_build_object(
    'asset_id', v_asset_id,
    'tenant_id', v_ctx.tenant_id,
    'status', 'uploading',
    'staging_key', v_staging_key,
    'declared_byte_size', p_byte_size,
    'declared_mime_type', p_mime_type
  );
END;
$$;

COMMENT ON FUNCTION tenant_guard.start_media_upload(UUID, BIGINT, TEXT) IS
  'Human command (AL-2679, WP6 part 1): admits web_studio.edit in an active tenant, validates declared size and MIME type, and records a pending uploading custody row.';

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.start_media_upload(UUID, BIGINT, TEXT) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;
REVOKE ALL ON FUNCTION tenant_guard.start_media_upload(UUID, BIGINT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.start_media_upload(UUID, BIGINT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.start_media_upload(
  p_tenant_id UUID,
  p_byte_size BIGINT,
  p_mime_type TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.start_media_upload(p_tenant_id, p_byte_size, p_mime_type);
$$;

COMMENT ON FUNCTION public.start_media_upload(UUID, BIGINT, TEXT) IS
  'Wrapper of tenant_guard.start_media_upload for the Data API (AL-2679, WP6 part 1). EXECUTE for authenticated only.';

ALTER FUNCTION public.start_media_upload(UUID, BIGINT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.start_media_upload(UUID, BIGINT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.start_media_upload(UUID, BIGINT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION tenant_guard.delete_media_asset(
  p_tenant_id UUID,
  p_asset_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_now TIMESTAMPTZ;
  v_purge_after TIMESTAMPTZ;
  v_existing_id UUID;
  v_existing_status TEXT;
  v_existing_deleted_at TIMESTAMPTZ;
  v_existing_purge_after TIMESTAMPTZ;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'web_studio.edit');

  IF p_asset_id IS NULL THEN
    RAISE EXCEPTION 'media_delete: asset id is required'
      USING ERRCODE = '22004';
  END IF;

  SELECT a.id, a.status, a.deleted_at, a.purge_after
    INTO v_existing_id, v_existing_status, v_existing_deleted_at, v_existing_purge_after
    FROM public.media_assets AS a
   WHERE a.id = p_asset_id
     AND a.tenant_id = v_ctx.tenant_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'media_delete: media asset not found'
      USING ERRCODE = 'P0002';
  END IF;

  -- WP7 hook: refuse deletion here when a live published reference names (v_ctx.tenant_id, p_asset_id).

  IF v_existing_status = 'deleted' THEN
    RETURN pg_catalog.jsonb_build_object(
      'asset_id', v_existing_id,
      'tenant_id', v_ctx.tenant_id,
      'status', 'deleted',
      'deleted_at', v_existing_deleted_at,
      'purge_after', v_existing_purge_after,
      'already_deleted', true,
      'staging_queued', false
    );
  END IF;

  v_now := pg_catalog.now();
  v_purge_after := v_now + INTERVAL '35 days';

  UPDATE public.media_assets AS a
     SET status = 'deleted',
         deleted_at = v_now,
         purge_after = v_purge_after,
         updated_at = v_now
   WHERE a.id = p_asset_id
     AND a.tenant_id = v_ctx.tenant_id;

  RETURN pg_catalog.jsonb_build_object(
    'asset_id', p_asset_id,
    'tenant_id', v_ctx.tenant_id,
    'status', 'deleted',
    'deleted_at', v_now,
    'purge_after', v_purge_after,
    'already_deleted', false,
    'staging_queued', v_existing_status = 'uploading'
  );
END;
$$;

COMMENT ON FUNCTION tenant_guard.delete_media_asset(UUID, UUID) IS
  'Human command (AL-2679, WP6 part 1): admits web_studio.edit in an active tenant and tombstones a tenant media asset with a 35-day delayed purge window.';

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.delete_media_asset(UUID, UUID) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;
REVOKE ALL ON FUNCTION tenant_guard.delete_media_asset(UUID, UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.delete_media_asset(UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_media_asset(
  p_tenant_id UUID,
  p_asset_id UUID
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.delete_media_asset(p_tenant_id, p_asset_id);
$$;

COMMENT ON FUNCTION public.delete_media_asset(UUID, UUID) IS
  'Wrapper of tenant_guard.delete_media_asset for the Data API (AL-2679, WP6 part 1). EXECUTE for authenticated only.';

ALTER FUNCTION public.delete_media_asset(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.delete_media_asset(UUID, UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.delete_media_asset(UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.resolve_staff_media_access(p_asset_id UUID)
RETURNS TABLE (
  tenant_id UUID,
  assignment_id UUID
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT a.tenant_id, m.id AS assignment_id
    FROM public.media_assets AS a
    JOIN public.tenants AS t
      ON t.id = a.tenant_id
     AND t.status = 'active'
    JOIN authz.memberships AS m
      ON m.tenant_id = a.tenant_id
     AND m.user_id = auth.uid()
     AND m.role = 'staff'::authz.membership_role
     AND m.is_active
     AND m.revoked_at IS NULL
   WHERE p_asset_id IS NOT NULL
     AND a.id = p_asset_id
     AND a.status = 'ready'
     AND 'web_studio.edit' = ANY (authz.assignment_capabilities(m.id))
   ORDER BY m.id
   LIMIT 1;
$$;

COMMENT ON FUNCTION public.resolve_staff_media_access(UUID) IS
  'Silent staff admission lookup for /api/media/[assetId] (AL-2679, WP6 part 1, ruling W6-R4). Returns (tenant_id, assignment_id) for a ready asset in an active tenant when the signed-in caller holds a live staff assignment with web_studio.edit; returns zero rows otherwise. EXECUTE for authenticated only.';

ALTER FUNCTION public.resolve_staff_media_access(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.resolve_staff_media_access(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.resolve_staff_media_access(UUID) TO authenticated;

DO $$
DECLARE
  v_problem TEXT;
BEGIN
  SELECT pg_catalog.string_agg(policyname, ', ')
    INTO v_problem
    FROM pg_catalog.pg_policies
   WHERE schemaname = 'storage'
     AND tablename = 'objects'
     AND (qual LIKE '%cms-media%' OR with_check LIKE '%cms-media%');

  IF v_problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2679: cms-media bucket must have zero storage.objects policies, found: %', v_problem;
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM storage.buckets
     WHERE id = 'cms-media'
       AND NOT public
       AND file_size_limit = 15728640
       AND allowed_mime_types::TEXT[] @> ARRAY['image/jpeg', 'image/png', 'image/webp']
       AND pg_catalog.cardinality(allowed_mime_types) = 3
  ) THEN
    RAISE EXCEPTION 'AL-2679: cms-media bucket limits did not apply';
  END IF;

  IF NOT pg_catalog.has_table_privilege('authenticated', 'public.media_assets', 'SELECT')
     OR pg_catalog.has_table_privilege('authenticated', 'public.media_assets', 'INSERT')
     OR pg_catalog.has_table_privilege('authenticated', 'public.media_assets', 'UPDATE')
     OR pg_catalog.has_table_privilege('authenticated', 'public.media_assets', 'DELETE')
     OR pg_catalog.has_table_privilege('anon', 'public.media_assets', 'SELECT')
     OR NOT pg_catalog.has_table_privilege('tenant_guard', 'public.media_assets', 'SELECT')
     OR NOT pg_catalog.has_column_privilege('tenant_guard', 'public.media_assets', 'declared_byte_size', 'INSERT')
     OR NOT pg_catalog.has_column_privilege('tenant_guard', 'public.media_assets', 'deleted_at', 'UPDATE')
     OR pg_catalog.has_column_privilege('tenant_guard', 'public.media_assets', 'master_key', 'UPDATE') THEN
    RAISE EXCEPTION 'AL-2679: public.media_assets privileges did not apply as expected';
  END IF;
END $$;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
