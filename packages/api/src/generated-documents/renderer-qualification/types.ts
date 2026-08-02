/**
 * Phase 18 D3 renderer qualification contest — frozen charter contracts.
 *
 * The contest is pre-registered: candidates, corpus, gates, weights, budgets,
 * validators, roles, remediation allowance, and evidence rules freeze under
 * one digest BEFORE either finalist is judged, so a candidate can never be
 * tuned to fixture answers or select itself by defining a budget after
 * measurement. Normative source:
 * `docs/prds/sitestacker-parity/phase-18-renderer-qualification-protocol.md`
 * and ADR-0034.
 */

export const RENDERER_QUALIFICATION_SCHEMA_VERSION = "1";

export const RENDERER_CANDIDATE_IDS = [
  "P18-R-P",
  "P18-R-T",
  "P18-R-C",
] as const;
export type RendererCandidateId = (typeof RENDERER_CANDIDATE_IDS)[number];

export type RendererCandidateEligibility = "comparison_control" | "finalist";

export type RendererCandidateDeploymentMode = "managed" | "self_hosted";

export interface RendererSourceCompilerLock {
  name: string;
  version: string;
  digest: string;
}

export interface RendererSandboxPolicy {
  killable: boolean;
  network_access: "allowed" | "denied";
  ambient_host_filesystem_access: "allowed" | "denied";
  inputs_pre_vendored: boolean;
}

export interface RendererCandidateSubstitutionReset {
  superseded_charter_id: string;
  superseded_charter_version: string;
  superseded_manifest_digest: string;
  superseded_frozen_at: string;
  superseded_held_back_seal_digest: string;
  reason: string;
}

export interface RendererCandidateLock {
  candidate_id: RendererCandidateId;
  display_name: string;
  eligibility: RendererCandidateEligibility;
  deployment_mode: RendererCandidateDeploymentMode;
  engine: string;
  engine_version: string;
  pipeline: string;
  adapter_commit: string;
  adapter_digest: string;
  dependency_lock_digest: string;
  source_compiler: RendererSourceCompilerLock;
  container_runtime?: string;
  container_runtime_digest?: string;
  container_image_digest?: string;
  os_libc?: string;
  /**
   * SHA-256 of the exact engine binary. The protocol requires it for the
   * self-hosted candidates ("Only the exact frozen binary and sandbox
   * qualify"); the managed Prince pipeline pins its engine through the
   * provider.
   */
  engine_binary_digest?: string;
  /** SHA-256 of retained evidence tying an engine binary to its distributor. */
  distribution_provenance_digest?: string;
  /** Explicit browser/toolchain pins for the Chromium comparison control. */
  playwright_version?: string;
  browser_revision?: string;
  /** Machine-checkable isolation guarantees for self-hosted finalist runtimes. */
  sandbox_policy?: RendererSandboxPolicy;
  /** Required predecessor/reset evidence for a self-hosted Prince substitution. */
  substitution_reset?: RendererCandidateSubstitutionReset;
  fonts_assets_packages: readonly {
    /** Stable deployment role/path that uniquely binds this artifact's bytes. */
    artifact_id: string;
    name: string;
    version: string;
    license: string;
    digest: string;
  }[];
  locale_data_version: string;
  /**
   * Protocol: the evidence package pins "every build, deployment, compiler,
   * adapter, dependency, font, asset, locale-data, finalizer, validator,
   * container and configuration digest". A version label alone lets either
   * input change without changing the lock.
   */
  locale_data_digest: string;
  finalizer: { name: string; version: string; digest: string };
  configuration_digest: string;
  /** Human-readable provider policy; self-hosted locks use sandbox_policy only. */
  network_filesystem_policy?: string;
  provider_settings?: Readonly<Record<string, string>>;
}

