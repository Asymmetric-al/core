-- Supabase Schema for Asymmetric.al
-- Canonical schema for the hosted Supabase project

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- TABLES
-- ==========================================

-- 1. Tenants (Organizations)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    org_post_visibility TEXT DEFAULT 'all_donors',
    org_settings JSONB DEFAULT '{}'::jsonb,
    stripe_secret_key TEXT,
    stripe_publishable_key TEXT,
    stripe_webhook_secret TEXT,
    billing_email TEXT,
    default_timezone TEXT NOT NULL DEFAULT 'UTC',
    locale TEXT NOT NULL DEFAULT 'en-US',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles (Unified User Table)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID UNIQUE, -- Redundant but used in some queries
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    display_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'donor' CHECK (role IN ('admin', 'staff', 'super_admin', 'missionary', 'donor', 'finance', 'fundraising', 'mobilizers', 'member_care', 'events', 'delivery', 'ticketing', 'machinery')),
    tenant_id UUID REFERENCES public.tenants(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Missionaries
CREATE TABLE IF NOT EXISTS public.missionaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio TEXT,
    mission_field TEXT,
    funding_goal BIGINT DEFAULT 0,
    current_funding BIGINT DEFAULT 0,
    tagline TEXT,
    location TEXT,
    phone TEXT,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    region TEXT NOT NULL DEFAULT 'North America',
    health_status TEXT NOT NULL DEFAULT 'healthy',
    last_check_in TIMESTAMPTZ,
    manual_attention BOOLEAN NOT NULL DEFAULT FALSE,
    health_signals JSONB NOT NULL DEFAULT '{"emotional":50,"spiritual":50,"physical":50,"financial":50}'::jsonb,
    birth_date DATE,
    cover_url TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'missionaries_health_status_check'
      AND conrelid = 'public.missionaries'::regclass
  ) THEN
    ALTER TABLE public.missionaries
      ADD CONSTRAINT missionaries_health_status_check
      CHECK (health_status IN ('healthy', 'needs_attention', 'at_risk', 'crisis'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'missionaries_region_check'
      AND conrelid = 'public.missionaries'::regclass
  ) THEN
    ALTER TABLE public.missionaries
      ADD CONSTRAINT missionaries_region_check
      CHECK (region IN (
        'Africa',
        'SE Asia',
        'Europe',
        'Latin America',
        'Middle East',
        'North America'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'missionaries_health_signals_object_check'
      AND conrelid = 'public.missionaries'::regclass
  ) THEN
    ALTER TABLE public.missionaries
      ADD CONSTRAINT missionaries_health_signals_object_check
      CHECK (jsonb_typeof(health_signals) = 'object');
  END IF;
END $$;

-- 4. Donors
CREATE TABLE IF NOT EXISTS public.donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    profile_id UUID REFERENCES public.profiles(id),
    missionary_id UUID REFERENCES public.profiles(id), -- The missionary this donor is primarily associated with
    name TEXT,
    email TEXT,
    phone TEXT,
    mobile TEXT,
    work_phone TEXT,
    preferred_contact TEXT DEFAULT 'email',
    avatar_url TEXT,
    location TEXT,
    type TEXT DEFAULT 'individual',
    status TEXT DEFAULT 'active',
    giving_preferences JSONB DEFAULT '{}'::jsonb,
    total_given BIGINT DEFAULT 0 CHECK (total_given >= 0),
    first_gift_date DATE,
    last_gift_date TIMESTAMPTZ,
    last_gift_amount BIGINT DEFAULT 0 CHECK (last_gift_amount IS NULL OR last_gift_amount >= 0),
    gift_count INTEGER NOT NULL DEFAULT 0,
    frequency TEXT,
    joined_date DATE DEFAULT CURRENT_DATE,
    tags TEXT[],
    score NUMERIC DEFAULT 0,
    address JSONB,
    work_address JSONB,
    website TEXT,
    organization TEXT,
    title TEXT,
    birthday DATE,
    anniversary DATE,
    spouse TEXT,
    notes TEXT,
    do_not_contact BOOLEAN NOT NULL DEFAULT FALSE,
    do_not_email BOOLEAN NOT NULL DEFAULT FALSE,
    receipt_email_frequency TEXT NOT NULL DEFAULT 'monthly',
    default_update_frequency TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'en',
    has_active_pledge BOOLEAN DEFAULT FALSE,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Funds (Projects / Designated Funds)
CREATE TABLE IF NOT EXISTS public.funds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    name TEXT NOT NULL,
    description TEXT,
    target_amount BIGINT NOT NULL DEFAULT 0 CHECK (target_amount >= 0),
    goal_amount BIGINT NOT NULL DEFAULT 0 CHECK (goal_amount >= 0),
    current_amount BIGINT NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    currency TEXT DEFAULT 'usd',
    missionary_id UUID REFERENCES public.missionaries(id),
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Posts (Updates from Missionaries or Org)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    missionary_id UUID REFERENCES public.profiles(id),
    title TEXT,
    content TEXT,
    media JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    post_type TEXT DEFAULT 'Update',
    type TEXT DEFAULT 'missionary_update', -- 'org_update', 'missionary_update'
    visibility TEXT DEFAULT 'public', -- 'public', 'partners_only'
    status TEXT DEFAULT 'published',
    like_count INTEGER DEFAULT 0,
    prayer_count INTEGER DEFAULT 0,
    fires_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Interactions
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_prayers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_fires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    parent_id UUID REFERENCES public.post_comments(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    story TEXT,
    channel TEXT NOT NULL DEFAULT 'email',
    status TEXT NOT NULL DEFAULT 'active',
    audience_filter JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    goal_amount BIGINT NOT NULL DEFAULT 0,
    current_amount BIGINT NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    share_url TEXT,
    slug TEXT UNIQUE,
    creator_donor_id UUID NOT NULL REFERENCES public.donors(id),
    missionary_id UUID NOT NULL REFERENCES public.missionaries(id),
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_goal CHECK (goal_amount >= 0),
    CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date > start_date),
    CONSTRAINT campaigns_share_url_unique UNIQUE (share_url)
);

-- 8b. Tenant Email Settings (Resend integration)
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
    validation_snapshot JSONB,
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

-- 8c. Email Send Logs (idempotency + provider outcomes)
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
    template_version_id UUID,
    template_builder TEXT,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    error_code TEXT,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT email_send_logs_tenant_idempotency_unique
        UNIQUE (tenant_id, idempotency_key),
    CONSTRAINT email_send_logs_template_builder_check
        CHECK (template_builder IS NULL OR template_builder IN ('unlayer', 'react_email'))
);

