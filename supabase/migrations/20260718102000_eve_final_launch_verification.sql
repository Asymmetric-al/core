-- #437: target-bound launch readiness and the sole audited human release path.
-- Every table and transition is fail-closed. Applying this migration cannot
-- enable Eve and does not grant launch permissions to any profile.

INSERT INTO public.eve_retention_categories (
  category, retention_days, metadata_only, description
) VALUES (
  'launch_manifest', 365, TRUE,
  'Redacted Eve launch manifest, review, activation, and canary evidence metadata.'
) ON CONFLICT (category) DO UPDATE SET
  retention_days = EXCLUDED.retention_days,
  metadata_only = EXCLUDED.metadata_only,
  description = EXCLUDED.description,
  updated_at = NOW();

CREATE TABLE public.eve_launch_permission_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL CHECK (permission IN ('release.review', 'release.activate')),
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  granted_by_profile_id UUID NOT NULL REFERENCES public.profiles(id),
  reason TEXT NOT NULL CHECK (char_length(btrim(reason)) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, profile_id, permission)
);

CREATE TABLE public.eve_launch_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN (
    'not_ready', 'evidence_passed', 'ready', 'active', 'completed',
    'rolled_back', 'expired'
  )),
  content_hash TEXT NOT NULL CHECK (content_hash ~ '^[0-9a-f]{64}$'),
  environment TEXT NOT NULL CHECK (environment IN ('development', 'preview', 'staging', 'production')),
  revision TEXT NOT NULL CHECK (revision ~ '^[0-9a-f]{40}$'),
  deployment_id TEXT NOT NULL CHECK (deployment_id ~ '^[A-Za-z0-9._:-]{1,200}$'),
  migration_version TEXT NOT NULL CHECK (migration_version ~ '^[0-9]{14}_[a-z0-9_]{1,100}$'),
  governance_state_version BIGINT NOT NULL CHECK (governance_state_version > 0),
  policy_version BIGINT NOT NULL CHECK (policy_version > 0),
  model_policy_revision TEXT NOT NULL CHECK (model_policy_revision ~ '^[0-9a-f]{64}$'),
  eval_config_revision TEXT NOT NULL CHECK (eval_config_revision ~ '^[0-9a-f]{64}$'),
  generated_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  document JSONB NOT NULL CHECK (
    jsonb_typeof(document) = 'object'
    AND document ->> 'schemaVersion' = 'eve-launch-manifest-v1'
    AND octet_length(document::TEXT) <= 262144
    AND lower(document::TEXT) !~ '(-----begin [^-]*private key-----|(password|secret|api[_ -]?key|private[_ -]?key|access[_ -]?token|raw[_ -]?prompt|chain[_ -]?of[_ -]?thought)["'']?[[:space:]]*[:=]|(sk_(live|test)|whsec|ghp|github_pat)_[a-z0-9_-]{8,})'
  ),
  evaluation JSONB NOT NULL CHECK (
    jsonb_typeof(evaluation) = 'object'
    AND jsonb_typeof(evaluation -> 'ready') = 'boolean'
    AND jsonb_typeof(evaluation -> 'blockers') = 'array'
  ),
  audit_id UUID NOT NULL REFERENCES public.eve_audit_events(id) ON DELETE RESTRICT,
  created_by_profile_id UUID NOT NULL REFERENCES public.profiles(id),
  retention_category TEXT NOT NULL DEFAULT 'launch_manifest'
    REFERENCES public.eve_retention_categories(category),
  retention_expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (expires_at > generated_at AND expires_at <= generated_at + INTERVAL '24 hours'),
  CHECK (retention_expires_at > created_at),
  UNIQUE (tenant_id, environment, deployment_id, content_hash)
);

CREATE INDEX eve_launch_manifests_tenant_created_idx
  ON public.eve_launch_manifests (tenant_id, created_at DESC);
CREATE INDEX eve_launch_manifests_status_expiry_idx
  ON public.eve_launch_manifests (status, expires_at);

CREATE TABLE public.eve_launch_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  manifest_id UUID NOT NULL REFERENCES public.eve_launch_manifests(id) ON DELETE CASCADE,
  reviewer_profile_id UUID NOT NULL REFERENCES public.profiles(id),
  reviewer_role TEXT NOT NULL CHECK (reviewer_role IN ('release', 'security')),
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  summary TEXT NOT NULL CHECK (
    char_length(btrim(summary)) BETWEEN 1 AND 500
    AND lower(summary) !~ '(password|secret|api[_ -]?key|private[_ -]?key|access[_ -]?token)'
  ),
  audit_id UUID NOT NULL REFERENCES public.eve_audit_events(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (manifest_id, reviewer_profile_id)
);

