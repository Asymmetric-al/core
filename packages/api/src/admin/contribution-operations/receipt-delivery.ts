import { ApiHttpError } from "../../shared/http-errors";

import type { ContributionAdjustmentEffectiveValues } from "../contribution-shared/effective-values";

/**
 * Updated receipt delivery policy (ADR-CD-029 / ADR-CD-030 / ADR-CD-031).
 *
 * When a correction changes values already represented on a sent receipt,
 * staff choose at correction time: email (only when the donor has an address
 * and has not opted out), PDF, or defer with a reason where policy permits.
 * A receipt is never auto-sent just because a correction was saved, donor
 * email opt-out is an absolute block, and the policy is enforced server-side.
 */

export type ReceiptDeliveryChoice = "email" | "pdf" | "defer";

export interface ReceiptDeliverySelection {
  choice: ReceiptDeliveryChoice;
  deferReason?: string | null;
}

export interface TenantReceiptDeliveryPolicy {
  defaultChoice: ReceiptDeliveryChoice;
  allowDefer: boolean;
  deferReasonRequired: boolean;
  /** When true, receipt-affecting corrections must select email or PDF. */
  requireDeliveryAction: boolean;
  /** Capability required to send updated receipt emails. */
  emailCapability: string;
  /** Capability required to generate updated receipt PDFs. */
  pdfCapability: string;
}

export interface TenantReceiptDeliveryPolicyRow {
  default_choice?: string | null;
  allow_defer?: boolean | null;
  defer_reason_required?: boolean | null;
  require_delivery_action?: boolean | null;
  email_capability?: string | null;
  pdf_capability?: string | null;
}

const DELIVERY_CHOICES: ReceiptDeliveryChoice[] = ["email", "pdf", "defer"];

export function resolveTenantReceiptDeliveryPolicy(
  row: TenantReceiptDeliveryPolicyRow | null | undefined,
): TenantReceiptDeliveryPolicy {
  const defaultChoice = DELIVERY_CHOICES.includes(
    row?.default_choice as ReceiptDeliveryChoice,
  )
    ? (row?.default_choice as ReceiptDeliveryChoice)
    : "email";

  return {
    defaultChoice,
    allowDefer: row?.allow_defer ?? true,
    deferReasonRequired: row?.defer_reason_required ?? true,
    requireDeliveryAction: row?.require_delivery_action ?? false,
    emailCapability: row?.email_capability ?? "contributions.manage_receipts",
    pdfCapability: row?.pdf_capability ?? "contributions.manage_receipts",
  };
}

/**
 * Which receipt-visible fields a correction changes (ADR-CD-013). Used so
 * staff see what changed before choosing a delivery action.
 */
export function computeReceiptAffectedFields(
  effectiveValues: ContributionAdjustmentEffectiveValues,
): string[] {
  const fields: string[] = [];
  if (effectiveValues.amountCents !== undefined) {
    fields.push("amount");
  }
  if (
    effectiveValues.fundId !== undefined ||
    effectiveValues.missionaryId !== undefined ||
    effectiveValues.designationLines !== undefined
  ) {
    fields.push("designation");
  }
  if (effectiveValues.paymentStatus !== undefined) {
    fields.push("payment status");
  }
  return fields;
}

export interface ReceiptDeliveryDonorContext {
  email: string | null;
  doNotEmail: boolean;
}

export interface ReceiptDeliveryOption {
  choice: ReceiptDeliveryChoice;
  available: boolean;
  blockedReason: string | null;
}

export function evaluateReceiptDeliveryOptions(input: {
  policy: TenantReceiptDeliveryPolicy;
  donor: ReceiptDeliveryDonorContext;
  actorCapabilities: string[];
}): {
  options: ReceiptDeliveryOption[];
  defaultChoice: ReceiptDeliveryChoice | null;
} {
  const { policy, donor, actorCapabilities } = input;

  let emailBlockedReason: string | null = null;
  if (!donor.email?.trim()) {
    emailBlockedReason = "The donor has no email address on file.";
  } else if (donor.doNotEmail) {
    emailBlockedReason =
      "The donor opted out of email; email receipts are blocked.";
  } else if (!actorCapabilities.includes(policy.emailCapability)) {
    emailBlockedReason = `Sending updated receipt emails requires ${policy.emailCapability}.`;
  }

  const pdfBlockedReason = actorCapabilities.includes(policy.pdfCapability)
    ? null
    : `Generating updated receipt PDFs requires ${policy.pdfCapability}.`;

  let deferBlockedReason: string | null = null;
  if (policy.requireDeliveryAction) {
    deferBlockedReason =
      "Deferring the updated receipt is not allowed; this organization requires email delivery or PDF generation for receipt-affecting corrections.";
  } else if (!policy.allowDefer) {
    deferBlockedReason =
      "Deferring the updated receipt is not allowed; this organization requires a receipt action for receipt-affecting corrections.";
  }

  const options: ReceiptDeliveryOption[] = [
    {
      choice: "email",
      available: emailBlockedReason === null,
      blockedReason: emailBlockedReason,
    },
    {
      choice: "pdf",
      available: pdfBlockedReason === null,
      blockedReason: pdfBlockedReason,
    },
    {
      choice: "defer",
      available: deferBlockedReason === null,
      blockedReason: deferBlockedReason,
    },
  ];

  const availability = new Map(
    options.map((option) => [option.choice, option.available]),
  );
  const fallbackOrder: ReceiptDeliveryChoice[] = [
    policy.defaultChoice,
    "pdf",
    "defer",
    "email",
  ];
  const defaultChoice =
    fallbackOrder.find((choice) => availability.get(choice)) ?? null;

  return { options, defaultChoice };
}

