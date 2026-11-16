import type { ContributionActionType } from "./types";

export type OperationCategory =
  "correction" | "receipt" | "refund" | "crm" | "provider";

export interface OperationFieldValues {
  amountDollars?: string;
  fundId?: string;
  reason: string;
  confirmed: boolean;
}

export type SupportedOperationActionType = Extract<
  ContributionActionType,
  | "amount_correction"
  | "fund_correction"
  | "resend_receipt"
  | "refund"
  | "approve_staged_gift"
  | "retry_staged_gift"
  | "stripe_replay"
>;

export interface OperationDefinition {
  actionType: SupportedOperationActionType;
  title: string;
  description: string;
  category: OperationCategory;
  /** Risky-operation framing shown above the form (ADR-CD-033). */
  riskCopy: string | null;
  downstreamEffects: string[];
  requiresReason: boolean;
  requiresConfirmation: boolean;
  /** Which operation-specific inputs to render. */
  fields: Array<"amount" | "fundId">;
  /**
   * Receipt-visible fields this operation changes (AL-263). When non-empty
   * and the gift's receipt was already sent, the shell renders the updated
   * receipt delivery choice.
   */
  receiptFields: string[];
  buildPayload: (input: {
    values: OperationFieldValues;
    stagedGiftId: string | null;
  }) => Record<string, unknown>;
}

/**
 * One whole money amount as staff type it: optional "$", digits with
 * optional grouped thousands ("1,500"), and up to two decimal places.
 */
const AMOUNT_PATTERN = /^\$?(\d{1,3}(?:,\d{3})+|\d+)?(?:\.(\d{1,2}))?$/;

/**
 * The amount as exact integer cents, or null when the text is not one
 * whole amount. Strict on purpose: `parseFloat` read "1,500.00" as 1 and
 * "600abc" as 600, so a refund or correction could submit a different
 * amount than the one typed. The cents come from the digits (no floating
 * point), so "0.29" is 29, not 28.
 */
export function parseAmountToCents(text: string | undefined): number | null {
  const match = AMOUNT_PATTERN.exec((text ?? "").trim());
  if (!match) return null;
  const [, whole = "", fraction] = match;
  if (whole === "" && fraction === undefined) return null;
  const cents =
    Number(whole.replaceAll(",", "") || "0") * 100 +
    Number((fraction ?? "").padEnd(2, "0") || "0");
  return Number.isSafeInteger(cents) ? cents : null;
}

function dollarsToCents(amountDollars: string | undefined): number {
  const cents = parseAmountToCents(amountDollars);
  if (cents === null) {
    // The shell validates the amount before it builds a payload; a payload
    // is never built from text that is not one whole amount.
    throw new Error("The amount is not a valid money amount.");
  }
  return cents;
}

export const OPERATION_DEFINITIONS: Record<
  SupportedOperationActionType,
  OperationDefinition
> = {
  amount_correction: {
    actionType: "amount_correction",
    title: "Correct gift amount",
    description:
      "Records an adjustment with the corrected amount. The original donation history is preserved.",
    category: "correction",
    riskCopy:
      "This changes the gift's effective amount everywhere it appears, including receipts and reports. High-risk corrections may require approval.",
    downstreamEffects: [
      "Effective amount changes in CRM, the Contributions Hub, and reports.",
      "A sent receipt becomes receipt-affected and may need an updated receipt.",
    ],
    requiresReason: true,
    requiresConfirmation: true,
    fields: ["amount"],
    receiptFields: ["amount"],
    buildPayload: ({ values }) => ({
      amount: dollarsToCents(values.amountDollars),
    }),
  },
  fund_correction: {
    actionType: "fund_correction",
    title: "Correct fund designation",
    description:
      "Moves this gift's designation to a different fund through an audited adjustment.",
    category: "correction",
    riskCopy:
      "Changing the fund affects donor intent records, receipts, and CRM reporting. High-risk corrections may require approval.",
    downstreamEffects: [
      "Designation summary changes in CRM and the Contributions Hub.",
      "CRM records and receipts may need follow-up.",
    ],
    requiresReason: true,
    requiresConfirmation: true,
    fields: ["fundId"],
    receiptFields: ["designation"],
    buildPayload: ({ values }) => ({ fundId: values.fundId || null }),
  },
  resend_receipt: {
    actionType: "resend_receipt",
    title: "Send receipt",
    description: "Sends the gift receipt to the donor again.",
    category: "receipt",
    riskCopy: null,
    downstreamEffects: ["The donor receives a receipt email."],
    requiresReason: false,
    requiresConfirmation: false,
    fields: [],
    receiptFields: [],
    buildPayload: () => ({}),
  },
  refund: {
    actionType: "refund",
    title: "Refund gift",
    description:
      "Refunds the donor through the payment provider. Refunds follow tenant approval policy.",
    category: "refund",
    riskCopy:
      "Money moves back to the donor. This cannot be undone and may require approval before it executes.",
    downstreamEffects: [
      "Refund state changes in CRM, the Contributions Hub, and donor history.",
      "The provider charge is refunded for the entered amount.",
    ],
    requiresReason: true,
    requiresConfirmation: true,
    fields: ["amount"],
    receiptFields: [],
    buildPayload: ({ values }) => ({
      amount: dollarsToCents(values.amountDollars),
    }),
  },
  approve_staged_gift: {
    actionType: "approve_staged_gift",
    title: "CRM posting unavailable",
    description:
      "Recorded posting state is historical while CRM data is maintained in Asym.",
    category: "crm",
    riskCopy: null,
    downstreamEffects: [],
    requiresReason: false,
    requiresConfirmation: false,
    fields: [],
    receiptFields: [],
    buildPayload: () => ({}),
  },
  retry_staged_gift: {
    actionType: "retry_staged_gift",
    title: "CRM posting unavailable",
    description:
      "Recorded posting failures are historical while CRM data is maintained in Asym.",
    category: "crm",
    riskCopy: null,
    downstreamEffects: [],
    requiresReason: false,
    requiresConfirmation: false,
    fields: [],
    receiptFields: [],
    buildPayload: () => ({}),
  },
  stripe_replay: {
    actionType: "stripe_replay",
    title: "Replay provider webhook",
    description:
      "Replays the stored provider event for technical recovery. Role-gated and audited.",
    category: "provider",
    riskCopy:
      "Provider replay is a technical operation. It is idempotent and audited, but should only be used to recover missed events.",
    downstreamEffects: ["The stored provider event is reprocessed."],
    requiresReason: true,
    requiresConfirmation: true,
    fields: [],
    receiptFields: [],
    buildPayload: () => ({}),
  },
};

