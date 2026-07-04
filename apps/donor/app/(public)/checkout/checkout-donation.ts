/**
 * Pure, framework-free state logic for the donor checkout → POST /api/donate wiring.
 *
 * Public-issue requirement: **checkout success must be confirmed by server-side
 * donation state.** The success screen is therefore gated on a real `donationId`
 * returned by the donation saga — never on a client-side timer. All of the
 * decision logic lives here so it can be unit-tested without React, network, or
 * Stripe creds.
 *
 * The Stripe PaymentIntent *confirmation* (turning the saga's `clientSecret` into
 * a captured charge via Stripe Elements) is Tier-3 and needs creds that do not
 * exist on this box — see `resolveCheckoutMode`. This module wires the saga call
 * and server-confirmed state; the capture leg is stubbed behind TEST-MODE.
 */

export type DonateRequestBody = {
  amount: number;
  currency: string;
  missionary_id?: string;
  fund_id?: string;
};

/** Server-confirmed donation state returned by the saga on a 200. */
export type ServerDonation = {
  donationId: string;
  paymentIntentId: string | null;
  clientSecret: string | null;
};

export type DonateResult =
  | { kind: "confirmed"; donation: ServerDonation }
  | { kind: "processing"; donationId: string | null }
  | { kind: "error"; message: string };

/** Live vs test-mode is decided solely by the presence of a publishable key. */
export type CheckoutMode = "live" | "test";

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

const readString = (body: unknown, key: string): string | null => {
  if (!body || typeof body !== "object") return null;
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
};

/**
 * Interpret the saga's HTTP response into a server-confirmed result.
 *
 * A checkout is `confirmed` ONLY when the server returns 200 with a non-empty
 * `donationId` — the server-side proof that the donation row exists and the
 * PaymentIntent was initialized. A 200 that lacks a donationId is treated as an
 * error, not success, so the UI can never render a fake confirmation.
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
      kind: "confirmed",
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

export function isServerConfirmed(
  result: DonateResult,
): result is Extract<DonateResult, { kind: "confirmed" }> {
  return result.kind === "confirmed";
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
