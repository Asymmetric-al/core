-- CRM table preferences: user-pinned row actions and tenant defaults
-- (ADR-CD-021, issue #271). The server record is the source of truth with
-- schema versioning; preferences are personalization only and are always
-- re-validated against capability/state-filtered inline actions before use.

CREATE TABLE IF NOT EXISTS public.crm_table_user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    table_id TEXT NOT NULL,
    schema_version INTEGER NOT NULL DEFAULT 1,
    pinned_action_id TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, profile_id, table_id)
);

CREATE TABLE IF NOT EXISTS public.crm_table_tenant_defaults (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    table_id TEXT NOT NULL,
    schema_version INTEGER NOT NULL DEFAULT 1,
    pinned_action_id TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, table_id)
);

-- Tenant default changes are audited, not approval-gated (ADR-CD-021).
CREATE TABLE IF NOT EXISTS public.crm_table_preference_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    table_id TEXT NOT NULL,
    scope TEXT NOT NULL DEFAULT 'tenant_default' CHECK (scope IN ('tenant_default')),
    before_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    after_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_table_preference_audit_tenant
    ON public.crm_table_preference_audit_events (tenant_id, table_id, created_at DESC);

ALTER TABLE public.crm_table_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_table_tenant_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_table_preference_audit_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.crm_table_user_preferences FROM anon, authenticated;
REVOKE ALL ON TABLE public.crm_table_tenant_defaults FROM anon, authenticated;
REVOKE ALL ON TABLE public.crm_table_preference_audit_events FROM anon, authenticated;

GRANT ALL ON TABLE public.crm_table_user_preferences TO service_role;
GRANT ALL ON TABLE public.crm_table_tenant_defaults TO service_role;
GRANT ALL ON TABLE public.crm_table_preference_audit_events TO service_role;
