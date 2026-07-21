/**
 * Phase 18 Document Purpose Contract catalog — exact compile-time vocabulary.
 *
 * The catalog is code-owned and immutable: a template may present a purpose,
 * it may never create, widen, rename, or reinterpret one. Every value here is
 * a closed union mirrored from the Phase 18 executable document-purpose and
 * authority manifest
 * (`docs/prds/sitestacker-parity/phase-18-document-purpose-authority-manifest.md`).
 * Field names deliberately keep the manifest's exact `snake_case` spelling so
 * the executable catalog cannot drift from the normative document.
 */

export const DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION = "1";

export const DOCUMENT_PURPOSE_LANES = [
  "official_tax",
  "governed_business",
  "general_custom",
] as const;
export type DocumentPurposeLane = (typeof DOCUMENT_PURPOSE_LANES)[number];

export const LEGAL_ISSUER_REQUIREMENTS = [
  "none",
  "verified_us_issuer",
  "active_ca_registered_charity_issuer",
] as const;
export type LegalIssuerRequirement = (typeof LEGAL_ISSUER_REQUIREMENTS)[number];

export const OUTPUT_POLICIES = [
  "accessible-v1",
  "accessible-archive-v1",
] as const;
export type OutputPolicy = (typeof OUTPUT_POLICIES)[number];

export const REVIEW_FLOORS = ["standard", "protected"] as const;
export type ReviewFloor = (typeof REVIEW_FLOORS)[number];

export const PURPOSE_PREDICATES = [
  "has_value",
  "is_empty",
  "is_yes",
  "is_no",
  "is_option",
  "is_not_option",
] as const;
export type PurposePredicate = (typeof PURPOSE_PREDICATES)[number];

export const DOCUMENT_PURPOSE_KEYS = [
  "us.contribution_acknowledgment.single",
  "us.contribution_acknowledgment.annual",
  "us.qcd.acknowledgment",
  "ca.official_receipt.individual_cash",
  "ca.official_receipt.cumulative_cash",
  "ca.official_receipt.non_cash",
  "ca.official_receipt.advantage_split",
  "giving.summary.informational",
  "tribute.notification",
  "pledge.statement",
  "custom.business_document",
] as const;
export type DocumentPurposeKey = (typeof DOCUMENT_PURPOSE_KEYS)[number];

export type DocumentPurposeVersion = 1;

export type DocumentPurposeId =
  `${DocumentPurposeKey}@${DocumentPurposeVersion}`;

export const DOCUMENT_PURPOSE_IDS = [
  "us.contribution_acknowledgment.single@1",
  "us.contribution_acknowledgment.annual@1",
  "us.qcd.acknowledgment@1",
  "ca.official_receipt.individual_cash@1",
  "ca.official_receipt.cumulative_cash@1",
  "ca.official_receipt.non_cash@1",
  "ca.official_receipt.advantage_split@1",
  "giving.summary.informational@1",
  "tribute.notification@1",
  "pledge.statement@1",
  "custom.business_document@1",
] as const satisfies readonly DocumentPurposeId[];

export const US_CASE_IDS = [
  "us.cash.under_250@1",
  "us.cash.250_or_more@1",
  "us.quid_pro_quo.over_75@1",
  "us.intangible_religious_benefit@1",
  "us.property_or_market_asset@1",
  "us.daf_or_pass_through@1",
  "us.qcd@1",
  "us.corrected@1",
] as const;
export type UsCaseId = (typeof US_CASE_IDS)[number];

export const CA_CASE_IDS = [
  "ca.cash.individual@1",
  "ca.cash.cumulative@1",
  "ca.property.non_cash@1",
  "ca.advantage.split@1",
  "ca.replacement@1",
] as const;
export type CaCaseId = (typeof CA_CASE_IDS)[number];

export type DocumentCaseId = CaCaseId | UsCaseId;
export const DOCUMENT_CASE_IDS = [...US_CASE_IDS, ...CA_CASE_IDS] as const;

export const STRUCTURED_BLOCK_IDS = [
  "page@1",
  "section@1",
  "heading@1",
  "rich_text@1",
  "image@1",
  "fact@1",
  "money@1",
  "summary@1",
  "table@1",
  "divider@1",
  "spacer@1",
  "header@1",
  "footer@1",
  "page_break@1",
  "official_block@1",
  "signer_block@1",
] as const;
export type StructuredBlockId = (typeof STRUCTURED_BLOCK_IDS)[number];

/**
 * Blocks that carry code-owned legal/identity truth. They may appear only in
 * the required set of an `official_tax` purpose; a tenant can never opt into
 * or out of them.
 */
export const PROTECTED_BLOCK_IDS = [
  "official_block@1",
  "signer_block@1",
] as const satisfies readonly StructuredBlockId[];

export const PURPOSE_LAUNCH_GATES = [
  "us_legal_finance_review",
  "core_d3_renderer_qualified",
  "core_d4_artifact_pipeline",
  "phase19_statement_seam",
  "ca_pack_active",
  "ca_issuer_coverage_case_proof",
  "phase14_tribute_contract",
  "phase16_pledge_contract",
  "registered_safe_data_view",
] as const;
export type PurposeLaunchGate = (typeof PURPOSE_LAUNCH_GATES)[number];

export type PurposeLaunchState =
  | "absent_until_activation"
  | "dark"
  | "supported_after_gates";

export const FIXTURE_CLASSES = [
  "ordinary",
  "negative",
  "maximum_content",
  "locale",
  "accessibility",
  "failure",
] as const;
export type FixtureClass = (typeof FIXTURE_CLASSES)[number];

