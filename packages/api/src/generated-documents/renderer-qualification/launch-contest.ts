import type {
  AbsoluteBudget,
  EvidenceRules,
  HeldBackCaseId,
  OpenCaseId,
  OperationalSuites,
  QualificationCaseManifest,
  QualificationGate,
  RendererQualificationCharterInput,
  ScoreDimension,
  ScoringRules,
  ValidationTool,
} from "./types";

/**
 * The exact Phase 18 contest content from the approved renderer qualification
 * protocol. Everything the protocol freezes as data lives here; only the
 * environment-specific provenance (adapter commits/digests, containers,
 * fonts) and the custodian's held-back seals arrive as freeze-time input,
 * because they describe real artifacts the harness cannot invent.
 */

export const OPEN_CASE_DEFINITIONS: Record<
  OpenCaseId,
  {
    title: string;
    output_profile: QualificationCaseManifest["output_profile"];
    bounds: string;
    protected_facts: readonly string[];
    layout_assertions: readonly string[];
    failure_behavior?: string;
  }
> = {
  O01: {
    title:
      "U.S. single cash acknowledgment; one page; short Latin identity/address",
    output_profile: "accessible-archive-v1",
    bounds: "One page; one synthetic donor identity; one cash gift",
    protected_facts: [
      "issuer legal name",
      "legal donor name",
      "gift date",
      "gift amount",
      "required goods/services statement",
    ],
    layout_assertions: ["single page", "protected block order preserved"],
  },
  O02: {
    title:
      "U.S. quid-pro-quo acknowledgment; itemized advantages and deductible amount",
    output_profile: "accessible-archive-v1",
    bounds: "Itemized advantage list; source-owned arithmetic",
    protected_facts: [
      "gross payment",
      "goods/services description",
      "good-faith value",
      "deductible amount",
      "required disclosure",
    ],
    layout_assertions: ["every protected disclosure survives"],
  },
  O03: {
    title: "U.S. QCD acknowledgment; custodian and donor roles are distinct",
    output_profile: "accessible-archive-v1",
    bounds: "Two distinct synthetic roles; QCD wording",
    protected_facts: [
      "QCD protected wording",
      "custodian role label",
      "donor role label",
    ],
    layout_assertions: ["role labels remain distinct and exact"],
  },
  O04: {
    title:
      "U.S. annual acknowledgment; 250 contributions, refunds and corrections; at least 20 pages",
    output_profile: "accessible-archive-v1",
    bounds: "250 synthetic items incl. refunds/corrections; >= 20 pages",
    protected_facts: [
      "per-item dates",
      "per-item amounts",
      "correction labels",
      "totals",
    ],
    layout_assertions: [
      "repeated headers",
      "page counters",
      "complete item list",
    ],
  },
  O05: {
    title: "Canadian individual cash receipt in English",
    output_profile: "accessible-archive-v1",
    bounds: "One synthetic CRA receipt; English",
    protected_facts: [
      "issuer name",
      "serial",
      "issue date",
      "donor name",
      "eligible amount",
      "signer name",
      "CRA fields",
    ],
    layout_assertions: ["official and signer blocks present"],
  },
  O06: {
    title: "Canadian individual cash receipt in French",
    output_profile: "accessible-archive-v1",
    bounds: "One synthetic CRA receipt; French with accents",
    protected_facts: ["French protected fields", "accented text"],
    layout_assertions: ["French language metadata correct"],
  },
  O07: {
    title:
      "Canadian cumulative receipt; 24 gifts and one replacement reference",
    output_profile: "accessible-archive-v1",
    bounds: "24 synthetic gifts; one predecessor citation",
    protected_facts: [
      "contribution list",
      "total",
      "serial",
      "predecessor reference",
    ],
    layout_assertions: ["complete gift list"],
  },
  O08: {
    title: "Canadian advantage/split receipt with multiple advantages",
    output_profile: "accessible-archive-v1",
    bounds: "Multiple synthetic advantages",
    protected_facts: [
      "gift amount",
      "advantage FMV",
      "eligible amount",
      "required explanations",
    ],
    layout_assertions: ["advantage itemization complete"],
  },
  O09: {
    title:
      "Canadian non-cash receipt with long property description and appraiser facts",
    output_profile: "accessible-archive-v1",
    bounds: "Long synthetic property description",
    protected_facts: ["property description", "appraiser facts", "value facts"],
    layout_assertions: ["specialist evidence readable, tagged, unclipped"],
  },
  O10: {
    title: "Informational giving summary; 1,500 rows; minimum 100 final pages",
    output_profile: "accessible-v1",
    bounds: "1,500 synthetic rows; >= 100 pages",
    protected_facts: ["every row", "every total"],
    layout_assertions: [
      "headers, breaks and page counters truthful",
      "no dropped row",
    ],
  },
  O11: {
    title: "Tribute notification with bounded donor anonymity",
    output_profile: "accessible-v1",
    bounds: "Synthetic honoree and notify party; donor identity forbidden",
    protected_facts: ["honoree name", "notify party name"],
    layout_assertions: [
      "forbidden donor identity absent from text, tags, metadata and filename",
    ],
  },
  O12: {
    title: "Pledge statement with paid, pending and remaining values",
    output_profile: "accessible-v1",
    bounds: "Synthetic commitment plan with three value axes",
    protected_facts: ["paid value", "pending value", "remaining value"],
    layout_assertions: ["money and status axes distinct"],
  },
  O13: {
    title:
      "One-page custom business document with logo, headings, list and semantic table",
    output_profile: "accessible-v1",
    bounds: "One synthetic tenant-designed page",
    protected_facts: [],
    layout_assertions: ["semantics preserved under tenant design freedom"],
  },
  O14: {
    title:
      "Two-column custom document with explicit linearization, image alt text and footer",
    output_profile: "accessible-v1",
    bounds: "Two visual columns with declared reading order",
    protected_facts: [],
    layout_assertions: ["visual columns and canonical reading order agree"],
  },
  O15: {
    title:
      "Long names, addresses, URLs, identifiers and unbreakable tokens on Letter and A4",
    output_profile: "both",
    bounds: "Synthetic overflow-stress strings; two page sizes",
    protected_facts: [],
    layout_assertions: [
      "overflow repairs or fails visibly",
      "no clipping or overlap",
    ],
  },
  O16: {
    title:
      "500-row table with keep/break hints, row spans, footnotes and end totals",
    output_profile: "both",
    bounds: "500 synthetic rows; explicit break hints",
    protected_facts: ["end totals"],
    layout_assertions: [
      "headers/cells, page breaks, totals and reading order correct",
    ],
  },
  O17: {
    title:
      "Safe PNG/JPEG/SVG assets plus blocked remote, file, data-exfiltration and script attempts",
    output_profile: "both",
    bounds: "Pinned safe assets; hostile references included",
    protected_facts: [],
    layout_assertions: ["only pinned safe assets render"],
    failure_behavior:
      "every forbidden fetch/execution is denied and logged safely",
  },
  O18: {
    title:
      "Missing glyph, corrupt font, oversized image and malformed semantic input",
    output_profile: "both",
    bounds: "Deliberately broken synthetic inputs",
    protected_facts: [],
    layout_assertions: [],
    failure_behavior:
      "fails closed with a typed actionable cause and emits no canonical artifact",
  },
};

