-- Grant service_role access to contribution operations core tables.
-- The foundation migration revoked anon/authenticated but omitted service_role grants.

GRANT ALL ON TABLE public.contribution_operation_prompt_settings TO service_role;
GRANT ALL ON TABLE public.contribution_operation_user_preferences TO service_role;
GRANT ALL ON TABLE public.contribution_corrections TO service_role;
GRANT ALL ON TABLE public.contribution_operation_audit_events TO service_role;
