import { describe, expect, it } from "vitest";

import {
  commitPaymentAttemptState,
  commitSuccessfulOriginalPaymentAttempt,
  exitStalePaymentAttempt,
} from "../../../../apps/donor/app/(public)/(solid)/checkout/checkout-payment-attempt";

import type {
  PaymentAttempt,
  PaymentAttemptState,
} from "../../../../apps/donor/app/(public)/(solid)/checkout/checkout-payment-attempt";

const originalAttempt: PaymentAttempt = {
  id: 1,
  fingerprint: "same-request",
  successSnapshot: { amount: 100 },
};

type RenderedPayment = PaymentAttemptState & { paymentAttemptId: number };

const paymentState = (
  paymentAttemptId = originalAttempt.id,
): RenderedPayment => ({
  paymentAttemptId,
  idempotencyFingerprint: originalAttempt.fingerprint,
  isProcessing: true,
  step: "payment",
  donation: null,
  error: null,
  successSnapshot: null,
});

function deferredRender() {
  const current = paymentState();
  const pending: Array<(state: RenderedPayment) => RenderedPayment> = [];
  const refs = {
    activePaymentAttemptRef: {
      current: originalAttempt as PaymentAttempt | null,
    },
    checkoutStateRef: { current },
    currentRequestFingerprintRef: { current: originalAttempt.fingerprint },
    setCheckoutState: (
      updater: (state: RenderedPayment) => RenderedPayment,
    ) => {
      pending.push(updater);
    },
  };
  return { current, pending, refs };
}

describe("deferred payment transitions", () => {
  it("keeps the original owner until React renders the captured receipt", () => {
    const { current, pending, refs } = deferredRender();

    expect(
      commitSuccessfulOriginalPaymentAttempt(
        originalAttempt,
        { id: "captured-donation" },
        refs,
      ),
    ).toBe(true);

    expect(refs.activePaymentAttemptRef.current).toBe(originalAttempt);
    expect(refs.checkoutStateRef.current).toBe(current);
    const latestSameAttempt = { ...current };
    expect(pending[0]!(latestSameAttempt)).toMatchObject({
      donation: { id: "captured-donation" },
      isProcessing: false,
      step: "success",
      successSnapshot: originalAttempt.successSnapshot,
    });
  });

  it("keeps a stale attempt owned until its visible processing state unlocks", () => {
    const { current, pending, refs } = deferredRender();

    expect(exitStalePaymentAttempt(originalAttempt, refs)).toBe(true);

    expect(refs.activePaymentAttemptRef.current).toBe(originalAttempt);
    expect(refs.checkoutStateRef.current).toBe(current);
    expect(pending[0]!({ ...current })).toMatchObject({
      isProcessing: false,
      step: "payment",
      error: expect.stringMatching(/details changed/i),
    });
  });

  it.each(["error", "success", "stale"])(
    "rejects a queued older %s result when a new attempt owns the same request",
    (kind) => {
      const { pending, refs } = deferredRender();
      if (kind === "success") {
        commitSuccessfulOriginalPaymentAttempt(
          originalAttempt,
          { id: "older-donation" },
          refs,
        );
      } else if (kind === "stale") {
        exitStalePaymentAttempt(originalAttempt, refs);
      } else {
        commitPaymentAttemptState(
          originalAttempt,
          (state) => ({ ...state, error: "older error", isProcessing: false }),
          refs,
        );
      }
      const newerAttempt = { ...originalAttempt, id: 2 };
      refs.activePaymentAttemptRef.current = newerAttempt;
      const newerState = paymentState(newerAttempt.id);

      expect(pending[0]!(newerState)).toBe(newerState);
      expect(refs.activePaymentAttemptRef.current).toBe(newerAttempt);
    },
  );
});
