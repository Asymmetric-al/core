import { digestQualificationValue } from "./canonical";
import {
  normalizeRendererQualificationCharterInput,
  validateRendererQualificationCharterInput,
} from "./charter";
import { RENDERER_QUALIFICATION_SCHEMA_VERSION } from "./types";

import type {
  CharterVerificationFailure,
  CharterVerificationResult,
  FrozenRendererQualificationCharter,
} from "./types";

/**
 * Detect field, collection, fixture, or role tampering in a frozen charter.
 * Digest recomputation catches any byte change; structural revalidation
 * additionally rejects a "charter" whose digest is self-consistent but whose
 * content could never have legitimately frozen.
 */
export function verifyRendererQualificationCharter(
  charter: FrozenRendererQualificationCharter,
): CharterVerificationResult {
  const failures: CharterVerificationFailure[] = [];

  if (charter.schema_version !== RENDERER_QUALIFICATION_SCHEMA_VERSION) {
    return {
      valid: false,
      failures: [
        {
          code: "schema_version_unsupported",
          detail: `Charter schema version ${charter.schema_version} is not supported by this verifier.`,
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
    "held_back_seal",
    "operational_suites",
    "scoring_rules",
    "remediation_policy",
    "evidence_rules",
  ] as const;
  const record = charter as unknown as Record<string, unknown>;
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

  const { schema_version, manifest_digest, ...frozenFields } = charter;
  const normalizedFrozenFields =
    normalizeRendererQualificationCharterInput(frozenFields);
  const expectedDigest = digestQualificationValue({
    schema_version,
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

  return { valid: failures.length === 0, failures };
}
