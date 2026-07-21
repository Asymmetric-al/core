import { digestQualificationValue } from "./canonical";
import {
  HELD_BACK_CASE_IDS,
  OPEN_CASE_IDS,
  QUALIFICATION_GATE_IDS,
  RENDERER_CANDIDATE_IDS,
  RENDERER_QUALIFICATION_SCHEMA_VERSION,
  REQUIRED_BUDGET_METRICS,
  SCORE_DIMENSION_IDS,
  SCORE_DIMENSION_WEIGHTS,
  VALIDATOR_CATEGORIES,
} from "./types";

import type {
  CharterValidationIssue,
  FrozenRendererQualificationCharter,
  QualificationCaseManifest,
  RendererQualificationCharterInput,
  RendererQualificationManifest,
} from "./types";

export class RendererCharterValidationError extends Error {
  readonly issues: readonly CharterValidationIssue[];

  constructor(issues: readonly CharterValidationIssue[]) {
    const summary = issues
      .slice(0, 5)
      .map((item) => `${item.path}: ${item.code}`)
      .join("; ");
    super(
      `Renderer qualification charter cannot freeze (${issues.length} issues): ${summary}`,
    );
    this.name = "RendererCharterValidationError";
    this.issues = issues;
  }
}

const REQUIRED_REPEATABILITY_CASES = ["O01", "O04", "O10", "H02", "H06", "H09"];

const REQUIRED_FAILURE_INJECTIONS = [
  "timeout",
  "process_termination",
  "ambiguous_provider_result",
  "worker_redelivery",
  "object_upload_failure",
  "read_back_mismatch",
  "validator_crash",
  "finalization_race",
];

/** Conservative synthetic-data screen for corpus text fields. */
const PII_PATTERNS = [
  /[\w.+-]+@(?!example\.)[\w-]+\.[\w.-]+/,
  /\b\d{3}-\d{2}-\d{4}\b/,
  /\b(?:\d[ -]?){13,19}\b/,
];

function issue(
  path: string,
  code: string,
  message: string,
): CharterValidationIssue {
  return { path, code, message };
}

function scanForRealData(
  path: string,
  text: string,
  issues: CharterValidationIssue[],
): void {
  for (const pattern of PII_PATTERNS) {
    if (pattern.test(text)) {
      issues.push(
        issue(
          path,
          "corpus_not_synthetic",
          "Corpus text matches a real-data pattern; fixtures must be synthetic and PII-free.",
        ),
      );
      return;
    }
  }
}

