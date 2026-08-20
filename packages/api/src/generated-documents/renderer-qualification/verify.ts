import {
  RENDERER_QUALIFICATION_SERIALIZER_VERSION,
  digestQualificationValue,
} from "./canonical";
import {
  normalizeRendererQualificationCharterInput,
  validateRendererQualificationCharterInput,
} from "./charter";
import { RENDERER_QUALIFICATION_SCHEMA_VERSION } from "./types";

import type {
  CharterVerificationFailure,
  CharterVerificationResult,
  FrozenRendererQualificationCharter,
  RendererQualificationManifest,
} from "./types";

/**
 * Detect field, collection, fixture, or role tampering in a frozen charter.
 * Digest recomputation catches any byte change; structural revalidation
 * additionally rejects a "charter" whose digest is self-consistent but whose
 * content could never have legitimately frozen.
 */
export function verifyRendererQualificationCharter(
  charter: unknown,
): CharterVerificationResult {
  const failures: CharterVerificationFailure[] = [];

  if (
    typeof charter !== "object" ||
    charter === null ||
    Array.isArray(charter)
  ) {
    return {
      valid: false,
      failures: [
        {
          code: "structure_invalid",
          detail: "Charter must be a non-null object.",
        },
      ],
    };
  }

  const record = charter as Record<string, unknown>;

  if (record.schema_version !== RENDERER_QUALIFICATION_SCHEMA_VERSION) {
    return {
      valid: false,
      failures: [
        {
          code: "schema_version_unsupported",
          detail: `Charter schema version ${String(record.schema_version)} is not supported by this verifier.`,
        },
      ],
    };
  }

  if (record.serializer_version !== RENDERER_QUALIFICATION_SERIALIZER_VERSION) {
    return {
      valid: false,
      failures: [
        {
          code: "serializer_version_unsupported",
          detail: `Charter serializer version ${String(record.serializer_version)} is not supported by this verifier.`,
        },
      ],
    };
  }

  // Normalization sorts and spreads these, so a missing collection throws a raw
  // TypeError before any structural check runs - a verifier that crashes on a
  // malformed charter cannot report it as invalid.
  const requiredArrays = [
    "candidates",
    "open_corpus",
    "held_back_corpus",
    "gates",
    "score_dimensions",
    "budgets",
    "validators",
    "approvals",
    "requalification_triggers",
  ] as const;
  const requiredObjects = [
    "roles",
    "synthetic_corpus_proof",
    "held_back_seal",
    "adapter_contract",
    "operational_suites",
    "scoring_rules",
    "remediation_policy",
    "evidence_rules",
  ] as const;
  const malformed = [
    ...requiredArrays.filter((field) => !Array.isArray(record[field])),
    ...requiredObjects.filter(
      (field) => typeof record[field] !== "object" || record[field] === null,
    ),
  ];
  if (malformed.length > 0) {
    return {
      valid: false,
      failures: [
        {
          code: "structure_invalid",
          detail: `Charter is missing or malformed required fields: ${malformed.join(", ")}.`,
        },
      ],
    };
  }

  try {
    const frozenCharter = charter as FrozenRendererQualificationCharter;
    const {
      schema_version,
      serializer_version,
      manifest_digest,
      ...frozenFields
    } = frozenCharter;
    const normalizedFrozenFields =
      normalizeRendererQualificationCharterInput(frozenFields);
    const expectedDigest = digestQualificationValue({
      schema_version,
      serializer_version,
      charter: normalizedFrozenFields,
    });
    if (expectedDigest !== manifest_digest) {
      failures.push({
        code: "digest_mismatch",
        detail:
          "The charter content does not match its manifest digest; a frozen-field change requires a new charter version.",
      });
    }

    const structural = validateRendererQualificationCharterInput(frozenFields);
    for (const item of structural) {
      failures.push({
        code: "structure_invalid",
        detail: `${item.path}: ${item.message}`,
      });
    }
  } catch {
    failures.push({
      code: "structure_invalid",
      detail:
        "Charter contains malformed nested fields that cannot be normalized or validated.",
    });
  }

  return { valid: failures.length === 0, failures };
}

export function buildRendererQualificationManifest(
  charter: FrozenRendererQualificationCharter,
): RendererQualificationManifest {
  const verification = verifyRendererQualificationCharter(charter);
  if (!verification.valid) {
    throw new Error(
      "Renderer qualification manifest cannot be built from an invalid charter.",
    );
  }

  return {
    schema_version: charter.schema_version,
    serializer_version: charter.serializer_version,
    charter_id: charter.charter_id,
    charter_version: charter.charter_version,
    digest_algorithm: "sha256",
    manifest_digest: charter.manifest_digest,
  };
}