-- 8d. Email Templates (provider-neutral React Email + legacy Unlayer storage)
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
    mode TEXT NOT NULL DEFAULT 'staff_chooses' CHECK (mode IN ('auto_notify', 'always_ask', 'staff_chooses')),
    suppression_reason_required BOOLEAN NOT NULL DEFAULT FALSE,
    task_assignment_mode TEXT NOT NULL DEFAULT 'actor_and_queue' CHECK (task_assignment_mode IN ('actor_only', 'queue_only', 'actor_and_queue')),
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
    decision TEXT NOT NULL CHECK (decision IN ('sent', 'suppressed', 'blocked', 'failed', 'not_required')),
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
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'dismissed', 'suppressed')),
    urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'high', 'critical')),
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
    urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed', 'suppressed')),
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

CREATE TABLE IF NOT EXISTS public.contribution_operation_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    operation TEXT NOT NULL,
    risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'high')),
    source_surface TEXT NOT NULL DEFAULT 'contribution_hub',
    selection_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    preview_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    preview_skipped BOOLEAN NOT NULL DEFAULT FALSE,
    confirmation_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'complete', 'complete_with_issues', 'failed', 'cancelled')),
    execution_mode TEXT NOT NULL DEFAULT 'immediate' CHECK (execution_mode IN ('immediate', 'background')),
    total_count INTEGER NOT NULL DEFAULT 0,
    processed_count INTEGER NOT NULL DEFAULT 0,
    succeeded_count INTEGER NOT NULL DEFAULT 0,
    skipped_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    follow_up_task_count INTEGER NOT NULL DEFAULT 0,
    created_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    activity_audit_event_id UUID REFERENCES public.contribution_operation_audit_events(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.contribution_operation_batch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.contribution_operation_batches(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    record_index INTEGER NOT NULL DEFAULT 0,
    resource_type TEXT NOT NULL DEFAULT 'donation',
    resource_id UUID,
    donation_id UUID REFERENCES public.donations(id) ON DELETE SET NULL,
    staged_gift_id UUID,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'succeeded', 'skipped', 'failed')),
    skip_reason TEXT,
    error_code TEXT,
    error_message TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB NOT NULL DEFAULT '{}'::jsonb,
    operation_audit_event_id UUID REFERENCES public.contribution_operation_audit_events(id) ON DELETE SET NULL,
    task_id UUID REFERENCES public.mission_control_tasks(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_send_logs
    ADD CONSTRAINT email_send_logs_template_version_id_fkey
    FOREIGN KEY (template_version_id)
    REFERENCES public.email_template_versions(id)
    ON DELETE SET NULL;

-- 8e. Email Events (provider webhook stream)
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

-- 8e. Email Suppressions
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

-- 8f. Inbound Email Metadata
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

-- 9. Donations
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    donor_id UUID REFERENCES public.donors(id),
    missionary_id UUID REFERENCES public.missionaries(id),
    fund_id UUID REFERENCES public.funds(id),
    amount BIGINT NOT NULL DEFAULT 0 CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT DEFAULT 'pending',
    donation_type TEXT DEFAULT 'one_time',
    payment_method TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_interval TEXT,
    notes TEXT,
    stripe_payment_intent_id TEXT,
    gift_date DATE NOT NULL DEFAULT CURRENT_DATE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    pledge_id UUID,
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    error_code TEXT,
    error_message TEXT,
    stripe_charge_id TEXT,
    refunded_at TIMESTAMPTZ,
    refund_amount BIGINT NOT NULL DEFAULT 0 CHECK (refund_amount >= 0),
    source TEXT DEFAULT 'direct',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contribution_operation_prompt_settings (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    default_reason_mode TEXT NOT NULL DEFAULT 'optional' CHECK (default_reason_mode IN ('optional', 'required')),
    allow_user_reason_prompt_reduction BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.contribution_operation_user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reduce_reason_prompts BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.contribution_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
    staged_gift_id UUID,
    correction_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('pending', 'applied', 'failed', 'voided')),
    reason TEXT NOT NULL,
    source_surface TEXT NOT NULL CHECK (source_surface IN ('contribution_hub', 'donor_crm_record', 'automation', 'bulk_action', 'api')),
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    before_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    after_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    provider_outcome JSONB NOT NULL DEFAULT '{}'::jsonb,
    donor_visible_effect JSONB NOT NULL DEFAULT '{}'::jsonb,
    receipt_effect JSONB NOT NULL DEFAULT '{}'::jsonb,
    statement_effect JSONB NOT NULL DEFAULT '{}'::jsonb,
    audit_event_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    applied_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ
);