export const OPEN_CASE_IDS = [
  "O01",
  "O02",
  "O03",
  "O04",
  "O05",
  "O06",
  "O07",
  "O08",
  "O09",
  "O10",
  "O11",
  "O12",
  "O13",
  "O14",
  "O15",
  "O16",
  "O17",
  "O18",
] as const;
export type OpenCaseId = (typeof OPEN_CASE_IDS)[number];

export const HELD_BACK_CASE_IDS = [
  "H01",
  "H02",
  "H03",
  "H04",
  "H05",
  "H06",
  "H07",
  "H08",
  "H09",
  "H10",
  "H11",
  "H12",
] as const;
export type HeldBackCaseId = (typeof HELD_BACK_CASE_IDS)[number];

export type QualificationCaseId = HeldBackCaseId | OpenCaseId;

export type QualificationOutputProfile =
  | "accessible-archive-v1"
  | "accessible-v1"
  | "both";

export interface QualificationCaseExpectation {
  protected_facts: readonly string[];
  layout_assertions: readonly string[];
  failure_behavior?: string;
}

export interface QualificationCaseManifest {
  case_id: QualificationCaseId;
  visibility: "held_back" | "open";
  title: string;
  output_profile: QualificationOutputProfile;
  /** Every fixture is synthetic; real donor/tenant data can never enter. */
  synthetic: true;
  fixture: {
    facts_digest: string;
    document_digest: string;
    /** Documented schema/bounds — visible to candidate implementers. */
    bounds: string;
  };
  /** Present only for open cases: candidate implementers may see these. */
  expected?: QualificationCaseExpectation;
  /**
   * Present only for held-back cases: the custodian seals the expected
   * results out of band and only their digest enters the charter.
   */
  sealed_expectation_digest?: string;
}

export const SYNTHETIC_CORPUS_PROOF_SCHEMA_VERSION =
  "phase-18-synthetic-corpus-proof/v1";

export interface SyntheticCorpusProof {
  proof_id: string;
  schema_version: typeof SYNTHETIC_CORPUS_PROOF_SCHEMA_VERSION;
  assurance: "synthetic_generation";
  /** Digest of every case ID and its exact facts/document digest pair. */
  fixture_manifest_digest: string;
  procedure: {
    id: string;
    version: string;
    digest: string;
  };
  /** Retained evidence that the pinned procedure generated this corpus. */
  generation_evidence_digest: string;
  attested_by: string;
  attested_at: string;
  /** Digest of every proof field except this field itself. */
  proof_digest: string;
}

export const QUALIFICATION_GATE_IDS = [
  "G01",
  "G02",
  "G03",
  "G04",
  "G05",
  "G06",
  "G07",
  "G08",
  "G09",
  "G10",
  "G11",
  "G12",
] as const;
export type QualificationGateId = (typeof QUALIFICATION_GATE_IDS)[number];

export interface QualificationGate {
  gate_id: QualificationGateId;
  title: string;
  pass_rule: string;
}

export const SCORE_DIMENSION_IDS = [
  "fidelity_editor_simplicity",
  "accessibility_archival_quality",
  "long_document_throughput",
  "isolation_failure_clarity",
  "international_text",
  "total_operational_cost",
  "provider_portability",
] as const;
export type ScoreDimensionId = (typeof SCORE_DIMENSION_IDS)[number];

/** The seven weights are frozen by the protocol: 20/20/20/15/10/10/5. */
export const SCORE_DIMENSION_WEIGHTS: Readonly<
  Record<ScoreDimensionId, number>
> = {
  fidelity_editor_simplicity: 20,
  accessibility_archival_quality: 20,
  long_document_throughput: 20,
  isolation_failure_clarity: 15,
  international_text: 10,
  total_operational_cost: 10,
  provider_portability: 5,
};

export interface ScoreDimension {
  dimension_id: ScoreDimensionId;
  title: string;
  weight: number;
  /** Exact 0–5 anchors. */
  anchors: readonly [string, string, string, string, string, string];
  /**
   * The protocol's "Evidence considered after the hard gates" for this
   * category. Frozen so reviewers cannot change what evidence justifies a
   * score once results are visible.
   */
  evidence_basis: string;
}

