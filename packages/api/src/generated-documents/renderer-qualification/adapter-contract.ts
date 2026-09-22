import {
  RENDERER_QUALIFICATION_SERIALIZER_VERSION,
  digestQualificationValue,
} from "./canonical";

import type { RendererAdapterContract } from "./types";

const ADAPTER_CONTRACT_DIGEST_KIND = "phase-18-renderer-adapter-contract";

const FAILURE_CLASSIFICATIONS = [
  "invalid_input",
  "unsupported_capability",
  "validation_failure",
  "resource_limit",
  "timeout",
  "provider_unavailable",
  "provider_indeterminate",
  "sandbox_security_rejection",
  "internal_adapter_failure",
] as const;

function deepFreezeContract<T>(value: T): T {
  if (typeof value !== "object" || value === null) return value;
  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreezeContract(child);
  }
  return Object.freeze(value);
}

const protocolContract = {
  contract_version: "phase-18-renderer-adapter-contract/v1",
  request: {
    semantic_document: "same_bounded_product_contract",
    compiled_source: {
      bytes: "frozen_compiled_source_bytes",
      media_type: "explicit",
    },
    correlation_metadata: {
      classification: "non_secret",
      identities: [
        "purpose_id",
        "publication_id",
        "facts_package_id",
        "request_id",
        "attempt_id",
      ],
    },
    bundles: {
      assets: "local_content_addressed",
      fonts: "local_content_addressed",
    },
    rendering_context: [
      "locale",
      "direction",
      "time_zone",
      "page_size",
      "metadata_clock",
      "output_profile",
    ],
    limits: [
      "deadline",
      "max_input_bytes",
      "max_output_bytes",
      "max_pages",
      "resource_budget",
    ],
  },
  result: {
    discriminator: "status",
    cardinality: "exactly_one_success_or_typed_failure",
    success: {
      status: "success",
      pdf_bytes: "candidate_pdf_bytes",
      safe_metrics: "required",
    },
    failure: {
      status: "failure",
      classifications: FAILURE_CLASSIFICATIONS,
      actionable_cause: "required",
      canonical_artifact_emitted: false,
    },
  },
  authority: {
    provider_identifiers_and_urls: "diagnostic_evidence_only",
    may_mark_artifact_canonical: false,
    may_advance_logical_document_head: false,
    may_issue_receipt: false,
    may_cause_delivery: false,
  },
  reconciliation: {
    timeout_or_provider_indeterminate: "same_attempt_identity",
    second_official_effect: "forbidden",
  },
  evidence: {
    candidate_specific_source: "retained",
    accommodations_and_semantic_losses: "listed",
    manual_pdf_edits: "forbidden",
    fixture_id_specific_branches: "forbidden",
  },
} as const satisfies RendererAdapterContract;

export const PHASE_18_RENDERER_ADAPTER_CONTRACT =
  deepFreezeContract(protocolContract);

export function digestRendererAdapterContract(contract: unknown): string {
  return digestQualificationValue({
    kind: ADAPTER_CONTRACT_DIGEST_KIND,
    serializer_version: RENDERER_QUALIFICATION_SERIALIZER_VERSION,
    contract,
  });
}

export const PHASE_18_RENDERER_ADAPTER_CONTRACT_DIGEST =
  digestRendererAdapterContract(PHASE_18_RENDERER_ADAPTER_CONTRACT);

function hasExactProtocolValue(
  actual: unknown,
  expected: unknown,
  ancestors = new WeakSet<object>(),
): boolean {
  if (actual === expected) return true;
  if (
    typeof actual !== "object" ||
    actual === null ||
    typeof expected !== "object" ||
    expected === null
  ) {
    return false;
  }
  if (ancestors.has(actual)) return false;
  ancestors.add(actual);

  try {
    if (Array.isArray(actual) || Array.isArray(expected)) {
      return (
        Array.isArray(actual) &&
        Array.isArray(expected) &&
        actual.length === expected.length &&
        expected.every((item, index) =>
          hasExactProtocolValue(actual[index], item, ancestors),
        )
      );
    }

    const actualRecord = actual as Record<string, unknown>;
    const expectedRecord = expected as Record<string, unknown>;
    const actualKeys = Object.keys(actualRecord);
    const expectedKeys = Object.keys(expectedRecord);
    return (
      actualKeys.length === expectedKeys.length &&
      expectedKeys.every(
        (key) =>
          Object.prototype.hasOwnProperty.call(actualRecord, key) &&
          hasExactProtocolValue(
            actualRecord[key],
            expectedRecord[key],
            ancestors,
          ),
      )
    );
  } finally {
    ancestors.delete(actual);
  }
}

export function isPhase18RendererAdapterContract(
  value: unknown,
): value is RendererAdapterContract {
  return hasExactProtocolValue(value, PHASE_18_RENDERER_ADAPTER_CONTRACT);
}
