import {
  CA_CASE_IDS,
  DOCUMENT_CASE_IDS,
  DOCUMENT_PURPOSE_IDS,
  DOCUMENT_PURPOSE_KEYS,
  DOCUMENT_PURPOSE_LANES,
  FIXTURE_CLASSES,
  LEGAL_ISSUER_REQUIREMENTS,
  OUTPUT_POLICIES,
  PROTECTED_BLOCK_IDS,
  PURPOSE_LAUNCH_GATES,
  RELEASE_EVIDENCE_CLASSES,
  REVIEW_FLOORS,
  STRUCTURED_BLOCK_IDS,
} from "./types";

import type {
  DocumentPurposeContract,
  DocumentPurposeValidationIssue,
} from "./types";

/**
 * Runtime validation for the code-owned purpose catalog. The compile-time
 * `satisfies` contract already rejects most drift; this validator is the
 * fail-closed backstop that also guards values arriving through the public
 * assertion seam, where compile-time types cannot be trusted.
 */

const CONTRACT_FIELDS = [
  "purpose_key",
  "purpose_version",
  "lane",
  "source_owner",
  "legal_issuer_requirement",
  "recipient_role",
  "approved_data_view",
  "case_registry",
  "required_blocks",
  "optional_blocks",
  "forbidden_facts",
  "output_policy",
  "locale_policy",
  "publication_scope_policy",
  "review_floor",
  "identity_policy",
  "correction_policy",
  "delivery_policy",
  "access_policy",
  "records_schedule",
  "fixture_pack",
  "release_evidence",
  "launch",
] as const;

function issue(
  path: string,
  code: string,
  message: string,
): DocumentPurposeValidationIssue {
  return { path, code, message };
}

function includes<T extends string>(
  values: readonly T[],
  candidate: string,
): candidate is T {
  return (values as readonly string[]).includes(candidate);
}

