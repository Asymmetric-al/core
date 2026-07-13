/**
 * Shared payment status language for giving surfaces.
 *
 * One vocabulary for donor and Mission Control copy so payment states stay
 * truthful across rails. Two rules anchor everything here:
 *
 * 1. Stripe is the payment authority. Nothing is described as finally
 *    successful until Stripe's final payment status supports it — ACH Direct
 *    Debit and other delayed-notification rails stay "Processing" after
 *    checkout even though the donor experience already moved on.
 * 2. Donor copy is calm and free of payment internals. Workflow and recovery
 *    detail (dead letters, retries) is staff-only language.
 */

export type PaymentRail =
  | "card"
  | "ach_debit"
  | "wallet"
  | "instant_bank"
  | "unknown";

export type DonationPaymentState =
  | "requires_action"
  | "verification_required"
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "dead_letter";

export type PaymentStatusTone =
  | "positive"
  | "neutral"
  | "attention"
  | "destructive";

export interface PaymentStatusDescription {
  label: string;
  message: string;
  tone: PaymentStatusTone;
  isFinal: boolean;
}

export function isFinalPaymentSuccess(state: DonationPaymentState): boolean {
  return state === "completed";
}

function processingMessage(rail: PaymentRail, audience: Audience): string {
  if (rail === "ach_debit") {
    return audience === "donor"
      ? "Your bank transfer has started. ACH payments usually take a few business days to finish, and we will update your giving history once your bank confirms it."
      : "ACH Direct Debit accepted and processing. Final payment status arrives from Stripe; do not treat this gift as collected yet.";
  }

  return audience === "donor"
    ? "Your payment is being processed. We will update your giving history as soon as it finishes."
    : "Payment accepted and processing. Final payment status arrives from Stripe.";
}

type Audience = "donor" | "staff";

export interface DescribeDonationPaymentStatusInput {
  state: DonationPaymentState;
  rail?: PaymentRail;
  audience?: Audience;
}

export function describeDonationPaymentStatus({
  state,
  rail = "unknown",
  audience = "donor",
}: DescribeDonationPaymentStatusInput): PaymentStatusDescription {
  switch (state) {
    case "requires_action":
      return {
        label: "Action needed",
        message:
          audience === "donor"
            ? "Your payment needs one more step before it can continue. Please finish the prompt from your bank or card provider."
            : "Donor action required to authorize the payment (authorization checkpoint).",
        tone: "attention",
        isFinal: false,
      };
    case "verification_required":
      return {
        label: "Verify bank account",
        message:
          audience === "donor"
            ? "Your bank account needs a quick verification before this gift can continue. Please complete the verification step."
            : "Bank account verification checkpoint reached; the donor must verify before collection can proceed.",
        tone: "attention",
        isFinal: false,
      };
    case "pending":
      return {
        label: "Pending",
        message:
          audience === "donor"
            ? "Your gift has been received and is starting payment processing."
            : "Recorded and awaiting payment processing.",
        tone: "neutral",
        isFinal: false,
      };
    case "processing":
      return {
        label: "Processing",
        message: processingMessage(rail, audience),
        tone: "neutral",
        isFinal: false,
      };
    case "completed":
      return {
        label: "Completed",
        message:
          audience === "donor"
            ? "Your gift was collected successfully. Thank you!"
            : "Stripe confirmed final payment success.",
        tone: "positive",
        isFinal: true,
      };
    case "failed":
      return {
        label: "Failed",
        message:
          audience === "donor"
            ? "This payment did not go through. No funds were collected — you can try again or use a different payment method."
            : "Stripe confirmed the payment failed. No funds were collected.",
        tone: "destructive",
        isFinal: true,
      };
    case "refunded":
      return {
        label: "Refunded",
        message:
          audience === "donor"
            ? "This gift was refunded."
            : "Stripe confirmed the refund.",
        tone: "neutral",
        isFinal: true,
      };
    case "dead_letter":
      return audience === "staff"
        ? {
            label: "Needs attention",
            message:
              "Automatic recovery is exhausted for this payment work. Review and replay it manually; Stripe remains the source of payment truth.",
            tone: "destructive",
            isFinal: false,
          }
        : {
            label: "Not completed",
            message:
              "We could not finish processing this payment. Our team has been notified — no duplicate charges will occur.",
            tone: "attention",
            isFinal: false,
          };
  }
}

export type PledgeDisplayStatus = "active" | "paused" | "cancelled" | string;

export interface DescribePledgeStatusInput {
  status: PledgeDisplayStatus;
  failedChargeCount?: number | null;
}

/**
 * Recurring pledge display language. Collection distress (recent failed
 * charges that Stripe Billing is retrying) surfaces as an attention state
 * without inventing a new pledge status value.
 */
export function describePledgeStatus({
  status,
  failedChargeCount = 0,
}: DescribePledgeStatusInput): PaymentStatusDescription {
  if (status === "cancelled") {
    return {
      label: "Cancelled",
      message: "This recurring gift has ended.",
      tone: "neutral",
      isFinal: true,
    };
  }

  if (status === "paused") {
    return {
      label: "Paused",
      message: "This recurring gift is paused and will not be charged.",
      tone: "neutral",
      isFinal: false,
    };
  }

  if ((failedChargeCount ?? 0) > 0) {
    return {
      label: "Active",
      message:
        "The most recent payment did not go through. Stripe will retry automatically; you can also update the payment method.",
      tone: "attention",
      isFinal: false,
    };
  }

  return {
    label: "Active",
    message: "This recurring gift is active.",
    tone: "positive",
    isFinal: false,
  };
}