-- Contribution adjustment records (ADR-CD-004). Corrections never rewrite the
-- original donation row; effective values derive from original + adjustments.
CREATE TABLE IF NOT EXISTS public.contribution_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
    correction_id UUID REFERENCES public.contribution_corrections(id) ON DELETE SET NULL,
    adjustment_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'reversed')),
    effective_values JSONB NOT NULL DEFAULT '{}'::jsonb,
    reason TEXT NOT NULL,
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    source_surface TEXT NOT NULL CHECK (source_surface IN ('contribution_hub', 'donor_crm_record', 'automation', 'bulk_action', 'api')),
    base_revision TEXT,
    idempotency_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_contribution_adjustments_idempotency
    ON public.contribution_adjustments (tenant_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contribution_adjustments_tenant_donation
    ON public.contribution_adjustments (tenant_id, donation_id, created_at);

-- Tenant correction approval policy (ADR-CD-005 / ADR-CD-025).
CREATE TABLE IF NOT EXISTS public.contribution_approval_policies (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    ownership_mode TEXT NOT NULL DEFAULT 'separation_of_duties'
        CHECK (ownership_mode IN ('no_approval_required', 'one_approver', 'separation_of_duties')),
    suppressed_gates TEXT[] NOT NULL DEFAULT '{}'::text[],
    stronger_approval_categories TEXT[] NOT NULL DEFAULT '{}'::text[],
    reminder_hours INTEGER NOT NULL DEFAULT 24 CHECK (reminder_hours > 0),
    escalation_hours INTEGER CHECK (escalation_hours > 0),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pending high-risk correction requests (ADR-CD-005 / ADR-CD-027).
CREATE TABLE IF NOT EXISTS public.contribution_correction_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    reason TEXT NOT NULL,
    requested_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    source_surface TEXT NOT NULL CHECK (source_surface IN ('contribution_hub', 'donor_crm_record', 'automation', 'bulk_action', 'api')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'superseded')),
    expected_revision TEXT,
    idempotency_key TEXT,
    receipt_delivery_proposal JSONB NOT NULL DEFAULT '{}'::jsonb,
    decided_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    decided_at TIMESTAMPTZ,
    decision_reason TEXT,
    applied_adjustment_id UUID REFERENCES public.contribution_adjustments(id) ON DELETE SET NULL,
    approval_task_id UUID,
    follow_up_task_id UUID,
    last_reminder_at TIMESTAMPTZ,
    escalated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Approval workflow notification settings, preferences, and deduplicated
-- delivery records (ADR-CD-026 / ADR-CD-028).
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

CREATE TABLE IF NOT EXISTS public.contribution_approval_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    correction_request_id UUID NOT NULL REFERENCES public.contribution_correction_requests(id) ON DELETE CASCADE,
    recipient_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email')),
    kind TEXT NOT NULL CHECK (kind IN ('approval_requested', 'reminder', 'escalation', 'outcome')),
    dedupe_key TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, dedupe_key)
);

CREATE INDEX IF NOT EXISTS idx_contribution_approval_notifications_request
    ON public.contribution_approval_notifications (tenant_id, correction_request_id, created_at DESC);

