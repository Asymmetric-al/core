import { describe, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- This app-scoped unit test covers the donor checkout helper before it is promoted to a package.
import {
  buildCheckoutRequestFingerprint,
  buildDonateRequestBody,
  interpretDonateResponse,
  isDonationInitialized,
  isStripeFinalCheckoutSuccess,
  normalizeCheckoutFrequency,
  resolveCheckoutIdempotencyKey,
  resolveCheckoutMode,
} from "../../../../apps/donor/app/(public)/checkout/checkout-donation";

describe("buildDonateRequestBody", () => {
  it("maps missionaryId/fundId to the snake_case saga contract", () => {
    expect(
      buildDonateRequestBody({
        amount: 100,
        currency: "usd",
        missionaryId: "m_1",
        fundId: "f_1",
      }),
    ).toEqual({
      amount: 100,
      currency: "usd",
      missionary_id: "m_1",
      fund_id: "f_1",
    });
  });

  it("defaults currency to usd and omits blank/null designations", () => {
    expect(
      buildDonateRequestBody({
        amount: 50,
        missionaryId: "  ",
        fundId: null,
      }),
    ).toEqual({ amount: 50, currency: "usd" });
  });

  it("trims designation identifiers", () => {
    expect(
      buildDonateRequestBody({ amount: 25, missionaryId: " m_2 " }),
    ).toEqual({ amount: 25, currency: "usd", missionary_id: "m_2" });
  });

  it("rejects a non-positive amount (server requires > 0)", () => {
    expect(() => buildDonateRequestBody({ amount: 0, fundId: "f_1" })).toThrow(
      /amount/i,
    );
  });
});

describe("interpretDonateResponse — 200 initializes, but does not confirm payment", () => {
  it("treats a 200 with a server donationId as initialized", () => {
    const result = interpretDonateResponse(200, {
      donationId: "don_1",
      paymentIntentId: "pi_1",
      clientSecret: "cs_1",
    });
    expect(result).toEqual({
      kind: "initialized",
      donation: {
        donationId: "don_1",
        paymentIntentId: "pi_1",
        clientSecret: "cs_1",
      },
    });
    expect(isDonationInitialized(result)).toBe(true);
  });

  it("does NOT initialize a 200 that lacks a server donationId", () => {
    const result = interpretDonateResponse(200, { paymentIntentId: "pi_1" });
    expect(result.kind).toBe("error");
    expect(isDonationInitialized(result)).toBe(false);
  });

  it("does NOT initialize an empty/whitespace donationId", () => {
    const result = interpretDonateResponse(200, { donationId: "   " });
    expect(result.kind).toBe("error");
    expect(isDonationInitialized(result)).toBe(false);
  });

  it("maps a 202 saga-in-flight to processing, never success", () => {
    const result = interpretDonateResponse(202, {
      status: "processing",
      donationId: "don_2",
    });
    expect(result).toEqual({ kind: "processing", donationId: "don_2" });
    expect(isDonationInitialized(result)).toBe(false);
  });

  it("surfaces the server error message on 4xx/5xx", () => {
    const result = interpretDonateResponse(404, {
      error: "Missionary or fund not found",
    });
    expect(result).toEqual({
      kind: "error",
      message: "Missionary or fund not found",
    });
    expect(isDonationInitialized(result)).toBe(false);
  });

  it("falls back to a generic message when the error body is unusable", () => {
    const result = interpretDonateResponse(500, null);
    expect(result.kind).toBe("error");
    expect((result as { message: string }).message.length).toBeGreaterThan(0);
  });
});

describe("Stripe confirmation success helper", () => {
  it("accepts only completed PaymentIntent statuses", () => {
    expect(isStripeFinalCheckoutSuccess("succeeded")).toBe(true);
    expect(isStripeFinalCheckoutSuccess("processing")).toBe(false);
    expect(isStripeFinalCheckoutSuccess("requires_action")).toBe(false);
    expect(isStripeFinalCheckoutSuccess("requires_payment_method")).toBe(false);
    expect(isStripeFinalCheckoutSuccess(null)).toBe(false);
  });
});

describe("one-time checkout frequency normalization", () => {
  it("defaults to one-time and coerces monthly inputs to one-time", () => {
    expect(normalizeCheckoutFrequency(undefined)).toBe("one-time");
    expect(normalizeCheckoutFrequency(null)).toBe("one-time");
    expect(normalizeCheckoutFrequency("monthly")).toBe("one-time");
    expect(normalizeCheckoutFrequency("one_time")).toBe("one-time");
    expect(normalizeCheckoutFrequency("one-time")).toBe("one-time");
  });
});

describe("checkout request fingerprint", () => {
  const baseFingerprintInput = {
    amount: 102.346,
    coverFees: true,
    currency: "USD",
    donorEmail: " Donor@Example.COM ",
    donorFirstName: " Ada ",
    donorLastName: " Lovelace ",
    endDate: "2026-08-01",
    frequency: "one-time" as const,
    fundId: " fund_1 ",
    missionaryId: " miss_1 ",
    paymentMethod: "card" as const,
    postalCode: " 94103 ",
    startDate: "2026-07-06",
  };

  it("is deterministic and covers immutable checkout attempt fields", () => {
    expect(buildCheckoutRequestFingerprint(baseFingerprintInput)).toBe(
      JSON.stringify({
        amount: 102.35,
        coverFees: true,
        currency: "usd",
        donorEmail: "donor@example.com",
        donorFirstName: "Ada",
        donorLastName: "Lovelace",
        endDate: "2026-08-01",
        frequency: "one-time",
        fundId: "fund_1",
        missionaryId: "miss_1",
        paymentMethod: "card",
        postalCode: "94103",
        startDate: "2026-07-06",
      }),
    );
  });

  it("changes when amount, designation, donor, fee, schedule, frequency, method, or postal code changes", () => {
    const base = buildCheckoutRequestFingerprint(baseFingerprintInput);
    const variants = [
      { amount: 103 },
      { fundId: "fund_2" },
      { missionaryId: "miss_2" },
      { donorEmail: "other@example.com" },
      { donorFirstName: "Grace" },
      { donorLastName: "Hopper" },
      { coverFees: false },
      { startDate: "2026-07-07" },
      { endDate: "2026-09-01" },
      { frequency: "monthly" as const },
      { paymentMethod: "wallet" as const },
      { postalCode: "94104" },
    ];

    for (const patch of variants) {
      expect(
        buildCheckoutRequestFingerprint({
          ...baseFingerprintInput,
          ...patch,
        }),
      ).not.toBe(base);
    }
  });
});

describe("resolveCheckoutIdempotencyKey", () => {
  it("reuses the existing key for an exact fingerprint retry", () => {
    expect(
      resolveCheckoutIdempotencyKey({
        currentFingerprint: "same",
        existingFingerprint: "same",
        existingKey: "idem_1",
        generateKey: () => "idem_2",
      }),
    ).toEqual({ idempotencyKey: "idem_1", isNewKey: false });
  });

  it("rotates the key when the fingerprint changes", () => {
    expect(
      resolveCheckoutIdempotencyKey({
        currentFingerprint: "changed",
        existingFingerprint: "same",
        existingKey: "idem_1",
        generateKey: () => "idem_2",
      }),
    ).toEqual({ idempotencyKey: "idem_2", isNewKey: true });
  });
});

describe("resolveCheckoutMode — Stripe leg is Tier-3 / creds-gated", () => {
  it("is live only when a publishable key is present", () => {
    expect(resolveCheckoutMode("pk_test_123")).toBe("live");
  });

  it("falls back to test-mode when no publishable key is configured", () => {
    expect(resolveCheckoutMode(undefined)).toBe("test");
    expect(resolveCheckoutMode("")).toBe("test");
    expect(resolveCheckoutMode("   ")).toBe("test");
  });
});
