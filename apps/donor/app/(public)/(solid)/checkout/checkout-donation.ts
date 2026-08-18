/**
 * Guest Giving checkout adapter for POST /api/donate.
 *
 * Checkout stays a thin adapter: Gift processing-fee policy lives in Core
 * (`@asym/api/donate/fee-policy`). This module converts dollars ↔ cents and
 * posts the donor-entered gift plus cover-fees flags. The server recomputes
 * charged cents and never trusts a client-computed total.
 *
 * Public-issue requirement: **checkout success must be confirmed by Stripe
 * PaymentIntent state.** A successful `/api/donate` response only proves that the
 * donation saga initialized a donation + PaymentIntent. The final success screen
 * is gated by Stripe confirmation in live mode, never by the initialization
 * response alone.
 */

import { quoteGiftProcessingFee } from "@asym/api/donate/fee-policy";

export type DonateRequestBody = {
  amount: number;
  currency: string;
  cover_fees: boolean;
  payment_method: CheckoutPaymentMethod;
  missionary_id?: string;
  fund_id?: string;
};

/** Donation state initialized by the saga on a 200. */
export type ServerDonation = {
  donationId: string;
  paymentIntentId: string | null;
  clientSecret: string | null;
  publishableKey: string | null;
};

export type DonateResult =
  | { kind: "initialized"; donation: ServerDonation }
  | { kind: "processing"; donationId: string | null }
  | { kind: "error"; message: string };

/** Runtime checkout is live only with a publishable key; test mode is for explicit test overrides. */
export type CheckoutMode = "live" | "test";
export type CheckoutFrequency = "one-time" | "monthly";
export type CheckoutPaymentMethod = "card" | "ach" | "wallet";

export type GuestGivingCheckoutFeeQuote = {
  giftAmount: number;
  coverAmount: number;
  chargedAmount: number;
  estimatedStripeFee: number;
  coverFees: boolean;
  paymentMethod: CheckoutPaymentMethod;
};

export type CheckoutRequestFingerprintInput = {
  amount: number;
  coverFees: boolean;
  currency?: string | null;
  donorEmail?: string | null;
  donorFirstName?: string | null;
  donorLastName?: string | null;
  endDate?: string | null;
  frequency?: CheckoutFrequency | null;
  fundId?: string | null;
  missionaryId?: string | null;
  paymentMethod: CheckoutPaymentMethod;
  postalCode?: string | null;
  startDate?: string | null;
};

export type ResolveIdempotencyKeyInput = {
  currentFingerprint: string;
  existingFingerprint: string | null;
  existingKey: string | null;
  generateKey: () => string;
};

export type ResolveIdempotencyKeyResult = {
  idempotencyKey: string;
  isNewKey: boolean;
};

const trimToUndefined = (
  value: string | null | undefined,
): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

/**
 * Convert Guest Giving dollars into Core's Gift processing-fee quote.
 * Amounts below one cent quote as zero so the config step can render before
 * the donor types a gift.
 */
export function quoteGuestGivingCheckoutFees(input: {
  giftAmount: number;
  coverFees: boolean;
  paymentMethod: CheckoutPaymentMethod;
}): GuestGivingCheckoutFeeQuote {
  const giftAmountCents = Math.round(input.giftAmount * 100);
  if (!Number.isFinite(input.giftAmount) || giftAmountCents < 1) {
    return {
      giftAmount: 0,
      coverAmount: 0,
      chargedAmount: 0,
      estimatedStripeFee: 0,
      coverFees: input.coverFees,
      paymentMethod: input.paymentMethod,
    };
  }

  const quote = quoteGiftProcessingFee({
    giftAmountCents,
    coverFees: input.coverFees,
    paymentMethod: input.paymentMethod,
  });

  return {
    giftAmount: quote.giftAmountCents / 100,
    coverAmount: quote.coverAmountCents / 100,
    chargedAmount: quote.chargedAmountCents / 100,
    estimatedStripeFee: quote.estimatedStripeFeeCents / 100,
    coverFees: quote.coverFees,
    paymentMethod: quote.paymentMethod,
  };
}

/**
 * Build the POST /api/donate body from checkout inputs, matching
 * `donatePostSchema` in `@asym/api`. `amount` is the donor-entered gift, not
 * the grossed-up charge. Blank/null designations are omitted so general giving
 * posts no designation fields.
 */
