-- AL-2679 (WP6 part 1; plan 4, 5.4, 6.6, 7.1, 12 WP6; rulings W6-R1, W6-R2,
-- W6-R4): Core media custody table (`public.media_assets`), purge claim lease
-- table (`public.media_purge_claims`), field-policy classification (20 columns
-- x 5 surfaces = 100 rows for media_assets; 5 columns x 5 surfaces = 25 rows
-- for media_purge_claims), private Storage bucket `cms-media`, `tenant_guard`
-- upload-start and delete human commands, and the silent staff media-access
-- lookup for `/api/media/[assetId]`.
--
-- Purge delay: `35 days` (`INTERVAL '35 days'`), strictly longer than
-- Supabase's 7-day daily backup window and maximum 30-day point-in-time
-- recovery window, so restored databases never reference purged media keys.
--
-- Down (disposable, verified-empty database ONLY — NEVER run on shared or
-- production databases; production rollback leaves media custody in place and
-- uses a forward recovery migration so live references and delayed-purge
-- tombstones are never lost):
--   DROP FUNCTION public.release_media_content_purge(UUID, TEXT, UUID);
--   DROP FUNCTION public.claim_media_content_purge(UUID, UUID, TEXT, UUID, INTEGER);
--   DROP FUNCTION public.publish_media_finalize(UUID, UUID, TEXT, TIMESTAMPTZ);
--   DROP FUNCTION public.declare_media_finalize(UUID, UUID, TEXT, TEXT, JSONB, TEXT, BIGINT, INTEGER, INTEGER, TIMESTAMPTZ);
--   DROP FUNCTION public.resolve_staff_media_access(UUID);
--   DROP FUNCTION public.delete_media_asset(UUID, UUID);
--   DROP FUNCTION tenant_guard.delete_media_asset(UUID, UUID);
--   DROP FUNCTION public.start_media_upload(UUID, BIGINT, TEXT);
--   DROP FUNCTION tenant_guard.start_media_upload(UUID, BIGINT, TEXT);
--   DELETE FROM public.field_policies WHERE record_type = 'media_purge_claims' AND tenant_id IS NULL;
--   DROP TABLE public.media_purge_claims;
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
  upload_token_expires_at TIMESTAMPTZ,
  staging_swept_at TIMESTAMPTZ,
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

CREATE INDEX media_assets_pending_staging_sweep_idx
  ON public.media_assets (upload_token_expires_at)
  WHERE status IN ('ready', 'failed')
    AND staging_swept_at IS NULL
    AND upload_token_expires_at IS NOT NULL;

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

CREATE TABLE public.media_purge_claims (
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE RESTRICT,
  content_hash TEXT NOT NULL
    CONSTRAINT media_purge_claims_content_hash_check
      CHECK (content_hash ~ '^[0-9a-f]{64}$'),
  claim_token UUID NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (tenant_id, content_hash),
  CONSTRAINT media_purge_claims_expiry_check CHECK (expires_at > claimed_at)
);

COMMENT ON TABLE public.media_purge_claims IS
  'Short-lived per-(tenant_id, content_hash) purge leases (AL-2679, WP6 part 1) serializing canonical Storage object removal against concurrent media finalization. Accessible to service_role only.';

ALTER TABLE public.media_purge_claims OWNER TO postgres;
ALTER TABLE public.media_purge_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_purge_claims FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.media_purge_claims FROM PUBLIC, anon, authenticated, service_role, tenant_guard;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.media_purge_claims TO service_role;

CREATE POLICY media_purge_claims_service_role
  ON public.media_purge_claims
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

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
    ('media_assets', 'purged_at', 'internal'),
    ('media_assets', 'upload_token_expires_at', 'internal'),
    ('media_assets', 'staging_swept_at', 'internal')
) AS fields (record_type, field_key, category)
CROSS JOIN pg_catalog.unnest(
  ARRAY['mission_control', 'donor', 'missionary', 'public', 'export']
) AS surface;

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
  false,
  false,
  false,
  fields.category::public.field_sensitivity_category
