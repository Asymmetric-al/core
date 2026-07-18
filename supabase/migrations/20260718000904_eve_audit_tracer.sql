-- Eve audit tracer bullet (issue #419).
--
-- Audit rows are app-owned, service-role-only, append-only records. Their
-- schema intentionally has no raw prompt, model transcript, request payload,
-- payment, or PII columns. Redaction is applied by the server before insert.

CREATE INDEX eve_run_summaries_updated_idx
    ON public.eve_run_summaries (updated_at DESC);

CREATE TABLE public.eve_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID
        REFERENCES public.eve_run_summaries(id)
        ON DELETE SET NULL,
    tenant_id UUID
        REFERENCES public.tenants(id)
        ON DELETE SET NULL,
    actor_id TEXT NOT NULL,
    actor_profile_id UUID
        REFERENCES public.profiles(id)
        ON DELETE SET NULL,
    actor_role TEXT,
    identity_mode TEXT NOT NULL
        CHECK (identity_mode IN ('admin', 'service', 'github_bot')),
    initiator_type TEXT NOT NULL,
    initiator_id TEXT NOT NULL,
    policy_id TEXT NOT NULL,
    policy_status TEXT NOT NULL,
    governance_state_version BIGINT
        CHECK (
            governance_state_version IS NULL
            OR governance_state_version > 0
        ),
    action TEXT NOT NULL,
    target TEXT,
    result TEXT NOT NULL
        CHECK (
            result IN (
                'blocked',
                'failed',
                'skipped',
                'started',
                'succeeded'
            )
        ),
    tool_name TEXT,
    subagent_name TEXT,
    model_role TEXT NOT NULL DEFAULT 'not_used',
    evidence_summary TEXT NOT NULL,
    change_summary TEXT NOT NULL,
    decision_summary TEXT NOT NULL,
    debug_metadata JSONB NOT NULL DEFAULT '{}'::jsonb
        CHECK (jsonb_typeof(debug_metadata) = 'object'),
    redaction_version TEXT NOT NULL DEFAULT 'eve-audit-v1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX eve_audit_events_created_idx
    ON public.eve_audit_events (created_at DESC);

CREATE INDEX eve_audit_events_tenant_created_idx
    ON public.eve_audit_events (tenant_id, created_at DESC)
    WHERE tenant_id IS NOT NULL;

CREATE INDEX eve_audit_events_actor_created_idx
    ON public.eve_audit_events (actor_profile_id, created_at DESC)
    WHERE actor_profile_id IS NOT NULL;

CREATE INDEX eve_audit_events_run_created_idx
    ON public.eve_audit_events (run_id, created_at DESC)
    WHERE run_id IS NOT NULL;

ALTER TABLE public.eve_audit_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.eve_audit_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.eve_audit_events FROM service_role;
GRANT SELECT, INSERT ON TABLE public.eve_audit_events TO service_role;

COMMENT ON TABLE public.eve_audit_events IS
    'Append-only Eve action audit events containing redacted summaries and debug metadata only.';
