UPDATE public.crm_command_logs
SET command_payload = '{}'::jsonb
WHERE command_payload <> '{}'::jsonb;

REVOKE SELECT ON TABLE public.crm_command_logs FROM authenticated;
REVOKE SELECT (command_payload) ON TABLE public.crm_command_logs FROM authenticated;
GRANT SELECT (id, tenant_id, actor_user_id, actor_profile_id, request_id, action,
              resource_type, resource_id, idempotency_key, status, result_summary,
              error_message, created_at) ON TABLE public.crm_command_logs TO authenticated;