/**
 * Server-side validation of a staff delivery selection. The UI only shows
 * allowed choices, but policy enforcement never trusts client state.
 */
export function validateReceiptDeliverySelection(input: {
  policy: TenantReceiptDeliveryPolicy;
  donor: ReceiptDeliveryDonorContext;
  actorCapabilities: string[];
  selection: ReceiptDeliverySelection;
}): void {
  const { options } = evaluateReceiptDeliveryOptions(input);
  const option = options.find(
    (candidate) => candidate.choice === input.selection.choice,
  );
  if (!option) {
    throw new ApiHttpError(400, "Unknown receipt delivery choice.");
  }
  if (!option.available) {
    throw new ApiHttpError(
      option.blockedReason?.includes("requires") ? 403 : 400,
      option.blockedReason ?? "Receipt delivery choice unavailable.",
    );
  }

  if (
    input.selection.choice === "defer" &&
    input.policy.deferReasonRequired &&
    !input.selection.deferReason?.trim()
  ) {
    throw new ApiHttpError(
      400,
      "A reason is required when deferring the updated receipt.",
    );
  }
}

/**
 * The requester proposes a delivery action; the approver confirms or changes
 * it at approval time (ADR-CD-030). Both values stay visible in the result.
 */
export function resolveConfirmedReceiptDelivery(input: {
  proposal: ReceiptDeliverySelection | null;
  approverSelection: ReceiptDeliverySelection | null;
}): {
  requested: ReceiptDeliverySelection | null;
  confirmed: ReceiptDeliverySelection | null;
  changedByApprover: boolean;
} {
  const confirmed = input.approverSelection ?? input.proposal;
  const changedByApprover =
    input.approverSelection !== null &&
    input.proposal !== null &&
    (input.approverSelection.choice !== input.proposal.choice ||
      (input.approverSelection.deferReason ?? null) !==
        (input.proposal.deferReason ?? null));

  return {
    requested: input.proposal,
    confirmed: confirmed ?? null,
    changedByApprover,
  };
}

/**
 * A fully-resolved delivery selection as parsed from stored payloads —
 * `deferReason` is always materialized (`null` when absent).
 */
export type ResolvedReceiptDeliverySelection = ReceiptDeliverySelection & {
  deferReason: string | null;
};

/** Parses an untyped payload field into a delivery selection, if present. */
export function parseReceiptDeliverySelection(
  value: unknown,
): ResolvedReceiptDeliverySelection | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const choice = record.choice;
  if (choice !== "email" && choice !== "pdf" && choice !== "defer") {
    return null;
  }
  return {
    choice,
    deferReason:
      typeof record.deferReason === "string" ? record.deferReason : null,
  };
}

export interface ReceiptDeliveryOutcome {
  status: "emailed" | "pdf_generated" | "deferred" | "blocked" | "not_required";
  reason: string | null;
  snapshotId: string | null;
  affectedFields: string[];
  requested: ReceiptDeliverySelection | null;
  confirmed: ReceiptDeliverySelection | null;
}

/**
 * Versioned content stored in `contribution_receipt_snapshots.content` (#263).
 *
 * A snapshot is an immutable render input: everything the updated receipt
 * (email or PDF) communicates is captured at correction time, so later fund
 * renames or further corrections never rewrite what was sent to the donor.
 */
export interface ReceiptSnapshotDesignationLineV1 {
  id: string;
  amountCents: number;
  fundId: string | null;
  fundName: string;
  missionaryId: string | null;
  missionaryName: string | null;
  memo: string | null;
}

export interface ReceiptSnapshotContentV1 {
  version: 1;
  donationId: string;
  donorName: string;
  giftDate: string;
  currencyCode: string;
  effective: {
    amountCents: number;
    fundId: string | null;
    missionaryId: string | null;
    paymentStatus: string;
  };
  /** Every designation line, equally (ADR-CD-008) — no primary line. */
  designationLines: ReceiptSnapshotDesignationLineV1[];
  affectedFields: string[];
  adjustmentId: string | null;
  generatedAt: string;
}

/**
 * Structural subset of the contribution detail read model the snapshot
 * builder reads. Kept local (instead of importing `ContributionDetail`) so
 * this module stays leaf-level and easy to test.
 */