function validateCandidates(
  input: RendererQualificationCharterInput,
  issues: CharterValidationIssue[],
): void {
  const byId = new Map(
    input.candidates.map((candidate) => [candidate.candidate_id, candidate]),
  );
  if (
    input.candidates.length !== 3 ||
    !RENDERER_CANDIDATE_IDS.every((id) => byId.has(id))
  ) {
    issues.push(
      issue(
        "candidates",
        "candidate_register_invalid",
        "The contest has exactly the candidates P18-R-P, P18-R-T, and P18-R-C.",
      ),
    );
    return;
  }

  const prince = byId.get("P18-R-P");
  if (
    prince?.eligibility !== "finalist" ||
    prince.engine !== "prince" ||
    prince.engine_version !== "15.1" ||
    prince.pipeline !== "docraptor-managed@10.1"
  ) {
    issues.push(
      issue(
        "candidates.P18-R-P",
        "candidate_lock_invalid",
        "P18-R-P must be the finalist managed DocRaptor pipeline 10.1 using Prince 15.1.",
      ),
    );
  }

  const typst = byId.get("P18-R-T");
  if (
    typst?.eligibility !== "finalist" ||
    typst.engine !== "typst" ||
    typst.engine_version !== "0.15.1"
  ) {
    issues.push(
      issue(
        "candidates.P18-R-T",
        "candidate_lock_invalid",
        "P18-R-T must be the finalist Typst exactly 0.15.1, official distribution.",
      ),
    );
  }

  const control = byId.get("P18-R-C");
  if (
    control?.eligibility !== "comparison_control" ||
    control.engine !== "chromium"
  ) {
    issues.push(
      issue(
        "candidates.P18-R-C",
        "candidate_lock_invalid",
        "P18-R-C is the pinned Playwright Chromium comparison control and can never be eligible to win.",
      ),
    );
  }

  for (const candidate of input.candidates) {
    const path = `candidates.${candidate.candidate_id}`;
    const requiredStrings: Array<[string, string]> = [
      ["adapter_commit", candidate.adapter_commit],
      ["adapter_digest", candidate.adapter_digest],
      ["dependency_lock_digest", candidate.dependency_lock_digest],
      ["configuration_digest", candidate.configuration_digest],
      ["locale_data_version", candidate.locale_data_version],
      ["network_filesystem_policy", candidate.network_filesystem_policy],
      ["finalizer.name", candidate.finalizer.name],
      ["finalizer.version", candidate.finalizer.version],
    ];
    for (const [field, value] of requiredStrings) {
      if (!value.trim()) {
        issues.push(
          issue(
            `${path}.${field}`,
            "provenance_missing",
            `Candidate lock field ${field} is required.`,
          ),
        );
      }
    }
    if (candidate.fonts_assets_packages.length === 0) {
      issues.push(
        issue(
          `${path}.fonts_assets_packages`,
          "provenance_missing",
          "Fonts, assets, and packages must be pinned with licenses and digests.",
        ),
      );
    }
    for (const item of candidate.fonts_assets_packages) {
      if (!item.license.trim() || !item.digest.trim()) {
        issues.push(
          issue(
            `${path}.fonts_assets_packages.${item.name}`,
            "provenance_missing",
            "Every pinned font/asset/package needs a license and digest.",
          ),
        );
      }
    }
  }
}

function validateCase(
  kind: "held_back" | "open",
  manifest: QualificationCaseManifest,
  issues: CharterValidationIssue[],
): void {
  const path = `corpus.${manifest.case_id}`;

  if (manifest.visibility !== kind) {
    issues.push(
      issue(
        path,
        "corpus_invalid",
        `Case ${manifest.case_id} has the wrong visibility.`,
      ),
    );
  }
  if (manifest.synthetic !== true) {
    issues.push(
      issue(
        path,
        "corpus_not_synthetic",
        "Every fixture must declare synthetic data.",
      ),
    );
  }
  if (
    !manifest.fixture.facts_digest.trim() ||
    !manifest.fixture.document_digest.trim()
  ) {
    issues.push(
      issue(path, "corpus_invalid", "Every case pins its fixture digests."),
    );
  }
  if (!manifest.fixture.bounds.trim()) {
    issues.push(
      issue(path, "corpus_invalid", "Every case documents its schema bounds."),
    );
  }

  scanForRealData(path, manifest.title, issues);
  scanForRealData(path, manifest.fixture.bounds, issues);

  if (kind === "open") {
    if (!manifest.expected) {
      issues.push(
        issue(
          path,
          "corpus_invalid",
          "Open cases carry their expected results.",
        ),
      );
    } else {
      if (
        manifest.expected.protected_facts.length === 0 &&
        manifest.expected.layout_assertions.length === 0 &&
        !manifest.expected.failure_behavior
      ) {
        issues.push(
          issue(
            path,
            "corpus_invalid",
            "Open cases declare expected facts, layout, or failure behavior.",
          ),
        );
      }
      for (const text of [
        ...manifest.expected.protected_facts,
        ...manifest.expected.layout_assertions,
      ]) {
        scanForRealData(path, text, issues);
      }
    }
    if (manifest.sealed_expectation_digest) {
      issues.push(issue(path, "corpus_invalid", "Open cases are not sealed."));
    }
  } else {
    if (manifest.expected) {
      issues.push(
        issue(
          path,
          "held_back_expectation_leaked",
          "Held-back cases must not carry expected results; only the custodian-sealed digest enters the charter.",
        ),
      );
    }
    if (!manifest.sealed_expectation_digest?.trim()) {
      issues.push(
        issue(
          path,
          "held_back_not_sealed",
          "Held-back cases require a custodian-sealed expectation digest before candidate work begins.",
        ),
      );
    }
  }
}

