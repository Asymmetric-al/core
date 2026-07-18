-- Eve model-policy tracer bullet (issue #421, ADR-0022).
--
-- This is an app-owned control plane only. It stores versioned policy,
-- permission grants, evaluations, and bounded emergency budget overrides. It
-- does not call a model provider or enable the disabled Eve release gate.

CREATE TABLE public.eve_ai_settings_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL
        REFERENCES public.tenants(id)
        ON DELETE CASCADE,
    profile_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,
    permission TEXT NOT NULL DEFAULT 'ai.settings.manage'
        CHECK (permission = 'ai.settings.manage'),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    granted_by_profile_id UUID
        REFERENCES public.profiles(id)
        ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, profile_id, permission)
);

CREATE TABLE public.eve_model_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope_type TEXT NOT NULL DEFAULT 'platform'
        CHECK (scope_type IN ('platform', 'tenant')),
    tenant_id UUID
        REFERENCES public.tenants(id)
        ON DELETE CASCADE,
    version BIGINT NOT NULL CHECK (version > 0),
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'evaluated', 'active', 'retired', 'rolled_back')),
    previous_policy_id UUID
        REFERENCES public.eve_model_policies(id)
        ON DELETE SET NULL,
    policy JSONB NOT NULL
        CHECK (jsonb_typeof(policy) = 'object'),
    policy_hash TEXT NOT NULL
        CHECK (policy_hash ~ '^[a-f0-9]{64}$'),
    eval_status TEXT NOT NULL DEFAULT 'not_evaluated'
        CHECK (eval_status IN ('not_evaluated', 'passed', 'failed')),
    eval_summary JSONB,
    evaluated_at TIMESTAMPTZ,
    activated_at TIMESTAMPTZ,
    created_by_profile_id UUID NOT NULL
        REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        (scope_type = 'platform' AND tenant_id IS NULL)
        OR (scope_type = 'tenant' AND tenant_id IS NOT NULL)
    ),
    CHECK (eval_summary IS NULL OR jsonb_typeof(eval_summary) = 'object'),
    UNIQUE (scope_type, tenant_id, version)
);

CREATE UNIQUE INDEX eve_model_policies_platform_version_idx
    ON public.eve_model_policies (version)
    WHERE scope_type = 'platform' AND tenant_id IS NULL;

CREATE UNIQUE INDEX eve_model_policies_one_active_platform_idx
    ON public.eve_model_policies (scope_type)
    WHERE scope_type = 'platform' AND tenant_id IS NULL AND status = 'active';

CREATE INDEX eve_model_policies_created_idx
    ON public.eve_model_policies (created_at DESC);

CREATE TABLE public.eve_model_budget_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL
        REFERENCES public.eve_model_policies(id)
        ON DELETE CASCADE,
    scope_type TEXT NOT NULL
        CHECK (scope_type IN ('role', 'subagent')),
    scope_id TEXT NOT NULL CHECK (btrim(scope_id) <> ''),
    additional_usd_micros BIGINT NOT NULL DEFAULT 0
        CHECK (additional_usd_micros >= 0),
    additional_input_tokens BIGINT NOT NULL DEFAULT 0
        CHECK (additional_input_tokens >= 0),
    additional_output_tokens BIGINT NOT NULL DEFAULT 0
        CHECK (additional_output_tokens >= 0),
    additional_requests BIGINT NOT NULL DEFAULT 0
        CHECK (additional_requests >= 0),
    reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 2000),
    expires_at TIMESTAMPTZ NOT NULL,
    created_by_profile_id UUID NOT NULL
        REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        additional_usd_micros > 0
        OR additional_input_tokens > 0
        OR additional_output_tokens > 0
        OR additional_requests > 0
    )
);

CREATE INDEX eve_model_budget_overrides_active_idx
    ON public.eve_model_budget_overrides (policy_id, expires_at DESC);

ALTER TABLE public.eve_ai_settings_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_model_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_model_budget_overrides ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.eve_ai_settings_grants FROM anon, authenticated;
REVOKE ALL ON TABLE public.eve_model_policies FROM anon, authenticated;
REVOKE ALL ON TABLE public.eve_model_budget_overrides FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.eve_ai_settings_grants TO service_role;
GRANT SELECT ON TABLE public.eve_model_policies TO service_role;
GRANT SELECT ON TABLE public.eve_model_budget_overrides TO service_role;

