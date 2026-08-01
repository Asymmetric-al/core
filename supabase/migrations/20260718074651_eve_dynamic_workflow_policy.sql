-- Eve dynamic workflow policy boundary (issue #434, ADR-0035).
--
-- Dynamic orchestration remains release-gated. This migration extends the
-- app-owned action catalog with the dynamic_workflows governance domain and
-- adds an atomic, service-safe consultation path. The caller cannot choose its
-- trust zone, costs, governance domain, or identity metadata.

ALTER TABLE public.eve_action_policy_catalog
    DROP CONSTRAINT eve_action_policy_catalog_governance_domain_check;
ALTER TABLE public.eve_action_policy_catalog
    ADD CONSTRAINT eve_action_policy_catalog_governance_domain_check
    CHECK (governance_domain IN ('production_writes', 'dynamic_workflows'));

UPDATE public.eve_action_policy_catalog
SET governance_domain = 'dynamic_workflows'
WHERE action_id = 'engineering.subagent.delegate';

INSERT INTO public.eve_action_policy_catalog (
    action_id, trust_zone, write_class, governance_domain,
    budget_scope_type, budget_scope_id, request_cost, usd_micros_cost,
    input_token_cost, output_token_cost
) VALUES (
    'engineering.dynamic_workflow.execute',
    'engineering',
    'operational',
    'dynamic_workflows',
    'dynamic_workflow',
    'orchestration',
    1,
    2000,
    200,
    100
) ON CONFLICT (action_id) DO UPDATE SET
    trust_zone = EXCLUDED.trust_zone,
    write_class = EXCLUDED.write_class,
    governance_domain = EXCLUDED.governance_domain,
    budget_scope_type = EXCLUDED.budget_scope_type,
    budget_scope_id = EXCLUDED.budget_scope_id,
    request_cost = EXCLUDED.request_cost,
    usd_micros_cost = EXCLUDED.usd_micros_cost,
    input_token_cost = EXCLUDED.input_token_cost,
    output_token_cost = EXCLUDED.output_token_cost,
    is_active = TRUE;

INSERT INTO public.eve_operational_budgets (
    scope_type, scope_id, max_requests, max_usd_micros,
    max_input_tokens, max_output_tokens, window_seconds
) VALUES (
    'dynamic_workflow', 'orchestration', 120, 250000,
    24000, 12000, 3600
) ON CONFLICT (scope_type, scope_id) DO UPDATE SET
    max_requests = EXCLUDED.max_requests,
    max_usd_micros = EXCLUDED.max_usd_micros,
    max_input_tokens = EXCLUDED.max_input_tokens,
    max_output_tokens = EXCLUDED.max_output_tokens,
    window_seconds = EXCLUDED.window_seconds,
    updated_at = NOW();

ALTER TABLE public.eve_policy_decisions
    ALTER COLUMN actor_profile_id DROP NOT NULL,
    ADD COLUMN actor_id TEXT,
    ADD COLUMN identity_mode TEXT
        CHECK (identity_mode IN ('admin', 'service')),
    ADD COLUMN session_id TEXT
        REFERENCES public.eve_session_ownership(session_id) ON DELETE RESTRICT,
    ADD CONSTRAINT eve_policy_decisions_verified_identity_check CHECK (
        actor_profile_id IS NOT NULL
        OR (
            identity_mode = 'service'
            AND actor_id IS NOT NULL
            AND session_id IS NOT NULL
        )
    );

CREATE INDEX eve_policy_decisions_session_created_idx
    ON public.eve_policy_decisions (session_id, created_at DESC)
    WHERE session_id IS NOT NULL;

-- Keep the original admin/profile consultation for production-write actions,
-- but prevent it from accidentally evaluating the new domain with its legacy
-- production_writes-only governance check.
ALTER FUNCTION public.consult_eve_approval_budget_policy(
    TEXT, TEXT, UUID, UUID, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT
) RENAME TO consult_eve_approval_budget_policy_legacy;

REVOKE ALL ON FUNCTION public.consult_eve_approval_budget_policy_legacy(
    TEXT, TEXT, UUID, UUID, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.consult_eve_approval_budget_policy(
    p_action_id TEXT,
    p_target_key TEXT,
    p_approval_id UUID,
    p_decision_id UUID,
    p_audit_id UUID,
    p_actor_id TEXT,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_tenant_id UUID,
    p_initiator_type TEXT,
    p_initiator_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    action_domain TEXT;
BEGIN
    SELECT governance_domain INTO action_domain
    FROM public.eve_action_policy_catalog
    WHERE action_id = p_action_id AND is_active;
    IF action_domain = 'dynamic_workflows' THEN
        RAISE EXCEPTION 'eve_dynamic_action_requires_runtime_session';
    END IF;
    RETURN public.consult_eve_approval_budget_policy_legacy(
        p_action_id,
        p_target_key,
        p_approval_id,
        p_decision_id,
        p_audit_id,
        p_actor_id,
        p_actor_profile_id,
        p_actor_role,
        p_tenant_id,
        p_initiator_type,
        p_initiator_id
    );
END;
$$;

REVOKE ALL ON FUNCTION public.consult_eve_approval_budget_policy(
    TEXT, TEXT, UUID, UUID, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consult_eve_approval_budget_policy(
    TEXT, TEXT, UUID, UUID, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT
) TO service_role;

CREATE OR REPLACE FUNCTION public.consult_eve_runtime_budget_policy(
    p_action_id TEXT,
    p_target_key TEXT,
    p_decision_id UUID,
    p_audit_id UUID,
    p_session_id TEXT,
    p_actor_id TEXT,
    p_tenant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    ownership public.eve_session_ownership%ROWTYPE;
    action_row public.eve_action_policy_catalog%ROWTYPE;
    policy_row public.eve_approval_policies%ROWTYPE;
    governance public.eve_governance_state%ROWTYPE;
    budget_row public.eve_operational_budgets%ROWTYPE;
    usage_row public.eve_budget_usage_windows%ROWTYPE;
    additional_requests BIGINT := 0;
    additional_usd_micros BIGINT := 0;
    additional_input_tokens BIGINT := 0;
    additional_output_tokens BIGINT := 0;
    window_start TIMESTAMPTZ;
    decision TEXT;
    reason TEXT;
    resolved_trust_zone TEXT := 'product_admin';
    resolved_write_class TEXT := 'business_data';
BEGIN
    IF p_action_id !~ '^[a-zA-Z0-9._-]{1,120}$' THEN
        RAISE EXCEPTION 'invalid_eve_policy_action_id';
    END IF;
    IF p_target_key !~ '^[a-zA-Z0-9:_-]{1,120}$' THEN
        RAISE EXCEPTION 'invalid_eve_policy_target_key';
    END IF;

    SELECT * INTO ownership
    FROM public.eve_session_ownership
    WHERE session_id = p_session_id
      AND tenant_id = p_tenant_id
      AND owner_actor_id = p_actor_id
    FOR SHARE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'eve_runtime_session_identity_mismatch';
    END IF;

    SELECT * INTO action_row
    FROM public.eve_action_policy_catalog
    WHERE action_id = p_action_id AND is_active
    FOR SHARE;
    IF NOT FOUND THEN
        decision := 'deny';
        reason := 'unknown_action';
    ELSE
        resolved_trust_zone := action_row.trust_zone;
        resolved_write_class := action_row.write_class;
    END IF;

    SELECT * INTO governance
    FROM public.eve_governance_state
    WHERE id = 'global'
    FOR SHARE;
    IF decision IS NULL AND (
        NOT FOUND
        OR NOT governance.release_enabled
        OR governance.emergency_off
        OR governance.policy_status <> 'ready'
        OR COALESCE(
            (governance.kill_switch_state ->> 'all_automation')::BOOLEAN,
            TRUE
        )
        OR COALESCE(
            (governance.kill_switch_state ->> action_row.governance_domain)::BOOLEAN,
            TRUE
        )
    ) THEN
        decision := 'deny';
        reason := 'governance_blocked';
    END IF;

    SELECT * INTO policy_row
    FROM public.eve_approval_policies
    WHERE eve_approval_policies.trust_zone = resolved_trust_zone
    FOR SHARE;
    IF decision IS NULL AND NOT FOUND THEN
        decision := 'deny';
        reason := 'policy_denied';
    END IF;
    IF decision IS NULL AND (
        action_row.write_class <> 'operational'
        OR policy_row.operational_mode = 'deny'
    ) THEN
        decision := 'deny';
        reason := 'policy_denied';
    END IF;
    IF decision IS NULL AND (
        policy_row.operational_mode = 'require_approval'
        OR COALESCE(
            (governance.kill_switch_state ->> 'force_approval')::BOOLEAN,
            TRUE
        )
    ) THEN
        decision := 'deny';
        reason := 'approval_required';
    END IF;

    IF decision IS NULL THEN
        SELECT * INTO budget_row
        FROM public.eve_operational_budgets
        WHERE scope_type = action_row.budget_scope_type
          AND scope_id = action_row.budget_scope_id
        FOR SHARE;
        IF NOT FOUND THEN
            decision := 'pause';
            reason := 'budget_exhausted';
        END IF;
    END IF;

    IF budget_row.id IS NOT NULL THEN
        window_start := to_timestamp(
            floor(extract(epoch FROM NOW()) / budget_row.window_seconds)
            * budget_row.window_seconds
        );
        INSERT INTO public.eve_budget_usage_windows (
            budget_id, window_started_at
        ) VALUES (
            budget_row.id, window_start
        ) ON CONFLICT (budget_id, window_started_at) DO NOTHING;
        SELECT * INTO usage_row
        FROM public.eve_budget_usage_windows
        WHERE budget_id = budget_row.id
          AND window_started_at = window_start
        FOR UPDATE;

        SELECT
            COALESCE(SUM(active_override.additional_requests), 0),
            COALESCE(SUM(active_override.additional_usd_micros), 0),
            COALESCE(SUM(active_override.additional_input_tokens), 0),
            COALESCE(SUM(active_override.additional_output_tokens), 0)
        INTO
            additional_requests,
            additional_usd_micros,
            additional_input_tokens,
            additional_output_tokens
        FROM public.eve_budget_emergency_overrides active_override
        WHERE active_override.budget_id = budget_row.id
          AND active_override.tenant_id = p_tenant_id
          AND active_override.expires_at > NOW();
    END IF;

    IF decision IS NULL AND (
        usage_row.used_requests + action_row.request_cost
            > budget_row.max_requests + additional_requests
        OR usage_row.used_usd_micros + action_row.usd_micros_cost
            > budget_row.max_usd_micros + additional_usd_micros
        OR usage_row.used_input_tokens + action_row.input_token_cost
            > budget_row.max_input_tokens + additional_input_tokens
        OR usage_row.used_output_tokens + action_row.output_token_cost
            > budget_row.max_output_tokens + additional_output_tokens
    ) THEN
        decision := 'pause';
        reason := 'budget_exhausted';
    END IF;

    IF decision IS NULL THEN
        decision := 'allow';
        reason := 'operational_policy_allowed';
        UPDATE public.eve_budget_usage_windows
        SET used_requests = used_requests + action_row.request_cost,
            used_usd_micros = used_usd_micros + action_row.usd_micros_cost,
            used_input_tokens = used_input_tokens + action_row.input_token_cost,
            used_output_tokens = used_output_tokens + action_row.output_token_cost,
            updated_at = NOW()
        WHERE id = usage_row.id;
    END IF;

    INSERT INTO public.eve_policy_decisions (
        id, tenant_id, actor_profile_id, actor_id, identity_mode, session_id,
        action_id, target_key, trust_zone, write_class, decision, reason,
        budget_id
    ) VALUES (
        p_decision_id,
        p_tenant_id,
        ownership.owner_profile_id,
        ownership.owner_actor_id,
        ownership.identity_mode,
        ownership.session_id,
        p_action_id,
        p_target_key,
        resolved_trust_zone,
        resolved_write_class,
        decision,
        reason,
        budget_row.id
    );

    INSERT INTO public.eve_audit_events (
        id, tenant_id, actor_id, actor_profile_id, actor_role, identity_mode,
        initiator_type, initiator_id, policy_id, policy_status,
        governance_state_version, action, target, result, model_role,
        evidence_summary, change_summary, decision_summary, debug_metadata,
        redaction_version
    ) VALUES (
        p_audit_id,
        p_tenant_id,
        ownership.owner_actor_id,
        ownership.owner_profile_id,
        ownership.actor_role,
        ownership.identity_mode,
        ownership.initiator_type,
        ownership.initiator_id,
        'eve-dynamic-workflow-v1',
        decision,
        governance.state_version,
        'dynamic_workflow.policy_consult',
        'policy_action:' || p_action_id,
        CASE WHEN decision = 'allow' THEN 'succeeded' ELSE 'blocked' END,
        'not_used',
        jsonb_build_object(
            'trustZone', resolved_trust_zone,
            'writeClass', resolved_write_class,
            'reason', reason
        )::TEXT,
        jsonb_build_object('decision', decision)::TEXT,
        format(
            'Dynamic workflow policy consultation returned %s (%s).',
            decision,
            reason
        ),
        jsonb_build_object(
            'source', 'eve_runtime_budget_rpc',
            'sessionId', ownership.session_id,
            'governanceDomain', action_row.governance_domain
        ),
        'eve-audit-v1'
    );

    RETURN jsonb_build_object(
        'actionId', p_action_id,
        'trustZone', resolved_trust_zone,
        'writeClass', resolved_write_class,
        'decision', decision,
        'reason', reason
    );
END;
$$;

REVOKE ALL ON FUNCTION public.consult_eve_runtime_budget_policy(
    TEXT, TEXT, UUID, UUID, TEXT, TEXT, UUID
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consult_eve_runtime_budget_policy(
    TEXT, TEXT, UUID, UUID, TEXT, TEXT, UUID
) TO service_role;

COMMENT ON FUNCTION public.consult_eve_runtime_budget_policy(
    TEXT, TEXT, UUID, UUID, TEXT, TEXT, UUID
) IS
    'Atomically verifies Eve session ownership, governance, operational policy, and budget before a runtime workflow action.';
