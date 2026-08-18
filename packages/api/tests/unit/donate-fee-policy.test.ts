import { describe, expect, it } from "vitest";

import {
  GiftProcessingFeePolicyError,
  quoteGiftProcessingFee,
  resolveGiftIntakeCharge,
  toGiftProcessingFeeStripeMetadata,
  type GiftPaymentMethod,
} from "../../src/donate/fee-policy";

/**
 * Gift processing-fee policy — integer-cents quotes for Guest Giving.
 *
 * Card/wallet estimates use Stripe's published US card-not-present rate
 * (2.9% + 30¢). ACH uses US bank debit 0.8% capped at $5. These are
 * estimates, not Stripe's eventual settlement fee.
 */

describe("quoteGiftProcessingFee — card", () => {
  it("grosses up a $100 gift so the estimated Stripe cut is covered", () => {
    const quote = quoteGiftProcessingFee({
      giftAmountCents: 10000,
      coverFees: true,
      paymentMethod: "card",
    });

    expect(quote.giftAmountCents).toBe(10000);
    expect(quote.chargedAmountCents).toBe(10330);
    expect(quote.coverAmountCents).toBe(330);
    expect(quote.estimatedStripeFeeCents).toBe(330);
    expect(quote.coverFees).toBe(true);
    expect(quote.paymentMethod).toBe("card");
  });

  it("grosses up a $10 gift with the same percent-plus-fixed schedule", () => {
    const quote = quoteGiftProcessingFee({
      giftAmountCents: 1000,
      coverFees: true,
      paymentMethod: "card",
    });

    expect(quote.chargedAmountCents).toBe(1061);
    expect(quote.coverAmountCents).toBe(61);
    expect(quote.estimatedStripeFeeCents).toBe(61);
  });

  it("still reports the cover extra when the donor is not covering", () => {
    const quote = quoteGiftProcessingFee({
      giftAmountCents: 10000,
      coverFees: false,
      paymentMethod: "card",
    });

    expect(quote.chargedAmountCents).toBe(10000);
    expect(quote.coverAmountCents).toBe(330);
    expect(quote.estimatedStripeFeeCents).toBe(320);
    expect(quote.coverFees).toBe(false);
  });
});

describe("quoteGiftProcessingFee — wallet", () => {
  it("uses the same estimate as card", () => {
    const card = quoteGiftProcessingFee({
      giftAmountCents: 10000,
      coverFees: true,
      paymentMethod: "card",
    });
    const wallet = quoteGiftProcessingFee({
      giftAmountCents: 10000,
      coverFees: true,
      paymentMethod: "wallet",
    });

    expect(wallet.chargedAmountCents).toBe(card.chargedAmountCents);
    expect(wallet.coverAmountCents).toBe(card.coverAmountCents);
    expect(wallet.estimatedStripeFeeCents).toBe(card.estimatedStripeFeeCents);
    expect(wallet.paymentMethod).toBe("wallet");
  });
});

describe("quoteGiftProcessingFee — ACH", () => {
  it("grosses up a $100 gift under the 0.8% uncapped schedule", () => {
    const quote = quoteGiftProcessingFee({
      giftAmountCents: 10000,
      coverFees: true,
      paymentMethod: "ach",
    });

    expect(quote.chargedAmountCents).toBe(10081);
    expect(quote.coverAmountCents).toBe(81);
    expect(quote.estimatedStripeFeeCents).toBe(81);
  });

  it("still reports the cover extra when the donor is not covering ACH", () => {
    const quote = quoteGiftProcessingFee({
      giftAmountCents: 10000,
      coverFees: false,
      paymentMethod: "ach",
    });

    expect(quote.chargedAmountCents).toBe(10000);
    expect(quote.coverAmountCents).toBe(81);
    expect(quote.estimatedStripeFeeCents).toBe(80);
  });

  it("binds the $5 cap at a $620 gift", () => {
    const quote = quoteGiftProcessingFee({
      giftAmountCents: 62000,
      coverFees: true,
      paymentMethod: "ach",
    });

    expect(quote.chargedAmountCents).toBe(62500);
    expect(quote.coverAmountCents).toBe(500);
    expect(quote.estimatedStripeFeeCents).toBe(500);
  });

  it("adds the $5 cap instead of uncapped gross-up at a $621 gift", () => {
    const quote = quoteGiftProcessingFee({
      giftAmountCents: 62100,
      coverFees: true,
      paymentMethod: "ach",
    });

    expect(quote.chargedAmountCents).toBe(62600);
    expect(quote.coverAmountCents).toBe(500);
    expect(quote.estimatedStripeFeeCents).toBe(500);
  });
});

describe("quoteGiftProcessingFee — invalid input", () => {
  it("rejects a non-positive gift amount", () => {
    expect(() =>
      quoteGiftProcessingFee({
        giftAmountCents: 0,
        coverFees: true,
        paymentMethod: "card",
      }),
    ).toThrow(GiftProcessingFeePolicyError);
  });

  it("rejects a non-integer gift amount", () => {
    expect(() =>
      quoteGiftProcessingFee({
        giftAmountCents: 1000.5,
        coverFees: true,
        paymentMethod: "card",
      }),
    ).toThrow(GiftProcessingFeePolicyError);
  });

  it("rejects an unknown payment method at runtime", () => {
    expect(() =>
      quoteGiftProcessingFee({
        giftAmountCents: 10000,
        coverFees: true,
        paymentMethod: "paypal" as GiftPaymentMethod,
      }),
    ).toThrow(GiftProcessingFeePolicyError);
  });
});

describe("resolveGiftIntakeCharge", () => {
  it("quotes from a dollar gift amount in integer cents", () => {
    const quote = resolveGiftIntakeCharge({
      amount: 100,
      coverFees: true,
      paymentMethod: "card",
    });

    expect(quote.giftAmountCents).toBe(10000);
    expect(quote.chargedAmountCents).toBe(10330);
  });

  it("rejects a dollar amount that rounds below 1 cent", () => {
    expect(() =>
      resolveGiftIntakeCharge({
        amount: 0.004,
        coverFees: false,
        paymentMethod: "card",
      }),
    ).toThrow(GiftProcessingFeePolicyError);
  });
});

describe("toGiftProcessingFeeStripeMetadata", () => {
  it("records applied cover extra as 0 when the donor is not covering", () => {
    const quote = quoteGiftProcessingFee({
      giftAmountCents: 10000,
      coverFees: false,
      paymentMethod: "card",
    });

    expect(toGiftProcessingFeeStripeMetadata(quote)).toEqual({
      gift_amount_cents: "10000",
      cover_fees: "false",
      payment_method: "card",
      cover_amount_cents: "0",
      estimated_fee_cents: "320",
    });
  });

  it("records applied cover extra when the donor is covering", () => {
    const quote = quoteGiftProcessingFee({
      giftAmountCents: 10000,
      coverFees: true,
      paymentMethod: "ach",
    });

    expect(toGiftProcessingFeeStripeMetadata(quote)).toEqual({
      gift_amount_cents: "10000",
      cover_fees: "true",
      payment_method: "ach",
      cover_amount_cents: "81",
      estimated_fee_cents: "81",
    });
  });
});