FROM (
  VALUES
    ('media_purge_claims', 'tenant_id', 'internal'),
    ('media_purge_claims', 'content_hash', 'internal'),
    ('media_purge_claims', 'claim_token', 'internal'),
    ('media_purge_claims', 'claimed_at', 'internal'),
    ('media_purge_claims', 'expires_at', 'internal')
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

REVOKE ALL ON FUNCTION tenant_guard.start_media_upload(UUID, BIGINT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.start_media_upload(UUID, BIGINT, TEXT) TO authenticated;
GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.start_media_upload(UUID, BIGINT, TEXT) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

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

REVOKE ALL ON FUNCTION tenant_guard.delete_media_asset(UUID, UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.delete_media_asset(UUID, UUID) TO authenticated;
GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.delete_media_asset(UUID, UUID) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

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

CREATE OR REPLACE FUNCTION public.declare_media_finalize(
  p_tenant_id UUID,
  p_asset_id UUID,
  p_content_hash TEXT,
  p_master_key TEXT,
  p_variants JSONB,
  p_mime_type TEXT,
  p_byte_size BIGINT,
  p_width INTEGER,
  p_height INTEGER,
  p_now TIMESTAMPTZ DEFAULT pg_catalog.now()
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_row public.media_assets%ROWTYPE;
  v_wall_now TIMESTAMPTZ := pg_catalog.now();
  v_effective_now TIMESTAMPTZ := COALESCE(p_now, v_wall_now);
BEGIN
  IF p_tenant_id IS NULL OR p_asset_id IS NULL OR p_content_hash IS NULL THEN
    RAISE EXCEPTION 'media_finalize: tenant, asset and content_hash are required'
      USING ERRCODE = '22004';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_tenant_id::TEXT || ':' || p_content_hash, 0)
  );

  DELETE FROM public.media_purge_claims AS c
   WHERE c.tenant_id = p_tenant_id
     AND c.content_hash = p_content_hash
     AND c.expires_at <= v_wall_now;

  SELECT *
    INTO v_row
    FROM public.media_assets AS a
   WHERE a.id = p_asset_id
     AND a.tenant_id = p_tenant_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'missing');
  END IF;

  IF v_row.status = 'ready' THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'ready',
      'row', pg_catalog.to_jsonb(v_row)
    );
  END IF;

  IF v_row.status <> 'uploading' THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'terminal',
      'status', v_row.status
    );
  END IF;

  IF EXISTS (
    SELECT 1
      FROM public.media_purge_claims AS c
     WHERE c.tenant_id = p_tenant_id
       AND c.content_hash = p_content_hash
       AND c.expires_at > v_wall_now
  ) THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'claim_active',
      'status', v_row.status
    );
  END IF;

  UPDATE public.media_assets AS a
     SET mime_type = p_mime_type,
         content_hash = p_content_hash,
         master_key = p_master_key,
         variants = p_variants,
         byte_size = p_byte_size,
         width = p_width,
         height = p_height,
         updated_at = v_effective_now
   WHERE a.id = p_asset_id
     AND a.tenant_id = p_tenant_id
     AND a.status = 'uploading'
  RETURNING * INTO v_row;

  RETURN pg_catalog.jsonb_build_object(
    'outcome', 'declared',
    'row', pg_catalog.to_jsonb(v_row)
  );
END;
$$;

COMMENT ON FUNCTION public.declare_media_finalize(UUID, UUID, TEXT, TEXT, JSONB, TEXT, BIGINT, INTEGER, INTEGER, TIMESTAMPTZ) IS
  'Platform-lane helper (AL-2679, WP6 part 1): serializes on (tenant_id, content_hash), checks live purge claims, and durably records content_hash/master_key/variants on an uploading row before Storage writes. EXECUTE for service_role only.';

ALTER FUNCTION public.declare_media_finalize(UUID, UUID, TEXT, TEXT, JSONB, TEXT, BIGINT, INTEGER, INTEGER, TIMESTAMPTZ) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.declare_media_finalize(UUID, UUID, TEXT, TEXT, JSONB, TEXT, BIGINT, INTEGER, INTEGER, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated, service_role, tenant_guard;
GRANT EXECUTE ON FUNCTION public.declare_media_finalize(UUID, UUID, TEXT, TEXT, JSONB, TEXT, BIGINT, INTEGER, INTEGER, TIMESTAMPTZ) TO service_role;

CREATE OR REPLACE FUNCTION public.publish_media_finalize(
  p_tenant_id UUID,
  p_asset_id UUID,
  p_content_hash TEXT,
  p_now TIMESTAMPTZ DEFAULT pg_catalog.now()
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_row public.media_assets%ROWTYPE;
  v_wall_now TIMESTAMPTZ := pg_catalog.now();
  v_effective_now TIMESTAMPTZ := COALESCE(p_now, v_wall_now);
BEGIN
  IF p_tenant_id IS NULL OR p_asset_id IS NULL OR p_content_hash IS NULL THEN
    RAISE EXCEPTION 'media_finalize: tenant, asset and content_hash are required'
      USING ERRCODE = '22004';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_tenant_id::TEXT || ':' || p_content_hash, 0)
  );

  DELETE FROM public.media_purge_claims AS c
   WHERE c.tenant_id = p_tenant_id
     AND c.content_hash = p_content_hash
     AND c.expires_at <= v_wall_now;

  SELECT *
    INTO v_row
    FROM public.media_assets AS a
   WHERE a.id = p_asset_id
     AND a.tenant_id = p_tenant_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'missing');
  END IF;

  IF v_row.status = 'ready' THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'ready',
      'row', pg_catalog.to_jsonb(v_row)
    );
  END IF;

  IF v_row.status <> 'uploading' THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'terminal',
      'status', v_row.status
    );
  END IF;

  IF EXISTS (
    SELECT 1
      FROM public.media_purge_claims AS c
     WHERE c.tenant_id = p_tenant_id
       AND c.content_hash = p_content_hash
       AND c.expires_at > v_wall_now
  ) THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'claim_active',
      'status', v_row.status
    );
  END IF;

  IF v_row.content_hash IS DISTINCT FROM p_content_hash THEN
    RETURN pg_catalog.jsonb_build_object(
      'outcome', 'mismatch',
      'status', v_row.status
    );
  END IF;

  UPDATE public.media_assets AS a
     SET status = 'ready',
         updated_at = v_effective_now
   WHERE a.id = p_asset_id
     AND a.tenant_id = p_tenant_id
     AND a.status = 'uploading'
     AND a.content_hash = p_content_hash
  RETURNING * INTO v_row;

  RETURN pg_catalog.jsonb_build_object(
    'outcome', 'published',
    'row', pg_catalog.to_jsonb(v_row)
  );
