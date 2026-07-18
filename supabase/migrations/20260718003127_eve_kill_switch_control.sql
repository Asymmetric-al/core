-- Eve granular kill-switch control path (issue #420).
--
-- The RPC is service-role-only. It updates the app-owned governance singleton
-- and appends the corresponding ADR-0020 audit event in one transaction.

UPDATE public.eve_governance_state
SET kill_switch_state = jsonb_build_object(
    'all_automation', CASE WHEN jsonb_typeof(kill_switch_state -> 'all_automation') = 'boolean' THEN kill_switch_state -> 'all_automation' ELSE 'false'::JSONB END,
    'active_runs', CASE WHEN jsonb_typeof(kill_switch_state -> 'active_runs') = 'boolean' THEN kill_switch_state -> 'active_runs' ELSE 'false'::JSONB END,
    'github_actions', CASE WHEN jsonb_typeof(kill_switch_state -> 'github_actions') = 'boolean' THEN kill_switch_state -> 'github_actions' ELSE 'false'::JSONB END,
    'production_writes', CASE WHEN jsonb_typeof(kill_switch_state -> 'production_writes') = 'boolean' THEN kill_switch_state -> 'production_writes' ELSE 'false'::JSONB END,
    'sandbox_networking', CASE WHEN jsonb_typeof(kill_switch_state -> 'sandbox_networking') = 'boolean' THEN kill_switch_state -> 'sandbox_networking' ELSE 'false'::JSONB END,
    'dynamic_workflows', CASE WHEN jsonb_typeof(kill_switch_state -> 'dynamic_workflows') = 'boolean' THEN kill_switch_state -> 'dynamic_workflows' ELSE 'false'::JSONB END,
    'model_policy_changes', CASE WHEN jsonb_typeof(kill_switch_state -> 'model_policy_changes') = 'boolean' THEN kill_switch_state -> 'model_policy_changes' ELSE 'false'::JSONB END,
    'force_approval', CASE WHEN jsonb_typeof(kill_switch_state -> 'force_approval') = 'boolean' THEN kill_switch_state -> 'force_approval' ELSE 'false'::JSONB END
);

ALTER TABLE public.eve_governance_state
ALTER COLUMN kill_switch_state SET DEFAULT '{
    "all_automation": false,
    "active_runs": false,
    "github_actions": false,
    "production_writes": false,
    "sandbox_networking": false,
    "dynamic_workflows": false,
    "model_policy_changes": false,
    "force_approval": false
}'::JSONB;

ALTER TABLE public.eve_governance_state
ADD CONSTRAINT eve_governance_state_kill_switch_shape_check
CHECK (
    kill_switch_state ?& ARRAY[
        'all_automation',
        'active_runs',
        'github_actions',
        'production_writes',
        'sandbox_networking',
        'dynamic_workflows',
        'model_policy_changes',
        'force_approval'
    ]
    AND kill_switch_state - ARRAY[
        'all_automation',
        'active_runs',
        'github_actions',
        'production_writes',
        'sandbox_networking',
        'dynamic_workflows',
        'model_policy_changes',
        'force_approval'
    ]::TEXT[] = '{}'::JSONB
    AND jsonb_typeof(kill_switch_state -> 'all_automation') = 'boolean'
    AND jsonb_typeof(kill_switch_state -> 'active_runs') = 'boolean'
    AND jsonb_typeof(kill_switch_state -> 'github_actions') = 'boolean'
    AND jsonb_typeof(kill_switch_state -> 'production_writes') = 'boolean'
    AND jsonb_typeof(kill_switch_state -> 'sandbox_networking') = 'boolean'
    AND jsonb_typeof(kill_switch_state -> 'dynamic_workflows') = 'boolean'
    AND jsonb_typeof(kill_switch_state -> 'model_policy_changes') = 'boolean'
    AND jsonb_typeof(kill_switch_state -> 'force_approval') = 'boolean'
);

