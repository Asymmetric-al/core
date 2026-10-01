import type {
  ContributionReceiptDeliveryContext,
  ReceiptDeliveryProposal,
  ReceiptDeliveryValue,
} from "./receipt-delivery-choice";
import type { ReceiptDeliveryChoice } from "@asym/api/admin/contribution-operations";

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
