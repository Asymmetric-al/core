import type { ContributionActionType } from "./types";

export type OperationCategory =
  | "correction"
  | "receipt"
  | "refund"
  | "crm"
  | "provider";

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

function dollarsToCents(amountDollars: string | undefined): number {
  return Math.round(Number.parseFloat(amountDollars || "0") * 100);
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
