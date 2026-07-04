import { describe, expect, it } from "vitest";

import {
  buildDonateRequestBody,
  interpretDonateResponse,
  isServerConfirmed,
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

describe("interpretDonateResponse — success is ONLY server-confirmed donation state", () => {
  it("treats a 200 with a server donationId as confirmed", () => {
    const result = interpretDonateResponse(200, {
      donationId: "don_1",
      paymentIntentId: "pi_1",
      clientSecret: "cs_1",
    });
    expect(result).toEqual({
      kind: "confirmed",
      donation: {
        donationId: "don_1",
        paymentIntentId: "pi_1",
        clientSecret: "cs_1",
      },
    });
    expect(isServerConfirmed(result)).toBe(true);
  });

  it("does NOT confirm a 200 that lacks a server donationId (no fake success)", () => {
    const result = interpretDonateResponse(200, { paymentIntentId: "pi_1" });
    expect(result.kind).toBe("error");
    expect(isServerConfirmed(result)).toBe(false);
  });

  it("does NOT confirm an empty/whitespace donationId", () => {
    const result = interpretDonateResponse(200, { donationId: "   " });
    expect(result.kind).toBe("error");
    expect(isServerConfirmed(result)).toBe(false);
  });

  it("maps a 202 saga-in-flight to processing, never success", () => {
    const result = interpretDonateResponse(202, {
      status: "processing",
      donationId: "don_2",
    });
    expect(result).toEqual({ kind: "processing", donationId: "don_2" });
    expect(isServerConfirmed(result)).toBe(false);
  });

  it("surfaces the server error message on 4xx/5xx", () => {
    const result = interpretDonateResponse(404, {
      error: "Missionary or fund not found",
    });
    expect(result).toEqual({
      kind: "error",
      message: "Missionary or fund not found",
    });
    expect(isServerConfirmed(result)).toBe(false);
  });

  it("falls back to a generic message when the error body is unusable", () => {
    const result = interpretDonateResponse(500, null);
    expect(result.kind).toBe("error");
    expect((result as { message: string }).message.length).toBeGreaterThan(0);
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