function validateCorpus(
  input: RendererQualificationCharterInput,
  issues: CharterValidationIssue[],
): void {
  const openIds = input.open_corpus.map((item) => item.case_id);
  if (
    openIds.length !== OPEN_CASE_IDS.length ||
    !OPEN_CASE_IDS.every((id) => openIds.includes(id))
  ) {
    issues.push(
      issue(
        "open_corpus",
        "corpus_incomplete",
        "The open corpus is exactly O01–O18.",
      ),
    );
  }
  const heldIds = input.held_back_corpus.map((item) => item.case_id);
  if (
    heldIds.length !== HELD_BACK_CASE_IDS.length ||
    !HELD_BACK_CASE_IDS.every((id) => heldIds.includes(id))
  ) {
    issues.push(
      issue(
        "held_back_corpus",
        "corpus_incomplete",
        "The held-back corpus is exactly H01–H12.",
      ),
    );
  }

  for (const item of input.open_corpus) validateCase("open", item, issues);
  for (const item of input.held_back_corpus)
    validateCase("held_back", item, issues);

  if (input.held_back_seal.custodian !== input.roles.corpus_custodian) {
    issues.push(
      issue(
        "held_back_seal.custodian",
        "held_back_not_sealed",
        "The held-back seal must be recorded by the named corpus custodian.",
      ),
    );
  }
  if (!input.held_back_seal.sealed_expectations_digest.trim()) {
    issues.push(
      issue(
        "held_back_seal",
        "held_back_not_sealed",
        "Held-back expectations must be sealed under a digest before freeze.",
      ),
    );
  }
  if (
    Date.parse(input.held_back_seal.sealed_at) > Date.parse(input.frozen_at)
  ) {
    issues.push(
      issue(
        "held_back_seal.sealed_at",
        "held_back_not_sealed",
        "The held-back seal must exist before the charter freezes.",
      ),
    );
  }
}

function validateSuites(
  input: RendererQualificationCharterInput,
  issues: CharterValidationIssue[],
): void {
  const suites = input.operational_suites;

  const repeatIds = [...suites.repeatability.case_ids].sort();
  if (
    JSON.stringify(repeatIds) !==
      JSON.stringify([...REQUIRED_REPEATABILITY_CASES].sort()) ||
    suites.repeatability.cold_runs_per_case !== 10 ||
    suites.repeatability.warm_runs_per_case !== 10
  ) {
    issues.push(
      issue(
        "operational_suites.repeatability",
        "suite_invalid",
        "Repeatability is ten cold and ten warm executions of O01, O04, O10, H02, H06, and H09.",
      ),
    );
  }

  const batch = suites.mixed_batch;
  if (
    batch.total_items !== 1000 ||
    batch.tenants !== 20 ||
    batch.short_items !== 700 ||
    batch.medium_items !== 200 ||
    batch.long_items !== 80 ||
    batch.poison_items !== 20 ||
    batch.short_items +
      batch.medium_items +
      batch.long_items +
      batch.poison_items !==
      batch.total_items
  ) {
    issues.push(
      issue(
        "operational_suites.mixed_batch",
        "suite_invalid",
        "The mixed batch is 1,000 items across 20 tenants: 700 short, 200 medium, 80 long, 20 poison.",
      ),
    );
  }

  const fairness = suites.fairness;
  if (
    fairness.heavy_tenant_items !== 500 ||
    fairness.light_tenants !== 19 ||
    fairness.light_items_each !== 10 ||
    fairness.claim_bound_multiplier !== 2
  ) {
    issues.push(
      issue(
        "operational_suites.fairness",
        "suite_invalid",
        "Fairness is one 500-item tenant against 19 ten-item tenants with the 2× claim bound.",
      ),
    );
  }

  if (
    JSON.stringify(suites.concurrency_staircase.steps) !==
    JSON.stringify([1, 5, 10, 25, 50])
  ) {
    issues.push(
      issue(
        "operational_suites.concurrency_staircase",
        "suite_invalid",
        "The concurrency staircase is exactly 1, 5, 10, 25, and 50.",
      ),
    );
  }

  for (const injection of REQUIRED_FAILURE_INJECTIONS) {
    if (!suites.failure_matrix.injections.includes(injection)) {
      issues.push(
        issue(
          "operational_suites.failure_matrix",
          "suite_invalid",
          `The failure matrix must inject ${injection}.`,
        ),
      );
    }
  }

  if (suites.outage_recovery.outage_window_minutes <= 0) {
    issues.push(
      issue(
        "operational_suites.outage_recovery",
        "suite_invalid",
        "The outage window must be a predeclared positive duration.",
      ),
    );
  }
}