export const RELEASE_EVIDENCE_CLASSES = [
  "renderer",
  "legal_finance",
  "accessibility",
  "security",
  "records",
  "load",
  "operational",
] as const;
export type ReleaseEvidenceClass = (typeof RELEASE_EVIDENCE_CLASSES)[number];

export type PublicReferencePolicy =
  | "ack_reference_v1"
  | "ca_serial_r_v1"
  | "none";

export type CorrectionModel =
  | "source_owned_replacement_serial"
  | "source_owned_successor_version"
  | "successor_document";

export type DeliveryRoute = "email" | "mail" | "portal";

export interface DocumentPurposeContract {
  purpose_key: DocumentPurposeKey;
  purpose_version: DocumentPurposeVersion;
  lane: DocumentPurposeLane;
  source_owner: string;
  legal_issuer_requirement: LegalIssuerRequirement;
  recipient_role: {
    role: string;
    authorization_policy: string;
  };
  approved_data_view: {
    view_key: string;
    view_version: number;
    fields: readonly string[];
  };
  case_registry: readonly DocumentCaseId[];
  required_blocks: readonly StructuredBlockId[];
  optional_blocks: readonly StructuredBlockId[];
  forbidden_facts: {
    deny_set_version: number;
    facts: readonly string[];
  };
  output_policy: OutputPolicy;
  locale_policy: {
    activated_locales: readonly string[];
    required_legal_variants: readonly string[];
    fallback: "fail_closed";
  };
  publication_scope_policy: {
    assignment: "configured_inheritance";
    recovery_order: readonly [
      "same_scope_prior",
      "exact_locale_permitted_ancestor",
    ];
  };
  review_floor: ReviewFloor;
  identity_policy: {
    internal: "opaque_logical_id";
    public_reference: PublicReferencePolicy;
  };
  correction_policy: {
    model: CorrectionModel;
  };
  delivery_policy: {
    phase17_routes: readonly DeliveryRoute[];
  };
  access_policy: {
    portal: boolean;
    guest_grant: boolean;
    staff: boolean;
    support: boolean;
    missionary: boolean;
  };
  records_schedule: {
    schedule_key: string;
    schedule_version: number;
  };
  fixture_pack: {
    pack_key: string;
    required_fixtures: readonly FixtureClass[];
  };
  release_evidence: readonly ReleaseEvidenceClass[];
  launch: {
    state: PurposeLaunchState;
    gates: readonly PurposeLaunchGate[];
  };
}

export const PURPOSE_AVAILABILITY_STATES = [
  "supported",
  "dark",
  "absent",
] as const;
export type PurposeAvailabilityState =
  (typeof PURPOSE_AVAILABILITY_STATES)[number];

export const PURPOSE_AVAILABILITY_CAUSE_CODES = [
  "purpose_unknown",
  "contract_dark",
  "jurisdiction_not_active",
  "issuer_proof_missing",
  "purpose_absent",
  "unsupported_context",
  "qualification_not_ready",
  "qualification_expired",
  "qualification_revoked",
  "launch_gate_unmet",
  "data_view_not_registered",
] as const;
export type PurposeAvailabilityCauseCode =
  (typeof PURPOSE_AVAILABILITY_CAUSE_CODES)[number];

export interface PurposeAvailabilityCause {
  code: PurposeAvailabilityCauseCode;
  gate?: PurposeLaunchGate;
  explanation: string;
}

export interface PurposeAvailabilityContext {
  tenant_id?: string;
  /** Non-official launch-gate status, resolved by the caller's own domain. */
  gate_status: Readonly<Partial<Record<PurposeLaunchGate, boolean>>>;
  /** Structural issuer proof carried by the request context. */
  issuer_proof: {
    verified_us_issuer: boolean;
    active_ca_registered_charity_issuer: boolean;
  };
  /** Registered safe Approved Data Views available to general documents. */
  registered_safe_data_views: readonly string[];
  /** The Approved Data View a general/custom document asks to render over. */
  requested_data_view?: string;
}

export interface PurposeAvailabilityResult {
  purpose_id: string;
  state: PurposeAvailabilityState;
  causes: readonly PurposeAvailabilityCause[];
  qualification_outcome?: DocumentQualificationOutcome;
}

export const DOCUMENT_QUALIFICATION_OUTCOMES = [
  "qualified",
  "not_ready",
  "expired",
  "revoked",
] as const;
export type DocumentQualificationOutcome =
  (typeof DOCUMENT_QUALIFICATION_OUTCOMES)[number];

export interface DocumentQualificationEvidence {
  outcome: DocumentQualificationOutcome;
  /** Exact purpose id this evidence covers; a mismatch never qualifies. */
  purpose_id: string;
  evidence_ref?: string;
  checked_at: string;
  expires_at?: string;
}

/**
 * The one shared qualification/availability interface. Official purposes stay
 * production-dark until T53 backs this port with current exact evidence; no
 * second release predicate or environment flag may bypass it.
 */
export interface DocumentQualificationAvailabilityPort {
  checkPurposeQualification(input: {
    purpose_id: string;
    tenant_id?: string;
  }): Promise<DocumentQualificationEvidence>;
}

export interface DocumentPurposeCatalogManifest {
  schema_version: string;
  digest_algorithm: "sha256";
  entries: readonly DocumentPurposeContract[];
  digest: string;
}

export interface DocumentPurposeValidationIssue {
  path: string;
  code: string;
  message: string;
}
