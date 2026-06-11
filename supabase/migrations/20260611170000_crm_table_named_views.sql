-- Named personal CRM gift-history views (ADR-CD-021, issue #273).
-- Personal-only snapshots of view settings; one default per user/table.
-- No sharing, publishing, or team views.

CREATE TABLE IF NOT EXISTS public.crm_table_named_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    table_id TEXT NOT NULL,
    name TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    schema_version INTEGER NOT NULL DEFAULT 1,
    pinned_action_id TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, profile_id, table_id, name)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_table_named_views_default
    ON public.crm_table_named_views (tenant_id, profile_id, table_id)
    WHERE is_default;

ALTER TABLE public.crm_table_named_views ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.crm_table_named_views FROM anon, authenticated;

GRANT ALL ON TABLE public.crm_table_named_views TO service_role;