export function validateDocumentPurposeContractShape(
  entryId: string,
  contract: DocumentPurposeContract,
): DocumentPurposeValidationIssue[] {
  const issues: DocumentPurposeValidationIssue[] = [];
  const path = (field: string) => `${entryId}.${field}`;

  const knownFields = new Set<string>(CONTRACT_FIELDS);
  for (const field of Object.keys(contract)) {
    if (!knownFields.has(field)) {
      issues.push(
        issue(
          path(field),
          "unknown_field",
          `Field ${field} is not part of the Document Purpose Contract; tenant-authored extensions are rejected.`,
        ),
      );
    }
  }
  for (const field of CONTRACT_FIELDS) {
    if (!(field in contract) || contract[field] === undefined) {
      issues.push(
        issue(
          path(field),
          "missing_field",
          `Required manifest field ${field} is missing; authority-sensitive fields have no implicit defaults.`,
        ),
      );
    }
  }
  if (issues.some((item) => item.code === "missing_field")) {
    return issues;
  }

  const expectedId = `${contract.purpose_key}@${contract.purpose_version}`;
  if (expectedId !== entryId) {
    issues.push(
      issue(
        path("purpose_key"),
        "mutable_identity",
        `Entry ${entryId} declares identity ${expectedId}; key/version identity is immutable.`,
      ),
    );
  }
  if (!includes(DOCUMENT_PURPOSE_KEYS, contract.purpose_key)) {
    issues.push(
      issue(path("purpose_key"), "unknown_purpose_key", "Unknown purpose key."),
    );
  }
  if (contract.purpose_version !== 1) {
    issues.push(
      issue(
        path("purpose_version"),
        "unknown_purpose_version",
        "Only purpose version 1 exists in this catalog.",
      ),
    );
  }

  if (!includes(DOCUMENT_PURPOSE_LANES, contract.lane)) {
    issues.push(issue(path("lane"), "invalid_lane", "Unknown lane value."));
  }
  if (!includes(LEGAL_ISSUER_REQUIREMENTS, contract.legal_issuer_requirement)) {
    issues.push(
      issue(
        path("legal_issuer_requirement"),
        "invalid_issuer_requirement",
        "Unknown legal issuer requirement.",
      ),
    );
  }
  if (!includes(OUTPUT_POLICIES, contract.output_policy)) {
    issues.push(
      issue(
        path("output_policy"),
        "invalid_output_policy",
        "Unknown output policy.",
      ),
    );
  }
  if (!includes(REVIEW_FLOORS, contract.review_floor)) {
    issues.push(
      issue(
        path("review_floor"),
        "invalid_review_floor",
        "Unknown review floor.",
      ),
    );
  }

  if (contract.lane === "official_tax") {
    if (contract.legal_issuer_requirement === "none") {
      issues.push(
        issue(
          path("legal_issuer_requirement"),
          "impossible_lane_issuer_combination",
          "An official-tax purpose requires a legal issuer.",
        ),
      );
    }
    if (contract.output_policy !== "accessible-archive-v1") {
      issues.push(
        issue(
          path("output_policy"),
          "invalid_combination",
          "Official-tax purposes require accessible-archive-v1.",
        ),
      );
    }
    if (contract.review_floor !== "protected") {
      issues.push(
        issue(
          path("review_floor"),
          "invalid_combination",
          "Official-tax purposes require the protected review floor.",
        ),
      );
    }
    if (contract.identity_policy.public_reference === "none") {
      issues.push(
        issue(
          path("identity_policy.public_reference"),
          "invalid_combination",
          "Official-tax purposes carry a code-owned public reference or serial policy.",
        ),
      );
    }
    if (contract.case_registry.length === 0) {
      issues.push(
        issue(
          path("case_registry"),
          "missing_case_registry",
          "Official-tax purposes require a closed source-selected case set.",
        ),
      );
    }
    if (contract.launch.state === "supported_after_gates") {
      issues.push(
        issue(
          path("launch.state"),
          "launch_state_promoted",
          "Official purposes launch dark or structurally absent; they are never promoted to supported by default.",
        ),
      );
    }
  } else {
    if (contract.legal_issuer_requirement !== "none") {
      issues.push(
        issue(
          path("legal_issuer_requirement"),
          "impossible_lane_issuer_combination",
          "Only official-tax purposes may require a legal issuer.",
        ),
      );
    }
    if (contract.identity_policy.public_reference !== "none") {
      issues.push(
        issue(
          path("identity_policy.public_reference"),
          "invalid_combination",
          "Only official-tax purposes allocate public references or serials.",
        ),
      );
    }
  }
  if (
    contract.legal_issuer_requirement ===
      "active_ca_registered_charity_issuer" &&
    (contract.launch.state !== "absent_until_activation" ||
      !contract.launch.gates.includes("ca_pack_active"))
  ) {
    issues.push(
      issue(
        path("launch"),
        "launch_state_promoted",
        "Canadian official purposes are structurally absent until the Canadian pack is deliberately active.",
      ),
    );
  }

  for (const caseId of contract.case_registry) {
    if (!includes(DOCUMENT_CASE_IDS, caseId)) {
      issues.push(
        issue(
          path("case_registry"),
          "unknown_reference",
          `Unknown case ${caseId}.`,
        ),
      );
      continue;
    }
    const isCaCase = includes(CA_CASE_IDS, caseId);
    const isCaPurpose =
      contract.legal_issuer_requirement ===
      "active_ca_registered_charity_issuer";
    if (isCaCase !== isCaPurpose) {
      issues.push(
        issue(
          path("case_registry"),
          "invalid_combination",
          `Case ${caseId} belongs to a different jurisdiction than this purpose.`,
        ),
      );
    }
  }

  const requiredSet = new Set(contract.required_blocks);
  for (const block of [
    ...contract.required_blocks,
    ...contract.optional_blocks,
  ]) {
    if (!includes(STRUCTURED_BLOCK_IDS, block)) {
      issues.push(
        issue(
          path("required_blocks"),
          "unknown_reference",
          `Unknown structured block ${block}.`,
        ),
      );
    }
  }
  for (const block of contract.optional_blocks) {
    if (requiredSet.has(block)) {
      issues.push(
        issue(
          path("optional_blocks"),
          "required_block_conflict",
          `Block ${block} cannot be both required and tenant-optional.`,
        ),
      );
    }
  }
  for (const block of PROTECTED_BLOCK_IDS) {
    if (contract.optional_blocks.includes(block)) {
      issues.push(
        issue(
          path("optional_blocks"),
          "protected_block_exposed",
          `Protected block ${block} can never be tenant-optional.`,
        ),
      );
    }
    if (contract.lane !== "official_tax" && requiredSet.has(block)) {
      issues.push(
        issue(
          path("required_blocks"),
          "protected_block_exposed",
          `Protected block ${block} exists only inside official-tax purposes.`,
        ),
      );
    }
  }

  if (contract.approved_data_view.fields.length === 0) {
    issues.push(
      issue(
        path("approved_data_view.fields"),
        "empty_data_view",
        "An approved data view must declare its exact typed fields.",
      ),
    );
  }
  const forbidden = new Set(contract.forbidden_facts.facts);
  for (const field of contract.approved_data_view.fields) {
    if (forbidden.has(field)) {
      issues.push(
        issue(
          path("approved_data_view.fields"),
          "forbidden_fact_exposed",
          `Approved data view exposes forbidden fact ${field}.`,
        ),
      );
    }
  }

  if (contract.locale_policy.fallback !== "fail_closed") {
    issues.push(
      issue(
        path("locale_policy.fallback"),
        "invalid_combination",
        "Locale fallback is always fail-closed.",
      ),
    );
  }
  if (contract.locale_policy.activated_locales.length === 0) {
    issues.push(
      issue(
        path("locale_policy.activated_locales"),
        "invalid_combination",
        "A purpose must activate at least one locale.",
      ),
    );
  }
  for (const variant of contract.locale_policy.required_legal_variants) {
    if (!contract.locale_policy.activated_locales.includes(variant)) {
      issues.push(
        issue(
          path("locale_policy.required_legal_variants"),
          "invalid_combination",
          `Required legal variant ${variant} is not an activated locale.`,
        ),
      );
    }
  }

  const fixtureSet = new Set(contract.fixture_pack.required_fixtures);
  for (const fixtureClass of FIXTURE_CLASSES) {
    if (!fixtureSet.has(fixtureClass)) {
      issues.push(
        issue(
          path("fixture_pack.required_fixtures"),
          "missing_fixture",
          `Fixture class ${fixtureClass} is required for every purpose.`,
        ),
      );
    }
  }
  for (const fixtureClass of contract.fixture_pack.required_fixtures) {
    if (!includes(FIXTURE_CLASSES, fixtureClass)) {
      issues.push(
        issue(
          path("fixture_pack.required_fixtures"),
          "unknown_reference",
          `Unknown fixture class ${fixtureClass}.`,
        ),
      );
    }
  }

  if (contract.release_evidence.length === 0) {
    issues.push(
      issue(
        path("release_evidence"),
        "missing_release_evidence",
        "A purpose cannot activate without named release evidence.",
      ),
    );
  }
  for (const evidence of contract.release_evidence) {
    if (!includes(RELEASE_EVIDENCE_CLASSES, evidence)) {
      issues.push(
        issue(
          path("release_evidence"),
          "unknown_reference",
          `Unknown release evidence class ${evidence}.`,
        ),
      );
    }
  }
  if (
    contract.lane === "official_tax" &&
    !contract.release_evidence.includes("legal_finance")
  ) {
    issues.push(
      issue(
        path("release_evidence"),
        "missing_release_evidence",
        "Official purposes require legal/finance release evidence.",
      ),
    );
  }

  for (const gate of contract.launch.gates) {
    if (!includes(PURPOSE_LAUNCH_GATES, gate)) {
      issues.push(
        issue(
          path("launch.gates"),
          "unknown_reference",
          `Unknown launch gate ${gate}.`,
        ),
      );
    }
  }

  return issues;
}

