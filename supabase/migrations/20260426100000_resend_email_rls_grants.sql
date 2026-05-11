BEGIN;

-- Resend email data stores tenant-scoped secrets, provider events, and inbound
-- message content. Keep these tables server-only through the service-role API.
ALTER TABLE public.tenant_email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_send_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suppression_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_inbound_messages ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.tenant_email_settings FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_send_logs FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_suppression_groups FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_suppressions FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_inbound_messages FROM anon, authenticated;

GRANT ALL ON TABLE public.tenant_email_settings TO service_role;
GRANT ALL ON TABLE public.email_send_logs TO service_role;
GRANT ALL ON TABLE public.email_events TO service_role;
GRANT ALL ON TABLE public.email_suppression_groups TO service_role;
GRANT ALL ON TABLE public.email_suppressions TO service_role;
GRANT ALL ON TABLE public.email_inbound_messages TO service_role;

COMMENT ON TABLE public.tenant_email_settings IS
  'Server-only Resend tenant settings. Contains encrypted tenant API keys; RLS enabled with no anon/authenticated access.';
COMMENT ON TABLE public.email_send_logs IS
  'Server-only Resend send audit log. RLS enabled with no anon/authenticated access.';
COMMENT ON TABLE public.email_events IS
  'Server-only Resend webhook event log. RLS enabled with no anon/authenticated access.';
COMMENT ON TABLE public.email_suppression_groups IS
  'Server-only email suppression group metadata. RLS enabled with no anon/authenticated access.';
COMMENT ON TABLE public.email_suppressions IS
  'Server-only email suppression records. RLS enabled with no anon/authenticated access.';
COMMENT ON TABLE public.email_inbound_messages IS
  'Server-only inbound email metadata and parsed content. RLS enabled with no anon/authenticated access.';

COMMIT;
