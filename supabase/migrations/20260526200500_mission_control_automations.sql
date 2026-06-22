-- Mission Control-wide automation builder foundation.

CREATE TABLE IF NOT EXISTS public.mission_control_automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    mode TEXT NOT NULL CHECK (mode IN ('simple', 'advanced')),
    trigger JSONB NOT NULL DEFAULT '{}'::jsonb,
    conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    run_mode TEXT NOT NULL DEFAULT 'automatic' CHECK (run_mode IN ('automatic', 'review_first')),
    reviewer_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
    failure_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
    activity_log_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    activation_status TEXT NOT NULL DEFAULT 'draft' CHECK (activation_status IN ('draft', 'ready', 'active', 'paused', 'disabled')),
    version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
    last_preview_id UUID,
    last_test_run_id UUID,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    disabled_at TIMESTAMPTZ,
    disabled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.mission_control_automation_rule_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES public.mission_control_automation_rules(id) ON DELETE CASCADE,
    version INTEGER NOT NULL CHECK (version > 0),
    definition JSONB NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (rule_id, version)
);

CREATE TABLE IF NOT EXISTS public.mission_control_automation_previews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES public.mission_control_automation_rules(id) ON DELETE CASCADE,
    matched_records JSONB NOT NULL DEFAULT '[]'::jsonb,
    proposed_changes JSONB NOT NULL DEFAULT '[]'::jsonb,
    skipped_records JSONB NOT NULL DEFAULT '[]'::jsonb,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.mission_control_automation_test_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES public.mission_control_automation_rules(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'passed' CHECK (status IN ('passed', 'failed')),
    result JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mission_control_automation_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES public.mission_control_automation_rules(id) ON DELETE SET NULL,
    run_id UUID,
    trigger JSONB NOT NULL DEFAULT '{}'::jsonb,
    matched_records JSONB NOT NULL DEFAULT '[]'::jsonb,
    attempted_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    skipped_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    failures JSONB NOT NULL DEFAULT '[]'::jsonb,
    notifications JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_tasks UUID[] NOT NULL DEFAULT '{}'::uuid[],
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_kind TEXT NOT NULL DEFAULT 'system' CHECK (actor_kind IN ('human', 'system')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mission_control_automation_rules_tenant_status
    ON public.mission_control_automation_rules (tenant_id, activation_status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_mission_control_automation_activity_tenant_rule
    ON public.mission_control_automation_activity_logs (tenant_id, rule_id, created_at DESC);

ALTER TABLE public.mission_control_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_automation_rule_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_automation_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_automation_test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_automation_activity_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.mission_control_automation_rules FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_automation_rule_versions FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_automation_previews FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_automation_test_runs FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_automation_activity_logs FROM anon, authenticated;

GRANT ALL ON TABLE public.mission_control_automation_rules TO service_role;
GRANT ALL ON TABLE public.mission_control_automation_rule_versions TO service_role;
GRANT ALL ON TABLE public.mission_control_automation_previews TO service_role;
GRANT ALL ON TABLE public.mission_control_automation_test_runs TO service_role;
GRANT ALL ON TABLE public.mission_control_automation_activity_logs TO service_role;