export const HELD_BACK_CASE_DEFINITIONS: Record<
  HeldBackCaseId,
  {
    title: string;
    output_profile: QualificationCaseManifest["output_profile"];
    bounds: string;
  }
> = {
  H01: {
    title:
      "U.S. single acknowledgment with maximum bounded identity/address and mixed Unicode",
    output_profile: "accessible-archive-v1",
    bounds: "Maximum bounded identity fields; mixed Unicode",
  },
  H02: {
    title:
      "U.S. annual acknowledgment with 2,000 rows, corrections and boundary totals; minimum 100 pages",
    output_profile: "accessible-archive-v1",
    bounds: "2,000 synthetic rows; >= 100 pages",
  },
  H03: {
    title:
      "French Canadian cumulative receipt with leap-day/date and long registration/signature content",
    output_profile: "accessible-archive-v1",
    bounds: "French locale; leap-day dates; long registration strings",
  },
  H04: {
    title:
      "Canadian formal replacement with new serial and canceled predecessor citation",
    output_profile: "accessible-archive-v1",
    bounds: "Replacement pair with two identities",
  },
  H05: {
    title:
      "Canadian non-cash gift with advantage and specialist-review evidence",
    output_profile: "accessible-archive-v1",
    bounds: "Specialist pathway fixture",
  },
  H06: {
    title:
      "English/French/Arabic/Hebrew/Japanese mixed-direction names, prose, tables and URLs",
    output_profile: "both",
    bounds: "Mixed-direction multilingual content",
  },
  H07: {
    title:
      "Nested headings, lists, repeated table headers, links, decorative/informative images and two columns",
    output_profile: "both",
    bounds: "Deep tag-structure fixture",
  },
  H08: {
    title:
      "Decompression-bomb image, hostile SVG, remote redirect, localhost/private-IP URL and host-file reference",
    output_profile: "both",
    bounds: "Hostile-input fixture; sandbox limits documented",
  },
  H09: {
    title:
      "Same frozen input rendered ten times with fixed clock and identifiers",
    output_profile: "both",
    bounds: "Determinism fixture; fixed clock",
  },
  H10: {
    title:
      "Maximum admitted page size/content followed by one-over-limit variants",
    output_profile: "both",
    bounds: "Boundary-limit fixture",
  },
  H11: {
    title:
      "Restricted-worker aliases and forbidden identity seeded across content, metadata, tags, bookmarks and filename inputs",
    output_profile: "both",
    bounds: "Publication-safety fixture; forbidden identity markers documented",
  },
  H12: {
    title:
      "Deliberate malformed facts/schema, missing required protected block and incompatible publication/profile",
    output_profile: "both",
    bounds: "Admission-boundary fixture",
  },
};

