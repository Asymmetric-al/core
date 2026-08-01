-- #435: app-owned, off-by-default engineering health monitor registry,
-- atomic schedule leases, safe findings, and service-runtime budget policy.

ALTER TABLE public.eve_action_policy_catalog
  DROP CONSTRAINT eve_action_policy_catalog_governance_domain_check;
ALTER TABLE public.eve_action_policy_catalog
  ADD CONSTRAINT eve_action_policy_catalog_governance_domain_check
  CHECK (governance_domain IN ('active_runs', 'production_writes', 'dynamic_workflows'));

INSERT INTO public.eve_action_policy_catalog (
  action_id, trust_zone, write_class, governance_domain,
  budget_scope_type, budget_scope_id, request_cost, usd_micros_cost,
  input_token_cost, output_token_cost, is_active
) VALUES (
  'engineering.monitor.collect', 'engineering', 'operational', 'active_runs',
  'expensive_feature', 'engineering-health-monitors', 1, 500, 0, 0, TRUE
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
  is_active = EXCLUDED.is_active;

INSERT INTO public.eve_operational_budgets (
  scope_type, scope_id, window_seconds, max_requests, max_usd_micros,
  max_input_tokens, max_output_tokens
) VALUES (
  'expensive_feature', 'engineering-health-monitors', 3600, 120, 60000, 0, 0
) ON CONFLICT (scope_type, scope_id) DO UPDATE SET
  window_seconds = EXCLUDED.window_seconds,
  max_requests = EXCLUDED.max_requests,
  max_usd_micros = EXCLUDED.max_usd_micros,
  max_input_tokens = EXCLUDED.max_input_tokens,
  max_output_tokens = EXCLUDED.max_output_tokens,
  updated_at = NOW();

CREATE TABLE public.eve_engineering_monitor_configs (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  id TEXT NOT NULL CHECK (length(id) BETWEEN 1 AND 200),
  monitor_type TEXT NOT NULL CHECK (monitor_type IN (
    'ci_failure',
    'stale_pull_request',
    'failing_eval',
    'dependency_security_alert',
    'protected_area_pull_request',
    'budget_rate_limit'
  )),
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  paused BOOLEAN NOT NULL DEFAULT TRUE,
  source_type TEXT NOT NULL CHECK (source_type IN ('event', 'schedule')),
  schedule TEXT NOT NULL CHECK (schedule = '*/5 * * * *'),
  threshold JSONB NOT NULL DEFAULT '{}'::JSONB CHECK (jsonb_typeof(threshold) = 'object'),
  severity_rules JSONB NOT NULL DEFAULT '{}'::JSONB CHECK (jsonb_typeof(severity_rules) = 'object'),
  destination_policy JSONB NOT NULL DEFAULT '{"kind":"none","minimumSeverity":"high"}'::JSONB CHECK (
    jsonb_typeof(destination_policy) = 'object'
    AND destination_policy ->> 'kind' IN ('none', 'comment', 'issue')
    AND destination_policy ->> 'minimumSeverity' IN ('low', 'medium', 'high', 'critical')
  ),
  owner_key TEXT NOT NULL CHECK (length(owner_key) BETWEEN 1 AND 200),
  repo_owner TEXT NOT NULL CHECK (repo_owner = 'Asymmetric-al'),
  repo_name TEXT NOT NULL CHECK (repo_name = 'core'),
  dedupe_window_seconds INTEGER NOT NULL CHECK (dedupe_window_seconds BETWEEN 60 AND 2592000),
  freshness_window_seconds INTEGER NOT NULL CHECK (freshness_window_seconds BETWEEN 60 AND 2592000),
  policy_version BIGINT NOT NULL CHECK (policy_version > 0),
  checkpoint TEXT CHECK (checkpoint IS NULL OR length(checkpoint) <= 500),
  next_run_at TIMESTAMPTZ NOT NULL,
  lease_token UUID,
  lease_expires_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  last_error_summary TEXT CHECK (last_error_summary IS NULL OR length(last_error_summary) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, monitor_type, repo_owner, repo_name),
  CHECK ((lease_token IS NULL) = (lease_expires_at IS NULL))
);

CREATE INDEX eve_engineering_monitor_configs_due_idx
  ON public.eve_engineering_monitor_configs (tenant_id, next_run_at)
  WHERE enabled AND NOT paused;

CREATE TABLE public.eve_engineering_monitor_runs (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  monitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL REFERENCES public.eve_session_ownership(session_id) ON DELETE RESTRICT,
  policy_version BIGINT NOT NULL CHECK (policy_version > 0),
  status TEXT NOT NULL CHECK (status IN ('blocked', 'failed', 'running', 'succeeded', 'suppressed')),
  reason TEXT CHECK (reason IS NULL OR length(reason) <= 500),
  finding_count INTEGER NOT NULL DEFAULT 0 CHECK (finding_count >= 0),
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (tenant_id, monitor_id)
    REFERENCES public.eve_engineering_monitor_configs(tenant_id, id)
    ON DELETE RESTRICT,
  CHECK ((status = 'running' AND completed_at IS NULL) OR status <> 'running')
);

CREATE INDEX eve_engineering_monitor_runs_tenant_started_idx
  ON public.eve_engineering_monitor_runs (tenant_id, started_at DESC);

CREATE TABLE public.eve_engineering_findings (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  monitor_id TEXT NOT NULL,
  run_id UUID NOT NULL REFERENCES public.eve_engineering_monitor_runs(id) ON DELETE RESTRICT,
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'ci_failure',
    'stale_pull_request',
    'failing_eval',
    'dependency_security_alert',
    'protected_area_pull_request',
    'budget_rate_limit'
  )),
  target_id TEXT NOT NULL CHECK (length(target_id) BETWEEN 1 AND 300),
  target_revision TEXT NOT NULL CHECK (length(target_revision) BETWEEN 1 AND 100),
  first_observed_at TIMESTAMPTZ NOT NULL,
  last_observed_at TIMESTAMPTZ NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('open', 'acknowledged', 'resolved', 'stale')),
  dedupe_key TEXT NOT NULL CHECK (dedupe_key ~ '^[0-9a-f]{64}$'),
  policy_version BIGINT NOT NULL CHECK (policy_version > 0),
  safe_evidence JSONB NOT NULL CHECK (
    jsonb_typeof(safe_evidence) = 'object'
    AND safe_evidence ->> 'repository' = 'Asymmetric-al/core'
    AND octet_length(safe_evidence::TEXT) <= 16384
    AND lower(safe_evidence::TEXT) !~ '(secret|password|token|donor|payment|prompt|reasoning)'
  ),
  decision_summary TEXT NOT NULL CHECK (length(decision_summary) BETWEEN 1 AND 1000),
  observation_count INTEGER NOT NULL DEFAULT 1 CHECK (observation_count > 0),
  downstream_outcome JSONB NOT NULL DEFAULT '{}'::JSONB CHECK (jsonb_typeof(downstream_outcome) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (tenant_id, monitor_id)
    REFERENCES public.eve_engineering_monitor_configs(tenant_id, id)
    ON DELETE RESTRICT,
  UNIQUE (tenant_id, dedupe_key),
  CHECK (last_observed_at >= first_observed_at)
);