function validateGatesAndScoring(
  input: RendererQualificationCharterInput,
  issues: CharterValidationIssue[],
): void {
  const gateIds = input.gates.map((gate) => gate.gate_id);
  if (
    gateIds.length !== QUALIFICATION_GATE_IDS.length ||
    !QUALIFICATION_GATE_IDS.every((id) => gateIds.includes(id))
  ) {
    issues.push(
      issue(
        "gates",
        "gates_incomplete",
        "All twelve hard gates G01–G12 are mandatory.",
      ),
    );
  }
  for (const gate of input.gates) {
    if (!gate.pass_rule.trim()) {
      issues.push(
        issue(
          `gates.${gate.gate_id}`,
          "gates_incomplete",
          "Every gate states its exact pass rule.",
        ),
      );
    }
  }

  const dimensionIds = input.score_dimensions.map((item) => item.dimension_id);
  if (
    dimensionIds.length !== SCORE_DIMENSION_IDS.length ||
    !SCORE_DIMENSION_IDS.every((id) => dimensionIds.includes(id))
  ) {
    issues.push(
      issue(
        "score_dimensions",
        "scoring_invalid",
        "Exactly the seven protocol score dimensions are frozen.",
      ),
    );
  }
  let weightTotal = 0;
  for (const dimension of input.score_dimensions) {
    weightTotal += dimension.weight;
    if (SCORE_DIMENSION_WEIGHTS[dimension.dimension_id] !== dimension.weight) {
      issues.push(
        issue(
          `score_dimensions.${dimension.dimension_id}`,
          "scoring_invalid",
          `Weight must be the frozen ${SCORE_DIMENSION_WEIGHTS[dimension.dimension_id]}.`,
        ),
      );
    }
    if (
      dimension.anchors.length !== 6 ||
      dimension.anchors.some((anchor) => !anchor.trim())
    ) {
      issues.push(
        issue(
          `score_dimensions.${dimension.dimension_id}`,
          "scoring_invalid",
          "Every dimension declares exact 0–5 anchors.",
        ),
      );
    }
  }
  if (weightTotal !== 100) {
    issues.push(
      issue(
        "score_dimensions",
        "scoring_invalid",
        "Weights must total exactly 100.",
      ),
    );
  }

  const rules = input.scoring_rules;
  if (
    rules.reviewer_count !== 2 ||
    rules.min_uncertainty_band_points !== 2 ||
    rules.material_lead_points !== 5 ||
    rules.tie_break_order.length !== 3
  ) {
    issues.push(
      issue(
        "scoring_rules",
        "scoring_invalid",
        "Two reviewers, a 2.0 minimum uncertainty band, a 5.0 material lead, and the three-step tie-break are frozen.",
      ),
    );
  }
}

