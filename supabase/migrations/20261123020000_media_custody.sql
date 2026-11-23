-- AL-2679 (WP6 part 1; plan 4, 5.4, 6.6, 7.1, 12 WP6; rulings W6-R1, W6-R2,
-- W6-R4, W6-R15, W6-R16): Core media custody table (`public.media_assets`),
-- field-policy classification (17 columns x 5 surfaces = 85 rows), private
-- Storage bucket `cms-media`, `tenant_guard` upload-start and delete human
-- commands, platform-lane finalize declaration/publish helpers, and the silent
-- staff media-access lookup for `/api/media/[assetId]`.
--
-- Purge delay: `35 days` (`INTERVAL '35 days'`), strictly longer than
-- Supabase's 7-day daily backup window and maximum 30-day point-in-time
-- recovery window, recorded on tombstones (`purge_after`).
-- No code removes canonical media bytes. A deleted asset keeps its bytes in the
-- private bucket. The delayed purge and the sweep of abandoned staging objects
-- are owed to WP7, which adds the live-use check (plan section 12, "WP7 —
-- Publishing and the public site", Behaviour and Acceptance evidence),
-- scheduled by WP10 (plan section 9.6, "Continuing burden this design adds");
-- their requirements are in issue #2769.
--
-- Storage policy assertion limit (W6-R16): the `DO` block below is a one-time
-- apply-time check against the `storage.objects` policies present at migration
-- apply time. It cannot prove a role that inherits from `authenticated`, and a
-- harmless nested `OR` in an unrelated policy would stop it. The standing guard
-- is the real-stack test of zero effective policy coverage for `cms-media`
-- (`tests/unit/acceptance/issue-2679/media-custody.realstack.acceptance.test.ts`
-- and `media-storage.postgrest.acceptance.test.ts`).
--
-- Down (disposable, verified-empty database ONLY — NEVER run on shared or
-- production databases; production rollback leaves media custody in place and
-- uses a forward recovery migration so live references and delayed-purge
-- tombstones are never lost):
--   DROP FUNCTION public.publish_media_finalize(UUID, UUID, TEXT, TIMESTAMPTZ);
--   DROP FUNCTION public.declare_media_finalize(UUID, UUID, TEXT, TEXT, JSONB, TEXT, BIGINT, INTEGER, INTEGER, TIMESTAMPTZ);
--   DROP FUNCTION public.resolve_staff_media_access(UUID);
--   DROP FUNCTION public.delete_media_asset(UUID, UUID);
--   DROP FUNCTION tenant_guard.delete_media_asset(UUID, UUID);
--   DROP FUNCTION public.start_media_upload(UUID, BIGINT, TEXT);
--   DROP FUNCTION tenant_guard.start_media_upload(UUID, BIGINT, TEXT);
--   DROP FUNCTION private.share_lock_tenant(UUID);
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
  'Core media custody records (AL-2679, WP6 part 1). Signed-in staff hold SELECT only; upload start and delete tombstones run via tenant_guard commands; finished-upload metadata is written exclusively by packages/api/src/storage/media-store.ts.';

CREATE INDEX media_assets_tenant_status_created_idx
  ON public.media_assets (tenant_id, status, created_at DESC);

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
GRANT SELECT ON TABLE public.media_assets TO service_role;
GRANT UPDATE (
  status,
  mime_type,
  content_hash,
  master_key,
  variants,
  byte_size,
  width,
  height,
  updated_at
) ON TABLE public.media_assets TO service_role;

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
    ('media_assets', 'purge_after', 'internal')
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

CREATE OR REPLACE FUNCTION private.share_lock_tenant(p_tenant_id UUID)
RETURNS TEXT
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT t.status
    FROM public.tenants AS t
   WHERE t.id = p_tenant_id
     FOR SHARE;
$$;

COMMENT ON FUNCTION private.share_lock_tenant(UUID) IS
  'Share-locks a tenant row and returns its current status so tenant_guard commands serialize against concurrent tenant suspension or closure without granting SELECT on public.tenants to tenant_guard. EXECUTE for tenant_guard only.';

ALTER FUNCTION private.share_lock_tenant(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.share_lock_tenant(UUID) FROM PUBLIC, anon, authenticated, service_role, tenant_guard;
GRANT EXECUTE ON FUNCTION private.share_lock_tenant(UUID) TO tenant_guard;

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
  v_tenant_status TEXT;
  v_member_user_id UUID;
  v_member_tenant_id UUID;
  v_member_active BOOLEAN;
  v_member_revoked_at TIMESTAMPTZ;
  v_member_found BOOLEAN;
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

  v_tenant_status := private.share_lock_tenant(v_ctx.tenant_id);

  SELECT m.user_id, m.tenant_id, m.is_active, m.revoked_at
    INTO v_member_user_id, v_member_tenant_id, v_member_active, v_member_revoked_at
    FROM authz.memberships AS m
   WHERE m.id = v_ctx.assignment_id
     AND m.tenant_id = v_ctx.tenant_id
     FOR SHARE;
  v_member_found := FOUND;

  IF v_tenant_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'tenant_guard: tenant is not active'
      USING ERRCODE = '42501';
  END IF;

  IF NOT v_member_found
     OR v_member_user_id IS DISTINCT FROM v_ctx.actor_id
     OR v_member_tenant_id IS DISTINCT FROM v_ctx.tenant_id
     OR NOT COALESCE(v_member_active, false)
     OR v_member_revoked_at IS NOT NULL THEN
    RAISE EXCEPTION 'tenant_guard: the selected assignment is not a live assignment of the caller in this tenant'
      USING ERRCODE = '42501';
  END IF;

  IF NOT ('web_studio.edit' = ANY (authz.assignment_capabilities(v_ctx.assignment_id))) THEN
    RAISE EXCEPTION 'tenant_guard: the selected assignment does not hold the capability this command requires'
      USING ERRCODE = '42501';
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
  v_tenant_status TEXT;
  v_member_user_id UUID;
  v_member_tenant_id UUID;
  v_member_active BOOLEAN;
  v_member_revoked_at TIMESTAMPTZ;
  v_member_found BOOLEAN;
  v_asset_found BOOLEAN;
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

  v_tenant_status := private.share_lock_tenant(v_ctx.tenant_id);

  SELECT m.user_id, m.tenant_id, m.is_active, m.revoked_at
    INTO v_member_user_id, v_member_tenant_id, v_member_active, v_member_revoked_at
    FROM authz.memberships AS m
   WHERE m.id = v_ctx.assignment_id
     AND m.tenant_id = v_ctx.tenant_id
     FOR SHARE;
  v_member_found := FOUND;

  SELECT a.id, a.status, a.deleted_at, a.purge_after
    INTO v_existing_id, v_existing_status, v_existing_deleted_at, v_existing_purge_after
    FROM public.media_assets AS a
   WHERE a.id = p_asset_id
     AND a.tenant_id = v_ctx.tenant_id
     FOR UPDATE;
  v_asset_found := FOUND;

  IF v_tenant_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'tenant_guard: tenant is not active'
      USING ERRCODE = '42501';
  END IF;

  IF NOT v_member_found
     OR v_member_user_id IS DISTINCT FROM v_ctx.actor_id
     OR v_member_tenant_id IS DISTINCT FROM v_ctx.tenant_id
     OR NOT COALESCE(v_member_active, false)
     OR v_member_revoked_at IS NOT NULL THEN
    RAISE EXCEPTION 'tenant_guard: the selected assignment is not a live assignment of the caller in this tenant'
      USING ERRCODE = '42501';
  END IF;

  IF NOT ('web_studio.edit' = ANY (authz.assignment_capabilities(v_ctx.assignment_id))) THEN
    RAISE EXCEPTION 'tenant_guard: the selected assignment does not hold the capability this command requires'
      USING ERRCODE = '42501';
  END IF;

  IF NOT v_asset_found THEN
    RAISE EXCEPTION 'media_delete: media asset not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_existing_status = 'deleted' THEN
    RETURN pg_catalog.jsonb_build_object(
      'asset_id', v_existing_id,
      'tenant_id', v_ctx.tenant_id,
      'status', 'deleted',
      'deleted_at', v_existing_deleted_at,
      'purge_after', v_existing_purge_after,
      'already_deleted', true
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
    'already_deleted', false
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
  v_effective_now TIMESTAMPTZ := COALESCE(p_now, pg_catalog.now());
BEGIN
  IF p_tenant_id IS NULL OR p_asset_id IS NULL OR p_content_hash IS NULL THEN
    RAISE EXCEPTION 'media_finalize: tenant, asset and content_hash are required'
      USING ERRCODE = '22004';
  END IF;

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
  'Platform-lane helper (AL-2679, WP6 part 1): row-locks an uploading media asset and durably records content_hash/master_key/variants before Storage writes so mid-finalize tombstones retain canonical keys. EXECUTE for service_role only.';

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
  v_effective_now TIMESTAMPTZ := COALESCE(p_now, pg_catalog.now());
BEGIN
  IF p_tenant_id IS NULL OR p_asset_id IS NULL OR p_content_hash IS NULL THEN
    RAISE EXCEPTION 'media_finalize: tenant, asset and content_hash are required'
      USING ERRCODE = '22004';
  END IF;

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
  'Platform-lane helper (AL-2679, WP6 part 1): atomically transitions a declared uploading row to ready under FOR UPDATE row lock after verified canonical Storage writes. EXECUTE for service_role only.';

ALTER FUNCTION public.publish_media_finalize(UUID, UUID, TEXT, TIMESTAMPTZ) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.publish_media_finalize(UUID, UUID, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated, service_role, tenant_guard;
GRANT EXECUTE ON FUNCTION public.publish_media_finalize(UUID, UUID, TEXT, TIMESTAMPTZ) TO service_role;

DO $$
DECLARE
  v_problem TEXT;
BEGIN
  SELECT pg_catalog.string_agg(policyname, ', ')
    INTO v_problem
    FROM pg_catalog.pg_policies
   WHERE schemaname = 'storage'
     AND tablename = 'objects'
     AND (
       COALESCE(qual, '') ILIKE '%cms-media%'
       OR COALESCE(with_check, '') ILIKE '%cms-media%'
       OR (
         permissive = 'PERMISSIVE'
         AND roles && ARRAY['public', 'anon', 'authenticated']::NAME[]
         AND (
           (
             cmd IN ('SELECT', 'UPDATE', 'DELETE', 'ALL')
             AND (
               qual IS NULL
               OR qual !~* '^\(*\s*bucket_id\s*=\s*''[^'']+''(::text)?(\s|\)|$)'
               OR qual ~* '\yOR\y'
             )
           )
           OR (
             cmd IN ('INSERT', 'UPDATE', 'ALL')
             AND (
               COALESCE(with_check, qual) IS NULL
               OR COALESCE(with_check, qual) !~* '^\(*\s*bucket_id\s*=\s*''[^'']+''(::text)?(\s|\)|$)'
               OR COALESCE(with_check, qual) ~* '\yOR\y'
             )
           )
         )
       )
     );

  IF v_problem IS NOT NULL THEN
    RAISE EXCEPTION 'AL-2679: cms-media bucket must have zero effective storage.objects policies, found: %', v_problem;
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
     OR pg_catalog.has_column_privilege('tenant_guard', 'public.media_assets', 'master_key', 'UPDATE')
     OR NOT pg_catalog.has_table_privilege('service_role', 'public.media_assets', 'SELECT')
     OR pg_catalog.has_table_privilege('service_role', 'public.media_assets', 'UPDATE')
     OR NOT pg_catalog.has_column_privilege('service_role', 'public.media_assets', 'status', 'UPDATE')
     OR NOT pg_catalog.has_column_privilege('service_role', 'public.media_assets', 'master_key', 'UPDATE')
     OR NOT pg_catalog.has_column_privilege('service_role', 'public.media_assets', 'updated_at', 'UPDATE')
     OR pg_catalog.has_column_privilege('service_role', 'public.media_assets', 'id', 'UPDATE')
     OR pg_catalog.has_column_privilege('service_role', 'public.media_assets', 'tenant_id', 'UPDATE')
     OR pg_catalog.has_column_privilege('service_role', 'public.media_assets', 'created_by', 'UPDATE')
     OR pg_catalog.has_column_privilege('service_role', 'public.media_assets', 'created_at', 'UPDATE')
     OR pg_catalog.has_column_privilege('service_role', 'public.media_assets', 'purge_after', 'UPDATE')
     OR pg_catalog.has_column_privilege('service_role', 'public.media_assets', 'deleted_at', 'UPDATE')
     OR pg_catalog.has_column_privilege('service_role', 'public.media_assets', 'declared_byte_size', 'UPDATE')
     OR pg_catalog.has_column_privilege('service_role', 'public.media_assets', 'declared_mime_type', 'UPDATE') THEN
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
     OR NOT pg_catalog.has_function_privilege('service_role', 'public.declare_media_finalize(uuid, uuid, text, text, jsonb, text, bigint, integer, integer, timestamptz)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('authenticated', 'public.declare_media_finalize(uuid, uuid, text, text, jsonb, text, bigint, integer, integer, timestamptz)', 'EXECUTE')
     OR NOT pg_catalog.has_function_privilege('service_role', 'public.publish_media_finalize(uuid, uuid, text, timestamptz)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('authenticated', 'public.publish_media_finalize(uuid, uuid, text, timestamptz)', 'EXECUTE')
     OR NOT pg_catalog.has_function_privilege('tenant_guard', 'private.share_lock_tenant(uuid)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('public', 'private.share_lock_tenant(uuid)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('anon', 'private.share_lock_tenant(uuid)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('authenticated', 'private.share_lock_tenant(uuid)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('service_role', 'private.share_lock_tenant(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'AL-2679: media function EXECUTE privileges did not apply as expected';
  END IF;
END $$;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
