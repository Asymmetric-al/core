import { DOCUMENT_PURPOSE_CATALOG } from "./catalog";
import { canonicalizeDocumentPurposeValue } from "./serialization";
import { validateDocumentPurposeContractShape } from "./validation";

import type {
  DocumentPurposeContract,
  DocumentPurposeId,
  DocumentPurposeValidationIssue,
  PurposeAvailabilityContext,
} from "./types";

export class UnknownDocumentPurposeError extends Error {
  readonly purposeId: string;

  constructor(purposeId: string) {
    super(
      `Unknown document purpose ${JSON.stringify(purposeId)}. Unknown purposes fail closed; nothing falls back to custom.business_document@1.`,
    );
    this.name = "UnknownDocumentPurposeError";
    this.purposeId = purposeId;
  }
}

export class DocumentPurposeContractError extends Error {
  readonly issues: readonly DocumentPurposeValidationIssue[];

  constructor(
    message: string,
    issues: readonly DocumentPurposeValidationIssue[],
  ) {
    super(message);
    this.name = "DocumentPurposeContractError";
    this.issues = issues;
  }
}

export function isDocumentPurposeId(value: string): value is DocumentPurposeId {
  return value in DOCUMENT_PURPOSE_CATALOG;
}

/** Exact lookup; unknown keys throw and never fall back to a general purpose. */
export function getDocumentPurposeContract(
  purposeId: string,
): DocumentPurposeContract {
  if (!isDocumentPurposeId(purposeId)) {
    throw new UnknownDocumentPurposeError(purposeId);
  }
  return DOCUMENT_PURPOSE_CATALOG[purposeId];
}

/**
 * List the code-owned catalog. With a context, structurally absent purposes
 * (Canadian official purposes while the Canadian pack is not deliberately
 * active) are omitted entirely — an absent purpose has no presence at all.
 */
export function listDocumentPurposeContracts(
  context?: PurposeAvailabilityContext,
): readonly DocumentPurposeContract[] {
  const entries = Object.values(DOCUMENT_PURPOSE_CATALOG);
  if (!context) {
    return entries;
  }
  return entries.filter((contract) => {
    if (contract.launch.state !== "absent_until_activation") {
      return true;
    }
    return context.gate_status.ca_pack_active === true;
  });
}

/**
 * Assert that a supplied contract is exactly the code-owned entry for its
 * identity. Any structural defect, unknown identity, or byte-level deviation
 * (including any tenant-supplied mutation of an official_tax purpose) throws.
 */
export function assertDocumentPurposeContract(
  contract: DocumentPurposeContract,
): void {
  const purposeId = `${contract.purpose_key}@${contract.purpose_version}`;

  const shapeIssues = validateDocumentPurposeContractShape(purposeId, contract);
  if (shapeIssues.length > 0) {
    throw new DocumentPurposeContractError(
      `Document purpose contract ${purposeId} is invalid.`,
      shapeIssues,
    );
  }

  if (!isDocumentPurposeId(purposeId)) {
    throw new UnknownDocumentPurposeError(purposeId);
  }

  const canonical = DOCUMENT_PURPOSE_CATALOG[purposeId];
  if (
    canonicalizeDocumentPurposeValue(contract) !==
    canonicalizeDocumentPurposeValue(canonical)
  ) {
    const code =
      canonical.lane === "official_tax"
        ? "official_purpose_tampered"
        : "contract_tampered";
    throw new DocumentPurposeContractError(
      `Document purpose contract ${purposeId} does not match the code-owned catalog; purpose contracts cannot be created or altered at runtime.`,
      [
        {
          path: purposeId,
          code,
          message:
            "The supplied contract deviates from the immutable code-owned entry.",
        },
      ],
    );
  }
}