function validateBudgetsValidatorsRoles(
  input: RendererQualificationCharterInput,
  issues: CharterValidationIssue[],
): void {
  const budgetMetrics = new Map(
    input.budgets.map((budget) => [budget.metric, budget]),
  );
  for (const metric of REQUIRED_BUDGET_METRICS) {
    const budget = budgetMetrics.get(metric);
    if (!budget) {
      issues.push(
        issue(
          `budgets.${metric}`,
          "budget_unbounded",
          "No absolute workload budget may remain blank when the charter freezes.",
        ),
      );
      continue;
    }
    if (!Number.isFinite(budget.limit) || budget.limit <= 0) {
      issues.push(
        issue(
          `budgets.${metric}`,
          "budget_unbounded",
          "Every budget is a finite absolute threshold; relative evidence cannot substitute.",
        ),
      );
    }
  }
  if (budgetMetrics.size !== input.budgets.length) {
    issues.push(
      issue("budgets", "budget_unbounded", "Budget metrics must be unique."),
    );
  }

  const categories = new Set(input.validators.map((tool) => tool.category));
  for (const category of VALIDATOR_CATEGORIES) {
    if (!categories.has(category)) {
      issues.push(
        issue(
          `validators.${category}`,
          "validator_missing",
          "The frozen validator set must cover every required category.",
        ),
      );
    }
  }
  for (const tool of input.validators) {
    if (!tool.version.trim() || !tool.ruleset.trim()) {
      issues.push(
        issue(
          `validators.${tool.name}`,
          "validator_missing",
          "Every validator pins its exact version and ruleset.",
        ),
      );
    }
  }

  const roles = input.roles;
  const operators = Object.values(roles.candidate_operators);
  const nonOperatorRoles: Array<[string, string]> = [
    ["corpus_custodian", roles.corpus_custodian],
    ["independent_reviewers.0", roles.independent_reviewers[0]],
    ["independent_reviewers.1", roles.independent_reviewers[1]],
    ["security_privacy_reviewer", roles.security_privacy_reviewer],
    ["final_approver", roles.final_approver],
  ];
  for (const [rolePath, actor] of nonOperatorRoles) {
    if (!actor.trim()) {
      issues.push(
        issue(
          `roles.${rolePath}`,
          "role_missing",
          "Every contest role must be named.",
        ),
      );
    }
    if (operators.includes(actor)) {
      issues.push(
        issue(
          `roles.${rolePath}`,
          "role_collision",
          "A candidate operator cannot also hold custodian, reviewer, or approval roles.",
        ),
      );
    }
  }
  if (roles.independent_reviewers[0] === roles.independent_reviewers[1]) {
    issues.push(
      issue(
        "roles.independent_reviewers",
        "role_collision",
        "The two independent reviewers must be different people.",
      ),
    );
  }
  for (const candidateId of RENDERER_CANDIDATE_IDS) {
    if (!roles.candidate_operators[candidateId]?.trim()) {
      issues.push(
        issue(
          `roles.candidate_operators.${candidateId}`,
          "role_missing",
          "Every candidate has a named operator.",
        ),
      );
    }
  }
  if (!roles.accountable_owner.trim()) {
    issues.push(
      issue(
        "roles.accountable_owner",
        "role_missing",
        "An accountable owner is required.",
      ),
    );
  }

  if (
    input.approvals.length === 0 ||
    !input.approvals.some((approval) => approval.actor === roles.final_approver)
  ) {
    issues.push(
      issue(
        "approvals",
        "approval_missing",
        "The charter freezes only with the final approver's recorded approval.",
      ),
    );
  }
}

