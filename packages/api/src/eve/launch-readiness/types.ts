export const EVE_LAUNCH_ENVIRONMENTS = [
  "development",
  "preview",
  "staging",
  "production",
] as const;

export type EveLaunchEnvironment = (typeof EVE_LAUNCH_ENVIRONMENTS)[number];

export const EVE_LAUNCH_SLICE_IDS = [
  "417",
  "418",
  "419",
  "420",
  "421",
  "422",
  "423",
  "424",
  "425",
  "426",
  "427",
  "428",
  "429",
  "430",
  "431",
  "432",
  "433",
  "434",
  "435",
  "436",
] as const;

export type EveLaunchSliceId = (typeof EVE_LAUNCH_SLICE_IDS)[number];

export const EVE_LAUNCH_COMPOSITION_CHECK_IDS = [
  "identity_and_tenant_isolation",
  "audit_redaction_and_replay",
  "evals_models_budgets_and_approvals",
  "protected_areas_and_sensitive_files",
  "sandbox_and_network_containment",
  "release_off_trigger_suppression",
  "kill_switches_and_active_run_stop",
  "runtime_and_session_durability",
  "admin_workspace_and_global_panel",
  "github_review_pr_and_merge_controls",
  "subagents_context_and_workflows",
  "monitors_memory_and_notifications",
  "retention_holds_and_expiry",
  "deployment_runtime_compatibility",
  "observability_and_operator_access",
] as const;

export type EveLaunchCompositionCheckId =
  (typeof EVE_LAUNCH_COMPOSITION_CHECK_IDS)[number];

export const EVE_LAUNCH_REVERSAL_CHECK_IDS = [
  "emergency_off",
  "all_automation_stop",
  "active_run_termination",
  "force_approval",
  "notification_pause",
  "provider_and_credential_disable",
  "deployment_rollback",
  "model_policy_rollback",
  "data_recovery",
] as const;

export type EveLaunchReversalCheckId =
  (typeof EVE_LAUNCH_REVERSAL_CHECK_IDS)[number];

export const EVE_LAUNCH_RUNBOOKS = {
  activation: "docs/guides/operations/eve-launch.md",
  approvals_and_budgets: "docs/guides/operations/eve-launch.md",
  audit_and_replay: "docs/guides/operations/eve-launch.md",
  emergency_and_kill_switches: "docs/guides/operations/eve-emergency.md",
  notifications: "docs/guides/operations/eve-operator-notifications.md",
  retention_and_holds: "docs/guides/operations/eve-launch.md",
  rollback_and_recovery: "docs/guides/operations/eve-emergency.md",
  state_inspection: "docs/guides/operations/eve-launch.md",
} as const;

export type EveLaunchRunbookId = keyof typeof EVE_LAUNCH_RUNBOOKS;

export const EVE_LAUNCH_CANARY_IDS = [
  "state_visible",
  "trigger_gate_current",
  "audit_recorded",
  "budget_enforced",
  "notification_safe",
  "non_destructive_canary",
] as const;

export type EveLaunchCanaryId = (typeof EVE_LAUNCH_CANARY_IDS)[number];

export const EVE_LAUNCH_PERMISSIONS = [
  "release.review",
  "release.activate",
] as const;

export type EveLaunchPermission = (typeof EVE_LAUNCH_PERMISSIONS)[number];

export interface EveActiveModelPolicyBinding {
  revision: string;
  version: number;
}

export interface EveLaunchTarget {
  deploymentId: string;
  environment: EveLaunchEnvironment;
  evalConfigRevision: string;
  governanceStateVersion: number;
  migrationVersion: string;
  modelPolicyRevision: string;
  policyVersion: number;
  revision: string;
}

export interface EveLaunchEvidence {
  digest: string;
  expiresAt: string;
  kind:
    | "audit_event"
    | "ci_check"
    | "deployment_probe"
    | "operator_exercise"
    | "runbook_check"
    | "test_report";
  observedAt: string;
  reference: string;
  result: "failed" | "passed";
  summary: string;
  target: EveLaunchTarget;
}

export interface EveLaunchManifestDocument {
  composition: Array<{
    checkId: EveLaunchCompositionCheckId;
    evidence: EveLaunchEvidence;
  }>;
  expiresAt: string;
  generatedAt: string;
  observations: string[];
  reversal: Array<{
    checkId: EveLaunchReversalCheckId;
    evidence: EveLaunchEvidence;
  }>;
  runbooks: Array<{
    evidence: EveLaunchEvidence;
    owner: string;
    path: string;
    runbookId: EveLaunchRunbookId;
  }>;
  schemaVersion: "eve-launch-manifest-v1";
  slices: Array<{
    acceptanceEvidence: EveLaunchEvidence;
    implementationRevision: string;
    operationalEvidence: EveLaunchEvidence;
    responsibleReviewer: string;
    runbookId: EveLaunchRunbookId;
    sliceId: EveLaunchSliceId;
    status: "draft_only" | "implemented" | "open_work";
  }>;
  target: EveLaunchTarget;
}

export interface EveLaunchReadinessEvaluation {
  blockers: string[];
  evaluatedAt: string;
  evidenceCount: number;
  ready: boolean;
}

export type EveLaunchManifestStatus =
  | "not_ready"
  | "evidence_passed"
  | "ready"
  | "active"
  | "completed"
  | "rolled_back"
  | "expired";

export interface EveLaunchReview {
  createdAt: string;
  decision: "approved" | "rejected";
  manifestId: string;
  reviewerProfileId: string;
  reviewerRole: "release" | "security";
  summary: string;
}

export interface EveLaunchManifestRecord {
  auditId: string;
  contentHash: string;
  createdAt: string;
  createdByProfileId: string;
  document: EveLaunchManifestDocument;
  evaluation: EveLaunchReadinessEvaluation;
  id: string;
  reviews: EveLaunchReview[];
  status: EveLaunchManifestStatus;
  tenantId: string;
}

export interface EveLaunchRecord {
  activatedAt: string;
  activatedByProfileId: string;
  canaryDeadline: string;
  canaryResults?: Record<EveLaunchCanaryId, boolean>;
  closedAt?: string;
  id: string;
  manifestId: string;
  status: "active" | "completed" | "rolled_back";
}

export interface EveLaunchAdminView {
  canActivate: boolean;
  canReview: boolean;
  latestLaunch?: EveLaunchRecord;
  manifests: EveLaunchManifestRecord[];
  runtimeTarget?: EveLaunchTarget;
}
