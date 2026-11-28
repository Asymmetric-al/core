export const CHECKOUT_WORDS = {
  unavailable: "Giving here is unavailable right now. Nothing was charged.",
  unavailableUnconfirmed:
    "Giving here is unavailable right now, and we could not confirm what happened to your payment. Check your card or bank statement before you give again.",
  amountInvalid: "Enter the amount in dollars, like 25 or 1,000.50.",
  paymentCancelled:
    "This payment was cancelled, so your card wasn't charged. You can start the gift again here.",
  notStarted:
    "Your payment didn't start, and your card wasn't charged. Please try again.",
  challenge:
    "We couldn't finish our quick security check. Your card wasn't charged. Please try again.",
  signInRequired:
    "Your sign-in has ended. Your card wasn't charged. Sign in again to give from your account, or give as a guest.",
  signInRequiredNoGuest:
    "Your sign-in has ended. Your card wasn't charged. Sign in again to give from your account.",
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
  targetNotFound:
    "This ministry can't accept that designation. You haven't been charged.",
  addressBucket:
    "Many people are giving from this network. Your card wasn't charged. Your details are saved: try again in a minute.",
  personBucket:
    "You've started several gifts recently. Your card wasn't charged. Try again in a few minutes.",
  declined:
    "Your card was declined, and you haven't been charged. Check the card details or try another card.",
  cardCheckUnfinished:
    "Your bank's card check wasn't finished, so your card wasn't charged. You can try again.",
  accountChanged:
    "This ministry's payment details changed while you were giving. Nothing was charged. Reload this page to give.",
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

function money(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export function amountOutOfRange(
  minCents: number,
  maxCents: number,
  currency: string,
): string {
  return `Online gifts must be between ${money(minCents, currency)} and ${money(maxCents, currency)}. Your card wasn't charged.`;
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

export function intakeRefusalWords(
  refusal: IntakeRefusal,
  keyHeld = false,
  guestOffered = true,
): string {
  const { status, error } = refusal;
  if (status === 429)
    return refusal.bucket === "person"
      ? CHECKOUT_WORDS.personBucket
      : CHECKOUT_WORDS.addressBucket;
  if (status === 401)
    return guestOffered
      ? CHECKOUT_WORDS.signInRequired
      : CHECKOUT_WORDS.signInRequiredNoGuest;
  if (error === "giving_unavailable")
    return keyHeld
      ? CHECKOUT_WORDS.unavailableUnconfirmed
      : CHECKOUT_WORDS.unavailable;
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
    typeof refusal.maxCents === "number" &&
    typeof refusal.currency === "string" &&
    refusal.currency.length === 3
  )
    return amountOutOfRange(
      refusal.minCents,
      refusal.maxCents,
      refusal.currency,
    );
  if (DETAIL_REFUSALS.has(error) || error === "amount_out_of_range")
    return CHECKOUT_WORDS.detailsRefused;
  return CHECKOUT_WORDS.notStarted;
}

export type HeldPayment = {
  status: string;
  last_payment_error?: { code?: string; type?: string } | null;
};

export const FINAL_STATES = new Set(["succeeded", "processing"]);

export function paymentStateNotice(payment: HeldPayment): CheckoutNotice {
  const { status } = payment;
  if (status === "succeeded")
    return { tone: "success", text: CHECKOUT_WORDS.received };
  if (status === "processing")
    return { tone: "info", text: CHECKOUT_WORDS.pending };
  if (status === "canceled")
    return { tone: "error", text: CHECKOUT_WORDS.paymentCancelled };
  if (status === "requires_action")
    return { tone: "error", text: CHECKOUT_WORDS.cardCheckUnfinished };
  if (
    status === "requires_payment_method" &&
    payment.last_payment_error?.code === "payment_intent_authentication_failure"
  )
    return { tone: "error", text: CHECKOUT_WORDS.cancelled };
  if (status === "requires_payment_method" && payment.last_payment_error)
    return { tone: "error", text: CHECKOUT_WORDS.declined };
  return { tone: "error", text: CHECKOUT_WORDS.notStarted };
}