CREATE INDEX eve_engineering_findings_tenant_status_idx
  ON public.eve_engineering_findings (tenant_id, status, last_observed_at DESC);

ALTER TABLE public.eve_engineering_monitor_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_engineering_monitor_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_engineering_findings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.eve_engineering_monitor_configs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.eve_engineering_monitor_runs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.eve_engineering_findings FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.eve_engineering_monitor_configs TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.eve_engineering_monitor_runs TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.eve_engineering_findings TO service_role;

CREATE OR REPLACE FUNCTION public.claim_due_eve_engineering_monitors(
  p_tenant_id UUID,
  p_now TIMESTAMPTZ,
  p_limit INTEGER,
  p_lease_seconds INTEGER
) RETURNS SETOF public.eve_engineering_monitor_configs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  claimed_id TEXT;
  next_lease UUID;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'eve_engineering_monitor_service_role_required';
  END IF;
  IF p_limit NOT BETWEEN 1 AND 25 OR p_lease_seconds NOT BETWEEN 30 AND 900 THEN
    RAISE EXCEPTION 'invalid_eve_engineering_monitor_lease';
  END IF;

  FOR claimed_id IN
    SELECT config.id
    FROM public.eve_engineering_monitor_configs AS config
    WHERE config.tenant_id = p_tenant_id
      AND config.enabled
      AND NOT config.paused
      AND config.next_run_at <= p_now
      AND (config.lease_expires_at IS NULL OR config.lease_expires_at <= p_now)
    ORDER BY config.next_run_at, config.id
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  LOOP
    next_lease := gen_random_uuid();
    UPDATE public.eve_engineering_monitor_configs
    SET lease_token = next_lease,
        lease_expires_at = p_now + make_interval(secs => p_lease_seconds),
        updated_at = NOW()
    WHERE tenant_id = p_tenant_id AND id = claimed_id;

    RETURN QUERY
    SELECT config.*
    FROM public.eve_engineering_monitor_configs AS config
    WHERE config.tenant_id = p_tenant_id
      AND config.id = claimed_id
      AND config.lease_token = next_lease;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_eve_engineering_monitor_lease(
  p_tenant_id UUID,
  p_monitor_id TEXT,
  p_lease_token UUID,
  p_next_run_at TIMESTAMPTZ,
  p_checkpoint TEXT,
  p_error_summary TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'eve_engineering_monitor_service_role_required';
  END IF;
  UPDATE public.eve_engineering_monitor_configs
  SET checkpoint = p_checkpoint,
      next_run_at = p_next_run_at,
      last_run_at = NOW(),
      last_error_summary = left(p_error_summary, 500),
      lease_token = NULL,
      lease_expires_at = NULL,
      updated_at = NOW()
  WHERE tenant_id = p_tenant_id
    AND id = p_monitor_id
    AND lease_token = p_lease_token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'stale_eve_engineering_monitor_lease';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_eve_engineering_finding(
  p_id UUID,
  p_tenant_id UUID,
  p_monitor_id TEXT,
  p_run_id UUID,
  p_signal_type TEXT,
  p_target_id TEXT,
  p_target_revision TEXT,
  p_observed_at TIMESTAMPTZ,
  p_severity TEXT,
  p_status TEXT,
  p_dedupe_key TEXT,
  p_policy_version BIGINT,
  p_safe_evidence JSONB,
  p_decision_summary TEXT
) RETURNS public.eve_engineering_findings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  saved public.eve_engineering_findings%ROWTYPE;
  expected_type TEXT;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'eve_engineering_monitor_service_role_required';
  END IF;
  SELECT monitor_type INTO expected_type
  FROM public.eve_engineering_monitor_configs
  WHERE tenant_id = p_tenant_id AND id = p_monitor_id
  FOR SHARE;
  IF NOT FOUND OR expected_type <> p_signal_type THEN
    RAISE EXCEPTION 'eve_engineering_monitor_type_mismatch';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.eve_engineering_monitor_runs
    WHERE id = p_run_id AND tenant_id = p_tenant_id AND monitor_id = p_monitor_id
  ) THEN
    RAISE EXCEPTION 'eve_engineering_monitor_run_mismatch';
  END IF;

  INSERT INTO public.eve_engineering_findings (
    id, tenant_id, monitor_id, run_id, signal_type, target_id,
    target_revision, first_observed_at, last_observed_at, severity, status,
    dedupe_key, policy_version, safe_evidence, decision_summary
  ) VALUES (
    p_id, p_tenant_id, p_monitor_id, p_run_id, p_signal_type, p_target_id,
    p_target_revision, p_observed_at, p_observed_at, p_severity, p_status,
    p_dedupe_key, p_policy_version, p_safe_evidence, p_decision_summary
  ) ON CONFLICT (tenant_id, dedupe_key) DO UPDATE SET
    run_id = EXCLUDED.run_id,
    target_revision = EXCLUDED.target_revision,
    last_observed_at = GREATEST(
      public.eve_engineering_findings.last_observed_at,
      EXCLUDED.last_observed_at
    ),
    severity = EXCLUDED.severity,
    status = CASE
      WHEN public.eve_engineering_findings.status IN ('resolved', 'stale') THEN 'open'
      ELSE public.eve_engineering_findings.status
    END,
    policy_version = EXCLUDED.policy_version,
    safe_evidence = EXCLUDED.safe_evidence,
    decision_summary = EXCLUDED.decision_summary,
    observation_count = public.eve_engineering_findings.observation_count + 1,
    updated_at = NOW()
  RETURNING * INTO saved;
  RETURN saved;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_due_eve_engineering_monitors(UUID, TIMESTAMPTZ, INTEGER, INTEGER)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_eve_engineering_monitor_lease(UUID, TEXT, UUID, TIMESTAMPTZ, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.upsert_eve_engineering_finding(UUID, UUID, TEXT, UUID, TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, TEXT, BIGINT, JSONB, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_due_eve_engineering_monitors(UUID, TIMESTAMPTZ, INTEGER, INTEGER)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.release_eve_engineering_monitor_lease(UUID, TEXT, UUID, TIMESTAMPTZ, TEXT, TEXT)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_eve_engineering_finding(UUID, UUID, TEXT, UUID, TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, TEXT, BIGINT, JSONB, TEXT)
  TO service_role;

COMMENT ON TABLE public.eve_engineering_monitor_configs IS
  'App-owned, off-by-default registry for the exact six #435 engineering-health monitors.';
COMMENT ON TABLE public.eve_engineering_findings IS
  'Safe, deduplicated engineering-health evidence; never raw logs, secrets, business data, prompts, or reasoning.';
