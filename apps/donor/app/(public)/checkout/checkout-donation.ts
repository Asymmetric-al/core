/**
 * Pure, framework-free state logic for the donor checkout → POST /api/donate wiring.
 *
 * Public-issue requirement: **checkout success must be confirmed by Stripe
 * PaymentIntent state.** A successful `/api/donate` response only proves that the
 * donation saga initialized a donation + PaymentIntent. The final success screen
 * is gated by Stripe confirmation in live mode, never by the initialization
 * response alone.
 */

export type DonateRequestBody = {
  amount: number;
  currency: string;
  missionary_id?: string;
  fund_id?: string;
};

/** Donation state initialized by the saga on a 200. */
export type ServerDonation = {
  donationId: string;
  paymentIntentId: string | null;
  clientSecret: string | null;
};

export type DonateResult =
  | { kind: "initialized"; donation: ServerDonation }
  | { kind: "processing"; donationId: string | null }
  | { kind: "error"; message: string };

/** Live vs test-mode is decided solely by the presence of a publishable key. */
export type CheckoutMode = "live" | "test";
export type CheckoutFrequency = "one-time" | "monthly";
export type CheckoutPaymentMethod = "card" | "ach" | "wallet";

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
 * Build the POST /api/donate body from checkout inputs, matching
 * `donatePostSchema` in `@asym/api`. Blank/null designations are omitted so the
 * server-side `refine` (missionary_id OR fund_id required) governs validity.
 */
export function buildDonateRequestBody(input: {
  amount: number;
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

/**
 * Deterministic immutable attempt fingerprint. The idempotency key may only be
 * reused when every field that could alter the checkout attempt still matches.
 */
export function buildCheckoutRequestFingerprint(
  input: CheckoutRequestFingerprintInput,
): string {
  return JSON.stringify({
    amount: normalizeMoneyAmount(input.amount),
    coverFees: input.coverFees,
    currency: normalizeStringField(input.currency).toLowerCase() || "usd",
    donorEmail: normalizeStringField(input.donorEmail).toLowerCase(),
    donorFirstName: normalizeStringField(input.donorFirstName),
    donorLastName: normalizeStringField(input.donorLastName),
    endDate: normalizeStringField(input.endDate),
    frequency: input.frequency ?? "one-time",
    fundId: normalizeStringField(input.fundId),
    missionaryId: normalizeStringField(input.missionaryId),
    paymentMethod: input.paymentMethod,
    startDate: normalizeStringField(input.startDate),
  });
}

export function resolveCheckoutIdempotencyKey({
  currentFingerprint,
  existingFingerprint,
  existingKey,
  generateKey,
}: ResolveIdempotencyKeyInput): ResolveIdempotencyKeyResult {
  if (existingKey && existingFingerprint === currentFingerprint) {
    return {
      idempotencyKey: existingKey,
      isNewKey: false,
    };
  }

  return {
    idempotencyKey: generateKey(),
    isNewKey: true,
  };
}

const readString = (body: unknown, key: string): string | null => {
  if (!body || typeof body !== "object") return null;
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
};

/**
 * Interpret the saga's HTTP response into an initialization result.
 *
 * A 200 with a non-empty `donationId` means the server initialized the donation
 * and PaymentIntent. It is not final payment confirmation.
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
        message: "Payment could not be confirmed by the server.",
      };
    }
    return {
      kind: "initialized",
      donation: {
        donationId,
        paymentIntentId: readString(body, "paymentIntentId"),
        clientSecret: readString(body, "clientSecret"),
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
  return status === "succeeded" || status === "processing";
}

/**
 * Live checkout requires a Stripe publishable key to mount Elements and confirm
 * the PaymentIntent. With no key on the box we run TEST-MODE: the saga call +
 * server-confirmed state are exercised, but the card capture leg is stubbed and
 * staged unverified-for-live (BLOCKED-FOR-CREDS).
 */
export function resolveCheckoutMode(
  publishableKey: string | null | undefined,
): CheckoutMode {
  return trimToUndefined(publishableKey) ? "live" : "test";
}
