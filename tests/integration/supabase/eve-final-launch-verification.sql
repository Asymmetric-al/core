-- Destructive-state-safe local proof for #437. Every mutation is rolled back.
\set ON_ERROR_STOP on

BEGIN;
SET LOCAL request.jwt.claim.role = 'service_role';

DO $proof$
<<launch_proof>>
DECLARE
  tenant_id CONSTANT UUID := '43700000-0000-4000-8000-000000000001';
  creator_id CONSTANT UUID := '43700000-0000-4000-8000-000000000002';
  release_reviewer_id CONSTANT UUID := '43700000-0000-4000-8000-000000000003';
  security_reviewer_id CONSTANT UUID := '43700000-0000-4000-8000-000000000004';
  activator_id CONSTANT UUID := '43700000-0000-4000-8000-000000000005';
  manifest_id CONSTANT UUID := '43700000-0000-4000-8000-000000000006';
  launch_id UUID;
  v_state_version BIGINT;
  v_policy_version BIGINT;
  v_policy_hash CONSTANT TEXT := repeat('d', 64);
  activation JSONB;
BEGIN
  INSERT INTO public.tenants (id, name, slug)
  VALUES (tenant_id, 'Eve launch proof', 'eve-launch-proof-437');

  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES
    (creator_id, '00000000-0000-0000-0000-000000000000', 'authenticated',
      'authenticated', 'creator@example.test', '', '{}', '{}', NOW(), NOW()),
    (release_reviewer_id, '00000000-0000-0000-0000-000000000000', 'authenticated',
      'authenticated', 'release@example.test', '', '{}', '{}', NOW(), NOW()),
    (security_reviewer_id, '00000000-0000-0000-0000-000000000000', 'authenticated',
      'authenticated', 'security@example.test', '', '{}', '{}', NOW(), NOW()),
    (activator_id, '00000000-0000-0000-0000-000000000000', 'authenticated',
      'authenticated', 'activator@example.test', '', '{}', '{}', NOW(), NOW());

  UPDATE public.profiles SET
    tenant_id = launch_proof.tenant_id,
    role = 'super_admin',
    display_name = CASE id
      WHEN creator_id THEN 'Manifest creator'
      WHEN release_reviewer_id THEN 'Release reviewer'
      WHEN security_reviewer_id THEN 'Security reviewer'
      ELSE 'Release activator'
    END
  WHERE id IN (creator_id, release_reviewer_id, security_reviewer_id, activator_id);

  SELECT COALESCE(max(version), 0) + 1
  INTO v_policy_version
  FROM public.eve_model_policies AS model_policy
  WHERE model_policy.scope_type = 'platform' AND model_policy.tenant_id IS NULL;
  UPDATE public.eve_model_policies AS model_policy SET status = 'retired'
  WHERE model_policy.scope_type = 'platform'
    AND model_policy.tenant_id IS NULL AND model_policy.status = 'active';
  INSERT INTO public.eve_model_policies (
    scope_type, version, status, policy, policy_hash, eval_status,
    eval_summary, evaluated_at, activated_at, created_by_profile_id
  ) VALUES (
    'platform', v_policy_version, 'active', '{}', v_policy_hash, 'passed',
    '{"status":"passed","checks":[]}', NOW(), NOW(), creator_id
  );

  UPDATE public.eve_governance_state SET
    release_enabled = FALSE,
    emergency_off = FALSE,
    policy_status = 'ready',
    kill_switch_state = jsonb_build_object(
      'all_automation', FALSE,
      'active_runs', FALSE,
      'github_actions', FALSE,
      'production_writes', FALSE,
      'sandbox_networking', FALSE,
      'dynamic_workflows', FALSE,
      'model_policy_changes', FALSE,
      'force_approval', TRUE
    ),
    state_version = state_version + 1,
    updated_by_profile_id = creator_id,
    updated_at = NOW()
  WHERE id = 'global'
  RETURNING eve_governance_state.state_version INTO v_state_version;

  INSERT INTO public.eve_audit_events (
    id, tenant_id, actor_id, actor_profile_id, actor_role, identity_mode,
    initiator_type, initiator_id, policy_id, policy_status,
    governance_state_version, action, target, result, model_role,
    evidence_summary, change_summary, decision_summary, debug_metadata
  ) VALUES (
    '43700000-0000-4000-8000-000000000010', tenant_id, 'proof-creator',
    creator_id, 'super_admin', 'admin', 'admin', 'proof-creator',
    'eve-final-launch-v1', 'ready', v_state_version, 'launch.manifest_created',
    'launch-target:production:dpl-proof', 'succeeded', 'not_used',
    '{"ready":true}', '{"stateChanged":false}',
    'Local transaction proof created target-bound launch evidence.', '{}'
  );

  INSERT INTO public.eve_launch_manifests (
    id, tenant_id, status, content_hash, environment, revision, deployment_id,
    migration_version, governance_state_version, policy_version,
    model_policy_revision, eval_config_revision, generated_at, expires_at,
    document, evaluation, audit_id, created_by_profile_id,
    retention_expires_at
  ) VALUES (
    manifest_id, tenant_id, 'evidence_passed', repeat('a', 64), 'production',
    repeat('b', 40), 'dpl-proof',
    '20260718102000_eve_final_launch_verification', v_state_version,
    v_policy_version, v_policy_hash, repeat('c', 64), NOW() - INTERVAL '1 minute',
    NOW() + INTERVAL '1 hour', '{"schemaVersion":"eve-launch-manifest-v1"}',
    '{"ready":true,"blockers":[]}',
    '43700000-0000-4000-8000-000000000010', creator_id,
    NOW() + INTERVAL '365 days'
  );

  PERFORM public.grant_eve_launch_permission(
    tenant_id, release_reviewer_id, 'release.review', TRUE, 'Local proof',
    '43700000-0000-4000-8000-000000000011', 'proof-creator', creator_id,
    'super_admin', 'admin', 'proof-creator'
  );
  PERFORM public.grant_eve_launch_permission(
    tenant_id, security_reviewer_id, 'release.review', TRUE, 'Local proof',
    '43700000-0000-4000-8000-000000000012', 'proof-creator', creator_id,
    'super_admin', 'admin', 'proof-creator'
  );
  PERFORM public.grant_eve_launch_permission(
    tenant_id, activator_id, 'release.activate', TRUE, 'Local proof',
    '43700000-0000-4000-8000-000000000013', 'proof-creator', creator_id,
    'super_admin', 'admin', 'proof-creator'
  );

  PERFORM public.review_eve_launch_manifest(
    tenant_id, manifest_id, 'release', 'approved', 'Release evidence verified.',
    '43700000-0000-4000-8000-000000000014', 'proof-release-reviewer',
    release_reviewer_id, 'super_admin', 'admin', 'proof-release-reviewer'
  );
  PERFORM public.review_eve_launch_manifest(
    tenant_id, manifest_id, 'security', 'approved', 'Safety evidence verified.',
    '43700000-0000-4000-8000-000000000015', 'proof-security-reviewer',
    security_reviewer_id, 'super_admin', 'admin', 'proof-security-reviewer'
  );

  IF (SELECT status FROM public.eve_launch_manifests WHERE id = manifest_id) <> 'ready' THEN
    RAISE EXCEPTION 'proof_failed_manifest_not_ready';
  END IF;

  activation := public.activate_eve_launch_manifest(
    tenant_id, manifest_id, repeat('a', 64), 'production', repeat('b', 40),
    'dpl-proof', '20260718102000_eve_final_launch_verification',
    v_policy_version, v_policy_hash, repeat('c', 64), v_state_version,
    'Local activation proof',
    '43700000-0000-4000-8000-000000000016', 'proof-activator', activator_id,
    'super_admin', 'admin', 'proof-activator'
  );
  launch_id := (activation ->> 'launchId')::UUID;

  IF NOT (SELECT release_enabled FROM public.eve_governance_state WHERE id = 'global') THEN
    RAISE EXCEPTION 'proof_failed_release_not_enabled';
  END IF;

  PERFORM public.close_eve_launch_canary(
    tenant_id, launch_id, 'failed', jsonb_build_object(
      'state_visible', FALSE,
      'trigger_gate_current', FALSE,
      'audit_recorded', FALSE,
      'budget_enforced', FALSE,
      'notification_safe', FALSE,
      'non_destructive_canary', FALSE
    ), 'Local rollback proof',
    '43700000-0000-4000-8000-000000000017', 'proof-activator', activator_id,
    'super_admin', 'admin', 'proof-activator'
  );

  IF (SELECT release_enabled FROM public.eve_governance_state WHERE id = 'global')
    OR NOT (SELECT emergency_off FROM public.eve_governance_state WHERE id = 'global')
    OR (SELECT status FROM public.eve_launch_records WHERE id = launch_id) <> 'rolled_back'
  THEN
    RAISE EXCEPTION 'proof_failed_to_fail_closed';
  END IF;
END;
$proof$;

ROLLBACK;

SELECT 'eve_final_launch_verification_proof_passed' AS result;
