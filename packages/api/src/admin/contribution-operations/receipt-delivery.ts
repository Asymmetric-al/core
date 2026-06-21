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
}): { options: ReceiptDeliveryOption[]; defaultChoice: ReceiptDeliveryChoice } {
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

  const deferBlockedReason = policy.allowDefer
    ? null
    : "Deferring the updated receipt is not allowed; this organization requires a receipt action for receipt-affecting corrections.";

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
    fallbackOrder.find((choice) => availability.get(choice)) ??
    policy.defaultChoice;

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

/** Parses an untyped payload field into a delivery selection, if present. */
export function parseReceiptDeliverySelection(
  value: unknown,
): ReceiptDeliverySelection | null {
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
