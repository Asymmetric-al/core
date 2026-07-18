-- Eve approval and budget policy tracer (issue #423, ADR-0024).
--
-- Action classification is app-owned catalog data. Callers submit only an
-- action id and a non-sensitive stable target key; they cannot select a trust
-- zone, write class, governance domain, or budget cost.

CREATE TABLE public.eve_action_policy_catalog (
    action_id TEXT PRIMARY KEY,
    trust_zone TEXT NOT NULL CHECK (trust_zone IN ('engineering', 'product_admin', 'memory')),
    write_class TEXT NOT NULL CHECK (write_class IN ('operational', 'business_data')),
    governance_domain TEXT NOT NULL CHECK (governance_domain = 'production_writes'),
    budget_scope_type TEXT NOT NULL CHECK (budget_scope_type IN ('model_role', 'subagent', 'dynamic_workflow', 'eval', 'judge', 'expensive_feature')),
    budget_scope_id TEXT NOT NULL,
    request_cost BIGINT NOT NULL CHECK (request_cost > 0),
    usd_micros_cost BIGINT NOT NULL CHECK (usd_micros_cost >= 0),
    input_token_cost BIGINT NOT NULL CHECK (input_token_cost >= 0),
    output_token_cost BIGINT NOT NULL CHECK (output_token_cost >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.eve_approval_policies (
    trust_zone TEXT PRIMARY KEY CHECK (trust_zone IN ('engineering', 'product_admin', 'memory')),
    operational_mode TEXT NOT NULL CHECK (operational_mode IN ('allow', 'require_approval', 'deny')),
    updated_by_profile_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.eve_operational_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope_type TEXT NOT NULL CHECK (scope_type IN ('model_role', 'subagent', 'dynamic_workflow', 'eval', 'judge', 'expensive_feature')),
    scope_id TEXT NOT NULL,
    max_requests BIGINT NOT NULL CHECK (max_requests >= 0),
    max_usd_micros BIGINT NOT NULL CHECK (max_usd_micros >= 0),
    max_input_tokens BIGINT NOT NULL CHECK (max_input_tokens >= 0),
    max_output_tokens BIGINT NOT NULL CHECK (max_output_tokens >= 0),
    window_seconds INTEGER NOT NULL CHECK (window_seconds BETWEEN 60 AND 2592000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (scope_type, scope_id)
);

CREATE TABLE public.eve_budget_usage_windows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES public.eve_operational_budgets(id) ON DELETE CASCADE,
    window_started_at TIMESTAMPTZ NOT NULL,
    used_requests BIGINT NOT NULL DEFAULT 0 CHECK (used_requests >= 0),
    used_usd_micros BIGINT NOT NULL DEFAULT 0 CHECK (used_usd_micros >= 0),
    used_input_tokens BIGINT NOT NULL DEFAULT 0 CHECK (used_input_tokens >= 0),
    used_output_tokens BIGINT NOT NULL DEFAULT 0 CHECK (used_output_tokens >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (budget_id, window_started_at)
);

CREATE TABLE public.eve_policy_permission_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission TEXT NOT NULL CHECK (permission IN ('approval.policy.manage', 'budget.emergency_override')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    granted_by_profile_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, profile_id, permission)
);

CREATE TABLE public.eve_action_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    action_id TEXT NOT NULL REFERENCES public.eve_action_policy_catalog(action_id),
    target_key TEXT NOT NULL CHECK (target_key ~ '^[a-zA-Z0-9:_-]{1,120}$'),
    trust_zone TEXT NOT NULL CHECK (trust_zone IN ('engineering', 'product_admin', 'memory')),
    approval_level TEXT NOT NULL CHECK (approval_level IN ('zone', 'strict')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'used')),
    requested_by_profile_id UUID NOT NULL REFERENCES public.profiles(id),
    decided_by_profile_id UUID REFERENCES public.profiles(id),
    decision_reason TEXT,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX eve_action_approvals_pending_idx
    ON public.eve_action_approvals (tenant_id, status, created_at DESC);

CREATE TABLE public.eve_budget_emergency_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    budget_id UUID NOT NULL REFERENCES public.eve_operational_budgets(id) ON DELETE CASCADE,
    additional_requests BIGINT NOT NULL DEFAULT 0 CHECK (additional_requests BETWEEN 0 AND 1000),
    additional_usd_micros BIGINT NOT NULL DEFAULT 0 CHECK (additional_usd_micros BETWEEN 0 AND 100000000),
    additional_input_tokens BIGINT NOT NULL DEFAULT 0 CHECK (additional_input_tokens BETWEEN 0 AND 2000000),
    additional_output_tokens BIGINT NOT NULL DEFAULT 0 CHECK (additional_output_tokens BETWEEN 0 AND 2000000),
    reason TEXT NOT NULL CHECK (char_length(btrim(reason)) BETWEEN 1 AND 500),
    expires_at TIMESTAMPTZ NOT NULL,
    created_by_profile_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (expires_at > created_at AND expires_at <= created_at + INTERVAL '24 hours'),
    CHECK (additional_requests + additional_usd_micros + additional_input_tokens + additional_output_tokens > 0)
);

CREATE INDEX eve_budget_emergency_overrides_active_idx
    ON public.eve_budget_emergency_overrides (budget_id, expires_at DESC);

CREATE TABLE public.eve_policy_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    actor_profile_id UUID NOT NULL REFERENCES public.profiles(id),
    action_id TEXT NOT NULL,
    target_key TEXT NOT NULL CHECK (target_key ~ '^[a-zA-Z0-9:_-]{1,120}$'),
    trust_zone TEXT NOT NULL CHECK (trust_zone IN ('engineering', 'product_admin', 'memory')),
    write_class TEXT NOT NULL CHECK (write_class IN ('operational', 'business_data')),
    decision TEXT NOT NULL CHECK (decision IN ('allow', 'deny', 'pause', 'override')),
    reason TEXT NOT NULL,
    approval_id UUID REFERENCES public.eve_action_approvals(id),
    budget_id UUID REFERENCES public.eve_operational_budgets(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX eve_policy_decisions_tenant_created_idx
    ON public.eve_policy_decisions (tenant_id, created_at DESC);

CREATE TABLE public.eve_policy_tracer_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    action_id TEXT NOT NULL REFERENCES public.eve_action_policy_catalog(action_id),
    target_key TEXT NOT NULL CHECK (target_key ~ '^[a-zA-Z0-9:_-]{1,120}$'),
    created_by_profile_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.eve_action_policy_catalog (
    action_id, trust_zone, write_class, governance_domain,
    budget_scope_type, budget_scope_id, request_cost, usd_micros_cost,
    input_token_cost, output_token_cost
) VALUES
    ('engineering.review_artifact.write', 'engineering', 'operational', 'production_writes', 'expensive_feature', 'policy-tracer', 1, 1000, 100, 50),
    ('product.internal_status.write', 'product_admin', 'operational', 'production_writes', 'expensive_feature', 'policy-tracer', 1, 1000, 100, 50),
    ('memory.advisory.write', 'memory', 'operational', 'production_writes', 'expensive_feature', 'policy-tracer', 1, 1000, 100, 50),
    ('product.donor.write', 'product_admin', 'business_data', 'production_writes', 'expensive_feature', 'policy-tracer', 1, 1000, 100, 50);

INSERT INTO public.eve_approval_policies (trust_zone, operational_mode) VALUES
    ('engineering', 'allow'),
    ('product_admin', 'require_approval'),
    ('memory', 'require_approval');

INSERT INTO public.eve_operational_budgets (
    scope_type, scope_id, max_requests, max_usd_micros,
    max_input_tokens, max_output_tokens, window_seconds
) VALUES ('expensive_feature', 'policy-tracer', 3, 10000, 1000, 500, 3600);

ALTER TABLE public.eve_action_policy_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_approval_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_operational_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_budget_usage_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_policy_permission_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_action_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_budget_emergency_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_policy_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_policy_tracer_artifacts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.eve_action_policy_catalog, public.eve_approval_policies,
    public.eve_operational_budgets, public.eve_budget_usage_windows,
    public.eve_policy_permission_grants, public.eve_action_approvals,
    public.eve_budget_emergency_overrides, public.eve_policy_decisions,
    public.eve_policy_tracer_artifacts FROM anon, authenticated;

GRANT SELECT ON TABLE public.eve_action_policy_catalog, public.eve_approval_policies,
    public.eve_operational_budgets, public.eve_budget_usage_windows,
    public.eve_policy_permission_grants, public.eve_action_approvals,
    public.eve_budget_emergency_overrides, public.eve_policy_decisions,
    public.eve_policy_tracer_artifacts TO service_role;

CREATE OR REPLACE FUNCTION public.assert_eve_policy_actor_tenant(
    p_tenant_id UUID,
    p_actor_profile_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_actor_profile_id AND tenant_id = p_tenant_id
    ) THEN
        RAISE EXCEPTION 'eve_policy_actor_tenant_mismatch';
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_eve_policy_permission(
    p_tenant_id UUID,
    p_profile_id UUID,
    p_actor_role TEXT,
    p_permission TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT p_actor_role = 'super_admin' OR EXISTS (
        SELECT 1 FROM public.eve_policy_permission_grants
        WHERE tenant_id = p_tenant_id
          AND profile_id = p_profile_id
          AND permission = p_permission
          AND is_active
    );
$$;

CREATE OR REPLACE FUNCTION public.enforce_eve_policy_permission_tenant()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = NEW.profile_id AND tenant_id = NEW.tenant_id
    ) OR NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = NEW.granted_by_profile_id AND tenant_id = NEW.tenant_id
    ) THEN
        RAISE EXCEPTION 'eve_policy_permission_profile_tenant_mismatch';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_eve_policy_permission_tenant
BEFORE INSERT OR UPDATE ON public.eve_policy_permission_grants
FOR EACH ROW EXECUTE FUNCTION public.enforce_eve_policy_permission_tenant();

CREATE OR REPLACE FUNCTION public.append_eve_approval_budget_audit(
    p_audit_id UUID,
    p_tenant_id UUID,
    p_actor_id TEXT,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_initiator_type TEXT,
    p_initiator_id TEXT,
    p_action TEXT,
    p_target TEXT,
    p_result TEXT,
    p_trust_zone TEXT,
    p_write_class TEXT,
    p_decision TEXT,
    p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.eve_audit_events (
        id, tenant_id, actor_id, actor_profile_id, actor_role, identity_mode,
        initiator_type, initiator_id, policy_id, policy_status, action, target,
        result, model_role, evidence_summary, change_summary, decision_summary,
        debug_metadata, redaction_version
    ) VALUES (
        p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
        'admin', p_initiator_type, p_initiator_id, 'eve-approval-budget',
        p_decision, p_action, p_target, p_result, 'not_used',
        jsonb_build_object('trustZone', p_trust_zone, 'writeClass', p_write_class, 'reason', p_reason)::TEXT,
        jsonb_build_object('decision', p_decision)::TEXT,
        format('%s %s. Rationale: %s. Policy: eve-approval-budget (%s).', p_action, p_result, p_reason, p_decision),
        jsonb_build_object('source', 'eve_approval_budget_rpc', 'trustZone', p_trust_zone, 'writeClass', p_write_class),
        'eve-audit-v1'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.record_eve_policy_decision(
    p_decision_id UUID,
    p_audit_id UUID,
    p_tenant_id UUID,
    p_actor_id TEXT,
    p_actor_profile_id UUID,
    p_actor_role TEXT,
    p_initiator_type TEXT,
    p_initiator_id TEXT,
    p_action_id TEXT,
    p_target_key TEXT,
    p_trust_zone TEXT,
    p_write_class TEXT,
    p_decision TEXT,
    p_reason TEXT,
    p_approval_id UUID,
    p_budget_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.eve_policy_decisions (
        id, tenant_id, actor_profile_id, action_id, target_key, trust_zone,
        write_class, decision, reason, approval_id, budget_id
    ) VALUES (
        p_decision_id, p_tenant_id, p_actor_profile_id, p_action_id,
        p_target_key, p_trust_zone, p_write_class, p_decision, p_reason,
        p_approval_id, p_budget_id
    );
    PERFORM public.append_eve_approval_budget_audit(
        p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
        p_initiator_type, p_initiator_id, 'approval_budget.consult',
        'policy_action:' || p_action_id,
        CASE WHEN p_decision = 'allow' THEN 'succeeded' ELSE 'blocked' END,
        p_trust_zone, p_write_class, p_decision, p_reason
    );
END;
$$;

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
    action_row public.eve_action_policy_catalog%ROWTYPE;
    policy_row public.eve_approval_policies%ROWTYPE;
    governance public.eve_governance_state%ROWTYPE;
    budget_row public.eve_operational_budgets%ROWTYPE;
    usage_row public.eve_budget_usage_windows%ROWTYPE;
    approval_row public.eve_action_approvals%ROWTYPE;
    additional_requests BIGINT := 0;
    additional_usd_micros BIGINT := 0;
    additional_input_tokens BIGINT := 0;
    additional_output_tokens BIGINT := 0;
    approval_valid BOOLEAN := FALSE;
    artifact_id UUID;
    window_start TIMESTAMPTZ;
    decision TEXT;
    reason TEXT;
BEGIN
    PERFORM public.assert_eve_policy_actor_tenant(p_tenant_id, p_actor_profile_id);
    IF p_action_id !~ '^[a-zA-Z0-9._-]{1,120}$' THEN
        RAISE EXCEPTION 'invalid_eve_policy_action_id';
    END IF;
    IF p_target_key !~ '^[a-zA-Z0-9:_-]{1,120}$' THEN
        RAISE EXCEPTION 'invalid_eve_policy_target_key';
    END IF;

    SELECT * INTO action_row FROM public.eve_action_policy_catalog
    WHERE action_id = p_action_id AND is_active FOR SHARE;
    IF NOT FOUND THEN
        PERFORM public.record_eve_policy_decision(
            p_decision_id, p_audit_id, p_tenant_id, p_actor_id,
            p_actor_profile_id, p_actor_role, p_initiator_type, p_initiator_id,
            p_action_id, p_target_key, 'product_admin', 'business_data',
            'deny', 'unknown_action', NULL, NULL
        );
        RETURN jsonb_build_object('actionId', p_action_id, 'trustZone', 'product_admin', 'writeClass', 'business_data', 'decision', 'deny', 'reason', 'unknown_action');
    END IF;

    SELECT * INTO governance FROM public.eve_governance_state
    WHERE id = 'global' FOR SHARE;
    IF NOT FOUND OR NOT governance.release_enabled OR governance.emergency_off
        OR governance.policy_status <> 'ready'
        OR COALESCE((governance.kill_switch_state ->> 'all_automation')::BOOLEAN, TRUE)
        OR COALESCE((governance.kill_switch_state ->> 'production_writes')::BOOLEAN, TRUE)
    THEN
        decision := 'deny'; reason := 'governance_blocked';
    END IF;

    SELECT * INTO policy_row FROM public.eve_approval_policies
    WHERE trust_zone = action_row.trust_zone FOR SHARE;
    IF decision IS NULL AND NOT FOUND THEN
        decision := 'deny'; reason := 'policy_denied';
    END IF;

    IF p_approval_id IS NOT NULL THEN
        SELECT * INTO approval_row FROM public.eve_action_approvals
        WHERE id = p_approval_id AND tenant_id = p_tenant_id
          AND action_id = p_action_id AND target_key = p_target_key
          AND status = 'approved' AND used_at IS NULL AND expires_at > NOW()
        FOR UPDATE;
        approval_valid := FOUND;
    END IF;

    IF decision IS NULL AND action_row.write_class = 'business_data'
        AND (NOT approval_valid OR approval_row.approval_level <> 'strict')
    THEN
        decision := 'deny'; reason := 'approval_required';
    END IF;
    IF decision IS NULL AND action_row.write_class = 'operational' THEN
        IF policy_row.operational_mode = 'deny' THEN
            decision := 'deny'; reason := 'policy_denied';
        ELSIF (policy_row.operational_mode = 'require_approval'
            OR COALESCE((governance.kill_switch_state ->> 'force_approval')::BOOLEAN, TRUE))
            AND NOT approval_valid
        THEN
            decision := 'deny'; reason := 'approval_required';
        END IF;
    END IF;

    SELECT * INTO budget_row FROM public.eve_operational_budgets
    WHERE scope_type = action_row.budget_scope_type
      AND scope_id = action_row.budget_scope_id FOR SHARE;
    IF decision IS NULL AND NOT FOUND THEN
        decision := 'pause'; reason := 'budget_exhausted';
    END IF;

    IF budget_row.id IS NOT NULL THEN
        window_start := to_timestamp(
            floor(extract(epoch FROM NOW()) / budget_row.window_seconds)
            * budget_row.window_seconds
        );
        INSERT INTO public.eve_budget_usage_windows (budget_id, window_started_at)
        VALUES (budget_row.id, window_start)
        ON CONFLICT (budget_id, window_started_at) DO NOTHING;
        SELECT * INTO usage_row FROM public.eve_budget_usage_windows
        WHERE budget_id = budget_row.id
          AND window_started_at = window_start FOR UPDATE;
        SELECT COALESCE(SUM(active_override.additional_requests), 0),
               COALESCE(SUM(active_override.additional_usd_micros), 0),
               COALESCE(SUM(active_override.additional_input_tokens), 0),
               COALESCE(SUM(active_override.additional_output_tokens), 0)
        INTO additional_requests, additional_usd_micros,
             additional_input_tokens, additional_output_tokens
        FROM public.eve_budget_emergency_overrides active_override
        WHERE active_override.budget_id = budget_row.id
          AND active_override.expires_at > NOW();
    END IF;

    IF decision IS NULL AND (
        usage_row.used_requests + action_row.request_cost > budget_row.max_requests + additional_requests
        OR usage_row.used_usd_micros + action_row.usd_micros_cost > budget_row.max_usd_micros + additional_usd_micros
        OR usage_row.used_input_tokens + action_row.input_token_cost > budget_row.max_input_tokens + additional_input_tokens
        OR usage_row.used_output_tokens + action_row.output_token_cost > budget_row.max_output_tokens + additional_output_tokens
    ) THEN
        decision := 'pause'; reason := 'budget_exhausted';
    END IF;

    IF decision IS NULL THEN
        decision := 'allow'; reason := 'operational_policy_allowed';
        UPDATE public.eve_budget_usage_windows SET
            used_requests = used_requests + action_row.request_cost,
            used_usd_micros = used_usd_micros + action_row.usd_micros_cost,
            used_input_tokens = used_input_tokens + action_row.input_token_cost,
            used_output_tokens = used_output_tokens + action_row.output_token_cost,
            updated_at = NOW()
        WHERE id = usage_row.id;
        IF approval_valid THEN
            UPDATE public.eve_action_approvals
            SET status = 'used', used_at = NOW(), updated_at = NOW()
            WHERE id = approval_row.id;
        END IF;
        INSERT INTO public.eve_policy_tracer_artifacts (
            tenant_id, action_id, target_key, created_by_profile_id
        ) VALUES (
            p_tenant_id, p_action_id, p_target_key, p_actor_profile_id
        ) RETURNING id INTO artifact_id;
    END IF;

    PERFORM public.record_eve_policy_decision(
        p_decision_id, p_audit_id, p_tenant_id, p_actor_id,
        p_actor_profile_id, p_actor_role, p_initiator_type, p_initiator_id,
        p_action_id, p_target_key, action_row.trust_zone,
        action_row.write_class, decision, reason,
        CASE WHEN approval_valid THEN approval_row.id ELSE NULL END,
        budget_row.id
    );
    RETURN jsonb_strip_nulls(jsonb_build_object(
        'actionId', p_action_id, 'trustZone', action_row.trust_zone,
        'writeClass', action_row.write_class, 'decision', decision,
        'reason', reason, 'artifactId', artifact_id
    ));
END;
$$;

CREATE OR REPLACE FUNCTION public.request_eve_policy_approval(
    p_action_id TEXT,
    p_target_key TEXT,
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
    action_row public.eve_action_policy_catalog%ROWTYPE;
    approval_id UUID := gen_random_uuid();
    level TEXT;
BEGIN
    PERFORM public.assert_eve_policy_actor_tenant(p_tenant_id, p_actor_profile_id);
    IF p_target_key !~ '^[a-zA-Z0-9:_-]{1,120}$' THEN RAISE EXCEPTION 'invalid_eve_policy_target_key'; END IF;
    SELECT * INTO STRICT action_row FROM public.eve_action_policy_catalog
    WHERE action_id = p_action_id AND is_active;
    level := CASE WHEN action_row.write_class = 'business_data' THEN 'strict' ELSE 'zone' END;
    INSERT INTO public.eve_action_approvals (
        id, tenant_id, action_id, target_key, trust_zone, approval_level,
        requested_by_profile_id
    ) VALUES (
        approval_id, p_tenant_id, p_action_id, p_target_key,
        action_row.trust_zone, level, p_actor_profile_id
    );
    PERFORM public.append_eve_approval_budget_audit(
        p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
        p_initiator_type, p_initiator_id, 'approval.request',
        'policy_action:' || p_action_id, 'started', action_row.trust_zone,
        action_row.write_class, 'deny', 'approval_requested'
    );
    RETURN approval_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decide_eve_policy_approval(
    p_approval_id UUID,
    p_approved BOOLEAN,
    p_reason TEXT,
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
    approval_row public.eve_action_approvals%ROWTYPE;
    action_row public.eve_action_policy_catalog%ROWTYPE;
BEGIN
    PERFORM public.assert_eve_policy_actor_tenant(p_tenant_id, p_actor_profile_id);
    IF NOT public.has_eve_policy_permission(p_tenant_id, p_actor_profile_id, p_actor_role, 'approval.policy.manage') THEN
        RAISE EXCEPTION 'eve_approval_manage_permission_required';
    END IF;
    IF p_reason IS NULL OR char_length(btrim(p_reason)) NOT BETWEEN 1 AND 500 THEN RAISE EXCEPTION 'invalid_eve_approval_reason'; END IF;
    SELECT * INTO approval_row FROM public.eve_action_approvals
    WHERE id = p_approval_id AND tenant_id = p_tenant_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_action_approval'; END IF;
    IF approval_row.status <> 'pending' OR approval_row.expires_at <= NOW() THEN RAISE EXCEPTION 'stale_eve_action_approval'; END IF;
    UPDATE public.eve_action_approvals SET
        status = CASE WHEN p_approved THEN 'approved' ELSE 'denied' END,
        decided_by_profile_id = p_actor_profile_id,
        decision_reason = btrim(p_reason), updated_at = NOW()
    WHERE id = p_approval_id;
    SELECT * INTO STRICT action_row FROM public.eve_action_policy_catalog WHERE action_id = approval_row.action_id;
    PERFORM public.append_eve_approval_budget_audit(
        p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
        p_initiator_type, p_initiator_id, 'approval.decision',
        'policy_action:' || approval_row.action_id,
        CASE WHEN p_approved THEN 'succeeded' ELSE 'blocked' END,
        approval_row.trust_zone, action_row.write_class,
        CASE WHEN p_approved THEN 'allow' ELSE 'deny' END,
        CASE WHEN p_approved THEN 'approval_granted' ELSE 'approval_denied' END
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.create_eve_budget_emergency_override(
    p_scope_type TEXT,
    p_scope_id TEXT,
    p_additional_requests BIGINT,
    p_additional_usd_micros BIGINT,
    p_additional_input_tokens BIGINT,
    p_additional_output_tokens BIGINT,
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
    budget_row public.eve_operational_budgets%ROWTYPE;
    override_id UUID := gen_random_uuid();
BEGIN
    PERFORM public.assert_eve_policy_actor_tenant(p_tenant_id, p_actor_profile_id);
    IF NOT public.has_eve_policy_permission(p_tenant_id, p_actor_profile_id, p_actor_role, 'budget.emergency_override') THEN
        RAISE EXCEPTION 'eve_budget_override_permission_required';
    END IF;
    IF p_expires_at <= NOW() OR p_expires_at > NOW() + INTERVAL '24 hours'
        OR p_additional_requests NOT BETWEEN 0 AND 1000
        OR p_additional_usd_micros NOT BETWEEN 0 AND 100000000
        OR p_additional_input_tokens NOT BETWEEN 0 AND 2000000
        OR p_additional_output_tokens NOT BETWEEN 0 AND 2000000
        OR p_additional_requests + p_additional_usd_micros + p_additional_input_tokens + p_additional_output_tokens <= 0
        OR p_reason IS NULL OR char_length(btrim(p_reason)) NOT BETWEEN 1 AND 500
    THEN RAISE EXCEPTION 'invalid_eve_budget_emergency_override'; END IF;
    SELECT * INTO budget_row FROM public.eve_operational_budgets
    WHERE scope_type = p_scope_type AND scope_id = p_scope_id FOR SHARE;
    IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_operational_budget'; END IF;
    INSERT INTO public.eve_budget_emergency_overrides (
        id, tenant_id, budget_id, additional_requests, additional_usd_micros,
        additional_input_tokens, additional_output_tokens, reason, expires_at,
        created_by_profile_id
    ) VALUES (
        override_id, p_tenant_id, budget_row.id, p_additional_requests,
        p_additional_usd_micros, p_additional_input_tokens,
        p_additional_output_tokens, btrim(p_reason), p_expires_at,
        p_actor_profile_id
    );
    INSERT INTO public.eve_policy_decisions (
        tenant_id, actor_profile_id, action_id, target_key, trust_zone,
        write_class, decision, reason, budget_id
    ) VALUES (
        p_tenant_id, p_actor_profile_id, 'budget.emergency_override',
        p_scope_type || ':' || p_scope_id, 'product_admin', 'operational',
        'override', 'permissioned_bounded_emergency_override', budget_row.id
    );
    PERFORM public.append_eve_approval_budget_audit(
        p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
        p_initiator_type, p_initiator_id, 'budget.emergency_override',
        'budget:' || p_scope_type || ':' || p_scope_id, 'succeeded',
        'product_admin', 'operational', 'override',
        'permissioned_bounded_emergency_override'
    );
    RETURN override_id;
END;
$$;

REVOKE ALL ON FUNCTION public.assert_eve_policy_actor_tenant(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_eve_policy_permission(UUID, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_eve_policy_permission_tenant() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.append_eve_approval_budget_audit(UUID, UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_eve_policy_decision(UUID, UUID, UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consult_eve_approval_budget_policy(TEXT, TEXT, UUID, UUID, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.request_eve_policy_approval(TEXT, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.decide_eve_policy_approval(UUID, BOOLEAN, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_eve_budget_emergency_override(TEXT, TEXT, BIGINT, BIGINT, BIGINT, BIGINT, TIMESTAMPTZ, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.consult_eve_approval_budget_policy(TEXT, TEXT, UUID, UUID, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.request_eve_policy_approval(TEXT, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.decide_eve_policy_approval(UUID, BOOLEAN, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_eve_budget_emergency_override(TEXT, TEXT, BIGINT, BIGINT, BIGINT, BIGINT, TIMESTAMPTZ, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) TO service_role;

COMMENT ON TABLE public.eve_action_policy_catalog IS
    'App-owned action classification. Callers cannot select their own trust zone, write class, domain, or budget cost.';
COMMENT ON TABLE public.eve_policy_tracer_artifacts IS
    'Non-business tracer effects proving an allowed governed operational action; contains stable keys only.';