export interface ScoringRules {
  reviewer_count: 2;
  reviewer_method: "independent";
  /** Protocol: a 4 or 5 needs written benefit evidence beyond the hard gate. */
  score_above_three_requires_written_beyond_gate_evidence: true;
  scoring_eligibility: "both_finalists_pass_every_hard_gate";
  reviewer_total_aggregation: "mean";
  /** Uncertainty band = max(this, half the reviewer-total difference). */
  min_uncertainty_band_points: number;
  uncertainty_band_formula: "max_minimum_or_half_absolute_reviewer_total_difference";
  /** Material lead requires at least this mean difference plus band separation. */
  material_lead_points: number;
  material_lead_rule: "mean_difference_at_least_threshold_and_strict_uncertainty_band_separation";
  /** Order-sensitive deterministic tie-break evidence comparison. */
  tie_break_order: readonly [string, string, string];
  /** Ordered, inert charter policy. T6 owns execution and the decision record. */
  selection_order: readonly [string, string, string, string, string];
  tie_break_resolution_rule: "first_documented_material_advantage_else_no_winner";
  candidate_preference: "none";
}

export interface OperationalSuites {
  repeatability: {
    case_ids: readonly QualificationCaseId[];
    cold_runs_per_case: number;
    warm_runs_per_case: number;
  };
  mixed_batch: {
    total_items: number;
    tenants: number;
    short_items: number;
    medium_items: number;
    long_items: number;
    poison_items: number;
    successful_item_policy: "remain_successful";
    ambiguous_item_policy: "do_not_rerun";
    retry_eligibility: "eligible_failures_only";
    retry_pin_policy: "reuse_exact_pins";
  };
  fairness: {
    heavy_tenant_items: number;
    heavy_item_shape: "long_100_plus_pages";
    light_tenants: number;
    light_items_each: number;
    light_item_shape: "short_one_page";
    claim_bound_multiplier: number;
    /**
     * Protocol: the claim bound holds "subject only to an explicitly recorded
     * safety throttle". Unrecorded, any fairness miss can be explained away as
     * one after the fact.
     */
    permitted_safety_throttle: string;
  };
  concurrency_staircase: {
    /** Order-sensitive steps. */
    steps: readonly number[];
    /**
     * Protocol: the staircase stops "at the first predeclared safety ceiling
     * rather than overrunning a managed-provider quota". Predeclared is the
     * operative word - a ceiling chosen mid-run is not evidence.
     */
    safety_ceiling_concurrent_attempts: number;
  };
  failure_matrix: {
    injections: readonly string[];
    /**
     * Protocol: each injection runs "after each durable boundary". Freezing the
     * injections alone lets a candidate inject all eight at one convenient
     * point and still claim the suite. Ordered, from the protocol's numbered
     * attempt sequence.
     */
    durable_boundaries: readonly string[];
  };
  outage_recovery: {
    outage_window_minutes: number;
    proof: string;
  };
}

export const REQUIRED_BUDGET_METRICS = [
  "short_item_latency_p50_ms",
  "short_item_latency_p95_ms",
  "short_item_latency_p99_ms",
  "medium_item_latency_p95_ms",
  "long_item_latency_p95_ms",
  "batch_completion_minutes",
  "throughput_items_per_minute",
  "max_attempt_deadline_ms",
  "max_queue_age_seconds",
  "max_resident_memory_mb",
  "max_artifact_bytes",
  "min_capacity_headroom_percent",
  "max_error_rate_percent",
  "max_retry_rate_percent",
  "max_provider_requests_per_hour",
  "max_cost_usd_per_thousand_documents",
  "recovery_time_objective_minutes",
] as const;
export type RequiredBudgetMetric = (typeof REQUIRED_BUDGET_METRICS)[number];

export interface AbsoluteBudget {
  metric: RequiredBudgetMetric;
  limit: number;
  unit: string;
  basis: string;
}

