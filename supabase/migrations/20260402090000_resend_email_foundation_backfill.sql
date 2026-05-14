-- Backfill Resend foundation tables for hosted databases that already recorded
-- migration version 20260223120000 from add_user_post_interactions_rpc.sql.
-- The original resend_email_foundation migration shares that timestamp, so
-- Supabase hosted db push cannot apply both files by migration version.

CREATE TABLE IF NOT EXISTS public.tenant_email_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
    is_connected BOOLEAN NOT NULL DEFAULT FALSE,
    connection_verified_at TIMESTAMPTZ,
    last_error TEXT,
    default_from_email TEXT,
    default_from_name TEXT,
    reply_to_email TEXT,
    resend_api_key_encrypted TEXT,
    resend_api_key_hint TEXT,
    webhook_url TEXT,
    webhook_signing_secret_hint TEXT,
    domain_authenticated BOOLEAN NOT NULL DEFAULT FALSE,
    dkim_verified BOOLEAN NOT NULL DEFAULT FALSE,
    spf_verified BOOLEAN NOT NULL DEFAULT FALSE,
    dmarc_policy TEXT,
    deliverability_score INTEGER,
    daily_send_limit INTEGER NOT NULL DEFAULT 10000 CHECK (daily_send_limit > 0),
    sends_today INTEGER NOT NULL DEFAULT 0 CHECK (sends_today >= 0),
    limit_reset_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT tenant_email_settings_dmarc_policy_check
        CHECK (dmarc_policy IS NULL OR dmarc_policy IN ('none', 'quarantine', 'reject')),
    CONSTRAINT tenant_email_settings_deliverability_score_check
        CHECK (deliverability_score IS NULL OR (deliverability_score >= 0 AND deliverability_score <= 100))
);

CREATE TABLE IF NOT EXISTS public.email_send_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    idempotency_key TEXT NOT NULL,
    correlation_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    resend_message_id TEXT,
    recipient_count INTEGER NOT NULL DEFAULT 1 CHECK (recipient_count > 0),
    message_type TEXT NOT NULL DEFAULT 'transactional',
    template_id TEXT,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    error_code TEXT,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT email_send_logs_tenant_idempotency_unique
        UNIQUE (tenant_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS public.email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    resend_event_id TEXT,
    resend_message_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    bounce_type TEXT,
    bounce_reason TEXT,
    click_url TEXT,
    user_agent TEXT,
    ip_address TEXT,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    raw_event JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_suppression_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT email_suppression_groups_tenant_name_unique
        UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS public.email_suppressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    suppression_type TEXT NOT NULL,
    group_id UUID REFERENCES public.email_suppression_groups(id) ON DELETE SET NULL,
    reason TEXT,
    source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_inbound_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    resend_email_id TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'email.received',
    from_email TEXT NOT NULL,
    subject TEXT,
    to_recipients TEXT[] NOT NULL DEFAULT '{}',
    cc_recipients TEXT[] NOT NULL DEFAULT '{}',
    bcc_recipients TEXT[] NOT NULL DEFAULT '{}',
    attachment_count INTEGER NOT NULL DEFAULT 0 CHECK (attachment_count >= 0),
    received_at TIMESTAMPTZ,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    parsed_text TEXT,
    parsed_html TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenant_email_settings_tenant_id
    ON public.tenant_email_settings (tenant_id);

CREATE INDEX IF NOT EXISTS idx_tenant_email_settings_is_connected
    ON public.tenant_email_settings (is_connected);

CREATE INDEX IF NOT EXISTS idx_email_send_logs_tenant_status_requested_at
    ON public.email_send_logs (tenant_id, status, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_send_logs_tenant_correlation_id
    ON public.email_send_logs (tenant_id, correlation_id);

CREATE INDEX IF NOT EXISTS idx_email_send_logs_tenant_message_id
    ON public.email_send_logs (tenant_id, resend_message_id);

CREATE INDEX IF NOT EXISTS idx_email_events_tenant_event_type_occurred_at
    ON public.email_events (tenant_id, event_type, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_events_tenant_message_id
    ON public.email_events (tenant_id, resend_message_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_events_tenant_resend_event_id
    ON public.email_events (tenant_id, resend_event_id)
    WHERE resend_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_suppressions_tenant_email
    ON public.email_suppressions (tenant_id, email);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_suppressions_tenant_email_type
    ON public.email_suppressions (tenant_id, email, suppression_type);

CREATE INDEX IF NOT EXISTS idx_email_inbound_messages_tenant_received_at
    ON public.email_inbound_messages (tenant_id, received_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_inbound_messages_tenant_resend_email_id
    ON public.email_inbound_messages (tenant_id, resend_email_id)
    WHERE tenant_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_inbound_messages_resend_email_id
    ON public.email_inbound_messages (resend_email_id);

ALTER TABLE public.tenant_email_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_send_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suppression_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suppressions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_inbound_messages DISABLE ROW LEVEL SECURITY;