export const PHASE_18_QUALIFICATION_GATES: readonly QualificationGate[] = [
  {
    gate_id: "G01",
    title: "Protected truth",
    pass_rule:
      "Every expected protected string/value/role appears exactly where required; zero missing, duplicated, substituted, clipped, overlapped, reordered or renderer-computed legal/money/identity fact across all success fixtures.",
  },
  {
    gate_id: "G02",
    title: "Pagination and completeness",
    pass_rule:
      "Every expected row, header, footer, total, footnote, page counter and break invariant is present exactly once where specified; every 100-plus-page case completes with zero dropped output and every over-limit case fails before canonicalization.",
  },
  {
    gate_id: "G03",
    title: "Final profile conformance",
    pass_rule:
      "Every final accessible-v1 artifact passes the frozen PDF/UA-1 machine and manual protocol; every accessible-archive-v1 artifact additionally passes frozen PDF/A-2a validation with zero unresolved required-profile failures.",
  },
  {
    gate_id: "G04",
    title: "Human accessibility",
    pass_rule:
      "Both independent reviewers pass tag structure, reading order, headings, tables, language/direction, links, alternatives, keyboard access, text extraction, 200/400% inspection and the frozen assistive-technology tasks. A machine-only pass fails.",
  },
  {
    gate_id: "G05",
    title: "International text and fonts",
    pass_rule:
      "English, French, RTL and CJK fixtures extract/search/read in logical order; all required fonts are legally embeddable and embedded; missing glyphs, fonts or Unicode mappings fail closed rather than silently substitute.",
  },
  {
    gate_id: "G06",
    title: "Isolation and hostile input",
    pass_rule:
      "No arbitrary network, DNS, localhost/private-address, cloud-metadata, ambient host-file, credential or tenant-code access succeeds. Hostile/malformed inputs remain within frozen CPU/memory/deadline/output bounds, disclose no secret/PII and produce typed evidence.",
  },
  {
    gate_id: "G07",
    title: "Pinning and final-byte integrity",
    pass_rule:
      "The evidence records every executable/input pin. All required byte-changing steps precede validation. SHA-256 and length of staged, uploaded and read-back bytes match; a mismatch cannot promote. Repeat renders meet the frozen semantic/visual stability rule, and any nonsemantic byte variance is fully explained.",
  },
  {
    gate_id: "G08",
    title: "Idempotency and recovery",
    pass_rule:
      "Refresh, replay, redelivery, concurrency and every failure-matrix case converge to one Generation Request and zero or one canonical Artifact; stale fences cannot finalize; ambiguous outcomes reconcile before retry; no orphan/staged object becomes accessible.",
  },
  {
    gate_id: "G09",
    title: "Load, fairness and cost",
    pass_rule:
      "Every operational suite completes within every predeclared absolute budget, without tenant starvation, queue collapse, unbounded retry, provider-quota violation or hidden manual repair. Raw tail latency and per-shape cost evidence are complete.",
  },
  {
    gate_id: "G10",
    title: "Managed/self-hosted operations",
    pass_rule:
      "The exact deployment has an approved security/privacy/procurement or self-hosted operating record, declared residency/retention/support access, bounded credentials, incident/backup/rollback runbooks, capacity ownership and no provider URL/archive authority. Unknown evidence fails.",
  },
  {
    gate_id: "G11",
    title: "Staff product experience",
    pass_rule:
      "Representative staff can use Layout preview, Generate exact proof and grouped Content/Layout/Accessibility/Archive findings without renderer/profile vocabulary; every blocking finding has one cause owner and direct repair path; the preview is never represented as official proof.",
  },
  {
    gate_id: "G12",
    title: "Supply chain and licensing",
    pass_rule:
      "Renderer/compiler, adapters, packages, containers, fonts, assets and validators have retained provenance, checksums, SBOM/license review and a named update owner; no prohibited or unresolved production license/security condition remains.",
  },
];