END;
$$;

COMMENT ON FUNCTION public.publish_media_finalize(UUID, UUID, TEXT, TIMESTAMPTZ) IS
  'Platform-lane helper (AL-2679, WP6 part 1): atomically transitions a declared uploading row to ready under the per-(tenant_id, content_hash) advisory lock after confirming no live purge claim. EXECUTE for service_role only.';

ALTER FUNCTION public.publish_media_finalize(UUID, UUID, TEXT, TIMESTAMPTZ) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.publish_media_finalize(UUID, UUID, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated, service_role, tenant_guard;
GRANT EXECUTE ON FUNCTION public.publish_media_finalize(UUID, UUID, TEXT, TIMESTAMPTZ) TO service_role;

CREATE OR REPLACE FUNCTION public.claim_media_content_purge(
  p_tenant_id UUID,
  p_asset_id UUID,
  p_content_hash TEXT,
  p_claim_token UUID,
  p_lease_seconds INTEGER DEFAULT 120
)
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_wall_now TIMESTAMPTZ := pg_catalog.now();
  v_lease_secs INTEGER := GREATEST(1, COALESCE(p_lease_seconds, 120));
BEGIN
  IF p_tenant_id IS NULL OR p_asset_id IS NULL OR p_content_hash IS NULL OR p_claim_token IS NULL THEN
    RAISE EXCEPTION 'media_purge: tenant, asset, content_hash and claim_token are required'
      USING ERRCODE = '22004';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_tenant_id::TEXT || ':' || p_content_hash, 0)
  );

  DELETE FROM public.media_purge_claims AS c
   WHERE c.tenant_id = p_tenant_id
     AND c.content_hash = p_content_hash
     AND c.expires_at <= v_wall_now;

  IF EXISTS (
    SELECT 1
      FROM public.media_purge_claims AS c
     WHERE c.tenant_id = p_tenant_id
       AND c.content_hash = p_content_hash
       AND c.expires_at > v_wall_now
  ) THEN
    RETURN 'busy';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM public.media_assets AS a
     WHERE a.tenant_id = p_tenant_id
       AND a.content_hash = p_content_hash
       AND (
         a.status = 'ready'
         OR (a.status = 'deleted' AND a.purged_at IS NULL AND a.id <> p_asset_id)
       )
  ) THEN
    RETURN 'in_use_durable';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM public.media_assets AS a
     WHERE a.tenant_id = p_tenant_id
       AND a.content_hash = p_content_hash
       AND a.status = 'uploading'
       AND a.id <> p_asset_id
  ) THEN
    RETURN 'in_use_uploading';
  END IF;

  INSERT INTO public.media_purge_claims (
    tenant_id,
    content_hash,
    claim_token,
    claimed_at,
    expires_at
  )
  VALUES (
    p_tenant_id,
    p_content_hash,
    p_claim_token,
    v_wall_now,
    v_wall_now + pg_catalog.make_interval(secs => v_lease_secs)
  );

  RETURN 'claimed';
END;
$$;

COMMENT ON FUNCTION public.claim_media_content_purge(UUID, UUID, TEXT, UUID, INTEGER) IS
  'Platform-lane helper (AL-2679, WP6 part 1): atomically verifies no live ready, unpurged sibling deleted, or declared uploading row references (tenant_id, content_hash) and records a short-lived purge lease before Storage removal. EXECUTE for service_role only.';

