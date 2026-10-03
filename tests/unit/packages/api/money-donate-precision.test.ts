import { describe, expect, it } from "vitest";

import { resolveGiftIntakeCharge } from "@asym/api/donate/fee-policy";

describe("donate amount conversion preserves exact minor units", () => {
  it.each([0.29, 12.34])("preserves exact USD input %s", (amount) => {
    const quote = resolveGiftIntakeCharge({
      amount,
      coverFees: false,
      paymentMethod: "card",
      currency: "usd",
    });
    expect(quote.giftAmountCents).toBe(amount === 0.29 ? 29 : 1234);
    expect(quote.chargedAmountCents).toBe(amount === 0.29 ? 29 : 1234);
  });

  it.each([1.001, 0.299])(
    "rejects USD precision loss for %s before charging",
    (amount) => {
      expect(() =>
        resolveGiftIntakeCharge({
          amount,
          coverFees: false,
          paymentMethod: "card",
          currency: "usd",
        }),
      ).toThrow();
    },
  );

  it("keeps the existing USD processing-fee qualification boundary", () => {
    expect(() =>
      resolveGiftIntakeCharge({
        amount: 12.34,
        coverFees: true,
        paymentMethod: "card",
        currency: "eur",
      }),
    ).toThrow();
  });
});
