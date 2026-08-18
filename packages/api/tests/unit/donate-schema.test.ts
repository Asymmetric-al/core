import { describe, expect, it } from "vitest";

import { donatePostSchema } from "../../src/schemas/donate";

describe("donatePostSchema", () => {
  const validPayload = {
    amount: 25,
    currency: "usd",
  };

  it("accepts a valid payload without cover_fees or payment_method", () => {
    const result = donatePostSchema.safeParse(validPayload);

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.cover_fees).toBe(false);
    expect(result.data.payment_method).toBe("card");
  });

  it("parses cover_fees and payment_method when present", () => {
    const result = donatePostSchema.safeParse({
      ...validPayload,
      cover_fees: true,
      payment_method: "ach",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.cover_fees).toBe(true);
    expect(result.data.payment_method).toBe("ach");
  });

  it("accepts wallet as a payment_method", () => {
    const result = donatePostSchema.safeParse({
      ...validPayload,
      payment_method: "wallet",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.payment_method).toBe("wallet");
  });

  it("strips unknown extra keys", () => {
    const result = donatePostSchema.safeParse({
      ...validPayload,
      extra: "nope",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error("Expected donate payload extra keys to be stripped");
    }

    expect(result.data).toEqual({
      amount: 25,
      currency: "usd",
      cover_fees: false,
      payment_method: "card",
    });
  });

  it("rejects an invalid payment_method", () => {
    const result = donatePostSchema.safeParse({
      ...validPayload,
      payment_method: "crypto",
    });

    expect(result.success).toBe(false);
  });
});