-- Updated receipt delivery policy and receipt content snapshots
-- (ADR-CD-013 / ADR-CD-029 / ADR-CD-031).
CREATE TABLE IF NOT EXISTS public.contribution_receipt_delivery_policies (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    default_choice TEXT NOT NULL DEFAULT 'email' CHECK (default_choice IN ('email', 'pdf', 'defer')),
    allow_defer BOOLEAN NOT NULL DEFAULT TRUE,
    defer_reason_required BOOLEAN NOT NULL DEFAULT TRUE,
    require_delivery_action BOOLEAN NOT NULL DEFAULT FALSE,
    email_capability TEXT NOT NULL DEFAULT 'contributions.manage_receipts',
    pdf_capability TEXT NOT NULL DEFAULT 'contributions.manage_receipts',
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contribution_receipt_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
    adjustment_id UUID REFERENCES public.contribution_adjustments(id) ON DELETE SET NULL,
    kind TEXT NOT NULL CHECK (kind IN ('email', 'pdf')),
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contribution_receipt_snapshots_tenant_donation
    ON public.contribution_receipt_snapshots (tenant_id, donation_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_contribution_correction_requests_idempotency
    ON public.contribution_correction_requests (tenant_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contribution_correction_requests_tenant_donation
    ON public.contribution_correction_requests (tenant_id, donation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_correction_requests_pending
    ON public.contribution_correction_requests (tenant_id, status, created_at)
    WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS public.contribution_operation_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE,
    staged_gift_id UUID,
    donor_id UUID REFERENCES public.donors(id) ON DELETE SET NULL,
    correction_id UUID REFERENCES public.contribution_corrections(id) ON DELETE SET NULL,
    operation TEXT NOT NULL,
    resource_type TEXT NOT NULL DEFAULT 'donation',
    resource_id UUID,
    source_surface TEXT NOT NULL CHECK (source_surface IN ('contribution_hub', 'donor_crm_record', 'automation', 'bulk_action', 'api')),
    reason TEXT,
    confirmation_label TEXT,
    policy_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    before_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    after_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    provider_outcome JSONB NOT NULL DEFAULT '{}'::jsonb,
    downstream_effects JSONB NOT NULL DEFAULT '{}'::jsonb,
    related_task_ids UUID[] NOT NULL DEFAULT '{}'::uuid[],
    related_batch_id UUID,
    correlation_id UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Follows (Donors following missionaries)
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    donor_id UUID REFERENCES public.donors(id),
    missionary_id UUID REFERENCES public.profiles(id),
    status TEXT NOT NULL DEFAULT 'approved',
    is_donor BOOLEAN NOT NULL DEFAULT FALSE,
    approved_at TIMESTAMPTZ,
    notification_frequency TEXT,
    muted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(donor_id, missionary_id)
);

-- 11. Notification Queue
CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    donor_id UUID REFERENCES public.donors(id) ON DELETE SET NULL,
    recipient_donor_id UUID NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notification_type TEXT NOT NULL DEFAULT 'campaign_update',
    channel TEXT NOT NULL DEFAULT 'email',
    template_key TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    dedupe_key TEXT,
    status TEXT NOT NULL DEFAULT 'queued',
    attempts INTEGER NOT NULL DEFAULT 0,
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Donor Feed Preferences
CREATE TABLE IF NOT EXISTS public.donor_feed_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID REFERENCES public.donors(id),
    tenant_id UUID REFERENCES public.tenants(id),
    show_org_posts BOOLEAN DEFAULT TRUE,
    show_missionary_posts BOOLEAN DEFAULT TRUE,
    follow_org BOOLEAN DEFAULT TRUE,
    email_org_posts BOOLEAN DEFAULT FALSE,
    email_missionary_posts BOOLEAN DEFAULT FALSE,
    push_org_posts BOOLEAN DEFAULT FALSE,
    push_missionary_posts BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(donor_id, tenant_id)
);

-- 13. Donor Activities
CREATE TABLE IF NOT EXISTS public.donor_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID REFERENCES public.donors(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ,
    amount BIGINT DEFAULT 0 CHECK (amount IS NULL OR amount >= 0),
    status TEXT,
    gift_type TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Donor Pledges
CREATE TABLE IF NOT EXISTS public.donor_pledges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    donor_id UUID REFERENCES public.donors(id),
    missionary_id UUID REFERENCES public.missionaries(id) ON DELETE SET NULL,
    fund_id UUID REFERENCES public.funds(id) ON DELETE SET NULL,
    amount BIGINT NOT NULL DEFAULT 0 CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'usd',
    frequency TEXT,
    status TEXT DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    next_payment_date DATE,
    stripe_subscription_id TEXT,
    billing_day_of_month INTEGER,
    billing_timezone TEXT,
    stripe_payment_method_id TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_charge_at TIMESTAMPTZ,
    last_charge_attempt TIMESTAMPTZ,
    failed_charge_count INTEGER NOT NULL DEFAULT 0,
    pause_reason TEXT,
    paused_at TIMESTAMPTZ,
    next_charge_at TIMESTAMPTZ,
    total_paid BIGINT NOT NULL DEFAULT 0 CHECK (total_paid >= 0),
    total_expected BIGINT NOT NULL DEFAULT 0 CHECK (total_expected >= 0),
    payments_completed INTEGER DEFAULT 0,
    payments_remaining INTEGER DEFAULT 0,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'donations_pledge_id_fkey'
  ) THEN
    ALTER TABLE public.donations
    ADD CONSTRAINT donations_pledge_id_fkey
    FOREIGN KEY (pledge_id) REFERENCES public.donor_pledges(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 15. Pledge Charge Attempts
CREATE TABLE IF NOT EXISTS public.pledge_charge_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    pledge_id UUID NOT NULL REFERENCES public.donor_pledges(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES public.donors(id) ON DELETE SET NULL,
    donation_id UUID REFERENCES public.donations(id) ON DELETE SET NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'created',
    amount BIGINT NOT NULL DEFAULT 0 CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'usd',
    scheduled_for_date DATE NOT NULL,
    stripe_payment_intent_id TEXT,
    gateway_response JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_code TEXT,
    error_message TEXT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Follower Requests
CREATE TABLE IF NOT EXISTS public.follower_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID REFERENCES public.donors(id),
    missionary_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'pending',
    access_level TEXT DEFAULT 'view',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    UNIQUE(donor_id, missionary_id)
);

-- 17. Locations
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    title TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    type TEXT DEFAULT 'custom',
    linked_id TEXT,
    summary TEXT,
    image_public_id TEXT,
    status TEXT DEFAULT 'draft',
    sort_key INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Missionary Tasks
CREATE TABLE IF NOT EXISTS public.missionary_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    missionary_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES public.donors(id),
    title VARCHAR NOT NULL,
    description TEXT,
    task_type VARCHAR,
    status VARCHAR DEFAULT 'pending',
    priority VARCHAR DEFAULT 'medium',
    sort_key INTEGER DEFAULT 0,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18b. Member Care activities, goals, requirements, and private notes
CREATE TABLE IF NOT EXISTS public.member_care_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    missionary_id UUID NOT NULL REFERENCES public.missionaries(id) ON DELETE CASCADE,
    author_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    author_name_snapshot TEXT,
    type TEXT NOT NULL,
    title TEXT,
    description TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT member_care_activities_type_check CHECK (
      type IN (
        'video_call',
        'in_person_visit',
        'check_in',
        'pastoral_note',
        'care_plan_update',
        'crisis_intervention',
        'birthday',
        'prayer_request'
      )
    )
);

CREATE TABLE IF NOT EXISTS public.member_care_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    missionary_id UUID NOT NULL REFERENCES public.missionaries(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    target_date DATE,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT member_care_goals_status_check CHECK (status IN ('pending', 'active', 'completed'))
);

CREATE TABLE IF NOT EXISTS public.member_care_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    missionary_id UUID NOT NULL REFERENCES public.missionaries(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    interval_days INTEGER NOT NULL CHECK (interval_days > 0),
    notes TEXT,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT member_care_requirements_activity_type_check CHECK (
      activity_type IN (
        'video_call',
        'in_person_visit',
        'check_in',
        'pastoral_note',
        'care_plan_update',
        'crisis_intervention',
        'birthday',
        'prayer_request'
      )
    )
);

CREATE TABLE IF NOT EXISTS public.member_care_private_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    missionary_id UUID NOT NULL REFERENCES public.missionaries(id) ON DELETE CASCADE,
    author_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    author_name_snapshot TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. PDF Templates
CREATE TABLE IF NOT EXISTS public.pdf_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    name TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    design JSONB NOT NULL,
    html TEXT,
    category TEXT DEFAULT 'custom',
    page_size TEXT DEFAULT 'Letter',
    orientation TEXT DEFAULT 'portrait',
    margins JSONB DEFAULT '{"top":72,"right":72,"bottom":72,"left":72}'::jsonb,
    tags TEXT[] DEFAULT '{}'::text[],
    status TEXT DEFAULT 'draft',
    is_default BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    user_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Assets
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_id TEXT NOT NULL,
    secure_url TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    format TEXT,
    resource_type TEXT DEFAULT 'image',
    purpose TEXT,
    user_id UUID,
    tenant_id UUID REFERENCES public.tenants(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- BACKFILLS
-- ==========================================

UPDATE public.donations
SET gift_date = COALESCE(gift_date, created_at::date, CURRENT_DATE)
WHERE gift_date IS NULL;

UPDATE public.donations
SET refund_amount = COALESCE(refund_amount, 0)
WHERE refund_amount IS NULL;

UPDATE public.donations
SET source = COALESCE(source, donation_type, 'direct')
WHERE source IS NULL;

UPDATE public.donor_pledges dp
SET tenant_id = d.tenant_id
FROM public.donors d
WHERE dp.tenant_id IS NULL
  AND dp.donor_id = d.id;

UPDATE public.donor_pledges
SET next_charge_at = next_payment_date::timestamptz
WHERE next_charge_at IS NULL
  AND next_payment_date IS NOT NULL;

UPDATE public.donor_pledges
SET failed_charge_count = COALESCE(failed_charge_count, 0)
WHERE failed_charge_count IS NULL;

UPDATE public.donors d
SET
    first_gift_date = x.first_gift_date,
    last_gift_date = x.last_gift_ts,
    gift_count = x.gift_count
FROM (
    SELECT
        donor_id,
        MIN(gift_date)::date AS first_gift_date,
        MAX(gift_date)::timestamptz AS last_gift_ts,
        COUNT(*)::integer AS gift_count
    FROM public.donations
    WHERE donor_id IS NOT NULL
    GROUP BY donor_id
) x
WHERE d.id = x.donor_id;

UPDATE public.donors
SET receipt_email_frequency = COALESCE(receipt_email_frequency, 'monthly'),
    preferred_language = COALESCE(preferred_language, 'en')
WHERE receipt_email_frequency IS NULL
   OR preferred_language IS NULL;

UPDATE public.follows f
SET
    approved_at = COALESCE(f.approved_at, f.created_at),
    is_donor = EXISTS (
        SELECT 1
        FROM public.donors d
        WHERE d.id = f.donor_id
          AND COALESCE(d.total_given, 0) > 0
    )
WHERE f.approved_at IS NULL
   OR f.is_donor IS DISTINCT FROM EXISTS (
        SELECT 1
        FROM public.donors d
        WHERE d.id = f.donor_id
          AND COALESCE(d.total_given, 0) > 0
    );

UPDATE public.follows
SET muted = COALESCE(muted, FALSE)
WHERE muted IS NULL;

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_donations_tenant_gift_date
    ON public.donations (tenant_id, gift_date DESC);

CREATE INDEX IF NOT EXISTS idx_posts_missionary_created_at
    ON public.posts (missionary_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_visibility_status
    ON public.posts (visibility, status);

CREATE INDEX IF NOT EXISTS idx_donations_donor_gift_date
    ON public.donations (donor_id, gift_date DESC);

CREATE INDEX IF NOT EXISTS idx_donations_missionary_gift_date
    ON public.donations (missionary_id, gift_date DESC);

CREATE INDEX IF NOT EXISTS idx_donations_pledge_id
    ON public.donations (pledge_id);

CREATE INDEX IF NOT EXISTS idx_donations_status_completed
    ON public.donations (status)
    WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_donations_campaign_id
    ON public.donations (campaign_id);

CREATE INDEX IF NOT EXISTS idx_donations_tenant_year_gift
    ON public.donations (tenant_id, DATE_TRUNC('year', gift_date::timestamp));

CREATE INDEX IF NOT EXISTS idx_donations_donor_year_gift
    ON public.donations (donor_id, DATE_TRUNC('year', gift_date::timestamp));

CREATE INDEX IF NOT EXISTS idx_donations_tenant_amount_id
    ON public.donations (tenant_id, amount DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_corrections_tenant_donation
    ON public.contribution_corrections (tenant_id, donation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_corrections_staged_gift
    ON public.contribution_corrections (staged_gift_id)
    WHERE staged_gift_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contribution_operation_audit_tenant_donation
    ON public.contribution_operation_audit_events (tenant_id, donation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_operation_audit_staged_gift
    ON public.contribution_operation_audit_events (staged_gift_id)
    WHERE staged_gift_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contribution_operation_audit_actor
    ON public.contribution_operation_audit_events (tenant_id, actor_profile_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_operation_user_preferences_profile
    ON public.contribution_operation_user_preferences (profile_id);

CREATE INDEX IF NOT EXISTS idx_donors_tenant_status
    ON public.donors (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_donor_pledges_donor_status
    ON public.donor_pledges (donor_id, status);

CREATE INDEX IF NOT EXISTS idx_donor_pledges_tenant_status_next_charge
    ON public.donor_pledges (tenant_id, status, next_charge_at);

CREATE INDEX IF NOT EXISTS idx_donor_pledges_next_payment_active
    ON public.donor_pledges (next_payment_date)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_follows_missionary_status
    ON public.follows (missionary_id, status);

CREATE INDEX IF NOT EXISTS idx_follows_donor_status
    ON public.follows (donor_id, status);

CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_status
    ON public.campaigns (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_scheduled_for
    ON public.campaigns (tenant_id, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_campaigns_creator_donor_id
    ON public.campaigns (creator_donor_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_missionary_id
    ON public.campaigns (missionary_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_slug
    ON public.campaigns (slug);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status_available_at
    ON public.notification_queue (status, available_at);

CREATE INDEX IF NOT EXISTS idx_notification_queue_tenant_status_scheduled
    ON public.notification_queue (tenant_id, status, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_notification_queue_campaign_id
    ON public.notification_queue (campaign_id);

CREATE INDEX IF NOT EXISTS idx_notification_queue_recipient_donor_id
    ON public.notification_queue (recipient_donor_id);

CREATE INDEX IF NOT EXISTS idx_notification_queue_tenant_type_status
    ON public.notification_queue (tenant_id, notification_type, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_queue_tenant_channel_dedupe
    ON public.notification_queue (tenant_id, recipient_donor_id, notification_type, channel, dedupe_key)
    WHERE dedupe_key IS NOT NULL;

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

CREATE INDEX IF NOT EXISTS idx_email_send_logs_template_version_id
    ON public.email_send_logs (template_version_id);

CREATE INDEX IF NOT EXISTS idx_email_templates_tenant_updated_at
    ON public.email_templates (tenant_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_templates_tenant_builder
    ON public.email_templates (tenant_id, builder);

CREATE INDEX IF NOT EXISTS idx_email_templates_tenant_category_active
    ON public.email_templates (tenant_id, category, is_active);

CREATE INDEX IF NOT EXISTS idx_email_template_versions_tenant_template_version
    ON public.email_template_versions (tenant_id, template_id, version DESC);

CREATE INDEX IF NOT EXISTS idx_email_template_system_bindings_tenant_family
    ON public.email_template_system_bindings (tenant_id, family_key, variant_key);

CREATE INDEX IF NOT EXISTS idx_contribution_notification_settings_tenant_action
    ON public.contribution_notification_settings (tenant_id, action_type);

CREATE INDEX IF NOT EXISTS idx_contribution_notification_events_tenant_audit
    ON public.contribution_notification_events (tenant_id, operation_audit_event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_notification_events_recipient
    ON public.contribution_notification_events (tenant_id, recipient_donor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mission_control_tasks_tenant_status
    ON public.mission_control_tasks (tenant_id, status, urgency, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_mission_control_task_links_task
    ON public.mission_control_task_links (task_id);

CREATE INDEX IF NOT EXISTS idx_mission_control_attention_tenant_status
    ON public.mission_control_attention_items (tenant_id, status, urgency, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_mission_control_automation_rules_tenant_status
    ON public.mission_control_automation_rules (tenant_id, activation_status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_mission_control_automation_activity_tenant_rule
    ON public.mission_control_automation_activity_logs (tenant_id, rule_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_batches_tenant_status
    ON public.contribution_operation_batches (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_batch_items_batch
    ON public.contribution_operation_batch_items (batch_id, record_index);

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

CREATE INDEX IF NOT EXISTS idx_pledge_charge_attempts_pledge_attempted_at
    ON public.pledge_charge_attempts (pledge_id, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_pledge_charge_attempts_tenant_status_attempted_at
    ON public.pledge_charge_attempts (tenant_id, status, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_pledge_charge_attempts_tenant_scheduled_status
    ON public.pledge_charge_attempts (tenant_id, scheduled_for_date, status);

CREATE INDEX IF NOT EXISTS idx_pledge_charge_attempts_donation_id
    ON public.pledge_charge_attempts (donation_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pledge_charge_attempts_tenant_pledge_schedule_attempt
    ON public.pledge_charge_attempts (tenant_id, pledge_id, scheduled_for_date, attempt_number);

-- Guardrail for conversion correctness:
-- these columns were migrated from NUMERIC dollars to BIGINT cents, so
-- existing values should be divisible by 100 (whole-dollar source values).
CREATE OR REPLACE FUNCTION public.assert_amount_columns_multiple_of_100()
RETURNS VOID
LANGUAGE plpgsql
AS $function$
DECLARE
    invalid_count BIGINT;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM (
        SELECT amount AS v FROM public.donations WHERE amount IS NOT NULL AND mod(amount, 100) <> 0
        UNION ALL
        SELECT amount AS v FROM public.donor_pledges WHERE amount IS NOT NULL AND mod(amount, 100) <> 0
        UNION ALL
        SELECT total_paid AS v FROM public.donor_pledges WHERE total_paid IS NOT NULL AND mod(total_paid, 100) <> 0
        UNION ALL
        SELECT total_expected AS v FROM public.donor_pledges WHERE total_expected IS NOT NULL AND mod(total_expected, 100) <> 0
        UNION ALL
        SELECT target_amount AS v FROM public.funds WHERE target_amount IS NOT NULL AND mod(target_amount, 100) <> 0
        UNION ALL
        SELECT goal_amount AS v FROM public.funds WHERE goal_amount IS NOT NULL AND mod(goal_amount, 100) <> 0
        UNION ALL
        SELECT current_amount AS v FROM public.funds WHERE current_amount IS NOT NULL AND mod(current_amount, 100) <> 0
        UNION ALL
        SELECT amount AS v FROM public.pledge_charge_attempts WHERE amount IS NOT NULL AND mod(amount, 100) <> 0
        UNION ALL
        SELECT total_given AS v FROM public.donors WHERE total_given IS NOT NULL AND mod(total_given, 100) <> 0
        UNION ALL
        SELECT last_gift_amount AS v FROM public.donors WHERE last_gift_amount IS NOT NULL AND mod(last_gift_amount, 100) <> 0
        UNION ALL
        SELECT amount AS v FROM public.donor_activities WHERE amount IS NOT NULL AND mod(amount, 100) <> 0
        UNION ALL
        SELECT funding_goal AS v FROM public.missionaries WHERE funding_goal IS NOT NULL AND mod(funding_goal, 100) <> 0
        UNION ALL
        SELECT current_funding AS v FROM public.missionaries WHERE current_funding IS NOT NULL AND mod(current_funding, 100) <> 0
    ) violations;

    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Amount verification failed: % rows are not integer cent amounts', invalid_count;
    END IF;
END;
$function$;

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION public.admin_contributions_summary(p_tenant_id UUID)
RETURNS TABLE (
    total_received BIGINT,
    successful_count BIGINT,
    pending_amount BIGINT,
    pending_count BIGINT,
    average_gift NUMERIC,
    recurring_count BIGINT
)
LANGUAGE sql
STABLE
AS $function$
  SELECT
    COALESCE(SUM(amount) FILTER (WHERE status IN ('completed', 'succeeded', 'success')), 0)::BIGINT AS total_received,
    COUNT(*) FILTER (WHERE status IN ('completed', 'succeeded', 'success'))::BIGINT AS successful_count,
    COALESCE(SUM(amount) FILTER (WHERE status IN ('pending', 'processing')), 0)::BIGINT AS pending_amount,
    COUNT(*) FILTER (WHERE status IN ('pending', 'processing'))::BIGINT AS pending_count,
    COALESCE(AVG(amount) FILTER (WHERE status IN ('completed', 'succeeded', 'success')), 0)::NUMERIC AS average_gift,
    COUNT(*) FILTER (WHERE COALESCE(is_recurring, FALSE) OR donation_type = 'recurring')::BIGINT AS recurring_count
  FROM public.donations
  WHERE tenant_id = p_tenant_id;
$function$;

-- RPC helpers for post counters
CREATE OR REPLACE FUNCTION public.increment_post_like_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET like_count = COALESCE(like_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_post_like_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_post_prayer_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET prayer_count = COALESCE(prayer_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_post_prayer_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET prayer_count = GREATEST(COALESCE(prayer_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_post_fire_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET fires_count = COALESCE(fires_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_post_fire_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET fires_count = GREATEST(COALESCE(fires_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_post_comment_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET comment_count = COALESCE(comment_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_post_comment_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

-- ==========================================
-- STORAGE BUCKETS & POLICIES
-- ==========================================

-- Buckets used by the app (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('profiles', 'profiles', true),
  ('document-uploads', 'document-uploads', true),
  ('email-assets', 'email-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for uploaded media
DROP POLICY IF EXISTS "Public read profiles" ON storage.objects;
CREATE POLICY "Public read profiles"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profiles');

DROP POLICY IF EXISTS "Public read document-uploads" ON storage.objects;
CREATE POLICY "Public read document-uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'document-uploads');

DROP POLICY IF EXISTS "Public read email-assets" ON storage.objects;
CREATE POLICY "Public read email-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'email-assets');

-- Authenticated uploads (client-side)
DROP POLICY IF EXISTS "Authenticated upload profiles" ON storage.objects;
CREATE POLICY "Authenticated upload profiles"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated upload document-uploads" ON storage.objects;
CREATE POLICY "Authenticated upload document-uploads"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'document-uploads' AND auth.role() = 'authenticated');

-- Owner update/delete for authenticated users
DROP POLICY IF EXISTS "Owner update profiles" ON storage.objects;
CREATE POLICY "Owner update profiles"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profiles' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'profiles' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Owner delete profiles" ON storage.objects;
CREATE POLICY "Owner delete profiles"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'profiles' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Owner update document-uploads" ON storage.objects;
CREATE POLICY "Owner update document-uploads"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'document-uploads' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'document-uploads' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Owner delete document-uploads" ON storage.objects;
CREATE POLICY "Owner delete document-uploads"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'document-uploads' AND auth.uid() = owner);

-- Trigger to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, first_name, last_name, full_name, avatar_url, role, tenant_id)
  VALUES (
    new.id,
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      TRIM(CONCAT(new.raw_user_meta_data->>'first_name', ' ', new.raw_user_meta_data->>'last_name'))
    ),
    new.raw_user_meta_data->>'avatar_url',
    'donor',
    COALESCE((new.raw_app_meta_data->>'tenant_id')::uuid, '00000000-0000-0000-0000-000000000001'::uuid)
  );
  RETURN new;
END;
$function$;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- SEED DATA
-- ==========================================

-- Create default tenant
INSERT INTO public.tenants (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'GiveHope Organization', 'give-hope')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- RLS (Row Level Security)
-- ==========================================
-- For development/demo ease, we are keeping RLS disabled on most tables.
-- In production, you MUST enable RLS and define policies.

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.missionaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_prayers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_fires DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.funds DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_send_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_template_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_template_system_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_operation_prompt_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_operation_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_approval_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_correction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_approval_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_approval_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_approval_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_receipt_delivery_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_receipt_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_operation_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_task_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_task_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_attention_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_automation_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_operation_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_operation_batch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suppression_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_inbound_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pledge_charge_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_feed_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_pledges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follower_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.missionary_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets DISABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.tenant_email_settings FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_send_logs FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_suppression_groups FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_suppressions FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_inbound_messages FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_operation_prompt_settings FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_operation_user_preferences FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_corrections FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_adjustments FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_approval_policies FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_correction_requests FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_approval_notification_settings FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_approval_notification_preferences FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_approval_notifications FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_receipt_delivery_policies FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_receipt_snapshots FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_operation_audit_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_template_system_bindings FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_notification_settings FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_notification_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_queues FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_tasks FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_task_links FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_task_comments FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_task_reminders FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_task_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_attention_items FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_automation_rules FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_control_automation_activity_logs FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_operation_batches FROM anon, authenticated;
REVOKE ALL ON TABLE public.contribution_operation_batch_items FROM anon, authenticated;

GRANT ALL ON TABLE public.tenant_email_settings TO service_role;
GRANT ALL ON TABLE public.email_send_logs TO service_role;
GRANT ALL ON TABLE public.email_events TO service_role;
GRANT ALL ON TABLE public.email_suppression_groups TO service_role;
GRANT ALL ON TABLE public.email_suppressions TO service_role;
GRANT ALL ON TABLE public.email_inbound_messages TO service_role;
GRANT ALL ON TABLE public.contribution_operation_prompt_settings TO service_role;
GRANT ALL ON TABLE public.contribution_operation_user_preferences TO service_role;
GRANT ALL ON TABLE public.contribution_corrections TO service_role;
GRANT ALL ON TABLE public.contribution_operation_audit_events TO service_role;
GRANT ALL ON TABLE public.email_template_system_bindings TO service_role;
GRANT ALL ON TABLE public.contribution_notification_settings TO service_role;
GRANT ALL ON TABLE public.contribution_notification_events TO service_role;
GRANT ALL ON TABLE public.mission_control_queues TO service_role;
GRANT ALL ON TABLE public.mission_control_tasks TO service_role;
GRANT ALL ON TABLE public.mission_control_task_links TO service_role;
GRANT ALL ON TABLE public.mission_control_task_comments TO service_role;
GRANT ALL ON TABLE public.mission_control_task_reminders TO service_role;
GRANT ALL ON TABLE public.mission_control_task_events TO service_role;
GRANT ALL ON TABLE public.mission_control_attention_items TO service_role;
GRANT ALL ON TABLE public.mission_control_automation_rules TO service_role;
GRANT ALL ON TABLE public.mission_control_automation_activity_logs TO service_role;
GRANT ALL ON TABLE public.contribution_operation_batches TO service_role;
GRANT ALL ON TABLE public.contribution_operation_batch_items TO service_role;
