import {
  compareQualificationKeys,
  digestQualificationValue,
} from "./canonical";
import {
  HELD_BACK_CASE_DEFINITIONS,
  OPEN_CASE_DEFINITIONS,
  PHASE_18_ABSOLUTE_BUDGETS,
  PHASE_18_EVIDENCE_RULES,
  PHASE_18_OPERATIONAL_SUITES,
  PHASE_18_QUALIFICATION_GATES,
  PHASE_18_REQUALIFICATION_TRIGGERS,
  PHASE_18_STOP_CONDITIONS,
  PHASE_18_SCORE_DIMENSIONS,
  PHASE_18_SCORING_RULES,
  PHASE_18_VALIDATION_TOOLS,
} from "./launch-contest";
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

function sameStringSequence(
  actual: readonly string[],
  expected: readonly string[],
): boolean {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

/**
 * Content addresses are the only thing that makes the frozen corpus and the
 * candidate locks verifiable. A non-blank but malformed value such as
 * `"not-a-digest"` is worse than a missing one: it reads as pinned.
 */
const SHA256_HEX = /^[0-9a-f]{64}$/;

const isSha256Hex = (value: string | undefined): boolean =>
  SHA256_HEX.test(value ?? "");

/** Protocol P18-R-P row: what identifies the exact frozen managed deployment. */
const MANAGED_PROVIDER_SETTING_KEYS = [
  "api_client_version",
  "endpoint_region",
  "account_mode",
  "options_digest",
  "retention_policy",
  "support_access",
  "dpa_subprocessor_evidence",
] as const;

/**
 * Every field the charter freezes. `normalizeRendererQualificationCharterInput`
 * spreads the input, so an unknown key would ride into the manifest digest and
 * still verify - letting a qualification-only charter smuggle in authority it
 * does not have (for example a `selected_renderer`).
 */
const CHARTER_INPUT_FIELDS = new Set([
  "charter_id",
  "charter_version",
  "frozen_at",
  "roles",
  "approvals",
  "candidates",
  "open_corpus",
  "held_back_corpus",
  "held_back_seal",
  "operational_suites",
  "gates",
  "score_dimensions",
  "scoring_rules",
  "budgets",
  "validators",
  "remediation_policy",
  "evidence_rules",
  "requalification_triggers",
  "stop_conditions",
  "unknown_evidence_rule",
]);

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
  // The managed candidate's runtime is the provider's, so the deployment is
  // only identified by these settings. Protocol, P18-R-P row: "API/client
  // version, endpoint/region, engine/pipeline, options, provider account mode,
  // retention/support-access settings, DPA/subprocessor evidence" - and "only
  // the exact frozen managed deployment qualifies".
  if (prince) {
    for (const key of MANAGED_PROVIDER_SETTING_KEYS) {
      if (!prince.provider_settings?.[key]?.trim()) {
        issues.push(
          issue(
            `candidates.P18-R-P.provider_settings.${key}`,
            "provenance_missing",
            `The managed deployment must pin ${key}.`,
          ),
        );
      }
    }
  }

  const typst = byId.get("P18-R-T");
  // The self-hosted challenger is the one candidate whose runtime we own, so
  // the protocol makes its binary SHA-256, OS/container digest, and libc part
  // of what must be frozen: "Only the exact frozen binary and sandbox qualify."
  // Engine/version/pipeline strings alone would let it freeze unpinned.
  if (
    typst?.eligibility !== "finalist" ||
    typst.engine !== "typst" ||
    typst.engine_version !== "0.15.1" ||
    typst.pipeline !== "typst-cli@0.15.1" ||
    !typst.container_runtime?.trim() ||
    !typst.os_libc?.trim() ||
    !isSha256Hex(typst.engine_binary_digest)
  ) {
    issues.push(
      issue(
        "candidates.P18-R-T",
        "candidate_lock_invalid",
        "P18-R-T must be the finalist Typst exactly 0.15.1, official distribution, on the pinned typst-cli@0.15.1 sandbox pipeline.",
      ),
    );
  }

  const control = byId.get("P18-R-C");
  if (
    control?.eligibility !== "comparison_control" ||
    control.engine !== "chromium" ||
    control.pipeline !== "playwright-print-to-pdf" ||
    !control.engine_version.trim()
  ) {
    issues.push(
      issue(
        "candidates.P18-R-C",
        "candidate_lock_invalid",
        "P18-R-C is the exact pinned Playwright Chromium print-to-pdf comparison control and can never be eligible to win.",
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

    // Content addresses, unlike the labels above, must actually be digests.
    // `adapter_commit` stays on the trim check: it is a commit id, not a hash.
    const requiredDigests: Array<[string, string]> = [
      ["adapter_digest", candidate.adapter_digest],
      ["dependency_lock_digest", candidate.dependency_lock_digest],
      ["configuration_digest", candidate.configuration_digest],
      ["locale_data_digest", candidate.locale_data_digest],
      ["finalizer.digest", candidate.finalizer.digest],
    ];
    for (const [field, value] of requiredDigests) {
      if (!isSha256Hex(value)) {
        issues.push(
          issue(
            `${path}.${field}`,
            "provenance_missing",
            `Candidate lock field ${field} must be a lowercase SHA-256 hex digest.`,
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
      // Without a name and version the digest cannot be tied back to anything
      // in the inventory, and the issue path below degrades to a bare prefix.
      if (
        !item.name.trim() ||
        !item.version.trim() ||
        !item.license.trim() ||
        !isSha256Hex(item.digest)
      ) {
        issues.push(
          issue(
            `${path}.fonts_assets_packages.${item.name || "<unnamed>"}`,
            "provenance_missing",
            "Every pinned font/asset/package needs a name, version, license, and SHA-256 digest.",
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
    !isSha256Hex(manifest.fixture.facts_digest) ||
    !isSha256Hex(manifest.fixture.document_digest)
  ) {
    issues.push(
      issue(
        path,
        "corpus_invalid",
        "Every case pins its fixture digests as lowercase SHA-256 hex.",
      ),
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
    const fixed =
      manifest.case_id in OPEN_CASE_DEFINITIONS
        ? OPEN_CASE_DEFINITIONS[
            manifest.case_id as keyof typeof OPEN_CASE_DEFINITIONS
          ]
        : undefined;
    if (
      fixed &&
      (manifest.title !== fixed.title ||
        manifest.output_profile !== fixed.output_profile ||
        manifest.fixture.bounds !== fixed.bounds)
    ) {
      issues.push(
        issue(
          path,
          "protocol_fixed_field_changed",
          "Open corpus titles, output profiles, and bounds are pre-registered by the protocol.",
        ),
      );
    }
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
      if (
        fixed &&
        (!sameStringSequence(
          manifest.expected.protected_facts,
          fixed.protected_facts,
        ) ||
          !sameStringSequence(
            manifest.expected.layout_assertions,
            fixed.layout_assertions,
          ) ||
          manifest.expected.failure_behavior !== fixed.failure_behavior)
      ) {
        issues.push(
          issue(
            path,
            "protocol_fixed_field_changed",
            "Open corpus expectations are pre-registered by the protocol and cannot change at freeze time.",
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
    const fixed =
      manifest.case_id in HELD_BACK_CASE_DEFINITIONS
        ? HELD_BACK_CASE_DEFINITIONS[
            manifest.case_id as keyof typeof HELD_BACK_CASE_DEFINITIONS
          ]
        : undefined;
    if (
      fixed &&
      (manifest.title !== fixed.title ||
        manifest.output_profile !== fixed.output_profile ||
        manifest.fixture.bounds !== fixed.bounds)
    ) {
      issues.push(
        issue(
          path,
          "protocol_fixed_field_changed",
          "Held-back corpus titles, output profiles, and bounds are pre-registered by the protocol.",
        ),
      );
    }
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
  if (!isSha256Hex(input.held_back_seal.sealed_expectations_digest)) {
    issues.push(
      issue(
        "held_back_seal",
        "held_back_not_sealed",
        "Held-back expectations must be sealed under a SHA-256 digest before freeze.",
      ),
    );
  }

  // The custodian access log is evidence, so it has to be read, not just
  // carried. Protocol: candidate implementers must not "See held-back expected
  // results before candidate outputs are sealed", and the custodian must not
  // "Tune a candidate against held-back fixture identities". An operator in
  // this log is that leak, recorded in the charter's own evidence.
  const operatorActors = new Set(
    Object.values(input.roles.candidate_operators),
  );
  for (const [index, entry] of input.held_back_seal.access_log.entries()) {
    const entryPath = `held_back_seal.access_log.${index}`;
    if (operatorActors.has(entry.actor)) {
      issues.push(
        issue(
          entryPath,
          "held_back_expectation_leaked",
          `Candidate operator ${entry.actor} accessed the held-back expectations before freeze.`,
        ),
      );
    }
    if (!entry.reason.trim()) {
      issues.push(
        issue(
          entryPath,
          "held_back_not_sealed",
          "Every held-back access must record why it happened.",
        ),
      );
    }
    const accessedAtMs = Date.parse(entry.at);
    if (Number.isNaN(accessedAtMs)) {
      issues.push(
        issue(
          entryPath,
          "held_back_not_sealed",
          "Every held-back access must record a valid timestamp.",
        ),
      );
    } else if (accessedAtMs > Date.parse(input.frozen_at)) {
      issues.push(
        issue(
          entryPath,
          "held_back_not_sealed",
          "A held-back access cannot be dated after the charter freezes.",
        ),
      );
    }
  }
  const sealedAtMs = Date.parse(input.held_back_seal.sealed_at);
  if (Number.isNaN(sealedAtMs)) {
    issues.push(
      issue(
        "held_back_seal.sealed_at",
        "held_back_not_sealed",
        "The held-back seal must record a valid timestamp.",
      ),
    );
  } else if (sealedAtMs > Date.parse(input.frozen_at)) {
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

  if (
    !sameStringSequence(
      suites.repeatability.case_ids,
      PHASE_18_OPERATIONAL_SUITES.repeatability.case_ids,
    ) ||
    suites.repeatability.cold_runs_per_case !==
      PHASE_18_OPERATIONAL_SUITES.repeatability.cold_runs_per_case ||
    suites.repeatability.warm_runs_per_case !==
      PHASE_18_OPERATIONAL_SUITES.repeatability.warm_runs_per_case
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
    batch.total_items !== PHASE_18_OPERATIONAL_SUITES.mixed_batch.total_items ||
    batch.tenants !== PHASE_18_OPERATIONAL_SUITES.mixed_batch.tenants ||
    batch.short_items !== PHASE_18_OPERATIONAL_SUITES.mixed_batch.short_items ||
    batch.medium_items !==
      PHASE_18_OPERATIONAL_SUITES.mixed_batch.medium_items ||
    batch.long_items !== PHASE_18_OPERATIONAL_SUITES.mixed_batch.long_items ||
    batch.poison_items !==
      PHASE_18_OPERATIONAL_SUITES.mixed_batch.poison_items ||
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
    fairness.heavy_tenant_items !==
      PHASE_18_OPERATIONAL_SUITES.fairness.heavy_tenant_items ||
    fairness.light_tenants !==
      PHASE_18_OPERATIONAL_SUITES.fairness.light_tenants ||
    fairness.light_items_each !==
      PHASE_18_OPERATIONAL_SUITES.fairness.light_items_each ||
    fairness.claim_bound_multiplier !==
      PHASE_18_OPERATIONAL_SUITES.fairness.claim_bound_multiplier
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
    JSON.stringify(PHASE_18_OPERATIONAL_SUITES.concurrency_staircase.steps)
  ) {
    issues.push(
      issue(
        "operational_suites.concurrency_staircase",
        "suite_invalid",
        "The concurrency staircase is exactly 1, 5, 10, 25, and 50.",
      ),
    );
  }

  if (
    !sameStringSequence(
      suites.failure_matrix.injections,
      PHASE_18_OPERATIONAL_SUITES.failure_matrix.injections,
    )
  ) {
    issues.push(
      issue(
        "operational_suites.failure_matrix",
        "suite_invalid",
        "The failure matrix injection sequence is exactly the frozen eight-injection protocol order.",
      ),
    );
  }

  if (
    suites.outage_recovery.outage_window_minutes !==
      PHASE_18_OPERATIONAL_SUITES.outage_recovery.outage_window_minutes ||
    suites.outage_recovery.proof !==
      PHASE_18_OPERATIONAL_SUITES.outage_recovery.proof
  ) {
    issues.push(
      issue(
        "operational_suites.outage_recovery",
        "suite_invalid",
        "Outage recovery window and proof text are pre-registered by the protocol.",
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
  const fixedGates = new Map(
    PHASE_18_QUALIFICATION_GATES.map((gate) => [gate.gate_id, gate]),
  );
  for (const gate of input.gates) {
    const fixed = fixedGates.get(gate.gate_id);
    if (!fixed) continue;
    if (gate.pass_rule !== fixed.pass_rule || gate.title !== fixed.title) {
      issues.push(
        issue(
          `gates.${gate.gate_id}`,
          "protocol_fixed_field_changed",
          "Hard-gate titles and pass rules are pre-registered by the protocol; a materially different rule requires a new protocol version, not a freeze-time edit.",
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

  const fixedDimensions = new Map(
    PHASE_18_SCORE_DIMENSIONS.map((dimension) => [
      dimension.dimension_id,
      dimension,
    ]),
  );
  for (const dimension of input.score_dimensions) {
    const fixed = fixedDimensions.get(dimension.dimension_id);
    if (!fixed) continue;
    if (
      dimension.title !== fixed.title ||
      dimension.evidence_basis !== fixed.evidence_basis ||
      JSON.stringify(dimension.anchors) !== JSON.stringify(fixed.anchors)
    ) {
      issues.push(
        issue(
          `score_dimensions.${dimension.dimension_id}`,
          "protocol_fixed_field_changed",
          "Dimension titles, evidence basis, and 0–5 anchors are pre-registered by the protocol.",
        ),
      );
    }
  }

  const rules = input.scoring_rules;
  if (
    rules.reviewer_count !== PHASE_18_SCORING_RULES.reviewer_count ||
    rules.min_uncertainty_band_points !==
      PHASE_18_SCORING_RULES.min_uncertainty_band_points ||
    rules.material_lead_points !==
      PHASE_18_SCORING_RULES.material_lead_points ||
    rules.tie_break_order.length !==
      PHASE_18_SCORING_RULES.tie_break_order.length
  ) {
    issues.push(
      issue(
        "scoring_rules",
        "scoring_invalid",
        "Two reviewers, a 2.0 minimum uncertainty band, a 5.0 material lead, and the three-step tie-break are frozen.",
      ),
    );
  }
  if (
    JSON.stringify(rules.tie_break_order) !==
    JSON.stringify(PHASE_18_SCORING_RULES.tie_break_order)
  ) {
    issues.push(
      issue(
        "scoring_rules.tie_break_order",
        "protocol_fixed_field_changed",
        "The deterministic tie-break steps and their order are pre-registered by the protocol.",
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
  const fixedBudgets = new Map(
    PHASE_18_ABSOLUTE_BUDGETS.map((budget) => [budget.metric, budget]),
  );
  const declaredBudgetMetrics = input.budgets.map((budget) => budget.metric);
  const declaredBudgetMetricSet = new Set(declaredBudgetMetrics);
  const budgetsMatch =
    declaredBudgetMetrics.length === fixedBudgets.size &&
    declaredBudgetMetricSet.size === fixedBudgets.size &&
    [...fixedBudgets.keys()].every((metric) =>
      declaredBudgetMetricSet.has(metric),
    );
  if (!budgetsMatch) {
    issues.push(
      issue(
        "budgets",
        "protocol_fixed_field_changed",
        "The frozen absolute budget set is exactly the pre-registered protocol metrics with no duplicates or additions.",
      ),
    );
  }
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
    const fixed = fixedBudgets.get(metric);
    if (
      fixed &&
      (budget.limit !== fixed.limit ||
        budget.unit !== fixed.unit ||
        budget.basis !== fixed.basis)
    ) {
      issues.push(
        issue(
          `budgets.${metric}`,
          "protocol_fixed_field_changed",
          "Budget limits, units, and bases are pre-registered by the protocol.",
        ),
      );
    }
  }
  if (budgetMetrics.size !== input.budgets.length) {
    issues.push(
      issue("budgets", "budget_unbounded", "Budget metrics must be unique."),
    );
  }

  const fixedValidators = new Map(
    PHASE_18_VALIDATION_TOOLS.map((tool) => [
      `${tool.category}:${tool.name}`,
      tool,
    ]),
  );
  const validatorKeys = input.validators.map(
    (tool) => `${tool.category}:${tool.name}`,
  );
  const validatorKeySet = new Set(validatorKeys);
  const validatorsMatch =
    validatorKeys.length === fixedValidators.size &&
    validatorKeySet.size === fixedValidators.size &&
    [...fixedValidators.keys()].every((key) => validatorKeySet.has(key));
  if (!validatorsMatch) {
    issues.push(
      issue(
        "validators",
        "validator_missing",
        "The frozen validator set is exactly the pre-registered tools with no duplicates or substitutions.",
      ),
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
  for (const tool of input.validators) {
    const fixed = fixedValidators.get(`${tool.category}:${tool.name}`);
    if (
      !fixed ||
      fixed.version !== tool.version ||
      fixed.ruleset !== tool.ruleset
    ) {
      issues.push(
        issue(
          `validators.${tool.name}`,
          "protocol_fixed_field_changed",
          "The validator names, versions, and rulesets are pre-registered; substituting a tool weakens the qualification evidence stack and requires a new protocol version.",
        ),
      );
    }
  }

  const roles = input.roles;
  const operators = Object.values(roles.candidate_operators);
  const nonOperatorRoles: Array<[string, string]> = [
    ["accountable_owner", roles.accountable_owner],
    ["corpus_custodian", roles.corpus_custodian],
    ["independent_reviewers.0", roles.independent_reviewers[0]],
    ["independent_reviewers.1", roles.independent_reviewers[1]],
    ["security_privacy_reviewer", roles.security_privacy_reviewer],
    ["operations_reviewer", roles.operations_reviewer],
    ["records_legal_evidence_owner", roles.records_legal_evidence_owner],
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
          "A candidate operator cannot also hold owner, custodian, reviewer, or approval roles.",
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
  const finalApproval = input.approvals.find(
    (approval) =>
      approval.actor === roles.final_approver &&
      approval.role === "final_approver",
  );
  if (!finalApproval) {
    issues.push(
      issue(
        "approvals",
        "approval_missing",
        "The charter freezes only with the final approver's recorded approval.",
      ),
    );
  } else {
    const approvedAtMs = Date.parse(finalApproval.approved_at);
    const frozenAtMs = Date.parse(input.frozen_at);
    if (
      Number.isNaN(approvedAtMs) ||
      (!Number.isNaN(frozenAtMs) && approvedAtMs > frozenAtMs)
    ) {
      issues.push(
        issue(
          "approvals",
          "approval_missing",
          "The final approver must record a valid approval timestamp before the charter freezes.",
        ),
      );
    }
    // The statement is the only captured proof of what was authorized.
    if (!finalApproval.statement.trim()) {
      issues.push(
        issue(
          "approvals",
          "approval_missing",
          "The final approval must carry a non-blank statement of what was authorized.",
        ),
      );
    }
  }
}

export function validateRendererQualificationCharterInput(
  input: RendererQualificationCharterInput,
): CharterValidationIssue[] {
  const issues: CharterValidationIssue[] = [];

  const unknownFields = Object.keys(input).filter(
    (field) => !CHARTER_INPUT_FIELDS.has(field),
  );
  if (unknownFields.length > 0) {
    issues.push(
      issue(
        "charter",
        "charter_incomplete",
        `The charter freezes a fixed field set; unknown fields would enter the manifest digest and still verify: ${unknownFields.join(", ")}.`,
      ),
    );
  }

  if (!input.charter_id.trim() || !input.charter_version.trim()) {
    issues.push(
      issue(
        "charter_id",
        "charter_incomplete",
        "Charter id and version are required.",
      ),
    );
  } else if (!/^\d+\.\d+\.\d+$/.test(input.charter_version)) {
    // A reset is "a new charter ID, new timestamp, new digest"; an ordered
    // version is what makes one charter comparable to its predecessor. A label
    // like "draft" freezes into a manifest that cannot be ordered at all.
    issues.push(
      issue(
        "charter_version",
        "charter_incomplete",
        "Charter version must be a semantic MAJOR.MINOR.PATCH version.",
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
    !Number.isFinite(input.remediation_policy.max_hours_per_cycle) ||
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
    input.evidence_rules.package_schema_version !==
      PHASE_18_EVIDENCE_RULES.package_schema_version ||
    input.evidence_rules.redaction_policy !==
      PHASE_18_EVIDENCE_RULES.redaction_policy ||
    input.evidence_rules.retention_owner !==
      PHASE_18_EVIDENCE_RULES.retention_owner ||
    input.evidence_rules.retention_days !==
      PHASE_18_EVIDENCE_RULES.retention_days ||
    !Number.isFinite(input.evidence_rules.retention_days)
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
  } else {
    const fixedTriggers = new Set(PHASE_18_REQUALIFICATION_TRIGGERS);
    const declaredTriggers = new Set(input.requalification_triggers);
    // Compare lengths too, not just set contents. A duplicated trigger keeps
    // the sets equal but survives normalization, so it changes manifest_digest
    // while meaning nothing - and submission/remediation meters are scoped to
    // that digest, so a semantic no-op would mint fresh allowances.
    const setsMatch =
      fixedTriggers.size === declaredTriggers.size &&
      declaredTriggers.size === input.requalification_triggers.length &&
      [...fixedTriggers].every((trigger) => declaredTriggers.has(trigger));
    if (!setsMatch) {
      issues.push(
        issue(
          "requalification_triggers",
          "protocol_fixed_field_changed",
          "The requalification trigger set is pre-registered; omitting or inventing triggers changes the protocol.",
        ),
      );
    }
  }
  if (input.stop_conditions.length === 0) {
    issues.push(
      issue(
        "stop_conditions",
        "charter_incomplete",
        "The incident stop conditions must be frozen with the charter.",
      ),
    );
  } else {
    const fixedStops = new Set(PHASE_18_STOP_CONDITIONS);
    const declaredStops = new Set(input.stop_conditions);
    const stopsMatch =
      fixedStops.size === declaredStops.size &&
      declaredStops.size === input.stop_conditions.length &&
      [...fixedStops].every((condition) => declaredStops.has(condition));
    if (!stopsMatch) {
      issues.push(
        issue(
          "stop_conditions",
          "protocol_fixed_field_changed",
          "The stop conditions are pre-registered; dropping or inventing one changes when the contest must stop.",
        ),
      );
    }
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
  return [...items].sort((left, right) =>
    compareQualificationKeys(key(left), key(right)),
  );
}

/**
 * Normalize order-insensitive collections so a shuffled but semantically
 * identical input freezes to the same digest. Order-sensitive protocols
 * (tie-break order, staircase steps, failure-injection sequence) keep their
 * declared order.
 */
export function normalizeRendererQualificationCharterInput(
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
    stop_conditions: [...clone.stop_conditions].sort(),
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

  const normalized = normalizeRendererQualificationCharterInput(input);
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