export function buildDonateRequestBody(input: {
  amount: number;
  coverFees: boolean;
  paymentMethod: CheckoutPaymentMethod;
  currency?: string | null;
  missionaryId?: string | null;
  fundId?: string | null;
}): DonateRequestBody {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Donation amount must be greater than 0");
  }

  const body: DonateRequestBody = {
    amount: input.amount,
    currency: trimToUndefined(input.currency) ?? "usd",
    cover_fees: input.coverFees,
    payment_method: input.paymentMethod,
  };

  const missionaryId = trimToUndefined(input.missionaryId);
  if (missionaryId) body.missionary_id = missionaryId;

  const fundId = trimToUndefined(input.fundId);
  if (fundId) body.fund_id = fundId;

  return body;
}

const normalizeStringField = (value: string | null | undefined): string =>
  trimToUndefined(value) ?? "";

const normalizeMoneyAmount = (value: number): number => {
  if (!Number.isFinite(value)) {
    throw new Error("Donation fingerprint amount must be finite");
  }

  return Number(value.toFixed(2));
};

/**
 * Checkout currently routes through one-time `/api/donate` only. Monthly query
 * params are accepted for backwards-compatible links, but coerced to one-time so
 * the UI and request path cannot imply recurring billing.
 */
export function normalizeCheckoutFrequency(
  value: string | null | undefined,
): "one-time" {
  void value;
  return "one-time";
}

export function buildCheckoutRequestFingerprint(
  input: CheckoutRequestFingerprintInput,
): string {
  return JSON.stringify({
    amount: normalizeMoneyAmount(input.amount),
    coverFees: input.coverFees,
    currency: normalizeStringField(input.currency).toLowerCase(),
    donorEmail: normalizeStringField(input.donorEmail).toLowerCase(),
    donorFirstName: normalizeStringField(input.donorFirstName),
    donorLastName: normalizeStringField(input.donorLastName),
    endDate: normalizeStringField(input.endDate),
    frequency: normalizeCheckoutFrequency(input.frequency),
    fundId: normalizeStringField(input.fundId),
    missionaryId: normalizeStringField(input.missionaryId),
    paymentMethod: input.paymentMethod,
    postalCode: normalizeStringField(input.postalCode),
    startDate: normalizeStringField(input.startDate),
  });
}

export function resolveCheckoutIdempotencyKey(
  input: ResolveIdempotencyKeyInput,
): ResolveIdempotencyKeyResult {
  if (
    input.existingKey &&
    input.existingFingerprint === input.currentFingerprint
  ) {
    return { idempotencyKey: input.existingKey, isNewKey: false };
  }

  return { idempotencyKey: input.generateKey(), isNewKey: true };
}

const readString = (body: unknown, key: string): string | null => {
  if (!body || typeof body !== "object") return null;
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
};

/**
 * Map POST /api/donate HTTP results onto checkout states.
 *
 * 200 = saga initialized a donation + PaymentIntent (not paid).
 * 202 = saga still processing; retry with the same idempotency key.
 * Anything else is an error the donor can retry from.
 */
export function interpretDonateResponse(
  status: number,
  body: unknown,
): DonateResult {
  if (status === 200) {
    const donationId = trimToUndefined(readString(body, "donationId"));
    if (!donationId) {
      return {
        kind: "error",
        message:
          "Donation initialized without an identifier. Please try again.",
      };
    }

    return {
      kind: "initialized",
      donation: {
        donationId,
        paymentIntentId:
          trimToUndefined(readString(body, "paymentIntentId")) ?? null,
        clientSecret: trimToUndefined(readString(body, "clientSecret")) ?? null,
        publishableKey:
          trimToUndefined(readString(body, "publishableKey")) ?? null,
      },
    };
  }

  if (status === 202) {
    return {
      kind: "processing",
      donationId: trimToUndefined(readString(body, "donationId")) ?? null,
    };
  }

  return {
    kind: "error",
    message:
      trimToUndefined(readString(body, "error")) ??
      "Something went wrong processing your contribution. Please try again.",
  };
}

export function isDonationInitialized(
  result: DonateResult,
): result is Extract<DonateResult, { kind: "initialized" }> {
  return result.kind === "initialized";
}

export function isStripeFinalCheckoutSuccess(
  status: string | null | undefined,
): boolean {
  return status === "succeeded";
}

/**
 * Live checkout requires a Stripe publishable key to mount Elements and confirm
 * the PaymentIntent. A missing runtime key must be handled as configuration
 * failure before checkout posts. The `test` mode result is reserved for explicit
 * test-only overrides that intentionally bypass live Stripe Elements.
 */
export function resolveCheckoutMode(
  publishableKey: string | null | undefined,
): CheckoutMode {
  return trimToUndefined(publishableKey) ? "live" : "test";
}
