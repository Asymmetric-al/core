BEGIN;

ALTER TABLE public.pdf_templates
  ADD COLUMN IF NOT EXISTS engine TEXT NOT NULL DEFAULT 'unlayer',
  ADD COLUMN IF NOT EXISTS native_schema_version INTEGER,
  ADD COLUMN IF NOT EXISTS native_template_current_draft_version_id UUID,
  ADD COLUMN IF NOT EXISTS native_template_current_published_version_id UUID,
  ADD COLUMN IF NOT EXISTS legacy_unlayer_project_id TEXT,
  ADD COLUMN IF NOT EXISTS migration_status TEXT NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS migration_report JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  ALTER TABLE public.pdf_templates
    ADD CONSTRAINT pdf_templates_engine_check
    CHECK (engine IN ('unlayer', 'asym_pdf_document_builder'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.pdf_templates
    ADD CONSTRAINT pdf_templates_native_schema_version_check
    CHECK (native_schema_version IS NULL OR native_schema_version > 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.pdf_templates
    ADD CONSTRAINT pdf_templates_migration_status_check
    CHECK (
      migration_status IN (
        'not_started',
        'manual_rebuild_required',
        'in_progress',
        'rebuilt',
        'validated',
        'published',
        'archived'
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.pdf_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.pdf_templates(id) ON DELETE RESTRICT,
  version_number INTEGER NOT NULL CHECK (version_number > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  schema_name TEXT NOT NULL DEFAULT 'document_template_v1',
  schema_version INTEGER NOT NULL DEFAULT 1 CHECK (schema_version > 0),
  native_template JSONB NOT NULL,
  sample_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  preflight_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_hash TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pdf_template_versions_template_version_unique UNIQUE (template_id, version_number)
);

CREATE TABLE IF NOT EXISTS public.pdf_template_renders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.pdf_templates(id) ON DELETE RESTRICT,
  template_version_id UUID REFERENCES public.pdf_template_versions(id) ON DELETE RESTRICT,
  render_id TEXT NOT NULL,
  renderer TEXT NOT NULL DEFAULT 'docraptor' CHECK (renderer IN ('docraptor', 'browser', 'local')),
  mode TEXT NOT NULL CHECK (mode IN ('preview', 'production', 'batch')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (
    status IN ('queued', 'running', 'success', 'warning', 'error', 'canceled')
  ),
  request JSONB NOT NULL DEFAULT '{}'::jsonb,
  diagnostics JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms NUMERIC,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pdf_template_renders_tenant_render_id_unique UNIQUE (tenant_id, render_id)
);

CREATE TABLE IF NOT EXISTS public.pdf_template_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.pdf_templates(id) ON DELETE RESTRICT,
  template_version_id UUID REFERENCES public.pdf_template_versions(id) ON DELETE RESTRICT,
  render_id UUID REFERENCES public.pdf_template_renders(id) ON DELETE RESTRICT,
  kind TEXT NOT NULL CHECK (kind IN ('pdf', 'html', 'preview', 'manifest')),
  mime_type TEXT NOT NULL,
  size_bytes BIGINT CHECK (size_bytes IS NULL OR size_bytes >= 0),
  storage_bucket TEXT,
  storage_path TEXT,
  url TEXT,
  hash TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pdf_template_artifacts_location_check CHECK (
    storage_path IS NOT NULL OR url IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS public.pdf_template_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.pdf_templates(id) ON DELETE RESTRICT,
  template_version_id UUID REFERENCES public.pdf_template_versions(id) ON DELETE RESTRICT,
  render_id UUID REFERENCES public.pdf_template_renders(id) ON DELETE RESTRICT,
  actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  event JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pdf_template_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.pdf_templates(id) ON DELETE RESTRICT,
  template_version_id UUID REFERENCES public.pdf_template_versions(id) ON DELETE RESTRICT,
  batch_key TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (
    status IN ('queued', 'running', 'completed', 'partial', 'failed', 'canceled')
  ),
  request JSONB NOT NULL DEFAULT '{}'::jsonb,
  totals JSONB NOT NULL DEFAULT '{}'::jsonb,
  requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pdf_template_batches_tenant_batch_key_unique UNIQUE (tenant_id, batch_key)
);

CREATE TABLE IF NOT EXISTS public.pdf_template_batch_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.pdf_template_batches(id) ON DELETE CASCADE,
  render_id UUID REFERENCES public.pdf_template_renders(id) ON DELETE SET NULL,
  subject_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (
    status IN ('queued', 'running', 'success', 'warning', 'error', 'canceled')
  ),
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  error JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE public.pdf_templates
    ADD CONSTRAINT pdf_templates_current_draft_version_fk
    FOREIGN KEY (native_template_current_draft_version_id)
    REFERENCES public.pdf_template_versions(id)
    DEFERRABLE INITIALLY DEFERRED;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.pdf_templates
    ADD CONSTRAINT pdf_templates_current_published_version_fk
    FOREIGN KEY (native_template_current_published_version_id)
    REFERENCES public.pdf_template_versions(id)
    DEFERRABLE INITIALLY DEFERRED;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_pdf_templates_tenant_engine_status_updated_at
  ON public.pdf_templates (tenant_id, engine, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_pdf_templates_tenant_category_engine
  ON public.pdf_templates (tenant_id, category, engine);

CREATE INDEX IF NOT EXISTS idx_pdf_template_versions_tenant_template_status
  ON public.pdf_template_versions (tenant_id, template_id, status);

CREATE INDEX IF NOT EXISTS idx_pdf_template_versions_template_created_at
  ON public.pdf_template_versions (template_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pdf_template_renders_tenant_template_created_at
  ON public.pdf_template_renders (tenant_id, template_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pdf_template_renders_version_status
  ON public.pdf_template_renders (template_version_id, status);

CREATE INDEX IF NOT EXISTS idx_pdf_template_artifacts_tenant_template
  ON public.pdf_template_artifacts (tenant_id, template_id);

CREATE INDEX IF NOT EXISTS idx_pdf_template_artifacts_render
  ON public.pdf_template_artifacts (render_id);

CREATE INDEX IF NOT EXISTS idx_pdf_template_audit_events_tenant_template_created_at
  ON public.pdf_template_audit_events (tenant_id, template_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pdf_template_batches_tenant_template_status
  ON public.pdf_template_batches (tenant_id, template_id, status);

CREATE INDEX IF NOT EXISTS idx_pdf_template_batch_jobs_batch_status
  ON public.pdf_template_batch_jobs (batch_id, status);

CREATE OR REPLACE FUNCTION public.set_pdf_template_native_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_pdf_template_batches_updated_at ON public.pdf_template_batches;
CREATE TRIGGER set_pdf_template_batches_updated_at
  BEFORE UPDATE ON public.pdf_template_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.set_pdf_template_native_updated_at();

DROP TRIGGER IF EXISTS set_pdf_template_batch_jobs_updated_at ON public.pdf_template_batch_jobs;
CREATE TRIGGER set_pdf_template_batch_jobs_updated_at
  BEFORE UPDATE ON public.pdf_template_batch_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_pdf_template_native_updated_at();

ALTER TABLE public.pdf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_template_renders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_template_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_template_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_template_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_template_batch_jobs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.pdf_templates FROM anon;
REVOKE ALL ON TABLE public.pdf_template_versions FROM anon;
REVOKE ALL ON TABLE public.pdf_template_renders FROM anon;
REVOKE ALL ON TABLE public.pdf_template_artifacts FROM anon;
REVOKE ALL ON TABLE public.pdf_template_audit_events FROM anon;
REVOKE ALL ON TABLE public.pdf_template_batches FROM anon;
REVOKE ALL ON TABLE public.pdf_template_batch_jobs FROM anon;

REVOKE DELETE ON TABLE public.pdf_templates FROM authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.pdf_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.pdf_template_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.pdf_template_renders TO authenticated;
GRANT SELECT, INSERT ON TABLE public.pdf_template_artifacts TO authenticated;
GRANT SELECT, INSERT ON TABLE public.pdf_template_audit_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.pdf_template_batches TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.pdf_template_batch_jobs TO authenticated;

GRANT ALL ON TABLE public.pdf_templates TO service_role;
GRANT ALL ON TABLE public.pdf_template_versions TO service_role;
GRANT ALL ON TABLE public.pdf_template_renders TO service_role;
GRANT ALL ON TABLE public.pdf_template_artifacts TO service_role;
GRANT ALL ON TABLE public.pdf_template_audit_events TO service_role;
GRANT ALL ON TABLE public.pdf_template_batches TO service_role;
GRANT ALL ON TABLE public.pdf_template_batch_jobs TO service_role;

DROP POLICY IF EXISTS "pdf template versions select" ON public.pdf_template_versions;
CREATE POLICY "pdf template versions select"
  ON public.pdf_template_versions
  FOR SELECT
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "pdf template versions insert" ON public.pdf_template_versions;
CREATE POLICY "pdf template versions insert"
  ON public.pdf_template_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "pdf template versions update" ON public.pdf_template_versions;
CREATE POLICY "pdf template versions update"
  ON public.pdf_template_versions
  FOR UPDATE
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  )
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "pdf template renders select" ON public.pdf_template_renders;
CREATE POLICY "pdf template renders select"
  ON public.pdf_template_renders
  FOR SELECT
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "pdf template renders insert" ON public.pdf_template_renders;
CREATE POLICY "pdf template renders insert"
  ON public.pdf_template_renders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "pdf template renders update" ON public.pdf_template_renders;
CREATE POLICY "pdf template renders update"
  ON public.pdf_template_renders
  FOR UPDATE
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  )
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "pdf template artifacts select" ON public.pdf_template_artifacts;
CREATE POLICY "pdf template artifacts select"
  ON public.pdf_template_artifacts
  FOR SELECT
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "pdf template artifacts insert" ON public.pdf_template_artifacts;
CREATE POLICY "pdf template artifacts insert"
  ON public.pdf_template_artifacts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "pdf template audit events select" ON public.pdf_template_audit_events;
CREATE POLICY "pdf template audit events select"
  ON public.pdf_template_audit_events
  FOR SELECT
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "pdf template audit events insert" ON public.pdf_template_audit_events;
CREATE POLICY "pdf template audit events insert"
  ON public.pdf_template_audit_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "pdf template batches select" ON public.pdf_template_batches;
CREATE POLICY "pdf template batches select"
  ON public.pdf_template_batches
  FOR SELECT
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "pdf template batches insert" ON public.pdf_template_batches;
CREATE POLICY "pdf template batches insert"
  ON public.pdf_template_batches
  FOR INSERT
  TO authenticated
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "pdf template batches update" ON public.pdf_template_batches;
CREATE POLICY "pdf template batches update"
  ON public.pdf_template_batches
  FOR UPDATE
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  )
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "pdf template batch jobs select" ON public.pdf_template_batch_jobs;
CREATE POLICY "pdf template batch jobs select"
  ON public.pdf_template_batch_jobs
  FOR SELECT
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "pdf template batch jobs insert" ON public.pdf_template_batch_jobs;
CREATE POLICY "pdf template batch jobs insert"
  ON public.pdf_template_batch_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "pdf template batch jobs update" ON public.pdf_template_batch_jobs;
CREATE POLICY "pdf template batch jobs update"
  ON public.pdf_template_batch_jobs
  FOR UPDATE
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  )
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "pdf template versions service role" ON public.pdf_template_versions;
CREATE POLICY "pdf template versions service role"
  ON public.pdf_template_versions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "pdf template renders service role" ON public.pdf_template_renders;
CREATE POLICY "pdf template renders service role"
  ON public.pdf_template_renders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "pdf template artifacts service role" ON public.pdf_template_artifacts;
CREATE POLICY "pdf template artifacts service role"
  ON public.pdf_template_artifacts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "pdf template audit events service role" ON public.pdf_template_audit_events;
CREATE POLICY "pdf template audit events service role"
  ON public.pdf_template_audit_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "pdf template batches service role" ON public.pdf_template_batches;
CREATE POLICY "pdf template batches service role"
  ON public.pdf_template_batches
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "pdf template batch jobs service role" ON public.pdf_template_batch_jobs;
CREATE POLICY "pdf template batch jobs service role"
  ON public.pdf_template_batch_jobs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON COLUMN public.pdf_templates.engine
  IS 'Legacy Unlayer remains the default. asym_pdf_document_builder marks native builder templates.';
COMMENT ON COLUMN public.pdf_templates.migration_report
  IS 'Manual Unlayer rebuild and unsupported-feature report metadata. Generated HTML is not native source of truth.';
COMMENT ON TABLE public.pdf_template_versions
  IS 'Immutable native PDF Document Builder template versions.';
COMMENT ON TABLE public.pdf_template_renders
  IS 'Official DocRaptor and preview render attempts for native PDF templates.';
COMMENT ON TABLE public.pdf_template_artifacts
  IS 'Render artifact records; artifact bytes stay in storage/provider adapters.';
COMMENT ON TABLE public.pdf_template_audit_events
  IS 'Append-only native PDF Studio audit events.';
COMMENT ON TABLE public.pdf_template_batches
  IS 'Adapter-managed batch document generation runs.';
COMMENT ON TABLE public.pdf_template_batch_jobs
  IS 'Adapter-managed batch document generation jobs.';

COMMIT;
