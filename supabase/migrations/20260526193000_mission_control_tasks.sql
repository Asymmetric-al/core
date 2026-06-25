-- Shared Mission Control tasks and contribution Needs Attention.

CREATE TABLE IF NOT EXISTS public.mission_control_queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, key)
);

CREATE TABLE IF NOT EXISTS public.mission_control_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'completed', 'dismissed', 'suppressed')),
    urgency TEXT NOT NULL DEFAULT 'normal'
        CHECK (urgency IN ('normal', 'high', 'critical')),
    queue_id UUID REFERENCES public.mission_control_queues(id) ON DELETE SET NULL,
    assignee_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    source_module TEXT NOT NULL,
    issue_type TEXT NOT NULL,
    created_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by_kind TEXT NOT NULL DEFAULT 'system' CHECK (created_by_kind IN ('human', 'system')),
    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    dismissed_reason TEXT,
    suppressed_at TIMESTAMPTZ,
    suppressed_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mission_control_task_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.mission_control_tasks(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL,
    record_id TEXT NOT NULL,
    relationship TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mission_control_task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.mission_control_tasks(id) ON DELETE CASCADE,
    author_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mission_control_task_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.mission_control_tasks(id) ON DELETE CASCADE,
    remind_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mission_control_task_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.mission_control_tasks(id) ON DELETE CASCADE,
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mission_control_attention_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    dedupe_key TEXT NOT NULL,
    issue_type TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'normal'
        CHECK (urgency IN ('normal', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'resolved', 'dismissed', 'suppressed')),
    task_id UUID REFERENCES public.mission_control_tasks(id) ON DELETE SET NULL,
    summary TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    suppressed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, dedupe_key)
);

CREATE INDEX IF NOT EXISTS idx_mission_control_tasks_tenant_status
    ON public.mission_control_tasks (tenant_id, status, urgency, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_mission_control_task_links_task
    ON public.mission_control_task_links (task_id);

CREATE INDEX IF NOT EXISTS idx_mission_control_attention_tenant_status
    ON public.mission_control_attention_items (tenant_id, status, urgency, last_seen_at DESC);

ALTER TABLE public.mission_control_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_task_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_task_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_attention_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.mission_control_queues FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_tasks FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_task_links FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_task_comments FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_task_reminders FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_task_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_attention_items FROM anon, authenticated;

GRANT ALL ON TABLE public.mission_control_queues TO service_role;
GRANT ALL ON TABLE public.mission_control_tasks TO service_role;
GRANT ALL ON TABLE public.mission_control_task_links TO service_role;
GRANT ALL ON TABLE public.mission_control_task_comments TO service_role;
GRANT ALL ON TABLE public.mission_control_task_reminders TO service_role;
GRANT ALL ON TABLE public.mission_control_task_events TO service_role;
GRANT ALL ON TABLE public.mission_control_attention_items TO service_role;