const ANCHORS: readonly [string, string, string, string, string, string] = [
  "0 — unusable",
  "1 — severe permanent burden",
  "2 — material gaps",
  "3 — meets the contract",
  "4 — clearly exceeds it with low burden",
  "5 — exceptional and repeatedly proved",
];

export const PHASE_18_SCORE_DIMENSIONS: readonly ScoreDimension[] = [
  {
    dimension_id: "fidelity_editor_simplicity",
    title: "Preview/final fidelity and editor simplicity",
    weight: 20,
    anchors: ANCHORS,
  },
  {
    dimension_id: "accessibility_archival_quality",
    title: "Accessibility and archival quality",
    weight: 20,
    anchors: ANCHORS,
  },
  {
    dimension_id: "long_document_throughput",
    title: "Long-document correctness and throughput",
    weight: 20,
    anchors: ANCHORS,
  },
  {
    dimension_id: "isolation_failure_clarity",
    title: "Isolation and failure clarity",
    weight: 15,
    anchors: ANCHORS,
  },
  {
    dimension_id: "international_text",
    title: "International text",
    weight: 10,
    anchors: ANCHORS,
  },
  {
    dimension_id: "total_operational_cost",
    title: "Total operational cost",
    weight: 10,
    anchors: ANCHORS,
  },
  {
    dimension_id: "provider_portability",
    title: "Provider portability",
    weight: 5,
    anchors: ANCHORS,
  },
];

export const PHASE_18_SCORING_RULES: ScoringRules = {
  reviewer_count: 2,
  min_uncertainty_band_points: 2,
  material_lead_points: 5,
  tie_break_order: [
    "fewer new production execution/dependency surfaces and less translation from the canonical Asym semantic source",
    "lower measured operational, security, procurement, support and upgrade burden at the frozen launch/year-end workload",
    "greater measured capacity headroom without weakening isolation, accessibility, archival or recovery proof",
  ],
};