CREATE OR REPLACE FUNCTION public.set_eve_kill_switch(
    p_switch_key TEXT,
    p_enabled BOOLEAN,
    p_expected_state_version BIGINT,
    p_audit_id UUID,
    p_actor_id TEXT,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_tenant_id UUID,
    p_initiator_type TEXT,
    p_initiator_id TEXT,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    allowed_switches CONSTANT TEXT[] := ARRAY[
        'all_automation',
        'active_runs',
        'github_actions',
        'production_writes',
        'sandbox_networking',
        'dynamic_workflows',
        'model_policy_changes',
        'force_approval'
    ];
    current_state public.eve_governance_state%ROWTYPE;
    next_state public.eve_governance_state%ROWTYPE;
    previous_enabled BOOLEAN;
    change_result TEXT;
BEGIN
    IF p_switch_key IS NULL OR NOT (p_switch_key = ANY (allowed_switches)) THEN
        RAISE EXCEPTION 'invalid_eve_kill_switch';
    END IF;

    IF p_enabled IS NULL OR p_expected_state_version IS NULL OR p_audit_id IS NULL THEN
        RAISE EXCEPTION 'missing_eve_kill_switch_transition';
    END IF;

    IF p_actor_id IS NULL OR btrim(p_actor_id) = '' THEN
        RAISE EXCEPTION 'missing_eve_kill_switch_actor';
    END IF;

    IF p_initiator_id IS NULL OR btrim(p_initiator_id) = '' THEN
        RAISE EXCEPTION 'missing_eve_kill_switch_initiator';
    END IF;

    IF p_initiator_type IS NULL OR btrim(p_initiator_type) = '' THEN
        RAISE EXCEPTION 'missing_eve_kill_switch_initiator_type';
    END IF;

    SELECT *
    INTO current_state
    FROM public.eve_governance_state
    WHERE id = 'global'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'missing_eve_governance_state';
    END IF;

    IF current_state.state_version <> p_expected_state_version THEN
        RAISE EXCEPTION 'stale_eve_governance_state';
    END IF;

    previous_enabled := (current_state.kill_switch_state ->> p_switch_key)::BOOLEAN;
    change_result := CASE
        WHEN previous_enabled = p_enabled THEN 'skipped'
        ELSE 'succeeded'
    END;

    IF previous_enabled = p_enabled THEN
        next_state := current_state;
    ELSE
        UPDATE public.eve_governance_state
        SET
            kill_switch_state = jsonb_set(
                kill_switch_state,
                ARRAY[p_switch_key],
                to_jsonb(p_enabled),
                FALSE
            ),
            state_version = state_version + 1,
            updated_by_profile_id = p_actor_profile_id,
            updated_at = NOW()
        WHERE id = 'global'
        RETURNING * INTO next_state;
    END IF;

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
        'eve-governance-kernel',
        next_state.policy_status,
        next_state.state_version,
        'kill_switch.set',
        'kill_switch:' || p_switch_key,
        change_result,
        'not_used',
        jsonb_build_object(
            'reason', COALESCE(p_reason, 'No reason provided.'),
            'switch', p_switch_key
        )::TEXT,
        jsonb_build_object(
            'previousEnabled', previous_enabled,
            'enabled', p_enabled,
            'stateVersion', next_state.state_version
        )::TEXT,
        format(
            'kill_switch.set %s. Rationale: An authorized admin deliberately set %s to %s. Policy: eve-governance-kernel (%s).',
            change_result,
            p_switch_key,
            p_enabled,
            next_state.policy_status
        ),
        jsonb_build_object(
            'operation', 'set_eve_kill_switch',
            'changed', previous_enabled IS DISTINCT FROM p_enabled
        ),
        'eve-audit-v1'
    );

    RETURN jsonb_build_object(
        'changed', previous_enabled IS DISTINCT FROM p_enabled,
        'switchKey', p_switch_key,
        'enabled', p_enabled,
        'stateVersion', next_state.state_version,
        'updatedAt', next_state.updated_at,
        'killSwitchState', next_state.kill_switch_state,
        'auditId', p_audit_id
    );
END;
$$;

REVOKE ALL ON FUNCTION public.set_eve_kill_switch(
    TEXT,
    BOOLEAN,
    BIGINT,
    UUID,
    TEXT,
    UUID,
    TEXT,
    UUID,
    TEXT,
    TEXT,
    TEXT
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.set_eve_kill_switch(
    TEXT,
    BOOLEAN,
    BIGINT,
    UUID,
    TEXT,
    UUID,
    TEXT,
    UUID,
    TEXT,
    TEXT,
    TEXT
) TO service_role;

COMMENT ON FUNCTION public.set_eve_kill_switch(
    TEXT,
    BOOLEAN,
    BIGINT,
    UUID,
    TEXT,
    UUID,
    TEXT,
    UUID,
    TEXT,
    TEXT,
    TEXT
) IS 'Atomically actuates one Eve kill switch and appends its accountable redacted audit event.';