export const OPERATION_CATEGORY_LABELS: Record<OperationCategory, string> = {
  correction: "Correction",
  receipt: "Receipt",
  refund: "Refund",
  crm: "Historical CRM",
  provider: "Provider / Admin",
};

const CONTRIBUTION_ACTION_TITLES: Record<ContributionActionType, string> = {
  resend_receipt: OPERATION_DEFINITIONS.resend_receipt.title,
  approve_staged_gift: OPERATION_DEFINITIONS.approve_staged_gift.title,
  retry_staged_gift: OPERATION_DEFINITIONS.retry_staged_gift.title,
  crm_repost: "Repost to CRM",
  metadata_update: "Update metadata",
  refund: OPERATION_DEFINITIONS.refund.title,
  donor_relink: "Relink donor",
  amount_correction: OPERATION_DEFINITIONS.amount_correction.title,
  designation_correction: "Correct designation",
  fund_correction: OPERATION_DEFINITIONS.fund_correction.title,
  allocation_correction: "Correct allocation",
  receipt_correction: "Correct receipt",
  statement_correction: "Correct statement",
  payment_state_correction: "Correct payment state",
  stripe_replay: OPERATION_DEFINITIONS.stripe_replay.title,
};

const CONTRIBUTION_ACTION_NAMES: Record<ContributionActionType, string> = {
  ...CONTRIBUTION_ACTION_TITLES,
  approve_staged_gift: "CRM approval/posting",
  retry_staged_gift: "CRM posting retry",
};

export function contributionActionTitle(
  actionType: ContributionActionType,
): string {
  return CONTRIBUTION_ACTION_TITLES[actionType];
}

export function contributionActionName(
  actionType: ContributionActionType,
): string {
  return CONTRIBUTION_ACTION_NAMES[actionType];
}

export function operationDefinitionFor(
  actionType: SupportedOperationActionType,
): OperationDefinition {
  return OPERATION_DEFINITIONS[actionType];
}

/** Payment states the server treats as settled for receipts and refunds. */
export function isCompletedContributionPaymentStatus(
  paymentStatus: string | null,
): boolean {
  const normalizedStatus = paymentStatus?.toLowerCase() ?? null;

  return (
    normalizedStatus === "completed" ||
    normalizedStatus === "succeeded" ||
    normalizedStatus === "success"
  );
}

export interface ContributionReceiptSendBlock {
  blockedReason: string;
  nextStep: string;
}

/**
 * Why a receipt cannot be sent for a gift that has a staged gift record, or
 * null when it can. The server's `resend_receipt` availability applies this
 * rule, and it lives here (a client-safe module) so the Hub's bulk receipt
 * dialog counts exactly the gifts the server would receipt.
 */
export function getContributionReceiptSendBlock(input: {
  receiptStatus: string | null;
  paymentStatus: string | null;
}): ContributionReceiptSendBlock | null {
  if (input.receiptStatus === "suppressed") {
    return {
      blockedReason: "Receipts are suppressed for this gift.",
      nextStep:
        "Review the donor's receipt preference before sending donor communication.",
    };
  }

  if (!isCompletedContributionPaymentStatus(input.paymentStatus)) {
    return {
      blockedReason: "The payment is not completed yet.",
      nextStep: "Receipts can be sent once the gift payment completes.",
    };
  }

  return null;
}