export interface ReceiptSnapshotSourceDetail {
  shared: {
    donationId: string;
    donorName: string;
    giftDate: string;
    currencyCode: string;
  };
  effective: {
    amountCents: number;
    fundId: string | null;
    missionaryId: string | null;
    paymentStatus: string;
  };
  designations: {
    lines: Array<{
      id: string;
      amountCents: number;
      fundId: string | null;
      fundName: string;
      missionaryId: string | null;
      missionaryName: string | null;
      memo: string | null;
    }>;
  };
}

export function buildReceiptSnapshotContent(input: {
  detail: ReceiptSnapshotSourceDetail;
  affectedFields: string[];
  adjustmentId: string | null;
  now?: Date;
}): ReceiptSnapshotContentV1 {
  const { detail } = input;

  return {
    version: 1,
    donationId: detail.shared.donationId,
    donorName: detail.shared.donorName,
    giftDate: detail.shared.giftDate,
    currencyCode: detail.shared.currencyCode,
    effective: {
      amountCents: detail.effective.amountCents,
      fundId: detail.effective.fundId,
      missionaryId: detail.effective.missionaryId,
      paymentStatus: detail.effective.paymentStatus,
    },
    designationLines: detail.designations.lines.map((line) => ({
      id: line.id,
      amountCents: line.amountCents,
      fundId: line.fundId,
      fundName: line.fundName,
      missionaryId: line.missionaryId,
      missionaryName: line.missionaryName,
      memo: line.memo,
    })),
    affectedFields: [...input.affectedFields],
    adjustmentId: input.adjustmentId,
    generatedAt: (input.now ?? new Date()).toISOString(),
  };
}

function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidAmountCents(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function parseSnapshotDesignationLine(
  value: unknown,
  index: number,
): ReceiptSnapshotDesignationLineV1 | null {
  if (!isJsonRecord(value)) {
    return null;
  }
  // A line without a numeric amount cannot represent financial truth; the
  // whole snapshot is rejected rather than rendering a wrong receipt.
  if (!isValidAmountCents(value.amountCents)) {
    return null;
  }

  return {
    id:
      typeof value.id === "string" && value.id.trim()
        ? value.id
        : `line-${index + 1}`,
    amountCents: value.amountCents,
    fundId: typeof value.fundId === "string" ? value.fundId : null,
    fundName:
      typeof value.fundName === "string" && value.fundName.trim()
        ? value.fundName
        : "General Fund",
    missionaryId:
      typeof value.missionaryId === "string" ? value.missionaryId : null,
    missionaryName:
      typeof value.missionaryName === "string" ? value.missionaryName : null,
    memo: typeof value.memo === "string" ? value.memo : null,
  };
}

/**
 * Tolerant parser for stored snapshot content. Legacy bare
 * `{ effective, designationLines }` rows (written before versioning) return
 * `null` — they lack the donor/gift identity a rendered receipt requires.
 */
export function parseReceiptSnapshotContent(
  value: unknown,
): ReceiptSnapshotContentV1 | null {
  if (!isJsonRecord(value) || value.version !== 1) {
    return null;
  }

  const donationId =
    typeof value.donationId === "string" && value.donationId.trim()
      ? value.donationId
      : null;
  const effective = value.effective;
  const rawLines = value.designationLines;
  if (!donationId || !isJsonRecord(effective) || !Array.isArray(rawLines)) {
    return null;
  }
  if (!isValidAmountCents(effective.amountCents)) {
    return null;
  }

  const designationLines: ReceiptSnapshotDesignationLineV1[] = [];
  for (const [index, rawLine] of rawLines.entries()) {
    const line = parseSnapshotDesignationLine(rawLine, index);
    if (!line) {
      return null;
    }
    designationLines.push(line);
  }

  return {
    version: 1,
    donationId,
    donorName:
      typeof value.donorName === "string" && value.donorName.trim()
        ? value.donorName
        : "Unknown donor",
    giftDate: typeof value.giftDate === "string" ? value.giftDate : "",
    currencyCode:
      typeof value.currencyCode === "string" && value.currencyCode.trim()
        ? value.currencyCode
        : "USD",
    effective: {
      amountCents: effective.amountCents,
      fundId: typeof effective.fundId === "string" ? effective.fundId : null,
      missionaryId:
        typeof effective.missionaryId === "string"
          ? effective.missionaryId
          : null,
      paymentStatus:
        typeof effective.paymentStatus === "string"
          ? effective.paymentStatus
          : "completed",
    },
    designationLines,
    affectedFields: Array.isArray(value.affectedFields)
      ? value.affectedFields.filter(
          (field): field is string => typeof field === "string",
        )
      : [],
    adjustmentId:
      typeof value.adjustmentId === "string" ? value.adjustmentId : null,
    generatedAt: typeof value.generatedAt === "string" ? value.generatedAt : "",
  };
}
