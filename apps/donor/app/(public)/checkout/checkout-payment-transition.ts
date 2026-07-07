import type { DonationPaymentState } from "@asym/lib/payments/payment-status-language";

export type CheckoutPaymentMethod = "card" | "ach" | "wallet";
export type CheckoutPaymentTransitionStep = "payment" | "success";

export interface StagedCheckoutPaymentTransition {
  paymentState: DonationPaymentState;
  nextStep: CheckoutPaymentTransitionStep;
  showConfirmation: boolean;
}

export function getStagedCheckoutPaymentTransition(
  paymentMethod: CheckoutPaymentMethod,
): StagedCheckoutPaymentTransition {
  if (paymentMethod === "ach") {
    return {
      paymentState: "processing",
      nextStep: "success",
      showConfirmation: true,
    };
  }

  return {
    paymentState: "pending",
    nextStep: "payment",
    showConfirmation: false,
  };
}
