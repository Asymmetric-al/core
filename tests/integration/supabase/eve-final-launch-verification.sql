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
  duplicate_rejected BOOLEAN := FALSE;
  passing_canary_blocked BOOLEAN := FALSE;
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

  PERFORM public.create_eve_launch_manifest(
    tenant_id, manifest_id,
    jsonb_build_object(
      'schemaVersion', 'eve-launch-manifest-v1',
      'generatedAt', NOW() - INTERVAL '1 minute',
      'expiresAt', NOW() + INTERVAL '1 hour',
      'target', jsonb_build_object(
        'environment', 'production', 'revision', repeat('b', 40),
        'deploymentId', 'dpl-proof',
        'migrationVersion', '20260718102000_eve_final_launch_verification',
        'governanceStateVersion', v_state_version,
        'policyVersion', v_policy_version,
        'modelPolicyRevision', v_policy_hash,
        'evalConfigRevision', repeat('c', 64)
      )
    ),
    jsonb_build_object(
      'ready', TRUE, 'blockers', jsonb_build_array(),
      'evidenceCount', 72, 'evaluatedAt', NOW()
    ),
    repeat('a', 64), '43700000-0000-4000-8000-000000000010',
    'proof-creator', creator_id, 'super_admin', 'admin', 'proof-creator'
  );

  BEGIN
    PERFORM public.create_eve_launch_manifest(
      tenant_id, '43700000-0000-4000-8000-000000000007',
      (SELECT document FROM public.eve_launch_manifests WHERE id = manifest_id),
      (SELECT evaluation FROM public.eve_launch_manifests WHERE id = manifest_id),
      repeat('a', 64), '43700000-0000-4000-8000-000000000018',
      'proof-creator', creator_id, 'super_admin', 'admin', 'proof-creator'
    );
  EXCEPTION WHEN unique_violation THEN
    duplicate_rejected := TRUE;
  END;
  IF NOT duplicate_rejected OR EXISTS (
    SELECT 1 FROM public.eve_audit_events
    WHERE id = '43700000-0000-4000-8000-000000000018'
  ) THEN
    RAISE EXCEPTION 'proof_failed_manifest_audit_not_atomic';
  END IF;

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

  UPDATE public.eve_governance_state SET
    kill_switch_state = jsonb_set(
      kill_switch_state, '{production_writes}', 'true'::JSONB, FALSE
    )
  WHERE id = 'global';
  BEGIN
    PERFORM public.close_eve_launch_canary(
      tenant_id, launch_id, 'completed', jsonb_build_object(
        'state_visible', TRUE,
        'trigger_gate_current', TRUE,
        'audit_recorded', TRUE,
        'budget_enforced', TRUE,
        'notification_safe', TRUE,
        'non_destructive_canary', TRUE
      ), 'Blocked completion proof',
      '43700000-0000-4000-8000-000000000019', 'proof-activator', activator_id,
      'super_admin', 'admin', 'proof-activator'
    );
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%eve_launch_blocked%' THEN RAISE; END IF;
    passing_canary_blocked := TRUE;
  END;
  IF NOT passing_canary_blocked
    OR (SELECT status FROM public.eve_launch_records WHERE id = launch_id) <> 'active'
  THEN
    RAISE EXCEPTION 'proof_failed_blocked_governance_completed_canary';
  END IF;
  UPDATE public.eve_governance_state SET
    kill_switch_state = jsonb_set(
      kill_switch_state, '{production_writes}', 'false'::JSONB, FALSE
    )
  WHERE id = 'global';

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