CREATE TABLE public.eve_launch_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  manifest_id UUID NOT NULL UNIQUE REFERENCES public.eve_launch_manifests(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'rolled_back')),
  activated_by_profile_id UUID NOT NULL REFERENCES public.profiles(id),
  activation_audit_id UUID NOT NULL REFERENCES public.eve_audit_events(id) ON DELETE RESTRICT,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  canary_deadline TIMESTAMPTZ NOT NULL,
  canary_results JSONB CHECK (
    canary_results IS NULL OR jsonb_typeof(canary_results) = 'object'
  ),
  close_audit_id UUID REFERENCES public.eve_audit_events(id) ON DELETE RESTRICT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (canary_deadline > activated_at AND canary_deadline <= activated_at + INTERVAL '30 minutes'),
  CHECK ((status = 'active' AND closed_at IS NULL) OR (status <> 'active' AND closed_at IS NOT NULL))
);

CREATE UNIQUE INDEX eve_launch_records_single_active_idx
  ON public.eve_launch_records ((status)) WHERE status = 'active';

ALTER TABLE public.eve_launch_permission_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_launch_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_launch_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eve_launch_records ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.eve_launch_permission_grants, public.eve_launch_manifests,
  public.eve_launch_reviews, public.eve_launch_records FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.eve_launch_permission_grants TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.eve_launch_manifests TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.eve_launch_reviews TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.eve_launch_records TO service_role;

CREATE OR REPLACE FUNCTION public.assert_eve_launch_profile(
  p_tenant_id UUID, p_profile_id UUID, p_required_role TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_profile_id AND tenant_id = p_tenant_id
      AND (p_required_role IS NULL OR role = p_required_role)
  ) THEN
    RAISE EXCEPTION 'eve_launch_profile_tenant_mismatch';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_eve_launch_permission(
  p_tenant_id UUID, p_profile_id UUID, p_permission TEXT
) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.eve_launch_permission_grants
    WHERE tenant_id = p_tenant_id AND profile_id = p_profile_id
      AND permission = p_permission AND is_active
  );
$$;

CREATE OR REPLACE FUNCTION public.is_eve_launch_safe_text(p_value TEXT)
RETURNS BOOLEAN
LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT p_value IS NOT NULL
    AND char_length(btrim(p_value)) BETWEEN 1 AND 500
    AND lower(p_value) !~ '(-----begin [^-]*private key-----|(password|secret|api[_ -]?key|private[_ -]?key|access[_ -]?token|raw[_ -]?prompt|chain[_ -]?of[_ -]?thought)["'']?[[:space:]]*[:=]|(sk_(live|test)|whsec|ghp|github_pat)_[a-z0-9_-]{8,})';
$$;

