import type {
  ContributionReceiptDeliveryContext,
  ReceiptDeliveryProposal,
  ReceiptDeliveryValue,
} from "./receipt-delivery-choice";
import type {
  ReceiptDeliveryChoice,
  ReceiptDeliveryOutcome,
} from "@asym/api/admin/contribution-operations";

export const RECEIPT_DELIVERY_CHOICE_LABELS: Record<
  ReceiptDeliveryChoice,
  string
> = {
  email: "Send updated receipt by email",
  pdf: "Generate updated receipt PDF",
  defer: "Don't send now (defer with reason)",
};

export function receiptDeliveryChoiceLabel(
  choice: ReceiptDeliveryChoice,
): string {
  return RECEIPT_DELIVERY_CHOICE_LABELS[choice];
}

function sentenceCaseWords(value: string): string {
  const words = value.replace(/[_-]+/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Receipt outcomes reported after an operation or approval decision. Keyed
 * by the server union so a new outcome status fails the type-check here.
 */
const RECEIPT_OUTCOME_STATUS_LABELS: Record<
  ReceiptDeliveryOutcome["status"],
  string
> = {
  emailed: "Emailed to the donor",
  pdf_generated: "PDF generated",
  deferred: "Deferred",
  blocked: "Blocked",
  not_required: "Not required",
  failed: "Failed",
};

function isKnownReceiptOutcomeStatus(
  status: string,
): status is ReceiptDeliveryOutcome["status"] {
  return Object.hasOwn(RECEIPT_OUTCOME_STATUS_LABELS, status);
}

/**
 * Takes a plain string because outcomes arrive as JSON; an unexpected value
 * still reads as words rather than snake_case.
 */
export function receiptOutcomeStatusLabel(status: string): string {
  return isKnownReceiptOutcomeStatus(status)
    ? RECEIPT_OUTCOME_STATUS_LABELS[status]
    : sentenceCaseWords(status);
}

/**
 * Receipt fields a correction changes, from `computeReceiptAffectedFields`,
 * as a phrase: "amount", "amount and designation", "a, b and c".
 * "designation" stays broad because missionary-only and designation-line
 * changes report it too.
 */
export function formatReceiptFieldList(fields: readonly string[]): string {
  const labels = fields.map((field) => field.replace(/[_-]+/g, " ").trim());
  if (labels.length <= 1) {
    return labels.join("");
  }
  return `${labels.slice(0, -1).join(", ")} and ${labels.at(-1) ?? ""}`;
}

/** Download URL for a generated updated-receipt PDF snapshot. */
export function receiptSnapshotPdfUrl(snapshotId: string): string {
  return `/api/admin/contribution-operations/receipt-snapshots/${encodeURIComponent(
    snapshotId,
  )}/pdf`;
}

/**
 * Initial form value: the requester's proposal when it is still available,
 * otherwise NO selection. The server default is shown as guidance, never
 * pre-selected — a receipt is never sent because a form field was silently
 * pre-filled and submitted untouched (the delivery choice is always an
 * explicit human decision).
 */
export function resolveInitialReceiptDeliveryValue(input: {
  receiptDelivery: ContributionReceiptDeliveryContext;
  proposal?: ReceiptDeliveryProposal | null;
}): ReceiptDeliveryValue {
  const availabilityByChoice = new Map(
    input.receiptDelivery.options.map((option) => [
      option.choice,
      option.available,
    ]),
  );
  const proposal = input.proposal ?? null;

  if (proposal && availabilityByChoice.get(proposal.choice)) {
    return { choice: proposal.choice, deferReason: proposal.deferReason ?? "" };
  }

  return { choice: null, deferReason: "" };
}

export function resolveReceiptDeliveryError(input: {
  receiptDelivery: ContributionReceiptDeliveryContext | null;
  value: ReceiptDeliveryValue;
}): string | null {
  const { receiptDelivery, value } = input;

  if (!receiptDelivery) {
    return null;
  }
  if (!value.choice) {
    return receiptDelivery.requireDeliveryAction
      ? "Choose how the updated receipt is delivered."
      : null;
  }
  if (
    value.choice === "defer" &&
    receiptDelivery.deferReasonRequired &&
    !value.deferReason.trim()
  ) {
    return "A reason is required when deferring the updated receipt.";
  }
  return null;
}