export const VALIDATOR_CATEGORIES = [
  "pdf_a_machine",
  "pdf_ua_machine",
  "product_validator",
  "text_structure_extraction",
  "visual_diff",
  "assistive_technology",
] as const;
export type ValidatorCategory = (typeof VALIDATOR_CATEGORIES)[number];

export interface ValidationToolArtifactPins {
  /** SHA-256 of the executable, toolchain bundle, or composite manual runner. */
  executable_digest: string;
  /** SHA-256 of the exact rules, configuration, tolerances, or checklist. */
  configuration_digest: string;
}

export interface ContentAddressedValidationComponent {
  name: string;
  version: string;
  digest: string;
}

export interface AssistiveTechnologyStackLock {
  stack_id: "primary" | "secondary";
  viewer: ContentAddressedValidationComponent;
  assistive_technology: ContentAddressedValidationComponent;
  task_protocol: ContentAddressedValidationComponent;
}

export interface ValidationTool {
  name: string;
  version: string;
  category: ValidatorCategory;
  ruleset: string;
  executable_digest: string;
  configuration_digest: string;
  /** Required only by the manual assistive-technology validator. */
  assistive_technology_stacks?: readonly [
    AssistiveTechnologyStackLock,
    AssistiveTechnologyStackLock,
  ];
}

export type ValidationToolProtocolDefinition = Omit<
  ValidationTool,
  "assistive_technology_stacks" | "configuration_digest" | "executable_digest"
>;

export interface QualificationRoles {
  accountable_owner: string;
  corpus_custodian: string;
  candidate_operators: Readonly<Record<RendererCandidateId, string>>;
  independent_reviewers: readonly [string, string];
  security_privacy_reviewer: string;
  /** Proves load, fairness, failure recovery, cost, capacity, and rollback. */
  operations_reviewer: string;
  /** Confirms profile, font-license, retention, and purpose prerequisites. */
  records_legal_evidence_owner: string;
  final_approver: string;
}

export interface CharterApproval {
  actor: string;
  role: string;
  approved_at: string;
  statement: string;
}

export interface HeldBackSeal {
  custodian: string;
  sealed_at: string;
  /** Digest of the custodian-held expected results, sealed before any candidate work. */
  sealed_expectations_digest: string;
  access_log: readonly { actor: string; at: string; reason: string }[];
}

export interface RemediationPolicy {
  initial_attempts: 1;
  max_cycles: 2;
  max_hours_per_cycle: number;
  permitted_changes: string;
}

export interface EvidenceRules {
  package_schema_version: string;
  /** T6 owns the record type; T3 freezes the format identity it must implement. */
  decision_record_format: "phase-18-protocol-decision-record/v1";
  redaction_policy: string;
  retention_owner: string;
  retention_days: number;
  validator_warning_policy: {
    retain_all_warnings: true;
    adjudicate_warnings_individually: true;
    rule_override_requires_charter_reset_and_rerun: true;
    profile_declaration_is_not_a_pass: true;
  };
}

export interface RendererQualificationCharterInput {
  charter_id: string;
  charter_version: string;
  frozen_at: string;
  roles: QualificationRoles;
  approvals: readonly CharterApproval[];
  candidates: readonly RendererCandidateLock[];
  open_corpus: readonly QualificationCaseManifest[];
  held_back_corpus: readonly QualificationCaseManifest[];
  synthetic_corpus_proof: SyntheticCorpusProof;
  held_back_seal: HeldBackSeal;
  operational_suites: OperationalSuites;
  gates: readonly QualificationGate[];
  score_dimensions: readonly ScoreDimension[];
  scoring_rules: ScoringRules;
  budgets: readonly AbsoluteBudget[];
  validators: readonly ValidationTool[];
  remediation_policy: RemediationPolicy;
  evidence_rules: EvidenceRules;
  requalification_triggers: readonly string[];
  /**
   * Protocol: the frozen charter carries the "incident stop conditions". They
   * are pre-registered so a leak, unequal tuning, or compromised reviewer
   * independence cannot be reinterpreted once results are inspected.
   */
  stop_conditions: readonly string[];
  /** Unknown or missing evidence always fails the affected hard gate. */
  unknown_evidence_rule: "fails_affected_gate";
}

