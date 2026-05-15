BEGIN;

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION public.set_support_hub_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.support_inboxes (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  inbound_address TEXT NOT NULL,
  from_address TEXT NOT NULL,
  from_name TEXT NOT NULL,
  reply_to_address TEXT,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_inboxes_channel_chk CHECK (channel = 'email'),
  CONSTRAINT support_inboxes_inbound_email_chk CHECK (position('@' IN inbound_address) > 1),
  CONSTRAINT support_inboxes_from_email_chk CHECK (position('@' IN from_address) > 1),
  CONSTRAINT support_inboxes_reply_to_email_chk CHECK (reply_to_address IS NULL OR position('@' IN reply_to_address) > 1)
);

CREATE UNIQUE INDEX IF NOT EXISTS support_inboxes_tenant_default_uq
  ON public.support_inboxes (tenant_id)
  WHERE is_default = true;

CREATE UNIQUE INDEX IF NOT EXISTS support_inboxes_tenant_inbound_address_uq
  ON public.support_inboxes (tenant_id, lower(inbound_address));

CREATE TABLE IF NOT EXISTS public.support_agents (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_agents_email_chk CHECK (position('@' IN email) > 1)
);

CREATE UNIQUE INDEX IF NOT EXISTS support_agents_tenant_email_uq
  ON public.support_agents (tenant_id, lower(email));

