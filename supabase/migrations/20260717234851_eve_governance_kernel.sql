-- Eve governance kernel (issue #418).
--
-- This migration creates app-owned, service-role-only governance state. The
-- singleton is deliberately inserted disabled. Deploying this migration cannot
-- activate Eve, and later control paths must update it through audited server
-- commands rather than browser table access.

CREATE TABLE public.eve_governance_state (
    id TEXT PRIMARY KEY DEFAULT 'global'
        CHECK (id = 'global'),
    release_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    emergency_off BOOLEAN NOT NULL DEFAULT FALSE,
    kill_switch_state JSONB NOT NULL DEFAULT '{}'::jsonb
        CHECK (jsonb_typeof(kill_switch_state) = 'object'),
    policy_status TEXT NOT NULL DEFAULT 'not_configured'
        CHECK (
            policy_status IN (
                'not_configured',
                'ready',
                'blocked',
                'degraded'
            )
        ),
    policy_summary TEXT,
    state_version BIGINT NOT NULL DEFAULT 1
        CHECK (state_version > 0),
    updated_by_profile_id UUID
        REFERENCES public.profiles(id)
        ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.eve_run_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    target TEXT,
    governance_decision TEXT NOT NULL
        CHECK (governance_decision IN ('allowed', 'blocked')),
    decision_reason TEXT NOT NULL,
    status TEXT NOT NULL
        CHECK (
            status IN (
                'started',
                'completed',
                'failed',
                'skipped',
                'stopped'
            )
        ),
    state_version BIGINT
        CHECK (state_version IS NULL OR state_version > 0),
    initiated_by_profile_id UUID
        REFERENCES public.profiles(id)
        ON DELETE SET NULL,
    accountable_trigger TEXT,
    summary JSONB NOT NULL DEFAULT '{}'::jsonb
        CHECK (jsonb_typeof(summary) = 'object'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX eve_run_summaries_status_updated_idx
    ON public.eve_run_summaries (status, updated_at DESC);

CREATE INDEX eve_run_summaries_decision_updated_idx
    ON public.eve_run_summaries (governance_decision, updated_at DESC);

CREATE INDEX eve_run_summaries_initiator_updated_idx
    ON public.eve_run_summaries (initiated_by_profile_id, updated_at DESC)
    WHERE initiated_by_profile_id IS NOT NULL;

ALTER TABLE public.eve_governance_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_run_summaries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.eve_governance_state FROM anon, authenticated;
REVOKE ALL ON TABLE public.eve_run_summaries FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.eve_governance_state TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.eve_run_summaries TO service_role;

INSERT INTO public.eve_governance_state (id)
VALUES ('global')
ON CONFLICT (id) DO NOTHING;
