/**
 * Gift processing-fee policy for Guest Giving.
 *
 * Quotes the estimated Stripe processing cost in integer cents so checkout UI
 * and Gift intake share one Core module. Checkout stays a thin adapter: it
 * never owns rates, rounding, or gross-up.
 *
 * These figures are estimates of Stripe's published US rates, not the fee
 * Stripe eventually settles. Card and wallet use 2.9% + 30¢ (card-not-present).
 * ACH uses 0.8% capped at $5. International card rates are not estimated here.
 *
 * Tenant processor-cost attribution (ADR-0060) is a different concern. This
 * module is the donor cover-fees opt-in that grosses up the charged Gift.
 */

export type GiftPaymentMethod = "card" | "ach" | "wallet";

export class GiftProcessingFeePolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GiftProcessingFeePolicyError";
  }
}

export type GiftProcessingFeeQuote = {
  giftAmountCents: number;
  /** Extra the donor would add if covering, even when coverFees is false. */
  coverAmountCents: number;
  chargedAmountCents: number;
  estimatedStripeFeeCents: number;
  coverFees: boolean;
  paymentMethod: GiftPaymentMethod;
};

export type GiftProcessingFeeStripeMetadata = {
  gift_amount_cents: string;
  cover_fees: string;
  payment_method: GiftPaymentMethod;
  cover_amount_cents: string;
  estimated_fee_cents: string;
};

const USD_CURRENCY = "usd";

type PercentPlusFixedSchedule = {
  kind: "percent_plus_fixed";
  percent: number;
  fixedCents: number;
};

type PercentCappedSchedule = {
  kind: "percent_capped";
  percent: number;
  capCents: number;
};

type FeeSchedule = PercentPlusFixedSchedule | PercentCappedSchedule;

const CARD_WALLET_SCHEDULE: PercentPlusFixedSchedule = {
  kind: "percent_plus_fixed",
  percent: 0.029,
  fixedCents: 30,
};

const ACH_SCHEDULE: PercentCappedSchedule = {
  kind: "percent_capped",
  percent: 0.008,
  capCents: 500,
};

function scheduleForPaymentMethod(
  paymentMethod: GiftPaymentMethod,
): FeeSchedule {
  switch (paymentMethod) {
    case "card":
    case "wallet":
      return CARD_WALLET_SCHEDULE;
    case "ach":
      return ACH_SCHEDULE;
    default: {
      const exhaustive: never = paymentMethod;
      throw new GiftProcessingFeePolicyError(
        `Unknown gift payment method: ${String(exhaustive)}`,
      );
    }
  }
}

function assertPositiveIntegerCents(value: number): void {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new GiftProcessingFeePolicyError(
      "Gift amount must be a positive integer in cents.",
    );
  }
}

function assertSafeIntegerCents(value: number, message: string): void {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new GiftProcessingFeePolicyError(message);
  }
}

function normalizeGiftCurrency(currency: string | undefined): string {
  if (currency == null || currency.trim().length === 0) {
    return USD_CURRENCY;
  }
  return currency.trim().toLowerCase();
}

export function assertUsdGiftCurrency(currency: string | undefined): void {
  if (normalizeGiftCurrency(currency) !== USD_CURRENCY) {
    throw new GiftProcessingFeePolicyError(
      "Gift processing-fee policy currently supports USD only.",
    );
  }
}

function grossUpChargedCents(giftCents: number, schedule: FeeSchedule): number {
  switch (schedule.kind) {
    case "percent_plus_fixed":
      return Math.round(
        (giftCents + schedule.fixedCents) / (1 - schedule.percent),
      );
    case "percent_capped": {
      const uncappedCharged = Math.round(giftCents / (1 - schedule.percent));
      const uncappedFee = Math.round(uncappedCharged * schedule.percent);
      if (uncappedFee <= schedule.capCents) {
        return uncappedCharged;
      }
      return giftCents + schedule.capCents;
    }
    default: {
      const exhaustive: never = schedule;
      throw new GiftProcessingFeePolicyError(
        `Unknown fee schedule: ${String(exhaustive)}`,
      );
    }
  }
}

function estimateStripeFeeCents(
  chargedCents: number,
  schedule: FeeSchedule,
): number {
  switch (schedule.kind) {
    case "percent_plus_fixed":
      return Math.round(chargedCents * schedule.percent) + schedule.fixedCents;
    case "percent_capped":
      return Math.min(
        Math.round(chargedCents * schedule.percent),
        schedule.capCents,
      );
    default: {
      const exhaustive: never = schedule;
      throw new GiftProcessingFeePolicyError(
        `Unknown fee schedule: ${String(exhaustive)}`,
      );
    }
  }
}

export function quoteGiftProcessingFee(input: {
  giftAmountCents: number;
  coverFees: boolean;
  paymentMethod: GiftPaymentMethod;
}): GiftProcessingFeeQuote {
  assertPositiveIntegerCents(input.giftAmountCents);
  const schedule = scheduleForPaymentMethod(input.paymentMethod);
  const coveredChargedCents = grossUpChargedCents(
    input.giftAmountCents,
    schedule,
  );
  assertSafeIntegerCents(
    coveredChargedCents,
    "Covered gift charge overflowed a safe integer.",
  );
  const coverAmountCents = coveredChargedCents - input.giftAmountCents;
  const chargedAmountCents = input.coverFees
    ? coveredChargedCents
    : input.giftAmountCents;

  return {
    giftAmountCents: input.giftAmountCents,
    coverAmountCents,
    chargedAmountCents,
    estimatedStripeFeeCents: estimateStripeFeeCents(
      chargedAmountCents,
      schedule,
    ),
    coverFees: input.coverFees,
    paymentMethod: input.paymentMethod,
  };
}

export function resolveGiftIntakeCharge(input: {
  amount: number;
  coverFees: boolean;
  paymentMethod: GiftPaymentMethod;
  currency?: string;
}): GiftProcessingFeeQuote {
  if (!Number.isFinite(input.amount)) {
    throw new GiftProcessingFeePolicyError(
      "Gift amount must be a finite number.",
    );
  }
  assertUsdGiftCurrency(input.currency);

  return quoteGiftProcessingFee({
    giftAmountCents: Math.round(input.amount * 100),
    coverFees: input.coverFees,
    paymentMethod: input.paymentMethod,
  });
}

export function toGiftProcessingFeeStripeMetadata(
  quote: GiftProcessingFeeQuote,
): GiftProcessingFeeStripeMetadata {
  const appliedCoverCents = quote.coverFees ? quote.coverAmountCents : 0;

  return {
    gift_amount_cents: String(quote.giftAmountCents),
    cover_fees: quote.coverFees ? "true" : "false",
    payment_method: quote.paymentMethod,
    cover_amount_cents: String(appliedCoverCents),
    estimated_fee_cents: String(quote.estimatedStripeFeeCents),
  };
}