REVOKE ALL ON FUNCTION public.is_eve_launch_safe_text(TEXT)
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_eve_launch_manifest(
  p_tenant_id UUID, p_manifest_id UUID, p_document JSONB, p_evaluation JSONB,
  p_content_hash TEXT, p_audit_id UUID, p_actor_id TEXT,
  p_actor_profile_id UUID, p_actor_role TEXT, p_initiator_type TEXT,
  p_initiator_id TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  governance public.eve_governance_state%ROWTYPE;
  manifest public.eve_launch_manifests%ROWTYPE;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'eve_launch_service_role_required'; END IF;
  PERFORM public.assert_eve_launch_profile(p_tenant_id, p_actor_profile_id, p_actor_role);
  SELECT * INTO governance FROM public.eve_governance_state WHERE id = 'global';
  INSERT INTO public.eve_audit_events (
    id, tenant_id, actor_id, actor_profile_id, actor_role, identity_mode,
    initiator_type, initiator_id, policy_id, policy_status,
    governance_state_version, action, target, result, tool_name, model_role,
    evidence_summary, change_summary, decision_summary, debug_metadata,
    redaction_version
  ) VALUES (
    p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
    'admin', p_initiator_type, p_initiator_id, 'eve-final-launch-v1',
    COALESCE(governance.policy_status, 'unavailable'), governance.state_version,
    'launch.manifest_created',
    'launch-target:' || (p_document -> 'target' ->> 'environment') || ':' ||
      (p_document -> 'target' ->> 'deploymentId'),
    CASE WHEN (p_evaluation ->> 'ready')::BOOLEAN THEN 'succeeded' ELSE 'blocked' END,
    'eve_launch_control', 'not_used',
    jsonb_build_object(
      'blockers', p_evaluation -> 'blockers', 'contentHash', p_content_hash,
      'evidenceCount', p_evaluation -> 'evidenceCount',
      'ready', p_evaluation -> 'ready',
      'revision', p_document -> 'target' -> 'revision'
    )::TEXT,
    jsonb_build_object('stateChanged', FALSE)::TEXT,
    'launch.manifest_created '
      || CASE WHEN (p_evaluation ->> 'ready')::BOOLEAN THEN 'succeeded' ELSE 'blocked' END
      || '. Rationale: An authorized human performed an Eve launch review step. '
      || 'Policy: eve-final-launch-v1 ('
      || COALESCE(governance.policy_status, 'unavailable') || '). '
      || 'Risk: Production autonomy release boundary. '
      || 'Follow-up: Keep the release switch off or use the emergency control path.',
    '{}'::JSONB, 'eve-audit-v1'
  );
  INSERT INTO public.eve_launch_manifests (
    id, tenant_id, status, content_hash, environment, revision, deployment_id,
    migration_version, governance_state_version, policy_version,
    model_policy_revision, eval_config_revision, generated_at, expires_at,
    document, evaluation, audit_id, created_by_profile_id,
    retention_expires_at
  ) VALUES (
    p_manifest_id, p_tenant_id,
    CASE WHEN (p_evaluation ->> 'ready')::BOOLEAN THEN 'evidence_passed' ELSE 'not_ready' END,
    p_content_hash, p_document -> 'target' ->> 'environment',
    p_document -> 'target' ->> 'revision',
    p_document -> 'target' ->> 'deploymentId',
    p_document -> 'target' ->> 'migrationVersion',
    (p_document -> 'target' ->> 'governanceStateVersion')::BIGINT,
    (p_document -> 'target' ->> 'policyVersion')::BIGINT,
    p_document -> 'target' ->> 'modelPolicyRevision',
    p_document -> 'target' ->> 'evalConfigRevision',
    (p_document ->> 'generatedAt')::TIMESTAMPTZ,
    (p_document ->> 'expiresAt')::TIMESTAMPTZ,
    p_document, p_evaluation, p_audit_id, p_actor_profile_id,
    NOW() + INTERVAL '365 days'
  ) RETURNING * INTO manifest;
  RETURN to_jsonb(manifest);
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_eve_launch_permission(
  p_tenant_id UUID, p_profile_id UUID, p_permission TEXT, p_enabled BOOLEAN,
  p_reason TEXT, p_audit_id UUID, p_actor_id TEXT, p_actor_profile_id UUID,
  p_actor_role TEXT, p_initiator_type TEXT, p_initiator_id TEXT
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'eve_launch_service_role_required'; END IF;
  IF p_permission NOT IN ('release.review', 'release.activate')
    OR p_enabled IS NULL OR p_actor_role IS DISTINCT FROM 'super_admin'
    OR NOT public.is_eve_launch_safe_text(p_reason)
  THEN RAISE EXCEPTION 'invalid_eve_launch_permission'; END IF;
  PERFORM public.assert_eve_launch_profile(p_tenant_id, p_actor_profile_id, 'super_admin');
  PERFORM public.assert_eve_launch_profile(p_tenant_id, p_profile_id, 'super_admin');
  INSERT INTO public.eve_launch_permission_grants (
    tenant_id, profile_id, permission, is_active, granted_by_profile_id, reason
  ) VALUES (
    p_tenant_id, p_profile_id, p_permission, p_enabled, p_actor_profile_id, btrim(p_reason)
  ) ON CONFLICT (tenant_id, profile_id, permission) DO UPDATE SET
    is_active = EXCLUDED.is_active,
    granted_by_profile_id = EXCLUDED.granted_by_profile_id,
    reason = EXCLUDED.reason,
    updated_at = NOW();
  INSERT INTO public.eve_audit_events (
    id, tenant_id, actor_id, actor_profile_id, actor_role, identity_mode,
    initiator_type, initiator_id, policy_id, policy_status, action, target,
    result, model_role, evidence_summary, change_summary, decision_summary,
    debug_metadata, redaction_version
  ) VALUES (
    p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
    'admin', p_initiator_type, p_initiator_id, 'eve-final-launch-v1',
    'permission_checked', 'launch.permission_set',
    'launch_permission:' || p_permission || ':' || p_profile_id,
    'succeeded', 'not_used',
    jsonb_build_object('permission', p_permission, 'reason', btrim(p_reason))::TEXT,
    jsonb_build_object('enabled', p_enabled)::TEXT,
    'A platform owner deliberately changed a dedicated Eve launch permission.',
    jsonb_build_object('operation', 'grant_eve_launch_permission'), 'eve-audit-v1'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.review_eve_launch_manifest(
  p_tenant_id UUID, p_manifest_id UUID, p_reviewer_role TEXT, p_decision TEXT,
  p_summary TEXT, p_audit_id UUID, p_actor_id TEXT, p_actor_profile_id UUID,
  p_actor_role TEXT, p_initiator_type TEXT, p_initiator_id TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  manifest public.eve_launch_manifests%ROWTYPE;
  approval_count INTEGER;
  role_count INTEGER;
  rejection_count INTEGER;
  review_created_at TIMESTAMPTZ;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'eve_launch_service_role_required'; END IF;
  IF p_reviewer_role NOT IN ('release', 'security') OR p_decision NOT IN ('approved', 'rejected')
    OR p_actor_role IS DISTINCT FROM 'super_admin'
    OR NOT public.is_eve_launch_safe_text(p_summary)
  THEN RAISE EXCEPTION 'invalid_eve_launch_review'; END IF;
  PERFORM public.assert_eve_launch_profile(p_tenant_id, p_actor_profile_id, 'super_admin');
  IF NOT public.has_eve_launch_permission(p_tenant_id, p_actor_profile_id, 'release.review') THEN
    RAISE EXCEPTION 'eve_launch_review_permission_required';
  END IF;
  SELECT * INTO manifest FROM public.eve_launch_manifests
  WHERE id = p_manifest_id AND tenant_id = p_tenant_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_launch_manifest'; END IF;
  IF p_actor_profile_id = manifest.created_by_profile_id THEN
    RAISE EXCEPTION 'eve_launch_reviewer_not_independent';
  END IF;
  IF manifest.status NOT IN ('evidence_passed', 'ready')
    OR manifest.expires_at <= NOW() OR (manifest.evaluation ->> 'ready')::BOOLEAN IS NOT TRUE
  THEN RAISE EXCEPTION 'eve_launch_not_ready'; END IF;
  INSERT INTO public.eve_audit_events (
    id, tenant_id, actor_id, actor_profile_id, actor_role, identity_mode,
    initiator_type, initiator_id, policy_id, policy_status,
    governance_state_version, action, target, result, model_role,
    evidence_summary, change_summary, decision_summary, debug_metadata,
    redaction_version
  ) VALUES (
    p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
    'admin', p_initiator_type, p_initiator_id, 'eve-final-launch-v1',
    'reviewed', manifest.governance_state_version, 'launch.manifest_reviewed',
    'launch_manifest:' || p_manifest_id,
    CASE WHEN p_decision = 'approved' THEN 'succeeded' ELSE 'blocked' END,
    'not_used', jsonb_build_object('reviewerRole', p_reviewer_role)::TEXT,
    jsonb_build_object('decision', p_decision)::TEXT,
    'A permissioned human reviewed target-bound launch evidence.',
    jsonb_build_object('summary', btrim(p_summary)), 'eve-audit-v1'
  );
  INSERT INTO public.eve_launch_reviews (
    tenant_id, manifest_id, reviewer_profile_id, reviewer_role, decision,
    summary, audit_id
  ) VALUES (
    p_tenant_id, p_manifest_id, p_actor_profile_id, p_reviewer_role,
    p_decision, btrim(p_summary), p_audit_id
  ) ON CONFLICT (manifest_id, reviewer_profile_id) DO UPDATE SET
    reviewer_role = EXCLUDED.reviewer_role,
    decision = EXCLUDED.decision,
    summary = EXCLUDED.summary,
    audit_id = EXCLUDED.audit_id,
    updated_at = NOW()
  RETURNING created_at INTO review_created_at;
  SELECT
    count(*) FILTER (WHERE decision = 'approved'),
    count(DISTINCT reviewer_role) FILTER (WHERE decision = 'approved'),
    count(*) FILTER (WHERE decision = 'rejected')
  INTO approval_count, role_count, rejection_count
  FROM public.eve_launch_reviews WHERE manifest_id = p_manifest_id;
  UPDATE public.eve_launch_manifests SET
    status = CASE
      WHEN rejection_count = 0 AND approval_count >= 2 AND role_count = 2 THEN 'ready'
      WHEN rejection_count > 0 THEN 'not_ready'
      ELSE 'evidence_passed'
    END
  WHERE id = p_manifest_id;
  RETURN jsonb_build_object(
    'manifestId', p_manifest_id,
    'reviewerProfileId', p_actor_profile_id,
    'reviewerRole', p_reviewer_role,
    'decision', p_decision,
    'summary', btrim(p_summary),
    'createdAt', review_created_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.activate_eve_launch_manifest(
  p_tenant_id UUID, p_manifest_id UUID, p_content_hash TEXT,
  p_environment TEXT, p_revision TEXT, p_deployment_id TEXT,
  p_migration_version TEXT, p_policy_version BIGINT,
  p_model_policy_revision TEXT, p_eval_config_revision TEXT,
  p_expected_state_version BIGINT, p_justification TEXT, p_audit_id UUID,
  p_actor_id TEXT, p_actor_profile_id UUID, p_actor_role TEXT,
  p_initiator_type TEXT, p_initiator_id TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  manifest public.eve_launch_manifests%ROWTYPE;
  governance public.eve_governance_state%ROWTYPE;
  launch_id UUID := gen_random_uuid();
  review_count INTEGER;
  review_role_count INTEGER;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'eve_launch_service_role_required'; END IF;
  IF p_actor_role IS DISTINCT FROM 'super_admin'
    OR NOT public.is_eve_launch_safe_text(p_justification)
  THEN RAISE EXCEPTION 'invalid_eve_launch_activation'; END IF;
  PERFORM public.assert_eve_launch_profile(p_tenant_id, p_actor_profile_id, 'super_admin');
  IF NOT public.has_eve_launch_permission(p_tenant_id, p_actor_profile_id, 'release.activate') THEN
    RAISE EXCEPTION 'eve_launch_activation_permission_required';
  END IF;
  SELECT * INTO governance FROM public.eve_governance_state
  WHERE id = 'global' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_governance_state'; END IF;
  SELECT * INTO manifest FROM public.eve_launch_manifests
  WHERE id = p_manifest_id AND tenant_id = p_tenant_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_launch_manifest'; END IF;
  IF manifest.status <> 'ready' OR manifest.expires_at <= NOW()
    OR (manifest.evaluation ->> 'ready')::BOOLEAN IS NOT TRUE
  THEN RAISE EXCEPTION 'eve_launch_not_ready'; END IF;
  IF manifest.content_hash <> p_content_hash OR manifest.environment <> p_environment
    OR manifest.revision <> p_revision OR manifest.deployment_id <> p_deployment_id
    OR manifest.migration_version <> p_migration_version
    OR manifest.policy_version <> p_policy_version
    OR manifest.model_policy_revision <> p_model_policy_revision
    OR manifest.eval_config_revision <> p_eval_config_revision
  THEN RAISE EXCEPTION 'eve_launch_target_mismatch'; END IF;
  SELECT count(*), count(DISTINCT reviewer_role)
  INTO review_count, review_role_count
  FROM public.eve_launch_reviews
  WHERE manifest_id = p_manifest_id AND decision = 'approved';
  IF review_count < 2 OR review_role_count <> 2 OR EXISTS (
    SELECT 1 FROM public.eve_launch_reviews
    WHERE manifest_id = p_manifest_id AND decision = 'rejected'
  ) THEN RAISE EXCEPTION 'eve_launch_reviews_incomplete'; END IF;
  IF governance.state_version <> p_expected_state_version
    OR manifest.governance_state_version <> governance.state_version
  THEN RAISE EXCEPTION 'stale_eve_governance_state'; END IF;
  IF governance.release_enabled OR governance.emergency_off
    OR governance.policy_status <> 'ready'
    OR COALESCE((governance.kill_switch_state ->> 'all_automation')::BOOLEAN, TRUE)
    OR COALESCE((governance.kill_switch_state ->> 'active_runs')::BOOLEAN, TRUE)
    OR COALESCE((governance.kill_switch_state ->> 'github_actions')::BOOLEAN, TRUE)
    OR COALESCE((governance.kill_switch_state ->> 'production_writes')::BOOLEAN, TRUE)
    OR COALESCE((governance.kill_switch_state ->> 'sandbox_networking')::BOOLEAN, TRUE)
    OR COALESCE((governance.kill_switch_state ->> 'dynamic_workflows')::BOOLEAN, TRUE)
    OR COALESCE((governance.kill_switch_state ->> 'model_policy_changes')::BOOLEAN, TRUE)
  THEN RAISE EXCEPTION 'eve_launch_blocked'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.eve_model_policies
    WHERE scope_type = 'platform' AND tenant_id IS NULL
      AND status = 'active' AND eval_status = 'passed'
      AND version = p_policy_version
      AND policy_hash = p_model_policy_revision
  ) THEN RAISE EXCEPTION 'eve_launch_target_mismatch'; END IF;
  UPDATE public.eve_governance_state SET
    release_enabled = TRUE,
    state_version = state_version + 1,
    updated_by_profile_id = p_actor_profile_id,
    updated_at = NOW()
  WHERE id = 'global' RETURNING * INTO governance;
  INSERT INTO public.eve_audit_events (
    id, tenant_id, actor_id, actor_profile_id, actor_role, identity_mode,
    initiator_type, initiator_id, policy_id, policy_status,
    governance_state_version, action, target, result, model_role,
    evidence_summary, change_summary, decision_summary, debug_metadata,
    redaction_version
  ) VALUES (
    p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
    'admin', p_initiator_type, p_initiator_id, 'eve-final-launch-v1',
    governance.policy_status, governance.state_version, 'launch.activated',
    'launch_manifest:' || p_manifest_id, 'succeeded', 'not_used',
    jsonb_build_object(
      'manifestId', p_manifest_id, 'contentHash', p_content_hash,
      'environment', p_environment, 'revision', p_revision,
      'deploymentId', p_deployment_id, 'justification', btrim(p_justification)
    )::TEXT,
    jsonb_build_object('releaseEnabled', TRUE, 'stateVersion', governance.state_version)::TEXT,
    'A permissioned human activated the existing Eve release switch for one reviewed target.',
    jsonb_build_object('operation', 'activate_eve_launch_manifest'), 'eve-audit-v1'
  );
  INSERT INTO public.eve_launch_records (
    id, tenant_id, manifest_id, status, activated_by_profile_id,
    activation_audit_id, canary_deadline
  ) VALUES (
    launch_id, p_tenant_id, p_manifest_id, 'active', p_actor_profile_id,
    p_audit_id, NOW() + INTERVAL '15 minutes'
  );
  UPDATE public.eve_launch_manifests SET status = 'active' WHERE id = p_manifest_id;
  RETURN jsonb_build_object('launchId', launch_id, 'stateVersion', governance.state_version);
END;
$$;

CREATE OR REPLACE FUNCTION public.set_eve_release_safety_control(
  p_tenant_id UUID, p_mode TEXT, p_expected_state_version BIGINT,
  p_reason TEXT, p_audit_id UUID, p_actor_id TEXT, p_actor_profile_id UUID,
  p_actor_role TEXT, p_initiator_type TEXT, p_initiator_id TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  governance public.eve_governance_state%ROWTYPE;
  next_switches JSONB;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'eve_launch_service_role_required'; END IF;
  IF p_mode NOT IN ('disable', 'emergency_off', 'clear_emergency')
    OR NOT public.is_eve_launch_safe_text(p_reason)
  THEN RAISE EXCEPTION 'invalid_eve_release_safety_control'; END IF;
  PERFORM public.assert_eve_launch_profile(p_tenant_id, p_actor_profile_id, p_actor_role);
  IF p_mode = 'emergency_off' THEN
    IF p_actor_role NOT IN ('admin', 'super_admin') THEN RAISE EXCEPTION 'eve_launch_safety_permission_required'; END IF;
  ELSIF p_actor_role <> 'super_admin' THEN
    RAISE EXCEPTION 'eve_launch_safety_permission_required';
  END IF;
  SELECT * INTO governance FROM public.eve_governance_state
  WHERE id = 'global' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_governance_state'; END IF;
  IF governance.state_version <> p_expected_state_version THEN
    RAISE EXCEPTION 'stale_eve_governance_state';
  END IF;
  next_switches := governance.kill_switch_state;
  IF p_mode = 'emergency_off' THEN
    next_switches := jsonb_set(next_switches, '{all_automation}', 'true'::JSONB, FALSE);
    next_switches := jsonb_set(next_switches, '{active_runs}', 'true'::JSONB, FALSE);
  END IF;
  UPDATE public.eve_governance_state SET
    release_enabled = FALSE,
    emergency_off = CASE
      WHEN p_mode = 'emergency_off' THEN TRUE
      WHEN p_mode = 'clear_emergency' THEN FALSE
      ELSE emergency_off
    END,
    kill_switch_state = next_switches,
    state_version = state_version + 1,
    updated_by_profile_id = p_actor_profile_id,
    updated_at = NOW()
  WHERE id = 'global' RETURNING * INTO governance;
  -- The audit event is written before the rollback so the closed launch record
  -- can reference it, matching close_eve_launch_canary and
  -- expire_eve_launch_canaries. Both writes stay in this one transaction.
  INSERT INTO public.eve_audit_events (
    id, tenant_id, actor_id, actor_profile_id, actor_role, identity_mode,
    initiator_type, initiator_id, policy_id, policy_status,
    governance_state_version, action, target, result, model_role,
    evidence_summary, change_summary, decision_summary, debug_metadata,
    redaction_version
  ) VALUES (
    p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
    'admin', p_initiator_type, p_initiator_id, 'eve-final-launch-v1',
    governance.policy_status, governance.state_version,
    'launch.safety_control', 'eve:global', 'succeeded', 'not_used',
    jsonb_build_object('mode', p_mode, 'reason', btrim(p_reason))::TEXT,
    jsonb_build_object(
      'releaseEnabled', governance.release_enabled,
      'emergencyOff', governance.emergency_off,
      'stateVersion', governance.state_version
    )::TEXT,
    'An authorized human used the existing Eve stop or emergency boundary.',
    jsonb_build_object('operation', 'set_eve_release_safety_control'), 'eve-audit-v1'
  );
  IF p_mode IN ('disable', 'emergency_off') THEN
    UPDATE public.eve_launch_manifests SET status = 'rolled_back'
    WHERE id IN (
      SELECT manifest_id FROM public.eve_launch_records
      WHERE status = 'active'
    ) AND status = 'active';
    UPDATE public.eve_launch_records SET
      status = 'rolled_back', closed_at = NOW(),
      close_audit_id = p_audit_id,
      canary_results = jsonb_build_object('safetyControlTriggered', TRUE)
    WHERE status = 'active';
  END IF;
  RETURN jsonb_build_object('stateVersion', governance.state_version);
END;
$$;

CREATE OR REPLACE FUNCTION public.close_eve_launch_canary(
  p_tenant_id UUID, p_launch_id UUID, p_status TEXT, p_results JSONB,
  p_reason TEXT, p_audit_id UUID, p_actor_id TEXT, p_actor_profile_id UUID,
  p_actor_role TEXT, p_initiator_type TEXT, p_initiator_id TEXT
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  launch public.eve_launch_records%ROWTYPE;
  governance public.eve_governance_state%ROWTYPE;
  required_keys CONSTANT TEXT[] := ARRAY[
    'state_visible', 'trigger_gate_current', 'audit_recorded',
    'budget_enforced', 'notification_safe', 'non_destructive_canary'
  ];
  key TEXT;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'eve_launch_service_role_required'; END IF;
  IF p_status NOT IN ('completed', 'failed') OR jsonb_typeof(p_results) <> 'object'
    OR NOT (p_results ?& required_keys) OR p_results - required_keys <> '{}'::JSONB
    OR p_actor_role IS DISTINCT FROM 'super_admin'
    OR NOT public.is_eve_launch_safe_text(p_reason)
  THEN RAISE EXCEPTION 'invalid_eve_launch_canary'; END IF;
  FOREACH key IN ARRAY required_keys LOOP
    IF jsonb_typeof(p_results -> key) <> 'boolean' THEN RAISE EXCEPTION 'invalid_eve_launch_canary'; END IF;
  END LOOP;
  PERFORM public.assert_eve_launch_profile(p_tenant_id, p_actor_profile_id, 'super_admin');
  IF NOT public.has_eve_launch_permission(p_tenant_id, p_actor_profile_id, 'release.activate') THEN
    RAISE EXCEPTION 'eve_launch_activation_permission_required';
  END IF;
  SELECT * INTO governance FROM public.eve_governance_state
  WHERE id = 'global' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_governance_state'; END IF;
  SELECT * INTO launch FROM public.eve_launch_records
  WHERE id = p_launch_id AND tenant_id = p_tenant_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_launch_record'; END IF;
  IF launch.status <> 'active' THEN RAISE EXCEPTION 'stale_eve_launch_manifest'; END IF;
  IF p_status = 'completed' AND (
    launch.canary_deadline <= NOW() OR EXISTS (
      SELECT 1 FROM jsonb_each(p_results) AS item WHERE item.value <> 'true'::JSONB
    )
  ) THEN RAISE EXCEPTION 'eve_launch_not_ready'; END IF;
  IF p_status = 'completed' AND (
    governance.release_enabled IS DISTINCT FROM TRUE
    OR governance.emergency_off IS DISTINCT FROM FALSE
    OR governance.policy_status IS DISTINCT FROM 'ready'
    OR COALESCE((governance.kill_switch_state ->> 'all_automation')::BOOLEAN, TRUE)
    OR COALESCE((governance.kill_switch_state ->> 'active_runs')::BOOLEAN, TRUE)
    OR COALESCE((governance.kill_switch_state ->> 'github_actions')::BOOLEAN, TRUE)
    OR COALESCE((governance.kill_switch_state ->> 'production_writes')::BOOLEAN, TRUE)
    OR COALESCE((governance.kill_switch_state ->> 'sandbox_networking')::BOOLEAN, TRUE)
    OR COALESCE((governance.kill_switch_state ->> 'dynamic_workflows')::BOOLEAN, TRUE)
    OR COALESCE((governance.kill_switch_state ->> 'model_policy_changes')::BOOLEAN, TRUE)
  ) THEN RAISE EXCEPTION 'eve_launch_blocked'; END IF;
  IF p_status = 'failed' THEN
    UPDATE public.eve_governance_state SET
      release_enabled = FALSE, emergency_off = TRUE,
      kill_switch_state = jsonb_set(
        jsonb_set(kill_switch_state, '{all_automation}', 'true'::JSONB, FALSE),
        '{active_runs}', 'true'::JSONB, FALSE
      ),
      state_version = state_version + 1,
      updated_by_profile_id = p_actor_profile_id,
      updated_at = NOW()
    WHERE id = 'global' RETURNING * INTO governance;
  END IF;
  INSERT INTO public.eve_audit_events (
    id, tenant_id, actor_id, actor_profile_id, actor_role, identity_mode,
    initiator_type, initiator_id, policy_id, policy_status,
    governance_state_version, action, target, result, model_role,
    evidence_summary, change_summary, decision_summary, debug_metadata,
    redaction_version
  ) VALUES (
    p_audit_id, p_tenant_id, p_actor_id, p_actor_profile_id, p_actor_role,
    'admin', p_initiator_type, p_initiator_id, 'eve-final-launch-v1',
    governance.policy_status, governance.state_version, 'launch.canary_closed',
    'launch:' || p_launch_id,
    CASE WHEN p_status = 'completed' THEN 'succeeded' ELSE 'failed' END,
    'not_used', jsonb_build_object('results', p_results, 'reason', btrim(p_reason))::TEXT,
    jsonb_build_object(
      'launchStatus', CASE WHEN p_status = 'completed' THEN 'completed' ELSE 'rolled_back' END,
      'releaseEnabled', governance.release_enabled,
      'emergencyOff', governance.emergency_off
    )::TEXT,
    'The bounded post-activation canary was closed through the fail-safe launch boundary.',
    jsonb_build_object('operation', 'close_eve_launch_canary'), 'eve-audit-v1'
  );
  UPDATE public.eve_launch_records SET
    status = CASE WHEN p_status = 'completed' THEN 'completed' ELSE 'rolled_back' END,
    canary_results = p_results, close_audit_id = p_audit_id, closed_at = NOW()
  WHERE id = p_launch_id;
  UPDATE public.eve_launch_manifests SET
    status = CASE WHEN p_status = 'completed' THEN 'completed' ELSE 'rolled_back' END
  WHERE id = launch.manifest_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_eve_launch_canaries()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  launch public.eve_launch_records%ROWTYPE;
  governance public.eve_governance_state%ROWTYPE;
  audit_id UUID := gen_random_uuid();
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'eve_launch_service_role_required'; END IF;
  SELECT * INTO governance FROM public.eve_governance_state
  WHERE id = 'global' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'missing_eve_governance_state'; END IF;
  SELECT * INTO launch FROM public.eve_launch_records
  WHERE status = 'active' AND canary_deadline <= NOW()
  ORDER BY canary_deadline LIMIT 1 FOR UPDATE SKIP LOCKED;
  IF NOT FOUND THEN RETURN 0; END IF;
  UPDATE public.eve_governance_state SET
    release_enabled = FALSE, emergency_off = TRUE,
    kill_switch_state = jsonb_set(
      jsonb_set(kill_switch_state, '{all_automation}', 'true'::JSONB, FALSE),
      '{active_runs}', 'true'::JSONB, FALSE
    ),
    state_version = state_version + 1, updated_at = NOW()
  WHERE id = 'global' RETURNING * INTO governance;
  INSERT INTO public.eve_audit_events (
    id, tenant_id, actor_id, identity_mode, initiator_type, initiator_id,
    policy_id, policy_status, governance_state_version, action, target,
    result, model_role, evidence_summary, change_summary, decision_summary,
    debug_metadata, redaction_version
  ) VALUES (
    audit_id, launch.tenant_id, 'eve-launch-watchdog', 'service', 'schedule',
    launch.id::TEXT, 'eve-final-launch-v1', governance.policy_status,
    governance.state_version, 'launch.canary_expired', 'launch:' || launch.id,
    'failed', 'not_used', jsonb_build_object('reason', 'canary_deadline_expired')::TEXT,
    jsonb_build_object('releaseEnabled', FALSE, 'emergencyOff', TRUE)::TEXT,
    'The bounded canary expired, so Eve failed closed through emergency-off.',
    jsonb_build_object('operation', 'expire_eve_launch_canaries'), 'eve-audit-v1'
  );
  UPDATE public.eve_launch_records SET
    status = 'rolled_back', canary_results = jsonb_build_object('deadlineExpired', TRUE),
    close_audit_id = audit_id, closed_at = NOW()
  WHERE id = launch.id;
  UPDATE public.eve_launch_manifests SET status = 'rolled_back'
  WHERE id = launch.manifest_id;
  RETURN 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_eve_launch_manifests(p_limit INTEGER DEFAULT 200)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE expired_count INTEGER;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'eve_launch_service_role_required'; END IF;
  WITH expired AS (
    DELETE FROM public.eve_launch_manifests AS candidate
    WHERE candidate.id IN (
      SELECT manifest.id FROM public.eve_launch_manifests AS manifest
      WHERE manifest.retention_expires_at <= NOW()
        AND manifest.status IN ('not_ready', 'evidence_passed', 'completed', 'rolled_back', 'expired')
        AND NOT EXISTS (
          SELECT 1 FROM public.eve_retention_holds AS hold
          WHERE hold.tenant_id = manifest.tenant_id AND hold.status = 'active'
            AND hold.scope_type = 'category' AND hold.target_id = manifest.retention_category
        )
      ORDER BY manifest.retention_expires_at
      LIMIT LEAST(GREATEST(p_limit, 1), 1000) FOR UPDATE SKIP LOCKED
    ) RETURNING id
  ) SELECT count(*)::INTEGER INTO expired_count FROM expired;
  RETURN expired_count;
END;
$$;

REVOKE ALL ON FUNCTION public.assert_eve_launch_profile(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_eve_launch_permission(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_eve_launch_manifest(UUID, UUID, JSONB, JSONB, TEXT, UUID, TEXT, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_eve_launch_permission(UUID, UUID, TEXT, BOOLEAN, TEXT, UUID, TEXT, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.review_eve_launch_manifest(UUID, UUID, TEXT, TEXT, TEXT, UUID, TEXT, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.activate_eve_launch_manifest(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BIGINT, TEXT, TEXT, BIGINT, TEXT, UUID, TEXT, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_eve_release_safety_control(UUID, TEXT, BIGINT, TEXT, UUID, TEXT, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.close_eve_launch_canary(UUID, UUID, TEXT, JSONB, TEXT, UUID, TEXT, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.expire_eve_launch_canaries() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.expire_eve_launch_manifests(INTEGER) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_eve_launch_manifest(UUID, UUID, JSONB, JSONB, TEXT, UUID, TEXT, UUID, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_eve_launch_permission(UUID, UUID, TEXT, BOOLEAN, TEXT, UUID, TEXT, UUID, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.review_eve_launch_manifest(UUID, UUID, TEXT, TEXT, TEXT, UUID, TEXT, UUID, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.activate_eve_launch_manifest(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BIGINT, TEXT, TEXT, BIGINT, TEXT, UUID, TEXT, UUID, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_eve_release_safety_control(UUID, TEXT, BIGINT, TEXT, UUID, TEXT, UUID, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.close_eve_launch_canary(UUID, UUID, TEXT, JSONB, TEXT, UUID, TEXT, UUID, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_eve_launch_canaries() TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_eve_launch_manifests(INTEGER) TO service_role;

COMMENT ON TABLE public.eve_launch_manifests IS
  'Immutable, target-bound, redacted Eve launch evidence. Readiness never grants authority by itself.';
COMMENT ON FUNCTION public.activate_eve_launch_manifest(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BIGINT, TEXT, TEXT, BIGINT, TEXT, UUID, TEXT, UUID, TEXT, TEXT, TEXT) IS
  'Sole atomic human activation path for the existing Eve release switch; requires current evidence and independent reviews.';