ALTER FUNCTION public.claim_media_content_purge(UUID, UUID, TEXT, UUID, INTEGER) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.claim_media_content_purge(UUID, UUID, TEXT, UUID, INTEGER) FROM PUBLIC, anon, authenticated, service_role, tenant_guard;
GRANT EXECUTE ON FUNCTION public.claim_media_content_purge(UUID, UUID, TEXT, UUID, INTEGER) TO service_role;

CREATE OR REPLACE FUNCTION public.release_media_content_purge(
  p_tenant_id UUID,
  p_content_hash TEXT,
  p_claim_token UUID
)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF p_tenant_id IS NULL OR p_content_hash IS NULL OR p_claim_token IS NULL THEN
    RETURN;
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_tenant_id::TEXT || ':' || p_content_hash, 0)
  );

  DELETE FROM public.media_purge_claims AS c
   WHERE c.tenant_id = p_tenant_id
     AND c.content_hash = p_content_hash
     AND c.claim_token = p_claim_token;
END;
$$;

COMMENT ON FUNCTION public.release_media_content_purge(UUID, TEXT, UUID) IS
  'Platform-lane helper (AL-2679, WP6 part 1): releases a held per-(tenant_id, content_hash) purge lease matching claim_token. EXECUTE for service_role only.';

ALTER FUNCTION public.release_media_content_purge(UUID, TEXT, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.release_media_content_purge(UUID, TEXT, UUID) FROM PUBLIC, anon, authenticated, service_role, tenant_guard;
GRANT EXECUTE ON FUNCTION public.release_media_content_purge(UUID, TEXT, UUID) TO service_role;

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

  IF NOT pg_catalog.has_function_privilege('authenticated', 'tenant_guard.start_media_upload(uuid, bigint, text)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('public', 'tenant_guard.start_media_upload(uuid, bigint, text)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('anon', 'tenant_guard.start_media_upload(uuid, bigint, text)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('service_role', 'tenant_guard.start_media_upload(uuid, bigint, text)', 'EXECUTE')
     OR NOT pg_catalog.has_function_privilege('authenticated', 'tenant_guard.delete_media_asset(uuid, uuid)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('public', 'tenant_guard.delete_media_asset(uuid, uuid)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('anon', 'tenant_guard.delete_media_asset(uuid, uuid)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('service_role', 'tenant_guard.delete_media_asset(uuid, uuid)', 'EXECUTE')
     OR NOT pg_catalog.has_function_privilege('authenticated', 'public.start_media_upload(uuid, bigint, text)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('public', 'public.start_media_upload(uuid, bigint, text)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('anon', 'public.start_media_upload(uuid, bigint, text)', 'EXECUTE')
     OR NOT pg_catalog.has_function_privilege('authenticated', 'public.delete_media_asset(uuid, uuid)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('public', 'public.delete_media_asset(uuid, uuid)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('anon', 'public.delete_media_asset(uuid, uuid)', 'EXECUTE')
     OR NOT pg_catalog.has_function_privilege('authenticated', 'public.resolve_staff_media_access(uuid)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('public', 'public.resolve_staff_media_access(uuid)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('anon', 'public.resolve_staff_media_access(uuid)', 'EXECUTE')
     OR pg_catalog.has_table_privilege('authenticated', 'public.media_purge_claims', 'SELECT')
     OR pg_catalog.has_table_privilege('anon', 'public.media_purge_claims', 'SELECT')
     OR pg_catalog.has_table_privilege('tenant_guard', 'public.media_purge_claims', 'SELECT')
     OR NOT pg_catalog.has_function_privilege('service_role', 'public.declare_media_finalize(uuid, uuid, text, text, jsonb, text, bigint, integer, integer, timestamptz)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('authenticated', 'public.declare_media_finalize(uuid, uuid, text, text, jsonb, text, bigint, integer, integer, timestamptz)', 'EXECUTE')
     OR NOT pg_catalog.has_function_privilege('service_role', 'public.publish_media_finalize(uuid, uuid, text, timestamptz)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('authenticated', 'public.publish_media_finalize(uuid, uuid, text, timestamptz)', 'EXECUTE')
     OR NOT pg_catalog.has_function_privilege('service_role', 'public.claim_media_content_purge(uuid, uuid, text, uuid, integer)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('authenticated', 'public.claim_media_content_purge(uuid, uuid, text, uuid, integer)', 'EXECUTE')
     OR NOT pg_catalog.has_function_privilege('service_role', 'public.release_media_content_purge(uuid, text, uuid)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('authenticated', 'public.release_media_content_purge(uuid, text, uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'AL-2679: media function EXECUTE privileges did not apply as expected';
  END IF;
END $$;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
