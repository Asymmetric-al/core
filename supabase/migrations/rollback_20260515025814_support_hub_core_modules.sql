BEGIN;

REVOKE ALL ON FUNCTION private.seed_support_hub_defaults(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
DROP FUNCTION IF EXISTS private.seed_support_hub_defaults(UUID, TEXT, TEXT, TEXT, TEXT);

ALTER TABLE public.email_inbound_messages
  DROP COLUMN IF EXISTS references_headers,
  DROP COLUMN IF EXISTS in_reply_to_header,
  DROP COLUMN IF EXISTS message_id_header,
  DROP COLUMN IF EXISTS support_message_id,
  DROP COLUMN IF EXISTS conversation_id;

DROP TABLE IF EXISTS public.support_audit_log;
DROP TABLE IF EXISTS public.support_assignments;
DROP TABLE IF EXISTS public.support_notification_preferences;
DROP TABLE IF EXISTS public.support_automation_rules;
DROP TABLE IF EXISTS public.support_canned_responses;
DROP TABLE IF EXISTS public.support_macros;
DROP TABLE IF EXISTS public.support_saved_views;
DROP TABLE IF EXISTS public.support_message_attachments;
DROP TABLE IF EXISTS public.support_messages;
DROP TABLE IF EXISTS public.support_conversation_labels;
DROP TABLE IF EXISTS public.support_conversations;
DROP TABLE IF EXISTS public.support_inbox_settings;
DROP TABLE IF EXISTS public.support_signatures;
DROP TABLE IF EXISTS public.support_sla_policies;
DROP TABLE IF EXISTS public.support_business_hours;
DROP TABLE IF EXISTS public.support_labels;
DROP TABLE IF EXISTS public.support_teams;
DROP TABLE IF EXISTS public.support_agents;
DROP TABLE IF EXISTS public.support_inboxes;

DROP FUNCTION IF EXISTS public.set_support_hub_updated_at();

COMMIT;