export function validateRendererQualificationCharterInput(
  input: RendererQualificationCharterInput,
): CharterValidationIssue[] {
  const issues: CharterValidationIssue[] = [];

  if (!input.charter_id.trim() || !input.charter_version.trim()) {
    issues.push(
      issue(
        "charter_id",
        "charter_incomplete",
        "Charter id and version are required.",
      ),
    );
  }
  if (Number.isNaN(Date.parse(input.frozen_at))) {
    issues.push(
      issue(
        "frozen_at",
        "charter_incomplete",
        "The freeze time must be a valid timestamp.",
      ),
    );
  }

  validateCandidates(input, issues);
  validateCorpus(input, issues);
  validateSuites(input, issues);
  validateGatesAndScoring(input, issues);
  validateBudgetsValidatorsRoles(input, issues);

  if (
    input.remediation_policy.initial_attempts !== 1 ||
    input.remediation_policy.max_cycles !== 2 ||
    input.remediation_policy.max_hours_per_cycle <= 0
  ) {
    issues.push(
      issue(
        "remediation_policy",
        "charter_incomplete",
        "Equal effort is one initial attempt and at most two bounded remediation cycles per finalist.",
      ),
    );
  }
  if (
    !input.evidence_rules.package_schema_version.trim() ||
    !input.evidence_rules.redaction_policy.trim() ||
    !input.evidence_rules.retention_owner.trim() ||
    input.evidence_rules.retention_days <= 0
  ) {
    issues.push(
      issue(
        "evidence_rules",
        "charter_incomplete",
        "Evidence schema, redaction, and retention rules must be frozen.",
      ),
    );
  }
  if (input.requalification_triggers.length === 0) {
    issues.push(
      issue(
        "requalification_triggers",
        "charter_incomplete",
        "Expiration/requalification triggers must be frozen.",
      ),
    );
  }
  if (input.unknown_evidence_rule !== "fails_affected_gate") {
    issues.push(
      issue(
        "unknown_evidence_rule",
        "charter_incomplete",
        "Unknown or missing evidence always fails the affected hard gate.",
      ),
    );
  }

  return issues;
}

function sortById<T>(items: readonly T[], key: (item: T) => string): T[] {
  return [...items].sort((left, right) => key(left).localeCompare(key(right)));
}

/**
 * Normalize order-insensitive collections so a shuffled but semantically
 * identical input freezes to the same digest. Order-sensitive protocols
 * (tie-break order, staircase steps, failure-injection sequence) keep their
 * declared order.
 */
function normalizeCharterInput(
  input: RendererQualificationCharterInput,
): RendererQualificationCharterInput {
  const clone = structuredClone(input);
  return {
    ...clone,
    candidates: sortById(clone.candidates, (item) => item.candidate_id),
    open_corpus: sortById(clone.open_corpus, (item) => item.case_id),
    held_back_corpus: sortById(clone.held_back_corpus, (item) => item.case_id),
    gates: sortById(clone.gates, (item) => item.gate_id),
    score_dimensions: sortById(
      clone.score_dimensions,
      (item) => item.dimension_id,
    ),
    budgets: sortById(clone.budgets, (item) => item.metric),
    validators: sortById(
      clone.validators,
      (item) => `${item.category}:${item.name}`,
    ),
    requalification_triggers: [...clone.requalification_triggers].sort(),
    approvals: sortById(
      clone.approvals,
      (item) => `${item.role}:${item.actor}`,
    ),
  };
}

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null) return value;
  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}

/**
 * Freeze the pre-registered contest. The result is immutable and identified by
 * its digest: any frozen-field change is a new charter version that
 * invalidates earlier comparison outputs for both finalists.
 */
export function freezeRendererQualificationCharter(
  input: RendererQualificationCharterInput,
): FrozenRendererQualificationCharter {
  const issues = validateRendererQualificationCharterInput(input);
  if (issues.length > 0) {
    throw new RendererCharterValidationError(issues);
  }

  const normalized = normalizeCharterInput(input);
  const manifest_digest = digestQualificationValue({
    schema_version: RENDERER_QUALIFICATION_SCHEMA_VERSION,
    charter: normalized,
  });

  return deepFreeze({
    ...normalized,
    schema_version: RENDERER_QUALIFICATION_SCHEMA_VERSION,
    manifest_digest,
  });
}

export function buildRendererQualificationManifest(
  charter: FrozenRendererQualificationCharter,
): RendererQualificationManifest {
  return {
    schema_version: charter.schema_version,
    charter_id: charter.charter_id,
    charter_version: charter.charter_version,
    digest_algorithm: "sha256",
    manifest_digest: charter.manifest_digest,
  };
}

export function digestCandidateLock(
  charter: FrozenRendererQualificationCharter,
  candidateId: string,
): string {
  const lock = charter.candidates.find(
    (candidate) => candidate.candidate_id === candidateId,
  );
  if (!lock) {
    throw new Error(
      `Unknown candidate ${candidateId} for charter ${charter.charter_id}.`,
    );
  }
  return digestQualificationValue(lock);
}