CREATE OR REPLACE FUNCTION public.enforce_eve_ai_settings_grant_tenant()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = NEW.profile_id AND tenant_id = NEW.tenant_id
    ) THEN
        RAISE EXCEPTION 'eve_ai_settings_grant_profile_tenant_mismatch';
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_eve_ai_settings_grant_tenant
    BEFORE INSERT OR UPDATE ON public.eve_ai_settings_grants
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_eve_ai_settings_grant_tenant();

CREATE OR REPLACE FUNCTION public.assert_eve_model_policy_change_allowed()
RETURNS public.eve_governance_state
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    governance public.eve_governance_state%ROWTYPE;
BEGIN
    SELECT * INTO governance
    FROM public.eve_governance_state
    WHERE id = 'global'
    FOR SHARE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'missing_eve_governance_state';
    END IF;

    IF governance.emergency_off
        OR (governance.kill_switch_state ->> 'all_automation')::BOOLEAN
        OR (governance.kill_switch_state ->> 'model_policy_changes')::BOOLEAN
    THEN
        RAISE EXCEPTION 'eve_model_policy_changes_blocked';
    END IF;

    RETURN governance;
END;
$$;

CREATE OR REPLACE FUNCTION public.append_eve_model_policy_audit(
    p_audit_id UUID,
    p_tenant_id UUID,
    p_actor_id TEXT,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_initiator_type TEXT,
    p_initiator_id TEXT,
    p_policy_status TEXT,
    p_governance_state_version BIGINT,
    p_action TEXT,
    p_target TEXT,
    p_result TEXT,
    p_evidence JSONB,
    p_change JSONB,
    p_rationale TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.eve_audit_events (
        id,
        tenant_id,
        actor_id,
        actor_profile_id,
        actor_role,
        identity_mode,
        initiator_type,
        initiator_id,
        policy_id,
        policy_status,
        governance_state_version,
        action,
        target,
        result,
        model_role,
        evidence_summary,
        change_summary,
        decision_summary,
        debug_metadata,
        redaction_version
    ) VALUES (
        p_audit_id,
        p_tenant_id,
        p_actor_id,
        p_actor_profile_id,
        p_actor_role,
        'admin',
        p_initiator_type,
        p_initiator_id,
        'eve-model-policy',
        p_policy_status,
        p_governance_state_version,
        p_action,
        p_target,
        p_result,
        'not_used',
        p_evidence::TEXT,
        p_change::TEXT,
        format('%s %s. Rationale: %s. Policy: eve-model-policy (%s).', p_action, p_result, p_rationale, p_policy_status),
        jsonb_build_object('source', 'eve_model_policy_rpc'),
        'eve-audit-v1'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.create_eve_model_policy_draft(
    p_policy JSONB,
    p_policy_hash TEXT,
    p_audit_id UUID,
    p_actor_id TEXT,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_tenant_id UUID,
    p_initiator_type TEXT,
    p_initiator_id TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    governance public.eve_governance_state%ROWTYPE;
    current_active_id UUID;
    next_version BIGINT;
    new_policy_id UUID := gen_random_uuid();
BEGIN
    governance := public.assert_eve_model_policy_change_allowed();

    IF p_actor_profile_id IS NULL OR p_policy IS NULL OR p_policy_hash !~ '^[a-f0-9]{64}$' THEN
        RAISE EXCEPTION 'invalid_eve_model_policy_draft';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtext('eve_model_policy:platform'));

    SELECT id INTO current_active_id
    FROM public.eve_model_policies
    WHERE scope_type = 'platform' AND tenant_id IS NULL AND status = 'active';

    SELECT COALESCE(MAX(version), 0) + 1 INTO next_version
    FROM public.eve_model_policies
    WHERE scope_type = 'platform' AND tenant_id IS NULL;

    INSERT INTO public.eve_model_policies (
        id,
        scope_type,
        version,
        status,
        previous_policy_id,
        policy,
        policy_hash,
        created_by_profile_id
    ) VALUES (
        new_policy_id,
        'platform',
        next_version,
        'draft',
        current_active_id,
        p_policy,
        p_policy_hash,
        p_actor_profile_id
    );

    PERFORM public.append_eve_model_policy_audit(
        p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
        p_initiator_type, p_initiator_id, 'draft', governance.state_version,
        'model_policy.draft', 'model_policy:' || new_policy_id, 'succeeded',
        jsonb_build_object('version', next_version, 'policyHash', p_policy_hash),
        jsonb_build_object('created', TRUE, 'previousPolicyId', current_active_id),
        'An authorized AI-settings manager created an immutable model-policy draft'
    );

    RETURN new_policy_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.evaluate_eve_model_policy_draft(
    p_policy_id UUID,
    p_policy_hash TEXT,
    p_eval_status TEXT,
    p_eval_summary JSONB,
    p_audit_id UUID,
    p_actor_id TEXT,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_tenant_id UUID,
    p_initiator_type TEXT,
    p_initiator_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    governance public.eve_governance_state%ROWTYPE;
    candidate public.eve_model_policies%ROWTYPE;
BEGIN
    governance := public.assert_eve_model_policy_change_allowed();

    IF p_eval_status NOT IN ('passed', 'failed') OR jsonb_typeof(p_eval_summary) <> 'object' THEN
        RAISE EXCEPTION 'invalid_eve_model_policy_evaluation';
    END IF;

    SELECT * INTO candidate
    FROM public.eve_model_policies
    WHERE id = p_policy_id
    FOR UPDATE;

    IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_model_policy'; END IF;
    IF candidate.status NOT IN ('draft', 'evaluated') OR candidate.policy_hash <> p_policy_hash THEN
        RAISE EXCEPTION 'stale_eve_model_policy_evaluation';
    END IF;

    UPDATE public.eve_model_policies
    SET
        status = 'evaluated',
        eval_status = p_eval_status,
        eval_summary = p_eval_summary,
        evaluated_at = NOW(),
        updated_at = NOW()
    WHERE id = p_policy_id;

    PERFORM public.append_eve_model_policy_audit(
        p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
        p_initiator_type, p_initiator_id, p_eval_status, governance.state_version,
        'model_policy.evaluate', 'model_policy:' || p_policy_id,
        CASE WHEN p_eval_status = 'passed' THEN 'succeeded' ELSE 'blocked' END,
        jsonb_build_object('policyHash', p_policy_hash, 'evaluation', p_eval_summary),
        jsonb_build_object('evalStatus', p_eval_status),
        'The server-side model-policy evaluator recorded every required gate check'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.activate_eve_model_policy(
    p_policy_id UUID,
    p_expected_active_policy_id UUID,
    p_audit_id UUID,
    p_actor_id TEXT,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_tenant_id UUID,
    p_initiator_type TEXT,
    p_initiator_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    governance public.eve_governance_state%ROWTYPE;
    candidate public.eve_model_policies%ROWTYPE;
    current_active_id UUID;
BEGIN
    governance := public.assert_eve_model_policy_change_allowed();
    PERFORM pg_advisory_xact_lock(hashtext('eve_model_policy:platform'));

    SELECT id INTO current_active_id
    FROM public.eve_model_policies
    WHERE scope_type = 'platform' AND tenant_id IS NULL AND status = 'active'
    FOR UPDATE;

    IF current_active_id IS DISTINCT FROM p_expected_active_policy_id THEN
        RAISE EXCEPTION 'stale_eve_active_model_policy';
    END IF;

    SELECT * INTO candidate
    FROM public.eve_model_policies
    WHERE id = p_policy_id
    FOR UPDATE;

    IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_model_policy'; END IF;
    IF candidate.status <> 'evaluated' OR candidate.eval_status <> 'passed' THEN
        RAISE EXCEPTION 'eve_model_policy_eval_required';
    END IF;

    UPDATE public.eve_model_policies
    SET status = 'retired', updated_at = NOW()
    WHERE id = current_active_id;

    UPDATE public.eve_model_policies
    SET
        status = 'active',
        previous_policy_id = current_active_id,
        activated_at = NOW(),
        updated_at = NOW()
    WHERE id = p_policy_id;

    UPDATE public.eve_governance_state
    SET
        policy_status = 'ready',
        policy_summary = format('Active model policy v%s passed its eval gate.', candidate.version),
        state_version = state_version + 1,
        updated_by_profile_id = p_actor_profile_id,
        updated_at = NOW()
    WHERE id = 'global'
    RETURNING * INTO governance;

    PERFORM public.append_eve_model_policy_audit(
        p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
        p_initiator_type, p_initiator_id, 'active', governance.state_version,
        'model_policy.activate', 'model_policy:' || p_policy_id, 'succeeded',
        jsonb_build_object('version', candidate.version, 'policyHash', candidate.policy_hash, 'evalStatus', candidate.eval_status),
        jsonb_build_object('activePolicyId', p_policy_id, 'previousPolicyId', current_active_id),
        'An authorized AI-settings manager activated a policy only after its immutable hash passed evaluation'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.rollback_eve_model_policy(
    p_expected_active_policy_id UUID,
    p_audit_id UUID,
    p_actor_id TEXT,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_tenant_id UUID,
    p_initiator_type TEXT,
    p_initiator_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    governance public.eve_governance_state%ROWTYPE;
    current_policy public.eve_model_policies%ROWTYPE;
    prior_policy public.eve_model_policies%ROWTYPE;
BEGIN
    governance := public.assert_eve_model_policy_change_allowed();
    PERFORM pg_advisory_xact_lock(hashtext('eve_model_policy:platform'));

    SELECT * INTO current_policy
    FROM public.eve_model_policies
    WHERE scope_type = 'platform' AND tenant_id IS NULL AND status = 'active'
    FOR UPDATE;

    IF NOT FOUND OR current_policy.id IS DISTINCT FROM p_expected_active_policy_id THEN
        RAISE EXCEPTION 'stale_eve_active_model_policy';
    END IF;
    IF current_policy.previous_policy_id IS NULL THEN
        RAISE EXCEPTION 'missing_eve_model_policy_rollback_target';
    END IF;

    SELECT * INTO prior_policy
    FROM public.eve_model_policies
    WHERE id = current_policy.previous_policy_id
    FOR UPDATE;

    IF NOT FOUND OR prior_policy.eval_status <> 'passed' THEN
        RAISE EXCEPTION 'eve_model_policy_eval_required';
    END IF;

    UPDATE public.eve_model_policies
    SET status = 'rolled_back', updated_at = NOW()
    WHERE id = current_policy.id;

    UPDATE public.eve_model_policies
    SET status = 'active', activated_at = NOW(), updated_at = NOW()
    WHERE id = prior_policy.id;

    UPDATE public.eve_governance_state
    SET
        policy_status = 'ready',
        policy_summary = format('Rolled back to model policy v%s.', prior_policy.version),
        state_version = state_version + 1,
        updated_by_profile_id = p_actor_profile_id,
        updated_at = NOW()
    WHERE id = 'global'
    RETURNING * INTO governance;

    PERFORM public.append_eve_model_policy_audit(
        p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
        p_initiator_type, p_initiator_id, 'active', governance.state_version,
        'model_policy.rollback', 'model_policy:' || current_policy.id, 'succeeded',
        jsonb_build_object('fromVersion', current_policy.version, 'toVersion', prior_policy.version),
        jsonb_build_object('activePolicyId', prior_policy.id, 'rolledBackPolicyId', current_policy.id),
        'An authorized AI-settings manager restored the previously evaluated active policy'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.create_eve_model_budget_override(
    p_policy_id UUID,
    p_scope_type TEXT,
    p_scope_id TEXT,
    p_additional_usd_micros BIGINT,
    p_additional_input_tokens BIGINT,
    p_additional_output_tokens BIGINT,
    p_additional_requests BIGINT,
    p_expires_at TIMESTAMPTZ,
    p_reason TEXT,
    p_audit_id UUID,
    p_actor_id TEXT,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_tenant_id UUID,
    p_initiator_type TEXT,
    p_initiator_id TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    governance public.eve_governance_state%ROWTYPE;
    active_policy public.eve_model_policies%ROWTYPE;
    override_id UUID := gen_random_uuid();
BEGIN
    governance := public.assert_eve_model_policy_change_allowed();

    SELECT * INTO active_policy
    FROM public.eve_model_policies
    WHERE id = p_policy_id AND status = 'active'
    FOR SHARE;

    IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_model_policy'; END IF;
    IF p_scope_type NOT IN ('role', 'subagent') OR btrim(p_scope_id) = '' THEN
        RAISE EXCEPTION 'invalid_eve_model_budget_override_scope';
    END IF;
    IF p_expires_at <= NOW() OR char_length(p_reason) NOT BETWEEN 1 AND 2000 THEN
        RAISE EXCEPTION 'invalid_eve_model_budget_override';
    END IF;
    IF p_expires_at > NOW() + INTERVAL '24 hours'
        OR p_additional_usd_micros > 100000000
        OR p_additional_input_tokens > 2000000
        OR p_additional_output_tokens > 2000000
        OR p_additional_requests > 1000
    THEN
        RAISE EXCEPTION 'eve_model_budget_override_limit_exceeded';
    END IF;
    IF LEAST(p_additional_usd_micros, p_additional_input_tokens, p_additional_output_tokens, p_additional_requests) < 0
        OR p_additional_usd_micros + p_additional_input_tokens + p_additional_output_tokens + p_additional_requests <= 0
    THEN
        RAISE EXCEPTION 'invalid_eve_model_budget_override';
    END IF;
    IF p_scope_type = 'role' AND NOT (active_policy.policy -> 'roles' ? p_scope_id) THEN
        RAISE EXCEPTION 'invalid_eve_model_budget_override_scope';
    END IF;
    IF p_scope_type = 'subagent' AND NOT (active_policy.policy -> 'subagentOverrides' ? p_scope_id) THEN
        RAISE EXCEPTION 'invalid_eve_model_budget_override_scope';
    END IF;

    INSERT INTO public.eve_model_budget_overrides (
        id, policy_id, scope_type, scope_id, additional_usd_micros,
        additional_input_tokens, additional_output_tokens, additional_requests,
        reason, expires_at, created_by_profile_id
    ) VALUES (
        override_id, p_policy_id, p_scope_type, p_scope_id, p_additional_usd_micros,
        p_additional_input_tokens, p_additional_output_tokens, p_additional_requests,
        p_reason, p_expires_at, p_actor_profile_id
    );

    PERFORM public.append_eve_model_policy_audit(
        p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
        p_initiator_type, p_initiator_id, 'active', governance.state_version,
        'model_policy.budget_override', p_scope_type || ':' || p_scope_id, 'succeeded',
        jsonb_build_object('reason', p_reason, 'expiresAt', p_expires_at),
        jsonb_build_object(
            'overrideId', override_id,
            'additionalUsdMicros', p_additional_usd_micros,
            'additionalInputTokens', p_additional_input_tokens,
            'additionalOutputTokens', p_additional_output_tokens,
            'additionalRequests', p_additional_requests
        ),
        'An authorized AI-settings manager granted a bounded, expiring emergency budget override'
    );

    RETURN override_id;
END;
$$;

REVOKE ALL ON FUNCTION public.assert_eve_model_policy_change_allowed() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_eve_ai_settings_grant_tenant() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.append_eve_model_policy_audit(UUID, UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, BIGINT, TEXT, TEXT, TEXT, JSONB, JSONB, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_eve_model_policy_draft(JSONB, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.evaluate_eve_model_policy_draft(UUID, TEXT, TEXT, JSONB, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.activate_eve_model_policy(UUID, UUID, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rollback_eve_model_policy(UUID, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_eve_model_budget_override(UUID, TEXT, TEXT, BIGINT, BIGINT, BIGINT, BIGINT, TIMESTAMPTZ, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_eve_model_policy_draft(JSONB, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.evaluate_eve_model_policy_draft(UUID, TEXT, TEXT, JSONB, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.activate_eve_model_policy(UUID, UUID, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.rollback_eve_model_policy(UUID, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_eve_model_budget_override(UUID, TEXT, TEXT, BIGINT, BIGINT, BIGINT, BIGINT, TIMESTAMPTZ, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) TO service_role;

COMMENT ON TABLE public.eve_model_policies IS
    'Versioned, eval-gated Eve model policy. V1 active scope is platform-wide; tenant scope is reserved but inactive.';
COMMENT ON TABLE public.eve_model_budget_overrides IS
    'Append-only, bounded, expiring emergency increases to active Eve model-policy hard limits.';
