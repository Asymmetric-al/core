-- Email Studio template storage for React Email Editor with controlled legacy Unlayer support.

CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'campaign',
    builder TEXT NOT NULL DEFAULT 'react_email',
    builder_version TEXT,
    design_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    html_content TEXT,
    html_exported_at TIMESTAMPTZ,
    text_content TEXT,
    text_exported_at TIMESTAMPTZ,
    editor_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    legacy_unlayer_project_id INTEGER,
    default_subject TEXT,
    default_preheader TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT email_templates_category_check
        CHECK (category IN ('transactional', 'campaign', 'system')),
    CONSTRAINT email_templates_builder_check
        CHECK (builder IN ('unlayer', 'react_email'))
);

CREATE TABLE IF NOT EXISTS public.email_template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.email_templates(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    version INTEGER NOT NULL CHECK (version > 0),
    builder TEXT NOT NULL,
    builder_version TEXT,
    design_json JSONB NOT NULL,
    html_content TEXT,
    text_content TEXT,
    subject TEXT,
    preheader TEXT,
    editor_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    CONSTRAINT email_template_versions_builder_check
        CHECK (builder IN ('unlayer', 'react_email')),
    CONSTRAINT email_template_versions_template_version_unique
        UNIQUE (template_id, version)
);

ALTER TABLE public.email_send_logs
    ADD COLUMN IF NOT EXISTS template_version_id UUID REFERENCES public.email_template_versions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS template_builder TEXT;

ALTER TABLE public.email_send_logs
    ADD CONSTRAINT email_send_logs_template_builder_check
    CHECK (template_builder IS NULL OR template_builder IN ('unlayer', 'react_email'));

CREATE INDEX IF NOT EXISTS idx_email_templates_tenant_updated_at
    ON public.email_templates (tenant_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_templates_tenant_builder
    ON public.email_templates (tenant_id, builder);

CREATE INDEX IF NOT EXISTS idx_email_templates_tenant_category_active
    ON public.email_templates (tenant_id, category, is_active);

CREATE INDEX IF NOT EXISTS idx_email_template_versions_tenant_template_version
    ON public.email_template_versions (tenant_id, template_id, version DESC);

CREATE INDEX IF NOT EXISTS idx_email_send_logs_template_version_id
    ON public.email_send_logs (template_version_id);

ALTER TABLE public.email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_template_versions DISABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.email_templates FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_template_versions FROM anon, authenticated;