export interface FrozenRendererQualificationCharter extends RendererQualificationCharterInput {
  schema_version: string;
  /** Canonicalization algorithm used to produce and verify the digest. */
  serializer_version: string;
  /** SHA-256 over the canonical serialization of every frozen field. */
  manifest_digest: string;
}

export interface RendererQualificationManifest {
  schema_version: string;
  serializer_version: string;
  charter_id: string;
  charter_version: string;
  digest_algorithm: "sha256";
  manifest_digest: string;
}

export interface CharterVerificationFailure {
  code:
    | "digest_mismatch"
    | "schema_version_unsupported"
    | "serializer_version_unsupported"
    | "structure_invalid";
  detail: string;
}

export interface CharterVerificationResult {
  valid: boolean;
  failures: readonly CharterVerificationFailure[];
}

export interface CharterValidationIssue {
  path: string;
  code: string;
  message: string;
}

/**
 * What a candidate implementer receives: open evidence in full, held-back
 * schemas/bounds only — never held-back expected values or outputs.
 */
export interface CandidateWorkPacket {
  charter_id: string;
  charter_version: string;
  manifest_digest: string;
  candidate_id: RendererCandidateId;
  candidate_lock: RendererCandidateLock;
  open_cases: readonly QualificationCaseManifest[];
  /**
   * Schema and bounds only. Held-back titles are withheld before sealing because
   * they encode each fixture's hidden variation.
   */
  held_back_case_schemas: readonly {
    case_id: QualificationCaseId;
    output_profile: QualificationOutputProfile;
    bounds: string;
  }[];
  operational_suites: OperationalSuites;
  gates: readonly QualificationGate[];
  budgets: readonly AbsoluteBudget[];
  remediation_policy: RemediationPolicy;
}

export interface SealedCandidateSubmission {
  submission_id: string;
  charter_id: string;
  manifest_digest: string;
  candidate_id: RendererCandidateId;
  candidate_lock_digest: string;
  remediation_cycle_ordinal: 0 | 1 | 2;
  source_digest: string;
  output_digest: string;
  sealed_at: string;
  sealed_by: string;
}

/**
 * Append-only proof that the custodian opened held-back expectations only for
 * an exact sealed candidate submission. The frozen charter's access log stays
 * unchanged; post-freeze disclosure is retained here instead.
 */
export interface HeldBackEvaluationAccessRecord {
  access_id: string;
  /** Caller-stable identity used to replay one logical access exactly once. */
  operation_key: string;
  charter_id: string;
  manifest_digest: string;
  sealed_expectations_digest: string;
  candidate_id: RendererCandidateId;
  submission_id: string;
  candidate_lock_digest: string;
  remediation_cycle_ordinal: 0 | 1 | 2;
  /** Exact initial seals that made the shared held-back corpus safe to open. */
  initial_submission_ids: Readonly<Record<RendererCandidateId, string>>;
  reason: "evaluate_sealed_candidate_submission";
  accessed_at: string;
  accessed_by: string;
  evidence_digest: string;
}

export interface RemediationCycleRecord {
  cycle_id: string;
  /** Caller-stable identity used to replay one logical cycle exactly once. */
  operation_key: string;
  charter_id: string;
  manifest_digest: string;
  candidate_id: RendererCandidateId;
  ordinal: 1 | 2;
  hours_spent: number;
  changes: readonly string[];
  affected_case_ids: readonly QualificationCaseId[];
  /** Affected cases plus the entire held-back corpus, always. */
  required_rerun_case_ids: readonly QualificationCaseId[];
  evidence_digest: string;
  recorded_at: string;
  recorded_by: string;
}