export const PHASE_18_OPERATIONAL_SUITES: OperationalSuites = {
  repeatability: {
    case_ids: ["O01", "O04", "O10", "H02", "H06", "H09"],
    cold_runs_per_case: 10,
    warm_runs_per_case: 10,
  },
  mixed_batch: {
    total_items: 1000,
    tenants: 20,
    short_items: 700,
    medium_items: 200,
    long_items: 80,
    poison_items: 20,
  },
  fairness: {
    heavy_tenant_items: 500,
    light_tenants: 19,
    light_items_each: 10,
    claim_bound_multiplier: 2,
  },
  concurrency_staircase: {
    steps: [1, 5, 10, 25, 50],
  },
  failure_matrix: {
    injections: [
      "timeout",
      "process_termination",
      "ambiguous_provider_result",
      "worker_redelivery",
      "object_upload_failure",
      "read_back_mismatch",
      "validator_crash",
      "finalization_race",
    ],
  },
  outage_recovery: {
    outage_window_minutes: 30,
    proof:
      "bounded queue/backpressure and truthful status during the outage; same exact pipeline restored; no cross-engine output or duplicate effect",
  },
};

export const PHASE_18_EVIDENCE_RULES: EvidenceRules = {
  package_schema_version: "1",
  redaction_policy:
    "synthetic data and PII-safe diagnostics only; neutral candidate IDs during visual and accessibility review",
  retention_owner: "phase-18-evidence-owner",
  retention_days: 2_555,
};

export const PHASE_18_ABSOLUTE_BUDGETS: readonly AbsoluteBudget[] = [
  {
    metric: "short_item_latency_p50_ms",
    limit: 3_000,
    unit: "ms",
    basis: "one-page official document, warm pipeline",
  },
  {
    metric: "short_item_latency_p95_ms",
    limit: 10_000,
    unit: "ms",
    basis: "one-page official document, warm pipeline",
  },
  {
    metric: "short_item_latency_p99_ms",
    limit: 30_000,
    unit: "ms",
    basis: "one-page official document incl. cold starts",
  },
  {
    metric: "medium_item_latency_p95_ms",
    limit: 60_000,
    unit: "ms",
    basis: "20-page statement",
  },
  {
    metric: "long_item_latency_p95_ms",
    limit: 300_000,
    unit: "ms",
    basis: "100-plus-page summary",
  },
  {
    metric: "batch_completion_minutes",
    limit: 90,
    unit: "minutes",
    basis: "1,000-item mixed batch across 20 tenants",
  },
  {
    metric: "throughput_items_per_minute",
    limit: 20,
    unit: "items/minute sustained minimum",
    basis: "mixed batch steady state",
  },
  {
    metric: "max_attempt_deadline_ms",
    limit: 600_000,
    unit: "ms",
    basis:
      // Protocol: the frozen budgets cover "latency, throughput, memory,
      // deadline, queue age, provider quota and cost", and every attempt
      // declares an "explicit deadline". Percentile targets alone let a
      // workload where under 1% of attempts hang pass every declared budget,
      // because a hung attempt is never a slow success - it is a typed timeout.
      // Set at twice the 100-plus-page p95 (long_item_latency_p95_ms), the
      // largest admitted case.
      "absolute per-attempt execution deadline; an attempt exceeding it is a typed timeout, not a slow success",
  },
  {
    metric: "max_queue_age_seconds",
    limit: 600,
    unit: "seconds",
    basis: "interactive item under mixed load",
  },
  {
    metric: "max_resident_memory_mb",
    limit: 2_048,
    unit: "MB",
    basis: "single worker at the largest admitted case",
  },
  {
    metric: "max_artifact_bytes",
    limit: 52_428_800,
    unit: "bytes",
    basis: "largest admitted document",
  },
  {
    metric: "min_capacity_headroom_percent",
    limit: 30,
    unit: "percent",
    basis: "launch workload versus measured ceiling",
  },
  {
    metric: "max_error_rate_percent",
    limit: 1,
    unit: "percent",
    basis: "non-poison items in operational suites",
  },
  {
    metric: "max_retry_rate_percent",
    limit: 5,
    unit: "percent",
    basis: "operational suites",
  },
  {
    metric: "max_provider_requests_per_hour",
    limit: 3_000,
    unit: "requests/hour",
    basis: "managed-provider quota ceiling",
  },
  {
    metric: "max_cost_usd_per_thousand_documents",
    limit: 20,
    unit: "USD",
    basis: "mixed launch shape, all-in provider cost",
  },
  {
    metric: "recovery_time_objective_minutes",
    limit: 15,
    unit: "minutes",
    basis: "provider/runtime outage recovery",
  },
];

