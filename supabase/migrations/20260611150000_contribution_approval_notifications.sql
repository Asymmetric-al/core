-- Approval tasks, notifications, and SLA tracking for correction requests
-- (ADR-CD-026 / ADR-CD-027 / ADR-CD-028).

CREATE TABLE IF NOT EXISTS public.contribution_approval_notification_settings (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    create_approval_task BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contribution_approval_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, profile_id)
);

-- Idempotent, deduplicated delivery records for approval workflow
-- notifications (approval requested, reminders, escalations, outcomes).
CREATE TABLE IF NOT EXISTS public.contribution_approval_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    correction_request_id UUID NOT NULL REFERENCES public.contribution_correction_requests(id) ON DELETE CASCADE,
    recipient_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email')),
    kind TEXT NOT NULL
        CHECK (kind IN ('approval_requested', 'reminder', 'escalation', 'outcome')),
    dedupe_key TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, dedupe_key)
);

CREATE INDEX IF NOT EXISTS idx_contribution_approval_notifications_request
    ON public.contribution_approval_notifications (tenant_id, correction_request_id, created_at DESC);

ALTER TABLE public.contribution_correction_requests
    ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ;

ALTER TABLE public.contribution_approval_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_approval_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_approval_notifications ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.contribution_approval_notification_settings FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_approval_notification_preferences FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_approval_notifications FROM anon, authenticated;

GRANT ALL ON TABLE public.contribution_approval_notification_settings TO service_role;
GRANT ALL ON TABLE public.contribution_approval_notification_preferences TO service_role;
GRANT ALL ON TABLE public.contribution_approval_notifications TO service_role;