export function validateDocumentPurposeCatalog(
  catalog: Record<string, DocumentPurposeContract>,
): DocumentPurposeValidationIssue[] {
  const issues: DocumentPurposeValidationIssue[] = [];
  const expected = new Set<string>(DOCUMENT_PURPOSE_IDS);

  for (const purposeId of DOCUMENT_PURPOSE_IDS) {
    if (!(purposeId in catalog)) {
      issues.push(
        issue(
          purposeId,
          "missing_launch_purpose",
          "The launch catalog is incomplete without this purpose.",
        ),
      );
    }
  }

  const seenIdentities = new Map<string, string>();
  for (const [entryId, contract] of Object.entries(catalog)) {
    if (!expected.has(entryId)) {
      issues.push(
        issue(
          entryId,
          "unknown_purpose",
          "This entry is not part of the closed launch catalog.",
        ),
      );
    }

    const identity = `${contract.purpose_key}@${contract.purpose_version}`;
    const existing = seenIdentities.get(identity);
    if (existing) {
      issues.push(
        issue(
          entryId,
          "duplicate_identity",
          `Identity ${identity} is already declared by ${existing}.`,
        ),
      );
    }
    seenIdentities.set(identity, entryId);

    issues.push(...validateDocumentPurposeContractShape(entryId, contract));
  }

  return issues;
}
