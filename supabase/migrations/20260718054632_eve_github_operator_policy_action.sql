-- Govern Eve's mutating GitHub operations independently from review artifacts.
-- The dedicated budget allows a complete issue -> branch -> PR sequence while
-- preserving a hard hourly ceiling and the existing approval-policy RPC.
INSERT INTO public.eve_action_policy_catalog (
    action_id, trust_zone, write_class, governance_domain,
    budget_scope_type, budget_scope_id, request_cost, usd_micros_cost,
    input_token_cost, output_token_cost
) VALUES (
    'engineering.github_operation.write', 'engineering', 'operational',
    'production_writes', 'expensive_feature', 'github-operator', 1, 1000, 100, 50
);

INSERT INTO public.eve_operational_budgets (
    scope_type, scope_id, max_requests, max_input_tokens,
    max_output_tokens, max_usd_micros, window_seconds
) VALUES (
    'expensive_feature', 'github-operator', 20, 20000, 4000, 20000, 3600
);
