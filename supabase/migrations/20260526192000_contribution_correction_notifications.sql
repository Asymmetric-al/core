-- Email Studio donor correction notification support for contribution operations.

CREATE TABLE IF NOT EXISTS public.email_template_system_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.email_templates(id) ON DELETE CASCADE,
    family_key TEXT NOT NULL,
    variant_key TEXT NOT NULL,
    required_merge_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, family_key, variant_key)
);

CREATE TABLE IF NOT EXISTS public.contribution_notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'staff_chooses'
        CHECK (mode IN ('auto_notify', 'always_ask', 'staff_chooses')),
    suppression_reason_required BOOLEAN NOT NULL DEFAULT FALSE,
    task_assignment_mode TEXT NOT NULL DEFAULT 'actor_and_queue'
        CHECK (task_assignment_mode IN ('actor_only', 'queue_only', 'actor_and_queue')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, action_type)
);

CREATE TABLE IF NOT EXISTS public.contribution_notification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    operation_audit_event_id UUID REFERENCES public.contribution_operation_audit_events(id) ON DELETE SET NULL,
    correction_id UUID REFERENCES public.contribution_corrections(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
    template_version_id UUID REFERENCES public.email_template_versions(id) ON DELETE SET NULL,
    template_family TEXT,
    template_variant TEXT,
    template_version INTEGER,
    decision TEXT NOT NULL
        CHECK (decision IN ('sent', 'suppressed', 'blocked', 'failed', 'not_required')),
    policy_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    suppression_reason TEXT,
    personal_note_present BOOLEAN NOT NULL DEFAULT FALSE,
    recipient_donor_id UUID REFERENCES public.donors(id) ON DELETE SET NULL,
    recipient_email TEXT,
    email_send_log_id UUID REFERENCES public.email_send_logs(id) ON DELETE SET NULL,
    provider_status TEXT,
    provider_message_id TEXT,
    error_code TEXT,
    error_message TEXT,
    task_ids UUID[] NOT NULL DEFAULT '{}'::uuid[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_email_template_system_bindings_tenant_family
    ON public.email_template_system_bindings (tenant_id, family_key, variant_key);

CREATE INDEX IF NOT EXISTS idx_contribution_notification_settings_tenant_action
    ON public.contribution_notification_settings (tenant_id, action_type);

CREATE INDEX IF NOT EXISTS idx_contribution_notification_events_tenant_audit
    ON public.contribution_notification_events (tenant_id, operation_audit_event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_notification_events_recipient
    ON public.contribution_notification_events (tenant_id, recipient_donor_id, created_at DESC);

ALTER TABLE public.email_template_system_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_notification_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.email_template_system_bindings FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_notification_settings FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_notification_events FROM anon, authenticated;

GRANT ALL ON TABLE public.email_template_system_bindings TO service_role;
GRANT ALL ON TABLE public.contribution_notification_settings TO service_role;
GRANT ALL ON TABLE public.contribution_notification_events TO service_role;