export const PHASE_18_VALIDATION_TOOLS: readonly ValidationTool[] = [
  {
    name: "veraPDF",
    version: "1.26.5",
    category: "pdf_a_machine",
    ruleset: "PDF/A-2a",
  },
  {
    name: "PAC",
    version: "2024.1",
    category: "pdf_ua_machine",
    ruleset: "PDF/UA-1 Matterhorn",
  },
  {
    name: "asym-product-validator",
    version: "1",
    category: "product_validator",
    ruleset:
      "PDF syntax, required metadata, prohibited JavaScript/actions/attachments, embedded font inventory, Unicode mappings, tagged-structure expectations, allowed links, page/size limits, restricted-identity leakage",
  },
  {
    name: "pdftotext-structure-extraction",
    version: "24.02",
    category: "text_structure_extraction",
    ruleset: "protected values, row counts, totals, logical order comparison",
  },
  {
    name: "visual-raster-diff",
    version: "1",
    category: "visual_diff",
    ruleset:
      "documented tolerances; repeatability only, never a substitute for semantic review",
  },
  {
    name: "acrobat-nvda-manual-protocol",
    version: "2026-07",
    category: "assistive_technology",
    ruleset:
      "current Adobe Acrobat/Reader with NVDA task set plus one independently chosen viewer/assistive-technology stack named before the run",
  },
];

export const PHASE_18_REQUALIFICATION_TRIGGERS: readonly string[] = [
  "renderer family, engine version, build, managed pipeline, endpoint/region, deployment mode or provider account behavior changes",
  "source compiler, candidate adapter, finalizer, signing/seal step, container/OS/runtime or sandbox policy changes",
  "font binary/license, locale/bidi data, asset sanitizer or semantic block/layout compiler behavior changes",
  "PDF/UA, PDF/A, product validator, extraction or visual-review tool/version/ruleset changes",
  "output-profile definition, metadata policy, required legal/protected block or purpose contract behavior changes",
  "provider DPA, subprocessors, retention, support access, residency, quota, pricing or material service terms change",
  "launch/max workload, page/content/resource bounds, fairness policy or cost budget changes",
  "a new document purpose exercises an unqualified semantic/layout/accessibility capability",
  "a material rendering, privacy, security, accessibility, archival, integrity, data-loss or duplicate-effect incident occurs",
  "a relevant critical/high vulnerability, supply-chain compromise or revoked font/dependency license appears",
];

export interface Phase18ContestFreezeInput {
  charter_id: string;
  charter_version: string;
  frozen_at: string;
  roles: RendererQualificationCharterInput["roles"];
  approvals: RendererQualificationCharterInput["approvals"];
  candidates: RendererQualificationCharterInput["candidates"];
  /** Content-addressed fixture digests for every corpus case. */
  fixtures: Readonly<
    Record<
      HeldBackCaseId | OpenCaseId,
      { facts_digest: string; document_digest: string }
    >
  >;
  /** Custodian-sealed expected-result digests for every held-back case. */
  sealed_expectations: Readonly<Record<HeldBackCaseId, string>>;
  held_back_seal: RendererQualificationCharterInput["held_back_seal"];
  max_remediation_hours_per_cycle?: number;
}

function deepFreezeProtocol<T>(value: T): T {
  if (typeof value !== "object" || value === null) return value;
  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreezeProtocol(child);
  }
  return Object.freeze(value);
}

