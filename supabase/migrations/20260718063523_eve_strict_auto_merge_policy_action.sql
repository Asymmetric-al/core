-- Govern the highest-authority Eve GitHub action independently from ordinary
-- PR mutations. The release switch and GitHub-action kill switch still gate
-- execution before this hard budget is consulted.
INSERT INTO public.eve_action_policy_catalog (
    action_id, trust_zone, write_class, governance_domain,
    budget_scope_type, budget_scope_id, request_cost, usd_micros_cost,
    input_token_cost, output_token_cost
) VALUES (
    'engineering.github_merge.execute', 'engineering', 'operational',
    'production_writes', 'expensive_feature', 'github-auto-merge', 1, 1000, 100, 50
);

INSERT INTO public.eve_operational_budgets (
    scope_type, scope_id, max_requests, max_input_tokens,
    max_output_tokens, max_usd_micros, window_seconds
) VALUES (
    'expensive_feature', 'github-auto-merge', 5, 5000, 1000, 5000, 3600
);
