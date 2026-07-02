import { SETTLED_DONATION_STATUSES } from "../../reads/settled-donation-statuses";
import { ApiHttpError } from "../../shared/http-errors";

const PAYMENT_STATE_CORRECTION_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
  "refunded",
  ...SETTLED_DONATION_STATUSES,
] as const;

export type PaymentStateCorrectionStatus =
  (typeof PAYMENT_STATE_CORRECTION_STATUSES)[number];

const paymentStateCorrectionStatusSet = new Set<string>(
  PAYMENT_STATE_CORRECTION_STATUSES,
);

export function isAllowedPaymentStateCorrectionStatus(
  status: string,
): status is PaymentStateCorrectionStatus {
  return paymentStateCorrectionStatusSet.has(status);
}

export function assertAllowedPaymentStateCorrectionStatus(status: string) {
  if (!isAllowedPaymentStateCorrectionStatus(status)) {
    throw new ApiHttpError(
      400,
      `status must be one of: ${PAYMENT_STATE_CORRECTION_STATUSES.join(", ")}.`,
    );
  }
}