// Protocol tables are the validation baseline. Freeze them at module load so
// in-place mutation cannot rewrite the approved contest definitions.
deepFreezeProtocol(OPEN_CASE_DEFINITIONS);
deepFreezeProtocol(HELD_BACK_CASE_DEFINITIONS);
deepFreezeProtocol(PHASE_18_QUALIFICATION_GATES);
deepFreezeProtocol(PHASE_18_SCORE_DIMENSIONS);
deepFreezeProtocol(PHASE_18_SCORING_RULES);
deepFreezeProtocol(PHASE_18_OPERATIONAL_SUITES);
deepFreezeProtocol(PHASE_18_EVIDENCE_RULES);
deepFreezeProtocol(PHASE_18_ABSOLUTE_BUDGETS);
deepFreezeProtocol(PHASE_18_VALIDATION_TOOLS);
deepFreezeProtocol(PHASE_18_REQUALIFICATION_TRIGGERS);

/**
 * Assemble the complete Phase 18 charter input from the protocol-fixed content
 * plus the freeze-time provenance. `freezeRendererQualificationCharter` still
 * validates the result; this builder cannot bypass any freeze rule.
 */
export function buildPhase18RendererContestInput(
  input: Phase18ContestFreezeInput,
): RendererQualificationCharterInput {
  const open_corpus: QualificationCaseManifest[] = (
    Object.entries(OPEN_CASE_DEFINITIONS) as Array<
      [OpenCaseId, (typeof OPEN_CASE_DEFINITIONS)[OpenCaseId]]
    >
  ).map(([case_id, definition]) => ({
    case_id,
    visibility: "open",
    title: definition.title,
    output_profile: definition.output_profile,
    synthetic: true,
    fixture: {
      // Blank defaults let freeze validation report typed corpus issues
      // instead of throwing when a required fixture record is omitted.
      facts_digest: input.fixtures[case_id]?.facts_digest ?? "",
      document_digest: input.fixtures[case_id]?.document_digest ?? "",
      bounds: definition.bounds,
    },
    expected: {
      protected_facts: definition.protected_facts,
      layout_assertions: definition.layout_assertions,
      ...(definition.failure_behavior
        ? { failure_behavior: definition.failure_behavior }
        : {}),
    },
  }));

  const held_back_corpus: QualificationCaseManifest[] = (
    Object.entries(HELD_BACK_CASE_DEFINITIONS) as Array<
      [HeldBackCaseId, (typeof HELD_BACK_CASE_DEFINITIONS)[HeldBackCaseId]]
    >
  ).map(([case_id, definition]) => ({
    case_id,
    visibility: "held_back",
    title: definition.title,
    output_profile: definition.output_profile,
    synthetic: true,
    fixture: {
      facts_digest: input.fixtures[case_id]?.facts_digest ?? "",
      document_digest: input.fixtures[case_id]?.document_digest ?? "",
      bounds: definition.bounds,
    },
    sealed_expectation_digest: input.sealed_expectations[case_id] ?? "",
  }));

  // Clone so callers cannot mutate shared protocol objects that validation
  // also uses as its fixed baseline.
  return structuredClone({
    charter_id: input.charter_id,
    charter_version: input.charter_version,
    frozen_at: input.frozen_at,
    roles: input.roles,
    approvals: input.approvals,
    candidates: input.candidates,
    open_corpus,
    held_back_corpus,
    held_back_seal: input.held_back_seal,
    operational_suites: PHASE_18_OPERATIONAL_SUITES,
    gates: PHASE_18_QUALIFICATION_GATES,
    score_dimensions: PHASE_18_SCORE_DIMENSIONS,
    scoring_rules: PHASE_18_SCORING_RULES,
    budgets: PHASE_18_ABSOLUTE_BUDGETS,
    validators: PHASE_18_VALIDATION_TOOLS,
    remediation_policy: {
      initial_attempts: 1,
      max_cycles: 2,
      max_hours_per_cycle: input.max_remediation_hours_per_cycle ?? 40,
      permitted_changes:
        "adapter/translation fixes against the same frozen semantic requirements; no fixture-ID-specific branches; no manual edits to generated PDFs",
    },
    evidence_rules: PHASE_18_EVIDENCE_RULES,
    requalification_triggers: PHASE_18_REQUALIFICATION_TRIGGERS,
    unknown_evidence_rule: "fails_affected_gate",
  });
}