CREATE INDEX IF NOT EXISTS support_agents_tenant_user_idx
  ON public.support_agents (tenant_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.support_teams (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  initials TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_teams_initials_len_chk CHECK (char_length(initials) BETWEEN 1 AND 4)
);

CREATE UNIQUE INDEX IF NOT EXISTS support_teams_tenant_slug_uq
  ON public.support_teams (tenant_id, slug);

CREATE TABLE IF NOT EXISTS public.support_labels (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'zinc',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_labels_tone_chk CHECK (tone IN ('zinc', 'blue', 'amber', 'rose', 'emerald', 'violet'))
);

CREATE UNIQUE INDEX IF NOT EXISTS support_labels_tenant_slug_uq
  ON public.support_labels (tenant_id, slug);

CREATE TABLE IF NOT EXISTS public.support_business_hours (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL,
  weekly_schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
  holidays JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_business_hours_weekly_schedule_array_chk CHECK (jsonb_typeof(weekly_schedule) = 'array'),
  CONSTRAINT support_business_hours_holidays_array_chk CHECK (jsonb_typeof(holidays) = 'array')
);

CREATE UNIQUE INDEX IF NOT EXISTS support_business_hours_tenant_default_uq
  ON public.support_business_hours (tenant_id)
  WHERE is_default = true;

CREATE TABLE IF NOT EXISTS public.support_sla_policies (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  first_response_minutes INTEGER NOT NULL,
  next_response_minutes INTEGER NOT NULL,
  resolution_minutes INTEGER NOT NULL,
  business_hours_id TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_sla_first_response_positive_chk CHECK (first_response_minutes > 0),
  CONSTRAINT support_sla_next_response_positive_chk CHECK (next_response_minutes > 0),
  CONSTRAINT support_sla_resolution_positive_chk CHECK (resolution_minutes > 0),
  CONSTRAINT support_sla_business_hours_fk
    FOREIGN KEY (tenant_id, business_hours_id)
    REFERENCES public.support_business_hours (tenant_id, id)
    ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS support_sla_policies_tenant_default_uq
  ON public.support_sla_policies (tenant_id)
  WHERE is_default = true;

CREATE TABLE IF NOT EXISTS public.support_signatures (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  owner_agent_id TEXT,
  name TEXT NOT NULL,
  body_text TEXT NOT NULL,
  body_html TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_signatures_owner_agent_fk
    FOREIGN KEY (tenant_id, owner_agent_id)
    REFERENCES public.support_agents (tenant_id, id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS support_signatures_tenant_owner_default_uq
  ON public.support_signatures (tenant_id, coalesce(owner_agent_id, '__workspace__'))
  WHERE is_default = true;

CREATE TABLE IF NOT EXISTS public.support_inbox_settings (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  inbox_id TEXT NOT NULL,
  default_signature_id TEXT,
  default_sla_policy_id TEXT,
  default_business_hours_id TEXT,
  round_robin_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_resolve_after_days INTEGER,
  show_contact_sidecar BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_inbox_settings_auto_resolve_chk CHECK (auto_resolve_after_days IS NULL OR auto_resolve_after_days >= 0),
  CONSTRAINT support_inbox_settings_inbox_fk
    FOREIGN KEY (tenant_id, inbox_id)
    REFERENCES public.support_inboxes (tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT support_inbox_settings_signature_fk
    FOREIGN KEY (tenant_id, default_signature_id)
    REFERENCES public.support_signatures (tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT support_inbox_settings_sla_fk
    FOREIGN KEY (tenant_id, default_sla_policy_id)
    REFERENCES public.support_sla_policies (tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT support_inbox_settings_business_hours_fk
    FOREIGN KEY (tenant_id, default_business_hours_id)
    REFERENCES public.support_business_hours (tenant_id, id)
    ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS support_inbox_settings_tenant_inbox_uq
  ON public.support_inbox_settings (tenant_id, inbox_id);

CREATE TABLE IF NOT EXISTS public.support_conversations (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  inbox_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  channel TEXT NOT NULL DEFAULT 'email',
  assignee_agent_id TEXT,
  team_id TEXT,
  external_contact_email TEXT NOT NULL,
  external_contact_name TEXT,
  contact_ref JSONB,
  unread_count INTEGER NOT NULL DEFAULT 0,
  message_count INTEGER NOT NULL DEFAULT 0,
  first_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_customer_message_at TIMESTAMPTZ,
  last_message_direction TEXT NOT NULL DEFAULT 'inbound',
  first_responded_at TIMESTAMPTZ,
  first_response_due_at TIMESTAMPTZ,
  next_response_due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  board_order INTEGER NOT NULL DEFAULT 0,
  sla_policy_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_conversations_inbox_fk
    FOREIGN KEY (tenant_id, inbox_id)
    REFERENCES public.support_inboxes (tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT support_conversations_assignee_fk
    FOREIGN KEY (tenant_id, assignee_agent_id)
    REFERENCES public.support_agents (tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT support_conversations_team_fk
    FOREIGN KEY (tenant_id, team_id)
    REFERENCES public.support_teams (tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT support_conversations_sla_fk
    FOREIGN KEY (tenant_id, sla_policy_id)
    REFERENCES public.support_sla_policies (tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT support_conversations_status_chk CHECK (status IN ('open', 'pending', 'snoozed', 'resolved')),
  CONSTRAINT support_conversations_priority_chk CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  CONSTRAINT support_conversations_channel_chk CHECK (channel = 'email'),
  CONSTRAINT support_conversations_last_direction_chk CHECK (last_message_direction IN ('inbound', 'outbound')),
  CONSTRAINT support_conversations_email_chk CHECK (position('@' IN external_contact_email) > 1),
  CONSTRAINT support_conversations_counts_chk CHECK (unread_count >= 0 AND message_count >= 0 AND board_order >= 0)
);

CREATE INDEX IF NOT EXISTS support_conversations_tenant_status_updated_idx
  ON public.support_conversations (tenant_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS support_conversations_tenant_inbox_status_idx
  ON public.support_conversations (tenant_id, inbox_id, status, board_order);

CREATE INDEX IF NOT EXISTS support_conversations_tenant_assignee_idx
  ON public.support_conversations (tenant_id, assignee_agent_id, status);

CREATE INDEX IF NOT EXISTS support_conversations_tenant_contact_email_idx
  ON public.support_conversations (tenant_id, lower(external_contact_email));

CREATE INDEX IF NOT EXISTS support_conversations_tenant_subject_idx
  ON public.support_conversations USING gin (to_tsvector('simple', subject));

CREATE TABLE IF NOT EXISTS public.support_conversation_labels (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  label_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, conversation_id, label_id),
  CONSTRAINT support_conversation_labels_conversation_fk
    FOREIGN KEY (tenant_id, conversation_id)
    REFERENCES public.support_conversations (tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT support_conversation_labels_label_fk
    FOREIGN KEY (tenant_id, label_id)
    REFERENCES public.support_labels (tenant_id, id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS support_conversation_labels_tenant_label_idx
  ON public.support_conversation_labels (tenant_id, label_id);

CREATE TABLE IF NOT EXISTS public.support_messages (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  type TEXT NOT NULL,
  direction TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT false,
  delivery_state TEXT NOT NULL DEFAULT 'delivered',
  author JSONB NOT NULL,
  body JSONB NOT NULL,
  email_headers JSONB,
  outbound_send_log_id UUID REFERENCES public.email_send_logs(id) ON DELETE SET NULL,
  inbound_email_id UUID REFERENCES public.email_inbound_messages(id) ON DELETE SET NULL,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_messages_conversation_fk
    FOREIGN KEY (tenant_id, conversation_id)
    REFERENCES public.support_conversations (tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT support_messages_type_chk CHECK (type IN ('email', 'note', 'system')),
  CONSTRAINT support_messages_direction_chk CHECK (direction IN ('inbound', 'outbound')),
  CONSTRAINT support_messages_delivery_state_chk CHECK (delivery_state IN ('draft', 'queued', 'sending', 'sent', 'delivered', 'bounced', 'failed')),
  CONSTRAINT support_messages_author_object_chk CHECK (jsonb_typeof(author) = 'object'),
  CONSTRAINT support_messages_body_object_chk CHECK (jsonb_typeof(body) = 'object')
);

CREATE INDEX IF NOT EXISTS support_messages_tenant_conversation_posted_idx
  ON public.support_messages (tenant_id, conversation_id, posted_at);

CREATE INDEX IF NOT EXISTS support_messages_tenant_inbound_email_idx
  ON public.support_messages (tenant_id, inbound_email_id)
  WHERE inbound_email_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS support_messages_message_id_header_idx
  ON public.support_messages (tenant_id, ((email_headers ->> 'messageId')))
  WHERE email_headers ? 'messageId';

CREATE TABLE IF NOT EXISTS public.support_message_attachments (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_message_attachments_message_fk
    FOREIGN KEY (tenant_id, message_id)
    REFERENCES public.support_messages (tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT support_message_attachments_size_chk CHECK (size_bytes >= 0)
);

CREATE INDEX IF NOT EXISTS support_message_attachments_tenant_message_idx
  ON public.support_message_attachments (tenant_id, message_id);

CREATE TABLE IF NOT EXISTS public.support_saved_views (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  owner_agent_id TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  scope TEXT NOT NULL,
  filter JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_saved_views_owner_fk
    FOREIGN KEY (tenant_id, owner_agent_id)
    REFERENCES public.support_agents (tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT support_saved_views_scope_chk CHECK (scope IN ('personal', 'workspace')),
  CONSTRAINT support_saved_views_filter_object_chk CHECK (jsonb_typeof(filter) = 'object')
);

CREATE UNIQUE INDEX IF NOT EXISTS support_saved_views_tenant_owner_slug_uq
  ON public.support_saved_views (tenant_id, coalesce(owner_agent_id, '__workspace__'), slug);

CREATE TABLE IF NOT EXISTS public.support_macros (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  owner_agent_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_macros_owner_fk
    FOREIGN KEY (tenant_id, owner_agent_id)
    REFERENCES public.support_agents (tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT support_macros_actions_array_chk CHECK (jsonb_typeof(actions) = 'array')
);

CREATE TABLE IF NOT EXISTS public.support_canned_responses (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  owner_agent_id TEXT,
  short_code TEXT NOT NULL,
  title TEXT NOT NULL,
  body_text TEXT NOT NULL,
  body_html TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_canned_responses_owner_fk
    FOREIGN KEY (tenant_id, owner_agent_id)
    REFERENCES public.support_agents (tenant_id, id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS support_canned_responses_tenant_owner_short_code_uq
  ON public.support_canned_responses (tenant_id, coalesce(owner_agent_id, '__workspace__'), short_code);

CREATE TABLE IF NOT EXISTS public.support_automation_rules (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  trigger TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_automation_rules_trigger_chk CHECK (trigger IN ('conversation_created', 'message_received', 'status_changed', 'label_added', 'past_due_reached')),
  CONSTRAINT support_automation_rules_conditions_array_chk CHECK (jsonb_typeof(conditions) = 'array'),
  CONSTRAINT support_automation_rules_actions_array_chk CHECK (jsonb_typeof(actions) = 'array'),
  CONSTRAINT support_automation_rules_actions_nonempty_chk CHECK (jsonb_array_length(actions) > 0)
);

CREATE INDEX IF NOT EXISTS support_automation_rules_tenant_trigger_enabled_idx
  ON public.support_automation_rules (tenant_id, trigger)
  WHERE enabled = true;

CREATE TABLE IF NOT EXISTS public.support_notification_preferences (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  email_mentions BOOLEAN NOT NULL DEFAULT true,
  email_assignments BOOLEAN NOT NULL DEFAULT true,
  email_daily_digest BOOLEAN NOT NULL DEFAULT false,
  in_app_mentions BOOLEAN NOT NULL DEFAULT true,
  in_app_assignments BOOLEAN NOT NULL DEFAULT true,
  in_app_sla_warnings BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_notification_preferences_agent_fk
    FOREIGN KEY (tenant_id, agent_id)
    REFERENCES public.support_agents (tenant_id, id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS support_notification_preferences_tenant_agent_uq
  ON public.support_notification_preferences (tenant_id, agent_id);

CREATE TABLE IF NOT EXISTS public.support_assignments (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  assignee_agent_id TEXT,
  team_id TEXT,
  reason TEXT NOT NULL DEFAULT 'manual',
  assigned_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_assignments_conversation_fk
    FOREIGN KEY (tenant_id, conversation_id)
    REFERENCES public.support_conversations (tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT support_assignments_assignee_fk
    FOREIGN KEY (tenant_id, assignee_agent_id)
    REFERENCES public.support_agents (tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT support_assignments_team_fk
    FOREIGN KEY (tenant_id, team_id)
    REFERENCES public.support_teams (tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT support_assignments_reason_chk CHECK (reason IN ('manual', 'round_robin', 'macro', 'inbound'))
);

CREATE INDEX IF NOT EXISTS support_assignments_tenant_conversation_created_idx
  ON public.support_assignments (tenant_id, conversation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.support_audit_log (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  conversation_id TEXT,
  actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_agent_id TEXT,
  verb TEXT NOT NULL,
  body TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT support_audit_log_conversation_fk
    FOREIGN KEY (tenant_id, conversation_id)
    REFERENCES public.support_conversations (tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT support_audit_log_actor_agent_fk
    FOREIGN KEY (tenant_id, actor_agent_id)
    REFERENCES public.support_agents (tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT support_audit_log_metadata_object_chk CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE INDEX IF NOT EXISTS support_audit_log_tenant_conversation_created_idx
  ON public.support_audit_log (tenant_id, conversation_id, created_at DESC);

ALTER TABLE public.email_inbound_messages
  ADD COLUMN IF NOT EXISTS conversation_id TEXT,
  ADD COLUMN IF NOT EXISTS support_message_id TEXT,
  ADD COLUMN IF NOT EXISTS message_id_header TEXT,
  ADD COLUMN IF NOT EXISTS in_reply_to_header TEXT,
  ADD COLUMN IF NOT EXISTS references_headers TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE INDEX IF NOT EXISTS email_inbound_messages_tenant_conversation_idx
  ON public.email_inbound_messages (tenant_id, conversation_id)
  WHERE conversation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS email_inbound_messages_tenant_message_id_header_idx
  ON public.email_inbound_messages (tenant_id, message_id_header)
  WHERE message_id_header IS NOT NULL;

CREATE INDEX IF NOT EXISTS email_inbound_messages_tenant_in_reply_to_idx
  ON public.email_inbound_messages (tenant_id, in_reply_to_header)
  WHERE in_reply_to_header IS NOT NULL;

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'support_inboxes',
    'support_agents',
    'support_teams',
    'support_labels',
    'support_business_hours',
    'support_sla_policies',
    'support_signatures',
    'support_inbox_settings',
    'support_conversations',
    'support_conversation_labels',
    'support_messages',
    'support_message_attachments',
    'support_saved_views',
    'support_macros',
    'support_canned_responses',
    'support_automation_rules',
    'support_notification_preferences',
    'support_assignments',
    'support_audit_log'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', table_name);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated', table_name);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', table_name);

    EXECUTE format('DROP POLICY IF EXISTS "support hub staff select" ON public.%I', table_name);
    EXECUTE format(
      'CREATE POLICY "support hub staff select" ON public.%I FOR SELECT TO authenticated USING ((select authz.is_super_admin()) OR (tenant_id = (select authz.current_tenant_id()) AND (select authz.has_staff_membership(tenant_id, NULL))))',
      table_name
    );

    EXECUTE format('DROP POLICY IF EXISTS "support hub staff insert" ON public.%I', table_name);
    EXECUTE format(
      'CREATE POLICY "support hub staff insert" ON public.%I FOR INSERT TO authenticated WITH CHECK ((select authz.is_super_admin()) OR (tenant_id = (select authz.current_tenant_id()) AND (select authz.has_staff_membership(tenant_id, NULL))))',
      table_name
    );

    EXECUTE format('DROP POLICY IF EXISTS "support hub staff update" ON public.%I', table_name);
    EXECUTE format(
      'CREATE POLICY "support hub staff update" ON public.%I FOR UPDATE TO authenticated USING ((select authz.is_super_admin()) OR (tenant_id = (select authz.current_tenant_id()) AND (select authz.has_staff_membership(tenant_id, NULL)))) WITH CHECK ((select authz.is_super_admin()) OR (tenant_id = (select authz.current_tenant_id()) AND (select authz.has_staff_membership(tenant_id, NULL))))',
      table_name
    );

    EXECUTE format('DROP POLICY IF EXISTS "support hub staff delete" ON public.%I', table_name);
    EXECUTE format(
      'CREATE POLICY "support hub staff delete" ON public.%I FOR DELETE TO authenticated USING ((select authz.is_super_admin()) OR (tenant_id = (select authz.current_tenant_id()) AND (select authz.has_staff_membership(tenant_id, NULL))))',
      table_name
    );
  END LOOP;
END $$;

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'support_inboxes',
    'support_agents',
    'support_teams',
    'support_labels',
    'support_business_hours',
    'support_sla_policies',
    'support_signatures',
    'support_inbox_settings',
    'support_conversations',
    'support_messages',
    'support_saved_views',
    'support_macros',
    'support_canned_responses',
    'support_automation_rules',
    'support_notification_preferences'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I ON public.%I',
      'set_' || table_name || '_updated_at',
      table_name
    );
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_support_hub_updated_at()',
      'set_' || table_name || '_updated_at',
      table_name
    );
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION private.seed_support_hub_defaults(
  target_tenant_id UUID,
  inbox_address TEXT,
  from_address TEXT DEFAULT NULL,
  from_name TEXT DEFAULT 'Donor Care',
  workspace_signature_text TEXT DEFAULT 'Donor Care Team'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  effective_from_address TEXT := coalesce(from_address, inbox_address);
BEGIN
  IF target_tenant_id IS NULL THEN
    RAISE EXCEPTION 'target_tenant_id is required';
  END IF;

  IF inbox_address IS NULL OR position('@' IN inbox_address) <= 1 THEN
    RAISE EXCEPTION 'inbox_address must be an email address';
  END IF;

  INSERT INTO public.support_inboxes (
    tenant_id, id, name, channel, inbound_address, from_address, from_name,
    reply_to_address, description, is_default
  )
  VALUES (
    target_tenant_id,
    'support-inbox-default',
    'Donor Care',
    'email',
    lower(inbox_address),
    lower(effective_from_address),
    from_name,
    lower(inbox_address),
    'Default donor care inbox.',
    true
  )
  ON CONFLICT (tenant_id, id)
  DO UPDATE SET
    inbound_address = excluded.inbound_address,
    from_address = excluded.from_address,
    from_name = excluded.from_name,
    reply_to_address = excluded.reply_to_address,
    description = excluded.description,
    is_default = true,
    updated_at = NOW();

  INSERT INTO public.support_labels (tenant_id, id, name, slug, tone, description)
  VALUES
    (target_tenant_id, 'label-finance', 'Finance', 'finance', 'amber', 'Receipts, refunds, donation issues.'),
    (target_tenant_id, 'label-technical', 'Technical', 'technical', 'blue', 'Login, account, app or page issues.'),
    (target_tenant_id, 'label-recurring', 'Recurring', 'recurring', 'emerald', 'Pledges, monthly gifts, retries, pauses.'),
    (target_tenant_id, 'label-escalated', 'Escalated', 'escalated', 'rose', 'Manually escalated for senior review.')
  ON CONFLICT (tenant_id, id)
  DO UPDATE SET
    name = excluded.name,
    slug = excluded.slug,
    tone = excluded.tone,
    description = excluded.description,
    updated_at = NOW();

  INSERT INTO public.support_business_hours (
    tenant_id, id, name, timezone, weekly_schedule, holidays, is_default
  )
  VALUES (
    target_tenant_id,
    'biz-hours-standard',
    'Standard support hours',
    'UTC',
    '[
      {"day":"monday","enabled":true,"openTime":"09:00","closeTime":"17:00"},
      {"day":"tuesday","enabled":true,"openTime":"09:00","closeTime":"17:00"},
      {"day":"wednesday","enabled":true,"openTime":"09:00","closeTime":"17:00"},
      {"day":"thursday","enabled":true,"openTime":"09:00","closeTime":"17:00"},
      {"day":"friday","enabled":true,"openTime":"09:00","closeTime":"17:00"},
      {"day":"saturday","enabled":false,"openTime":"00:00","closeTime":"00:00"},
      {"day":"sunday","enabled":false,"openTime":"00:00","closeTime":"00:00"}
    ]'::jsonb,
    '[]'::jsonb,
    true
  )
  ON CONFLICT (tenant_id, id)
  DO UPDATE SET
    name = excluded.name,
    timezone = excluded.timezone,
    weekly_schedule = excluded.weekly_schedule,
    holidays = excluded.holidays,
    is_default = true,
    updated_at = NOW();

  INSERT INTO public.support_sla_policies (
    tenant_id, id, name, description, first_response_minutes,
    next_response_minutes, resolution_minutes, business_hours_id, is_default
  )
  VALUES (
    target_tenant_id,
    'sla-standard',
    'Standard donor support',
    'First reply in one business day, resolve within five.',
    480,
    720,
    7200,
    'biz-hours-standard',
    true
  )
  ON CONFLICT (tenant_id, id)
  DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    first_response_minutes = excluded.first_response_minutes,
    next_response_minutes = excluded.next_response_minutes,
    resolution_minutes = excluded.resolution_minutes,
    business_hours_id = excluded.business_hours_id,
    is_default = true,
    updated_at = NOW();

  INSERT INTO public.support_signatures (
    tenant_id, id, owner_agent_id, name, body_text, body_html, is_default
  )
  VALUES (
    target_tenant_id,
    'sig-workspace-default',
    NULL,
    'Workspace default',
    workspace_signature_text,
    '<p>' || replace(workspace_signature_text, E'\n', '<br/>') || '</p>',
    true
  )
  ON CONFLICT (tenant_id, id)
  DO UPDATE SET
    name = excluded.name,
    body_text = excluded.body_text,
    body_html = excluded.body_html,
    is_default = true,
    updated_at = NOW();

  INSERT INTO public.support_inbox_settings (
    tenant_id, id, inbox_id, default_signature_id, default_sla_policy_id,
    default_business_hours_id, round_robin_enabled, auto_resolve_after_days,
    show_contact_sidecar
  )
  VALUES (
    target_tenant_id,
    'support-inbox-settings-default',
    'support-inbox-default',
    'sig-workspace-default',
    'sla-standard',
    'biz-hours-standard',
    false,
    14,
    true
  )
  ON CONFLICT (tenant_id, id)
  DO UPDATE SET
    default_signature_id = excluded.default_signature_id,
    default_sla_policy_id = excluded.default_sla_policy_id,
    default_business_hours_id = excluded.default_business_hours_id,
    round_robin_enabled = excluded.round_robin_enabled,
    auto_resolve_after_days = excluded.auto_resolve_after_days,
    show_contact_sidecar = excluded.show_contact_sidecar,
    updated_at = NOW();

  RETURN jsonb_build_object(
    'tenantId', target_tenant_id,
    'inboxId', 'support-inbox-default',
    'labels', jsonb_build_array('finance', 'technical', 'recurring', 'escalated'),
    'demoConversationsSeeded', false
  );
END;
$$;

REVOKE ALL ON FUNCTION private.seed_support_hub_defaults(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.seed_support_hub_defaults(UUID, TEXT, TEXT, TEXT, TEXT) TO service_role;

COMMENT ON FUNCTION private.seed_support_hub_defaults(UUID, TEXT, TEXT, TEXT, TEXT) IS
  'Production-safe Support Hub onboarding path. Seeds default inbox labels, SLA policy, business hours, signature, and inbox settings only; it never creates demo conversations or messages.';

COMMIT;
