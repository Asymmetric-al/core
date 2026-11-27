import { formatCurrency } from "@asym/lib/utils";

export const CHECKOUT_WORDS = {
  configUnavailable:
    "We can't take this gift online right now. It may be the designation you chose, or online giving may be paused. You haven't been charged.",
  intakeUnavailable:
    "This ministry can't take gifts online here right now. You haven't been charged.",
  notStarted:
    "Your payment didn't start, and your card wasn't charged. Please try again.",
  challenge:
    "We couldn't finish our quick security check. Your card wasn't charged. Please try again.",
  signInRequired:
    "Your sign-in has ended. Your card wasn't charged. Sign in again to give from your account, or give as a guest.",
  oneEntityNotice:
    "Each gift goes to one legal entity of this ministry. Designations of different entities need separate gifts.",
  linesSpanEntities:
    "These designations belong to different legal entities, so they can't be in one gift. Your card wasn't charged. Please give to each one separately.",
  contactRequired:
    "Please enter a valid email address. Your card wasn't charged.",
  detailsRefused:
    "We couldn't accept these gift details. Your card wasn't charged. Please reload the page and try again.",
  actorRefused:
    "We couldn't use your sign-in for this gift. Your card wasn't charged. You can give as a guest instead.",
  keyReused:
    "This gift was already started with different details, so nothing was charged this time. If you gave a moment ago, check that gift before you start again.",
  giftClosed:
    "This payment can no longer be completed, and your card wasn't charged. Your details are saved: start the gift again.",
  received: "Your gift was received.",
  claimOffer: "Verify your email to claim your giving history.",
  targetNotFound:
    "This ministry can't accept that designation. You haven't been charged.",
  addressBucket:
    "Many people are giving from this network. Your card wasn't charged. Your details are saved: try again in a minute.",
  personBucket:
    "You've started several gifts recently. Your card wasn't charged. Try again in a few minutes.",
  declined:
    "Your card was declined, and you haven't been charged. Check the card details or try another card.",
  pending: "Your payment is processing. You don't need to keep this page open.",
  cancelled:
    "The card check was cancelled, so your card wasn't charged. You can try again.",
  lostConnection:
    "We lost the connection before we could confirm your payment. Reload this page to see whether your gift went through before you try again.",
  monthly:
    "Monthly giving isn't available online yet. You can give once now instead.",
  chooseDesignation:
    "Choose a missionary or project to give to, then come back to give.",
} as const;

export type CheckoutNotice = {
  tone: "info" | "error" | "success";
  text: string;
};

export function amountOutOfRange(minCents: number, maxCents: number): string {
  return `Online gifts must be between ${formatCurrency(minCents / 100)} and ${formatCurrency(maxCents / 100)}. Your card wasn't charged.`;
}

const DETAIL_REFUSALS = new Set([
  "invalid_request",
  "reserved_fund_line",
  "client_key_invalid",
  "source_site_not_admitted",
  "fee_cover_out_of_range",
]);

export type IntakeRefusal = {
  status: number;
  error: string;
  bucket?: string;
  minCents?: number;
  maxCents?: number;
  currency?: string;
};

export function intakeRefusalWords(refusal: IntakeRefusal): string {
  const { status, error } = refusal;
  if (status === 429)
    return refusal.bucket === "person"
      ? CHECKOUT_WORDS.personBucket
      : CHECKOUT_WORDS.addressBucket;
  if (status === 401) return CHECKOUT_WORDS.signInRequired;
  if (error === "giving_unavailable") return CHECKOUT_WORDS.intakeUnavailable;
  if (error === "payment_not_started") return CHECKOUT_WORDS.notStarted;
  if (error === "challenge_required" || error === "challenge_failed")
    return CHECKOUT_WORDS.challenge;
  if (error === "lines_span_entities") return CHECKOUT_WORDS.linesSpanEntities;
  if (error === "target_not_found") return CHECKOUT_WORDS.targetNotFound;
  if (error === "contact_required") return CHECKOUT_WORDS.contactRequired;
  if (error === "actor_not_admitted" || error === "actor_required")
    return CHECKOUT_WORDS.actorRefused;
  if (error === "idempotency_key_reused") return CHECKOUT_WORDS.keyReused;
  if (error === "gift_closed") return CHECKOUT_WORDS.giftClosed;
  if (error === "gift_already_completed") return CHECKOUT_WORDS.received;
  if (
    error === "amount_out_of_range" &&
    typeof refusal.minCents === "number" &&
    typeof refusal.maxCents === "number"
  )
    return amountOutOfRange(refusal.minCents, refusal.maxCents);
  if (DETAIL_REFUSALS.has(error) || error === "amount_out_of_range")
    return CHECKOUT_WORDS.detailsRefused;
  return CHECKOUT_WORDS.notStarted;
}

export type PaymentState =
  "succeeded" | "processing" | "requires_payment_method" | "canceled" | string;

export function paymentStateNotice(state: PaymentState): CheckoutNotice {
  if (state === "succeeded")
    return { tone: "success", text: CHECKOUT_WORDS.received };
  if (state === "processing")
    return { tone: "info", text: CHECKOUT_WORDS.pending };
  if (state === "canceled")
    return { tone: "error", text: CHECKOUT_WORDS.giftClosed };
  return { tone: "error", text: CHECKOUT_WORDS.declined };
}
